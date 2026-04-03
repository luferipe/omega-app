"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const nav = [
  { label: "Projects", href: "/admin", icon: "◆" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <aside className="w-56 min-h-screen flex flex-col border-r" style={{ background: "#0e0e12", borderColor: "rgba(255,255,255,.1)" }}>
      <div className="p-5 border-b" style={{ borderColor: "rgba(255,255,255,.1)" }}>
        <Link href="/admin">
          <h1 className="text-lg tracking-wide" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#c4a265" }}>
            OMEGA
          </h1>
        </Link>
        <p className="text-[10px] tracking-widest uppercase mt-1" style={{ color: "#777" }}>Admin Panel</p>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {nav.map((item) => {
          const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs tracking-wide"
              style={{
                color: active ? "#c4a265" : "#666",
                background: active ? "rgba(196,162,101,.08)" : "transparent",
              }}
            >
              <span>{item.icon}</span>
              <span className="uppercase">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t" style={{ borderColor: "rgba(255,255,255,.1)" }}>
        <button
          onClick={handleLogout}
          className="w-full text-left px-3 py-2 rounded-lg text-xs tracking-wide uppercase"
          style={{ color: "#777" }}
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
}
