import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import AdminShell from "@/components/admin/AdminShell";
import PdfViewerModal from "@/components/admin/PdfViewerModal";
import ProjectItemsSearch, { type ProjectSearchItem } from "@/components/admin/ProjectItemsSearch";

export default async function ProjectDetailPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      sections: {
        orderBy: { sortOrder: "asc" },
        include: { items: { select: { id: true } } },
      },
    },
  });

  if (!project) notFound();

  // Load all items in this project (for category breakdown + search)
  const allItems = await prisma.item.findMany({
    where: { section: { projectId } },
    orderBy: [{ section: { sortOrder: "asc" } }, { sortOrder: "asc" }],
    include: {
      categoryRef: { include: { parent: true } },
      section: { select: { id: true, name: true } },
      specs: { select: { label: true, value: true }, orderBy: { sortOrder: "asc" } },
      images: { where: { isPrimary: true }, select: { url: true }, take: 1 },
    },
  });

  const catCounts = new Map<string, { name: string; sort: number; count: number }>();
  let uncategorizedCount = 0;
  for (const it of allItems) {
    if (!it.categoryRef) {
      uncategorizedCount++;
      continue;
    }
    const parent = it.categoryRef.parent ?? it.categoryRef;
    const existing = catCounts.get(parent.id);
    if (existing) existing.count++;
    else catCounts.set(parent.id, { name: parent.name, sort: parent.sortOrder, count: 1 });
  }
  const categoryBreakdown = [...catCounts.values()].sort((a, b) => a.sort - b.sort);

  const searchItems: ProjectSearchItem[] = allItems.map((it) => ({
    id: it.id,
    name: it.name,
    category: it.category,
    finishType: it.finishType,
    roomLocation: it.roomLocation,
    vendorName: it.vendorName,
    sectionId: it.section.id,
    sectionName: it.section.name,
    thumbnail: it.images[0]?.url ?? null,
    specs: it.specs.map((s) => ({ label: s.label, value: s.value })),
  }));

  return (
    <AdminShell>
      <div className="mb-6">
        <Link href="/admin" className="text-xs uppercase tracking-wider" style={{ color: "#999" }}>
          &larr; Projects
        </Link>
      </div>

      <div className="flex items-start justify-between mb-8">
        <div>
          <h2 className="text-2xl font-light" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#eee" }}>
            {project.name}
          </h2>
          {project.address && <p className="text-xs mt-1" style={{ color: "#aaa" }}>{project.address}</p>}
          {project.client && <p className="text-xs mt-1" style={{ color: "#999" }}>Client: {project.client}</p>}
        </div>
        <div className="flex gap-3">
          {project.published && (
            <Link
              href={`/catalog/${project.slug}`}
              target="_blank"
              className="px-4 py-2 rounded-lg text-xs tracking-wider uppercase border"
              style={{ borderColor: "rgba(196,162,101,.3)", color: "#c4a265" }}
            >
              View Catalog
            </Link>
          )}
          <PdfViewerModal projectId={projectId} projectSlug={project.slug} projectName={project.name} />
          {project.published && (
            <Link
              href={`/catalog/${project.slug}/qr`}
              target="_blank"
              className="px-4 py-2 rounded-lg text-xs tracking-wider uppercase"
              style={{ background: "rgba(255,255,255,.05)", color: "#bbb", border: "1px solid rgba(255,255,255,.08)" }}
            >
              QR Code
            </Link>
          )}
        </div>
      </div>

      {/* Category breakdown */}
      {categoryBreakdown.length > 0 && (
        <div className="mb-10 p-5 rounded-xl border" style={{ background: "rgba(255,255,255,.04)", borderColor: "rgba(255,255,255,.08)" }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs uppercase tracking-widest" style={{ color: "#c4a265" }}>
              By Category
            </h3>
            <Link href="/admin/categories" className="text-[10px] uppercase tracking-wider" style={{ color: "#888" }}>
              Manage →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {categoryBreakdown.map((c) => (
              <div
                key={c.name}
                className="flex items-center justify-between px-3 py-2 rounded-lg"
                style={{ background: "rgba(196,162,101,.06)", border: "1px solid rgba(196,162,101,.12)" }}
              >
                <span className="text-xs" style={{ color: "#ddd" }}>{c.name}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded" style={{ background: "rgba(196,162,101,.15)", color: "#c4a265" }}>
                  {c.count}
                </span>
              </div>
            ))}
            {uncategorizedCount > 0 && (
              <div className="flex items-center justify-between px-3 py-2 rounded-lg" style={{ background: "rgba(248,113,113,.06)", border: "1px solid rgba(248,113,113,.12)" }}>
                <span className="text-xs" style={{ color: "#bbb" }}>Uncategorized</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded" style={{ background: "rgba(248,113,113,.15)", color: "#f87171" }}>
                  {uncategorizedCount}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      <ProjectItemsSearch items={searchItems} projectId={projectId} />

      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm uppercase tracking-wider" style={{ color: "#bbb" }}>
          Sections ({project.sections.length})
        </h3>
        <Link
          href={`/admin/projects/${projectId}/sections/new`}
          className="px-3 py-1.5 rounded-lg text-xs tracking-wider uppercase"
          style={{ background: "rgba(196,162,101,.1)", color: "#c4a265", border: "1px solid rgba(196,162,101,.2)" }}
        >
          + Add Section
        </Link>
      </div>

      <div className="space-y-3">
        {project.sections.map((section, i) => (
          <Link
            key={section.id}
            href={`/admin/projects/${projectId}/sections/${section.id}`}
            className="flex items-center justify-between p-4 rounded-xl border hover:border-[rgba(196,162,101,.25)] group"
            style={{ background: "rgba(255,255,255,.06)", borderColor: "rgba(255,255,255,.1)" }}
          >
            <div className="flex items-center gap-4">
              <span className="text-xs font-mono w-6 text-center" style={{ color: "#777" }}>{String(i + 1).padStart(2, "0")}</span>
              <div>
                <h4 className="text-sm group-hover:text-[#c4a265]" style={{ color: "#eee" }}>{section.name}</h4>
                {section.subtitle && <p className="text-xs mt-0.5" style={{ color: "#999" }}>{section.subtitle}</p>}
              </div>
            </div>
            <span className="text-[10px] px-2 py-1 rounded" style={{ background: "rgba(255,255,255,.06)", color: "#aaa" }}>
              {section.items.length} items
            </span>
          </Link>
        ))}
      </div>
    </AdminShell>
  );
}
