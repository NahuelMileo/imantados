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

  // ✅ Verificar estado de la orden antes de tocar uploads
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { status: true },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (!(order.status === "DRAFT" || order.status === "PENDING_PAYMENT")) {
    return NextResponse.json({ error: "Invalid order state" }, { status: 409 });
  }

  try {
    await prisma.$transaction(async (tx) => {
      const upload = await tx.orderUpload.findUnique({
        where: { orderId_tmpKey: { orderId, tmpKey } },
        select: { quantity: true },
      });

      // ✅ Lanzar error en lugar de retornar silenciosamente
      if (!upload) throw new Error("upload_not_found");

      if (upload.quantity <= 1) {
        await tx.orderUpload.delete({
          where: { orderId_tmpKey: { orderId, tmpKey } },
        });
      } else {
        await tx.orderUpload.update({
          where: { orderId_tmpKey: { orderId, tmpKey } },
          data: { quantity: { decrement: 1 } },
        });
      }
    });
  } catch (err: any) {
    if (err.message === "upload_not_found") {
      return NextResponse.json({ error: "Upload not found" }, { status: 404 });
    }
    throw err;
  }

  return NextResponse.json({ ok: true });
}