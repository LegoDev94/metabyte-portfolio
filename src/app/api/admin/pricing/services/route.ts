import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, logAdminAction } from "@/lib/admin/auth";
import { z } from "zod";

const additionalServiceSchema = z.object({
  price: z.string().min(1),
  order: z.number().int().default(0),
  translations: z.array(z.object({
    locale: z.string(),
    name: z.string(),
    description: z.string(),
  })),
});

// Filter out empty translations
function filterValidTranslations(translations: { locale: string; name: string; description: string }[]) {
  return translations.filter(t => t.name.trim() || t.description.trim());
}

// GET - List all additional services
export async function GET(request: NextRequest) {
  const session = await requireAdmin(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const services = await prisma.additionalService.findMany({
      include: {
        translations: true,
      },
      orderBy: { order: "asc" },
    });

    return NextResponse.json({ services });
  } catch (error) {
    console.error("Services API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch services" },
      { status: 500 }
    );
  }
}

// POST - Create new additional service
export async function POST(request: NextRequest) {
  const session = await requireAdmin(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validatedData = additionalServiceSchema.parse(body);
    const validTranslations = filterValidTranslations(validatedData.translations);

    if (validTranslations.length === 0) {
      return NextResponse.json(
        { error: "At least one translation with name is required" },
        { status: 400 }
      );
    }

    const service = await prisma.additionalService.create({
      data: {
        price: validatedData.price,
        order: validatedData.order,
        translations: {
          create: validTranslations,
        },
      },
      include: {
        translations: true,
      },
    });

    await logAdminAction({
      adminId: session.adminId,
      action: "additional_service_create",
      targetType: "additional_service",
      targetId: service.id,
      request,
    });

    return NextResponse.json({ service }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Create service error:", error);
    return NextResponse.json(
      { error: "Failed to create service" },
      { status: 500 }
    );
  }
}

// PUT - Update additional service
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

    const validatedData = additionalServiceSchema.parse(data);
    const validTranslations = filterValidTranslations(validatedData.translations);

    if (validTranslations.length === 0) {
      return NextResponse.json(
        { error: "At least one translation with name is required" },
        { status: 400 }
      );
    }

    const service = await prisma.$transaction(async (tx) => {
      await tx.additionalService.update({
        where: { id },
        data: {
          price: validatedData.price,
          order: validatedData.order,
        },
      });

      await tx.additionalServiceTranslation.deleteMany({
        where: { serviceId: id },
      });

      await tx.additionalServiceTranslation.createMany({
        data: validTranslations.map((t) => ({
          serviceId: id,
          ...t,
        })),
      });

      return tx.additionalService.findUnique({
        where: { id },
        include: { translations: true },
      });
    });

    await logAdminAction({
      adminId: session.adminId,
      action: "additional_service_update",
      targetType: "additional_service",
      targetId: id,
      request,
    });

    return NextResponse.json({ service });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Update service error:", error);
    return NextResponse.json(
      { error: "Failed to update service" },
      { status: 500 }
    );
  }
}

// DELETE - Delete additional service
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

    await prisma.additionalService.delete({
      where: { id },
    });

    await logAdminAction({
      adminId: session.adminId,
      action: "additional_service_delete",
      targetType: "additional_service",
      targetId: id,
      request,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete service error:", error);
    return NextResponse.json(
      { error: "Failed to delete service" },
      { status: 500 }
    );
  }
}
