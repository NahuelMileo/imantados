import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const token =
    req.headers.get("x-maintenance-token") ||
    req.headers.get("authorization")?.replace("Bearer ", "");

  if (
    !token ||
    (token !== process.env.MAINTENANCE_TOKEN &&
      token !== process.env.CRON_SECRET)
  ) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const ttlHours = Number(process.env.UNPAID_ORDER_TTL_HOURS ?? "24");
  const cutoff = new Date(Date.now() - ttlHours * 60 * 60 * 1000);

  const deleted = await prisma.order.deleteMany({
    where: {
      status: { in: ["DRAFT", "PENDING_PAYMENT", "EXPIRED", "CANCELLED"] },
      createdAt: { lt: cutoff },
    },
  });

  return NextResponse.json({ ok: true, deleted: deleted.count });
}
