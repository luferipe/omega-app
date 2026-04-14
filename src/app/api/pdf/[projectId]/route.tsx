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
  });

  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Load all items with category hierarchy (same query as catalog page)
  const items = await prisma.item.findMany({
    where: { section: { projectId } },
    orderBy: [{ section: { sortOrder: "asc" } }, { sortOrder: "asc" }],
    include: {
      specs: { orderBy: { sortOrder: "asc" } },
      images: { orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }], take: 1 },
      categoryRef: { include: { parent: true } },
    },
  });

  // Group by parent category → subcategory (mirrors catalog page logic)
  type Row = (typeof items)[number];
  const groups = new Map<string, { name: string; sort: number; subs: Map<string, Row[]> }>();

  for (const item of items) {
    if (!item.categoryRef) continue;
    const cat = item.categoryRef;
    const parent = cat.parent ?? cat;
    const subName = cat.parent ? cat.name : "General";
    const key = parent.id;
    if (!groups.has(key)) groups.set(key, { name: parent.name, sort: parent.sortOrder, subs: new Map() });
    const g = groups.get(key)!;
    if (!g.subs.has(subName)) g.subs.set(subName, []);
    g.subs.get(subName)!.push(item);
  }

  const orderedGroups = [...groups.values()].sort((a, b) => a.sort - b.sort);

  // Build PDF data structure grouped by categories
  const pdfSections = orderedGroups.map((group) => ({
    name: group.name,
    subtitle: `${[...group.subs.values()].reduce((n, arr) => n + arr.length, 0)} items`,
    items: [...group.subs.values()].flat().map((it) => ({
      name: it.name,
      category: it.category,
      roomLocation: it.roomLocation,
      description: it.description,
      finishType: it.finishType,
      vendorName: it.vendorName,
      vendorRef: it.vendorRef,
      specs: it.specs.map((sp) => ({ label: sp.label, value: sp.value })),
      images: it.images.map((img) => ({ url: img.url, isPrimary: img.isPrimary })),
    })),
  }));

  const pdfProject = {
    name: project.name,
    address: project.address,
    standard: project.standard,
    client: project.client,
    coverImage: null,
    sections: pdfSections,
  };

  try {
    const buffer = await renderToBuffer(<CatalogPDF project={pdfProject} />);
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${project.slug}-catalog.pdf"`,
      },
    });
  } catch (err) {
    console.error("[pdf] render failed:", err);
    return NextResponse.json(
      {
        error: "PDF render failed",
        message: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack?.split("\n").slice(0, 8) : undefined,
      },
      { status: 500 }
    );
  }
}
