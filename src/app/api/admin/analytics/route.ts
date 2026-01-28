import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/auth";

// GET - Get analytics data
export async function GET(request: NextRequest) {
  const session = await requireAdmin(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "7d"; // 7d, 30d, 90d, all

    // Calculate date range
    const now = new Date();
    let startDate: Date;
    switch (period) {
      case "30d":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "90d":
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case "all":
        startDate = new Date(0);
        break;
      default: // 7d
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    // Fetch all metrics in parallel
    const [
      totalVisitors,
      newVisitors,
      totalPageViews,
      totalChatSessions,
      activeChatSessions,
      contactsCollected,
      visitorsByCity,
      topPages,
      chatSessionsByDay,
      visitorsByDay,
    ] = await Promise.all([
      // Total unique visitors
      prisma.visitor.count(),

      // New visitors in period
      prisma.visitor.count({
        where: {
          firstVisitAt: { gte: startDate },
        },
      }),

      // Total page views in period (excluding admin pages)
      prisma.pageView.count({
        where: {
          createdAt: { gte: startDate },
          NOT: { path: { startsWith: "/admin" } },
        },
      }),

      // Total chat sessions in period
      prisma.chatSession.count({
        where: {
          startedAt: { gte: startDate },
        },
      }),

      // Currently active chat sessions
      prisma.chatSession.count({
        where: {
          status: { in: ["ACTIVE", "ADMIN_ACTIVE"] },
        },
      }),

      // Contacts collected in period
      prisma.visitorContact.count({
        where: {
          collectedAt: { gte: startDate },
        },
      }),

      // Visitors by city (top 10)
      prisma.visitor.groupBy({
        by: ["city"],
        where: {
          city: { not: null },
          firstVisitAt: { gte: startDate },
        },
        _count: { city: true },
        orderBy: { _count: { city: "desc" } },
        take: 10,
      }),

      // Top pages (top 10, excluding admin pages)
      prisma.pageView.groupBy({
        by: ["path"],
        where: {
          createdAt: { gte: startDate },
          NOT: { path: { startsWith: "/admin" } },
        },
        _count: { path: true },
        orderBy: { _count: { path: "desc" } },
        take: 10,
      }),

      // Chat sessions by day (for chart)
      getChatSessionsByDay(startDate),

      // Visitors by day (for chart)
      getVisitorsByDay(startDate),
    ]);

    // Calculate conversion rate (contacts / chat sessions)
    const conversionRate =
      totalChatSessions > 0
        ? Math.round((contactsCollected / totalChatSessions) * 100)
        : 0;

    return NextResponse.json({
      period,
      metrics: {
        totalVisitors,
        newVisitors,
        totalPageViews,
        totalChatSessions,
        activeChatSessions,
        contactsCollected,
        conversionRate,
      },
      charts: {
        visitorsByDay,
        chatSessionsByDay,
      },
      topData: {
        visitorsByCity: visitorsByCity.map((v) => ({
          city: v.city || "Unknown",
          count: v._count.city,
        })),
        topPages: topPages.map((p) => ({
          path: p.path,
          count: p._count.path,
        })),
      },
    });
  } catch (error) {
    console.error("Analytics API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}

// Helper function to get chat sessions grouped by day
async function getChatSessionsByDay(startDate: Date) {
  const sessions = await prisma.chatSession.findMany({
    where: { startedAt: { gte: startDate } },
    select: { startedAt: true },
  });

  const byDay: Record<string, number> = {};
  sessions.forEach((s) => {
    const day = s.startedAt.toISOString().split("T")[0];
    byDay[day] = (byDay[day] || 0) + 1;
  });

  // Convert to array sorted by date
  return Object.entries(byDay)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

// Helper function to get visitors grouped by day
async function getVisitorsByDay(startDate: Date) {
  const visitors = await prisma.visitor.findMany({
    where: { firstVisitAt: { gte: startDate } },
    select: { firstVisitAt: true },
  });

  const byDay: Record<string, number> = {};
  visitors.forEach((v) => {
    const day = v.firstVisitAt.toISOString().split("T")[0];
    byDay[day] = (byDay[day] || 0) + 1;
  });

  // Convert to array sorted by date
  return Object.entries(byDay)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));
}
