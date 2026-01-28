import { NextRequest } from "next/server";
import { chatEventBroadcaster } from "@/lib/admin/sse";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// SSE endpoint for visitors to receive admin messages
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sessionToken = searchParams.get("sessionToken");

  if (!sessionToken) {
    return new Response("Session token required", { status: 400 });
  }

  // Create readable stream for SSE
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      // Send initial connection message
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: "connected", timestamp: Date.now() })}\n\n`)
      );

      // Subscribe to events for this session
      // We use sessionToken as the channel for visitors
      const unsubscribe = chatEventBroadcaster.subscribe(sessionToken, (event) => {
        // Only forward relevant events to visitors
        if (
          event.type === "new_message" ||
          event.type === "admin_joined" ||
          event.type === "admin_left"
        ) {
          try {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(event)}\n\n`)
            );
          } catch (error) {
            console.error("SSE send error:", error);
          }
        }
      });

      // Handle client disconnect
      request.signal.addEventListener("abort", () => {
        unsubscribe();
        try {
          controller.close();
        } catch {
          // Controller may already be closed
        }
      });

      // Keep-alive ping every 30 seconds
      const keepAlive = setInterval(() => {
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: "ping", timestamp: Date.now() })}\n\n`)
          );
        } catch {
          clearInterval(keepAlive);
        }
      }, 30000);

      // Clean up on close
      request.signal.addEventListener("abort", () => {
        clearInterval(keepAlive);
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
