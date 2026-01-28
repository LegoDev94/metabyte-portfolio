import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, logAdminAction } from "@/lib/admin/auth";
import { z } from "zod";
import { Prisma } from "@prisma/client";

// Validation schema for creating/updating projects
const projectSchema = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  category: z.enum(["games", "fintech", "mobile", "enterprise", "automation"]),
  image: z.string().min(1),
  video: z.object({
    type: z.enum(["file", "vimeo"]),
    id: z.string().optional(),
    src: z.string().optional(),
  }).nullable().optional(),
  featured: z.boolean().default(false),
  order: z.number().int().default(0),
  translations: z.array(z.object({
    locale: z.string(),
    title: z.string().min(1),
    subtitle: z.string().min(1),
    description: z.string().min(1),
    fullDescription: z.string().min(1),
    categoryLabel: z.string().min(1),
  })),
  technologies: z.array(z.object({
    name: z.string().min(1),
    icon: z.string().min(1),
    color: z.string().min(1),
    order: z.number().int().default(0),
  })).optional(),
});

// GET - List all projects
export async function GET(request: NextRequest) {
  const session = await requireAdmin(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const projects = await prisma.project.findMany({
      include: {
        translations: true,
        technologies: {
          orderBy: { order: "asc" },
        },
        caseStudy: {
          select: { id: true },
        },
      },
      orderBy: [
        { featured: "desc" },
        { order: "asc" },
      ],
    });

    return NextResponse.json({ projects });
  } catch (error) {
    console.error("Projects API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

// POST - Create new project
export async function POST(request: NextRequest) {
  const session = await requireAdmin(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validatedData = projectSchema.parse(body);

    // Check if slug already exists
    const existingProject = await prisma.project.findUnique({
      where: { slug: validatedData.slug },
    });

    if (existingProject) {
      return NextResponse.json(
        { error: "Project with this slug already exists" },
        { status: 400 }
      );
    }

    const project = await prisma.project.create({
      data: {
        slug: validatedData.slug,
        category: validatedData.category,
        image: validatedData.image,
        video: validatedData.video
          ? (validatedData.video as Prisma.InputJsonValue)
          : Prisma.DbNull,
        featured: validatedData.featured,
        order: validatedData.order,
        translations: {
          create: validatedData.translations,
        },
        technologies: validatedData.technologies ? {
          create: validatedData.technologies,
        } : undefined,
      },
      include: {
        translations: true,
        technologies: true,
      },
    });

    await logAdminAction({
      adminId: session.adminId,
      action: "project_create",
      targetType: "project",
      targetId: project.id,
      details: { slug: project.slug },
      request,
    });

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Create project error:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}
