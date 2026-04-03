"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";

const portfolio = [
  { src: "/images/portfolio/exterior-1.jpg", alt: "Modern Mountain Home Exterior", label: "Exterior" },
  { src: "/images/portfolio/kitchen-1.jpg", alt: "Custom Kitchen with Oak Cabinets", label: "Kitchen" },
  { src: "/images/portfolio/master-bath-1.jpg", alt: "Luxury Master Bathroom with Mountain View", label: "Master Bath" },
  { src: "/images/portfolio/entry-stairs.jpg", alt: "Grand Entry with Stone & Staircase", label: "Entry" },
  { src: "/images/portfolio/dining-room.jpg", alt: "Modern Dining Room", label: "Dining" },
  { src: "/images/portfolio/bedroom-fireplace.jpg", alt: "Master Bedroom with Stone Fireplace", label: "Bedroom" },
  { src: "/images/portfolio/master-bath-2.jpg", alt: "Marble Bathroom with Gold Fixtures", label: "Bath" },
  { src: "/images/portfolio/kitchen-2.jpg", alt: "Kitchen Island Detail", label: "Kitchen" },
  { src: "/images/portfolio/stairs-detail.jpg", alt: "Staircase Detail", label: "Stairs" },
  { src: "/images/portfolio/bathroom-2.jpg", alt: "Guest Bathroom", label: "Bath" },
  { src: "/images/portfolio/exterior-2.jpg", alt: "Home Exterior Aerial", label: "Exterior" },
  { src: "/images/portfolio/master-bath-3.jpg", alt: "Master Bath Detail", label: "Bath" },
];

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

function FadeIn({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, visible } = useInView();
  return (
    <div ref={ref} className={className} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(40px)",
      transition: `all 0.9s cubic-bezier(.22,1,.36,1) ${delay}s`,
    }}>
      {children}
    </div>
  );
}

