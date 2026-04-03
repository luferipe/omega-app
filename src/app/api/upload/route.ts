import { NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { ensureBucket, getPublicUrl } from "@/lib/minio";
import { s3 } from "@/lib/minio";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";

export async function POST(request: Request) {
  // Auth check - try both methods
  const { getSession } = await import("@/lib/auth");
  let session = await getSession().catch(() => null);
  if (!session) {
    session = await getSessionFromRequest(request);
  }
  if (!session) {
    // Log for debugging
    console.log("[upload] No session found. Cookie header:", request.headers.get("cookie")?.substring(0, 50));
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const itemId = formData.get("itemId") as string | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  await ensureBucket();

  const ext = file.name.split(".").pop() || "jpg";
  const key = `items/${itemId || "temp"}/${randomUUID()}.${ext}`;

  const buffer = Buffer.from(await file.arrayBuffer());

  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.MINIO_BUCKET || "omega-images",
      Key: key,
      Body: buffer,
      ContentType: file.type,
    })
  );

  const url = getPublicUrl(key);

  return NextResponse.json({ key, url });
}
