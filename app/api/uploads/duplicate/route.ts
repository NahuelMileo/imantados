import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const orderId = body?.orderId as string | undefined;
  const tmpKey = body?.tmpKey as string | undefined;

  if (!orderId || !tmpKey) {
    return NextResponse.json(
      { error: "orderId y tmpKey requeridos" },
      { status: 400 }
    );
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: { include: { pack: true } },
    },
  });

  if (!order)
    return NextResponse.json({ error: "Order not found" }, { status: 404 });

  if (!(order.status === "DRAFT" || order.status === "PENDING_PAYMENT")) {
    return NextResponse.json({ error: "Invalid order state" }, { status: 409 });
  }

  const max = (order.items[0]?.pack as any)?.maxImages as number | undefined;
  if (!max)
    return NextResponse.json({ error: "maxImages missing" }, { status: 500 });

  // ✅ Verificar que el upload existe antes de entrar a la transacción
  const upload = await prisma.orderUpload.findUnique({
    where: { orderId_tmpKey: { orderId, tmpKey } },
    select: { id: true },
  });

  if (!upload) {
    return NextResponse.json({ error: "Upload not found" }, { status: 404 });
  }

  // ✅ Capturar errores de la transacción para retornar respuestas apropiadas
  try {
    await prisma.$transaction(async (tx) => {
      const agg = await tx.orderUpload.aggregate({
        where: { orderId },
        _sum: { quantity: true },
      });

      const currentCount = agg._sum.quantity ?? 0;
      if (currentCount >= max) throw new Error("too_many_images");

      await tx.orderUpload.update({
        where: { orderId_tmpKey: { orderId, tmpKey } },
        data: { quantity: { increment: 1 } },
      });
    });
  } catch (err: any) {
    if (err.message === "too_many_images") {
      return NextResponse.json(
        { error: "Límite de imágenes alcanzado" },
        { status: 409 }
      );
    }
    throw err;
  }

  return NextResponse.json({ ok: true });
}