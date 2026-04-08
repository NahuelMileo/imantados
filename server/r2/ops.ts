import {
  CopyObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { r2 } from "@/server/r2/client";

const BUCKET = process.env.R2_BUCKET!;

function encodeKeyPreservingSlashes(key: string) {
  return key.split("/").map(encodeURIComponent).join("/");
}

export async function r2Exists(key: string) {
  try {
    await r2.send(new HeadObjectCommand({ Bucket: BUCKET, Key: key }));
    return true;
  } catch {
    return false;
  }
}

export async function r2Copy(fromKey: string, toKey: string) {
  const copySource = `${BUCKET}/${encodeKeyPreservingSlashes(fromKey)}`;

  await r2.send(
    new CopyObjectCommand({
      Bucket: BUCKET,
      Key: toKey,
      CopySource: copySource,
      MetadataDirective: "COPY",
    }),
  );
}

export async function r2Delete(key: string) {
  await r2.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
}
