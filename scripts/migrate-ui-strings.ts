/**
 * Migrate UI Strings to Database
 * Transfers all translations from messages/*.json to UIString table
 *
 * Usage: npx tsx scripts/migrate-ui-strings.ts
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import * as fs from "fs";
import * as path from "path";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Flatten nested JSON object to dot-notation keys
function flattenObject(
  obj: Record<string, unknown>,
  prefix = ""
): Record<string, string> {
  const result: Record<string, string> = {};

  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      Object.assign(result, flattenObject(value as Record<string, unknown>, newKey));
    } else {
      result[newKey] = String(value);
    }
  }

  return result;
}

// Extract namespace from key (first part before dot)
function getNamespace(key: string): string {
  return key.split(".")[0];
}

async function main() {
  console.log("=".repeat(60));
  console.log("Migrating UI strings to database");
  console.log("=".repeat(60));

  const messagesDir = path.join(process.cwd(), "messages");

  // Load JSON files
  const ruPath = path.join(messagesDir, "ru.json");
  const roPath = path.join(messagesDir, "ro.json");

  if (!fs.existsSync(ruPath) || !fs.existsSync(roPath)) {
    console.error("Messages files not found!");
    process.exit(1);
  }

  const ruMessages = JSON.parse(fs.readFileSync(ruPath, "utf-8"));
  const roMessages = JSON.parse(fs.readFileSync(roPath, "utf-8"));

  // Flatten to dot-notation
  const ruFlat = flattenObject(ruMessages);
  const roFlat = flattenObject(roMessages);

  console.log(`\nRU keys: ${Object.keys(ruFlat).length}`);
  console.log(`RO keys: ${Object.keys(roFlat).length}`);

  // Get all unique keys
  const allKeys = new Set([...Object.keys(ruFlat), ...Object.keys(roFlat)]);
  console.log(`Total unique keys: ${allKeys.size}`);

  // Check existing strings in database
  const existingCount = await prisma.uIString.count();
  console.log(`\nExisting UI strings in DB: ${existingCount}`);

  if (existingCount > 0) {
    console.log("Clearing existing UI strings...");
    await prisma.uIString.deleteMany({});
  }

  // Prepare data for bulk insert
  const uiStrings: Array<{
    key: string;
    locale: string;
    value: string;
    namespace: string;
  }> = [];

  for (const key of allKeys) {
    const namespace = getNamespace(key);

    // Add RU translation
    if (ruFlat[key]) {
      uiStrings.push({
        key,
        locale: "ru",
        value: ruFlat[key],
        namespace,
      });
    }

    // Add RO translation
    if (roFlat[key]) {
      uiStrings.push({
        key,
        locale: "ro",
        value: roFlat[key],
        namespace,
      });
    }
  }

  console.log(`\nInserting ${uiStrings.length} UI strings...`);

  // Bulk insert
  const result = await prisma.uIString.createMany({
    data: uiStrings,
  });

  console.log(`Inserted: ${result.count} records`);

  // Verify by namespace
  console.log("\n" + "-".repeat(40));
  console.log("Strings by namespace:");
  console.log("-".repeat(40));

  const namespaces = [...new Set(uiStrings.map((s) => s.namespace))];
  for (const ns of namespaces.sort()) {
    const count = uiStrings.filter((s) => s.namespace === ns).length;
    console.log(`  ${ns}: ${count / 2} keys (${count} translations)`);
  }

  // Sample output
  console.log("\n" + "-".repeat(40));
  console.log("Sample entries:");
  console.log("-".repeat(40));

  const samples = await prisma.uIString.findMany({
    take: 10,
    orderBy: { key: "asc" },
  });

  for (const s of samples) {
    console.log(`  [${s.locale}] ${s.key}: "${s.value.substring(0, 40)}${s.value.length > 40 ? "..." : ""}"`);
  }

  console.log("\n" + "=".repeat(60));
  console.log("Migration complete!");
  console.log("=".repeat(60));

  await prisma.$disconnect();
  await pool.end();
}

main().catch(console.error);
