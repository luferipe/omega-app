import { NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";

export async function POST(request: Request) {
  const { getSession } = await import("@/lib/auth");
  let session = await getSession().catch(() => null);
  if (!session) {
    session = await getSessionFromRequest(request);
  }
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as HandleUploadBody;

  const jsonResponse = await handleUpload({
    body,
    request,
    onBeforeGenerateToken: async () => ({
      allowedContentTypes: ["application/pdf"],
      maximumSizeInBytes: 100 * 1024 * 1024, // 100MB
    }),
    onUploadCompleted: async () => {},
  });

  return NextResponse.json(jsonResponse);
}
