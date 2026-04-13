"use client";

import { useState, useEffect, useCallback } from "react";

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

interface Item {
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
}

function getEmbedUrl(url: string): string | null {
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=0&rel=0`;
  const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  return null;
}

function isDirectVideo(url: string): boolean {
  return /\.(mp4|webm|mov|ogg)(\?.*)?$/i.test(url);
}

type Tab = "photos" | "video" | "pdf";

export default function ProductModal({
  item,
  onClose,
}: {
  item: Item;
  onClose: () => void;
}) {
  const [activeImage, setActiveImage] = useState(0);
  const [activeTab, setActiveTab] = useState<Tab>("photos");
  const [entered, setEntered] = useState(false);
  const [imageTransition, setImageTransition] = useState(false);

  const changeImage = useCallback((idx: number) => {
    setImageTransition(true);
    setTimeout(() => {
      setActiveImage(idx);
      setImageTransition(false);
    }, 180);
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && item.images.length > 1)
        setActiveImage((i) => (i - 1 + item.images.length) % item.images.length);
      if (e.key === "ArrowRight" && item.images.length > 1)
        setActiveImage((i) => (i + 1) % item.images.length);
    },
    [onClose, item.images.length],
  );

  useEffect(() => {
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    requestAnimationFrame(() => requestAnimationFrame(() => setEntered(true)));
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  const hasImage = item.images.length > 0;
  const multipleImages = item.images.length > 1;
  const embedUrl = item.videoUrl ? getEmbedUrl(item.videoUrl) : null;
  const directVideo = item.videoUrl && isDirectVideo(item.videoUrl);
  const hasVideo = !!item.videoUrl;
  const hasPdf = !!item.pdfUrl;

  const tabs = ([
    { key: "photos" as Tab, label: "Photos", show: hasImage },
    { key: "video" as Tab, label: "Video", show: hasVideo },
    { key: "pdf" as Tab, label: "PDF", show: hasPdf },
  ] as const).filter((t) => t.show);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 lg:p-8"
      style={{
        background: entered ? "rgba(0,0,0,.85)" : "rgba(0,0,0,0)",
        backdropFilter: "blur(16px)",
        transition: "background .4s cubic-bezier(.22,1,.36,1)",
      }}
      onClick={onClose}
    >
      {/* ── Centered panel ── */}
      <div
        className="relative w-full max-w-6xl h-full max-h-[92vh] sm:max-h-[88vh] flex flex-col lg:flex-row rounded-2xl sm:rounded-3xl overflow-hidden"
        style={{
          background: "#0c0c10",
          border: "1px solid rgba(255,255,255,.06)",
          boxShadow: "0 50px 150px rgba(0,0,0,.7), 0 0 0 1px rgba(255,255,255,.02)",
          opacity: entered ? 1 : 0,
          transform: entered ? "scale(1) translateY(0)" : "scale(.96) translateY(10px)",
          transition: "all .45s cubic-bezier(.22,1,.36,1) .05s",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ════════ CLOSE ════════ */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 z-30 w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full text-white/40 hover:text-white/90"
          style={{
            background: "rgba(0,0,0,.4)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,.08)",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M4 4l8 8M12 4l-8 8" />
          </svg>
        </button>

        {/* ════════ LEFT: MEDIA ════════ */}
        <div
          className="relative flex-1 min-h-[30vh] sm:min-h-[35vh] lg:min-h-0 flex flex-col overflow-hidden"
          style={{ background: "#08080b" }}
        >
          {/* Tab bar */}
          {tabs.length > 1 && (
            <div className="flex gap-1.5 px-4 sm:px-5 pt-3 sm:pt-4 pb-2 relative z-10 flex-shrink-0">
              {tabs.map((t) => {
                const active = activeTab === t.key;
                return (
                  <button
                    key={t.key}
                    onClick={() => setActiveTab(t.key)}
                    className="text-[9px] px-3.5 py-1.5 rounded-full tracking-[.2em] uppercase"
                    style={{
                      background: active ? "rgba(196,162,101,.1)" : "transparent",
                      color: active ? "#c4a265" : "#444",
                      border: `1px solid ${active ? "rgba(196,162,101,.12)" : "rgba(255,255,255,.04)"}`,
                    }}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>
          )}

          {/* ── Photos ── */}
          {activeTab === "photos" && hasImage && (
            <div className="flex-1 relative flex items-center justify-center overflow-hidden p-2 sm:p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.images[activeImage].url}
                alt={item.images[activeImage].altText || item.name}
                className="max-w-full max-h-full object-contain rounded-xl"
                style={{
                  opacity: imageTransition ? 0 : 1,
                  transform: imageTransition ? "scale(.97)" : "scale(1)",
                  transition: "opacity .2s ease, transform .2s ease",
                }}
              />

              {/* Navigation arrows */}
              {multipleImages && (
                <>
                  <button
                    onClick={() => changeImage((activeImage - 1 + item.images.length) % item.images.length)}
                    className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center text-white/30 hover:text-white/80"
                    style={{ background: "rgba(0,0,0,.35)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,.06)" }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M15 18l-6-6 6-6" />
                    </svg>
                  </button>
                  <button
                    onClick={() => changeImage((activeImage + 1) % item.images.length)}
                    className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center text-white/30 hover:text-white/80"
                    style={{ background: "rgba(0,0,0,.35)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,.06)" }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </button>
                </>
              )}

              {/* Image counter */}
              {multipleImages && (
                <span
                  className="absolute top-3 left-4 sm:top-4 sm:left-5 text-[10px] px-2.5 py-1 rounded-full tabular-nums"
                  style={{ background: "rgba(0,0,0,.5)", color: "rgba(255,255,255,.4)", backdropFilter: "blur(12px)" }}
                >
                  {activeImage + 1}<span style={{ color: "rgba(255,255,255,.15)", margin: "0 2px" }}>/</span>{item.images.length}
                </span>
              )}
            </div>
          )}

          {/* ── Video ── */}
          {activeTab === "video" && item.videoUrl && (
            <div className="flex-1 flex items-center justify-center p-3 sm:p-4">
              {embedUrl ? (
                <iframe src={embedUrl} className="w-full h-full border-0 rounded-xl" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen />
              ) : directVideo ? (
                <video src={item.videoUrl} controls className="w-full h-full object-contain rounded-xl" style={{ background: "#000" }} />
              ) : (
                <a href={item.videoUrl} target="_blank" rel="noopener noreferrer" className="text-sm underline" style={{ color: "#c4a265" }}>
                  Open Video
                </a>
              )}
            </div>
          )}

          {/* ── PDF ── */}
          {activeTab === "pdf" && item.pdfUrl && (
            <div className="flex-1 flex flex-col p-3 sm:p-4 pt-2">
              <div className="flex items-center gap-2 mb-2">
                <a
                  href={item.pdfUrl}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] uppercase tracking-[.2em] px-4 py-2 rounded-full"
                  style={{ background: "rgba(196,162,101,.1)", color: "#c4a265", border: "1px solid rgba(196,162,101,.12)" }}
                >
                  Download PDF
                </a>
              </div>
              <iframe src={item.pdfUrl} title={`${item.name} PDF`} className="flex-1 w-full rounded-xl border-0" style={{ background: "#1a1a1a" }} />
            </div>
          )}

          {/* ── No image fallback ── */}
          {activeTab === "photos" && !hasImage && (
            <div
              className="flex-1 flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #0a0a0d 0%, #13131a 50%, #0a0a0d 100%)" }}
            >
              <div className="text-center">
                <span className="text-3xl block mb-2" style={{ fontFamily: "'Cormorant Garamond', serif", color: "rgba(255,255,255,.08)" }}>
                  {item.finishType || item.category || item.name}
                </span>
                <p className="text-[10px] tracking-[.3em] uppercase" style={{ color: "#2a2a2a" }}>No photos yet</p>
              </div>
            </div>
          )}

          {/* ── Thumbnail strip ── */}
          {activeTab === "photos" && multipleImages && (
            <div
              className="flex gap-1.5 px-4 sm:px-5 py-2.5 overflow-x-auto flex-shrink-0"
              style={{ background: "rgba(0,0,0,.25)", borderTop: "1px solid rgba(255,255,255,.03)" }}
            >
              {item.images.map((img, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={img.id}
                  src={img.url}
                  alt={img.altText || item.name}
                  onClick={() => changeImage(i)}
                  className="h-12 sm:h-14 w-16 sm:w-18 object-cover rounded-lg flex-shrink-0 cursor-pointer"
                  style={{
                    border: i === activeImage ? "2px solid #c4a265" : "2px solid rgba(255,255,255,.06)",
                    opacity: i === activeImage ? 1 : 0.4,
                    transition: "all .3s cubic-bezier(.22,1,.36,1)",
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* ════════ RIGHT: INFO SIDEBAR ════════ */}
        <div
          className="w-full lg:w-[380px] xl:w-[420px] flex-shrink-0 overflow-y-auto"
          style={{ borderLeft: "1px solid rgba(255,255,255,.04)" }}
        >
          <div className="p-5 sm:p-6 lg:p-7">
            {/* Gold accent */}
            <div className="w-7 h-[2px] rounded-full mb-5" style={{ background: "#c4a265" }} />

            {/* Name */}
            <h2
              className="text-xl sm:text-2xl font-light leading-[1.15]"
              style={{ fontFamily: "'Cormorant Garamond', serif", color: "#eee" }}
            >
              {item.name}
            </h2>

            {/* Badges */}
            <div className="flex flex-wrap gap-1.5 mt-3">
              {item.category && (
                <span className="text-[8px] px-2.5 py-1 rounded-full tracking-[.2em] uppercase"
                  style={{ background: "rgba(196,162,101,.07)", color: "#c4a265", border: "1px solid rgba(196,162,101,.1)" }}>
                  {item.category}
                </span>
              )}
              {item.roomLocation && (
                <span className="text-[8px] px-2.5 py-1 rounded-full tracking-[.15em] uppercase"
                  style={{ background: "rgba(255,255,255,.03)", color: "#666", border: "1px solid rgba(255,255,255,.04)" }}>
                  {item.roomLocation}
                </span>
              )}
              {item.finishType && (
                <span className="text-[8px] px-2.5 py-1 rounded-full tracking-[.15em] uppercase"
                  style={{ background: "rgba(255,255,255,.03)", color: "#666", border: "1px solid rgba(255,255,255,.04)" }}>
                  {item.finishType}
                </span>
              )}
            </div>

            {/* Description */}
            {item.description && (
              <p className="mt-5 text-[13px] leading-[1.7]" style={{ color: "#777" }}>
                {item.description}
              </p>
            )}

            {/* Specifications */}
            {item.specs.length > 0 && (
              <div className="mt-6 pt-5" style={{ borderTop: "1px solid rgba(255,255,255,.04)" }}>
                <h3 className="text-[9px] uppercase tracking-[.3em] mb-4 flex items-center gap-2" style={{ color: "#c4a265" }}>
                  <span className="w-3 h-px" style={{ background: "#c4a265" }} />
                  Specifications
                </h3>
                {item.specs.map((s) => (
                  <div key={s.id} className="flex gap-3 py-2" style={{ borderBottom: "1px solid rgba(255,255,255,.025)" }}>
                    <span className="text-[9px] uppercase tracking-[.12em] min-w-[80px] pt-0.5 flex-shrink-0" style={{ color: "#444" }}>
                      {s.label}
                    </span>
                    <span className="text-[12px]" style={{ color: "#bbb" }}>{s.value}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Vendor */}
            {(item.vendorName || item.vendorRef) && (
              <div className="mt-6 pt-5" style={{ borderTop: "1px solid rgba(255,255,255,.04)" }}>
                <h3 className="text-[9px] uppercase tracking-[.3em] mb-3 flex items-center gap-2" style={{ color: "#c4a265" }}>
                  <span className="w-3 h-px" style={{ background: "#c4a265" }} />
                  Vendor
                </h3>
                <div className="p-3.5 rounded-xl" style={{ background: "rgba(255,255,255,.02)", border: "1px solid rgba(255,255,255,.03)" }}>
                  {item.vendorName && <p className="text-sm font-light" style={{ color: "#ccc" }}>{item.vendorName}</p>}
                  {item.vendorRef && <p className="text-[11px] mt-1" style={{ color: "#444" }}>Ref: {item.vendorRef}</p>}
                  {item.vendorContact && <p className="text-[11px] mt-0.5" style={{ color: "#444" }}>{item.vendorContact}</p>}
                  {item.vendorPhone && (
                    <a href={`tel:${item.vendorPhone}`} className="inline-flex items-center gap-1.5 text-[11px] mt-1.5" style={{ color: "#c4a265" }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                      {item.vendorPhone}
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Keyboard hints */}
            <div className="mt-8 pt-4 flex items-center gap-4" style={{ borderTop: "1px solid rgba(255,255,255,.025)" }}>
              <div className="flex items-center gap-1.5">
                <kbd className="text-[8px] px-1.5 py-0.5 rounded" style={{ background: "rgba(255,255,255,.03)", color: "#2a2a2a" }}>ESC</kbd>
                <span className="text-[8px]" style={{ color: "#222" }}>close</span>
              </div>
              {multipleImages && (
                <div className="flex items-center gap-1.5">
                  <kbd className="text-[8px] px-1.5 py-0.5 rounded" style={{ background: "rgba(255,255,255,.03)", color: "#2a2a2a" }}>← →</kbd>
                  <span className="text-[8px]" style={{ color: "#222" }}>photos</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
