"use client";

import { useEffect, useState } from "react";

interface Project {
  name: string;
  address: string | null;
  client: string | null;
  standard: string | null;
  coverImage: string | null;
}

const FALLBACK_IMAGES = [
  "/images/covers/the-ridge-lot-18.jpeg",
  "/images/covers/the-ridge-lot-18-patio.jpeg",
  "/images/covers/the-ridge-lot-18-view.jpeg",
];

export default function CoverSection({ project }: { project: Project }) {
  const images = project.coverImage ? [project.coverImage] : FALLBACK_IMAGES;
  const [current, setCurrent] = useState(0);
  const [loaded, setLoaded] = useState(false);

  /* Auto-advance slides every 6s */
  useEffect(() => {
    if (images.length <= 1) return;
    const id = setInterval(() => setCurrent((c) => (c + 1) % images.length), 6000);
    return () => clearInterval(id);
  }, [images.length]);

  /* Trigger entrance animation */
  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(t);
  }, []);

  const [title, subtitle] = project.name.includes("—")
    ? [project.name.split("—")[0].trim(), project.name.split("—")[1].trim()]
    : [project.name, null];

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* ── Background images with crossfade ── */}
      {images.map((src, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={src}
          src={src}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            opacity: i === current ? 1 : 0,
            scale: i === current ? "1.05" : "1",
            transition: "opacity 1.8s cubic-bezier(.22,1,.36,1), scale 8s cubic-bezier(.22,1,.36,1)",
          }}
        />
      ))}

      {/* ── Gradient overlays ── */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(180deg, rgba(10,10,14,.3) 0%, rgba(10,10,14,.15) 40%, rgba(10,10,14,.7) 75%, rgba(10,10,14,.95) 100%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at 50% 30%, transparent 30%, rgba(10,10,14,.4) 100%)",
        }}
      />

      {/* ── Content ── */}
      <div className="relative z-10 h-full flex flex-col items-center justify-end pb-24 px-8 text-center">
        {/* Label */}
        <p
          className="text-[10px] tracking-[8px] uppercase mb-6"
          style={{
            color: "#c4a265",
            opacity: loaded ? 1 : 0,
            transform: loaded ? "translateY(0)" : "translateY(12px)",
            transition: "all 1s cubic-bezier(.22,1,.36,1) .3s",
          }}
        >
          Finishes &amp; Materials Catalog
        </p>

        {/* Title */}
        <h1
          className="text-[clamp(48px,9vw,110px)] font-light leading-[.9]"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            color: "#fff",
            opacity: loaded ? 1 : 0,
            transform: loaded ? "translateY(0)" : "translateY(20px)",
            transition: "all 1.2s cubic-bezier(.22,1,.36,1) .5s",
            textShadow: "0 4px 40px rgba(0,0,0,.5)",
          }}
        >
          {title}
        </h1>

        {/* Subtitle (Lot number) */}
        {subtitle && (
          <p
            className="text-[clamp(18px,2.5vw,32px)] font-light italic mt-2"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              color: "rgba(255,255,255,.45)",
              opacity: loaded ? 1 : 0,
              transform: loaded ? "translateY(0)" : "translateY(16px)",
              transition: "all 1.2s cubic-bezier(.22,1,.36,1) .7s",
            }}
          >
            {subtitle}
          </p>
        )}

        {/* Gold line */}
        <div
          className="mt-8 mb-8 rounded-full"
          style={{
            width: loaded ? 48 : 0,
            height: 1.5,
            background: "linear-gradient(90deg, transparent, #c4a265, transparent)",
            transition: "width 1.4s cubic-bezier(.22,1,.36,1) .9s",
          }}
        />

        {/* Address & Standard */}
        <div
          className="space-y-1.5"
          style={{
            opacity: loaded ? 1 : 0,
            transform: loaded ? "translateY(0)" : "translateY(10px)",
            transition: "all 1s cubic-bezier(.22,1,.36,1) 1.1s",
          }}
        >
          {project.address && (
            <p className="text-[11px] tracking-[.25em] uppercase" style={{ color: "rgba(255,255,255,.35)" }}>
              {project.address}
            </p>
          )}
          {project.standard && (
            <p className="text-[10px] tracking-[.25em] uppercase" style={{ color: "rgba(196,162,101,.4)" }}>
              {project.standard}
            </p>
          )}
        </div>

        {/* Scroll indicator */}
        <div
          className="mt-12"
          style={{
            opacity: loaded ? 1 : 0,
            transition: "opacity 1s cubic-bezier(.22,1,.36,1) 1.5s",
          }}
        >
          <div className="flex flex-col items-center gap-2">
            <p className="text-[8px] tracking-[.4em] uppercase" style={{ color: "rgba(255,255,255,.2)" }}>
              Scroll
            </p>
            <div className="w-px h-8 relative overflow-hidden" style={{ background: "rgba(255,255,255,.08)" }}>
              <div
                className="w-full h-3 absolute"
                style={{
                  background: "linear-gradient(180deg, #c4a265, transparent)",
                  animation: "scrollPulse 2s ease-in-out infinite",
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Slide indicators (only when multiple images) ── */}
      {images.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-2">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className="h-[2px] rounded-full"
              style={{
                width: i === current ? 28 : 12,
                background: i === current ? "#c4a265" : "rgba(255,255,255,.15)",
                transition: "all .5s cubic-bezier(.22,1,.36,1)",
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
}
