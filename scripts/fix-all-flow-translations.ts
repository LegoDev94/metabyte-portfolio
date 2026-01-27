/**
 * Fix All Flow Translations
 * Deletes and recreates ALL user flow and technical highlight translations
 * from static project files
 *
 * Usage: npx tsx scripts/fix-all-flow-translations.ts
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// Import static data
import { projects as projectsRu } from "../src/data/projects.js";
import { projectsRo } from "../src/data/projects-ro.js";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Old projects that need translations fixed
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
  console.log("Fixing ALL flow translations (delete + recreate)");
  console.log("=".repeat(60));

  for (const slug of oldProjectSlugs) {
    console.log(`\n${"=".repeat(40)}`);
    console.log(`Processing: ${slug}`);
    console.log("=".repeat(40));

    // Get project from database with case study data
    const dbProject = await prisma.project.findUnique({
      where: { slug },
      include: {
        caseStudy: {
          include: {
            userFlows: {
              include: { steps: true },
              orderBy: { order: "asc" },
            },
            technicalHighlights: {
              orderBy: { order: "asc" },
            },
          },
        },
      },
    });

    if (!dbProject?.caseStudy) {
      console.log(`  No case study found`);
      continue;
    }

    // Get static data
    const staticRu = projectsRu.find((p) => p.slug === slug);
    const staticRo = projectsRo.find((p) => p.slug === slug);

    if (!staticRu?.caseStudy || !staticRo?.caseStudy) {
      console.log(`  No static case study data`);
      continue;
    }

    const cs = dbProject.caseStudy;
    const csRu = staticRu.caseStudy;
    const csRo = staticRo.caseStudy;

    // ===== FIX USER FLOWS =====
    if (cs.userFlows && csRu.userFlows && csRo.userFlows) {
      console.log(`\n  User Flows: ${cs.userFlows.length} in DB, ${csRu.userFlows.length} in static`);

      for (let i = 0; i < cs.userFlows.length; i++) {
        const dbFlow = cs.userFlows[i];
        const staticFlowRu = csRu.userFlows[i];
        const staticFlowRo = csRo.userFlows[i];

        if (!staticFlowRu || !staticFlowRo) {
          console.log(`    Flow ${i}: No static data`);
          continue;
        }

        // Delete existing translations
        await prisma.userFlowTranslation.deleteMany({
          where: { flowId: dbFlow.id },
        });

        // Create new translations
        await prisma.userFlowTranslation.createMany({
          data: [
            { flowId: dbFlow.id, locale: "ru", title: staticFlowRu.title, description: staticFlowRu.description },
            { flowId: dbFlow.id, locale: "ro", title: staticFlowRo.title, description: staticFlowRo.description },
          ],
        });
        console.log(`    Flow ${i}: ${staticFlowRu.title}`);

        // Fix steps
        if (dbFlow.steps && staticFlowRu.steps && staticFlowRo.steps) {
          for (let j = 0; j < dbFlow.steps.length; j++) {
            const dbStep = dbFlow.steps[j];
            const staticStepRu = staticFlowRu.steps[j];
            const staticStepRo = staticFlowRo.steps[j];

            if (!staticStepRu || !staticStepRo) continue;

            // Delete existing translations
            await prisma.userFlowStepTranslation.deleteMany({
              where: { stepId: dbStep.id },
            });

            // Create new translations
            await prisma.userFlowStepTranslation.createMany({
              data: [
                { stepId: dbStep.id, locale: "ru", title: staticStepRu.title, description: staticStepRu.description },
                { stepId: dbStep.id, locale: "ro", title: staticStepRo.title, description: staticStepRo.description },
              ],
            });
          }
          console.log(`      Steps: ${dbFlow.steps.length} fixed`);
        }
      }
    }

    // ===== FIX TECHNICAL HIGHLIGHTS =====
    if (cs.technicalHighlights && csRu.technicalHighlights && csRo.technicalHighlights) {
      console.log(`\n  Technical Highlights: ${cs.technicalHighlights.length} in DB, ${csRu.technicalHighlights.length} in static`);

      for (let i = 0; i < cs.technicalHighlights.length; i++) {
        const dbHl = cs.technicalHighlights[i];
        const staticHlRu = csRu.technicalHighlights[i];
        const staticHlRo = csRo.technicalHighlights[i];

        if (!staticHlRu || !staticHlRo) {
          console.log(`    Highlight ${i}: No static data`);
          continue;
        }

        // Delete existing translations
        await prisma.technicalHighlightTranslation.deleteMany({
          where: { highlightId: dbHl.id },
        });

        // Create new translations
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
        console.log(`    Highlight ${i}: ${staticHlRu.title}`);
      }
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log("All translations fixed!");
  console.log("=".repeat(60));

  await prisma.$disconnect();
  await pool.end();
}

main().catch(console.error);
