import React from "react";
import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";

// Luxury catalog palette
const gold = "#c4a265";
const goldLight = "#d4b87a";
const bg = "#0a0a0e";
const pageBg = "#ffffff";
const ink = "#1a1a1a";
const inkSoft = "#4a4a4a";
const inkLight = "#8a8a8a";
const divider = "#e5ddd0";
const card = "#faf8f4";

const s = StyleSheet.create({
  // Light, magazine-style pages (luxury print feel)
  page: {
    backgroundColor: pageBg,
    paddingTop: 60,
    paddingBottom: 60,
    paddingHorizontal: 50,
    fontFamily: "Helvetica",
    color: inkSoft,
    fontSize: 9,
  },

  /* ══════ COVER PAGE ══════ */
  coverPage: {
    backgroundColor: bg,
    padding: 0,
    fontFamily: "Helvetica",
    color: "#ddd",
  },
  coverContainer: {
    flex: 1,
    justifyContent: "space-between",
    padding: 50,
  },
  coverTopBrand: {
    fontSize: 8,
    letterSpacing: 4,
    color: gold,
    textTransform: "uppercase",
  },
  coverCenter: {
    alignItems: "flex-start",
  },
  coverLabel: {
    fontSize: 7,
    letterSpacing: 5,
    color: gold,
    textTransform: "uppercase",
    marginBottom: 20,
  },
  coverTitle: {
    fontSize: 56,
    fontFamily: "Helvetica",
    color: "#f5f5f5",
    letterSpacing: -1.5,
    lineHeight: 1,
  },
  coverSubtitle: {
    fontSize: 22,
    fontFamily: "Helvetica-Oblique",
    color: "rgba(255,255,255,0.5)",
    marginTop: 6,
  },
  coverLine: {
    width: 50,
    height: 1,
    backgroundColor: gold,
    marginTop: 28,
    marginBottom: 28,
  },
  coverMeta: {
    gap: 4,
  },
  coverMetaLabel: {
    fontSize: 6.5,
    letterSpacing: 2.5,
    color: "rgba(255,255,255,0.35)",
    textTransform: "uppercase",
    marginBottom: 2,
  },
  coverMetaValue: {
    fontSize: 9,
    color: "rgba(255,255,255,0.85)",
    letterSpacing: 0.5,
  },
  coverBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  coverConfidential: {
    fontSize: 6.5,
    letterSpacing: 3,
    color: "rgba(255,255,255,0.2)",
    textTransform: "uppercase",
  },
  coverNumber: {
    fontSize: 120,
    fontFamily: "Helvetica",
    color: "rgba(196,162,101,0.08)",
    position: "absolute",
    bottom: 20,
    right: 50,
    lineHeight: 1,
  },

  /* ══════ TABLE OF CONTENTS ══════ */
  tocPage: {
    backgroundColor: pageBg,
    paddingTop: 80,
    paddingBottom: 60,
    paddingHorizontal: 60,
    fontFamily: "Helvetica",
    color: inkSoft,
  },
  tocHeader: {
    marginBottom: 40,
    borderBottom: `1px solid ${divider}`,
    paddingBottom: 20,
  },
  tocLabel: {
    fontSize: 7,
    letterSpacing: 5,
    color: gold,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  tocTitle: {
    fontSize: 32,
    fontFamily: "Helvetica",
    color: ink,
    letterSpacing: -0.5,
  },
  tocEntry: {
    flexDirection: "row",
    alignItems: "baseline",
    paddingVertical: 10,
    borderBottom: `0.5px solid ${divider}`,
  },
  tocNumber: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: gold,
    width: 32,
    letterSpacing: 1,
  },
  tocName: {
    fontSize: 13,
    fontFamily: "Helvetica",
    color: ink,
    flex: 1,
  },
  tocCount: {
    fontSize: 8,
    color: inkLight,
    letterSpacing: 1,
    textTransform: "uppercase",
  },

  /* ══════ SECTION BREAK ══════ */
  sectionBreakPage: {
    backgroundColor: pageBg,
    padding: 60,
    fontFamily: "Helvetica",
    justifyContent: "center",
    alignItems: "center",
  },
  sectionNumberBig: {
    fontSize: 140,
    fontFamily: "Helvetica",
    color: gold,
    opacity: 0.15,
    letterSpacing: -4,
    marginBottom: -60,
  },
  sectionLabelSmall: {
    fontSize: 7,
    letterSpacing: 5,
    color: gold,
    textTransform: "uppercase",
    marginBottom: 12,
  },
  sectionMainTitle: {
    fontSize: 44,
    fontFamily: "Helvetica",
    color: ink,
    letterSpacing: -1,
    textAlign: "center",
  },
  sectionTagline: {
    fontSize: 9,
    color: inkLight,
    marginTop: 10,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  sectionDivider: {
    width: 60,
    height: 1,
    backgroundColor: gold,
    marginTop: 24,
  },

  /* ══════ CONTENT PAGES ══════ */
  pageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
    paddingBottom: 16,
    borderBottom: `0.5px solid ${divider}`,
  },
  pageHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  pageHeaderNumber: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: gold,
    letterSpacing: 1,
  },
  pageHeaderTitle: {
    fontSize: 10,
    color: ink,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  pageHeaderRight: {
    fontSize: 7,
    color: inkLight,
    letterSpacing: 2,
    textTransform: "uppercase",
  },

  /* ══════ SUBCATEGORY HEADER ══════ */
  subHeader: {
    marginTop: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  subHeaderLine: {
    flex: 1,
    height: 0.5,
    backgroundColor: divider,
  },
  subHeaderText: {
    fontSize: 8,
    color: gold,
    letterSpacing: 3,
    textTransform: "uppercase",
    fontFamily: "Helvetica-Bold",
  },

  /* ══════ ITEM CARDS — editorial horizontal layout ══════ */
  itemWrap: {
    marginBottom: 22,
  },
  item: {
    flexDirection: "row",
    gap: 18,
    alignItems: "flex-start",
  },
  itemReverse: {
    flexDirection: "row-reverse",
    gap: 18,
    alignItems: "flex-start",
  },
  itemImageWrap: {
    width: "45%",
    height: 150,
    position: "relative",
    backgroundColor: "#f0ebe0",
    borderRadius: 3,
    overflow: "hidden",
  },
  itemImageWide: {
    width: "52%",
    height: 170,
    position: "relative",
    backgroundColor: "#f0ebe0",
    borderRadius: 3,
    overflow: "hidden",
  },
  itemImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  itemPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ebe0ce",
  },
  itemPlaceholderText: {
    fontSize: 11,
    color: inkLight,
    fontFamily: "Helvetica-Oblique",
    textAlign: "center",
    paddingHorizontal: 16,
    letterSpacing: 1,
  },
  itemBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    paddingHorizontal: 7,
    paddingVertical: 3,
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 2,
  },
  itemBadgeText: {
    fontSize: 6.5,
    color: gold,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    fontFamily: "Helvetica-Bold",
  },
  itemContent: {
    flex: 1,
    paddingTop: 4,
  },
  itemContentWide: {
    flex: 1,
    paddingTop: 4,
  },
  itemIndex: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: gold,
    letterSpacing: 2,
    marginBottom: 6,
  },
  itemName: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: ink,
    lineHeight: 1.2,
    letterSpacing: -0.2,
    marginBottom: 4,
  },
  itemRoom: {
    fontSize: 7,
    color: inkLight,
    letterSpacing: 1.8,
    textTransform: "uppercase",
    fontFamily: "Helvetica-Oblique",
    marginBottom: 8,
  },
  itemDescription: {
    fontSize: 9.5,
    color: inkSoft,
    lineHeight: 1.55,
    marginTop: 10,
    marginBottom: 12,
    letterSpacing: 0.1,
  },
  itemDivider: {
    width: 28,
    height: 1,
    backgroundColor: gold,
    marginTop: 10,
    marginBottom: 10,
  },
  specRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 5,
    alignItems: "flex-start",
  },
  specLabel: {
    fontSize: 6.5,
    color: gold,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    width: 62,
    fontFamily: "Helvetica-Bold",
    paddingTop: 1,
  },
  specValue: {
    fontSize: 9,
    color: ink,
    flex: 1,
    lineHeight: 1.45,
  },
  vendor: {
    fontSize: 7,
    color: inkLight,
    textTransform: "uppercase",
    letterSpacing: 2,
    marginTop: 12,
    paddingTop: 8,
    borderTop: `0.5px solid ${divider}`,
    fontFamily: "Helvetica-Bold",
  },

  /* ══════ FOOTER ══════ */
  footer: {
    position: "absolute",
    bottom: 30,
    left: 50,
    right: 50,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
    borderTop: `0.5px solid ${divider}`,
  },
  footerBrand: {
    fontSize: 6.5,
    letterSpacing: 2.5,
    color: gold,
    textTransform: "uppercase",
    fontFamily: "Helvetica-Bold",
  },
  footerMeta: {
    fontSize: 6.5,
    color: inkLight,
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  pageNumber: {
    fontSize: 6.5,
    color: inkLight,
    letterSpacing: 1,
  },
});

