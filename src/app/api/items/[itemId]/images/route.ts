import { NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { del } from "@vercel/blob";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ itemId: string }> }
) {
  const session = await getSessionFromRequest(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { itemId } = await params;
  const { storageKey, url, altText, isPrimary } = await request.json();

  if (!url) {
    return NextResponse.json({ error: "url required" }, { status: 400 });
  }

  if (isPrimary) {
    await prisma.itemImage.updateMany({
      where: { itemId },
      data: { isPrimary: false },
    });
  }

  const count = await prisma.itemImage.count({ where: { itemId } });

  const image = await prisma.itemImage.create({
    data: {
      itemId,
      storageKey: storageKey || url,
      url,
      altText: altText || null,
      isPrimary: isPrimary || count === 0,
      sortOrder: count,
    },
  });

  return NextResponse.json(image);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ itemId: string }> }
) {
  const session = await getSessionFromRequest(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await params;
  const { imageId } = await request.json();

  const image = await prisma.itemImage.findUnique({ where: { id: imageId } });
  if (!image) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    await del(image.url);
  } catch {
    // Blob may not exist
  }

  await prisma.itemImage.delete({ where: { id: imageId } });
  return NextResponse.json({ ok: true });
}
