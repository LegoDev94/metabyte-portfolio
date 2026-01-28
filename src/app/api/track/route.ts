import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST - Track page view
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { visitorId, path, referrer, duration, scrollDepth } = body;

    if (!visitorId || !path) {
      return NextResponse.json(
        { error: "visitorId and path are required" },
        { status: 400 }
      );
    }

    // Find visitor by visitorId
    const visitor = await prisma.visitor.findUnique({
      where: { visitorId },
    });

    if (!visitor) {
      // If visitor doesn't exist, create it
      const ipAddress =
        request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        request.headers.get("x-real-ip") ||
        undefined;
      const userAgent = request.headers.get("user-agent") || undefined;

      const newVisitor = await prisma.visitor.create({
        data: {
          visitorId,
          ipAddress,
          userAgent,
        },
      });

      await prisma.pageView.create({
        data: {
          visitorId: newVisitor.id,
          path,
          referrer,
          duration,
          scrollDepth,
        },
      });
    } else {
      // Create page view for existing visitor
      await prisma.pageView.create({
        data: {
          visitorId: visitor.id,
          path,
          referrer,
          duration,
          scrollDepth,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Track API error:", error);
    return NextResponse.json(
      { error: "Failed to track page view" },
      { status: 500 }
    );
  }
}
