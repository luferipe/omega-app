import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import AdminShell from "@/components/admin/AdminShell";

export default function NewProjectPage() {
  async function createProject(formData: FormData) {
    "use server";
    const name = formData.get("name") as string;
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const project = await prisma.project.create({
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

    redirect(`/admin/projects/${project.id}`);
  }

  return (
    <AdminShell>
      <div className="mb-6">
        <a href="/admin" className="text-xs uppercase tracking-wider" style={{ color: "#999" }}>&larr; Projects</a>
      </div>

      <div className="max-w-2xl">
        <h2 className="text-2xl font-light mb-8" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#eee" }}>
          New Project
        </h2>

        <form action={createProject} className="space-y-5">
          <div>
            <label className="block text-[10px] uppercase tracking-widest mb-1.5" style={{ color: "#aaa" }}>Project Name *</label>
            <input name="name" required className="w-full px-3 py-2 rounded-lg text-sm outline-none focus:ring-1 focus:ring-[#c4a265]"
              style={{ background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)", color: "#eee" }}
              placeholder="The Ridge — Lot 18" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase tracking-widest mb-1.5" style={{ color: "#aaa" }}>Client</label>
              <input name="client" className="w-full px-3 py-2 rounded-lg text-sm outline-none focus:ring-1 focus:ring-[#c4a265]"
                style={{ background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)", color: "#eee" }} />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest mb-1.5" style={{ color: "#aaa" }}>Standard</label>
              <select name="standard" className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{ background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)", color: "#eee" }}>
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
            <input name="address" className="w-full px-3 py-2 rounded-lg text-sm outline-none focus:ring-1 focus:ring-[#c4a265]"
              style={{ background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)", color: "#eee" }}
              placeholder="1677 N Elk Ridge Lane, Alpine, UT 84004" />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-widest mb-1.5" style={{ color: "#aaa" }}>Matterport URL</label>
            <input name="matterportUrl" className="w-full px-3 py-2 rounded-lg text-sm outline-none focus:ring-1 focus:ring-[#c4a265]"
              style={{ background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)", color: "#eee" }}
              placeholder="https://my.matterport.com/show/?m=..." />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" name="published" id="published" className="accent-[#c4a265]" />
            <label htmlFor="published" className="text-sm" style={{ color: "#ccc" }}>Publish catalog (visible to clients)</label>
          </div>
          <button type="submit" className="px-6 py-2.5 rounded-lg text-xs font-medium tracking-wider uppercase"
            style={{ background: "#c4a265", color: "#111" }}>
            Create Project
          </button>
        </form>
      </div>
    </AdminShell>
  );
}
