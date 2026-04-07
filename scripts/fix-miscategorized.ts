import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function moveItemToCategory(itemName: string, categorySlug: string) {
  const cat = await prisma.category.findUnique({
    where: { slug: categorySlug },
    include: { parent: true },
  });
  if (!cat) throw new Error(`Category not found: ${categorySlug}`);
  const catPath = cat.parent ? `${cat.parent.name} / ${cat.name}` : cat.name;

  const res = await prisma.item.updateMany({
    where: { name: itemName },
    data: { categoryId: cat.id, category: catPath },
  });
  console.log(`  ${itemName} -> ${catPath} (${res.count} updated)`);
}

async function main() {
  await moveItemToCategory("Door & Cabinet Hardware", "interior-finishes-door-cabinet-hardware");
  await moveItemToCategory("Built-in Grill Station", "exterior-finishes-built-in-grill-station");
  console.log("Done.");
}
main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
