// Prisma configuration for Supabase
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Transaction pooler (port 6543) for app queries
    url: process.env["DATABASE_URL"],
    // Session pooler (port 5432) for migrations
    directUrl: process.env["DIRECT_URL"],
  },
});
