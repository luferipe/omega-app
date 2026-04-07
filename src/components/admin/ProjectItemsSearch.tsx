"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

export interface ProjectSearchItem {
  id: string;
  name: string;
  category: string | null;
  finishType: string | null;
  roomLocation: string | null;
  vendorName: string | null;
  sectionId: string;
  sectionName: string;
  thumbnail: string | null;
  specs: { label: string; value: string }[];
}

export default function ProjectItemsSearch({
  items,
  projectId,
}: {
  items: ProjectSearchItem[];
  projectId: string;
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return items
      .filter((item) => {
        const hay = [
          item.name,
          item.category,
          item.finishType,
          item.roomLocation,
          item.vendorName,
          item.sectionName,
          ...item.specs.flatMap((s) => [s.label, s.value]),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return hay.includes(q);
      })
      .slice(0, 60);
  }, [items, query]);

  const active = query.trim().length > 0;

  return (
    <div className="mb-8">
      <div className="relative max-w-xl">
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
          placeholder={`Search ${items.length} items across sections…`}
          className="w-full pl-9 pr-9 py-2.5 rounded-lg text-sm outline-none focus:ring-1 focus:ring-[#c4a265]"
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

      {active && (
        <div className="mt-4">
          <p className="text-[10px] uppercase tracking-widest mb-3" style={{ color: "#666" }}>
            {filtered.length} result{filtered.length === 1 ? "" : "s"}
          </p>
          {filtered.length === 0 ? (
            <div
              className="rounded-xl border p-6 text-center text-xs uppercase tracking-widest"
              style={{ background: "rgba(255,255,255,.03)", borderColor: "rgba(255,255,255,.06)", color: "#666" }}
            >
              No items match &ldquo;{query}&rdquo;
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filtered.map((item) => (
                <Link
                  key={item.id}
                  href={`/admin/projects/${projectId}/sections/${item.sectionId}/items/${item.id}`}
                  className="flex items-center gap-3 p-3 rounded-xl border hover:border-[rgba(196,162,101,.3)] group"
                  style={{ background: "rgba(255,255,255,.04)", borderColor: "rgba(255,255,255,.08)" }}
                >
                  <div
                    className="w-14 h-14 rounded-lg flex-shrink-0 overflow-hidden"
                    style={{ background: "linear-gradient(135deg,#111,#1a1a1a)" }}
                  >
                    {item.thumbnail && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.thumbnail} alt={item.name} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate group-hover:text-[#c4a265]" style={{ color: "#eee" }}>
                      {item.name}
                    </p>
                    <p className="text-[10px] uppercase tracking-wider truncate" style={{ color: "#888" }}>
                      {item.sectionName}
                      {item.category ? ` · ${item.category}` : ""}
                    </p>
                    {(item.finishType || item.roomLocation) && (
                      <p className="text-[10px] mt-0.5 truncate" style={{ color: "#666" }}>
                        {[item.finishType, item.roomLocation].filter(Boolean).join(" · ")}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
