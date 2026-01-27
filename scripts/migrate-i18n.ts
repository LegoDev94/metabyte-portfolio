/**
 * i18n Migration Script
 *
 * Migrates static translation data to the database:
 * 1. Creates locales (ru, ro)
 * 2. Migrates UI strings from messages/*.json
 * 3. Creates project category translations
 *
 * Usage: npx tsx scripts/migrate-i18n.ts
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import * as fs from "fs";
import * as path from "path";

// Create Prisma client with pg adapter (Prisma 7 style)
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Flatten nested JSON object into dot-notation keys
function flattenObject(obj: any, prefix = ""): Array<[string, string]> {
  const result: Array<[string, string]> = [];

  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      result.push(...flattenObject(value, fullKey));
    } else if (typeof value === "string") {
      result.push([fullKey, value]);
    }
  }

  return result;
}

// Get namespace from key (first part before dot)
function getNamespace(key: string): string | null {
  const parts = key.split(".");
  return parts.length > 1 ? parts[0] : null;
}

async function migrateLocales() {
  console.log("Creating locales...");

  const locales = [
    { code: "ru", name: "Russian", nativeName: "Русский", isDefault: true, isActive: true },
    { code: "ro", name: "Romanian", nativeName: "Română", isDefault: false, isActive: true },
  ];

  for (const locale of locales) {
    await prisma.locale.upsert({
      where: { code: locale.code },
      create: locale,
      update: locale,
    });
    console.log(`  Created locale: ${locale.code} (${locale.nativeName})`);
  }
}

async function migrateUIStrings() {
  console.log("Migrating UI strings...");

  // Read message files
  const messagesDir = path.join(process.cwd(), "messages");
  const ruPath = path.join(messagesDir, "ru.json");
  const roPath = path.join(messagesDir, "ro.json");

  if (!fs.existsSync(ruPath) || !fs.existsSync(roPath)) {
    console.log("  Warning: Message files not found, skipping UI strings migration");
    return;
  }

  const ruMessages = JSON.parse(fs.readFileSync(ruPath, "utf-8"));
  const roMessages = JSON.parse(fs.readFileSync(roPath, "utf-8"));

  // Flatten messages
  const ruStrings = flattenObject(ruMessages);
  const roStrings = flattenObject(roMessages);

  console.log(`  Found ${ruStrings.length} Russian strings`);
  console.log(`  Found ${roStrings.length} Romanian strings`);

  // Delete existing UI strings to avoid duplicates
  await prisma.uIString.deleteMany({});
  console.log("  Cleared existing UI strings");

  // Insert Russian strings
  console.log("  Inserting Russian strings...");
  for (const [key, value] of ruStrings) {
    const namespace = getNamespace(key);
    await prisma.uIString.create({
      data: { key, locale: "ru", value, namespace },
    });
  }

  // Insert Romanian strings
  console.log("  Inserting Romanian strings...");
  for (const [key, value] of roStrings) {
    const namespace = getNamespace(key);
    await prisma.uIString.create({
      data: { key, locale: "ro", value, namespace },
    });
  }

  console.log(`  Migrated ${ruStrings.length + roStrings.length} UI strings`);
}

async function migrateProjectCategories() {
  console.log("Migrating project categories...");

  const categories = [
    {
      value: "games",
      order: 1,
      translations: [
        { locale: "ru", label: "Игры" },
        { locale: "ro", label: "Jocuri" },
      ],
    },
    {
      value: "fintech",
      order: 2,
      translations: [
        { locale: "ru", label: "FinTech" },
        { locale: "ro", label: "FinTech" },
      ],
    },
    {
      value: "mobile",
      order: 3,
      translations: [
        { locale: "ru", label: "Мобильные" },
        { locale: "ro", label: "Mobile" },
      ],
    },
    {
      value: "enterprise",
      order: 4,
      translations: [
        { locale: "ru", label: "Enterprise" },
        { locale: "ro", label: "Enterprise" },
      ],
    },
    {
      value: "automation",
      order: 5,
      translations: [
        { locale: "ru", label: "Автоматизация" },
        { locale: "ro", label: "Automatizare" },
      ],
    },
  ];

  for (const cat of categories) {
    // Create or update category
    const category = await prisma.projectCategory.upsert({
      where: { value: cat.value },
      create: { value: cat.value, order: cat.order },
      update: { order: cat.order },
    });

    // Create translations
    for (const trans of cat.translations) {
      await prisma.projectCategoryTranslation.upsert({
        where: {
          categoryId_locale: {
            categoryId: category.id,
            locale: trans.locale,
          },
        },
        create: {
          categoryId: category.id,
          locale: trans.locale,
          label: trans.label,
        },
        update: {
          label: trans.label,
        },
      });
    }

    console.log(`  Created category: ${cat.value}`);
  }
}

async function createSampleProjectTranslations() {
  console.log("Creating sample project translations...");

  // Check if there are any projects in the database
  const projectCount = await prisma.project.count();

  if (projectCount === 0) {
    console.log("  No projects found in database, skipping project translations");
    return;
  }

  // Get all projects
  const projects = await prisma.project.findMany({
    select: { id: true, slug: true },
  });

  console.log(`  Found ${projects.length} projects`);

  // For each project, check if translations exist
  for (const project of projects) {
    const existingTranslations = await prisma.projectTranslation.count({
      where: { projectId: project.id },
    });

    if (existingTranslations === 0) {
      console.log(`  Project ${project.slug} has no translations - please migrate manually`);
    } else {
      console.log(`  Project ${project.slug} already has ${existingTranslations} translation(s)`);
    }
  }
}

async function main() {
  console.log("=".repeat(50));
  console.log("Starting i18n migration...");
  console.log("=".repeat(50));

  try {
    await migrateLocales();
    await migrateUIStrings();
    await migrateProjectCategories();
    await createSampleProjectTranslations();

    console.log("=".repeat(50));
    console.log("Migration completed successfully!");
    console.log("=".repeat(50));

    // Print summary
    const uiStringCount = await prisma.uIString.count();
    const localeCount = await prisma.locale.count();
    const categoryCount = await prisma.projectCategory.count();

    console.log("\nSummary:");
    console.log(`  - Locales: ${localeCount}`);
    console.log(`  - UI Strings: ${uiStringCount}`);
    console.log(`  - Project Categories: ${categoryCount}`);

  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
