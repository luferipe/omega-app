"use client";

import { useEffect, useState } from "react";

export default function PdfViewerModal({
  projectId,
  projectSlug,
  projectName,
}: {
  projectId: string;
  projectSlug: string;
  projectName: string;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const pdfUrl = `/api/pdf/${projectId}`;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="px-4 py-2 rounded-lg text-xs tracking-wider uppercase"
        style={{ background: "rgba(255,255,255,.05)", color: "#bbb", border: "1px solid rgba(255,255,255,.08)" }}
      >
        View PDF
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8"
          style={{ background: "rgba(0,0,0,.85)", backdropFilter: "blur(12px)" }}
          onClick={() => setOpen(false)}
        >
          <div
            className="relative w-full max-w-5xl h-[90vh] rounded-2xl border flex flex-col overflow-hidden"
            style={{
              background: "#111114",
              borderColor: "rgba(255,255,255,.08)",
              boxShadow: "0 40px 100px rgba(0,0,0,.6)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-3 border-b"
              style={{ borderColor: "rgba(255,255,255,.08)" }}
            >
              <div>
                <h3
                  className="text-base font-light"
                  style={{ fontFamily: "'Cormorant Garamond', serif", color: "#eee" }}
                >
                  {projectName}
                </h3>
                <p className="text-[10px] uppercase tracking-widest" style={{ color: "#666" }}>
                  Catalog Preview
                </p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={pdfUrl}
                  download={`${projectSlug}-catalog.pdf`}
                  className="px-4 py-2 rounded-lg text-[10px] uppercase tracking-wider font-medium"
                  style={{ background: "#c4a265", color: "#060606" }}
                >
                  ↓ Download
                </a>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="w-9 h-9 flex items-center justify-center rounded-full text-white/60 hover:text-white"
                  style={{ background: "rgba(255,255,255,.05)" }}
                >
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M4 4l8 8M12 4l-8 8" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Iframe preview */}
            <div className="flex-1 overflow-hidden" style={{ background: "#0a0a0e" }}>
              <iframe
                src={`${pdfUrl}#toolbar=0&navpanes=0`}
                title={`${projectName} catalog`}
                className="w-full h-full border-0"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