export default function HomePage() {
  const [scrollY, setScrollY] = useState(0);
  const [heroImg, setHeroImg] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Hero image rotation
  useEffect(() => {
    const interval = setInterval(() => setHeroImg((p) => (p + 1) % 4), 5000);
    return () => clearInterval(interval);
  }, []);

  const heroImages = [
    "/images/portfolio/exterior-1.jpg",
    "/images/portfolio/kitchen-1.jpg",
    "/images/portfolio/master-bath-1.jpg",
    "/images/portfolio/entry-stairs.jpg",
  ];

  return (
    <div style={{ background: "#0a0a0c", color: "#ccc", fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ══ NAVBAR ══ */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: scrollY > 50 ? "rgba(10,10,12,.95)" : "transparent",
        backdropFilter: scrollY > 50 ? "blur(20px)" : "none",
        borderBottom: scrollY > 50 ? "1px solid rgba(255,255,255,.06)" : "none",
        transition: "all .4s",
        padding: "16px 40px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: "#c4a265", fontWeight: 600, letterSpacing: 2 }}>
          OMEGA
        </div>
        <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
          <a href="#portfolio" style={{ color: "#888", fontSize: 11, letterSpacing: 3, textTransform: "uppercase", textDecoration: "none" }}>Portfolio</a>
          <a href="#about" style={{ color: "#888", fontSize: 11, letterSpacing: 3, textTransform: "uppercase", textDecoration: "none" }}>About</a>
          <a href="#contact" style={{ color: "#888", fontSize: 11, letterSpacing: 3, textTransform: "uppercase", textDecoration: "none" }}>Contact</a>
          <Link href="/login" style={{
            color: "#0a0a0c", background: "#c4a265", padding: "8px 20px", borderRadius: 8,
            fontSize: 10, letterSpacing: 3, textTransform: "uppercase", textDecoration: "none", fontWeight: 600,
          }}>
            Admin
          </Link>
        </div>
      </nav>

      {/* ══ HERO ══ */}
      <section style={{ height: "100vh", position: "relative", overflow: "hidden" }}>
        {/* Background images with crossfade */}
        {heroImages.map((src, i) => (
          <div key={src} style={{
            position: "absolute", inset: 0,
            opacity: heroImg === i ? 1 : 0,
            transition: "opacity 1.5s ease-in-out",
            transform: `scale(${1 + scrollY * 0.0003})`,
          }}>
            <Image src={src} alt="" fill style={{ objectFit: "cover" }} priority={i === 0} />
          </div>
        ))}

        {/* Dark overlays */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(10,10,12,.4) 0%, rgba(10,10,12,.7) 60%, rgba(10,10,12,1) 100%)" }} />
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 30%, transparent 30%, rgba(10,10,12,.6) 100%)" }} />

        {/* Content */}
        <div style={{
          position: "relative", zIndex: 2, height: "100%",
          display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center",
          padding: "0 20px",
          transform: `translateY(${scrollY * 0.3}px)`,
        }}>
          <p style={{
            fontSize: 11, letterSpacing: 8, textTransform: "uppercase", color: "#c4a265",
            marginBottom: 24, opacity: 0, animation: "fadeUp .8s .3s forwards",
          }}>
            Luxury Custom Homes &bull; Alpine, Utah
          </p>
          <h1 style={{
            fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(48px, 8vw, 100px)",
            fontWeight: 300, color: "#fff", lineHeight: 1, letterSpacing: -2,
            opacity: 0, animation: "fadeUp .8s .5s forwards",
          }}>
            OMEGA
          </h1>
          <p style={{
            fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(18px, 2.5vw, 28px)",
            fontWeight: 300, fontStyle: "italic", color: "rgba(255,255,255,.4)", marginTop: 8,
            opacity: 0, animation: "fadeUp .8s .7s forwards",
          }}>
            Custom Homes
          </p>
          <div style={{
            width: 60, height: 1, background: "#c4a265", margin: "40px auto",
            opacity: 0, animation: "fadeUp .8s .9s forwards",
          }} />
          <p style={{
            fontSize: 14, color: "rgba(255,255,255,.5)", maxWidth: 500, lineHeight: 1.8,
            opacity: 0, animation: "fadeUp .8s 1.1s forwards",
          }}>
            Crafting extraordinary residences in Utah&apos;s most prestigious communities.
            Where mountain views meet uncompromising luxury.
          </p>
        </div>

        {/* Scroll indicator */}
        <div style={{
          position: "absolute", bottom: 40, left: "50%", transform: "translateX(-50%)", zIndex: 2,
          textAlign: "center", opacity: 0, animation: "fadeUp .8s 1.5s forwards",
        }}>
          <p style={{ fontSize: 9, letterSpacing: 4, textTransform: "uppercase", color: "#555" }}>Scroll</p>
          <div style={{ width: 1, height: 30, background: "linear-gradient(180deg, #555, transparent)", margin: "8px auto 0" }} />
        </div>
      </section>

      {/* ══ STATS ══ */}
      <section style={{ padding: "100px 40px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 40, textAlign: "center" }}>
          {[
            { num: "15+", label: "Years Experience" },
            { num: "50+", label: "Homes Delivered" },
            { num: "$6M+", label: "Luxury Builds" },
            { num: "100%", label: "Client Satisfaction" },
          ].map((stat, i) => (
            <FadeIn key={stat.label} delay={i * 0.15}>
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 48, fontWeight: 300, color: "#c4a265", lineHeight: 1 }}>
                {stat.num}
              </p>
              <p style={{ fontSize: 11, letterSpacing: 3, textTransform: "uppercase", color: "#666", marginTop: 8 }}>
                {stat.label}
              </p>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ══ PORTFOLIO ══ */}
      <section id="portfolio" style={{ padding: "80px 40px 120px", maxWidth: 1400, margin: "0 auto" }}>
        <FadeIn>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <p style={{ fontSize: 11, letterSpacing: 6, textTransform: "uppercase", color: "#c4a265", marginBottom: 16 }}>
              Our Work
            </p>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(32px, 4vw, 52px)", fontWeight: 300, color: "#eee" }}>
              Completed Projects
            </h2>
            <div style={{ width: 40, height: 1, background: "#c4a265", margin: "20px auto" }} />
          </div>
        </FadeIn>

        {/* Masonry-style grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: 16,
        }}>
          {portfolio.map((photo, i) => (
            <FadeIn key={photo.src} delay={i * 0.08} className={i % 5 === 0 ? "row-span-2" : ""}>
              <div style={{
                position: "relative", overflow: "hidden", borderRadius: 12,
                height: i % 5 === 0 ? 500 : 240,
                border: "1px solid rgba(255,255,255,.06)",
                cursor: "pointer",
              }}>
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  style={{
                    objectFit: "cover",
                    transition: "transform .8s cubic-bezier(.22,1,.36,1)",
                  }}
                  sizes="(max-width: 768px) 100vw, 33vw"
                  onMouseEnter={(e) => { (e.target as HTMLElement).style.transform = "scale(1.08)"; }}
                  onMouseLeave={(e) => { (e.target as HTMLElement).style.transform = "scale(1)"; }}
                />
                <div style={{
                  position: "absolute", inset: 0,
                  background: "linear-gradient(180deg, transparent 50%, rgba(10,10,12,.8) 100%)",
                }} />
                <span style={{
                  position: "absolute", bottom: 16, left: 16, fontSize: 10, letterSpacing: 3,
                  textTransform: "uppercase", color: "#c4a265",
                  background: "rgba(10,10,12,.6)", backdropFilter: "blur(8px)",
                  padding: "4px 12px", borderRadius: 6,
                }}>
                  {photo.label}
                </span>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ══ ABOUT ══ */}
      <section id="about" style={{ padding: "120px 40px", position: "relative", overflow: "hidden" }}>
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(135deg, rgba(196,162,101,.03), transparent 50%)",
        }} />
        <div style={{ maxWidth: 900, margin: "0 auto", position: "relative", textAlign: "center" }}>
          <FadeIn>
            <p style={{ fontSize: 11, letterSpacing: 6, textTransform: "uppercase", color: "#c4a265", marginBottom: 16 }}>
              About Us
            </p>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(28px, 3.5vw, 44px)", fontWeight: 300, color: "#eee", lineHeight: 1.4 }}>
              Building Dreams in the Heart of Utah&apos;s Mountains
            </h2>
            <div style={{ width: 40, height: 1, background: "#c4a265", margin: "30px auto" }} />
          </FadeIn>
          <FadeIn delay={0.2}>
            <p style={{ fontSize: 15, lineHeight: 2, color: "#999", marginTop: 20 }}>
              Omega Custom Homes specializes in crafting luxury residences in Alpine, Highland,
              and the surrounding Wasatch Front communities. Every home we build reflects our
              commitment to exceptional materials, innovative design, and meticulous craftsmanship.
            </p>
            <p style={{ fontSize: 15, lineHeight: 2, color: "#999", marginTop: 16 }}>
              From initial concept through final walkthrough, our team manages every detail &mdash;
              custom cabinetry, imported stone, designer lighting, and spa-inspired bathrooms &mdash;
              ensuring each residence is as unique as its owner.
            </p>
          </FadeIn>
          <FadeIn delay={0.4}>
            <div style={{ display: "flex", gap: 24, justifyContent: "center", marginTop: 40, flexWrap: "wrap" }}>
              {["Custom Design", "Luxury Finishes", "Mountain Living", "3D Walkthroughs", "Full Transparency"].map((tag) => (
                <span key={tag} style={{
                  padding: "8px 20px", borderRadius: 24, fontSize: 11, letterSpacing: 2, textTransform: "uppercase",
                  border: "1px solid rgba(196,162,101,.2)", color: "#c4a265",
                }}>
                  {tag}
                </span>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ══ 3D SHOWCASE ══ */}
      <section style={{ padding: "80px 40px 120px", maxWidth: 1300, margin: "0 auto" }}>
        <FadeIn>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <p style={{ fontSize: 11, letterSpacing: 6, textTransform: "uppercase", color: "#c4a265", marginBottom: 16 }}>
              Immersive Experience
            </p>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(28px, 3.5vw, 44px)", fontWeight: 300, color: "#eee" }}>
              Walk Through Your Future Home
            </h2>
          </div>
        </FadeIn>
        <FadeIn delay={0.2}>
          <div style={{
            borderRadius: 16, overflow: "hidden", aspectRatio: "16/9",
            border: "1px solid rgba(255,255,255,.08)",
            boxShadow: "0 40px 80px rgba(0,0,0,.5)",
            position: "relative",
          }}>
            <div style={{
              position: "absolute", top: 16, left: 16, zIndex: 2,
              background: "rgba(10,10,12,.7)", backdropFilter: "blur(10px)",
              padding: "6px 14px", borderRadius: 6,
              fontSize: 9, letterSpacing: 3, textTransform: "uppercase",
              color: "#c4a265", border: "1px solid rgba(196,162,101,.2)",
            }}>
              Live 3D &bull; Matterport
            </div>
            <iframe
              src="https://my.matterport.com/show/?m=PqVuSaDQ5wX&play=1&qs=1"
              style={{ width: "100%", height: "100%", border: 0 }}
              allowFullScreen
              allow="xr-spatial-tracking"
            />
          </div>
        </FadeIn>
      </section>

      {/* ══ CONTACT ══ */}
      <section id="contact" style={{ padding: "100px 40px", borderTop: "1px solid rgba(255,255,255,.06)" }}>
        <div style={{ maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
          <FadeIn>
            <p style={{ fontSize: 11, letterSpacing: 6, textTransform: "uppercase", color: "#c4a265", marginBottom: 16 }}>
              Contact
            </p>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(28px, 3.5vw, 40px)", fontWeight: 300, color: "#eee" }}>
              Let&apos;s Build Together
            </h2>
            <div style={{ width: 40, height: 1, background: "#c4a265", margin: "24px auto 32px" }} />
          </FadeIn>
          <FadeIn delay={0.2}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "center" }}>
              <p style={{ fontSize: 15, color: "#999" }}>Omega Custom Homes</p>
              <p style={{ fontSize: 14, color: "#777" }}>4719 W Canyon View Dr, Highland, UT 84003</p>
              <p style={{ fontSize: 16, color: "#c4a265", fontWeight: 500, marginTop: 8 }}>(801) 900-9461</p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer style={{ padding: "40px", textAlign: "center", borderTop: "1px solid rgba(255,255,255,.04)" }}>
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 16, color: "#c4a265", letterSpacing: 2 }}>
          OMEGA
        </p>
        <p style={{ fontSize: 10, color: "#444", marginTop: 8, letterSpacing: 1 }}>
          &copy; 2026 Omega Custom Homes. All rights reserved.
        </p>
      </footer>

      {/* ══ CSS ANIMATIONS ══ */}
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .row-span-2 { grid-row: span 2; }
        * { -webkit-font-smoothing: antialiased; }
        a:hover { color: #c4a265 !important; }
        html { scroll-behavior: smooth; }
      `}</style>
    </div>
  );
}
