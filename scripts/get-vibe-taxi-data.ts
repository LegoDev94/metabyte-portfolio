import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const cs = await prisma.caseStudy.findFirst({
    where: { project: { slug: "vibe-taxi" } },
    include: {
      translations: true,
      userFlows: { include: { translations: true, steps: { include: { translations: true } } } },
      technicalHighlights: { include: { translations: true } },
    },
  });

  console.log(JSON.stringify(cs, null, 2));

  await prisma.$disconnect();
  await pool.end();
}
main();