interface ProjectData {
  name: string;
  address: string | null;
  standard: string | null;
  client: string | null;
  coverImage: string | null;
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

function Footer({ projectName }: { projectName: string }) {
  return (
    <View style={s.footer} fixed>
      <Text style={s.footerBrand}>Omega Custom Homes</Text>
      <Text style={s.footerMeta}>{projectName} · Confidential</Text>
      <Text
        style={s.pageNumber}
        render={({ pageNumber, totalPages }) => `${String(pageNumber).padStart(2, "0")} / ${String(totalPages).padStart(2, "0")}`}
      />
    </View>
  );
}

export function CatalogPDF({ project }: { project: ProjectData }) {
  const titleParts = project.name.split("—");
  const title = titleParts[0]?.trim() || project.name;
  const subtitle = titleParts[1]?.trim();

  return (
    <Document
      title={`${project.name} — Finishes Catalog`}
      author="Omega Custom Homes"
      subject="Finishes & Materials Catalog"
      creator="Omega"
    >
      {/* ═══════════════ COVER ═══════════════ */}
      <Page size="A4" style={s.coverPage}>
        <View style={s.coverContainer}>
          {/* Top: Brand */}
          <Text style={s.coverTopBrand}>Omega Custom Homes</Text>

          {/* Center: Title block */}
          <View style={s.coverCenter}>
            <Text style={s.coverLabel}>Finishes &amp; Materials Catalog</Text>
            <Text style={s.coverTitle}>{title}</Text>
            {subtitle && <Text style={s.coverSubtitle}>{subtitle}</Text>}
            <View style={s.coverLine} />

            <View style={s.coverMeta}>
              {project.address && (
                <View>
                  <Text style={s.coverMetaLabel}>Location</Text>
                  <Text style={s.coverMetaValue}>{project.address}</Text>
                </View>
              )}
              {project.client && (
                <View style={{ marginTop: 14 }}>
                  <Text style={s.coverMetaLabel}>Client</Text>
                  <Text style={s.coverMetaValue}>{project.client}</Text>
                </View>
              )}
              {project.standard && (
                <View style={{ marginTop: 14 }}>
                  <Text style={s.coverMetaLabel}>Standard</Text>
                  <Text style={s.coverMetaValue}>{project.standard}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Bottom: Confidential + big year */}
          <View style={s.coverBottom}>
            <Text style={s.coverConfidential}>Confidential</Text>
            <Text style={s.coverConfidential}>
              {new Date().getFullYear()}
            </Text>
          </View>
        </View>
      </Page>

      {/* ═══════════════ TABLE OF CONTENTS ═══════════════ */}
      <Page size="A4" style={s.tocPage}>
        <View style={s.tocHeader}>
          <Text style={s.tocLabel}>Contents</Text>
          <Text style={s.tocTitle}>What&rsquo;s Inside</Text>
        </View>

        <View>
          {project.sections.map((section, idx) => (
            <View key={idx} style={s.tocEntry}>
              <Text style={s.tocNumber}>{String(idx + 1).padStart(2, "0")}</Text>
              <Text style={s.tocName}>{section.name}</Text>
              <Text style={s.tocCount}>{section.items.length} {section.items.length === 1 ? "item" : "items"}</Text>
            </View>
          ))}
        </View>

        <Footer projectName={project.name} />
      </Page>

      {/* ═══════════════ SECTIONS ═══════════════ */}
      {project.sections.map((section, sIdx) => {
        const number = String(sIdx + 1).padStart(2, "0");
        // Group items by sub-category (inferred from category string)
        const subGroups = new Map<string, typeof section.items>();
        for (const it of section.items) {
          const sub = it.category || "General";
          if (!subGroups.has(sub)) subGroups.set(sub, []);
          subGroups.get(sub)!.push(it);
        }

        return (
          <React.Fragment key={sIdx}>
            {/* Section break page */}
            <Page size="A4" style={s.sectionBreakPage}>
              <Text style={s.sectionNumberBig}>{number}</Text>
              <Text style={s.sectionLabelSmall}>Section {number}</Text>
              <Text style={s.sectionMainTitle}>{section.name}</Text>
              {section.subtitle && <Text style={s.sectionTagline}>{section.subtitle}</Text>}
              <View style={s.sectionDivider} />
              <Footer projectName={project.name} />
            </Page>

            {/* Content page(s) */}
            <Page size="A4" style={s.page} wrap>
              {/* Running header */}
              <View style={s.pageHeader} fixed>
                <View style={s.pageHeaderLeft}>
                  <Text style={s.pageHeaderNumber}>{number}</Text>
                  <Text style={s.pageHeaderTitle}>{section.name}</Text>
                </View>
                <Text style={s.pageHeaderRight}>
                  {section.items.length} {section.items.length === 1 ? "Item" : "Items"}
                </Text>
              </View>

              {/* Grouped content */}
              {[...subGroups.entries()].map(([subName, subItems], gIdx) => (
                <View key={gIdx} wrap>
                  {subGroups.size > 1 && (
                    <View style={s.subHeader}>
                      <Text style={s.subHeaderText}>{subName}</Text>
                      <View style={s.subHeaderLine} />
                      <Text style={{ ...s.subHeaderText, color: inkLight }}>
                        {String(subItems.length).padStart(2, "0")}
                      </Text>
                    </View>
                  )}

                  {subItems.map((item, iIdx) => {
                    // Asymmetric layout: alternate image side + vary image size every 3rd item
                    const reverse = iIdx % 2 === 1;
                    const wide = iIdx % 3 === 0;
                    const itemNum = String(iIdx + 1).padStart(2, "0");

                    return (
                      <View
                        key={iIdx}
                        style={[s.itemWrap, { marginLeft: reverse ? 0 : iIdx % 4 === 2 ? 18 : 0, marginRight: reverse && iIdx % 4 === 3 ? 18 : 0 }]}
                        wrap={false}
                      >
                        <View style={reverse ? s.itemReverse : s.item}>
                          {/* Image */}
                          <View style={wide ? s.itemImageWide : s.itemImageWrap}>
                            {item.images[0] ? (
                              <Image src={item.images[0].url} style={s.itemImage} />
                            ) : (
                              <View style={s.itemPlaceholder}>
                                <Text style={s.itemPlaceholderText}>
                                  {item.finishType || item.category || "—"}
                                </Text>
                              </View>
                            )}
                            {item.category && (
                              <View style={s.itemBadge}>
                                <Text style={s.itemBadgeText}>{item.category}</Text>
                              </View>
                            )}
                          </View>

                          {/* Content */}
                          <View style={wide ? s.itemContentWide : s.itemContent}>
                            <Text style={s.itemIndex}>
                              {number} · {itemNum}
                            </Text>
                            <Text style={s.itemName}>{item.name}</Text>
                            {item.roomLocation && (
                              <Text style={s.itemRoom}>{item.roomLocation}</Text>
                            )}

                            <View style={s.itemDivider} />

                            {item.specs.length > 0 && (
                              <View>
                                {item.specs.slice(0, 5).map((spec, si) => (
                                  <View key={si} style={s.specRow}>
                                    <Text style={s.specLabel}>{spec.label}</Text>
                                    <Text style={s.specValue}>{spec.value}</Text>
                                  </View>
                                ))}
                              </View>
                            )}

                            {item.vendorName && <Text style={s.vendor}>{item.vendorName}</Text>}
                          </View>
                        </View>
                      </View>
                    );
                  })}
                </View>
              ))}

              <Footer projectName={project.name} />
            </Page>
          </React.Fragment>
        );
      })}
    </Document>
  );
}
