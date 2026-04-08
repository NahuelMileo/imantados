// src/lib/commit-order-uploads.ts
import { prisma } from "@/lib/prisma";
import { r2Copy, r2Delete, r2Exists } from "@/lib/r2";

function buildFinalKey(orderId: string, tmpKey: string) {
  // tmp: orders/tmp/{uuid}.jpg  -> final: orders/{orderId}/{uuid}.jpg
  const filename = tmpKey.split("/").pop() ?? tmpKey;
  return `orders/${orderId}/${filename}`;
}

/**
 * Commit robusto:
 * - Rescata COMMITTING huérfanos (proceso anterior murió hace más de 5 min)
 * - Lock por fila: TMP -> COMMITTING
 * - Copy R2 (idempotente si final ya existe)
 * - DB: COMMITTING -> COMMITTED
 * - Delete tmp best-effort
 * - Acumula errores en lugar de abortar el loop
 */
export async function commitOrderUploads(orderId: string) {
  const ORPHAN_TIMEOUT_MS = 5 * 60 * 1000;
  const now = Date.now();

  // Buscar TMP y COMMITTING para poder rescatar huérfanos
  const candidates = await prisma.orderUpload.findMany({
    where: {
      orderId,
      status: { in: ["TMP", "COMMITTING"] },
    },
    select: {
      id: true,
      tmpKey: true,
      finalKey: true,
      updatedAt: true,
      status: true,
    },
  });

  if (candidates.length === 0) {
    return { committed: 0, skipped: 0 };
  }

  // 1) Rescatar COMMITTING huérfanos
  const rescuable = candidates.filter(
    (u) =>
      u.status === "COMMITTING" &&
      now - new Date(u.updatedAt).getTime() > ORPHAN_TIMEOUT_MS
  );

  if (rescuable.length > 0) {
    await prisma.orderUpload.updateMany({
      where: {
        id: { in: rescuable.map((u) => u.id) },
        status: "COMMITTING",
      },
      data: { status: "TMP" },
    });
  }

  // 2) Refrescar para obtener solo TMP (incluyendo los recién rescatados)
  const fresh = await prisma.orderUpload.findMany({
    where: { orderId, status: "TMP" },
    select: { id: true, tmpKey: true, finalKey: true },
  });

  if (fresh.length === 0) {
    return { committed: 0, skipped: candidates.length };
  }

  // 3) Lock optimista fila por fila: TMP -> COMMITTING
  const locked: Array<{ id: string; tmpKey: string; finalKey: string }> = [];

  for (const u of fresh) {
    const finalKey = u.finalKey ?? buildFinalKey(orderId, u.tmpKey);
    const res = await prisma.orderUpload.updateMany({
      where: { id: u.id, status: "TMP" },
      data: { status: "COMMITTING", finalKey },
    });
    if (res.count === 1) locked.push({ id: u.id, tmpKey: u.tmpKey, finalKey });
  }

  if (locked.length === 0) {
    // Otro proceso ya los lockeó
    return { committed: 0, skipped: candidates.length };
  }

  // 4) Procesar cada upload acumulando errores
  let committed = 0;
  const errors: Array<{ id: string; error: unknown }> = [];

  for (const u of locked) {
    try {
      // Idempotencia: si el final ya existe, saltear la copia
      const finalExists = await r2Exists(u.finalKey);
      if (!finalExists) {
        await r2Copy(u.tmpKey, u.finalKey);
      }

      // Confirmar en DB
      await prisma.orderUpload.update({
        where: { id: u.id },
        data: { status: "COMMITTED" },
      });

      committed++;

      // Best-effort delete tmp
      try {
        await r2Delete(u.tmpKey);
      } catch {
        // El cron de limpieza lo eliminará después
      }
    } catch (err) {
      // Revertir a TMP para poder reintentar
      await prisma.orderUpload
        .update({
          where: { id: u.id },
          data: { status: "TMP" },
        })
        .catch(() => null); // si el revert falla, el rescate por timeout lo recupera

      // Acumular en lugar de hacer throw inmediato
      errors.push({ id: u.id, error: err });
    }
  }

  // 5) Si hubo errores, lanzar después de haber procesado todos
  if (errors.length > 0) {
    const messages = errors
      .map(({ id, error }) => `[${id}]: ${String(error)}`)
      .join(", ");
    throw new Error(
      `commitOrderUploads: ${errors.length} upload(s) failed — ${messages}`
    );
  }

  return { committed, skipped: candidates.length - locked.length };
}