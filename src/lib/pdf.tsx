import React from "react";
import { Document, Page, Text, View, StyleSheet, Font, Image } from "@react-pdf/renderer";

Font.register({
  family: "Inter",
  fonts: [
    { src: "https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfAZ9hjQ.ttf", fontWeight: 300 },
    { src: "https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfAZ9hiA.ttf", fontWeight: 400 },
    { src: "https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuI6fAZ9hjQ.ttf", fontWeight: 600 },
  ],
});

const gold = "#c4a265";
const bg = "#0a0a0c";
const cardBg = "#111114";
const border = "#1a1a1e";

const s = StyleSheet.create({
  page: { backgroundColor: bg, padding: 40, fontFamily: "Inter", color: "#999", fontSize: 9 },
  cover: { flex: 1, justifyContent: "center", alignItems: "center", paddingVertical: 200 },
  coverLabel: { fontSize: 7, letterSpacing: 6, color: gold, textTransform: "uppercase", marginBottom: 20 },
  coverTitle: { fontSize: 42, fontWeight: 300, color: "#eee", letterSpacing: -1 },
  coverSubtitle: { fontSize: 18, fontWeight: 300, color: "rgba(255,255,255,0.3)", marginTop: 4 },
  coverLine: { width: 40, height: 1, backgroundColor: gold, marginVertical: 30 },
  coverAddress: { fontSize: 8, letterSpacing: 3, color: "#444" },

  sectionBreak: { paddingVertical: 60, alignItems: "center" },
  sectionTitle: { fontSize: 24, fontWeight: 300, color: "#eee" },
  sectionSub: { fontSize: 8, color: "#555", marginTop: 6, letterSpacing: 1 },
  sectionLine: { width: 30, height: 1, backgroundColor: gold, marginTop: 12 },

  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  card: { width: "48%", backgroundColor: cardBg, borderRadius: 8, border: `1px solid ${border}`, marginBottom: 12, overflow: "hidden" },
  cardImage: { height: 100, backgroundColor: "#161618" },
  cardBody: { padding: 12 },
  cardName: { fontSize: 11, fontWeight: 600, color: "#eee", marginBottom: 6 },
  specRow: { flexDirection: "row", gap: 6, marginBottom: 3 },
  specLabel: { fontSize: 7, color: gold, textTransform: "uppercase", letterSpacing: 1, width: 60, fontWeight: 600 },
  specValue: { fontSize: 8, color: "#bbb", flex: 1 },
  vendor: { fontSize: 7, color: "#444", textTransform: "uppercase", letterSpacing: 1, marginTop: 8, paddingTop: 6, borderTop: `1px solid ${border}` },

  footer: { textAlign: "center", paddingTop: 20, borderTop: `1px solid ${border}` },
  footerText: { fontSize: 7, color: "#444" },
});

interface ProjectData {
  name: string;
  address: string | null;
  standard: string | null;
  sections: {
    name: string;
    subtitle: string | null;
    items: {
      name: string;
      category: string | null;
      roomLocation: string | null;
      finishType: string | null;
      vendorName: string | null;
      specs: { label: string; value: string }[];
      images: { url: string; isPrimary: boolean }[];
    }[];
  }[];
}

export function CatalogPDF({ project }: { project: ProjectData }) {
  return (
    <Document>
      {/* Cover */}
      <Page size="A4" style={s.page}>
        <View style={s.cover}>
          <Text style={s.coverLabel}>Finishes &amp; Materials Catalog</Text>
          <Text style={s.coverTitle}>{project.name.split("—")[0]?.trim()}</Text>
          {project.name.includes("—") && (
            <Text style={s.coverSubtitle}>{project.name.split("—")[1]?.trim()}</Text>
          )}
          <View style={s.coverLine} />
          {project.address && <Text style={s.coverAddress}>{project.address.toUpperCase()}</Text>}
          {project.standard && <Text style={{ ...s.coverAddress, marginTop: 4 }}>{project.standard.toUpperCase()}</Text>}
        </View>
      </Page>

      {/* Sections */}
      {project.sections.map((section, sIdx) => (
        <Page key={sIdx} size="A4" style={s.page} wrap>
          {/* Section header */}
          <View style={s.sectionBreak}>
            <Text style={s.sectionTitle}>{section.name}</Text>
            {section.subtitle && <Text style={s.sectionSub}>{section.subtitle}</Text>}
            <View style={s.sectionLine} />
          </View>

          {/* Items grid */}
          <View style={s.grid}>
            {section.items.map((item, iIdx) => (
              <View key={iIdx} style={s.card} wrap={false}>
                {/* Image or color block */}
                <View style={s.cardImage}>
                  {item.images[0] ? (
                    <Image src={item.images[0].url} style={{ width: "100%", height: 100, objectFit: "cover" }} />
                  ) : (
                    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                      <Text style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>
                        {item.finishType || item.category || ""}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={s.cardBody}>
                  <Text style={s.cardName}>{item.name}</Text>
                  {item.category && (
                    <Text style={{ fontSize: 7, color: gold, marginBottom: 4 }}>{item.category}{item.roomLocation ? ` · ${item.roomLocation}` : ""}</Text>
                  )}
                  {item.specs.map((spec, si) => (
                    <View key={si} style={s.specRow}>
                      <Text style={s.specLabel}>{spec.label}</Text>
                      <Text style={s.specValue}>{spec.value}</Text>
                    </View>
                  ))}
                  {item.vendorName && <Text style={s.vendor}>{item.vendorName}</Text>}
                </View>
              </View>
            ))}
          </View>

          {/* Footer */}
          <View style={s.footer} fixed>
            <Text style={s.footerText}>Omega Custom Homes · {project.name} · Confidential</Text>
          </View>
        </Page>
      ))}
    </Document>
  );
}
