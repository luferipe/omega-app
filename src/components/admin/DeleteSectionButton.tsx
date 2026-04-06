"use client";

import { useTransition } from "react";
import { useUI } from "@/components/ui/ConfirmDialog";

export default function DeleteSectionButton({
  sectionName,
  itemCount,
  deleteAction,
}: {
  sectionName: string;
  itemCount: number;
  deleteAction: () => Promise<void>;
}) {
  const { confirm, notify } = useUI();
  const [pending, startTransition] = useTransition();

  async function handleClick() {
    const message =
      itemCount > 0
        ? `"${sectionName}" contains ${itemCount} item${itemCount > 1 ? "s" : ""}. All items, their specs and images will be permanently deleted.`
        : `"${sectionName}" will be permanently deleted.`;

    const ok = await confirm({
      title: "Delete section",
      message,
      confirmLabel: "Delete",
      variant: "danger",
    });
    if (!ok) return;

    startTransition(async () => {
      try {
        await deleteAction();
      } catch (err) {
        notify(`Failed to delete: ${err instanceof Error ? err.message : "Unknown error"}`, "error");
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className="px-3 py-1.5 rounded-lg text-xs tracking-wider uppercase disabled:opacity-50"
      style={{
        color: "#f87171",
        background: "rgba(248,113,113,.08)",
        border: "1px solid rgba(248,113,113,.15)",
      }}
    >
      {pending ? "Deleting..." : "Delete Section"}
    </button>
  );
}
