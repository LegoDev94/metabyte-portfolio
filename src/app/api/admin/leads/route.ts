import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/auth";

// GET /api/admin/leads - List leads
export async function GET(request: NextRequest) {
  const session = await requireAdmin(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const priority = searchParams.get("priority");
  const search = searchParams.get("search");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");

  const where: any = {};

  if (status && status !== "all") {
    where.status = status;
  }

  if (priority) {
    where.priority = parseInt(priority);
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { telegram: { contains: search, mode: "insensitive" } },
      { message: { contains: search, mode: "insensitive" } },
    ];
  }

  try {
    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        include: {
          notes: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
        orderBy: [
          { priority: "desc" },
          { createdAt: "desc" },
        ],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.lead.count({ where }),
    ]);

    return NextResponse.json({
      leads,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching leads:", error);
    return NextResponse.json(
      { error: "Failed to fetch leads" },
      { status: 500 }
    );
  }
}

// POST /api/admin/leads - Create new lead
export async function POST(request: NextRequest) {
  const session = await requireAdmin(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    const lead = await prisma.lead.create({
      data: {
        name: body.name,
        email: body.email,
        telegram: body.telegram,
        phone: body.phone,
        budget: body.budget,
        source: body.source || "website",
        projectType: body.projectType,
        message: body.message,
        status: "NEW",
        priority: body.priority || 0,
      },
    });

    // Create status history
    await prisma.leadStatusHistory.create({
      data: {
        leadId: lead.id,
        toStatus: "NEW",
        changedBy: session.user.id,
      },
    });

    return NextResponse.json({ lead }, { status: 201 });
  } catch (error) {
    console.error("Error creating lead:", error);
    return NextResponse.json(
      { error: "Failed to create lead" },
      { status: 500 }
    );
  }
}
