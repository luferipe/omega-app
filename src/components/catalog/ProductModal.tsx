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
  specs: Spec[];
  images: Image[];
}

function getEmbedUrl(url: string): string | null {
  // YouTube
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=0&rel=0`;

  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;

  return null;
}

function isDirectVideo(url: string): boolean {
  return /\.(mp4|webm|mov|ogg)(\?.*)?$/i.test(url);
}

export default function ProductModal({
  item,
  onClose,
}: {
  item: Item;
  onClose: () => void;
}) {
  const [activeImage, setActiveImage] = useState(0);
  const [showVideo, setShowVideo] = useState(false);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  const hasImage = item.images.length > 0;
  const multipleImages = item.images.length > 1;
  const embedUrl = item.videoUrl ? getEmbedUrl(item.videoUrl) : null;
  const directVideo = item.videoUrl && isDirectVideo(item.videoUrl);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
      style={{ background: "rgba(0,0,0,.85)", backdropFilter: "blur(12px)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border"
        style={{
          background: "#111114",
          borderColor: "rgba(255,255,255,.08)",
          boxShadow: "0 40px 100px rgba(0,0,0,.6)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 flex items-center justify-center rounded-full text-white/60 hover:text-white transition-colors"
          style={{ background: "rgba(0,0,0,.5)", backdropFilter: "blur(8px)" }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M4 4l8 8M12 4l-8 8" />
          </svg>
        </button>

        {/* Media section */}
        {(hasImage || item.videoUrl) && (
          <div>
            {/* Video / Image toggle tabs */}
            {item.videoUrl && hasImage && (
              <div className="flex gap-1 px-6 pt-4">
                <button
                  onClick={() => setShowVideo(false)}
                  className="text-[10px] px-3 py-1.5 rounded-md tracking-wider uppercase transition-colors"
                  style={{
                    background: !showVideo ? "rgba(196,162,101,.15)" : "rgba(255,255,255,.05)",
                    color: !showVideo ? "#c4a265" : "#666",
                    border: `1px solid ${!showVideo ? "rgba(196,162,101,.2)" : "transparent"}`,
                  }}
                >
                  Photos
                </button>
                <button
                  onClick={() => setShowVideo(true)}
                  className="text-[10px] px-3 py-1.5 rounded-md tracking-wider uppercase transition-colors"
                  style={{
                    background: showVideo ? "rgba(196,162,101,.15)" : "rgba(255,255,255,.05)",
                    color: showVideo ? "#c4a265" : "#666",
                    border: `1px solid ${showVideo ? "rgba(196,162,101,.2)" : "transparent"}`,
                  }}
                >
                  Video
                </button>
              </div>
            )}

            {/* Video */}
            {(showVideo || (!hasImage && item.videoUrl)) && item.videoUrl && (
              <div className="w-full" style={{ aspectRatio: "16/9" }}>
                {embedUrl ? (
                  <iframe
                    src={embedUrl}
                    className="w-full h-full border-0"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                  />
                ) : directVideo ? (
                  <video
                    src={item.videoUrl}
                    controls
                    className="w-full h-full object-contain"
                    style={{ background: "#000" }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center" style={{ background: "#0a0a0e" }}>
                    <a
                      href={item.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm underline"
                      style={{ color: "#c4a265" }}
                    >
                      Open Video
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* Image */}
            {(!showVideo || !item.videoUrl) && hasImage && (
              <>
                <div className="relative w-full" style={{ maxHeight: "60vh" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.images[activeImage].url}
                    alt={item.images[activeImage].altText || item.name}
                    className="w-full object-contain"
                    style={{ maxHeight: "60vh" }}
                  />
                </div>

                {/* Thumbnail strip */}
                {multipleImages && (
                  <div className="flex gap-2 px-6 py-3 overflow-x-auto" style={{ borderBottom: "1px solid rgba(255,255,255,.06)" }}>
                    {item.images.map((img, i) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={img.id}
                        src={img.url}
                        alt={img.altText || item.name}
                        onClick={() => setActiveImage(i)}
                        className="h-16 w-20 object-cover rounded-lg border flex-shrink-0 transition-opacity cursor-pointer"
                        style={{
                          borderColor: i === activeImage ? "#c4a265" : "rgba(255,255,255,.1)",
                          opacity: i === activeImage ? 1 : 0.5,
                        }}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-6 md:p-8">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2
                className="text-2xl md:text-3xl font-light"
                style={{ fontFamily: "'Cormorant Garamond', serif", color: "#eee", lineHeight: 1.2 }}
              >
                {item.name}
              </h2>
              <div className="flex flex-wrap gap-2 mt-2">
                {item.category && (
                  <span
                    className="text-[9px] px-2.5 py-1 rounded-md tracking-widest uppercase"
                    style={{ background: "rgba(196,162,101,.1)", color: "#c4a265", border: "1px solid rgba(196,162,101,.15)" }}
                  >
                    {item.category}
                  </span>
                )}
                {item.roomLocation && (
                  <span
                    className="text-[9px] px-2.5 py-1 rounded-md tracking-wide"
                    style={{ background: "rgba(255,255,255,.05)", color: "#888" }}
                  >
                    {item.roomLocation}
                  </span>
                )}
                {item.finishType && (
                  <span
                    className="text-[9px] px-2.5 py-1 rounded-md tracking-wide"
                    style={{ background: "rgba(255,255,255,.05)", color: "#888" }}
                  >
                    {item.finishType}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          {item.description && (
            <p className="mt-5 text-sm leading-relaxed" style={{ color: "#999" }}>
              {item.description}
            </p>
          )}

          {/* Specifications */}
          {item.specs.length > 0 && (
            <div className="mt-6 pt-6" style={{ borderTop: "1px solid rgba(255,255,255,.06)" }}>
              <h3
                className="text-[10px] uppercase tracking-[.2em] mb-4"
                style={{ color: "#c4a265" }}
              >
                Specifications
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
                {item.specs.map((s) => (
                  <div key={s.id} className="flex gap-3 text-sm py-1.5" style={{ borderBottom: "1px solid rgba(255,255,255,.03)" }}>
                    <span className="text-[10px] uppercase tracking-wider min-w-[90px] pt-0.5" style={{ color: "#666" }}>
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
            <div className="mt-6 pt-6" style={{ borderTop: "1px solid rgba(255,255,255,.06)" }}>
              <h3
                className="text-[10px] uppercase tracking-[.2em] mb-3"
                style={{ color: "#c4a265" }}
              >
                Vendor
              </h3>
              <div className="space-y-1 text-sm">
                {item.vendorName && (
                  <p style={{ color: "#ccc" }}>{item.vendorName}</p>
                )}
                {item.vendorRef && (
                  <p className="text-xs" style={{ color: "#666" }}>
                    Ref: {item.vendorRef}
                  </p>
                )}
                {item.vendorContact && (
                  <p className="text-xs" style={{ color: "#666" }}>
                    {item.vendorContact}
                  </p>
                )}
                {item.vendorPhone && (
                  <p className="text-xs" style={{ color: "#666" }}>
                    {item.vendorPhone}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
