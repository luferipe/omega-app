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
  specs: Spec[];
  images: Image[];
}

function getSwatchGradient(finishType: string | null): string {
  const f = (finishType || "").toLowerCase();
  if (f.includes("gold") && f.includes("black")) return "linear-gradient(135deg,#1a1a1a 50%,#9a7a30 50%)";
  if (f.includes("gold") || f.includes("polished gold")) return "linear-gradient(135deg,#b8923a,#d4ab4c,#c49a3e)";
  if (f.includes("nickel")) return "linear-gradient(135deg,#8a8a8a,#b0b0b0,#9a9a9a)";
  if (f.includes("black")) return "linear-gradient(135deg,#1a1a1a,#2a2a2a,#111)";
  if (f.includes("brass") || f.includes("bronze")) return "linear-gradient(135deg,#9a7a30,#c4a265,#8a6a28)";
  if (f.includes("chrome")) return "linear-gradient(135deg,#c0c0c0,#e0e0e0,#d0d0d0)";
  if (f.includes("oak") || f.includes("wood")) return "linear-gradient(135deg,#6a5030,#8a7050,#5a4020)";
  if (f.includes("white")) return "linear-gradient(135deg,#e0e0e0,#f0f0f0,#d8d8d8)";
  return "linear-gradient(135deg,#111,#1a1a1a,#0e0e0e)";
}

export default function ProductCard({ item }: { item: Item }) {
  const [open, setOpen] = useState(false);
  const hasImage = item.images.length > 0;

  return (
    <>
      <div
        className="rounded-xl overflow-hidden border group cursor-pointer"
        style={{
          background: "rgba(255,255,255,.02)",
          borderColor: "rgba(255,255,255,.06)",
          transition: "all .5s cubic-bezier(.22,1,.36,1)",
        }}
        onClick={() => setOpen(true)}
      >
        {/* Photo / Swatch */}
        <div className="h-56 relative overflow-hidden">
          {hasImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.images[0].url}
              alt={item.images[0].altText || item.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ background: getSwatchGradient(item.finishType) }}>
              <span
                className="text-xl text-center px-6 leading-snug"
                style={{ fontFamily: "'Cormorant Garamond', serif", color: "rgba(255,255,255,.7)", textShadow: "0 2px 8px rgba(0,0,0,.5)" }}
              >
                {item.finishType || item.category || ""}
              </span>
            </div>
          )}
          {item.category && (
            <span
              className="absolute top-3 right-3 text-[9px] px-2.5 py-1 rounded-md tracking-widest uppercase"
              style={{ background: "rgba(0,0,0,.6)", backdropFilter: "blur(8px)", color: "#c4a265", border: "1px solid rgba(196,162,101,.15)" }}
            >
              {item.category}
            </span>
          )}
          {item.roomLocation && (
            <span
              className="absolute bottom-3 left-3 text-[9px] px-2.5 py-1 rounded-md tracking-wide"
              style={{ background: "rgba(0,0,0,.6)", backdropFilter: "blur(8px)", color: "#888" }}
            >
              {item.roomLocation}
            </span>
          )}
          {item.videoUrl && (
            <span
              className="absolute bottom-3 right-3 w-8 h-8 flex items-center justify-center rounded-full"
              style={{ background: "rgba(0,0,0,.6)", backdropFilter: "blur(8px)" }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#c4a265">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
          )}
        </div>

        {/* Body */}
        <div className="p-5">
          <h4 className="text-base font-light" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#eee", lineHeight: 1.3 }}>
            {item.name}
          </h4>

          {item.specs.length > 0 && (
            <ul className="mt-3 pt-3 space-y-1" style={{ borderTop: "1px solid rgba(255,255,255,.04)" }}>
              {item.specs.map((s) => (
                <li key={s.id} className="flex gap-2 text-xs">
                  <span className="min-w-[80px] text-[10px] uppercase tracking-wider pt-px" style={{ color: "#c4a265" }}>
                    {s.label}
                  </span>
                  <span style={{ color: "#bbb" }}>{s.value}</span>
                </li>
              ))}
            </ul>
          )}

          {item.vendorName && (
            <p className="text-[10px] mt-4 pt-3 uppercase tracking-widest" style={{ color: "#444", borderTop: "1px solid rgba(255,255,255,.04)" }}>
              {item.vendorName}
            </p>
          )}
        </div>
      </div>

      {open && <ProductModal item={item} onClose={() => setOpen(false)} />}
    </>
  );
}
