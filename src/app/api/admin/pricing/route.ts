import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, logAdminAction } from "@/lib/admin/auth";
import { z } from "zod";

const pricingPackageSchema = z.object({
  price: z.string().min(1),
  icon: z.string().min(1),
  color: z.string().min(1),
  popular: z.boolean().default(false),
  order: z.number().int().default(0),
  translations: z.array(z.object({
    locale: z.string(),
    name: z.string().min(1),
    description: z.string().min(1),
    features: z.array(z.string()),
    notIncluded: z.array(z.string()),
  })),
});

// GET - List all pricing packages
export async function GET(request: NextRequest) {
  const session = await requireAdmin(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const packages = await prisma.pricingPackage.findMany({
      include: {
        translations: true,
      },
      orderBy: { order: "asc" },
    });

    return NextResponse.json({ packages });
  } catch (error) {
    console.error("Pricing API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch pricing packages" },
      { status: 500 }
    );
  }
}

// POST - Create new pricing package
export async function POST(request: NextRequest) {
  const session = await requireAdmin(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validatedData = pricingPackageSchema.parse(body);

    const pkg = await prisma.pricingPackage.create({
      data: {
        price: validatedData.price,
        icon: validatedData.icon,
        color: validatedData.color,
        popular: validatedData.popular,
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
      action: "pricing_package_create",
      targetType: "pricing_package",
      targetId: pkg.id,
      request,
    });

    return NextResponse.json({ package: pkg }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Create pricing package error:", error);
    return NextResponse.json(
      { error: "Failed to create pricing package" },
      { status: 500 }
    );
  }
}

// PUT - Update pricing package
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

    const validatedData = pricingPackageSchema.parse(data);

    const pkg = await prisma.$transaction(async (tx) => {
      // Update main data
      await tx.pricingPackage.update({
        where: { id },
        data: {
          price: validatedData.price,
          icon: validatedData.icon,
          color: validatedData.color,
          popular: validatedData.popular,
          order: validatedData.order,
        },
      });

      // Delete existing translations
      await tx.pricingPackageTranslation.deleteMany({
        where: { packageId: id },
      });

      // Create new translations
      await tx.pricingPackageTranslation.createMany({
        data: validatedData.translations.map((t) => ({
          packageId: id,
          ...t,
        })),
      });

      return tx.pricingPackage.findUnique({
        where: { id },
        include: { translations: true },
      });
    });

    await logAdminAction({
      adminId: session.adminId,
      action: "pricing_package_update",
      targetType: "pricing_package",
      targetId: id,
      request,
    });

    return NextResponse.json({ package: pkg });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Update pricing package error:", error);
    return NextResponse.json(
      { error: "Failed to update pricing package" },
      { status: 500 }
    );
  }
}

// DELETE - Delete pricing package
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

    await prisma.pricingPackage.delete({
      where: { id },
    });

    await logAdminAction({
      adminId: session.adminId,
      action: "pricing_package_delete",
      targetType: "pricing_package",
      targetId: id,
      request,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete pricing package error:", error);
    return NextResponse.json(
      { error: "Failed to delete pricing package" },
      { status: 500 }
    );
  }
}
