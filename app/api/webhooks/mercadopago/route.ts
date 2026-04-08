import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { commitOrderUploads } from "@/server/orders/commitUploads";
import { notifyNewOrder } from "@/server/notifications/whatsapp";
import { notifyNewOrderEmail } from "@/server/notifications/email";

export const runtime = "nodejs";

const mp = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
});

export async function POST(req: Request) {
  const { searchParams } = new URL(req.url);
  const body = await req.json().catch(() => null);

  const type = searchParams.get("type") || body?.type;
  const topic = searchParams.get("topic") || body?.topic;
  const dataId =
    searchParams.get("data.id") ||
    searchParams.get("id") ||
    body?.data?.id ||
    body?.id;

  if (!dataId) return NextResponse.json({ ok: true });

  if (topic && topic !== "payment") return NextResponse.json({ ok: true });
  if (type && type !== "payment") return NextResponse.json({ ok: true });

  try {
    const paymentApi = new Payment(mp);
    const payment = await paymentApi.get({ id: dataId });

    const mpStatus = payment.status;
    const orderId = payment.external_reference;
    const paymentId = String(payment.id);

    if (!orderId) return NextResponse.json({ ok: true });

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { id: true, status: true, mpPaymentId: true },
    });

    if (!order) return NextResponse.json({ ok: true });

    // ── APPROVED ──────────────────────────────────────────────
    if (mpStatus === "approved") {
      let justPaid = false;

      await prisma.$transaction(async (tx) => {
        const current = await tx.order.findUnique({
          where: { id: orderId },
          select: { status: true, mpPaymentId: true },
        });

        if (!current) return;

        if (current.status !== "PAID") {
          await tx.order.update({
            where: { id: orderId },
            data: {
              status: "PAID",
              mpPaymentId: paymentId,
              paidAt: new Date(),
            },
          });
          justPaid = true;
        } else if (!current.mpPaymentId) {
          await tx.order.update({
            where: { id: orderId },
            data: { mpPaymentId: paymentId, paidAt: new Date() },
          });
        }
      });

      // ✅ Solo commitear si recién se pagó, evita trabajo innecesario en webhooks duplicados
      if (justPaid) {
        await commitOrderUploads(orderId).catch((err) =>
          console.error(`[webhook] commitOrderUploads failed for ${orderId}:`, err)
        );

        // ✅ Cada notificación con su propio catch para no bloquear las demás
        await notifyNewOrderEmail(orderId).catch((err) =>
          console.error(`[webhook] notifyNewOrderEmail failed for ${orderId}:`, err)
        );
      }

      return NextResponse.json({ ok: true });
    }

    // ── REJECTED / CANCELLED ──────────────────────────────────
    if (mpStatus === "rejected" || mpStatus === "cancelled") {
      await prisma.$transaction(async (tx) => {
        const current = await tx.order.findUnique({
          where: { id: orderId },
          select: { status: true, mpPaymentId: true },
        });

        if (!current) return;
        if (current.status === "PAID") return;
        if (current.status !== "CANCELLED") {
          await tx.order.update({
            where: { id: orderId },
            data: {
              status: "CANCELLED",
              mpPaymentId: current.mpPaymentId ?? paymentId,
            },
          });
        }
      });

      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    // ✅ Loggear el error y retornar 500 para que MP reintente el webhook
    console.error("[webhook] unexpected error:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}