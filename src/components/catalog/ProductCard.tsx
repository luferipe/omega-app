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

function getSwatchGradient(finishType: string | null): string {
  const f = (finishType || "").toLowerCase();
  if (f.includes("gold") && f.includes("black")) return "linear-gradient(135deg,#1a1a1a 50%,#9a7a30 50%)";
  if (f.includes("gold") || f.includes("polished gold")) return "linear-gradient(135deg,#8a6a20,#c4a255,#a08035)";
  if (f.includes("nickel")) return "linear-gradient(135deg,#6a6a6a,#a0a0a0,#7a7a7a)";
  if (f.includes("black")) return "linear-gradient(135deg,#0e0e0e,#1e1e1e,#0a0a0a)";
  if (f.includes("brass") || f.includes("bronze")) return "linear-gradient(135deg,#7a5a18,#b89040,#6a4a10)";
  if (f.includes("chrome")) return "linear-gradient(135deg,#b0b0b0,#d8d8d8,#c0c0c0)";
  if (f.includes("oak") || f.includes("wood")) return "linear-gradient(135deg,#5a4020,#7a6040,#4a3010)";
  if (f.includes("white")) return "linear-gradient(135deg,#d0d0d0,#e8e8e8,#c8c8c8)";
  return "linear-gradient(135deg,#0e0e0e,#171717,#0b0b0b)";
}

