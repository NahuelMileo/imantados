// src/app/api/upload-presign/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { r2 } from "@/server/r2/client";

export const runtime = "nodejs";

const MAX_FILES_PER_REQUEST = 50;
const ALLOWED_CONTENT_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);
const ALLOWED_EXTS = new Set(["jpg", "jpeg", "png", "webp"]);

function normalizeExt(originalName: string) {
  const raw = (originalName.split(".").pop() || "jpg").toLowerCase();
  const ext = raw === "jpeg" ? "jpg" : raw;
  return ALLOWED_EXTS.has(ext) ? ext : "jpg";
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const orderId = body?.orderId as string | undefined;
  const files = body?.files as
    | { originalName: string; contentType: string }[]
    | undefined;

  if (!orderId || typeof orderId !== "string") {
    return NextResponse.json({ error: "orderId requerido" }, { status: 400 });
  }

  if (!Array.isArray(files) || files.length === 0) {
    return NextResponse.json({ error: "files requerido" }, { status: 400 });
  }

  if (files.length > MAX_FILES_PER_REQUEST) {
    return NextResponse.json(
      { error: `máximo ${MAX_FILES_PER_REQUEST} archivos por request` },
      { status: 400 }
    );
  }

  for (const f of files) {
    if (
      !f ||
      typeof f.originalName !== "string" ||
      typeof f.contentType !== "string"
    ) {
      return NextResponse.json({ error: "files inválido" }, { status: 400 });
    }
    if (!ALLOWED_CONTENT_TYPES.has(f.contentType)) {
      return NextResponse.json(
        { error: `contentType no permitido: ${f.contentType}` },
        { status: 400 }
      );
    }
  }

  // Verificación rápida antes de hacer trabajo pesado
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: { include: { pack: true } },
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (!(order.status === "DRAFT" || order.status === "PENDING_PAYMENT")) {
    return NextResponse.json(
      { error: `No se permite subir imágenes en estado ${order.status}` },
      { status: 409 }
    );
  }

  const product = order.items[0]?.pack;
  if (!product) {
    return NextResponse.json({ error: "Order has no product" }, { status: 400 });
  }

  const maxImages = (product as any).maxImages as number | undefined;
  if (!maxImages || typeof maxImages !== "number" || maxImages <= 0) {
    return NextResponse.json(
      { error: `Producto ${product.id} sin maxImages configurado` },
      { status: 500 }
    );
  }

  const bucket = process.env.R2_BUCKET!;
  const publicBase = process.env.R2_PUBLIC_BASE_URL || null;

  // Preparar keys con UUID generado server-side
  const planned = files.map((f) => {
    const ext = normalizeExt(f.originalName);
    const uuid = crypto.randomUUID();
    const key = `orders/tmp/${uuid}.${ext}`;
    return { key, contentType: f.contentType };
  });

  // ✅ Paso 1: generar presigned URLs ANTES de tocar la DB
  // Si esto falla, no queda basura en la DB
  let signedFiles: { key: string; uploadUrl: string; url: string | undefined }[];

  try {
    signedFiles = await Promise.all(
      planned.map(async (p) => {
        const cmd = new PutObjectCommand({
          Bucket: bucket,
          Key: p.key,
          ContentType: p.contentType || "image/jpeg",
        });
        const uploadUrl = await getSignedUrl(r2, cmd, { expiresIn: 60 * 15 });
        return {
          key: p.key,
          uploadUrl,
          url: publicBase ? `${publicBase}/${p.key}` : undefined,
        };
      })
    );
  } catch {
    return NextResponse.json(
      { error: "Error generando URLs de subida" },
      { status: 502 }
    );
  }

  // ✅ Paso 2: recién ahora crear los registros en DB
  await prisma.$transaction(async (tx) => {
    const current = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: { include: { pack: true } } },
    });

    if (!current) throw new Error("order_not_found");

    if (!(current.status === "DRAFT" || current.status === "PENDING_PAYMENT")) {
      throw new Error("invalid_order_state");
    }

    const p = current.items[0]?.pack as any;
    const max = p?.maxImages as number | undefined;
    if (!max || max <= 0) throw new Error("product_max_images_missing");

    const agg = await tx.orderUpload.aggregate({
      where: { orderId },
      _sum: { quantity: true },
    });

    const currentCount = agg._sum.quantity ?? 0;
    if (currentCount + planned.length > max) {
      throw new Error("too_many_images");
    }

    // ✅ Un solo viaje a la DB en lugar de N queries con upsert
    await tx.orderUpload.createMany({
      data: planned.map((p) => ({
        orderId,
        tmpKey: p.key,
        status: "TMP",
        quantity: 1,
      })),
    });
  });

  return NextResponse.json({ files: signedFiles });
}