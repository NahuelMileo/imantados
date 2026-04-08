import { prisma } from "@/lib/prisma";
import { r2Copy, r2Delete, r2Exists } from "@/server/r2/ops";

function buildFinalKey(orderId: string, tmpKey: string) {
  const filename = tmpKey.split("/").pop() ?? tmpKey;
  return `orders/${orderId}/${filename}`;
}

export async function commitOrderUploads(orderId: string) {
  const tmp = await prisma.orderUpload.findMany({
    where: { orderId, status: "TMP" },
    select: { id: true, tmpKey: true, finalKey: true },
  });

  if (tmp.length === 0) return { committed: 0, skipped: 0 };

  const locked: Array<{ id: string; tmpKey: string; finalKey: string }> = [];

  for (const u of tmp) {
    const finalKey = u.finalKey ?? buildFinalKey(orderId, u.tmpKey);

    const res = await prisma.orderUpload.updateMany({
      where: { id: u.id, status: "TMP" },
      data: { status: "COMMITTING", finalKey },
    });

    if (res.count === 1) locked.push({ id: u.id, tmpKey: u.tmpKey, finalKey });
  }

  if (locked.length === 0) {
    // otro proceso lo está haciendo
    return { committed: 0, skipped: tmp.length };
  }

  let committed = 0;

  for (const u of locked) {
    try {
      // copy idempotente
      if (!(await r2Exists(u.finalKey))) {
        await r2Copy(u.tmpKey, u.finalKey);
      }

      await prisma.orderUpload.update({
        where: { id: u.id },
        data: { status: "COMMITTED" },
      });

      committed++;

      // best-effort delete
      try {
        await r2Delete(u.tmpKey);
      } catch {
        // cleanup lo borra luego
      }
    } catch (err) {
      // rollback del lock para reintentar
      await prisma.orderUpload.update({
        where: { id: u.id },
        data: { status: "TMP" },
      });
      throw err;
    }
  }

  return { committed, skipped: tmp.length - locked.length };
}
