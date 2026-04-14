"use client";

import { useState } from "react";
import ProductModal from "./ProductModal";

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

function mediaType(item: Item): "video" | "image" | "pdf" | "none" {
  if (item.videoUrl) return "video";
  if (item.images.length > 0) return "image";
  if (item.pdfUrl) return "pdf";
  return "none";
}

function MediaBadge({ type, imageCount }: { type: "video" | "image" | "pdf" | "none"; imageCount: number }) {
  const config = {
    video: { label: "Video", color: "#e5a5a5", bg: "rgba(200,80,80,.12)", border: "rgba(200,80,80,.25)" },
    image: { label: imageCount > 1 ? `${imageCount} Photos` : "Photo", color: "#c4a265", bg: "rgba(196,162,101,.12)", border: "rgba(196,162,101,.25)" },
    pdf: { label: "PDF", color: "#a5c5e5", bg: "rgba(80,150,220,.12)", border: "rgba(80,150,220,.25)" },
    none: { label: "Swatch", color: "#888", bg: "rgba(255,255,255,.04)", border: "rgba(255,255,255,.08)" },
  }[type];

  const Icon = () => {
    if (type === "video")
      return (
        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7z" />
        </svg>
      );
    if (type === "image")
      return (
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
          <path d="M21 15l-5-5L5 21" />
        </svg>
      );
    if (type === "pdf")
      return (
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <path d="M14 2v6h6" />
        </svg>
      );
    return (
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="9" />
      </svg>
    );
  };

  return (
    <span
      className="inline-flex items-center gap-1.5 text-[9px] px-2.5 py-1 rounded-full tracking-[.2em] uppercase"
      style={{ background: config.bg, color: config.color, border: `1px solid ${config.border}` }}
    >
      <Icon />
      {config.label}
    </span>
  );
}

