import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";
import { projects } from "../src/data/projects";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🎯 Starting case studies seed...");

  // Get all projects that have case studies
  const projectsWithCaseStudies = projects.filter((p) => p.caseStudy);

  console.log(`Found ${projectsWithCaseStudies.length} projects with case studies`);

  for (const project of projectsWithCaseStudies) {
    console.log(`\n📁 Processing: ${project.slug}`);

    // Find project in database
    const dbProject = await prisma.project.findUnique({
      where: { slug: project.slug },
      include: { caseStudy: true },
    });

    if (!dbProject) {
      console.log(`  ⚠️ Project not found in database, skipping...`);
      continue;
    }

    // Delete existing case study if exists
    if (dbProject.caseStudy) {
      console.log(`  🗑️ Deleting existing case study...`);
      await prisma.caseStudy.delete({
        where: { id: dbProject.caseStudy.id },
      });
    }

    const cs = project.caseStudy!;

    // Create case study
    console.log(`  📝 Creating case study...`);
    const caseStudy = await prisma.caseStudy.create({
      data: {
        projectId: dbProject.id,
        challenge: cs.challenge || "",
        solution: cs.solution || "",
        results: cs.results || [],
      },
    });

    // Create Performance metrics
    if (cs.performance) {
      console.log(`  📊 Adding performance metrics...`);
      await prisma.performance.create({
        data: {
          caseStudyId: caseStudy.id,
          score: cs.performance.score,
          accessibility: cs.performance.accessibility,
          bestPractices: cs.performance.bestPractices,
          seo: cs.performance.seo,
          fcp: cs.performance.fcp,
          lcp: cs.performance.lcp,
          tbt: cs.performance.tbt,
          cls: cs.performance.cls,
          speedIndex: cs.performance.speedIndex,
        },
      });
    }

    // Create Architecture
    if (cs.architecture) {
      console.log(`  🏗️ Adding architecture...`);
      const architecture = await prisma.architecture.create({
        data: {
          caseStudyId: caseStudy.id,
          description: cs.architecture.description,
        },
      });

      // Create Architecture Layers
      for (let i = 0; i < cs.architecture.layers.length; i++) {
        const layer = cs.architecture.layers[i];
        await prisma.architectureLayer.create({
          data: {
            architectureId: architecture.id,
            name: layer.name,
            components: layer.components,
            color: layer.color,
            order: i,
          },
        });
      }
    }

    // Create User Flows
    if (cs.userFlows && cs.userFlows.length > 0) {
      console.log(`  🔄 Adding ${cs.userFlows.length} user flows...`);
      for (let i = 0; i < cs.userFlows.length; i++) {
        const flow = cs.userFlows[i];
        const userFlow = await prisma.userFlow.create({
          data: {
            caseStudyId: caseStudy.id,
            title: flow.title,
            description: flow.description,
            icon: flow.icon,
            order: i,
          },
        });

        // Create User Flow Steps
        for (let j = 0; j < flow.steps.length; j++) {
          const step = flow.steps[j];
          await prisma.userFlowStep.create({
            data: {
              flowId: userFlow.id,
              title: step.title,
              description: step.description,
              icon: step.icon,
              order: j,
            },
          });
        }
      }
    }

    // Create Technical Highlights
    if (cs.technicalHighlights && cs.technicalHighlights.length > 0) {
      console.log(`  💡 Adding ${cs.technicalHighlights.length} technical highlights...`);
      for (let i = 0; i < cs.technicalHighlights.length; i++) {
        const highlight = cs.technicalHighlights[i];
        await prisma.technicalHighlight.create({
          data: {
            caseStudyId: caseStudy.id,
            title: highlight.title,
            description: highlight.description,
            icon: highlight.icon,
            codePreview: highlight.codePreview,
            tags: highlight.tags || [],
            order: i,
          },
        });
      }
    }

    // Create Integrations
    if (cs.integrations && cs.integrations.length > 0) {
      console.log(`  🔗 Adding ${cs.integrations.length} integrations...`);
      for (let i = 0; i < cs.integrations.length; i++) {
        const integration = cs.integrations[i];
        await prisma.integration.create({
          data: {
            caseStudyId: caseStudy.id,
            name: integration.name,
            logo: integration.logo,
            description: integration.description,
            color: integration.color,
            order: i,
          },
        });
      }
    }

    // Create Gallery Items
    if (cs.gallery && cs.gallery.length > 0) {
      console.log(`  🖼️ Adding ${cs.gallery.length} gallery items...`);
      for (let i = 0; i < cs.gallery.length; i++) {
        const item = cs.gallery[i];
        await prisma.galleryItem.create({
          data: {
            caseStudyId: caseStudy.id,
            src: item.src,
            alt: item.alt,
            caption: item.caption,
            order: i,
          },
        });
      }
    }

    // Create Testimonial
    if (cs.testimonial) {
      console.log(`  💬 Adding testimonial...`);
      await prisma.caseStudyTestimonial.create({
        data: {
          caseStudyId: caseStudy.id,
          quote: cs.testimonial.quote,
          author: cs.testimonial.author,
          role: cs.testimonial.role,
          avatar: cs.testimonial.avatar,
        },
      });
    }

    console.log(`  ✅ Case study created for ${project.slug}`);
  }

  console.log("\n🎉 Case studies seed completed!");
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
