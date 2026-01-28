import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/auth";
import { uploadFile, validateFile } from "@/lib/storage";

// GET - List all media uploads
export async function GET(request: NextRequest) {
  const session = await requireAdmin(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const type = searchParams.get("type"); // image, video, document
    const search = searchParams.get("search");

    const skip = (page - 1) * limit;

    // Build where clause
    const where: Record<string, unknown> = {};

    if (type) {
      const mimeTypeMap: Record<string, string[]> = {
        image: ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"],
        video: ["video/mp4", "video/webm", "video/quicktime"],
        document: ["application/pdf"],
      };

      if (mimeTypeMap[type]) {
        where.mimeType = { in: mimeTypeMap[type] };
      }
    }

    if (search) {
      where.OR = [
        { originalName: { contains: search, mode: "insensitive" } },
        { filename: { contains: search, mode: "insensitive" } },
      ];
    }

    // Fetch media with pagination
    const [media, total] = await Promise.all([
      prisma.mediaUpload.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.mediaUpload.count({ where }),
    ]);

    return NextResponse.json({
      media,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Media list error:", error);
    return NextResponse.json(
      { error: "Failed to fetch media" },
      { status: 500 }
    );
  }
}

// POST - Upload new media
export async function POST(request: NextRequest) {
  const session = await requireAdmin(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const linkedTo = formData.get("linkedTo") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file before upload
    const validation = validateFile({ size: file.size, type: file.type });
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Upload file to local storage
    const uploadResult = await uploadFile(file);

    // Create database record
    const mediaRecord = await prisma.mediaUpload.create({
      data: {
        filename: uploadResult.filename,
        originalName: uploadResult.originalName,
        mimeType: uploadResult.mimeType,
        size: uploadResult.size,
        url: uploadResult.url,
        bucket: "local",
        path: uploadResult.path,
        uploadedBy: session.adminId,
        linkedTo: linkedTo || undefined,
      },
    });

    return NextResponse.json({
      success: true,
      media: mediaRecord,
    });
  } catch (error) {
    console.error("Media upload error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to upload file" },
      { status: 500 }
    );
  }
}
