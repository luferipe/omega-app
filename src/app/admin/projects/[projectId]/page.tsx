import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import AdminShell from "@/components/admin/AdminShell";

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
          <a
            href={`/api/pdf/${projectId}`}
            className="px-4 py-2 rounded-lg text-xs tracking-wider uppercase"
            style={{ background: "rgba(255,255,255,.05)", color: "#bbb", border: "1px solid rgba(255,255,255,.08)" }}
          >
            Download PDF
          </a>
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
