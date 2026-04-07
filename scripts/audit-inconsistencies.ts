/**
 * Scan the database for data inconsistencies.
 */
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const issues: string[] = [];

  // 1. Items with categoryId but no categoryRef (stale FK)
  const withBadFk = await prisma.item.findMany({
    where: { categoryId: { not: null }, categoryRef: null },
    select: { id: true, name: true, categoryId: true },
  });
  if (withBadFk.length > 0) {
    issues.push(`[1] ${withBadFk.length} items have categoryId pointing to missing Category row`);
    for (const it of withBadFk) console.log(`    - ${it.name} -> ${it.categoryId}`);
  }

  // 2. Items with categoryId set but category string out of sync
  const items = await prisma.item.findMany({
    include: { categoryRef: { include: { parent: true } } },
  });
  const mismatched: { name: string; cat: string | null; expected: string }[] = [];
  for (const it of items) {
    if (!it.categoryRef) continue;
    const expected = it.categoryRef.parent
      ? `${it.categoryRef.parent.name} / ${it.categoryRef.name}`
      : it.categoryRef.name;
    if (it.category !== expected) {
      mismatched.push({ name: it.name, cat: it.category, expected });
    }
  }
  if (mismatched.length > 0) {
    issues.push(`[2] ${mismatched.length} items have category string out of sync with categoryRef`);
    for (const m of mismatched.slice(0, 10)) {
      console.log(`    - ${m.name}\n      got:      "${m.cat}"\n      expected: "${m.expected}"`);
    }
    if (mismatched.length > 10) console.log(`    ... and ${mismatched.length - 10} more`);
  }

  // 3. Items with category string but no categoryId (orphan denormalized)
  const orphanStr = await prisma.item.findMany({
    where: { categoryId: null, category: { not: null } },
    select: { id: true, name: true, category: true },
  });
  if (orphanStr.length > 0) {
    issues.push(`[3] ${orphanStr.length} items have category string but no categoryId FK`);
    for (const it of orphanStr.slice(0, 5)) console.log(`    - ${it.name} [${it.category}]`);
  }

  // 4. Duplicate item names within same section
  const sections = await prisma.section.findMany({
    include: { items: { select: { name: true } } },
  });
  let dupGroups = 0;
  for (const s of sections) {
    const counts = new Map<string, number>();
    for (const it of s.items) counts.set(it.name, (counts.get(it.name) ?? 0) + 1);
    const dups = [...counts.entries()].filter(([, c]) => c > 1);
    if (dups.length > 0) {
      dupGroups++;
      console.log(`    section "${s.name}": ${dups.map(([n, c]) => `${n} ×${c}`).join(", ")}`);
    }
  }
  if (dupGroups > 0) issues.push(`[4] ${dupGroups} section(s) contain duplicate item names`);

  // 5. Empty sections
  const emptySections = await prisma.section.findMany({
    where: { items: { none: {} } },
    include: { project: { select: { name: true } } },
  });
  if (emptySections.length > 0) {
    issues.push(`[5] ${emptySections.length} empty section(s)`);
    for (const s of emptySections) console.log(`    - ${s.project.name} / ${s.name}`);
  }

  // 6. Empty categories (no items and no children)
  const cats = await prisma.category.findMany({
    include: { _count: { select: { items: true, children: true } } },
  });
  const emptyCats = cats.filter((c) => c._count.items === 0 && c._count.children === 0);
  if (emptyCats.length > 0) {
    issues.push(`[6] ${emptyCats.length} empty categor(ies) (no items, no children)`);
    for (const c of emptyCats) console.log(`    - ${c.name}`);
  }

  // 7. Slug collisions on categories
  const slugGroups = new Map<string, string[]>();
  for (const c of cats) {
    if (!slugGroups.has(c.slug)) slugGroups.set(c.slug, []);
    slugGroups.get(c.slug)!.push(c.name);
  }
  const slugDups = [...slugGroups.entries()].filter(([, names]) => names.length > 1);
  if (slugDups.length > 0) {
    issues.push(`[7] ${slugDups.length} category slug collision(s)`);
    for (const [slug, names] of slugDups) console.log(`    - slug "${slug}" used by: ${names.join(", ")}`);
  }

  // 8-10. Orphan FK checks skipped — relations are required by schema.

  // 11. Multiple primary images per item
  const primaryByItem = new Map<string, number>();
  const allImages = await prisma.itemImage.findMany({ where: { isPrimary: true }, select: { itemId: true } });
  for (const img of allImages) primaryByItem.set(img.itemId, (primaryByItem.get(img.itemId) ?? 0) + 1);
  const multiPrimary = [...primaryByItem.entries()].filter(([, c]) => c > 1);
  if (multiPrimary.length > 0) {
    issues.push(`[11] ${multiPrimary.length} items with more than one primary image`);
  }

  // 12. Items with images but none marked primary
  const itemsWithImgs = await prisma.item.findMany({
    where: { images: { some: {} } },
    include: { images: true },
  });
  const noPrimary = itemsWithImgs.filter((it) => !it.images.some((img) => img.isPrimary));
  if (noPrimary.length > 0) {
    issues.push(`[12] ${noPrimary.length} items with images but no primary image set`);
    for (const it of noPrimary) console.log(`    - ${it.name}`);
  }

  // Summary
  console.log("\n=== Summary ===");
  if (issues.length === 0) {
    console.log("No inconsistencies found.");
  } else {
    for (const i of issues) console.log(`  ${i}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((e) => { console.error(e); process.exit(1); });
