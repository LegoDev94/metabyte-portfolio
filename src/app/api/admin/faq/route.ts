import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, logAdminAction } from "@/lib/admin/auth";
import { z } from "zod";

const faqItemSchema = z.object({
  category: z.string().optional(),
  order: z.number().int().default(0),
  translations: z.array(z.object({
    locale: z.string(),
    question: z.string().min(1),
    answer: z.string().min(1),
  })),
});

// GET - List all FAQ items
export async function GET(request: NextRequest) {
  const session = await requireAdmin(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const items = await prisma.faqItem.findMany({
      include: {
        translations: true,
      },
      orderBy: { order: "asc" },
    });

    return NextResponse.json({ items });
  } catch (error) {
    console.error("FAQ API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch FAQ items" },
      { status: 500 }
    );
  }
}

// POST - Create new FAQ item
export async function POST(request: NextRequest) {
  const session = await requireAdmin(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validatedData = faqItemSchema.parse(body);

    const item = await prisma.faqItem.create({
      data: {
        category: validatedData.category,
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
      action: "faq_item_create",
      targetType: "faq_item",
      targetId: item.id,
      request,
    });

    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Create FAQ item error:", error);
    return NextResponse.json(
      { error: "Failed to create FAQ item" },
      { status: 500 }
    );
  }
}

// PUT - Update FAQ item
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

    const validatedData = faqItemSchema.parse(data);

    const item = await prisma.$transaction(async (tx) => {
      await tx.faqItem.update({
        where: { id },
        data: {
          category: validatedData.category,
          order: validatedData.order,
        },
      });

      await tx.faqItemTranslation.deleteMany({
        where: { faqItemId: id },
      });

      await tx.faqItemTranslation.createMany({
        data: validatedData.translations.map((t) => ({
          faqItemId: id,
          ...t,
        })),
      });

      return tx.faqItem.findUnique({
        where: { id },
        include: { translations: true },
      });
    });

    await logAdminAction({
      adminId: session.adminId,
      action: "faq_item_update",
      targetType: "faq_item",
      targetId: id,
      request,
    });

    return NextResponse.json({ item });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Update FAQ item error:", error);
    return NextResponse.json(
      { error: "Failed to update FAQ item" },
      { status: 500 }
    );
  }
}

// DELETE - Delete FAQ item
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

    await prisma.faqItem.delete({
      where: { id },
    });

    await logAdminAction({
      adminId: session.adminId,
      action: "faq_item_delete",
      targetType: "faq_item",
      targetId: id,
      request,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete FAQ item error:", error);
    return NextResponse.json(
      { error: "Failed to delete FAQ item" },
      { status: 500 }
    );
  }
}
