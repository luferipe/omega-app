import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import AdminShell from "@/components/admin/AdminShell";
import DeleteSectionButton from "@/components/admin/DeleteSectionButton";
import ItemsFilterGrid from "@/components/admin/ItemsFilterGrid";

export default async function SectionDetailPage({
  params,
}: {
  params: Promise<{ projectId: string; sectionId: string }>;
}) {
  const { projectId, sectionId } = await params;

  const section = await prisma.section.findUnique({
    where: { id: sectionId },
    include: {
      project: { select: { name: true } },
      items: {
        orderBy: { sortOrder: "asc" },
        include: {
          specs: { orderBy: { sortOrder: "asc" }, take: 3 },
          images: { where: { isPrimary: true }, take: 1 },
        },
      },
    },
  });

  if (!section) notFound();

  async function deleteSection() {
    "use server";
    await prisma.section.delete({ where: { id: sectionId } });
    redirect(`/admin/projects/${projectId}`);
  }

  return (
    <AdminShell>
      <div className="mb-6 flex gap-2 text-xs uppercase tracking-wider" style={{ color: "#999" }}>
        <Link href="/admin">&larr; Projects</Link>
        <span>/</span>
        <Link href={`/admin/projects/${projectId}`}>{section.project.name}</Link>
      </div>

      <div className="flex items-start justify-between mb-8">
        <div>
          <h2 className="text-2xl font-light" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#eee" }}>
            {section.name}
          </h2>
          {section.subtitle && <p className="text-xs mt-1" style={{ color: "#aaa" }}>{section.subtitle}</p>}
        </div>
        <div className="flex items-center gap-2">
          <DeleteSectionButton
            sectionName={section.name}
            itemCount={section.items.length}
            deleteAction={deleteSection}
          />
          <Link
            href={`/admin/projects/${projectId}/sections/${sectionId}/items/new`}
            className="px-3 py-1.5 rounded-lg text-xs tracking-wider uppercase"
            style={{ background: "#c4a265", color: "#060606" }}
          >
            + Add Item
          </Link>
        </div>
      </div>

      <ItemsFilterGrid
        projectId={projectId}
        sectionId={sectionId}
        items={section.items.map((item) => ({
          id: item.id,
          name: item.name,
          category: item.category,
          finishType: item.finishType,
          roomLocation: item.roomLocation,
          vendorName: item.vendorName,
          specs: item.specs.map((s) => ({ id: s.id, label: s.label, value: s.value })),
          images: item.images.map((img) => ({ url: img.url })),
        }))}
      />
    </AdminShell>
  );
}
