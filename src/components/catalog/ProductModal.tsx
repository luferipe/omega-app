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
    requestAnimationFrame(() => setEntered(true));
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
      className="fixed inset-0 z-50 flex"
      style={{
        background: entered ? "rgba(0,0,0,.92)" : "rgba(0,0,0,0)",
        backdropFilter: "blur(16px)",
        transition: "background .4s cubic-bezier(.22,1,.36,1)",
      }}
      onClick={onClose}
    >
      {/* ── Full-screen container ── */}
      <div
        className="relative w-full h-full flex flex-col lg:flex-row overflow-hidden"
        style={{
          opacity: entered ? 1 : 0,
          transform: entered ? "scale(1)" : "scale(.97)",
          transition: "all .45s cubic-bezier(.22,1,.36,1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Close button ── */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 z-20 w-10 h-10 flex items-center justify-center rounded-full text-white/50 hover:text-white"
          style={{ background: "rgba(0,0,0,.4)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,.08)" }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M4 4l8 8M12 4l-8 8" />
          </svg>
        </button>

        {/* ════════════════════════════════════════════════
            LEFT: Media panel (takes full height, ~60% width on desktop)
            ════════════════════════════════════════════════ */}
        <div className="relative flex-1 min-h-[40vh] lg:min-h-0 bg-black flex flex-col">
          {/* Tab bar (only if multiple media types) */}
          {tabs.length > 1 && (
            <div className="flex gap-1 px-5 pt-4 pb-2 relative z-10">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  className="text-[10px] px-3.5 py-1.5 rounded-lg tracking-wider uppercase"
                  style={{
                    background: activeTab === t.key ? "rgba(196,162,101,.12)" : "rgba(255,255,255,.04)",
                    color: activeTab === t.key ? "#c4a265" : "#555",
                    border: `1px solid ${activeTab === t.key ? "rgba(196,162,101,.15)" : "transparent"}`,
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          )}

          {/* Photos */}
          {activeTab === "photos" && hasImage && (
            <div className="flex-1 relative flex items-center justify-center overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.images[activeImage].url}
                alt={item.images[activeImage].altText || item.name}
                className="w-full h-full object-contain"
              />

              {/* Arrow nav */}
              {multipleImages && (
                <>
                  <button
                    onClick={() => setActiveImage((i) => (i - 1 + item.images.length) % item.images.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center text-white/40 hover:text-white"
                    style={{ background: "rgba(0,0,0,.4)", backdropFilter: "blur(8px)" }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M15 18l-6-6 6-6" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setActiveImage((i) => (i + 1) % item.images.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center text-white/40 hover:text-white"
                    style={{ background: "rgba(0,0,0,.4)", backdropFilter: "blur(8px)" }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </button>
                </>
              )}

              {/* Image counter */}
              {multipleImages && (
                <span
                  className="absolute top-4 left-5 text-[10px] px-2.5 py-1 rounded-lg tabular-nums"
                  style={{ background: "rgba(0,0,0,.5)", color: "#888", backdropFilter: "blur(8px)" }}
                >
                  {activeImage + 1} / {item.images.length}
                </span>
              )}
            </div>
          )}

          {/* Video */}
          {activeTab === "video" && item.videoUrl && (
            <div className="flex-1 flex items-center justify-center">
              {embedUrl ? (
                <iframe src={embedUrl} className="w-full h-full border-0" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen />
              ) : directVideo ? (
                <video src={item.videoUrl} controls className="w-full h-full object-contain" style={{ background: "#000" }} />
              ) : (
                <a href={item.videoUrl} target="_blank" rel="noopener noreferrer" className="text-sm underline" style={{ color: "#c4a265" }}>
                  Open Video
                </a>
              )}
            </div>
          )}

          {/* PDF */}
          {activeTab === "pdf" && item.pdfUrl && (
            <div className="flex-1 flex flex-col">
              <div className="flex items-center gap-2 px-5 py-2">
                <a
                  href={item.pdfUrl}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-lg"
                  style={{ background: "rgba(196,162,101,.12)", color: "#c4a265", border: "1px solid rgba(196,162,101,.15)" }}
                >
                  Download
                </a>
              </div>
              <iframe src={item.pdfUrl} title={`${item.name} PDF`} className="flex-1 w-full border-0" style={{ background: "#1a1a1a" }} />
            </div>
          )}

          {/* No image fallback — show swatch */}
          {activeTab === "photos" && !hasImage && (
            <div
              className="flex-1 flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #111 0%, #1a1a1a 50%, #111 100%)",
              }}
            >
              <span
                className="text-3xl text-center px-8 leading-snug"
                style={{ fontFamily: "'Cormorant Garamond', serif", color: "rgba(255,255,255,.15)" }}
              >
                {item.finishType || item.category || item.name}
              </span>
            </div>
          )}

          {/* Thumbnail strip */}
          {activeTab === "photos" && multipleImages && (
            <div
              className="flex gap-1.5 px-5 py-3 overflow-x-auto flex-shrink-0"
              style={{ background: "rgba(0,0,0,.4)", borderTop: "1px solid rgba(255,255,255,.04)" }}
            >
              {item.images.map((img, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={img.id}
                  src={img.url}
                  alt={img.altText || item.name}
                  onClick={() => setActiveImage(i)}
                  className="h-14 w-18 object-cover rounded-lg border flex-shrink-0 cursor-pointer"
                  style={{
                    borderColor: i === activeImage ? "#c4a265" : "rgba(255,255,255,.08)",
                    opacity: i === activeImage ? 1 : 0.45,
                    transition: "all .3s cubic-bezier(.22,1,.36,1)",
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* ════════════════════════════════════════════════
            RIGHT: Info panel (scrollable sidebar on desktop, bottom sheet on mobile)
            ════════════════════════════════════════════════ */}
        <div
          className="w-full lg:w-[420px] xl:w-[460px] flex-shrink-0 overflow-y-auto"
          style={{
            background: "#0e0e12",
            borderLeft: "1px solid rgba(255,255,255,.04)",
          }}
        >
          <div className="p-6 lg:p-8">
            {/* Header */}
            <h2
              className="text-2xl lg:text-3xl font-light"
              style={{ fontFamily: "'Cormorant Garamond', serif", color: "#eee", lineHeight: 1.15 }}
            >
              {item.name}
            </h2>

            {/* Badges */}
            <div className="flex flex-wrap gap-2 mt-3">
              {item.category && (
                <span
                  className="text-[9px] px-2.5 py-1 rounded-md tracking-widest uppercase"
                  style={{ background: "rgba(196,162,101,.08)", color: "#c4a265", border: "1px solid rgba(196,162,101,.1)" }}
                >
                  {item.category}
                </span>
              )}
              {item.roomLocation && (
                <span className="text-[9px] px-2.5 py-1 rounded-md tracking-wide" style={{ background: "rgba(255,255,255,.04)", color: "#777" }}>
                  {item.roomLocation}
                </span>
              )}
              {item.finishType && (
                <span className="text-[9px] px-2.5 py-1 rounded-md tracking-wide" style={{ background: "rgba(255,255,255,.04)", color: "#777" }}>
                  {item.finishType}
                </span>
              )}
            </div>

            {/* Description */}
            {item.description && (
              <p className="mt-6 text-sm leading-relaxed" style={{ color: "#888" }}>
                {item.description}
              </p>
            )}

            {/* Specifications */}
            {item.specs.length > 0 && (
              <div className="mt-7 pt-6" style={{ borderTop: "1px solid rgba(255,255,255,.05)" }}>
                <h3 className="text-[10px] uppercase tracking-[.2em] mb-4" style={{ color: "#c4a265" }}>
                  Specifications
                </h3>
                <div className="space-y-0">
                  {item.specs.map((s) => (
                    <div
                      key={s.id}
                      className="flex gap-3 text-sm py-2.5"
                      style={{ borderBottom: "1px solid rgba(255,255,255,.03)" }}
                    >
                      <span className="text-[10px] uppercase tracking-wider min-w-[90px] pt-0.5 flex-shrink-0" style={{ color: "#555" }}>
                        {s.label}
                      </span>
                      <span style={{ color: "#ccc" }}>{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Vendor info */}
            {(item.vendorName || item.vendorRef) && (
              <div className="mt-7 pt-6" style={{ borderTop: "1px solid rgba(255,255,255,.05)" }}>
                <h3 className="text-[10px] uppercase tracking-[.2em] mb-3" style={{ color: "#c4a265" }}>
                  Vendor
                </h3>
                <div className="space-y-1.5">
                  {item.vendorName && <p className="text-sm" style={{ color: "#ccc" }}>{item.vendorName}</p>}
                  {item.vendorRef && <p className="text-xs" style={{ color: "#555" }}>Ref: {item.vendorRef}</p>}
                  {item.vendorContact && <p className="text-xs" style={{ color: "#555" }}>{item.vendorContact}</p>}
                  {item.vendorPhone && (
                    <a href={`tel:${item.vendorPhone}`} className="text-xs block" style={{ color: "#555" }}>
                      {item.vendorPhone}
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Keyboard hint */}
            <div className="mt-8 pt-4 flex items-center gap-4" style={{ borderTop: "1px solid rgba(255,255,255,.03)" }}>
              <div className="flex items-center gap-1.5">
                <kbd className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: "rgba(255,255,255,.04)", color: "#333" }}>ESC</kbd>
                <span className="text-[9px]" style={{ color: "#2a2a2a" }}>close</span>
              </div>
              {multipleImages && (
                <div className="flex items-center gap-1.5">
                  <kbd className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: "rgba(255,255,255,.04)", color: "#333" }}>← →</kbd>
                  <span className="text-[9px]" style={{ color: "#2a2a2a" }}>navigate</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
