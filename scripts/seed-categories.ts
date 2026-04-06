import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const TREE: { name: string; children?: string[] }[] = [
  { name: "Appliance" },
  { name: "Built-in Grill Station" },
  { name: "Cabinet" },
  { name: "Carpet" },
  { name: "Countertop" },
  { name: "Court Finishing" },
  { name: "Deck" },
  { name: "Electrical Fixtures" },
  { name: "Exterior Door" },
  { name: "Finish Carpentry", children: ["Baseboards / Casing", "Walls"] },
  { name: "Fireplace" },
  { name: "Garage Doors" },
  { name: "Golf Simulator" },
  { name: "Hardware" },
  { name: "Hardwood Floor" },
  { name: "Heating / Air Conditioning" },
  { name: "Interior Doors" },
  { name: "Interior Railing" },
  { name: "Landscaping", children: ["Fence", "Retaining Walls"] },
  { name: "Masonry Materials" },
  { name: "Mirrors / Shower Enclosure" },
  { name: "Painting" },
  { name: "Pickleball Court" },
  { name: "Plumbing Fixtures" },
  { name: "Roof Material / Labor" },
  { name: "Siding / Shake" },
  { name: "Soffit / Facia / Gutters" },
  { name: "SPA Sauna" },
  { name: "Stucco" },
  { name: "Swimming Pool" },
  { name: "Tile Material" },
  { name: "Windows / Patio Doors" },
];

async function main() {
  console.log("Seeding categories...");

  for (let i = 0; i < TREE.length; i++) {
    const node = TREE[i];
    const slug = slugify(node.name);
    const parent = await prisma.category.upsert({
      where: { slug },
      update: { name: node.name, sortOrder: i },
      create: { name: node.name, slug, sortOrder: i },
    });

    if (node.children) {
      for (let j = 0; j < node.children.length; j++) {
        const childName = node.children[j];
        const childSlug = `${slug}-${slugify(childName)}`;
        await prisma.category.upsert({
          where: { slug: childSlug },
          update: { name: childName, parentId: parent.id, sortOrder: j },
          create: { name: childName, slug: childSlug, parentId: parent.id, sortOrder: j },
        });
      }
    }
  }

  console.log("Migrating existing item categories...");
  const items = await prisma.item.findMany({
    where: { category: { not: null }, categoryId: null },
  });

  for (const item of items) {
    if (!item.category) continue;
    // Try exact match first
    let cat = await prisma.category.findFirst({
      where: { name: { equals: item.category, mode: "insensitive" } },
    });
    if (cat) {
      await prisma.item.update({
        where: { id: item.id },
        data: { categoryId: cat.id, category: cat.name },
      });
      console.log(`  ${item.name} -> ${cat.name}`);
    } else {
      console.log(`  ${item.name}: no match for "${item.category}"`);
    }
  }

  console.log("Done.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
