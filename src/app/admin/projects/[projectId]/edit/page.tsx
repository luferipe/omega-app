import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import AdminShell from "@/components/admin/AdminShell";

export default async function EditProjectPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;

  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) notFound();

  async function updateProject(formData: FormData) {
    "use server";
    const name = formData.get("name") as string;
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    await prisma.project.update({
      where: { id: projectId },
      data: {
        name,
        slug,
        client: (formData.get("client") as string) || null,
        address: (formData.get("address") as string) || null,
        standard: (formData.get("standard") as string) || null,
        matterportUrl: (formData.get("matterportUrl") as string) || null,
        published: formData.get("published") === "on",
      },
    });

    redirect(`/admin/projects/${projectId}`);
  }

  const inputClass = "w-full px-3 py-2 rounded-lg text-sm outline-none focus:ring-1 focus:ring-[#c4a265]";
  const inputStyle = { background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)", color: "#eee" };

  return (
    <AdminShell>
      <div className="mb-6">
        <a href={`/admin/projects/${projectId}`} className="text-xs uppercase tracking-wider" style={{ color: "#999" }}>
          &larr; Back to Project
        </a>
      </div>

      <div className="max-w-2xl">
        <h2 className="text-2xl font-light mb-8" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#eee" }}>
          Edit Project
        </h2>

        <form action={updateProject} className="space-y-5">
          <div>
            <label className="block text-[10px] uppercase tracking-widest mb-1.5" style={{ color: "#aaa" }}>Project Name *</label>
            <input name="name" required defaultValue={project.name} className={inputClass} style={inputStyle}  />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase tracking-widest mb-1.5" style={{ color: "#aaa" }}>Client</label>
              <input name="client" defaultValue={project.client ?? ""} className={inputClass} style={inputStyle} />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest mb-1.5" style={{ color: "#aaa" }}>Standard</label>
              <select name="standard" defaultValue={project.standard ?? ""} className={inputClass} style={inputStyle}>
                <option value="">Select...</option>
                <option value="Standard">Standard</option>
                <option value="High-End">High-End</option>
                <option value="High-End / Luxury">High-End / Luxury</option>
                <option value="Luxury">Luxury</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-widest mb-1.5" style={{ color: "#aaa" }}>Address</label>
            <input name="address" defaultValue={project.address ?? ""} className={inputClass} style={inputStyle} />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-widest mb-1.5" style={{ color: "#aaa" }}>Matterport URL</label>
            <input name="matterportUrl" defaultValue={project.matterportUrl ?? ""} className={inputClass} style={inputStyle} />
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" name="published" id="published" defaultChecked={project.published} className="accent-[#c4a265]" />
            <label htmlFor="published" className="text-sm" style={{ color: "#ccc" }}>Publish catalog</label>
          </div>

          <div className="flex gap-3">
            <button type="submit" className="px-6 py-2.5 rounded-lg text-xs font-medium tracking-wider uppercase"
              style={{ background: "#c4a265", color: "#111" }}>
              Save Changes
            </button>
            <a href={`/admin/projects/${projectId}`}
              className="px-6 py-2.5 rounded-lg text-xs tracking-wider uppercase"
              style={{ background: "rgba(255,255,255,.06)", color: "#999", border: "1px solid rgba(255,255,255,.08)" }}>
              Cancel
            </a>
          </div>
        </form>
      </div>
    </AdminShell>
  );
}
