import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, logAdminAction } from "@/lib/admin/auth";
import { z } from "zod";

const testimonialSchema = z.object({
  rating: z.number().int().min(1).max(5).default(5),
  source: z.string().optional(),
  order: z.number().int().default(0),
  translations: z.array(z.object({
    locale: z.string(),
    author: z.string().min(1),
    task: z.string().min(1),
    text: z.string().min(1),
  })),
});

// GET - List all testimonials
export async function GET(request: NextRequest) {
  const session = await requireAdmin(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const testimonials = await prisma.testimonial.findMany({
      include: {
        translations: true,
      },
      orderBy: { order: "asc" },
    });

    return NextResponse.json({ testimonials });
  } catch (error) {
    console.error("Testimonials API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch testimonials" },
      { status: 500 }
    );
  }
}

// POST - Create new testimonial
export async function POST(request: NextRequest) {
  const session = await requireAdmin(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validatedData = testimonialSchema.parse(body);

    const testimonial = await prisma.testimonial.create({
      data: {
        rating: validatedData.rating,
        source: validatedData.source || "YouDo",
        order: validatedData.order,
        translations: {
          create: validatedData.translations,
        },
      },
      include: {
        translations: true,
      },
    });

    await logAdminAction({
      adminId: session.adminId,
      action: "testimonial_create",
      targetType: "testimonial",
      targetId: testimonial.id,
      request,
    });

    return NextResponse.json({ testimonial }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Create testimonial error:", error);
    return NextResponse.json(
      { error: "Failed to create testimonial" },
      { status: 500 }
    );
  }
}

// PUT - Update testimonial
export async function PUT(request: NextRequest) {
  const session = await requireAdmin(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const validatedData = testimonialSchema.parse(data);

    const testimonial = await prisma.$transaction(async (tx) => {
      // Update main data
      const updated = await tx.testimonial.update({
        where: { id },
        data: {
          rating: validatedData.rating,
          source: validatedData.source,
          order: validatedData.order,
        },
      });

      // Delete existing translations
      await tx.testimonialTranslation.deleteMany({
        where: { testimonialId: id },
      });

      // Create new translations
      await tx.testimonialTranslation.createMany({
        data: validatedData.translations.map((t) => ({
          testimonialId: id,
          ...t,
        })),
      });

      return tx.testimonial.findUnique({
        where: { id },
        include: { translations: true },
      });
    });

    await logAdminAction({
      adminId: session.adminId,
      action: "testimonial_update",
      targetType: "testimonial",
      targetId: id,
      request,
    });

    return NextResponse.json({ testimonial });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Update testimonial error:", error);
    return NextResponse.json(
      { error: "Failed to update testimonial" },
      { status: 500 }
    );
  }
}

// DELETE - Delete testimonial
export async function DELETE(request: NextRequest) {
  const session = await requireAdmin(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    await prisma.testimonial.delete({
      where: { id },
    });

    await logAdminAction({
      adminId: session.adminId,
      action: "testimonial_delete",
      targetType: "testimonial",
      targetId: id,
      request,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete testimonial error:", error);
    return NextResponse.json(
      { error: "Failed to delete testimonial" },
      { status: 500 }
    );
  }
}
