// src/app/api/checkout/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { MercadoPagoConfig, Preference } from "mercadopago";

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const orderId = body?.orderId;

  if (!orderId || typeof orderId !== "string") {
    return NextResponse.json({ error: "orderId required" }, { status: 400 });
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: { pack: true },
      },
    },
  });

  if (!order)
    return NextResponse.json({ error: "Order not found" }, { status: 404 });

  if (order.status !== "DRAFT") {
    return NextResponse.json({ error: "Invalid order state" }, { status: 409 });
  }

  if (order.items.length === 0) {
    return NextResponse.json({ error: "Order has no items" }, { status: 400 });
  }

  if (!order.customerEmail) {
    return NextResponse.json(
      { error: "Customer data missing" },
      { status: 400 },
    );
  }

  // 🔥 Recalcular total desde DB (source of truth)
  const totalUYU = order.items.reduce(
    (acc, item) => acc + item.unitPrice * item.quantity,
    0,
  );

  const preference = new Preference(client);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

  const mpResp = await preference.create({
    body: {
      items: order.items.map((item) => ({
        id: item.productId,
        title: item.pack.title,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        currency_id: "UYU",
      })),
      external_reference: order.id,
      back_urls: {
        success: `${baseUrl}/checkout/success?orderId=${order.id}`,
        failure: `${baseUrl}/checkout/failure?orderId=${order.id}`,
        pending: `${baseUrl}/checkout/pending?orderId=${order.id}`,
      },
      notification_url: `${baseUrl}/api/webhooks/mercadopago`,
    },
  });

  await prisma.order.update({
    where: { id: order.id },
    data: {
      status: "PENDING_PAYMENT",
      totalAmount: totalUYU * 100,
      mpPreferenceId: mpResp.id,
    },
  });

  return NextResponse.json({
    init_point: mpResp.init_point,
  });
}
