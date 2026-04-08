"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ProjectSearchItem } from "./ProjectItemsSearch";

export interface CategoryBreakdownEntry {
  id: string | null; // null = Uncategorized
  name: string;
  count: number;
}

export default function ProjectCategoryBrowser({
  categories,
  items,
  projectId,
}: {
  categories: CategoryBreakdownEntry[];
  items: (ProjectSearchItem & { parentCategoryId: string | null })[];
  projectId: string;
}) {
  const [selectedId, setSelectedId] = useState<string | null | undefined>(undefined);

  const selectedItems = useMemo(() => {
    if (selectedId === undefined) return [];
    return items.filter((it) => it.parentCategoryId === selectedId);
  }, [items, selectedId]);

  const selectedCategory = useMemo(
    () => categories.find((c) => c.id === selectedId),
    [categories, selectedId],
  );

  return (
    <div
      className="mb-10 p-5 rounded-xl border"
      style={{ background: "rgba(255,255,255,.04)", borderColor: "rgba(255,255,255,.08)" }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs uppercase tracking-widest" style={{ color: "#c4a265" }}>
          By Category
        </h3>
        <Link
          href="/admin/categories"
          className="text-[10px] uppercase tracking-wider"
          style={{ color: "#888" }}
        >
          Manage →
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {categories.map((c) => {
          const active = c.id === selectedId;
          const isUncat = c.id === null;
          return (
            <button
              key={c.id ?? "__uncat__"}
              type="button"
              onClick={() => setSelectedId(active ? undefined : c.id)}
              className="flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors"
              style={{
                background: active
                  ? isUncat
                    ? "rgba(248,113,113,.18)"
                    : "rgba(196,162,101,.18)"
                  : isUncat
                    ? "rgba(248,113,113,.06)"
                    : "rgba(196,162,101,.06)",
                border: `1px solid ${
                  active
                    ? isUncat
                      ? "rgba(248,113,113,.4)"
                      : "rgba(196,162,101,.45)"
                    : isUncat
                      ? "rgba(248,113,113,.12)"
                      : "rgba(196,162,101,.12)"
                }`,
              }}
            >
              <span className="text-xs" style={{ color: isUncat ? "#bbb" : "#ddd" }}>
                {c.name}
              </span>
              <span
                className="text-[10px] font-mono px-1.5 py-0.5 rounded"
                style={{
                  background: isUncat ? "rgba(248,113,113,.15)" : "rgba(196,162,101,.15)",
                  color: isUncat ? "#f87171" : "#c4a265",
                }}
              >
                {c.count}
              </span>
            </button>
          );
        })}
      </div>

      {selectedId !== undefined && (
        <div className="mt-5 pt-5 border-t" style={{ borderColor: "rgba(255,255,255,.08)" }}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] uppercase tracking-widest" style={{ color: "#666" }}>
              {selectedCategory?.name} · {selectedItems.length} item
              {selectedItems.length === 1 ? "" : "s"}
            </p>
            <button
              type="button"
              onClick={() => setSelectedId(undefined)}
              className="text-[10px] uppercase tracking-wider"
              style={{ color: "#888" }}
            >
              Close ×
            </button>
          </div>

          {selectedItems.length === 0 ? (
            <div
              className="rounded-xl border p-6 text-center text-xs uppercase tracking-widest"
              style={{
                background: "rgba(255,255,255,.03)",
                borderColor: "rgba(255,255,255,.06)",
                color: "#666",
              }}
            >
              No items in this category
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {selectedItems.map((item) => (
                <Link
                  key={item.id}
                  href={`/admin/projects/${projectId}/sections/${item.sectionId}/items/${item.id}`}
                  className="flex items-center gap-3 p-3 rounded-xl border hover:border-[rgba(196,162,101,.3)] group"
                  style={{
                    background: "rgba(255,255,255,.04)",
                    borderColor: "rgba(255,255,255,.08)",
                  }}
                >
                  <div
                    className="w-14 h-14 rounded-lg flex-shrink-0 overflow-hidden"
                    style={{ background: "linear-gradient(135deg,#111,#1a1a1a)" }}
                  >
                    {item.thumbnail && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.thumbnail}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm truncate group-hover:text-[#c4a265]"
                      style={{ color: "#eee" }}
                    >
                      {item.name}
                    </p>
                    <p
                      className="text-[10px] uppercase tracking-wider truncate"
                      style={{ color: "#888" }}
                    >
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
