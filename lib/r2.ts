// src/lib/r2.ts
import {
  S3Client,
  CopyObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";

const ACCOUNT_ID = process.env.R2_ACCOUNT_ID!;
const ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID!;
const SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY!;
export const R2_BUCKET = process.env.R2_BUCKET!;

export const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: ACCESS_KEY_ID,
    secretAccessKey: SECRET_ACCESS_KEY,
  },
});

// CopySource necesita encoding “tipo URL”, pero manteniendo / como separador
function encodeS3KeyPreservingSlashes(key: string) {
  return key
    .split("/")
    .map((seg) => encodeURIComponent(seg))
    .join("/");
}

export async function r2Exists(key: string) {
  try {
    await r2.send(new HeadObjectCommand({ Bucket: R2_BUCKET, Key: key }));
    return true;
  } catch {
    return false;
  }
}

export async function r2Copy(fromKey: string, toKey: string) {
  const copySource = `${R2_BUCKET}/${encodeS3KeyPreservingSlashes(fromKey)}`;

  await r2.send(
    new CopyObjectCommand({
      Bucket: R2_BUCKET,
      Key: toKey,
      CopySource: copySource,
      MetadataDirective: "COPY",
    }),
  );
}

export async function r2Delete(key: string) {
  await r2.send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: key }));
}
