"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

interface Spec {
  id: string;
  label: string;
  value: string;
}

interface ItemImage {
  url: string;
}

export interface AdminItem {
  id: string;
  name: string;
  category: string | null;
  finishType: string | null;
  roomLocation: string | null;
  vendorName: string | null;
  specs: Spec[];
  images: ItemImage[];
}

function getSwatch(finishType: string | null): string {
  const f = (finishType || "").toLowerCase();
  if (f.includes("gold")) return "linear-gradient(135deg,#1f1a0a,#30280e)";
  if (f.includes("nickel")) return "linear-gradient(135deg,#16181a,#1e2226)";
  if (f.includes("black")) return "linear-gradient(135deg,#0e0e10,#161618)";
  if (f.includes("brass")) return "linear-gradient(135deg,#18150a,#25200d)";
  return "linear-gradient(135deg,#111,#1a1a1a)";
}

export default function ItemsFilterGrid({
  items,
  projectId,
  sectionId,
}: {
  items: AdminItem[];
  projectId: string;
  sectionId: string;
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => {
      const haystack = [
        item.name,
        item.category,
        item.finishType,
        item.roomLocation,
        item.vendorName,
        ...item.specs.flatMap((s) => [s.label, s.value]),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [items, query]);

  return (
    <>
      <div className="mb-5 flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#888"
            strokeWidth="2"
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.3-4.3" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter by name, category, finish, room, vendor, specs…"
            className="w-full pl-9 pr-9 py-2 rounded-lg text-sm outline-none focus:ring-1 focus:ring-[#c4a265]"
            style={{
              background: "rgba(255,255,255,.06)",
              border: "1px solid rgba(255,255,255,.08)",
              color: "#eee",
            }}
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full text-xs"
              style={{ color: "#888", background: "rgba(255,255,255,.05)" }}
              aria-label="Clear"
            >
              ×
            </button>
          )}
        </div>
        <span className="text-[10px] uppercase tracking-widest" style={{ color: "#666" }}>
          {filtered.length} of {items.length}
        </span>
      </div>

      {filtered.length === 0 ? (
        <div
          className="rounded-xl border p-10 text-center text-xs uppercase tracking-widest"
          style={{ background: "rgba(255,255,255,.03)", borderColor: "rgba(255,255,255,.06)", color: "#666" }}
        >
          No items match &ldquo;{query}&rdquo;
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => (
            <Link
              key={item.id}
              href={`/admin/projects/${projectId}/sections/${sectionId}/items/${item.id}`}
              className="rounded-xl overflow-hidden border hover:border-[rgba(196,162,101,.25)] group"
              style={{ background: "rgba(255,255,255,.06)", borderColor: "rgba(255,255,255,.1)" }}
            >
              <div className="h-32 relative" style={{ background: getSwatch(item.finishType) }}>
                {item.images[0] && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.images[0].url} alt={item.name} className="w-full h-full object-cover" />
                )}
                {item.category && (
                  <span
                    className="absolute top-2 right-2 text-[9px] px-2 py-0.5 rounded tracking-wider uppercase"
                    style={{ background: "rgba(0,0,0,.6)", color: "#c4a265", border: "1px solid rgba(196,162,101,.15)" }}
                  >
                    {item.category}
                  </span>
                )}
                {item.roomLocation && (
                  <span
                    className="absolute bottom-2 left-2 text-[9px] px-2 py-0.5 rounded tracking-wide"
                    style={{ background: "rgba(0,0,0,.6)", color: "#bbb" }}
                  >
                    {item.roomLocation}
                  </span>
                )}
              </div>

              <div className="p-4">
                <h4 className="text-sm group-hover:text-[#c4a265]" style={{ color: "#eee" }}>
                  {item.name}
                </h4>
                {item.finishType && (
                  <p className="text-[11px] mt-1" style={{ color: "#c4a265" }}>
                    {item.finishType}
                  </p>
                )}
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
                  <p
                    className="text-[10px] mt-2 pt-2 border-t uppercase tracking-wide"
                    style={{ color: "#777", borderColor: "rgba(255,255,255,.08)" }}
                  >
                    {item.vendorName}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
