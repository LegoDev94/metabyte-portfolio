import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/auth";

// GET - Count new contacts
export async function GET(request: NextRequest) {
  const session = await requireAdmin(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Count NEW form submissions
    const formCount = await prisma.contactSubmission.count({
      where: { status: "NEW" },
    });

    // Count visitor contacts (all are considered "new" until processed)
    const aiContactsCount = await prisma.visitorContact.count();

    const totalNew = formCount + aiContactsCount;

    return NextResponse.json({
      total: totalNew,
      formSubmissions: formCount,
      aiContacts: aiContactsCount,
    });
  } catch (error) {
    console.error("Count contacts error:", error);
    return NextResponse.json(
      { error: "Failed to count contacts" },
      { status: 500 }
    );
  }
}
