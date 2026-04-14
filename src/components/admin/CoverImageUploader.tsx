"use client";

import { useState, useRef } from "react";

export default function CoverImageUploader({
  currentImage,
  projectId,
}: {
  currentImage: string | null;
  projectId: string;
}) {
  const [imageUrl, setImageUrl] = useState<string>(currentImage ?? "");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("itemId", `project-cover-${projectId}`);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error("Upload failed");
      const { url } = await res.json();
      setImageUrl(url);
    } catch (err) {
      console.error(err);
      alert("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setImageUrl("");
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div>
      <label className="block text-[10px] uppercase tracking-widest mb-2" style={{ color: "#aaa" }}>
        Cover Image
      </label>
      <p className="text-[11px] mb-3" style={{ color: "#555" }}>
        Used on catalog hero and PDF cover page background
      </p>

      {/* Controlled hidden input carries the URL into the form */}
      <input type="hidden" name="coverImage" value={imageUrl} />

      {imageUrl ? (
        <div className="relative rounded-xl overflow-hidden border group" style={{ borderColor: "rgba(255,255,255,.08)" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageUrl} alt="Cover preview" className="w-full h-56 object-cover" />
          <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100"
            style={{ background: "rgba(0,0,0,.6)", transition: "opacity .2s" }}>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="text-[10px] uppercase tracking-wider px-3 py-2 rounded-lg"
              style={{ background: "rgba(196,162,101,.15)", color: "#c4a265", border: "1px solid rgba(196,162,101,.2)" }}
            >
              Replace
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="text-[10px] uppercase tracking-wider px-3 py-2 rounded-lg"
              style={{ background: "rgba(255,80,80,.15)", color: "#f66", border: "1px solid rgba(255,80,80,.2)" }}
            >
              Remove
            </button>
          </div>
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(0,0,0,.7)" }}>
              <span className="text-xs" style={{ color: "#c4a265" }}>Uploading...</span>
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="w-full h-36 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2"
          style={{ borderColor: "rgba(255,255,255,.08)", color: "#555" }}
        >
          {uploading ? (
            <span className="text-xs" style={{ color: "#c4a265" }}>Uploading...</span>
          ) : (
            <>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <span className="text-xs">Click to upload cover image</span>
            </>
          )}
        </button>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleUpload(file);
        }}
      />
    </div>
  );
}
