import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/auth";

export async function GET(request: NextRequest) {
  const session = await requireAdmin(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const range = searchParams.get("range") || "7d";

  // Calculate start date based on range
  const now = new Date();
  let startDate: Date;
  switch (range) {
    case "24h":
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      break;
    case "7d":
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case "30d":
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case "90d":
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  }

  try {
    // Fetch all stats in parallel
    const [
      projectsCount,
      testimonialsCount,
      faqCount,
      teamCount,
      contactsCount,
      newContactsCount,
      // These will be available once we run migrations
      // visitorsCount,
      // chatSessionsCount,
      // activeChatSessions,
    ] = await Promise.all([
      prisma.project.count(),
      prisma.testimonial.count(),
      prisma.faqItem.count(),
      prisma.teamMember.count(),
      prisma.contactSubmission.count(),
      prisma.contactSubmission.count({
        where: { status: "NEW" },
      }),
      // prisma.visitor.count(),
      // prisma.chatSession.count({ where: { startedAt: { gte: startDate } } }),
      // prisma.chatSession.count({ where: { status: { in: ["ACTIVE", "ADMIN_ACTIVE"] } } }),
    ]);

    // Get recent contacts
    const recentContacts = await prisma.contactSubmission.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        subject: true,
        status: true,
        createdAt: true,
      },
    });

    // Get top projects by category
    const projectsByCategory = await prisma.project.groupBy({
      by: ["category"],
      _count: { category: true },
    });

    return NextResponse.json({
      overview: {
        projectsCount,
        testimonialsCount,
        faqCount,
        teamCount,
        contactsCount,
        newContactsCount,
        visitorsCount: 0, // Will be available after migration
        activeChatSessions: 0, // Will be available after migration
      },
      recentContacts,
      projectsByCategory: projectsByCategory.map((p) => ({
        category: p.category,
        count: p._count.category,
      })),
      timeRange: range,
    });
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
