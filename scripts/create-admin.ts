import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import pg from "pg";
import bcrypt from "bcryptjs";

const { Pool } = pg;

async function main() {
  // Get admin credentials from args or environment
  const email = process.argv[2] || process.env.ADMIN_EMAIL || "admin@metabyte.md";
  const password = process.argv[3] || process.env.ADMIN_PASSWORD || "admin123";
  const name = process.argv[4] || "Admin";

  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set");
    process.exit(1);
  }

  // Create PostgreSQL pool
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  // Create Prisma client with pg adapter
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Check if admin already exists
    const existingAdmin = await prisma.adminUser.findUnique({
      where: { email },
    });

    if (existingAdmin) {
      console.log(`Admin user already exists: ${email}`);
      console.log("Updating password...");

      await prisma.adminUser.update({
        where: { email },
        data: { passwordHash },
      });

      console.log("Password updated successfully!");
    } else {
      // Create admin user
      const admin = await prisma.adminUser.create({
        data: {
          email,
          passwordHash,
          name,
          role: "SUPER_ADMIN",
          isActive: true,
        },
      });

      console.log("Admin user created successfully!");
      console.log(`Email: ${admin.email}`);
      console.log(`Name: ${admin.name}`);
      console.log(`Role: ${admin.role}`);
    }

    console.log("\nYou can now login at /admin/login");
  } catch (error) {
    console.error("Error creating admin:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
