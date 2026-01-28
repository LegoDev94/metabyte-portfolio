import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, logAdminAction } from "@/lib/admin/auth";
import { z } from "zod";

const caseStudySchema = z.object({
  translations: z.array(z.object({
    locale: z.string(),
    challenge: z.string(),
    solution: z.string(),
    results: z.array(z.string()),
  })),
});

// Filter translations - keep only those with at least challenge or solution filled
function filterValidTranslations(translations: { locale: string; challenge: string; solution: string; results: string[] }[]) {
  return translations.filter(t => t.challenge.trim() || t.solution.trim());
}

// GET - Get case study for project
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
            translations: true,
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({ caseStudy: project.caseStudy });
  } catch (error) {
    console.error("Get case study error:", error);
    return NextResponse.json(
      { error: "Failed to fetch case study" },
      { status: 500 }
    );
  }
}

// PUT - Create or update case study
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
    const validatedData = caseStudySchema.parse(body);

    // Filter out empty translations
    const validTranslations = filterValidTranslations(validatedData.translations);

    // Find project
    const project = await prisma.project.findUnique({
      where: { slug },
      include: { caseStudy: true },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    let caseStudy;

    if (project.caseStudy) {
      // Update existing case study
      caseStudy = await prisma.$transaction(async (tx) => {
        // Delete existing translations
        await tx.caseStudyTranslation.deleteMany({
          where: { caseStudyId: project.caseStudy!.id },
        });

        // Create new translations (only valid ones)
        if (validTranslations.length > 0) {
          await tx.caseStudyTranslation.createMany({
            data: validTranslations.map((t) => ({
              caseStudyId: project.caseStudy!.id,
              ...t,
            })),
          });
        }

        return tx.caseStudy.findUnique({
          where: { id: project.caseStudy!.id },
          include: { translations: true },
        });
      });
    } else {
      // Create new case study only if we have valid translations
      if (validTranslations.length === 0) {
        return NextResponse.json({
          error: "At least one translation with challenge or solution is required"
        }, { status: 400 });
      }

      caseStudy = await prisma.caseStudy.create({
        data: {
          projectId: project.id,
          translations: {
            create: validTranslations,
          },
        },
        include: { translations: true },
      });
    }

    await logAdminAction({
      adminId: session.adminId,
      action: project.caseStudy ? "case_study_update" : "case_study_create",
      targetType: "case_study",
      targetId: caseStudy?.id,
      details: { projectSlug: slug },
      request,
    });

    return NextResponse.json({ caseStudy });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Update case study error:", error);
    return NextResponse.json(
      { error: "Failed to update case study" },
      { status: 500 }
    );
  }
}

// DELETE - Delete case study
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
      include: { caseStudy: true },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (!project.caseStudy) {
      return NextResponse.json({ error: "Case study not found" }, { status: 404 });
    }

    await prisma.caseStudy.delete({
      where: { id: project.caseStudy.id },
    });

    await logAdminAction({
      adminId: session.adminId,
      action: "case_study_delete",
      targetType: "case_study",
      targetId: project.caseStudy.id,
      details: { projectSlug: slug },
      request,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete case study error:", error);
    return NextResponse.json(
      { error: "Failed to delete case study" },
      { status: 500 }
    );
  }
}
