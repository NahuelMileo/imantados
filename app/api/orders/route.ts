import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);

  const productId = body?.productId;
  const quantity = body?.quantity ?? 1;

  if (!productId || typeof productId !== "string") {
    return NextResponse.json({ error: "productId required" }, { status: 400 });
  }
  if (!Number.isInteger(quantity) || quantity <= 0 || quantity > 100) {
    return NextResponse.json(
      { error: "quantity must be 1..100" },
      { status: 400 },
    );
  }

  const product = await prisma.pack.findUnique({
    where: { id: productId },
    select: { id: true, title: true, priceUYU: true, isActive: true },
  });

  if (!product || !product.isActive) {
    return NextResponse.json(
      { error: "Product not available" },
      { status: 400 },
    );
  }

  const order = await prisma.$transaction(async (tx) => {
    return tx.order.create({
      data: {
        status: "DRAFT",
        currency: "UYU",
        totalAmount: 0,
        customerEmail: null, // 👈 se completa en paso 3
        items: {
          create: {
            productId: product.id,
            quantity,
            unitPrice: product.priceUYU,
          },
        },
      },
      include: { items: { include: { pack: true } } },
    });
  });

  return NextResponse.json(order, { status: 201 });
}