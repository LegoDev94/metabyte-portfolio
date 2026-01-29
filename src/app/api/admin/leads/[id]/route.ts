import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/auth";

// GET /api/admin/leads/[id] - Get single lead
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const lead = await prisma.lead.findUnique({
      where: { id },
      include: {
        notes: {
          orderBy: { createdAt: "desc" },
        },
        history: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    return NextResponse.json({ lead });
  } catch (error) {
    console.error("Error fetching lead:", error);
    return NextResponse.json(
      { error: "Failed to fetch lead" },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/leads/[id] - Update lead
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();

    const existingLead = await prisma.lead.findUnique({
      where: { id },
    });

    if (!existingLead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    // If status is changing, create history entry
    if (body.status && body.status !== existingLead.status) {
      await prisma.leadStatusHistory.create({
        data: {
          leadId: id,
          fromStatus: existingLead.status,
          toStatus: body.status,
          changedBy: session.user.id,
        },
      });
    }

    const lead = await prisma.lead.update({
      where: { id },
      data: {
        name: body.name,
        email: body.email,
        telegram: body.telegram,
        phone: body.phone,
        budget: body.budget,
        projectType: body.projectType,
        status: body.status,
        priority: body.priority,
        assignedTo: body.assignedTo,
      },
    });

    return NextResponse.json({ lead });
  } catch (error) {
    console.error("Error updating lead:", error);
    return NextResponse.json(
      { error: "Failed to update lead" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/leads/[id] - Delete lead
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    await prisma.lead.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting lead:", error);
    return NextResponse.json(
      { error: "Failed to delete lead" },
      { status: 500 }
    );
  }
}
