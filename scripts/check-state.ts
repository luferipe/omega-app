import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const projects = await prisma.project.findMany({
    include: {
      sections: {
        include: {
          items: { select: { name: true, category: true } },
          _count: { select: { items: true } },
        },
      },
    },
  });
  for (const p of projects) {
    console.log(`\n=== ${p.name} (${p.slug}) ===`);
    for (const s of p.sections) {
      console.log(`  -- ${s.name}: ${s._count.items} items`);
      for (const it of s.items) {
        console.log(`     * ${it.name}  [${it.category || "—"}]`);
      }
    }
  }
  const totalItems = await prisma.item.count();
  const totalCats = await prisma.category.count();
  console.log(`\nTotal items: ${totalItems}, total categories: ${totalCats}`);
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
