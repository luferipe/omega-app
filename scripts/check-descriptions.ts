import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const total = await prisma.item.count();
  const withDesc = await prisma.item.count({ where: { description: { not: null } } });
  const withoutDesc = total - withDesc;

  console.log(`\nTotal items: ${total}`);
  console.log(`With description:    ${withDesc}`);
  console.log(`Without description: ${withoutDesc}\n`);

  const missing = await prisma.item.findMany({
    where: { description: null },
    select: { name: true, category: true, section: { select: { name: true } } },
    orderBy: [{ section: { name: "asc" } }, { name: "asc" }],
  });

  let currentSection = "";
  for (const item of missing) {
    if (item.section.name !== currentSection) {
      currentSection = item.section.name;
      console.log(`\n-- ${currentSection} --`);
    }
    console.log(`  • ${item.name}  [${item.category || "—"}]`);
  }
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
