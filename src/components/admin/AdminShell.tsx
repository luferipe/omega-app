import Sidebar from "./Sidebar";

export default function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen" style={{ background: "#111114" }}>
      <Sidebar />
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
