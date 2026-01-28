import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/auth";
import { deleteFile } from "@/lib/storage";

// GET - Get single media item
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const media = await prisma.mediaUpload.findUnique({
      where: { id },
      include: { translations: true },
    });

    if (!media) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 });
    }

    return NextResponse.json(media);
  } catch (error) {
    console.error("Get media error:", error);
    return NextResponse.json(
      { error: "Failed to fetch media" },
      { status: 500 }
    );
  }
}

// PATCH - Update media metadata
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const { linkedTo } = body;

    const media = await prisma.mediaUpload.update({
      where: { id },
      data: {
        linkedTo: linkedTo || null,
      },
    });

    return NextResponse.json({
      success: true,
      media,
    });
  } catch (error) {
    console.error("Update media error:", error);
    return NextResponse.json(
      { error: "Failed to update media" },
      { status: 500 }
    );
  }
}

// PUT - Update media SEO translations
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const { translations } = body;

    if (!translations || !Array.isArray(translations)) {
      return NextResponse.json(
        { error: "Translations array is required" },
        { status: 400 }
      );
    }

    // Check if media exists
    const media = await prisma.mediaUpload.findUnique({
      where: { id },
    });

    if (!media) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 });
    }

    // Upsert translations
    for (const t of translations) {
      if (!t.locale || !t.altText) continue;

      await prisma.mediaUploadTranslation.upsert({
        where: {
          mediaId_locale: {
            mediaId: id,
            locale: t.locale,
          },
        },
        update: {
          altText: t.altText,
          title: t.title || null,
          description: t.description || null,
        },
        create: {
          mediaId: id,
          locale: t.locale,
          altText: t.altText,
          title: t.title || null,
          description: t.description || null,
        },
      });
    }

    // Fetch updated media with translations
    const updatedMedia = await prisma.mediaUpload.findUnique({
      where: { id },
      include: { translations: true },
    });

    return NextResponse.json({
      success: true,
      media: updatedMedia,
    });
  } catch (error) {
    console.error("Update media SEO error:", error);
    return NextResponse.json(
      { error: "Failed to update media SEO" },
      { status: 500 }
    );
  }
}

// DELETE - Delete media file
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    // Get media record first
    const media = await prisma.mediaUpload.findUnique({
      where: { id },
    });

    if (!media) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 });
    }

    // Delete file from storage
    const deleted = await deleteFile(media.path);

    if (!deleted) {
      console.warn(`Could not delete file ${media.path}, but will remove DB record`);
    }

    // Delete database record
    await prisma.mediaUpload.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Media deleted successfully",
    });
  } catch (error) {
    console.error("Delete media error:", error);
    return NextResponse.json(
      { error: "Failed to delete media" },
      { status: 500 }
    );
  }
}
