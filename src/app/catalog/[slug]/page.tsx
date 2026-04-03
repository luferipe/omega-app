import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import CoverSection from "@/components/catalog/CoverSection";
import SectionBreak from "@/components/catalog/SectionBreak";
import ProductCard from "@/components/catalog/ProductCard";

export default async function CatalogPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const project = await prisma.project.findUnique({
    where: { slug, published: true },
    include: {
      sections: {
        orderBy: { sortOrder: "asc" },
        include: {
          items: {
            orderBy: { sortOrder: "asc" },
            include: {
              specs: { orderBy: { sortOrder: "asc" } },
              images: { orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }] },
            },
          },
        },
      },
    },
  });

  if (!project) notFound();

  return (
    <div style={{ background: "#0a0a0e", color: "#bbb", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <CoverSection project={project} />

      {/* Matterport */}
      {project.matterportUrl && (
        <section className="max-w-[1300px] mx-auto px-10 py-16">
          <h2 className="text-3xl font-light mb-2" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#eee" }}>
            Explore in 3D
          </h2>
          <div className="rounded-2xl overflow-hidden border mt-6" style={{ borderColor: "rgba(255,255,255,.08)", boxShadow: "0 40px 80px rgba(0,0,0,.4)", aspectRatio: "16/9" }}>
            <iframe src={project.matterportUrl} className="w-full h-full border-0" allowFullScreen allow="xr-spatial-tracking" />
          </div>
        </section>
      )}

      {/* Sections */}
      {project.sections.map((section, sIdx) => (
        <div key={section.id}>
          <SectionBreak number={String(sIdx + 1).padStart(2, "0")} title={section.name} subtitle={section.subtitle || undefined} />

          <section className="max-w-[1300px] mx-auto px-10 pb-20">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {section.items.map((item) => (
                <ProductCard key={item.id} item={item} />
              ))}
            </div>
          </section>
        </div>
      ))}

      {/* Footer */}
      <footer className="text-center py-20 border-t" style={{ borderColor: "rgba(255,255,255,.05)" }}>
        <h3 className="text-2xl font-light" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#c4a265" }}>
          Omega Custom Homes
        </h3>
        <p className="text-xs mt-2" style={{ color: "#444" }}>
          {project.name} &bull; {project.address}
        </p>
        <p className="text-[10px] mt-1" style={{ color: "#333" }}>Confidential</p>
      </footer>
    </div>
  );
}
