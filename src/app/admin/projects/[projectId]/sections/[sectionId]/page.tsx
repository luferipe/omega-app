import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import AdminShell from "@/components/admin/AdminShell";

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
        <Link
          href={`/admin/projects/${projectId}/sections/${sectionId}/items/new`}
          className="px-3 py-1.5 rounded-lg text-xs tracking-wider uppercase"
          style={{ background: "#c4a265", color: "#060606" }}
        >
          + Add Item
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {section.items.map((item) => (
          <Link
            key={item.id}
            href={`/admin/projects/${projectId}/sections/${sectionId}/items/${item.id}`}
            className="rounded-xl overflow-hidden border hover:border-[rgba(196,162,101,.25)] group"
            style={{ background: "rgba(255,255,255,.06)", borderColor: "rgba(255,255,255,.1)" }}
          >
            {/* Image or swatch */}
            <div className="h-32 relative" style={{
              background: item.finishType?.toLowerCase().includes("gold")
                ? "linear-gradient(135deg,#1f1a0a,#30280e)"
                : item.finishType?.toLowerCase().includes("nickel")
                ? "linear-gradient(135deg,#16181a,#1e2226)"
                : item.finishType?.toLowerCase().includes("black")
                ? "linear-gradient(135deg,#0e0e10,#161618)"
                : item.finishType?.toLowerCase().includes("brass")
                ? "linear-gradient(135deg,#18150a,#25200d)"
                : "linear-gradient(135deg,#111,#1a1a1a)",
            }}>
              {item.images[0] && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.images[0].url} alt={item.name} className="w-full h-full object-cover" />
              )}
              {item.category && (
                <span className="absolute top-2 right-2 text-[9px] px-2 py-0.5 rounded tracking-wider uppercase"
                  style={{ background: "rgba(0,0,0,.6)", color: "#c4a265", border: "1px solid rgba(196,162,101,.15)" }}>
                  {item.category}
                </span>
              )}
              {item.roomLocation && (
                <span className="absolute bottom-2 left-2 text-[9px] px-2 py-0.5 rounded tracking-wide"
                  style={{ background: "rgba(0,0,0,.6)", color: "#bbb" }}>
                  {item.roomLocation}
                </span>
              )}
            </div>

            {/* Body */}
            <div className="p-4">
              <h4 className="text-sm group-hover:text-[#c4a265]" style={{ color: "#eee" }}>{item.name}</h4>
              {item.finishType && <p className="text-[11px] mt-1" style={{ color: "#c4a265" }}>{item.finishType}</p>}
              {item.specs.length > 0 && (
                <div className="mt-2 space-y-0.5">
                  {item.specs.map((s) => (
                    <p key={s.id} className="text-[11px]" style={{ color: "#aaa" }}>
                      <span style={{ color: "#bbb" }}>{s.label}:</span> {s.value}
                    </p>
                  ))}
                </div>
              )}
              {item.vendorName && (
                <p className="text-[10px] mt-2 pt-2 border-t uppercase tracking-wide" style={{ color: "#777", borderColor: "rgba(255,255,255,.08)" }}>
                  {item.vendorName}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </AdminShell>
  );
}
