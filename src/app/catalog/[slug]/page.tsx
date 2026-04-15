import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import CoverSection from "@/components/catalog/CoverSection";
import SectionBreak from "@/components/catalog/SectionBreak";
import ProductCard from "@/components/catalog/ProductCard";
import CatalogNav from "@/components/catalog/CatalogNav";
import CatalogSearch, { type SearchableItem } from "@/components/catalog/CatalogSearch";
import ScrollReveal from "@/components/catalog/ScrollReveal";
import CategorySection from "@/components/catalog/CategorySection";

export default async function CatalogPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const project = await prisma.project.findUnique({
    where: { slug, published: true },
  });

  if (!project) notFound();

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

  // Group items by parent category → subcategory
  type ItemRow = (typeof items)[number];
  const groups = new Map<
    string,
    { parentName: string; parentSort: number; subs: Map<string, ItemRow[]> }
  >();
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

  // Nav sections
  const navSections = orderedGroups.map((g, i) => ({
    id: `cat-${String(i + 1).padStart(2, "0")}`,
    number: String(i + 1).padStart(2, "0"),
    title: g.parentName,
  }));

  // Searchable items
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

  // Count total items per parent for subtitle
  const groupItemCount = (subs: Map<string, ItemRow[]>) =>
    [...subs.values()].reduce((n, arr) => n + arr.length, 0);

  return (
    <div style={{ background: "#0a0a0e", color: "#bbb", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <CatalogNav sections={navSections} />
      <CatalogSearch items={searchItems} />

      <CoverSection project={project} />

      {/* Matterport */}
      {project.matterportUrl && (
        <ScrollReveal>
          <section className="max-w-[1300px] mx-auto px-6 sm:px-10 py-16">
            <h2
              className="text-3xl font-light mb-2"
              style={{ fontFamily: "'Cormorant Garamond', serif", color: "#eee" }}
            >
              Explore in 3D
            </h2>
            <div
              className="rounded-2xl overflow-hidden border mt-6"
              style={{
                borderColor: "rgba(255,255,255,.08)",
                boxShadow: "0 40px 80px rgba(0,0,0,.4)",
                aspectRatio: "16/9",
              }}
            >
              <iframe
                src={project.matterportUrl}
                className="w-full h-full border-0"
                allowFullScreen
                allow="xr-spatial-tracking"
              />
            </div>
          </section>
        </ScrollReveal>
      )}

      {/* ── Category groups ── */}
      {orderedGroups.map((group, gIdx) => {
        const sectionId = `cat-${String(gIdx + 1).padStart(2, "0")}`;
        const totalItems = groupItemCount(group.subs);
        const subCount = group.subs.size;

        // Build serialisable sub-categories for CategorySection
        const subCategories = [...group.subs.entries()].map(([subName, subItems]) => ({
          name: subName,
          items: subItems.map((it) => ({
            id: it.id,
            name: it.name,
            category: it.category,
            roomLocation: it.roomLocation,
            description: it.description,
            finishType: it.finishType,
            vendorName: it.vendorName,
            vendorContact: it.vendorContact,
            vendorPhone: it.vendorPhone,
            vendorRef: it.vendorRef,
            videoUrl: it.videoUrl,
            pdfUrl: it.pdfUrl,
            specs: it.specs.map((s) => ({ id: s.id, label: s.label, value: s.value })),
            images: it.images.map((img) => ({ id: img.id, url: img.url, altText: img.altText })),
            subCategory: subName,
          })),
        }));

        return (
          <div key={group.parentName} id={sectionId}>
            <ScrollReveal distance={20}>
              <SectionBreak
                number={String(gIdx + 1).padStart(2, "0")}
                title={group.parentName}
                subtitle={`${totalItems} item${totalItems !== 1 ? "s" : ""}${subCount > 1 ? ` · ${subCount} subcategories` : ""}`}
              />
            </ScrollReveal>

            <CategorySection subCategories={subCategories} sectionNumber={String(gIdx + 1).padStart(2, "0")} />
          </div>
        );
      })}

      {/* Uncategorized */}
      {uncategorized.length > 0 && (
        <div id="cat-uncategorized">
          <SectionBreak
            number={String(orderedGroups.length + 1).padStart(2, "0")}
            title="Other"
            subtitle={`${uncategorized.length} item${uncategorized.length !== 1 ? "s" : ""}`}
          />
          <section className="max-w-[1200px] mx-auto px-6 sm:px-10 lg:px-16 pb-24">
            <div className="space-y-0">
              {uncategorized.map((item, idx) => (
                <ScrollReveal key={item.id} delay={(idx % 4) * 80}>
                  <div id={`item-${item.id}`}>
                    <ProductCard item={item} index={idx} sectionNumber={String(orderedGroups.length + 1).padStart(2, "0")} />
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* Footer */}
      <footer className="py-20 border-t" style={{ borderColor: "rgba(255,255,255,.05)" }}>
        <div className="max-w-[900px] mx-auto px-6 text-center">
          {/* Disclaimer — first */}
          <div className="mx-auto max-w-[760px] mb-16">
            <p
              className="text-[10px] uppercase tracking-[.35em] mb-5"
              style={{ color: "#c4a265", fontWeight: 600 }}
            >
              Disclaimer
            </p>
            <p
              className="text-[17px] md:text-[19px] italic leading-[1.7]"
              style={{ color: "#b8b8b8", fontFamily: "'Cormorant Garamond', serif" }}
            >
              All descriptions, plans, finishes, features, and options are subject to change,
              modification, or substitution at the builder&rsquo;s sole discretion without prior notice.
            </p>
          </div>

          {/* Brand — below disclaimer */}
          <div className="pt-12" style={{ borderTop: "1px solid rgba(255,255,255,.06)" }}>
            <h3
              className="text-2xl font-light"
              style={{ fontFamily: "'Cormorant Garamond', serif", color: "#c4a265" }}
            >
              Omega Custom Homes
            </h3>
            <p className="text-xs mt-2" style={{ color: "#666" }}>
              {project.name} &bull; {project.address}
            </p>
            <p className="text-[10px] mt-2 tracking-[.3em] uppercase" style={{ color: "#555" }}>
              Confidential
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
