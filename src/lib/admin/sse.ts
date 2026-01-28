// Simple in-memory SSE broadcaster for chat updates
// For production with multiple instances, use Redis pub/sub

type Listener = (data: ChatEvent) => void;

interface ChatEvent {
  type: "new_message" | "session_started" | "session_ended" | "admin_joined" | "admin_left" | "contact_collected";
  sessionId: string;
  data?: Record<string, unknown>;
  timestamp: number;
}

class ChatEventBroadcaster {
  private listeners: Map<string, Set<Listener>> = new Map();

  // Subscribe to events for a specific session or "all" for all sessions
  subscribe(channel: string, listener: Listener): () => void {
    if (!this.listeners.has(channel)) {
      this.listeners.set(channel, new Set());
    }
    this.listeners.get(channel)!.add(listener);

    // Return unsubscribe function
    return () => {
      this.listeners.get(channel)?.delete(listener);
      if (this.listeners.get(channel)?.size === 0) {
        this.listeners.delete(channel);
      }
    };
  }

  // Broadcast event to specific session, sessionToken, and "all" channel
  broadcast(event: ChatEvent, additionalChannels: string[] = []) {
    const eventWithTimestamp = {
      ...event,
      timestamp: event.timestamp || Date.now(),
    };

    // Send to session-specific listeners
    const sessionListeners = this.listeners.get(event.sessionId);
    if (sessionListeners) {
      sessionListeners.forEach((listener) => listener(eventWithTimestamp));
    }

    // Send to additional channels (e.g., sessionToken for visitors)
    for (const channel of additionalChannels) {
      const channelListeners = this.listeners.get(channel);
      if (channelListeners) {
        channelListeners.forEach((listener) => listener(eventWithTimestamp));
      }
    }

    // Send to "all" channel listeners
    const allListeners = this.listeners.get("all");
    if (allListeners) {
      allListeners.forEach((listener) => listener(eventWithTimestamp));
    }
  }

  // Get active listener count
  getListenerCount(): number {
    let count = 0;
    this.listeners.forEach((set) => {
      count += set.size;
    });
    return count;
  }
}

// Global singleton instance
export const chatEventBroadcaster = new ChatEventBroadcaster();

// Helper functions
export function broadcastNewMessage(
  sessionId: string,
  message: {
    id: string;
    role: string;
    content: string;
    createdAt: Date;
  },
  sessionToken?: string
) {
  chatEventBroadcaster.broadcast(
    {
      type: "new_message",
      sessionId,
      data: { message },
      timestamp: Date.now(),
    },
    sessionToken ? [sessionToken] : []
  );
}

export function broadcastSessionStarted(
  sessionId: string,
  visitor: {
    id: string;
    city?: string | null;
    country?: string | null;
  }
) {
  chatEventBroadcaster.broadcast({
    type: "session_started",
    sessionId,
    data: { visitor },
    timestamp: Date.now(),
  });
}

export function broadcastAdminJoined(sessionId: string, adminName: string, sessionToken?: string) {
  chatEventBroadcaster.broadcast(
    {
      type: "admin_joined",
      sessionId,
      data: { adminName },
      timestamp: Date.now(),
    },
    sessionToken ? [sessionToken] : []
  );
}

export function broadcastAdminLeft(sessionId: string, sessionToken?: string) {
  chatEventBroadcaster.broadcast(
    {
      type: "admin_left",
      sessionId,
      timestamp: Date.now(),
    },
    sessionToken ? [sessionToken] : []
  );
}

export function broadcastContactCollected(
  sessionId: string,
  contact: { name: string; contact: string }
) {
  chatEventBroadcaster.broadcast({
    type: "contact_collected",
    sessionId,
    data: { contact },
    timestamp: Date.now(),
  });
}
