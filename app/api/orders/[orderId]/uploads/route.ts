import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;

  const body = await req.json().catch(() => null);
  const tmpKey = body?.tmpKey;

  if (!tmpKey || typeof tmpKey !== "string") {
    return NextResponse.json({ error: "tmpKey required" }, { status: 400 });
  }

  const order = await prisma.order.findUnique({
    where: { id },
    select: { id: true, status: true },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (order.status !== "DRAFT") {
    return NextResponse.json(
      { error: "Order is not editable" },
      { status: 409 },
    );
  }

  const upload = await prisma.orderUpload.create({
    data: { orderId: id, tmpKey },
    select: { id: true, status: true, tmpKey: true, createdAt: true },
  });

  return NextResponse.json(upload, { status: 201 });
}
