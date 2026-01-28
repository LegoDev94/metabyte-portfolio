import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, logAdminAction } from "@/lib/admin/auth";
import { z } from "zod";

const galleryItemSchema = z.object({
  id: z.string().optional(),
  type: z.enum(["IMAGE", "VIDEO"]).default("IMAGE"),
  src: z.string().min(1),
  videoUrl: z.string().optional().nullable(),
  videoProvider: z.string().optional().nullable(),
  order: z.number().int().default(0),
  translations: z.array(z.object({
    locale: z.string(),
    alt: z.string(),
    caption: z.string().optional().nullable(),
  })).optional(),
});

const updateGallerySchema = z.object({
  items: z.array(galleryItemSchema),
});

// GET - Get gallery items for case study
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
        caseStudy: {
          include: {
            gallery: {
              include: { translations: true },
              orderBy: { order: "asc" },
            },
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({
      gallery: project.caseStudy?.gallery || [],
      caseStudyId: project.caseStudy?.id || null,
    });
  } catch (error) {
    console.error("Get gallery error:", error);
    return NextResponse.json(
      { error: "Failed to fetch gallery" },
      { status: 500 }
    );
  }
}

// PUT - Update gallery items
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
    const validatedData = updateGallerySchema.parse(body);

    // Find project and case study
    const project = await prisma.project.findUnique({
      where: { slug },
      include: { caseStudy: true },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Create case study if it doesn't exist
    let caseStudyId = project.caseStudy?.id;
    if (!caseStudyId) {
      const newCaseStudy = await prisma.caseStudy.create({
        data: {
          projectId: project.id,
          translations: {
            create: [
              { locale: "ru", challenge: "", solution: "", results: [] },
              { locale: "ro", challenge: "", solution: "", results: [] },
              { locale: "en", challenge: "", solution: "", results: [] },
            ],
          },
        },
      });
      caseStudyId = newCaseStudy.id;
    }

    // Update gallery items in transaction
    const gallery = await prisma.$transaction(async (tx) => {
      // Delete existing gallery items
      await tx.galleryItem.deleteMany({
        where: { caseStudyId },
      });

      // Create new gallery items
      for (const item of validatedData.items) {
        await tx.galleryItem.create({
          data: {
            caseStudyId,
            type: item.type as "IMAGE" | "VIDEO",
            src: item.src,
            videoUrl: item.videoUrl || null,
            videoProvider: item.videoProvider || null,
            order: item.order,
            translations: item.translations ? {
              create: item.translations.map((t) => ({
                locale: t.locale,
                alt: t.alt,
                caption: t.caption || null,
              })),
            } : undefined,
          },
        });
      }

      // Return updated gallery
      return tx.galleryItem.findMany({
        where: { caseStudyId },
        include: { translations: true },
        orderBy: { order: "asc" },
      });
    });

    await logAdminAction({
      adminId: session.adminId,
      action: "gallery_update",
      targetType: "case_study",
      targetId: caseStudyId,
      details: { projectSlug: slug, itemCount: validatedData.items.length },
      request,
    });

    return NextResponse.json({ gallery, caseStudyId });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Update gallery error:", error);
    return NextResponse.json(
      { error: "Failed to update gallery" },
      { status: 500 }
    );
  }
}
