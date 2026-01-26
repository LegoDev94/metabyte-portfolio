import { PrismaClient, Category, Prisma } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";
import { projects } from "../src/data/projects";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🚀 Starting projects seed...");
  console.log(`Found ${projects.length} projects to seed`);

  // Delete existing projects (cascade will delete related data)
  console.log("\n🗑️ Clearing existing projects...");
  await prisma.project.deleteMany();

  for (let i = 0; i < projects.length; i++) {
    const project = projects[i];
    console.log(`\n📁 [${i + 1}/${projects.length}] Creating: ${project.slug}`);

    // Create project
    const dbProject = await prisma.project.create({
      data: {
        slug: project.slug,
        title: project.title,
        subtitle: project.subtitle,
        description: project.description,
        fullDescription: project.fullDescription,
        category: project.category as Category,
        categoryLabel: project.categoryLabel,
        image: project.image,
        video: project.video ? (project.video as unknown as Prisma.InputJsonValue) : Prisma.DbNull,
        featured: project.featured || false,
        order: i,
      },
    });

    // Create Technologies
    if (project.technologies && project.technologies.length > 0) {
      console.log(`  💻 Adding ${project.technologies.length} technologies...`);
      for (let j = 0; j < project.technologies.length; j++) {
        const tech = project.technologies[j];
        await prisma.technology.create({
          data: {
            projectId: dbProject.id,
            name: tech.name,
            icon: tech.icon,
            color: tech.color,
            order: j,
          },
        });
      }
    }

    // Create Features
    if (project.features && project.features.length > 0) {
      console.log(`  ⭐ Adding ${project.features.length} features...`);
      for (let j = 0; j < project.features.length; j++) {
        const feature = project.features[j];
        await prisma.feature.create({
          data: {
            projectId: dbProject.id,
            title: feature.title,
            description: feature.description,
            icon: feature.icon,
            order: j,
          },
        });
      }
    }

    // Create Metrics
    if (project.metrics && project.metrics.length > 0) {
      console.log(`  📊 Adding ${project.metrics.length} metrics...`);
      for (let j = 0; j < project.metrics.length; j++) {
        const metric = project.metrics[j];
        await prisma.metric.create({
          data: {
            projectId: dbProject.id,
            label: metric.label,
            value: metric.value,
            icon: metric.icon,
            order: j,
          },
        });
      }
    }

    // Create Links
    if (project.links) {
      console.log(`  🔗 Adding project links...`);
      await prisma.projectLink.create({
        data: {
          projectId: dbProject.id,
          demo: project.links.demo || null,
          github: project.links.github || null,
          telegram: project.links.telegram || null,
        },
      });
    }

    console.log(`  ✅ Project created: ${project.title}`);
  }

  console.log(`\n🎉 Projects seed completed! Created ${projects.length} projects.`);
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
