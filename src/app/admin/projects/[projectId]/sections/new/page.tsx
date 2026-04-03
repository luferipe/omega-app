import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import AdminShell from "@/components/admin/AdminShell";

export default async function NewSectionPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { name: true, sections: { select: { sortOrder: true }, orderBy: { sortOrder: "desc" }, take: 1 } },
  });

  if (!project) redirect("/admin");

  const nextOrder = (project.sections[0]?.sortOrder ?? -1) + 1;

  async function createSection(formData: FormData) {
    "use server";
    const name = formData.get("name") as string;
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    await prisma.section.create({
      data: {
        projectId,
        name,
        slug,
        subtitle: (formData.get("subtitle") as string) || null,
        sortOrder: nextOrder,
      },
    });

    redirect(`/admin/projects/${projectId}`);
  }

  return (
    <AdminShell>
      <div className="mb-6 flex gap-2 text-xs uppercase tracking-wider" style={{ color: "#999" }}>
        <a href="/admin">&larr; Projects</a>
        <span>/</span>
        <a href={`/admin/projects/${projectId}`}>{project.name}</a>
      </div>

      <div className="max-w-2xl">
        <h2 className="text-2xl font-light mb-8" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#eee" }}>
          New Section
        </h2>

        <form action={createSection} className="space-y-5">
          <div>
            <label className="block text-[10px] uppercase tracking-widest mb-1.5" style={{ color: "#aaa" }}>Section Name *</label>
            <input name="name" required className="w-full px-3 py-2 rounded-lg text-sm outline-none focus:ring-1 focus:ring-[#c4a265]"
              style={{ background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)", color: "#eee" }}
              placeholder="Main Level Kitchen" />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-widest mb-1.5" style={{ color: "#aaa" }}>Subtitle</label>
            <input name="subtitle" className="w-full px-3 py-2 rounded-lg text-sm outline-none focus:ring-1 focus:ring-[#c4a265]"
              style={{ background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)", color: "#eee" }}
              placeholder="Polished Gold · Custom Cabinetry" />
          </div>
          <button type="submit" className="px-6 py-2.5 rounded-lg text-xs font-medium tracking-wider uppercase"
            style={{ background: "#c4a265", color: "#111" }}>
            Create Section
          </button>
        </form>
      </div>
    </AdminShell>
  );
}
