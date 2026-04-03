"use client";

import { useState } from "react";

interface Spec {
  label: string;
  value: string;
}

interface ItemData {
  name: string;
  category: string | null;
  roomLocation: string | null;
  finishType: string | null;
  description: string | null;
  vendorName: string | null;
  vendorContact: string | null;
  vendorPhone: string | null;
  vendorRef: string | null;
  specs: Spec[];
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
  saveAction,
  deleteAction,
}: {
  item: ItemData;
  saveAction: (formData: FormData) => void;
  deleteAction: () => void;
}) {
  const [specs, setSpecs] = useState<Spec[]>(item.specs.length > 0 ? item.specs : [{ label: "", value: "" }]);

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
          <Input label="Category" name="category" value={item.category || ""} onChange={() => {}} />
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
          onClick={() => { if (confirm("Delete this item?")) deleteAction(); }}
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
