import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const projects = await prisma.project.findMany({
    where: { caseStudy: null },
    include: {
      translations: true,
      technologies: true,
      features: { include: { translations: true } },
      metrics: { include: { translations: true } },
    },
  });

  for (const p of projects) {
    console.log("\n" + "=".repeat(60));
    console.log("Slug:", p.slug);
    console.log("Category:", p.category);
    console.log("Technologies:", p.technologies.map((t) => t.name).join(", "));
    console.log("Features:", p.features.length);
    console.log("Metrics:", p.metrics.length);
    for (const t of p.translations) {
      console.log(`[${t.locale}] ${t.title}`);
      console.log(`  ${t.description}`);
    }
  }

  await prisma.$disconnect();
  await pool.end();
}
main();
