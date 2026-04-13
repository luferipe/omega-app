"use client";

import { useState, useEffect } from "react";

interface NavSection {
  id: string;
  number: string;
  title: string;
}

export default function CatalogNav({ sections }: { sections: NavSection[] }) {
  const [activeId, setActiveId] = useState("");
  const [progress, setProgress] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  /* Track which section is in the viewport */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        }
      },
      { rootMargin: "-25% 0px -65% 0px" },
    );

    for (const s of sections) {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [sections]);

  /* Scroll progress */
  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? window.scrollY / max : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileOpen(false);
  };

  return (
    <>
      {/* ── Desktop side nav ── */}
      <nav
        className="fixed left-0 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col items-start pl-5 gap-0.5"
        style={{ pointerEvents: "auto" }}
      >
        {/* progress rail */}
        <div
          className="absolute left-[11px] top-0 bottom-0 w-[2px] rounded-full overflow-hidden"
          style={{ background: "rgba(255,255,255,.04)" }}
        >
          <div
            className="w-full rounded-full"
            style={{
              background: "linear-gradient(180deg, #c4a265, #d4b87a)",
              height: `${progress * 100}%`,
              transition: "height .15s linear",
            }}
          />
        </div>

        {sections.map((s) => {
          const active = activeId === s.id;
          return (
            <button
              key={s.id}
              onClick={() => scrollTo(s.id)}
              className="flex items-center gap-3 py-2 group relative"
              style={{ transition: "none" }}
            >
              {/* dot */}
              <span
                className="relative z-10 rounded-full"
                style={{
                  width: active ? 8 : 5,
                  height: active ? 8 : 5,
                  background: active ? "#c4a265" : "rgba(255,255,255,.12)",
                  boxShadow: active ? "0 0 12px rgba(196,162,101,.5), 0 0 4px rgba(196,162,101,.3)" : "none",
                  transition: "all .4s cubic-bezier(.22,1,.36,1)",
                }}
              />
              {/* label — always rendered, opacity toggles */}
              <span
                className="text-[10px] uppercase tracking-[.15em] whitespace-nowrap select-none"
                style={{
                  color: active ? "#c4a265" : "rgba(255,255,255,.25)",
                  opacity: active ? 1 : 0,
                  transform: active ? "translateX(0)" : "translateX(-6px)",
                  transition: "all .4s cubic-bezier(.22,1,.36,1)",
                  pointerEvents: "none",
                }}
              >
                <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 12, marginRight: 6 }}>{s.number}</span>
                {s.title}
              </span>
            </button>
          );
        })}
      </nav>

      {/* ── Mobile floating button ── */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed bottom-6 left-6 z-40 lg:hidden w-12 h-12 rounded-full flex items-center justify-center"
        style={{
          background: "rgba(10,10,14,.92)",
          border: "1px solid rgba(196,162,101,.2)",
          backdropFilter: "blur(16px)",
          boxShadow: "0 8px 32px rgba(0,0,0,.5)",
        }}
      >
        {/* Progress ring */}
        <svg width="48" height="48" className="absolute inset-0" style={{ transform: "rotate(-90deg)" }}>
          <circle cx="24" cy="24" r="22" fill="none" stroke="rgba(255,255,255,.06)" strokeWidth="2" />
          <circle
            cx="24"
            cy="24"
            r="22"
            fill="none"
            stroke="#c4a265"
            strokeWidth="2"
            strokeDasharray={2 * Math.PI * 22}
            strokeDashoffset={2 * Math.PI * 22 * (1 - progress)}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset .15s linear" }}
          />
        </svg>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c4a265" strokeWidth="1.5" className="relative">
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* ── Mobile bottom sheet ── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" onClick={() => setMobileOpen(false)}>
          <div className="absolute inset-0" style={{ background: "rgba(0,0,0,.7)", backdropFilter: "blur(8px)" }} />
          <nav
            className="absolute left-0 bottom-0 w-full p-6 pt-4 rounded-t-3xl"
            style={{
              background: "#111114",
              borderTop: "1px solid rgba(196,162,101,.12)",
              animation: "slideUp .35s cubic-bezier(.22,1,.36,1)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{ background: "rgba(255,255,255,.1)" }} />
            <p className="text-[9px] uppercase tracking-[.3em] mb-4 px-2" style={{ color: "#c4a265" }}>Sections</p>
            <div className="space-y-0.5">
              {sections.map((s) => {
                const active = activeId === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => scrollTo(s.id)}
                    className="w-full flex items-center gap-4 py-3 px-4 rounded-xl text-left"
                    style={{ background: active ? "rgba(196,162,101,.06)" : "transparent" }}
                  >
                    <span
                      className="text-sm font-light"
                      style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        color: active ? "#c4a265" : "#444",
                        minWidth: 24,
                      }}
                    >
                      {s.number}
                    </span>
                    <span className="text-sm" style={{ color: active ? "#eee" : "#666" }}>{s.title}</span>
                    {active && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: "#c4a265" }} />
                    )}
                  </button>
                );
              })}
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
