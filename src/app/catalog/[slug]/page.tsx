import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import CoverSection from "@/components/catalog/CoverSection";
import SectionBreak from "@/components/catalog/SectionBreak";
import ProductCard from "@/components/catalog/ProductCard";
import CatalogNav from "@/components/catalog/CatalogNav";
import CatalogSearch, { type SearchableItem } from "@/components/catalog/CatalogSearch";
import ScrollReveal from "@/components/catalog/ScrollReveal";

export default async function CatalogPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const project = await prisma.project.findUnique({
    where: { slug, published: true },
  });

  if (!project) notFound();

  // Load all items for this project across sections, with category relations
  const items = await prisma.item.findMany({
    where: { section: { projectId: project.id } },
    orderBy: [{ section: { sortOrder: "asc" } }, { sortOrder: "asc" }],
    include: {
      specs: { orderBy: { sortOrder: "asc" } },
      images: { orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }] },
      categoryRef: { include: { parent: true } },
      section: { select: { name: true } },
    },
  });

  // Group items by parent category (top-level group), then by subcategory
  type ItemRow = (typeof items)[number];
  const groups = new Map<string, { parentName: string; parentSort: number; subs: Map<string, ItemRow[]> }>();
  const uncategorized: ItemRow[] = [];

  for (const item of items) {
    if (!item.categoryRef) {
      uncategorized.push(item);
      continue;
    }
    const cat = item.categoryRef;
    const parent = cat.parent ?? cat;
    const subName = cat.parent ? cat.name : "General";
    const key = parent.id;
    if (!groups.has(key)) {
      groups.set(key, { parentName: parent.name, parentSort: parent.sortOrder, subs: new Map() });
    }
    const group = groups.get(key)!;
    if (!group.subs.has(subName)) group.subs.set(subName, []);
    group.subs.get(subName)!.push(item);
  }

  const orderedGroups = [...groups.values()].sort((a, b) => a.parentSort - b.parentSort);

  // Build nav sections for the floating navigation
  const navSections = orderedGroups.map((g, i) => ({
    id: `cat-${String(i + 1).padStart(2, "0")}`,
    number: String(i + 1).padStart(2, "0"),
    title: g.parentName,
  }));

  // Build searchable items list (serialisable for client component)
  const searchItems: SearchableItem[] = items.map((item) => {
    const parent = item.categoryRef?.parent ?? item.categoryRef;
    return {
      id: item.id,
      name: item.name,
      category: item.category,
      roomLocation: item.roomLocation,
      vendorName: item.vendorName,
      finishType: item.finishType,
      imageUrl: item.images[0]?.url ?? null,
      parentCategory: parent?.name ?? "Uncategorized",
    };
  });

  return (
    <div style={{ background: "#0a0a0e", color: "#bbb", fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Floating UI */}
      <CatalogNav sections={navSections} />
      <CatalogSearch items={searchItems} />

      <CoverSection project={project} />

      {/* Matterport */}
      {project.matterportUrl && (
        <ScrollReveal>
          <section className="max-w-[1300px] mx-auto px-10 py-16">
            <h2 className="text-3xl font-light mb-2" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#eee" }}>
              Explore in 3D
            </h2>
            <div className="rounded-2xl overflow-hidden border mt-6" style={{ borderColor: "rgba(255,255,255,.08)", boxShadow: "0 40px 80px rgba(0,0,0,.4)", aspectRatio: "16/9" }}>
              <iframe src={project.matterportUrl} className="w-full h-full border-0" allowFullScreen allow="xr-spatial-tracking" />
            </div>
          </section>
        </ScrollReveal>
      )}

      {/* Categories */}
      {orderedGroups.map((group, gIdx) => {
        const sectionId = `cat-${String(gIdx + 1).padStart(2, "0")}`;
        return (
          <div key={group.parentName} id={sectionId}>
            <ScrollReveal distance={20}>
              <SectionBreak number={String(gIdx + 1).padStart(2, "0")} title={group.parentName} />
            </ScrollReveal>

            <section className="max-w-[1300px] mx-auto px-10 pb-20">
              {[...group.subs.entries()].map(([subName, subItems]) => (
                <div key={subName} className="mb-12 last:mb-0">
                  {group.subs.size > 1 || subName !== "General" ? (
                    <ScrollReveal>
                      <h3
                        className="text-xs uppercase tracking-[.3em] mb-5 pb-3 border-b"
                        style={{ color: "#c4a265", borderColor: "rgba(196,162,101,.15)" }}
                      >
                        {subName}
                      </h3>
                    </ScrollReveal>
                  ) : null}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {subItems.map((item, idx) => (
                      <ScrollReveal key={item.id} delay={idx % 3 * 120}>
                        <div id={`item-${item.id}`}>
                          <ProductCard item={item} />
                        </div>
                      </ScrollReveal>
                    ))}
                  </div>
                </div>
              ))}
            </section>
          </div>
        );
      })}

      {uncategorized.length > 0 && (
        <div id="cat-uncategorized">
          <SectionBreak number={String(orderedGroups.length + 1).padStart(2, "0")} title="Uncategorized" />
          <section className="max-w-[1300px] mx-auto px-10 pb-20">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {uncategorized.map((item, idx) => (
                <ScrollReveal key={item.id} delay={idx % 3 * 120}>
                  <div id={`item-${item.id}`}>
                    <ProductCard item={item} />
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </section>
        </div>
      )}

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
