import { NextRequest, NextResponse } from "next/server";
import { readFile, stat } from "fs/promises";
import path from "path";

// Serve uploaded files dynamically
// This bypasses the standalone server's static file caching
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: pathParts } = await params;
  const filePath = pathParts.join("/");

  // Security: prevent directory traversal
  if (filePath.includes("..") || filePath.startsWith("/")) {
    return new NextResponse("Not found", { status: 404 });
  }

  const fullPath = path.join(process.cwd(), "public", "uploads", filePath);

  // Ensure path is within uploads directory
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  const normalizedPath = path.normalize(fullPath);
  if (!normalizedPath.startsWith(uploadsDir)) {
    return new NextResponse("Not found", { status: 404 });
  }

  try {
    const stats = await stat(fullPath);
    if (!stats.isFile()) {
      return new NextResponse("Not found", { status: 404 });
    }

    const file = await readFile(fullPath);

    // Determine content type
    const ext = path.extname(filePath).toLowerCase();
    const contentTypes: Record<string, string> = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".gif": "image/gif",
      ".webp": "image/webp",
      ".svg": "image/svg+xml",
      ".mp4": "video/mp4",
      ".webm": "video/webm",
      ".pdf": "application/pdf",
    };

    const contentType = contentTypes[ext] || "application/octet-stream";

    return new NextResponse(file, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Length": String(stats.size),
      },
    });
  } catch (error) {
    return new NextResponse("Not found", { status: 404 });
  }
}
