"use client";

import { useState, useRef } from "react";
import { upload } from "@vercel/blob/client";
import { useUI } from "@/components/ui/ConfirmDialog";

interface Spec {
  label: string;
  value: string;
}

interface ItemData {
  name: string;
  category: string | null;
  categoryId: string | null;
  roomLocation: string | null;
  finishType: string | null;
  description: string | null;
  vendorName: string | null;
  vendorContact: string | null;
  vendorPhone: string | null;
  vendorRef: string | null;
  videoUrl: string | null;
  specs: Spec[];
}

export interface CategoryOption {
  id: string;
  name: string;
  children: { id: string; name: string }[];
}

const inputStyle = {
  background: "rgba(255,255,255,.06)",
  border: "1px solid rgba(255,255,255,.06)",
  color: "#eee",
};

const labelStyle = { color: "#aaa" };

const COMMON_LABELS = ["Finish", "Material", "Size", "Style", "Brand", "Model", "Type", "Color", "Bulbs", "Height", "Width", "Mount", "Features", "Qty", "Area", "SKU", "Reference"];

function Input({ label, name, value, onChange }: { label: string; name: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-[10px] uppercase tracking-widest mb-1.5" style={labelStyle}>{label}</label>
      <input
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-lg text-sm outline-none focus:ring-1 focus:ring-[#c4a265]"
        style={inputStyle}
      />
    </div>
  );
}

export default function ItemForm({
  item,
  categories,
  saveAction,
  deleteAction,
}: {
  item: ItemData;
  categories: CategoryOption[];
  saveAction: (formData: FormData) => void;
  deleteAction: () => void;
}) {
  const [specs, setSpecs] = useState<Spec[]>(item.specs.length > 0 ? item.specs : [{ label: "", value: "" }]);
  const [videoUrl, setVideoUrl] = useState(item.videoUrl || "");
  const [videoUploading, setVideoUploading] = useState(false);
  const videoRef = useRef<HTMLInputElement>(null);
  const { confirm, notify } = useUI();

  function addSpec() {
    setSpecs([...specs, { label: "", value: "" }]);
  }

  function removeSpec(i: number) {
    setSpecs(specs.filter((_, idx) => idx !== i));
  }

  function updateSpec(i: number, field: "label" | "value", val: string) {
    const updated = [...specs];
    updated[i] = { ...updated[i], [field]: val };
    setSpecs(updated);
  }

  return (
    <form
      action={(formData) => {
        formData.set("specs", JSON.stringify(specs));
        saveAction(formData);
      }}
      className="space-y-6"
    >
      {/* Basic Info */}
      <div className="p-5 rounded-xl border space-y-4" style={{ background: "rgba(255,255,255,.06)", borderColor: "rgba(255,255,255,.1)" }}>
        <h3 className="text-xs uppercase tracking-widest" style={{ color: "#c4a265" }}>Basic Information</h3>
        <Input label="Name" name="name" value={item.name} onChange={() => {}} />
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] uppercase tracking-widest mb-1.5" style={labelStyle}>Category</label>
            <select
              name="categoryId"
              defaultValue={item.categoryId || ""}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none focus:ring-1 focus:ring-[#c4a265]"
              style={inputStyle}
            >
              <option value="">— Select category —</option>
              {categories.map((c) => (
                c.children.length > 0 ? (
                  <optgroup key={c.id} label={c.name}>
                    <option value={c.id}>{c.name} (general)</option>
                    {c.children.map((sub) => (
                      <option key={sub.id} value={sub.id}>{sub.name}</option>
                    ))}
                  </optgroup>
                ) : (
                  <option key={c.id} value={c.id}>{c.name}</option>
                )
              ))}
            </select>
          </div>
          <Input label="Room / Location" name="roomLocation" value={item.roomLocation || ""} onChange={() => {}} />
        </div>
        <Input label="Finish Type" name="finishType" value={item.finishType || ""} onChange={() => {}} />
        <div>
          <label className="block text-[10px] uppercase tracking-widest mb-1.5" style={labelStyle}>Description</label>
          <textarea
            name="description"
            defaultValue={item.description || ""}
            rows={3}
            className="w-full px-3 py-2 rounded-lg text-sm outline-none focus:ring-1 focus:ring-[#c4a265] resize-none"
            style={inputStyle}
          />
        </div>
        <div>
          <label className="block text-[10px] uppercase tracking-widest mb-1.5" style={labelStyle}>Video</label>
          <div className="flex gap-2">
            <input
              name="videoUrl"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="YouTube, Vimeo URL, or upload MP4"
              className="flex-1 px-3 py-2 rounded-lg text-sm outline-none focus:ring-1 focus:ring-[#c4a265]"
              style={inputStyle}
            />
            <button
              type="button"
              disabled={videoUploading}
              onClick={() => videoRef.current?.click()}
              className="px-3 py-2 rounded-lg text-[10px] uppercase tracking-wider whitespace-nowrap"
              style={{ background: "rgba(196,162,101,.15)", color: "#c4a265", border: "1px solid rgba(196,162,101,.2)" }}
            >
              {videoUploading ? "Uploading..." : "Upload MP4"}
            </button>
          </div>
          <input
            ref={videoRef}
            type="file"
            accept="video/mp4,video/webm,video/quicktime"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setVideoUploading(true);
              try {
                const blob = await upload(file.name, file, {
                  access: "public",
                  handleUploadUrl: "/api/upload-video",
                });
                setVideoUrl(blob.url);
              } catch (err) {
                notify(`Upload failed: ${err instanceof Error ? err.message : "Unknown error"}`, "error");
              }
              setVideoUploading(false);
              e.target.value = "";
            }}
          />
          {videoUrl && videoUrl.match(/\.(mp4|webm|mov)(\?.*)?$/i) && (
            <div className="mt-2 rounded-lg overflow-hidden" style={{ maxHeight: 200 }}>
              <video src={videoUrl} controls className="w-full" style={{ maxHeight: 200 }} />
            </div>
          )}
          <p className="text-[9px] mt-1" style={{ color: "#666" }}>Upload MP4 or paste YouTube/Vimeo link</p>
        </div>
      </div>

      {/* Specs */}
      <div className="p-5 rounded-xl border space-y-4" style={{ background: "rgba(255,255,255,.06)", borderColor: "rgba(255,255,255,.1)" }}>
        <div className="flex items-center justify-between">
          <h3 className="text-xs uppercase tracking-widest" style={{ color: "#c4a265" }}>Technical Specs</h3>
          <button
            type="button"
            onClick={addSpec}
            className="text-[10px] px-2 py-1 rounded tracking-wider uppercase"
            style={{ background: "rgba(196,162,101,.1)", color: "#c4a265" }}
          >
            + Add Spec
          </button>
        </div>

        {specs.map((spec, i) => (
          <div key={i} className="flex gap-3 items-start">
            <div className="w-36">
              <input
                list="spec-labels"
                value={spec.label}
                onChange={(e) => updateSpec(i, "label", e.target.value)}
                placeholder="Label"
                className="w-full px-3 py-2 rounded-lg text-xs outline-none focus:ring-1 focus:ring-[#c4a265]"
                style={inputStyle}
              />
            </div>
            <div className="flex-1">
              <input
                value={spec.value}
                onChange={(e) => updateSpec(i, "value", e.target.value)}
                placeholder="Value"
                className="w-full px-3 py-2 rounded-lg text-xs outline-none focus:ring-1 focus:ring-[#c4a265]"
                style={inputStyle}
              />
            </div>
            <button
              type="button"
              onClick={() => removeSpec(i)}
              className="text-xs px-2 py-2 rounded"
              style={{ color: "#999" }}
            >
              ✕
            </button>
          </div>
        ))}

        <datalist id="spec-labels">
          {COMMON_LABELS.map((l) => <option key={l} value={l} />)}
        </datalist>
      </div>

      {/* Vendor */}
      <div className="p-5 rounded-xl border space-y-4" style={{ background: "rgba(255,255,255,.06)", borderColor: "rgba(255,255,255,.1)" }}>
        <h3 className="text-xs uppercase tracking-widest" style={{ color: "#c4a265" }}>Vendor Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Vendor Name" name="vendorName" value={item.vendorName || ""} onChange={() => {}} />
          <Input label="Contact" name="vendorContact" value={item.vendorContact || ""} onChange={() => {}} />
          <Input label="Phone" name="vendorPhone" value={item.vendorPhone || ""} onChange={() => {}} />
          <Input label="Reference #" name="vendorRef" value={item.vendorRef || ""} onChange={() => {}} />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4">
        <button
          type="button"
          onClick={async () => {
            const ok = await confirm({
              title: "Delete item",
              message: `"${item.name}" will be permanently deleted along with its specs and images.`,
              confirmLabel: "Delete",
              variant: "danger",
            });
            if (ok) deleteAction();
          }}
          className="text-xs tracking-wider uppercase px-4 py-2 rounded-lg"
          style={{ color: "#f87171", background: "rgba(248,113,113,.08)", border: "1px solid rgba(248,113,113,.15)" }}
        >
          Delete Item
        </button>
        <button
          type="submit"
          className="px-6 py-2.5 rounded-lg text-xs font-medium tracking-wider uppercase"
          style={{ background: "#c4a265", color: "#060606" }}
        >
          Save Changes
        </button>
      </div>
    </form>
  );
}
