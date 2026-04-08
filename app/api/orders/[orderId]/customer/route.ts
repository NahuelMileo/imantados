import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ orderId: string }> },
) {
  const { orderId } = await params; // 👈 await aquí

  const body = await req.json().catch(() => null);
  const customerEmail = body?.customerEmail;
  const customerPhone = body?.customerPhone;
  const customerName = body?.customerName;

  if (
    !customerEmail ||
    typeof customerEmail !== "string" ||
    !customerEmail.includes("@")
  ) {
    return NextResponse.json(
      { error: "customerEmail required" },
      { status: 400 },
    );
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId }, // 👈 variable directa, no params.orderId
    select: { id: true, status: true },
  });

  if (!order)
    return NextResponse.json({ error: "Order not found" }, { status: 404 });

  if (!(order.status === "DRAFT" || order.status === "PENDING_PAYMENT")) {
    return NextResponse.json({ error: "Invalid order state" }, { status: 409 });
  }

  await prisma.order.update({
    where: { id: orderId },
    data: { customerEmail, customerPhone, customerName },
  });

  return NextResponse.json({ ok: true });
}