export default function ProductCard({ item, index = 0, sectionNumber = "01" }: { item: Item; index?: number; sectionNumber?: string }) {
  const [open, setOpen] = useState(false);
  const hasImage = item.images.length > 0;
  const specPreview = item.specs.slice(0, 4);
  const type = mediaType(item);

  // Alternate direction + asymmetric indents for editorial rhythm
  const reverse = index % 2 === 1;
  const wide = index % 3 === 0;
  const indent =
    index % 4 === 1 ? "md:ml-8" :
    index % 4 === 2 ? "md:mr-8" :
    index % 4 === 3 ? "md:ml-4" : "";

  const itemNum = String(index + 1).padStart(2, "0");

  return (
    <>
      <article
        className={`group cursor-pointer ${indent}`}
        onClick={() => setOpen(true)}
      >
        <div
          className={`flex flex-col ${reverse ? "md:flex-row-reverse" : "md:flex-row"} gap-5 md:gap-8 items-stretch`}
        >
          {/* ═══ Image / Media panel ═══ */}
          <div
            className="relative overflow-hidden rounded-xl md:rounded-2xl flex-shrink-0"
            style={{
              background: "#17171a",
              border: "1px solid rgba(255,255,255,.05)",
              width: "100%",
              aspectRatio: wide ? "4/3" : "5/4",
            }}
          >
            <div className={wide ? "md:w-[440px] lg:w-[520px]" : "md:w-[380px] lg:w-[440px]"}
              style={{ position: "absolute", inset: 0 }}>
              {hasImage ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.images[0].url}
                    alt={item.images[0].altText || item.name}
                    className="w-full h-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]"
                    draggable={false}
                  />
                  {/* Subtle vignette */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100"
                    style={{
                      background: "linear-gradient(180deg, transparent 40%, rgba(0,0,0,.5) 100%)",
                      transition: "opacity .6s cubic-bezier(.22,1,.36,1)",
                    }}
                  />
                </>
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, #111 0%, #1a1a1e 50%, #0e0e12 100%)",
                  }}
                >
                  <span
                    className="text-2xl px-8 text-center leading-snug"
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      color: "rgba(255,255,255,.3)",
                      fontStyle: "italic",
                    }}
                  >
                    {item.finishType || item.category || item.name}
                  </span>
                </div>
              )}

              {/* Media type badge — top-left */}
              <div className="absolute top-4 left-4 z-10">
                <MediaBadge type={type} imageCount={item.images.length} />
              </div>

              {/* Room location — bottom-left */}
              {item.roomLocation && (
                <span
                  className="absolute bottom-4 left-4 z-10 text-[9px] px-2.5 py-1 rounded-full tracking-wide"
                  style={{
                    background: "rgba(0,0,0,.55)",
                    backdropFilter: "blur(12px)",
                    color: "rgba(255,255,255,.65)",
                    border: "1px solid rgba(255,255,255,.06)",
                  }}
                >
                  {item.roomLocation}
                </span>
              )}

              {/* Hover CTA — bottom-right */}
              <div
                className="absolute bottom-4 right-4 z-10 opacity-0 group-hover:opacity-100"
                style={{ transition: "opacity .4s cubic-bezier(.22,1,.36,1)" }}
              >
                <span
                  className="inline-flex items-center gap-1.5 text-[9px] uppercase tracking-[.25em] px-3.5 py-2 rounded-full"
                  style={{
                    background: "rgba(196,162,101,.18)",
                    backdropFilter: "blur(16px)",
                    border: "1px solid rgba(196,162,101,.3)",
                    color: "#c4a265",
                  }}
                >
                  View
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </div>
          </div>

          {/* ═══ Content panel ═══ */}
          <div className="flex-1 min-w-0 py-2 md:py-4">
            {/* Index tag */}
            <p
              className="text-[9px] tracking-[.3em] uppercase mb-3"
              style={{ color: "#c4a265", fontFamily: "'Inter', sans-serif", fontWeight: 600 }}
            >
              {sectionNumber} <span style={{ color: "rgba(196,162,101,.3)" }}>·</span> {itemNum}
            </p>

            {/* Name */}
            <h3
              className="text-[22px] md:text-[26px] lg:text-[30px] font-light leading-[1.1] tracking-tight"
              style={{ fontFamily: "'Cormorant Garamond', serif", color: "#f0ebe0" }}
            >
              {item.name}
            </h3>

            {/* Finish pill */}
            {item.finishType && (
              <div className="mt-3">
                <span
                  className="inline-flex items-center text-[9px] px-2.5 py-1.5 rounded-full tracking-[.2em] uppercase"
                  style={{
                    background: "rgba(196,162,101,.08)",
                    color: "#c4a265",
                    border: "1px solid rgba(196,162,101,.15)",
                    fontWeight: 600,
                  }}
                >
                  {item.finishType}
                </span>
              </div>
            )}

            {/* Description */}
            {item.description && (
              <p
                className="mt-4 text-[13px] leading-[1.7] line-clamp-3"
                style={{ color: "#999", maxWidth: 540 }}
              >
                {item.description}
              </p>
            )}

            {/* Gold mini-divider */}
            <div className="w-7 h-px my-5" style={{ background: "#c4a265" }} />

            {/* Specs */}
            {specPreview.length > 0 && (
              <dl className="space-y-2">
                {specPreview.map((s) => (
                  <div key={s.id} className="flex gap-4 items-baseline">
                    <dt
                      className="text-[9px] uppercase tracking-[.18em] w-[90px] flex-shrink-0"
                      style={{ color: "#c4a265", fontWeight: 600 }}
                    >
                      {s.label}
                    </dt>
                    <dd className="text-[12px] flex-1" style={{ color: "#ccc", lineHeight: 1.5 }}>
                      {s.value}
                    </dd>
                  </div>
                ))}
                {item.specs.length > 4 && (
                  <p className="text-[9px] tracking-[.2em] uppercase pt-1" style={{ color: "#555" }}>
                    + {item.specs.length - 4} more specs
                  </p>
                )}
              </dl>
            )}

            {/* Vendor */}
            {item.vendorName && (
              <div className="mt-6 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,.05)" }}>
                <p className="text-[9px] uppercase tracking-[.25em]" style={{ color: "#777", fontWeight: 600 }}>
                  {item.vendorName}
                </p>
                {item.vendorRef && (
                  <p className="text-[10px] italic mt-1" style={{ color: "#555" }}>
                    Ref · {item.vendorRef}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Hairline divider between items */}
        <div className="mt-10 md:mt-14 h-px" style={{ background: "rgba(255,255,255,.04)" }} />
      </article>

      {open && <ProductModal item={item} onClose={() => setOpen(false)} />}
    </>
  );
}
