import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, logAdminAction } from "@/lib/admin/auth";
import { z } from "zod";

const teamMemberSchema = z.object({
  photo: z.string().min(1),
  skills: z.array(z.string()),
  isFounder: z.boolean().default(false),
  order: z.number().int().default(0),
  translations: z.array(z.object({
    locale: z.string(),
    name: z.string().min(1),
    role: z.string().min(1),
    description: z.string().min(1),
    bio: z.string().optional(),
  })),
  socialLinks: z.object({
    github: z.string().optional(),
    telegram: z.string().optional(),
    linkedin: z.string().optional(),
  }).optional(),
});

// GET - List all team members
export async function GET(request: NextRequest) {
  const session = await requireAdmin(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const members = await prisma.teamMember.findMany({
      include: {
        translations: true,
        socialLinks: true,
      },
      orderBy: { order: "asc" },
    });

    return NextResponse.json({ members });
  } catch (error) {
    console.error("Team API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch team members" },
      { status: 500 }
    );
  }
}

// POST - Create new team member
export async function POST(request: NextRequest) {
  const session = await requireAdmin(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validatedData = teamMemberSchema.parse(body);

    const member = await prisma.teamMember.create({
      data: {
        photo: validatedData.photo,
        skills: validatedData.skills,
        isFounder: validatedData.isFounder,
        order: validatedData.order,
        translations: {
          create: validatedData.translations,
        },
        socialLinks: validatedData.socialLinks ? {
          create: validatedData.socialLinks,
        } : undefined,
      },
      include: {
        translations: true,
        socialLinks: true,
      },
    });

    await logAdminAction({
      adminId: session.adminId,
      action: "team_member_create",
      targetType: "team_member",
      targetId: member.id,
      request,
    });

    return NextResponse.json({ member }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Create team member error:", error);
    return NextResponse.json(
      { error: "Failed to create team member" },
      { status: 500 }
    );
  }
}

// PUT - Update team member
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

    const validatedData = teamMemberSchema.parse(data);

    const member = await prisma.$transaction(async (tx) => {
      // Update main data
      await tx.teamMember.update({
        where: { id },
        data: {
          photo: validatedData.photo,
          skills: validatedData.skills,
          isFounder: validatedData.isFounder,
          order: validatedData.order,
        },
      });

      // Delete existing translations
      await tx.teamMemberTranslation.deleteMany({
        where: { memberId: id },
      });

      // Create new translations
      await tx.teamMemberTranslation.createMany({
        data: validatedData.translations.map((t) => ({
          memberId: id,
          ...t,
        })),
      });

      // Update social links
      if (validatedData.socialLinks) {
        await tx.teamMemberSocial.upsert({
          where: { memberId: id },
          create: {
            memberId: id,
            ...validatedData.socialLinks,
          },
          update: validatedData.socialLinks,
        });
      } else {
        await tx.teamMemberSocial.deleteMany({
          where: { memberId: id },
        });
      }

      return tx.teamMember.findUnique({
        where: { id },
        include: { translations: true, socialLinks: true },
      });
    });

    await logAdminAction({
      adminId: session.adminId,
      action: "team_member_update",
      targetType: "team_member",
      targetId: id,
      request,
    });

    return NextResponse.json({ member });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Update team member error:", error);
    return NextResponse.json(
      { error: "Failed to update team member" },
      { status: 500 }
    );
  }
}

// DELETE - Delete team member
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

    await prisma.teamMember.delete({
      where: { id },
    });

    await logAdminAction({
      adminId: session.adminId,
      action: "team_member_delete",
      targetType: "team_member",
      targetId: id,
      request,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete team member error:", error);
    return NextResponse.json(
      { error: "Failed to delete team member" },
      { status: 500 }
    );
  }
}
