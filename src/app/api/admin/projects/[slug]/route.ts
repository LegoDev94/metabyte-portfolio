import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, logAdminAction } from "@/lib/admin/auth";
import { z } from "zod";
import { Prisma } from "@prisma/client";

// Validation schema for updating projects
const updateProjectSchema = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/).optional(),
  category: z.enum(["games", "fintech", "mobile", "enterprise", "automation"]).optional(),
  image: z.string().min(1).optional(),
  video: z.object({
    type: z.enum(["file", "vimeo"]),
    id: z.string().optional(),
    src: z.string().optional(),
  }).nullable().optional(),
  featured: z.boolean().optional(),
  order: z.number().int().optional(),
  translations: z.array(z.object({
    locale: z.string(),
    title: z.string().min(1),
    subtitle: z.string().min(1),
    description: z.string().min(1),
    fullDescription: z.string().min(1),
    categoryLabel: z.string().min(1),
    // SEO fields
    metaTitle: z.string().optional(),
    metaDescription: z.string().optional(),
    metaKeywords: z.array(z.string()).optional(),
  })).optional(),
  technologies: z.array(z.object({
    id: z.string().optional(),
    name: z.string().min(1),
    icon: z.string().min(1),
    color: z.string().min(1),
    order: z.number().int().default(0),
  })).optional(),
});

// GET - Get single project with all details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await requireAdmin(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;

  try {
    const project = await prisma.project.findUnique({
      where: { slug },
      include: {
        translations: true,
        technologies: {
          orderBy: { order: "asc" },
        },
        features: {
          include: { translations: true },
          orderBy: { order: "asc" },
        },
        metrics: {
          include: { translations: true },
          orderBy: { order: "asc" },
        },
        links: true,
        caseStudy: {
          include: {
            translations: true,
            performance: true,
            architecture: {
              include: {
                translations: true,
                layers: {
                  include: { translations: true },
                  orderBy: { order: "asc" },
                },
              },
            },
            userFlows: {
              include: {
                translations: true,
                steps: {
                  include: { translations: true },
                  orderBy: { order: "asc" },
                },
              },
              orderBy: { order: "asc" },
            },
            technicalHighlights: {
              include: { translations: true },
              orderBy: { order: "asc" },
            },
            integrations: {
              include: { translations: true },
              orderBy: { order: "asc" },
            },
            gallery: {
              include: { translations: true },
              orderBy: { order: "asc" },
            },
            testimonial: {
              include: { translations: true },
            },
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({ project });
  } catch (error) {
    console.error("Get project error:", error);
    return NextResponse.json(
      { error: "Failed to fetch project" },
      { status: 500 }
    );
  }
}

// PUT - Update project
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await requireAdmin(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;

  try {
    const body = await request.json();
    const validatedData = updateProjectSchema.parse(body);

    // Find project
    const existingProject = await prisma.project.findUnique({
      where: { slug },
      include: { translations: true, technologies: true },
    });

    if (!existingProject) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Check if new slug conflicts
    if (validatedData.slug && validatedData.slug !== slug) {
      const slugExists = await prisma.project.findUnique({
        where: { slug: validatedData.slug },
      });
      if (slugExists) {
        return NextResponse.json(
          { error: "Project with this slug already exists" },
          { status: 400 }
        );
      }
    }

    // Update project with transaction
    const project = await prisma.$transaction(async (tx) => {
      // Update main project data
      const updated = await tx.project.update({
        where: { slug },
        data: {
          slug: validatedData.slug,
          category: validatedData.category,
          image: validatedData.image,
          video: validatedData.video === null
            ? Prisma.DbNull
            : validatedData.video
              ? (validatedData.video as Prisma.InputJsonValue)
              : undefined,
          featured: validatedData.featured,
          order: validatedData.order,
        },
      });

      // Update translations if provided
      if (validatedData.translations) {
        // Delete existing translations
        await tx.projectTranslation.deleteMany({
          where: { projectId: updated.id },
        });
        // Create new translations
        await tx.projectTranslation.createMany({
          data: validatedData.translations.map((t) => ({
            projectId: updated.id,
            ...t,
          })),
        });
      }

      // Update technologies if provided
      if (validatedData.technologies) {
        // Delete existing technologies
        await tx.technology.deleteMany({
          where: { projectId: updated.id },
        });
        // Create new technologies
        await tx.technology.createMany({
          data: validatedData.technologies.map((t) => ({
            projectId: updated.id,
            name: t.name,
            icon: t.icon,
            color: t.color,
            order: t.order,
          })),
        });
      }

      // Return updated project with relations
      return tx.project.findUnique({
        where: { id: updated.id },
        include: {
          translations: true,
          technologies: { orderBy: { order: "asc" } },
        },
      });
    });

    await logAdminAction({
      adminId: session.adminId,
      action: "project_update",
      targetType: "project",
      targetId: project?.id,
      details: { slug: project?.slug },
      request,
    });

    return NextResponse.json({ project });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Update project error:", error);
    return NextResponse.json(
      { error: "Failed to update project" },
      { status: 500 }
    );
  }
}

// DELETE - Delete project
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await requireAdmin(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;

  try {
    const project = await prisma.project.findUnique({
      where: { slug },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    await prisma.project.delete({
      where: { slug },
    });

    await logAdminAction({
      adminId: session.adminId,
      action: "project_delete",
      targetType: "project",
      targetId: project.id,
      details: { slug },
      request,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete project error:", error);
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 }
    );
  }
}
