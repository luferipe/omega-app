/**
 * Reseed: replace flat categories with new 8-group hierarchical structure,
 * deduplicate existing items per section, and recategorize all surviving items.
 *
 * Run with: npx tsx scripts/reseed-categories-and-items.ts [--dry]
 */
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const DRY = process.argv.includes("--dry");

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const TREE: { name: string; children: string[] }[] = [
  {
    name: "Exterior Finishes",
    children: [
      "Roofing Materials",
      "Siding & Shake",
      "Stucco",
      "Soffit, Fascia & Gutters",
      "Exterior Doors",
      "Windows & Patio Doors",
      "Garage Doors",
      "Decking",
      "Built-In Grill Station",
      "Masonry & Stonework",
    ],
  },
  {
    name: "Interior Finishes",
    children: [
      "Interior Doors",
      "Interior Railings",
      "Finish Carpentry",
      "Baseboards & Casing",
      "Wall Finishes",
      "Fireplace",
      "Door & Cabinet Hardware",
      "Mirrors & Shower Enclosures",
      "Electrical Fixtures",
    ],
  },
  {
    name: "Flooring",
    children: ["Hardwood Flooring", "Carpet", "Tile Flooring"],
  },
  {
    name: "Kitchen & Bath",
    children: ["Cabinets", "Countertops", "Plumbing Fixtures", "Appliances"],
  },
  {
    name: "Mechanical & Systems",
    children: ["HVAC System (Heating & Air Conditioning)"],
  },
  {
    name: "Paint & Wall Finishes",
    children: ["Interior Paint", "Exterior Paint"],
  },
  {
    name: "Outdoor & Landscaping",
    children: [
      "Landscaping",
      "Fence",
      "Retaining Walls",
      "Swimming Pool",
      "Outdoor Pickleball Court",
    ],
  },
  {
    name: "Recreation & Specialty Features",
    children: ["Spa", "Sauna", "Indoor Pickleball Court", "Golf Simulator"],
  },
];

/**
 * Map an item to a target subcategory based on its old category string and name.
 * Returns the *full path* "Parent / Sub" — caller resolves to id.
 */
function classify(item: { name: string; category: string | null }): string | null {
  const cat = (item.category || "").toLowerCase().trim();
  const name = item.name.toLowerCase();

  // Lighting / electrical
  if (
    cat === "lighting" ||
    cat === "bulbs" ||
    cat === "ceiling fan" ||
    /pendant|sconce|chandelier|vanity light|wall light|ceiling light|lantern|bulb|wrap light/.test(name)
  )
    return "Interior Finishes / Electrical Fixtures";

  // Tile (flooring or wall — treat as Tile Flooring per the new tree)
  if (cat === "tile") return "Flooring / Tile Flooring";

  // Flooring breakdowns
  if (cat === "flooring") {
    if (name.includes("hardwood")) return "Flooring / Hardwood Flooring";
    if (name.includes("carpet")) return "Flooring / Carpet";
    if (name.includes("court")) return "Outdoor & Landscaping / Outdoor Pickleball Court";
    return "Flooring / Hardwood Flooring";
  }

  // Cabinets
  if (cat === "cabinetry" || /cabinet|cabinetry|closet system|mud room storage|built-in/.test(name)) {
    if (name.includes("fireplace") && cat === "fireplace") return "Interior Finishes / Fireplace";
    return "Kitchen & Bath / Cabinets";
  }

  // Countertops
  if (cat === "countertop") return "Kitchen & Bath / Countertops";

  // Plumbing
  if (
    [
      "faucet",
      "sink",
      "sink & faucet",
      "faucet & sink",
      "disposal",
      "bathtub",
      "shower system",
      "toilet",
      "bathroom suite",
    ].includes(cat)
  )
    return "Kitchen & Bath / Plumbing Fixtures";

  // Appliances
  if (cat === "appliance") return "Kitchen & Bath / Appliances";

  // Fireplace
  if (cat === "fireplace") return "Interior Finishes / Fireplace";

  // Mirrors / glass
  if (cat === "glass" || /mirror|shower enclosure/.test(name))
    return "Interior Finishes / Mirrors & Shower Enclosures";

  // Hardware
  if (cat === "hardware") return "Interior Finishes / Door & Cabinet Hardware";

  // Carpentry / baseboards
  if (cat === "carpentry") return "Interior Finishes / Baseboards & Casing";

  // Walls / ceiling
  if (cat === "walls" || cat === "ceiling") return "Interior Finishes / Wall Finishes";

  // Doors
  if (cat === "doors") {
    if (name.includes("interior")) return "Interior Finishes / Interior Doors";
    if (name.includes("garage")) return "Exterior Finishes / Garage Doors";
    if (name.includes("exterior") || name.includes("patio")) return "Exterior Finishes / Exterior Doors";
    return "Exterior Finishes / Exterior Doors";
  }

  // Railing
  if (cat === "railing") return "Interior Finishes / Interior Railings";

  // Roof / cladding / trim / masonry / windows
  if (cat === "roofing") return "Exterior Finishes / Roofing Materials";
  if (cat === "cladding") {
    if (name.includes("stucco")) return "Exterior Finishes / Stucco";
    return "Exterior Finishes / Siding & Shake";
  }
  if (cat === "trim") return "Exterior Finishes / Soffit, Fascia & Gutters";
  if (cat === "masonry") return "Exterior Finishes / Masonry & Stonework";
  if (cat === "windows") return "Exterior Finishes / Windows & Patio Doors";

  // Deck
  if (cat === "deck") return "Exterior Finishes / Decking";

  // Outdoor kitchen
  if (cat === "outdoor kitchen") return "Exterior Finishes / Built-In Grill Station";

  // Pool
  if (cat === "pool") return "Outdoor & Landscaping / Swimming Pool";

  // Court / pickleball
  if (cat === "court") {
    if (name.includes("indoor")) return "Recreation & Specialty Features / Indoor Pickleball Court";
    return "Outdoor & Landscaping / Outdoor Pickleball Court";
  }

  // Wellness — split SPA Sauna into Spa
  if (cat === "wellness") {
    if (name.toLowerCase().includes("sauna")) return "Recreation & Specialty Features / Sauna";
    return "Recreation & Specialty Features / Spa";
  }

  // Golf
  if (cat === "recreation") return "Recreation & Specialty Features / Golf Simulator";

  // Landscaping
  if (cat === "landscaping") return "Outdoor & Landscaping / Landscaping";

  // Perimeter (Fence)
  if (cat === "perimeter") return "Outdoor & Landscaping / Fence";

  // Structural (Retaining Walls)
  if (cat === "structural") return "Outdoor & Landscaping / Retaining Walls";

  // Paint
  if (cat === "paint") {
    if (name.includes("exterior")) return "Paint & Wall Finishes / Exterior Paint";
    return "Paint & Wall Finishes / Interior Paint";
  }

  return null;
}

