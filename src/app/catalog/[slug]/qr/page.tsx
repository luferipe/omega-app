import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import QRCode from "qrcode";

export default async function QRPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const project = await prisma.project.findUnique({
    where: { slug, published: true },
    select: { name: true, slug: true, address: true },
  });

  if (!project) notFound();

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const catalogUrl = `${appUrl}/catalog/${project.slug}`;
  const qrDataUrl = await QRCode.toDataURL(catalogUrl, {
    width: 400,
    margin: 2,
    color: { dark: "#c4a265", light: "#060606" },
  });

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-8" style={{ background: "#060606" }}>
      <p className="text-[10px] tracking-[6px] uppercase mb-6" style={{ color: "#c4a265" }}>
        Scan to view catalog
      </p>

      <h1 className="text-3xl font-light mb-2" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#eee" }}>
        {project.name}
      </h1>

      {project.address && (
        <p className="text-xs tracking-widest mb-10" style={{ color: "#444" }}>{project.address.toUpperCase()}</p>
      )}

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={qrDataUrl}
        alt="QR Code"
        width={280}
        height={280}
        className="rounded-xl"
        style={{ border: "1px solid rgba(196,162,101,.2)" }}
      />

      <p className="text-xs mt-6" style={{ color: "#555" }}>{catalogUrl}</p>

      <p className="text-[10px] mt-12" style={{ color: "#333" }}>
        Omega Custom Homes &bull; Confidential
      </p>
    </div>
  );
}
