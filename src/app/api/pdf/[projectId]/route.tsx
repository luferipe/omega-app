import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { renderToBuffer } from "@react-pdf/renderer";
import { CatalogPDF } from "@/lib/pdf";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { projectId } = await params;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      sections: {
        orderBy: { sortOrder: "asc" },
        include: {
          items: {
            orderBy: { sortOrder: "asc" },
            include: {
              specs: { orderBy: { sortOrder: "asc" } },
              images: { orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }], take: 1 },
            },
          },
        },
      },
    },
  });

  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const buffer = await renderToBuffer(<CatalogPDF project={project} />);
  const uint8 = new Uint8Array(buffer);

  return new NextResponse(uint8, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${project.slug}-catalog.pdf"`,
    },
  });
}
