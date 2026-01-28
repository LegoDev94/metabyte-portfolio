import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, logAdminAction } from "@/lib/admin/auth";

// GET - List all contacts (from both VisitorContact and ContactSubmission)
export async function GET(request: NextRequest) {
  const session = await requireAdmin(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Fetch AI assistant contacts
    const visitorContacts = await prisma.visitorContact.findMany({
      include: {
        visitor: {
          include: {
            chatSessions: {
              orderBy: { lastActivityAt: "desc" },
              take: 1,
            },
          },
        },
      },
      orderBy: { collectedAt: "desc" },
    });

    // Fetch form submissions
    const formSubmissions = await prisma.contactSubmission.findMany({
      orderBy: { createdAt: "desc" },
    });

    // Combine and format
    const contacts = [
      ...visitorContacts.map((vc) => ({
        id: vc.id,
        type: "ai_assistant" as const,
        name: vc.name,
        contact: vc.contact,
        email: null,
        subject: null,
        message: vc.message,
        status: "NEW" as const,
        source: vc.source,
        createdAt: vc.collectedAt.toISOString(),
        visitorId: vc.visitor?.visitorId || null,
        chatSessionId: vc.visitor?.chatSessions[0]?.id || null,
        city: vc.visitor?.city || null,
        country: vc.visitor?.country || null,
      })),
      ...formSubmissions.map((fs) => ({
        id: fs.id,
        type: "form" as const,
        name: fs.name,
        contact: null,
        email: fs.email,
        subject: fs.subject,
        message: fs.message,
        status: fs.status,
        source: "contact_form",
        createdAt: fs.createdAt.toISOString(),
        visitorId: null,
        chatSessionId: null,
        city: null,
        country: null,
      })),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ contacts });
  } catch (error) {
    console.error("Contacts API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch contacts" },
      { status: 500 }
    );
  }
}

// PUT - Update contact status (for form submissions)
export async function PUT(request: NextRequest) {
  const session = await requireAdmin(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, status, response } = body;

    if (!id || !status) {
      return NextResponse.json({ error: "ID and status are required" }, { status: 400 });
    }

    const submission = await prisma.contactSubmission.update({
      where: { id },
      data: {
        status,
        response: response || undefined,
      },
    });

    await logAdminAction({
      adminId: session.adminId,
      action: "contact_status_update",
      targetType: "contact_submission",
      targetId: id,
      request,
    });

    return NextResponse.json({ submission });
  } catch (error) {
    console.error("Update contact error:", error);
    return NextResponse.json(
      { error: "Failed to update contact" },
      { status: 500 }
    );
  }
}

// DELETE - Delete contact
export async function DELETE(request: NextRequest) {
  const session = await requireAdmin(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const type = searchParams.get("type");

    if (!id || !type) {
      return NextResponse.json({ error: "ID and type are required" }, { status: 400 });
    }

    if (type === "ai_assistant") {
      await prisma.visitorContact.delete({ where: { id } });
    } else if (type === "form") {
      await prisma.contactSubmission.delete({ where: { id } });
    } else {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    await logAdminAction({
      adminId: session.adminId,
      action: "contact_delete",
      targetType: type === "ai_assistant" ? "visitor_contact" : "contact_submission",
      targetId: id,
      request,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete contact error:", error);
    return NextResponse.json(
      { error: "Failed to delete contact" },
      { status: 500 }
    );
  }
}