function normalizeName(s: string): string {
  return s.toLowerCase().replace(/\s+/g, " ").trim();
}

async function main() {
  console.log(`\n${DRY ? "[DRY RUN]" : "[LIVE]"} Starting reseed...\n`);

  // ---------- 1. Recreate categories ----------
  if (!DRY) {
    console.log("Deleting existing categories...");
    await prisma.category.deleteMany({});
  }

  const pathToId = new Map<string, string>();

  console.log("Creating new category tree...");
  for (let pi = 0; pi < TREE.length; pi++) {
    const node = TREE[pi];
    const slug = slugify(node.name);
    let parent;
    if (DRY) {
      parent = { id: `dry-${slug}`, name: node.name };
    } else {
      parent = await prisma.category.create({
        data: { name: node.name, slug, sortOrder: pi },
      });
    }
    pathToId.set(node.name, parent.id);
    console.log(`  + ${node.name}`);

    for (let ci = 0; ci < node.children.length; ci++) {
      const childName = node.children[ci];
      const childSlug = `${slug}-${slugify(childName)}`;
      let child;
      if (DRY) {
        child = { id: `dry-${childSlug}` };
      } else {
        child = await prisma.category.create({
          data: { name: childName, slug: childSlug, parentId: parent.id, sortOrder: ci },
        });
      }
      pathToId.set(`${node.name} / ${childName}`, child.id);
      console.log(`    └ ${childName}`);
    }
  }

  // ---------- 2. Deduplicate items per section ----------
  console.log("\nLoading items grouped by section...");
  const sections = await prisma.section.findMany({
    include: {
      items: {
        include: { specs: true, images: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  const stats = {
    totalScanned: 0,
    duplicatesDeleted: 0,
    classified: 0,
    unclassified: 0,
  };
  const unmapped: { name: string; oldCategory: string | null }[] = [];

  for (const section of sections) {
    const seen = new Map<string, (typeof section.items)[number]>();
    const dupesToDelete: string[] = [];

    for (const item of section.items) {
      stats.totalScanned++;
      const key = normalizeName(item.name);
      const existing = seen.get(key);
      if (!existing) {
        seen.set(key, item);
      } else {
        // Prefer the one with more images/specs
        const score = (it: typeof item) => it.images.length * 10 + it.specs.length;
        if (score(item) > score(existing)) {
          dupesToDelete.push(existing.id);
          seen.set(key, item);
        } else {
          dupesToDelete.push(item.id);
        }
      }
    }

    if (dupesToDelete.length > 0) {
      console.log(`  ${section.name}: removing ${dupesToDelete.length} duplicate(s) (kept ${seen.size})`);
      stats.duplicatesDeleted += dupesToDelete.length;
      if (!DRY) {
        await prisma.item.deleteMany({ where: { id: { in: dupesToDelete } } });
      }
    }

    // ---------- 3. Reclassify survivors ----------
    for (const item of seen.values()) {
      const path = classify(item);
      if (!path) {
        stats.unclassified++;
        unmapped.push({ name: item.name, oldCategory: item.category });
        continue;
      }
      const newCatId = pathToId.get(path);
      if (!newCatId) {
        console.warn(`  ! Path not found in tree: "${path}" for item "${item.name}"`);
        stats.unclassified++;
        continue;
      }
      stats.classified++;
      if (!DRY) {
        await prisma.item.update({
          where: { id: item.id },
          data: { categoryId: newCatId, category: path },
        });
      }
    }
  }

  // ---------- 4. Add net-new items from documentos ----------
  console.log("\nAdding net-new items from Alpine Fireplaces invoice...");
  const greatRoom = await prisma.section.findFirst({
    where: { name: { contains: "Great Room" } },
  });
  const basement = await prisma.section.findFirst({
    where: { name: { contains: "Basement" } },
  });
  const fireplaceCatId = pathToId.get("Interior Finishes / Fireplace");

  const fireplaceItems = [
    {
      sectionId: greatRoom?.id,
      name: 'Kozy Callaway Linear Fireplace 72" (Main Level)',
      vendorName: "Alpine Fireplaces",
      vendorContact: "Gregory H Brown",
      vendorPhone: "(801) 768-8411",
      vendorRef: "INV22739 — CLW-72",
      description:
        "72-inch direct-vent linear gas fireplace with Reflective Black Midnight Glass media, dual 75 CFM fan kit, and 12 ft vertical vent kit.",
      specs: [
        { label: "Model", value: "CLW-72" },
        { label: "Width", value: '72"' },
        { label: "Glass Media", value: 'Reflective Black Midnight 1/2"' },
        { label: "Fan Kit", value: "2× 75 CFM (SL42-028)" },
        { label: "Vent Kit", value: "12 ft Vertical (58012)" },
      ],
    },
    {
      sectionId: basement?.id,
      name: 'Kozy Callaway Linear Fireplace 72" (Basement)',
      vendorName: "Alpine Fireplaces",
      vendorContact: "Gregory H Brown",
      vendorPhone: "(801) 768-8411",
      vendorRef: "INV22739 — CLW-72 (Basement)",
      description:
        "72-inch direct-vent linear gas fireplace with Reflective Black Midnight Glass media, 25 ft + 30 ft DVPRO 5x8 vertical vent run.",
      specs: [
        { label: "Model", value: "CLW-72" },
        { label: "Width", value: '72"' },
        { label: "Glass Media", value: 'Reflective Black Midnight 1/2"' },
        { label: "Vent Kit", value: "25 ft + 30 ft DVPRO 5x8" },
      ],
    },
  ];

  for (const fp of fireplaceItems) {
    if (!fp.sectionId || !fireplaceCatId) {
      console.log(`  ! Skipping ${fp.name}: missing section or category`);
      continue;
    }
    // Skip if an item with this exact name already exists in this section
    const exists = await prisma.item.findFirst({
      where: { sectionId: fp.sectionId, name: fp.name },
    });
    if (exists) {
      console.log(`  = ${fp.name}: already exists, skipping`);
      continue;
    }
    if (DRY) {
      console.log(`  + ${fp.name} (DRY)`);
      continue;
    }
    const max = await prisma.item.aggregate({
      where: { sectionId: fp.sectionId },
      _max: { sortOrder: true },
    });
    const created = await prisma.item.create({
      data: {
        sectionId: fp.sectionId,
        name: fp.name,
        category: "Interior Finishes / Fireplace",
        categoryId: fireplaceCatId,
        description: fp.description,
        vendorName: fp.vendorName,
        vendorContact: fp.vendorContact,
        vendorPhone: fp.vendorPhone,
        vendorRef: fp.vendorRef,
        sortOrder: (max._max.sortOrder ?? -1) + 1,
      },
    });
    for (let i = 0; i < fp.specs.length; i++) {
      await prisma.itemSpec.create({
        data: { itemId: created.id, label: fp.specs[i].label, value: fp.specs[i].value, sortOrder: i },
      });
    }
    console.log(`  + ${fp.name}`);
  }

  // ---------- 5. Report ----------
  console.log("\n=== Summary ===");
  console.log(`Items scanned:      ${stats.totalScanned}`);
  console.log(`Duplicates deleted: ${stats.duplicatesDeleted}`);
  console.log(`Re-classified:      ${stats.classified}`);
  console.log(`Unclassified:       ${stats.unclassified}`);

  if (unmapped.length > 0) {
    console.log("\n--- Unmapped items (need manual review) ---");
    for (const u of unmapped) {
      console.log(`  • ${u.name} [old: ${u.oldCategory || "—"}]`);
    }
  }

  console.log(`\n${DRY ? "DRY RUN complete (no changes written)." : "Done."}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
