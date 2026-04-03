"use client";

import { useState, useRef, useCallback } from "react";

interface UploadedImage {
  id: string;
  url: string;
  storageKey: string;
  isPrimary: boolean;
}

export default function ImageUploader({
  itemId,
  images: initialImages,
}: {
  itemId: string;
  images: UploadedImage[];
}) {
  const [images, setImages] = useState<UploadedImage[]>(initialImages);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const uploadFile = useCallback(async (file: File) => {
    setUploading(true);
    try {
      // 1. Upload file to our API (which sends to MinIO)
      const formData = new FormData();
      formData.append("file", file);
      formData.append("itemId", itemId);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
        credentials: "same-origin",
      });

      if (!uploadRes.ok) {
        const err = await uploadRes.json();
        throw new Error(err.error || "Upload failed");
      }

      const { key, url } = await uploadRes.json();

      // 2. Save image record in database
      const saveRes = await fetch(`/api/items/${itemId}/images`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storageKey: key, url }),
        credentials: "same-origin",
      });

      if (!saveRes.ok) {
        const err = await saveRes.json();
        throw new Error(err.error || "Failed to save image record");
      }

      const image = await saveRes.json();
      setImages((prev) => [...prev, { id: image.id, url: url || image.url, storageKey: key, isPrimary: image.isPrimary }]);
    } catch (err) {
      console.error("Upload failed:", err);
      alert(`Upload failed: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
    setUploading(false);
  }, [itemId]);

  async function handleDelete(imageId: string) {
    if (!confirm("Delete this image?")) return;
    await fetch(`/api/items/${itemId}/images`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageId }),
    });
    setImages((prev) => prev.filter((img) => img.id !== imageId));
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/"));
    files.forEach(uploadFile);
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    files.forEach(uploadFile);
    e.target.value = "";
  }

  return (
    <div className="p-5 rounded-xl border space-y-4" style={{ background: "rgba(255,255,255,.06)", borderColor: "rgba(255,255,255,.1)" }}>
      <h3 className="text-xs uppercase tracking-widest" style={{ color: "#c4a265" }}>Images</h3>

      {/* Current images */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {images.map((img, idx) => (
            <div key={img.id || `img-${idx}`} className="relative group rounded-lg overflow-hidden" style={{ aspectRatio: "4/3" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt="" className="w-full h-full object-cover" />
              {img.isPrimary && (
                <span className="absolute top-1 left-1 text-[8px] px-1.5 py-0.5 rounded" style={{ background: "rgba(196,162,101,.9)", color: "#060606" }}>
                  PRIMARY
                </span>
              )}
              <button
                onClick={() => handleDelete(img.id)}
                className="absolute top-1 right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: "rgba(248,113,113,.9)", color: "#fff" }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload area */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
        className="rounded-lg p-8 text-center cursor-pointer transition-colors"
        style={{
          border: `2px dashed ${dragOver ? "#c4a265" : "rgba(255,255,255,.08)"}`,
          background: dragOver ? "rgba(196,162,101,.05)" : "transparent",
        }}
      >
        {uploading ? (
          <div>
            <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-2" style={{ borderColor: "#c4a265", borderTopColor: "transparent" }} />
            <p className="text-xs" style={{ color: "#c4a265" }}>Uploading...</p>
          </div>
        ) : (
          <>
            <p className="text-sm" style={{ color: "#aaa" }}>Drop images here or click to browse</p>
            <p className="text-[10px] mt-1" style={{ color: "#777" }}>JPG, PNG, WebP</p>
          </>
        )}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}
