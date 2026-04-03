import Link from "next/link";
import { prisma } from "@/lib/db";
import AdminShell from "@/components/admin/AdminShell";

export default async function AdminDashboard() {
  const projects = await prisma.project.findMany({
    include: { sections: { select: { id: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <AdminShell>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-light" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#eee" }}>
            Projects
          </h2>
          <p className="text-xs mt-1" style={{ color: "#999" }}>{projects.length} project(s)</p>
        </div>
        <Link
          href="/admin/projects/new"
          className="px-4 py-2 rounded-lg text-xs font-medium tracking-wider uppercase"
          style={{ background: "#c4a265", color: "#060606" }}
        >
          + New Project
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {projects.map((project) => (
          <Link
            key={project.id}
            href={`/admin/projects/${project.id}`}
            className="rounded-xl p-5 border hover:border-[rgba(196,162,101,.25)] group"
            style={{ background: "rgba(255,255,255,.06)", borderColor: "rgba(255,255,255,.1)" }}
          >
            <h3 className="text-base font-medium group-hover:text-[#c4a265]" style={{ color: "#eee" }}>
              {project.name}
            </h3>
            {project.address && (
              <p className="text-xs mt-1" style={{ color: "#aaa" }}>{project.address}</p>
            )}
            <div className="flex gap-3 mt-4">
              <span className="text-[10px] px-2 py-1 rounded" style={{ background: "rgba(196,162,101,.08)", color: "#c4a265" }}>
                {project.sections.length} sections
              </span>
              <span className="text-[10px] px-2 py-1 rounded" style={{
                background: project.published ? "rgba(52,211,153,.08)" : "rgba(255,255,255,.04)",
                color: project.published ? "#34d399" : "#555",
              }}>
                {project.published ? "Published" : "Draft"}
              </span>
              {project.standard && (
                <span className="text-[10px] px-2 py-1 rounded" style={{ background: "rgba(255,255,255,.06)", color: "#bbb" }}>
                  {project.standard}
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </AdminShell>
  );
}
