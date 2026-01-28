import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { addChatMessage, isSessionAdminTakeover, getChatSessionWithHistory } from "@/lib/db/chat";
import { broadcastNewMessage } from "@/lib/admin/sse";
import { z } from "zod";

interface RouteParams {
  params: Promise<{ sessionId: string }>;
}

const messageSchema = z.object({
  content: z.string().min(1).max(5000),
});

// POST - Send message from admin
export async function POST(request: NextRequest, { params }: RouteParams) {
  const session = await requireAdmin(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { sessionId } = await params;
    const body = await request.json();
    const { content } = messageSchema.parse(body);

    // Get session to check takeover and get sessionToken
    const chatSession = await getChatSessionWithHistory(sessionId);
    if (!chatSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (!chatSession.isAdminTakeover) {
      return NextResponse.json(
        { error: "Admin must take over the session first" },
        { status: 400 }
      );
    }

    // Add message to database
    const message = await addChatMessage({
      sessionId,
      role: "ADMIN",
      content,
      metadata: { adminId: session.adminId },
    });

    // Broadcast to all listeners (including visitor via sessionToken)
    broadcastNewMessage(
      sessionId,
      {
        id: message.id,
        role: "ADMIN",
        content: message.content,
        createdAt: message.createdAt,
      },
      chatSession.sessionToken
    );

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Send admin message error:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
