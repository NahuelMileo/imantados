import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { r2Delete } from "@/lib/r2";

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

  const ttlHours = Number(process.env.TMP_UPLOAD_TTL_HOURS ?? "24");
  const cutoff = new Date(Date.now() - ttlHours * 60 * 60 * 1000);

  const uploads = await prisma.orderUpload.findMany({
    where: { status: "TMP", createdAt: { lt: cutoff } },
    select: { id: true, tmpKey: true },
    take: 200,
  });

  let deleted = 0;

  for (const u of uploads) {
    try {
      await r2Delete(u.tmpKey);
      await prisma.orderUpload.update({
        where: { id: u.id },
        data: { status: "DELETED" },
      });
      deleted++;
    } catch {
      //reintenta
    }
  }

  return NextResponse.json({ ok: true, deleted, checked: uploads.length });
}