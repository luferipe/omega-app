"use client";

import { useState, useEffect, useRef } from "react";

export interface SearchableItem {
  id: string;
  name: string;
  category: string | null;
  roomLocation: string | null;
  vendorName: string | null;
  finishType: string | null;
  imageUrl: string | null;
  parentCategory: string;
}

export default function CatalogSearch({ items }: { items: SearchableItem[] }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [highlightIdx, setHighlightIdx] = useState(0);

  /* ⌘K / Ctrl+K to open */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /* Lock body scroll & autofocus */
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      setTimeout(() => inputRef.current?.focus(), 60);
    } else {
      document.body.style.overflow = "";
      setQuery("");
      setHighlightIdx(0);
    }
  }, [open]);

  /* Filter */
  const q = query.toLowerCase().trim();
  const filtered =
    q.length < 2
      ? []
      : items.filter(
          (it) =>
            it.name.toLowerCase().includes(q) ||
            it.category?.toLowerCase().includes(q) ||
            it.roomLocation?.toLowerCase().includes(q) ||
            it.vendorName?.toLowerCase().includes(q) ||
            it.finishType?.toLowerCase().includes(q) ||
            it.parentCategory.toLowerCase().includes(q),
        );

  /* Group results by parent category */
  const grouped: { parent: string; items: typeof filtered }[] = [];
  const seen = new Map<string, number>();
  for (const it of filtered) {
    const idx = seen.get(it.parentCategory);
    if (idx !== undefined) {
      grouped[idx].items.push(it);
    } else {
      seen.set(it.parentCategory, grouped.length);
      grouped.push({ parent: it.parentCategory, items: [it] });
    }
  }

  const flatResults = filtered; // for keyboard nav
  const clampedIdx = Math.min(highlightIdx, flatResults.length - 1);

  const navigateToItem = (item: SearchableItem) => {
    setOpen(false);
    const el = document.getElementById(`item-${item.id}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("search-highlight");
      setTimeout(() => el.classList.remove("search-highlight"), 2200);
    }
  };

  /* Keyboard navigation */
  const onInputKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIdx((i) => Math.min(i + 1, flatResults.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && flatResults[clampedIdx]) {
      navigateToItem(flatResults[clampedIdx]);
    }
  };

  return (
    <>
      {/* ── Trigger button (top-right) ── */}
      <button
        onClick={() => setOpen(true)}
        className="fixed top-6 right-6 z-40 flex items-center gap-2.5 px-4 py-2.5 rounded-full group"
        style={{
          background: "rgba(10,10,14,.85)",
          border: "1px solid rgba(255,255,255,.06)",
          backdropFilter: "blur(16px)",
          boxShadow: "0 4px 24px rgba(0,0,0,.3)",
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c4a265" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        <span className="text-[10px] tracking-[.2em] uppercase hidden sm:inline" style={{ color: "#555" }}>
          Search
        </span>
        <kbd
          className="text-[9px] px-1.5 py-0.5 rounded hidden sm:inline"
          style={{ background: "rgba(255,255,255,.06)", color: "#444", fontFamily: "inherit" }}
        >
          ⌘K
        </kbd>
      </button>

      {/* ── Search overlay ── */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] px-4"
          style={{ background: "rgba(0,0,0,.8)", backdropFilter: "blur(24px)" }}
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-[640px] rounded-2xl overflow-hidden"
            style={{
              background: "#111114",
              border: "1px solid rgba(196,162,101,.12)",
              boxShadow: "0 40px 120px rgba(0,0,0,.7), 0 0 0 1px rgba(196,162,101,.04)",
              animation: "searchIn .25s cubic-bezier(.22,1,.36,1)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Input row */}
            <div
              className="flex items-center gap-3 px-5 py-4"
              style={{ borderBottom: "1px solid rgba(255,255,255,.06)" }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c4a265" strokeWidth="2" className="flex-shrink-0">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setHighlightIdx(0);
                }}
                onKeyDown={onInputKey}
                placeholder="Search items, categories, vendors…"
                className="flex-1 bg-transparent text-[15px] outline-none placeholder:text-[#333]"
                style={{ color: "#eee", caretColor: "#c4a265" }}
              />
              {query && (
                <span className="text-[10px] tabular-nums" style={{ color: "#444" }}>
                  {filtered.length} result{filtered.length !== 1 ? "s" : ""}
                </span>
              )}
              <kbd
                className="text-[10px] px-2 py-1 rounded cursor-pointer flex-shrink-0"
                style={{ background: "rgba(255,255,255,.05)", color: "#444" }}
                onClick={() => setOpen(false)}
              >
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div className="max-h-[55vh] overflow-y-auto overscroll-contain">
              {q.length > 0 && q.length < 2 && (
                <p className="text-center py-12 text-sm" style={{ color: "#333" }}>
                  Type at least 2 characters…
                </p>
              )}

              {q.length >= 2 && filtered.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-sm" style={{ color: "#444" }}>
                    No items found for &ldquo;{query}&rdquo;
                  </p>
                  <p className="text-xs mt-1" style={{ color: "#2a2a2a" }}>
                    Try a different keyword
                  </p>
                </div>
              )}

              {grouped.map((group) => (
                <div key={group.parent} className="py-1">
                  <p
                    className="text-[9px] uppercase tracking-[.25em] px-5 py-2 sticky top-0"
                    style={{ color: "#c4a265", background: "rgba(17,17,20,.95)", backdropFilter: "blur(8px)" }}
                  >
                    {group.parent}
                  </p>
                  {group.items.map((item) => {
                    const globalIdx = flatResults.indexOf(item);
                    const highlighted = globalIdx === clampedIdx;
                    return (
                      <button
                        key={item.id}
                        onClick={() => navigateToItem(item)}
                        onMouseEnter={() => setHighlightIdx(globalIdx)}
                        className="w-full flex items-center gap-3.5 px-5 py-3 text-left"
                        style={{
                          background: highlighted ? "rgba(196,162,101,.06)" : "transparent",
                        }}
                      >
                        {item.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.imageUrl}
                            alt=""
                            className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                            style={{ border: "1px solid rgba(255,255,255,.06)" }}
                          />
                        ) : (
                          <div
                            className="w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center text-[10px]"
                            style={{ background: "rgba(255,255,255,.03)", color: "#333" }}
                          >
                            {item.name.charAt(0)}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm truncate" style={{ color: highlighted ? "#eee" : "#bbb" }}>
                            {item.name}
                          </p>
                          <p className="text-[10px] truncate mt-0.5" style={{ color: "#444" }}>
                            {[item.category, item.roomLocation, item.vendorName].filter(Boolean).join(" · ")}
                          </p>
                        </div>
                        {highlighted && (
                          <span className="flex-shrink-0 text-[9px] px-2 py-0.5 rounded" style={{ color: "#555", background: "rgba(255,255,255,.04)" }}>
                            ↵
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}

              {/* Quick hint when empty */}
              {q.length === 0 && (
                <div className="py-10 text-center space-y-3">
                  <p className="text-xs" style={{ color: "#333" }}>
                    Quick suggestions
                  </p>
                  <div className="flex flex-wrap justify-center gap-2 px-6">
                    {["Kitchen", "Patio", "Tile", "Fireplace", "Pool", "Gold"].map((tag) => (
                      <button
                        key={tag}
                        onClick={() => setQuery(tag)}
                        className="text-[10px] px-3 py-1.5 rounded-full"
                        style={{ background: "rgba(196,162,101,.06)", color: "#c4a265", border: "1px solid rgba(196,162,101,.1)" }}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
