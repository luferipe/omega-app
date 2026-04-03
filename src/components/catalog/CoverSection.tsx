interface Project {
  name: string;
  address: string | null;
  client: string | null;
  standard: string | null;
}

export default function CoverSection({ project }: { project: Project }) {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center text-center relative px-8">
      <p className="text-[10px] tracking-[8px] uppercase mb-8" style={{ color: "#c4a265" }}>
        Finishes &amp; Materials Catalog
      </p>
      <h1 className="text-[clamp(50px,8vw,100px)] font-light leading-none" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#eee" }}>
        {project.name.split("—")[0]?.trim() || project.name}
      </h1>
      {project.name.includes("—") && (
        <p className="text-[clamp(18px,2.5vw,30px)] font-light italic mt-1" style={{ fontFamily: "'Cormorant Garamond', serif", color: "rgba(255,255,255,.3)" }}>
          {project.name.split("—")[1]?.trim()}
        </p>
      )}
      <div className="w-px h-14 mx-auto mt-10 mb-10" style={{ background: "#c4a265" }} />
      <div className="space-y-1">
        {project.address && <p className="text-xs tracking-widest" style={{ color: "#444" }}>{project.address.toUpperCase()}</p>}
        {project.standard && <p className="text-xs tracking-widest" style={{ color: "#333" }}>{project.standard.toUpperCase()}</p>}
      </div>
    </section>
  );
}
