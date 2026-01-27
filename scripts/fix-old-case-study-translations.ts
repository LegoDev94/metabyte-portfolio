/**
 * Fix Old Case Study Translations
 * Adds missing translations for user flows and technical highlights
 * from static project files to the database
 *
 * Usage: npx tsx scripts/fix-old-case-study-translations.ts
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// Import static data
import { projects as projectsRu } from "../src/data/projects";
import { projects as projectsRo } from "../src/data/projects-ro";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Old projects that need translations fixed (created before the i18n update)
const oldProjectSlugs = [
  "wasteland-arena",
  "giftpool",
  "mubarakway",
  "kmo24",
  "betanalitics",
  "neoproxy",
  "fancy-app",
];

async function main() {
  console.log("=".repeat(60));
  console.log("Fixing old case study translations");
  console.log("=".repeat(60));

  for (const slug of oldProjectSlugs) {
    console.log(`\nProcessing: ${slug}`);

    // Get project from database with case study data
    const dbProject = await prisma.project.findUnique({
      where: { slug },
      include: {
        caseStudy: {
          include: {
            userFlows: {
              include: { translations: true, steps: { include: { translations: true } } },
              orderBy: { order: "asc" },
            },
            technicalHighlights: {
              include: { translations: true },
              orderBy: { order: "asc" },
            },
          },
        },
      },
    });

    if (!dbProject?.caseStudy) {
      console.log(`  No case study found for ${slug}`);
      continue;
    }

    // Get static data
    const staticRu = projectsRu.find((p) => p.slug === slug);
    const staticRo = projectsRo.find((p) => p.slug === slug);

    if (!staticRu?.caseStudy || !staticRo?.caseStudy) {
      console.log(`  No static case study data for ${slug}`);
      continue;
    }

    const caseStudy = dbProject.caseStudy;

    // Fix User Flow translations
    if (caseStudy.userFlows && staticRu.caseStudy.userFlows && staticRo.caseStudy.userFlows) {
      for (let i = 0; i < caseStudy.userFlows.length; i++) {
        const dbFlow = caseStudy.userFlows[i];
        const staticFlowRu = staticRu.caseStudy.userFlows[i];
        const staticFlowRo = staticRo.caseStudy.userFlows[i];

        if (!staticFlowRu || !staticFlowRo) continue;

        // Add flow translations if missing
        if (dbFlow.translations.length === 0) {
          await prisma.userFlowTranslation.createMany({
            data: [
              { flowId: dbFlow.id, locale: "ru", title: staticFlowRu.title, description: staticFlowRu.description },
              { flowId: dbFlow.id, locale: "ro", title: staticFlowRo.title, description: staticFlowRo.description },
            ],
          });
          console.log(`  Added flow translations: ${staticFlowRu.title}`);
        }

        // Add step translations if missing
        for (let j = 0; j < dbFlow.steps.length; j++) {
          const dbStep = dbFlow.steps[j];
          const staticStepRu = staticFlowRu.steps?.[j];
          const staticStepRo = staticFlowRo.steps?.[j];

          if (!staticStepRu || !staticStepRo) continue;

          if (dbStep.translations.length === 0) {
            await prisma.userFlowStepTranslation.createMany({
              data: [
                { stepId: dbStep.id, locale: "ru", title: staticStepRu.title, description: staticStepRu.description },
                { stepId: dbStep.id, locale: "ro", title: staticStepRo.title, description: staticStepRo.description },
              ],
            });
          }
        }
      }
      console.log(`  Fixed ${caseStudy.userFlows.length} user flows`);
    }

    // Fix Technical Highlight translations
    if (caseStudy.technicalHighlights && staticRu.caseStudy.technicalHighlights && staticRo.caseStudy.technicalHighlights) {
      for (let i = 0; i < caseStudy.technicalHighlights.length; i++) {
        const dbHl = caseStudy.technicalHighlights[i];
        const staticHlRu = staticRu.caseStudy.technicalHighlights[i];
        const staticHlRo = staticRo.caseStudy.technicalHighlights[i];

        if (!staticHlRu || !staticHlRo) continue;

        if (dbHl.translations.length === 0) {
          await prisma.technicalHighlightTranslation.createMany({
            data: [
              {
                highlightId: dbHl.id,
                locale: "ru",
                title: staticHlRu.title,
                description: staticHlRu.description,
                tags: staticHlRu.tags || [],
              },
              {
                highlightId: dbHl.id,
                locale: "ro",
                title: staticHlRo.title,
                description: staticHlRo.description,
                tags: staticHlRo.tags || [],
              },
            ],
          });
          console.log(`  Added highlight translations: ${staticHlRu.title}`);
        }
      }
      console.log(`  Fixed ${caseStudy.technicalHighlights.length} technical highlights`);
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log("All old case study translations fixed!");
  console.log("=".repeat(60));

  await prisma.$disconnect();
  await pool.end();
}

main().catch(console.error);
