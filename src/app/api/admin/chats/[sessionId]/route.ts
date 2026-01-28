import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, logAdminAction } from "@/lib/admin/auth";
import { getChatSessionWithHistory, endChatSession } from "@/lib/db/chat";

interface RouteParams {
  params: Promise<{ sessionId: string }>;
}

// GET - Get chat session with full history
export async function GET(request: NextRequest, { params }: RouteParams) {
  const session = await requireAdmin(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { sessionId } = await params;
    const chatSession = await getChatSessionWithHistory(sessionId);

    if (!chatSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    return NextResponse.json({ session: chatSession });
  } catch (error) {
    console.error("Get chat session error:", error);
    return NextResponse.json(
      { error: "Failed to fetch chat session" },
      { status: 500 }
    );
  }
}

// DELETE - End chat session
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const session = await requireAdmin(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { sessionId } = await params;
    await endChatSession(sessionId);

    await logAdminAction({
      adminId: session.adminId,
      action: "chat_end",
      targetType: "chat_session",
      targetId: sessionId,
      request,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("End chat session error:", error);
    return NextResponse.json(
      { error: "Failed to end chat session" },
      { status: 500 }
    );
  }
}
