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
}

export default function CategorySection({ subCategories }: Props) {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const allItems = subCategories.flatMap((s) => s.items);
  const hasMultipleSubs = subCategories.length > 1;
  const showChips = hasMultipleSubs && allItems.length > 2;

  const visibleItems = activeFilter
    ? subCategories.find((s) => s.name === activeFilter)?.items ?? []
    : allItems;

  return (
    <section className="max-w-[1300px] mx-auto px-6 sm:px-10 pb-20">
      {/* ── Subcategory filter chips ── */}
      {showChips && (
        <ScrollReveal>
          <div className="flex flex-wrap gap-2 mb-8">
            <button
              onClick={() => setActiveFilter(null)}
              className="text-[9px] px-3.5 py-2 rounded-full tracking-[.18em] uppercase"
              style={{
                background: activeFilter === null ? "rgba(196,162,101,.1)" : "rgba(255,255,255,.02)",
                color: activeFilter === null ? "#c4a265" : "#444",
                border: `1px solid ${activeFilter === null ? "rgba(196,162,101,.15)" : "rgba(255,255,255,.04)"}`,
              }}
            >
              All ({allItems.length})
            </button>
            {subCategories.map((sub) => (
              <button
                key={sub.name}
                onClick={() => setActiveFilter(activeFilter === sub.name ? null : sub.name)}
                className="text-[9px] px-3.5 py-2 rounded-full tracking-[.18em] uppercase"
                style={{
                  background: activeFilter === sub.name ? "rgba(196,162,101,.1)" : "rgba(255,255,255,.02)",
                  color: activeFilter === sub.name ? "#c4a265" : "#444",
                  border: `1px solid ${activeFilter === sub.name ? "rgba(196,162,101,.15)" : "rgba(255,255,255,.04)"}`,
                }}
              >
                {sub.name} ({sub.items.length})
              </button>
            ))}
          </div>
        </ScrollReveal>
      )}

      {/* ── Compact single-sub label (when only one sub with a meaningful name) ── */}
      {!showChips && hasMultipleSubs && subCategories.map((sub) => (
        <div key={sub.name} className="mb-8 last:mb-0">
          <ScrollReveal>
            <h3
              className="text-xs uppercase tracking-[.3em] mb-5 pb-3 border-b"
              style={{ color: "#c4a265", borderColor: "rgba(196,162,101,.12)" }}
            >
              {sub.name}
            </h3>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {sub.items.map((item, idx) => (
              <ScrollReveal key={item.id} delay={idx % 3 * 100}>
                <div id={`item-${item.id}`}>
                  <ProductCard item={item} />
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      ))}

      {/* ── Unified grid (single sub or filtered view) ── */}
      {(showChips || !hasMultipleSubs) && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {visibleItems.map((item, idx) => (
            <ScrollReveal key={item.id} delay={idx % 3 * 100}>
              <div id={`item-${item.id}`}>
                <ProductCard item={item} />
              </div>
            </ScrollReveal>
          ))}
        </div>
      )}
    </section>
  );
}