export default function ProductCard({ item }: { item: Item }) {
  const [open, setOpen] = useState(false);
  const hasImage = item.images.length > 0;
  const imageCount = item.images.length;
  const specPreview = item.specs.slice(0, 3);
  const hasMedia = !!(item.videoUrl || item.pdfUrl);

  return (
    <>
      <div
        className="group relative rounded-2xl overflow-hidden cursor-pointer"
        style={{
          background: "#101014",
          border: "1px solid rgba(255,255,255,.05)",
        }}
        onClick={() => setOpen(true)}
      >
        {/* ── Image / Swatch area ── */}
        <div className="relative h-60 overflow-hidden">
          {hasImage ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.images[0].url}
                alt={item.images[0].altText || item.name}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              />
              {/* Gradient overlay on hover */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100"
                style={{
                  background: "linear-gradient(180deg, transparent 30%, rgba(10,10,14,.8) 100%)",
                  transition: "opacity .5s cubic-bezier(.22,1,.36,1)",
                }}
              />
            </>
          ) : (
            <div
              className="w-full h-full flex items-center justify-center relative"
              style={{ background: getSwatchGradient(item.finishType) }}
            >
              {/* Decorative pattern overlay */}
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage: "radial-gradient(circle at 30% 40%, rgba(255,255,255,.08) 0%, transparent 60%)",
                }}
              />
              <span
                className="text-lg text-center px-6 leading-snug relative z-10"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  color: "rgba(255,255,255,.55)",
                  textShadow: "0 2px 12px rgba(0,0,0,.6)",
                }}
              >
                {item.finishType || item.category || ""}
              </span>
            </div>
          )}

          {/* Top-right: Category badge */}
          {item.category && (
            <span
              className="absolute top-3 right-3 text-[8px] px-2.5 py-1 rounded-lg tracking-[.2em] uppercase z-10"
              style={{
                background: "rgba(0,0,0,.55)",
                backdropFilter: "blur(12px)",
                color: "#c4a265",
                border: "1px solid rgba(196,162,101,.12)",
              }}
            >
              {item.category}
            </span>
          )}

          {/* Bottom-left: Room location */}
          {item.roomLocation && (
            <span
              className="absolute bottom-3 left-3 text-[9px] px-2.5 py-1 rounded-lg tracking-wide z-10"
              style={{
                background: "rgba(0,0,0,.55)",
                backdropFilter: "blur(12px)",
                color: "rgba(255,255,255,.5)",
              }}
            >
              {item.roomLocation}
            </span>
          )}

          {/* Bottom-right: Media indicators */}
          <div className="absolute bottom-3 right-3 flex gap-1.5 z-10">
            {imageCount > 1 && (
              <span
                className="flex items-center gap-1 text-[9px] px-2 py-1 rounded-lg tabular-nums"
                style={{ background: "rgba(0,0,0,.55)", backdropFilter: "blur(12px)", color: "rgba(255,255,255,.45)" }}
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M3 15l5-5 4 4 4-4 5 5" />
                </svg>
                {imageCount}
              </span>
            )}
            {item.videoUrl && (
              <span
                className="w-7 h-7 flex items-center justify-center rounded-lg"
                style={{ background: "rgba(0,0,0,.55)", backdropFilter: "blur(12px)" }}
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="#c4a265">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
            )}
            {item.pdfUrl && (
              <span
                className="w-7 h-7 flex items-center justify-center rounded-lg"
                style={{ background: "rgba(0,0,0,.55)", backdropFilter: "blur(12px)" }}
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#c4a265" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <path d="M14 2v6h6" />
                </svg>
              </span>
            )}
          </div>

          {/* Hover CTA — appears on hover */}
          <div
            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 z-10"
            style={{ transition: "opacity .4s cubic-bezier(.22,1,.36,1)" }}
          >
            <span
              className="text-[10px] uppercase tracking-[.25em] px-5 py-2.5 rounded-full"
              style={{
                background: "rgba(196,162,101,.15)",
                backdropFilter: "blur(16px)",
                border: "1px solid rgba(196,162,101,.25)",
                color: "#c4a265",
                transform: "translateY(8px)",
                transition: "transform .4s cubic-bezier(.22,1,.36,1)",
              }}
            >
              View Details
            </span>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="p-5 pb-5">
          {/* Item name */}
          <h4
            className="text-[15px] font-light leading-snug"
            style={{ fontFamily: "'Cormorant Garamond', serif", color: "#eee" }}
          >
            {item.name}
          </h4>

          {/* Description preview */}
          {item.description && (
            <p
              className="text-[11px] mt-2 leading-relaxed line-clamp-2"
              style={{ color: "#555" }}
            >
              {item.description}
            </p>
          )}

          {/* Specs preview */}
          {specPreview.length > 0 && (
            <div className="mt-3.5 pt-3.5 space-y-1.5" style={{ borderTop: "1px solid rgba(255,255,255,.04)" }}>
              {specPreview.map((s) => (
                <div key={s.id} className="flex gap-2 text-[11px]">
                  <span className="text-[9px] uppercase tracking-[.15em] min-w-[72px] pt-px flex-shrink-0" style={{ color: "#c4a265" }}>
                    {s.label}
                  </span>
                  <span className="truncate" style={{ color: "#888" }}>{s.value}</span>
                </div>
              ))}
              {item.specs.length > 3 && (
                <p className="text-[9px] tracking-wider uppercase pt-1" style={{ color: "#333" }}>
                  +{item.specs.length - 3} more specs
                </p>
              )}
            </div>
          )}

          {/* Footer: Vendor + finish indicator */}
          <div
            className="mt-4 pt-3.5 flex items-center justify-between"
            style={{ borderTop: "1px solid rgba(255,255,255,.04)" }}
          >
            {item.vendorName ? (
              <p className="text-[9px] uppercase tracking-[.2em] truncate" style={{ color: "#3a3a3a" }}>
                {item.vendorName}
              </p>
            ) : (
              <span />
            )}

            {/* Finish type dot */}
            {item.finishType && (
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{
                    background: getSwatchGradient(item.finishType),
                    border: "1px solid rgba(255,255,255,.08)",
                  }}
                />
                <span className="text-[9px] tracking-wide" style={{ color: "#333" }}>
                  {item.finishType}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ── Bottom gold accent line — animates on hover ── */}
        <div
          className="card-gold-line absolute bottom-0 left-0 h-[2px]"
          style={{
            width: "0%",
            background: "linear-gradient(90deg, #c4a265, #d4b87a, #c4a265)",
            transition: "width .6s cubic-bezier(.22,1,.36,1)",
          }}
        />
      </div>

      {open && <ProductModal item={item} onClose={() => setOpen(false)} />}
    </>
  );
}
