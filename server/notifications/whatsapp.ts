import twilio from "twilio";
import { prisma } from "@/lib/prisma";

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!,
);

export async function notifyNewOrder(orderId: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: { include: { pack: true } },
      },
    });

    if (!order) return;

    const pack = order.items[0]?.pack;
    const formattedId = `#${String(order.orderNumber).padStart(4, "0")}`;
    await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_FROM!,
      contentSid: process.env.TWILIO_TEMPLATE_SID!,
      contentVariables: JSON.stringify({
        "1": formattedId,
        "2": order.customerName ?? "-",
        "3": order.customerPhone ?? "-",
        "4": order.customerEmail ?? "-",
        "5": pack?.title ?? "-",
      }),
      to: process.env.TWILIO_WHATSAPP_TO!,
    });
  } catch (err) {
    console.error("[whatsapp] Error enviando notificación:", err);
  }
}
