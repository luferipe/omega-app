"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";

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
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}?autoplay=0&rel=0`;
  const vim = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vim) return `https://player.vimeo.com/video/${vim[1]}`;
  return null;
}

function isDirectVideo(url: string): boolean {
  return /\.(mp4|webm|mov|ogg)(\?.*)?$/i.test(url);
}

type Tab = "photos" | "video" | "pdf";

export default function ProductModal({ item, onClose }: { item: Item; onClose: () => void }) {
  const [imgIdx, setImgIdx] = useState(0);
  const [tab, setTab] = useState<Tab>(item.images.length > 0 ? "photos" : item.videoUrl ? "video" : "photos");
  const [show, setShow] = useState(false);
  const scrollRef = useRef<number>(0);

  const hasImg = item.images.length > 0;
  const multi = item.images.length > 1;
  const hasVid = !!item.videoUrl;
  const hasPdf = !!item.pdfUrl;
  const embed = item.videoUrl ? getEmbedUrl(item.videoUrl) : null;
  const direct = item.videoUrl ? isDirectVideo(item.videoUrl) : false;

  const tabs: { key: Tab; label: string }[] = [
    ...(hasImg ? [{ key: "photos" as Tab, label: `Photos${multi ? ` (${item.images.length})` : ""}` }] : []),
    ...(hasVid ? [{ key: "video" as Tab, label: "Video" }] : []),
    ...(hasPdf ? [{ key: "pdf" as Tab, label: "PDF" }] : []),
  ];

  const prev = useCallback(() => setImgIdx((i) => (i - 1 + item.images.length) % item.images.length), [item.images.length]);
  const next = useCallback(() => setImgIdx((i) => (i + 1) % item.images.length), [item.images.length]);

  useEffect(() => {
    scrollRef.current = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollRef.current}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && multi) prev();
      if (e.key === "ArrowRight" && multi) next();
    };
    window.addEventListener("keydown", onKey);
    requestAnimationFrame(() => setShow(true));

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.overflow = "";
      window.scrollTo(0, scrollRef.current);
    };
  }, [onClose, multi, prev, next]);

  return createPortal(
    <div
      className="fixed inset-0"
      style={{
        zIndex: 9999,
        background: show ? "rgba(8,8,12,.97)" : "rgba(8,8,12,0)",
        transition: "background .35s ease",
      }}
    >
      <div
        className="w-full h-full flex flex-col lg:flex-row overflow-hidden"
        style={{
          opacity: show ? 1 : 0,
          transition: "opacity .35s ease .05s",
        }}
      >
        {/* ═══ MEDIA PANEL ═══ */}
        {/* Mobile: capped at 55vh so sidebar stays visible. Desktop: flex-1 fills remaining space */}
        <div className="relative max-h-[55vh] lg:max-h-none lg:flex-1 min-h-0 flex flex-col bg-black/40">
          {/* Top bar: close + tabs */}
          <div className="flex items-center justify-between px-4 py-3 flex-shrink-0">
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full flex items-center justify-center text-white/50 hover:text-white"
              style={{ background: "rgba(255,255,255,.06)" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>

            {tabs.length > 1 && (
              <div className="flex gap-1">
                {tabs.map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setTab(t.key)}
                    className="text-[10px] px-3 py-1.5 rounded-full tracking-wider uppercase"
                    style={{
                      background: tab === t.key ? "rgba(196,162,101,.12)" : "rgba(255,255,255,.04)",
                      color: tab === t.key ? "#c4a265" : "#555",
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            )}

            {/* spacer to balance close button */}
            <div className="w-9" />
          </div>

          {/* Photos */}
          {tab === "photos" && hasImg && (
            <div className="flex-1 min-h-0 relative flex items-center justify-center px-2 pb-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                key={item.images[imgIdx].id}
                src={item.images[imgIdx].url}
                alt={item.images[imgIdx].altText || item.name}
                className="max-w-full max-h-full object-contain select-none"
                draggable={false}
                style={{ borderRadius: 8 }}
              />

              {multi && (
                <>
                  <button
                    onClick={prev}
                    className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center text-white/40 hover:text-white"
                    style={{ background: "rgba(0,0,0,.4)", backdropFilter: "blur(8px)" }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
                  </button>
                  <button
                    onClick={next}
                    className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center text-white/40 hover:text-white"
                    style={{ background: "rgba(0,0,0,.4)", backdropFilter: "blur(8px)" }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
                  </button>
                  <span
                    className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[11px] px-3 py-1 rounded-full tabular-nums"
                    style={{ background: "rgba(0,0,0,.6)", color: "rgba(255,255,255,.5)" }}
                  >
                    {imgIdx + 1} / {item.images.length}
                  </span>
                </>
              )}
            </div>
          )}

          {/* Photos fallback */}
          {tab === "photos" && !hasImg && (
            <div className="flex-1 min-h-0 flex items-center justify-center">
              <p className="text-lg" style={{ fontFamily: "'Cormorant Garamond', serif", color: "rgba(255,255,255,.1)" }}>
                {item.finishType || item.category || "No photo"}
              </p>
            </div>
          )}

          {/* Video */}
          {tab === "video" && item.videoUrl && (
            <div className="flex-1 min-h-0 flex items-center justify-center p-3">
              {embed ? (
                <iframe src={embed} className="w-full h-full rounded-xl border-0" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen />
              ) : direct ? (
                <video src={item.videoUrl} controls className="max-w-full max-h-full rounded-xl" style={{ background: "#000" }} />
              ) : (
                <a href={item.videoUrl} target="_blank" rel="noopener noreferrer" className="text-sm underline" style={{ color: "#c4a265" }}>Open Video</a>
              )}
            </div>
          )}

          {/* PDF */}
          {tab === "pdf" && item.pdfUrl && (
            <div className="flex-1 min-h-0 flex flex-col p-3 gap-2">
              <a
                href={item.pdfUrl}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="self-start text-[10px] uppercase tracking-wider px-4 py-2 rounded-full"
                style={{ background: "rgba(196,162,101,.1)", color: "#c4a265", border: "1px solid rgba(196,162,101,.12)" }}
              >
                Download PDF
              </a>
              <iframe src={item.pdfUrl} title="PDF" className="flex-1 w-full rounded-xl border-0" style={{ background: "#1a1a1a" }} />
            </div>
          )}

          {/* Thumbnails */}
          {tab === "photos" && multi && (
            <div className="flex gap-1.5 px-3 py-2.5 overflow-x-auto flex-shrink-0" style={{ borderTop: "1px solid rgba(255,255,255,.04)" }}>
              {item.images.map((img, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={img.id}
                  src={img.url}
                  alt={img.altText || ""}
                  onClick={() => setImgIdx(i)}
                  draggable={false}
                  className="h-14 w-18 object-cover rounded-lg flex-shrink-0 cursor-pointer"
                  style={{
                    border: i === imgIdx ? "2px solid #c4a265" : "2px solid rgba(255,255,255,.06)",
                    opacity: i === imgIdx ? 1 : 0.4,
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* ═══ INFO SIDEBAR ═══ */}
        {/* Mobile: flex-1 fills remaining ~45vh. Desktop: fixed width sidebar */}
        <div
          className="flex-1 lg:flex-none w-full lg:w-[400px] xl:w-[440px] overflow-y-auto border-t lg:border-t-0 lg:border-l"
          style={{ background: "#0d0d11", borderColor: "rgba(255,255,255,.04)" }}
        >
          <div className="p-5 sm:p-7">
            {/* Gold line */}
            <div className="w-8 h-[2px] rounded-full mb-5" style={{ background: "#c4a265" }} />

            {/* Name */}
            <h2 className="text-xl sm:text-2xl font-light" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#eee", lineHeight: 1.2 }}>
              {item.name}
            </h2>

            {/* Badges */}
            <div className="flex flex-wrap gap-1.5 mt-3">
              {item.category && (
                <span className="text-[8px] px-2.5 py-1 rounded-full tracking-[.18em] uppercase" style={{ background: "rgba(196,162,101,.08)", color: "#c4a265", border: "1px solid rgba(196,162,101,.1)" }}>
                  {item.category}
                </span>
              )}
              {item.roomLocation && (
                <span className="text-[8px] px-2.5 py-1 rounded-full tracking-wider uppercase" style={{ background: "rgba(255,255,255,.03)", color: "#666" }}>
                  {item.roomLocation}
                </span>
              )}
              {item.finishType && (
                <span className="text-[8px] px-2.5 py-1 rounded-full tracking-wider uppercase" style={{ background: "rgba(255,255,255,.03)", color: "#666" }}>
                  {item.finishType}
                </span>
              )}
            </div>

            {/* Description */}
            {item.description && (
              <p className="mt-5 text-[13px] leading-relaxed" style={{ color: "#777" }}>{item.description}</p>
            )}

            {/* Specs */}
            {item.specs.length > 0 && (
              <div className="mt-6 pt-5" style={{ borderTop: "1px solid rgba(255,255,255,.04)" }}>
                <h3 className="text-[9px] uppercase tracking-[.25em] mb-4" style={{ color: "#c4a265" }}>Specifications</h3>
                {item.specs.map((s) => (
                  <div key={s.id} className="flex gap-3 py-2" style={{ borderBottom: "1px solid rgba(255,255,255,.025)" }}>
                    <span className="text-[9px] uppercase tracking-wider min-w-[80px] pt-0.5 flex-shrink-0" style={{ color: "#444" }}>{s.label}</span>
                    <span className="text-[12px]" style={{ color: "#bbb" }}>{s.value}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Vendor */}
            {(item.vendorName || item.vendorRef) && (
              <div className="mt-6 pt-5" style={{ borderTop: "1px solid rgba(255,255,255,.04)" }}>
                <h3 className="text-[9px] uppercase tracking-[.25em] mb-3" style={{ color: "#c4a265" }}>Vendor</h3>
                <div className="p-3.5 rounded-xl" style={{ background: "rgba(255,255,255,.02)", border: "1px solid rgba(255,255,255,.03)" }}>
                  {item.vendorName && <p className="text-sm" style={{ color: "#ccc" }}>{item.vendorName}</p>}
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

            {/* Hints */}
            <div className="mt-8 pt-4 flex gap-4" style={{ borderTop: "1px solid rgba(255,255,255,.025)" }}>
              <span className="text-[8px] text-[#333]"><kbd className="px-1.5 py-0.5 rounded bg-white/[.03] mr-1">ESC</kbd>close</span>
              {multi && <span className="text-[8px] text-[#333]"><kbd className="px-1.5 py-0.5 rounded bg-white/[.03] mr-1">← →</kbd>photos</span>}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
