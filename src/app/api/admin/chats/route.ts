import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { getActiveChatSessions, getAllChatSessions } from "@/lib/db/chat";
import { ChatStatus } from "@prisma/client";

// GET - List all chats
export async function GET(request: NextRequest) {
  const session = await requireAdmin(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") as ChatStatus | null;
    const activeOnly = searchParams.get("active") === "true";
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    if (activeOnly) {
      const sessions = await getActiveChatSessions();
      return NextResponse.json({ sessions, total: sessions.length });
    }

    const { sessions, total } = await getAllChatSessions({
      limit,
      offset,
      status: status || undefined,
    });

    return NextResponse.json({ sessions, total });
  } catch (error) {
    console.error("Chats API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch chats" },
      { status: 500 }
    );
  }
}
