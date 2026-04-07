import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // Find items whose name suggests a category different from their current assignment
  const suspects = [
    { name: "Door & Cabinet Hardware", expectedPath: "Interior Finishes / Door & Cabinet Hardware" },
    { name: "Built-in Grill Station", expectedPath: "Exterior Finishes / Built-In Grill Station" },
  ];

  for (const s of suspects) {
    const items = await prisma.item.findMany({
      where: { name: s.name },
      select: { id: true, name: true, category: true, categoryId: true },
    });
    console.log(`\n"${s.name}":`);
    for (const it of items) {
      console.log(`  current: ${it.category}`);
      console.log(`  should:  ${s.expectedPath}`);
    }
  }
}
main().then(() => process.exit(0));
