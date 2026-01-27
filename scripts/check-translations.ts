import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // Check user flow translations count
  const flowTransCount = await prisma.userFlowTranslation.count();
  const stepTransCount = await prisma.userFlowStepTranslation.count();
  const hlTransCount = await prisma.technicalHighlightTranslation.count();

  console.log("UserFlowTranslation count:", flowTransCount);
  console.log("UserFlowStepTranslation count:", stepTransCount);
  console.log("TechnicalHighlightTranslation count:", hlTransCount);

  // Check all case studies with missing translations
  const caseStudies = await prisma.caseStudy.findMany({
    include: {
      project: { select: { slug: true } },
      userFlows: { include: { translations: true, steps: { include: { translations: true } } } },
      technicalHighlights: { include: { translations: true } },
    },
  });

  console.log("\n=== Case Studies Translation Status ===\n");

  for (const cs of caseStudies) {
    const flowsWithoutTrans = cs.userFlows.filter((f) => f.translations.length === 0);
    const stepsWithoutTrans = cs.userFlows.flatMap((f) => f.steps.filter((s) => s.translations.length === 0));
    const hlWithoutTrans = cs.technicalHighlights.filter((h) => h.translations.length === 0);

    if (flowsWithoutTrans.length > 0 || stepsWithoutTrans.length > 0 || hlWithoutTrans.length > 0) {
      console.log(`${cs.project.slug}:`);
      if (flowsWithoutTrans.length > 0) console.log(`  - ${flowsWithoutTrans.length} flows without translations`);
      if (stepsWithoutTrans.length > 0) console.log(`  - ${stepsWithoutTrans.length} steps without translations`);
      if (hlWithoutTrans.length > 0) console.log(`  - ${hlWithoutTrans.length} highlights without translations`);
    }
  }

  await prisma.$disconnect();
  await pool.end();
}
main();
