import type { Metadata } from "next";
import { UIProvider } from "@/components/ui/ConfirmDialog";

export const metadata: Metadata = {
  title: "Omega Admin",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <UIProvider>{children}</UIProvider>;
}
