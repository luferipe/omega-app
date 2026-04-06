"use client";

import { useState } from "react";

interface Sub {
  id: string;
  name: string;
  itemCount: number;
}

interface Cat {
  id: string;
  name: string;
  itemCount: number;
  children: Sub[];
}

const cardStyle = {
  background: "rgba(255,255,255,.06)",
  borderColor: "rgba(255,255,255,.1)",
};

const inputStyle = {
  background: "rgba(255,255,255,.06)",
  border: "1px solid rgba(255,255,255,.06)",
  color: "#eee",
};

export default function CategoryManager({
  categories,
  createAction,
  renameAction,
  deleteAction,
}: {
  categories: Cat[];
  createAction: (fd: FormData) => void;
  renameAction: (fd: FormData) => void;
  deleteAction: (fd: FormData) => void;
}) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [editing, setEditing] = useState<string | null>(null);
  const [addingSubTo, setAddingSubTo] = useState<string | null>(null);

  function toggle(id: string) {
    const next = new Set(expanded);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpanded(next);
  }

  return (
    <div className="space-y-6">
      {/* Add new top-level category */}
      <form action={createAction} className="p-5 rounded-xl border flex gap-3 items-end" style={cardStyle}>
        <div className="flex-1">
          <label className="block text-[10px] uppercase tracking-widest mb-1.5" style={{ color: "#aaa" }}>
            New Category
          </label>
          <input
            name="name"
            placeholder="Category name"
            required
            className="w-full px-3 py-2 rounded-lg text-sm outline-none focus:ring-1 focus:ring-[#c4a265]"
            style={inputStyle}
          />
        </div>
        <button
          type="submit"
          className="px-5 py-2 rounded-lg text-xs font-medium tracking-wider uppercase"
          style={{ background: "#c4a265", color: "#060606" }}
        >
          + Add
        </button>
      </form>

      {/* List */}
      <div className="rounded-xl border overflow-hidden" style={cardStyle}>
        {categories.length === 0 ? (
          <p className="p-6 text-sm text-center" style={{ color: "#666" }}>
            No categories yet
          </p>
        ) : (
          categories.map((cat) => {
            const isExpanded = expanded.has(cat.id);
            const isEditing = editing === cat.id;
            const isAdding = addingSubTo === cat.id;

            return (
              <div key={cat.id} className="border-b last:border-b-0" style={{ borderColor: "rgba(255,255,255,.06)" }}>
                {/* Parent row */}
                <div className="flex items-center gap-3 px-5 py-3 hover:bg-white/[.02]">
                  <button
                    type="button"
                    onClick={() => toggle(cat.id)}
                    className="text-xs w-5 h-5 flex items-center justify-center rounded"
                    style={{ color: "#c4a265" }}
                  >
                    {isExpanded ? "−" : "+"}
                  </button>

                  {isEditing ? (
                    <form action={renameAction} className="flex-1 flex gap-2">
                      <input type="hidden" name="id" value={cat.id} />
                      <input
                        name="name"
                        defaultValue={cat.name}
                        autoFocus
                        className="flex-1 px-2 py-1 rounded text-sm outline-none"
                        style={inputStyle}
                      />
                      <button type="submit" className="text-[10px] px-2 py-1 rounded uppercase" style={{ background: "#c4a265", color: "#060606" }}>
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditing(null)}
                        className="text-[10px] px-2 py-1 rounded uppercase"
                        style={{ color: "#888" }}
                      >
                        Cancel
                      </button>
                    </form>
                  ) : (
                    <>
                      <span className="flex-1 text-sm" style={{ color: "#eee" }}>
                        {cat.name}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded" style={{ background: "rgba(196,162,101,.1)", color: "#c4a265" }}>
                        {cat.children.length} sub
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded" style={{ background: "rgba(255,255,255,.05)", color: "#888" }}>
                        {cat.itemCount} items
                      </span>
                      <button
                        type="button"
                        onClick={() => setAddingSubTo(isAdding ? null : cat.id)}
                        className="text-[10px] px-2 py-1 rounded uppercase tracking-wider"
                        style={{ color: "#c4a265" }}
                      >
                        + Sub
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditing(cat.id)}
                        className="text-[10px] px-2 py-1 rounded uppercase tracking-wider"
                        style={{ color: "#888" }}
                      >
                        Edit
                      </button>
                      <form action={deleteAction}>
                        <input type="hidden" name="id" value={cat.id} />
                        <button
                          type="submit"
                          onClick={(e) => {
                            if (!confirm(`Delete "${cat.name}" and ${cat.children.length} subcategories? Items will be uncategorized.`)) {
                              e.preventDefault();
                            }
                          }}
                          className="text-[10px] px-2 py-1 rounded uppercase tracking-wider"
                          style={{ color: "#f87171" }}
                        >
                          Delete
                        </button>
                      </form>
                    </>
                  )}
                </div>

                {/* Add subcategory inline */}
                {isAdding && (
                  <form
                    action={(fd) => {
                      createAction(fd);
                      setAddingSubTo(null);
                    }}
                    className="flex gap-2 px-5 py-3 pl-12"
                    style={{ background: "rgba(196,162,101,.04)" }}
                  >
                    <input type="hidden" name="parentId" value={cat.id} />
                    <input
                      name="name"
                      placeholder="Subcategory name"
                      autoFocus
                      required
                      className="flex-1 px-2 py-1 rounded text-sm outline-none"
                      style={inputStyle}
                    />
                    <button type="submit" className="text-[10px] px-3 py-1 rounded uppercase" style={{ background: "#c4a265", color: "#060606" }}>
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => setAddingSubTo(null)}
                      className="text-[10px] px-3 py-1 rounded uppercase"
                      style={{ color: "#888" }}
                    >
                      Cancel
                    </button>
                  </form>
                )}

                {/* Children */}
                {isExpanded && cat.children.length > 0 && (
                  <div className="pl-12" style={{ background: "rgba(0,0,0,.2)" }}>
                    {cat.children.map((sub) => {
                      const subEditing = editing === sub.id;
                      return (
                        <div key={sub.id} className="flex items-center gap-3 px-5 py-2 border-t" style={{ borderColor: "rgba(255,255,255,.04)" }}>
                          <span style={{ color: "#666" }}>↳</span>
                          {subEditing ? (
                            <form action={renameAction} className="flex-1 flex gap-2">
                              <input type="hidden" name="id" value={sub.id} />
                              <input
                                name="name"
                                defaultValue={sub.name}
                                autoFocus
                                className="flex-1 px-2 py-1 rounded text-sm outline-none"
                                style={inputStyle}
                              />
                              <button type="submit" className="text-[10px] px-2 py-1 rounded uppercase" style={{ background: "#c4a265", color: "#060606" }}>
                                Save
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditing(null)}
                                className="text-[10px] px-2 py-1 rounded uppercase"
                                style={{ color: "#888" }}
                              >
                                Cancel
                              </button>
                            </form>
                          ) : (
                            <>
                              <span className="flex-1 text-sm" style={{ color: "#bbb" }}>
                                {sub.name}
                              </span>
                              <span className="text-[10px] px-2 py-0.5 rounded" style={{ background: "rgba(255,255,255,.05)", color: "#888" }}>
                                {sub.itemCount} items
                              </span>
                              <button
                                type="button"
                                onClick={() => setEditing(sub.id)}
                                className="text-[10px] px-2 py-1 rounded uppercase tracking-wider"
                                style={{ color: "#888" }}
                              >
                                Edit
                              </button>
                              <form action={deleteAction}>
                                <input type="hidden" name="id" value={sub.id} />
                                <button
                                  type="submit"
                                  onClick={(e) => {
                                    if (!confirm(`Delete "${sub.name}"? Items will be uncategorized.`)) {
                                      e.preventDefault();
                                    }
                                  }}
                                  className="text-[10px] px-2 py-1 rounded uppercase tracking-wider"
                                  style={{ color: "#f87171" }}
                                >
                                  Delete
                                </button>
                              </form>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
