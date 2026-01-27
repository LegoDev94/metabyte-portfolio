/**
 * Project Translations Migration Script
 *
 * Migrates project translation data from static files (projects.ts, projects-ro.ts)
 * to the database translation tables.
 *
 * Usage: npx tsx scripts/migrate-project-translations.ts
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// Create Prisma client with pg adapter (Prisma 7 style)
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Import static project data
// Note: These imports may fail if the files have been modified
// In that case, we'll need to handle the data manually
let projectsRu: any[] = [];
let projectsRo: any[] = [];

async function loadStaticData() {
  try {
    const ruModule = await import("../src/data/projects");
    projectsRu = ruModule.projects || [];
    console.log(`Loaded ${projectsRu.length} Russian projects from static file`);
  } catch (error) {
    console.log("Could not load Russian projects, will skip");
  }

  try {
    const roModule = await import("../src/data/projects-ro");
    projectsRo = roModule.projectsRo || [];
    console.log(`Loaded ${projectsRo.length} Romanian projects from static file`);
  } catch (error) {
    console.log("Could not load Romanian projects, will skip");
  }
}

async function migrateProjectTranslations() {
  console.log("\nMigrating project translations...");

  const dbProjects = await prisma.project.findMany({
    select: { id: true, slug: true },
  });

  for (const dbProject of dbProjects) {
    const ruProject = projectsRu.find((p) => p.slug === dbProject.slug);
    const roProject = projectsRo.find((p) => p.slug === dbProject.slug);

    if (!ruProject && !roProject) {
      console.log(`  No static data found for project: ${dbProject.slug}`);
      continue;
    }

    // Create Russian translation
    if (ruProject) {
      await prisma.projectTranslation.upsert({
        where: {
          projectId_locale: { projectId: dbProject.id, locale: "ru" },
        },
        create: {
          projectId: dbProject.id,
          locale: "ru",
          title: ruProject.title || "",
          subtitle: ruProject.subtitle || "",
          description: ruProject.description || "",
          fullDescription: ruProject.fullDescription || "",
          categoryLabel: ruProject.categoryLabel || "",
        },
        update: {
          title: ruProject.title || "",
          subtitle: ruProject.subtitle || "",
          description: ruProject.description || "",
          fullDescription: ruProject.fullDescription || "",
          categoryLabel: ruProject.categoryLabel || "",
        },
      });
      console.log(`  Created RU translation for: ${dbProject.slug}`);
    }

    // Create Romanian translation
    if (roProject) {
      await prisma.projectTranslation.upsert({
        where: {
          projectId_locale: { projectId: dbProject.id, locale: "ro" },
        },
        create: {
          projectId: dbProject.id,
          locale: "ro",
          title: roProject.title || "",
          subtitle: roProject.subtitle || "",
          description: roProject.description || "",
          fullDescription: roProject.fullDescription || "",
          categoryLabel: roProject.categoryLabel || "",
        },
        update: {
          title: roProject.title || "",
          subtitle: roProject.subtitle || "",
          description: roProject.description || "",
          fullDescription: roProject.fullDescription || "",
          categoryLabel: roProject.categoryLabel || "",
        },
      });
      console.log(`  Created RO translation for: ${dbProject.slug}`);
    }
  }
}

async function migrateFeatureTranslations() {
  console.log("\nMigrating feature translations...");

  const features = await prisma.feature.findMany({
    include: { project: { select: { slug: true } } },
  });

  for (const feature of features) {
    const ruProject = projectsRu.find((p) => p.slug === feature.project.slug);
    const roProject = projectsRo.find((p) => p.slug === feature.project.slug);

    // Find matching feature by index (features should be in same order)
    const featureIndex = features.filter((f) => f.projectId === feature.projectId).indexOf(feature);

    const ruFeature = ruProject?.features?.[featureIndex];
    const roFeature = roProject?.features?.[featureIndex];

    if (ruFeature) {
      await prisma.featureTranslation.upsert({
        where: {
          featureId_locale: { featureId: feature.id, locale: "ru" },
        },
        create: {
          featureId: feature.id,
          locale: "ru",
          title: ruFeature.title || "",
          description: ruFeature.description || "",
        },
        update: {
          title: ruFeature.title || "",
          description: ruFeature.description || "",
        },
      });
    }

    if (roFeature) {
      await prisma.featureTranslation.upsert({
        where: {
          featureId_locale: { featureId: feature.id, locale: "ro" },
        },
        create: {
          featureId: feature.id,
          locale: "ro",
          title: roFeature.title || "",
          description: roFeature.description || "",
        },
        update: {
          title: roFeature.title || "",
          description: roFeature.description || "",
        },
      });
    }
  }

  console.log(`  Migrated translations for ${features.length} features`);
}

async function migrateMetricTranslations() {
  console.log("\nMigrating metric translations...");

  const metrics = await prisma.metric.findMany({
    include: { project: { select: { slug: true } } },
  });

  for (const metric of metrics) {
    const ruProject = projectsRu.find((p) => p.slug === metric.project.slug);
    const roProject = projectsRo.find((p) => p.slug === metric.project.slug);

    // Find matching metric by value (since value is locale-independent)
    const ruMetric = ruProject?.metrics?.find((m: any) => m.value === metric.value);
    const roMetric = roProject?.metrics?.find((m: any) => m.value === metric.value);

    if (ruMetric) {
      await prisma.metricTranslation.upsert({
        where: {
          metricId_locale: { metricId: metric.id, locale: "ru" },
        },
        create: {
          metricId: metric.id,
          locale: "ru",
          label: ruMetric.label || "",
        },
        update: {
          label: ruMetric.label || "",
        },
      });
    }

    if (roMetric) {
      await prisma.metricTranslation.upsert({
        where: {
          metricId_locale: { metricId: metric.id, locale: "ro" },
        },
        create: {
          metricId: metric.id,
          locale: "ro",
          label: roMetric.label || "",
        },
        update: {
          label: roMetric.label || "",
        },
      });
    }
  }

  console.log(`  Migrated translations for ${metrics.length} metrics`);
}

async function migrateCaseStudyTranslations() {
  console.log("\nMigrating case study translations...");

  const caseStudies = await prisma.caseStudy.findMany({
    include: { project: { select: { slug: true } } },
  });

  for (const cs of caseStudies) {
    const ruProject = projectsRu.find((p) => p.slug === cs.project.slug);
    const roProject = projectsRo.find((p) => p.slug === cs.project.slug);

    const ruCaseStudy = ruProject?.caseStudy;
    const roCaseStudy = roProject?.caseStudy;

    if (ruCaseStudy) {
      await prisma.caseStudyTranslation.upsert({
        where: {
          caseStudyId_locale: { caseStudyId: cs.id, locale: "ru" },
        },
        create: {
          caseStudyId: cs.id,
          locale: "ru",
          challenge: ruCaseStudy.challenge || "",
          solution: ruCaseStudy.solution || "",
          results: ruCaseStudy.results || [],
        },
        update: {
          challenge: ruCaseStudy.challenge || "",
          solution: ruCaseStudy.solution || "",
          results: ruCaseStudy.results || [],
        },
      });
    }

    if (roCaseStudy) {
      await prisma.caseStudyTranslation.upsert({
        where: {
          caseStudyId_locale: { caseStudyId: cs.id, locale: "ro" },
        },
        create: {
          caseStudyId: cs.id,
          locale: "ro",
          challenge: roCaseStudy.challenge || "",
          solution: roCaseStudy.solution || "",
          results: roCaseStudy.results || [],
        },
        update: {
          challenge: roCaseStudy.challenge || "",
          solution: roCaseStudy.solution || "",
          results: roCaseStudy.results || [],
        },
      });
    }
  }

  console.log(`  Migrated translations for ${caseStudies.length} case studies`);
}

async function main() {
  console.log("=".repeat(50));
  console.log("Starting project translations migration...");
  console.log("=".repeat(50));

  try {
    await loadStaticData();
    await migrateProjectTranslations();
    await migrateFeatureTranslations();
    await migrateMetricTranslations();
    await migrateCaseStudyTranslations();

    console.log("\n" + "=".repeat(50));
    console.log("Project translations migration completed!");
    console.log("=".repeat(50));

    // Print summary
    const projectTransCount = await prisma.projectTranslation.count();
    const featureTransCount = await prisma.featureTranslation.count();
    const metricTransCount = await prisma.metricTranslation.count();
    const caseStudyTransCount = await prisma.caseStudyTranslation.count();

    console.log("\nSummary:");
    console.log(`  - Project Translations: ${projectTransCount}`);
    console.log(`  - Feature Translations: ${featureTransCount}`);
    console.log(`  - Metric Translations: ${metricTransCount}`);
    console.log(`  - CaseStudy Translations: ${caseStudyTransCount}`);

  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
