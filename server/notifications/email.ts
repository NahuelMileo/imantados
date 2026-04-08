import nodemailer from "nodemailer";
import { prisma } from "@/lib/prisma";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER!,
    pass: process.env.GMAIL_APP_PASSWORD!,
  },
});

export async function notifyNewOrderEmail(orderId: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: { include: { pack: true } },
        uploads: {
          where: { status: "COMMITTED" },
          select: { finalKey: true, quantity: true },
        },
      },
    });

    if (!order) return;

    const pack = order.items[0]?.pack;
    const publicBase = process.env.R2_PUBLIC_BASE_URL ?? "";

    const keyCounts = order.uploads.reduce<Record<string, number>>((acc, u) => {
      if (!u.finalKey) return acc;
      acc[u.finalKey] = (acc[u.finalKey] ?? 0) + u.quantity;
      return acc;
    }, {});

    const photosHtml = Object.entries(keyCounts)
      .map(([key, count]) => {
        const filename = key.split("/").pop();
        const label = count > 1 ? ` x${count}` : "";
        return `<a href="${publicBase}/${key}">${filename}</a>${label}`;
      })
      .join("<br/>");
    const formattedId = `#${String(order.orderNumber).padStart(4, "0")}`;
    await transporter.sendMail({
      from: `"Imantados" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER,
      subject: `🧲 Nuevo pedido ${formattedId}`,
      html: `
        <h2>✅ Nuevo pedido recibido</h2>
        <table>
          <tr><td><b>ID</b></td><td>${formattedId}</td></tr>
          <tr><td><b>Nombre</b></td><td>${order.customerName ?? "-"}</td></tr>
          <tr><td><b>Teléfono</b></td><td>${order.customerPhone ?? "-"}</td></tr>
          <tr><td><b>Email</b></td><td>${order.customerEmail ?? "-"}</td></tr>
          <tr><td><b>Producto</b></td><td>${pack?.title ?? "-"}</td></tr>
          <tr><td><b>Total</b></td><td>$${order.totalAmount / 100} UYU</td></tr>
          <tr><td><b>Fotos</b></td><td>${photosHtml}</td></tr>
        </table>
      `,
    });
  } catch (err) {
    console.error("[email] Error enviando notificación:", err);
  }
}
