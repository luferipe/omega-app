import { NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { put } from "@vercel/blob";
import { randomUUID } from "crypto";

export async function POST(request: Request) {
  // Auth check
  const { getSession } = await import("@/lib/auth");
  let session = await getSession().catch(() => null);
  if (!session) {
    session = await getSessionFromRequest(request);
  }
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const itemId = formData.get("itemId") as string | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const ext = file.name.split(".").pop() || "jpg";
  const pathname = `items/${itemId || "temp"}/${randomUUID()}.${ext}`;

  const blob = await put(pathname, file, {
    access: "public",
    contentType: file.type,
  });

  return NextResponse.json({ key: pathname, url: blob.url });
}
