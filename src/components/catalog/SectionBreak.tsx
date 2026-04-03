export default function SectionBreak({ number, title, subtitle }: { number: string; title: string; subtitle?: string }) {
  return (
    <div className="py-32 text-center relative">
      <span
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 leading-none font-bold"
        style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(120px,15vw,200px)", color: "rgba(196,162,101,.03)" }}
      >
        {number}
      </span>
      <h2
        className="relative text-[clamp(28px,4vw,48px)] font-light"
        style={{ fontFamily: "'Cormorant Garamond', serif", color: "#eee" }}
      >
        {title}
      </h2>
      {subtitle && (
        <p className="relative text-xs mt-2 tracking-widest" style={{ color: "#555" }}>{subtitle}</p>
      )}
      <div className="w-10 h-px mx-auto mt-5 relative" style={{ background: "#c4a265" }} />
    </div>
  );
}
