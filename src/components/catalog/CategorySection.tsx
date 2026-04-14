"use client";

import { useState } from "react";
import ProductCard from "./ProductCard";
import ScrollReveal from "./ScrollReveal";

interface Spec {
  id: string;
  label: string;
  value: string;
}

interface Image {
  id: string;
  url: string;
  altText: string | null;
}

interface CategoryItem {
  id: string;
  name: string;
  category: string | null;
  roomLocation: string | null;
  description: string | null;
  finishType: string | null;
  vendorName: string | null;
  vendorContact: string | null;
  vendorPhone: string | null;
  vendorRef: string | null;
  videoUrl: string | null;
  pdfUrl: string | null;
  specs: Spec[];
  images: Image[];
  subCategory: string;
}

interface Props {
  subCategories: { name: string; items: CategoryItem[] }[];
  sectionNumber?: string;
}

export default function CategorySection({ subCategories, sectionNumber = "01" }: Props) {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const allItems = subCategories.flatMap((s) => s.items);
  const hasMultipleSubs = subCategories.length > 1;
  const showChips = hasMultipleSubs && allItems.length > 2;

  const visibleItems = activeFilter
    ? subCategories.find((s) => s.name === activeFilter)?.items ?? []
    : allItems;

  return (
    <section className="max-w-[1200px] mx-auto px-6 sm:px-10 lg:px-16 pb-24">
      {/* ── Subcategory filter chips ── */}
      {showChips && (
        <ScrollReveal>
          <div className="flex flex-wrap gap-2 mb-12 pb-6" style={{ borderBottom: "1px solid rgba(255,255,255,.04)" }}>
            <button
              onClick={() => setActiveFilter(null)}
              className="text-[9px] px-3.5 py-2 rounded-full tracking-[.22em] uppercase"
              style={{
                background: activeFilter === null ? "rgba(196,162,101,.1)" : "transparent",
                color: activeFilter === null ? "#c4a265" : "#555",
                border: `1px solid ${activeFilter === null ? "rgba(196,162,101,.18)" : "rgba(255,255,255,.04)"}`,
                fontWeight: 600,
              }}
            >
              All <span style={{ opacity: .5 }}>· {allItems.length}</span>
            </button>
            {subCategories.map((sub) => (
              <button
                key={sub.name}
                onClick={() => setActiveFilter(activeFilter === sub.name ? null : sub.name)}
                className="text-[9px] px-3.5 py-2 rounded-full tracking-[.22em] uppercase"
                style={{
                  background: activeFilter === sub.name ? "rgba(196,162,101,.1)" : "transparent",
                  color: activeFilter === sub.name ? "#c4a265" : "#555",
                  border: `1px solid ${activeFilter === sub.name ? "rgba(196,162,101,.18)" : "rgba(255,255,255,.04)"}`,
                  fontWeight: 600,
                }}
              >
                {sub.name} <span style={{ opacity: .5 }}>· {sub.items.length}</span>
              </button>
            ))}
          </div>
        </ScrollReveal>
      )}

      {/* ── Single-sub sections with headers ── */}
      {!showChips && hasMultipleSubs && subCategories.map((sub) => (
        <div key={sub.name} className="mb-16 last:mb-0">
          <ScrollReveal>
            <div className="flex items-center gap-4 mb-10">
              <span className="h-px flex-1" style={{ background: "rgba(196,162,101,.15)" }} />
              <h3
                className="text-xs uppercase tracking-[.35em]"
                style={{ color: "#c4a265", fontWeight: 600 }}
              >
                {sub.name}
              </h3>
              <span className="h-px flex-1" style={{ background: "rgba(196,162,101,.15)" }} />
            </div>
          </ScrollReveal>
          <div className="space-y-0">
            {sub.items.map((item, idx) => (
              <ScrollReveal key={item.id} delay={idx * 80}>
                <div id={`item-${item.id}`}>
                  <ProductCard item={item} index={idx} sectionNumber={sectionNumber} />
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      ))}

      {/* ── Unified single-column editorial list ── */}
      {(showChips || !hasMultipleSubs) && (
        <div className="space-y-0">
          {visibleItems.map((item, idx) => (
            <ScrollReveal key={item.id} delay={(idx % 4) * 80}>
              <div id={`item-${item.id}`}>
                <ProductCard item={item} index={idx} sectionNumber={sectionNumber} />
              </div>
            </ScrollReveal>
          ))}
        </div>
      )}
    </section>
  );
}
