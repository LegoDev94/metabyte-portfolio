import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Checking Case Studies...\n");

  const caseStudies = await prisma.caseStudy.findMany({
    include: {
      project: { select: { slug: true, id: true } },
      translations: true,
      gallery: { include: { translations: true } },
      userFlows: { include: { translations: true, steps: { include: { translations: true } } } },
      technicalHighlights: { include: { translations: true } },
    },
  });

  console.log(`Total Case Studies: ${caseStudies.length}\n`);

  for (const cs of caseStudies) {
    console.log(`\n${"=".repeat(50)}`);
    console.log(`Project: ${cs.project.slug}`);
    console.log(`${"=".repeat(50)}`);
    console.log(`Translations: ${cs.translations.length}`);

    for (const t of cs.translations) {
      console.log(`  [${t.locale}] Challenge: ${t.challenge ? t.challenge.substring(0, 60) + "..." : "EMPTY"}`);
      console.log(`  [${t.locale}] Solution: ${t.solution ? t.solution.substring(0, 60) + "..." : "EMPTY"}`);
      console.log(`  [${t.locale}] Results: ${t.results?.length || 0} items`);
    }

    console.log(`Gallery items: ${cs.gallery.length}`);
    console.log(`User Flows: ${cs.userFlows.length}`);
    console.log(`Technical Highlights: ${cs.technicalHighlights.length}`);
  }

  // Also check projects without case studies
  const projectsWithoutCS = await prisma.project.findMany({
    where: { caseStudy: null },
    select: { slug: true },
  });

  if (projectsWithoutCS.length > 0) {
    console.log(`\n\nProjects WITHOUT Case Studies: ${projectsWithoutCS.length}`);
    for (const p of projectsWithoutCS) {
      console.log(`  - ${p.slug}`);
    }
  }

  await prisma.$disconnect();
  await pool.end();
}

main().catch(console.error);
