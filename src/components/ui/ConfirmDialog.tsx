"use client";

import { createContext, useCallback, useContext, useState, useEffect } from "react";

type Variant = "danger" | "default";

interface DialogState {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: Variant;
  resolve: (ok: boolean) => void;
}

interface ToastState {
  id: number;
  message: string;
  tone: "success" | "error";
}

interface UIContextValue {
  confirm: (opts: {
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: Variant;
  }) => Promise<boolean>;
  notify: (message: string, tone?: "success" | "error") => void;
}

const UIContext = createContext<UIContextValue | null>(null);

export function useUI() {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error("useUI must be used within UIProvider");
  return ctx;
}

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [dialog, setDialog] = useState<DialogState | null>(null);
  const [toasts, setToasts] = useState<ToastState[]>([]);

  const confirm = useCallback<UIContextValue["confirm"]>((opts) => {
    return new Promise<boolean>((resolve) => {
      setDialog({ ...opts, resolve });
    });
  }, []);

  const notify = useCallback<UIContextValue["notify"]>((message, tone = "success") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, tone }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  function close(result: boolean) {
    if (!dialog) return;
    dialog.resolve(result);
    setDialog(null);
  }

  useEffect(() => {
    if (!dialog) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close(false);
      if (e.key === "Enter") close(true);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dialog]);

  return (
    <UIContext.Provider value={{ confirm, notify }}>
      {children}

      {/* Confirm dialog */}
      {dialog && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,.75)", backdropFilter: "blur(8px)" }}
          onClick={() => close(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl border p-6"
            style={{
              background: "#111114",
              borderColor: "rgba(255,255,255,.08)",
              boxShadow: "0 30px 80px rgba(0,0,0,.6)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-4">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  background: dialog.variant === "danger" ? "rgba(248,113,113,.1)" : "rgba(196,162,101,.1)",
                  border: `1px solid ${dialog.variant === "danger" ? "rgba(248,113,113,.2)" : "rgba(196,162,101,.2)"}`,
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={dialog.variant === "danger" ? "#f87171" : "#c4a265"} strokeWidth="2">
                  {dialog.variant === "danger" ? (
                    <>
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                      <line x1="12" y1="9" x2="12" y2="13" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </>
                  ) : (
                    <>
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="16" x2="12" y2="12" />
                      <line x1="12" y1="8" x2="12.01" y2="8" />
                    </>
                  )}
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h3
                  className="text-lg font-light"
                  style={{ fontFamily: "'Cormorant Garamond', serif", color: "#eee" }}
                >
                  {dialog.title}
                </h3>
                <p className="text-sm mt-2 leading-relaxed" style={{ color: "#aaa" }}>
                  {dialog.message}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => close(false)}
                className="px-4 py-2 rounded-lg text-xs uppercase tracking-wider"
                style={{
                  background: "rgba(255,255,255,.05)",
                  color: "#aaa",
                  border: "1px solid rgba(255,255,255,.08)",
                }}
              >
                {dialog.cancelLabel || "Cancel"}
              </button>
              <button
                onClick={() => close(true)}
                autoFocus
                className="px-5 py-2 rounded-lg text-xs uppercase tracking-wider font-medium"
                style={
                  dialog.variant === "danger"
                    ? { background: "#f87171", color: "#1a0606" }
                    : { background: "#c4a265", color: "#060606" }
                }
              >
                {dialog.confirmLabel || "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toasts */}
      <div className="fixed top-4 right-4 z-[110] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="px-4 py-3 rounded-lg border min-w-[260px] max-w-sm pointer-events-auto"
            style={{
              background: "#111114",
              borderColor: t.tone === "error" ? "rgba(248,113,113,.3)" : "rgba(196,162,101,.3)",
              boxShadow: "0 12px 40px rgba(0,0,0,.5)",
            }}
          >
            <div className="flex items-start gap-3">
              <div
                className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                style={{ background: t.tone === "error" ? "#f87171" : "#c4a265" }}
              />
              <p className="text-xs leading-relaxed" style={{ color: "#ddd" }}>
                {t.message}
              </p>
            </div>
          </div>
        ))}
      </div>
    </UIContext.Provider>
  );
}
