import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, logAdminAction } from "@/lib/admin/auth";
import { adminTakeoverSession, adminReleaseSession, getChatSessionWithHistory } from "@/lib/db/chat";
import { broadcastAdminJoined, broadcastAdminLeft } from "@/lib/admin/sse";

interface RouteParams {
  params: Promise<{ sessionId: string }>;
}

// POST - Admin takes over the chat
export async function POST(request: NextRequest, { params }: RouteParams) {
  const session = await requireAdmin(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { sessionId } = await params;

    const chatSession = await adminTakeoverSession(sessionId, session.adminId);

    // Broadcast to visitors and admins (include sessionToken for visitor SSE)
    broadcastAdminJoined(sessionId, session.name || "Admin", chatSession.sessionToken);

    await logAdminAction({
      adminId: session.adminId,
      action: "chat_takeover",
      targetType: "chat_session",
      targetId: sessionId,
      request,
    });

    return NextResponse.json({
      success: true,
      session: chatSession,
    });
  } catch (error) {
    console.error("Takeover chat error:", error);
    return NextResponse.json(
      { error: "Failed to take over chat" },
      { status: 500 }
    );
  }
}

// DELETE - Admin releases the chat back to AI
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const session = await requireAdmin(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { sessionId } = await params;

    // Get session first to get sessionToken
    const chatSession = await getChatSessionWithHistory(sessionId);
    if (!chatSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    await adminReleaseSession(sessionId);

    // Broadcast to visitors and admins (include sessionToken for visitor SSE)
    broadcastAdminLeft(sessionId, chatSession.sessionToken);

    await logAdminAction({
      adminId: session.adminId,
      action: "chat_release",
      targetType: "chat_session",
      targetId: sessionId,
      request,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Release chat error:", error);
    return NextResponse.json(
      { error: "Failed to release chat" },
      { status: 500 }
    );
  }
}
