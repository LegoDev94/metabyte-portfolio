import { prisma } from "@/lib/prisma";
import { ChatStatus, MessageRole } from "@prisma/client";

// Get or create visitor
export async function getOrCreateVisitor({
  visitorId,
  ipAddress,
  userAgent,
  city,
  country,
}: {
  visitorId: string;
  ipAddress?: string;
  userAgent?: string;
  city?: string;
  country?: string;
}) {
  let visitor = await prisma.visitor.findUnique({
    where: { visitorId },
  });

  if (visitor) {
    // Update last visit
    visitor = await prisma.visitor.update({
      where: { id: visitor.id },
      data: {
        lastVisitAt: new Date(),
        totalVisits: { increment: 1 },
        city: city || visitor.city,
        country: country || visitor.country,
      },
    });
  } else {
    visitor = await prisma.visitor.create({
      data: {
        visitorId,
        ipAddress,
        userAgent,
        city,
        country,
      },
    });
  }

  return visitor;
}

// Get or create chat session
export async function getOrCreateChatSession({
  visitorId,
  sessionToken,
  currentPage,
  locale,
}: {
  visitorId: string;
  sessionToken: string;
  currentPage?: string;
  locale?: string;
}) {
  // Try to find existing session
  let session = await prisma.chatSession.findUnique({
    where: { sessionToken },
    include: {
      visitor: true,
      messages: {
        orderBy: { createdAt: "asc" },
        take: 50, // Last 50 messages
      },
    },
  });

  if (session) {
    // Update last activity
    session = await prisma.chatSession.update({
      where: { id: session.id },
      data: {
        lastActivityAt: new Date(),
        currentPage: currentPage || session.currentPage,
        status: session.status === "ABANDONED" ? "ACTIVE" : session.status,
      },
      include: {
        visitor: true,
        messages: {
          orderBy: { createdAt: "asc" },
          take: 50,
        },
      },
    });
  } else {
    // Get visitor
    const visitor = await prisma.visitor.findUnique({
      where: { visitorId },
    });

    if (!visitor) {
      throw new Error("Visitor not found");
    }

    session = await prisma.chatSession.create({
      data: {
        visitorId: visitor.id,
        sessionToken,
        currentPage,
        locale: locale || "ru",
      },
      include: {
        visitor: true,
        messages: true,
      },
    });
  }

  return session;
}

// Add message to session
export async function addChatMessage({
  sessionId,
  role,
  content,
  metadata,
}: {
  sessionId: string;
  role: MessageRole;
  content: string;
  metadata?: Record<string, unknown>;
}) {
  const message = await prisma.chatMessage.create({
    data: {
      sessionId,
      role,
      content,
      metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : null,
    },
  });

  // Update session last activity
  await prisma.chatSession.update({
    where: { id: sessionId },
    data: { lastActivityAt: new Date() },
  });

  return message;
}

// Check if session is taken over by admin
export async function isSessionAdminTakeover(sessionId: string): Promise<boolean> {
  const session = await prisma.chatSession.findUnique({
    where: { id: sessionId },
    select: { isAdminTakeover: true, status: true },
  });

  return session?.isAdminTakeover || session?.status === "ADMIN_ACTIVE";
}

// Admin takes over session
export async function adminTakeoverSession(sessionId: string, adminId: string) {
  const session = await prisma.chatSession.update({
    where: { id: sessionId },
    data: {
      isAdminTakeover: true,
      adminTakeoverBy: adminId,
      status: "ADMIN_ACTIVE",
    },
    include: {
      visitor: true,
    },
  });

  // Add system message
  await addChatMessage({
    sessionId,
    role: "SYSTEM",
    content: "Администратор присоединился к разговору",
  });

  return session;
}

// Admin releases session
export async function adminReleaseSession(sessionId: string) {
  const session = await prisma.chatSession.update({
    where: { id: sessionId },
    data: {
      isAdminTakeover: false,
      adminTakeoverBy: null,
      status: "ACTIVE",
    },
  });

  // Add system message
  await addChatMessage({
    sessionId,
    role: "SYSTEM",
    content: "Администратор передал чат AI-ассистенту",
  });

  return session;
}

// Get active chat sessions
export async function getActiveChatSessions() {
  const sessions = await prisma.chatSession.findMany({
    where: {
      status: {
        in: ["ACTIVE", "ADMIN_ACTIVE"],
      },
    },
    include: {
      visitor: {
        include: {
          contact: true,
        },
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      _count: {
        select: { messages: true },
      },
    },
    orderBy: { lastActivityAt: "desc" },
  });

  return sessions;
}

// Get chat session with full history
export async function getChatSessionWithHistory(sessionId: string) {
  const session = await prisma.chatSession.findUnique({
    where: { id: sessionId },
    include: {
      visitor: {
        include: {
          contact: true,
          pageViews: {
            orderBy: { createdAt: "desc" },
            take: 20,
          },
        },
      },
      messages: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  return session;
}

// Get all chat sessions (with pagination)
export async function getAllChatSessions({
  limit = 50,
  offset = 0,
  status,
}: {
  limit?: number;
  offset?: number;
  status?: ChatStatus;
} = {}) {
  const where = status ? { status } : {};

  const [sessions, total] = await Promise.all([
    prisma.chatSession.findMany({
      where,
      include: {
        visitor: {
          include: {
            contact: true,
          },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        _count: {
          select: { messages: true },
        },
      },
      orderBy: { lastActivityAt: "desc" },
      take: limit,
      skip: offset,
    }),
    prisma.chatSession.count({ where }),
  ]);

  return { sessions, total };
}

// Update visitor contact
export async function updateVisitorContact({
  visitorId,
  name,
  contact,
  message,
  source = "ai_assistant",
}: {
  visitorId: string;
  name: string;
  contact: string;
  message?: string;
  source?: string;
}) {
  // Find visitor by visitorId field (the UUID, not the internal id)
  const visitor = await prisma.visitor.findUnique({
    where: { visitorId },
  });

  if (!visitor) {
    throw new Error("Visitor not found");
  }

  const contactRecord = await prisma.visitorContact.upsert({
    where: { visitorId: visitor.id },
    create: {
      visitorId: visitor.id,
      name,
      contact,
      message,
      source,
    },
    update: {
      name,
      contact,
      message: message || undefined,
    },
  });

  return contactRecord;
}

// Mark session as ended
export async function endChatSession(sessionId: string) {
  return prisma.chatSession.update({
    where: { id: sessionId },
    data: {
      status: "ENDED",
      endedAt: new Date(),
    },
  });
}

// Clean up abandoned sessions (call periodically)
export async function markAbandonedSessions(inactiveMinutes = 30) {
  const cutoffTime = new Date(Date.now() - inactiveMinutes * 60 * 1000);

  return prisma.chatSession.updateMany({
    where: {
      status: "ACTIVE",
      lastActivityAt: {
        lt: cutoffTime,
      },
    },
    data: {
      status: "ABANDONED",
    },
  });
}
