import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

// Local storage configuration
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_TYPES = {
  image: ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"],
  video: ["video/mp4", "video/webm", "video/quicktime"],
  document: ["application/pdf"],
};

export type FileCategory = keyof typeof ALLOWED_TYPES;

interface UploadResult {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  path: string;
}

/**
 * Ensure upload directory exists
 */
async function ensureUploadDir(subDir?: string): Promise<string> {
  const targetDir = subDir ? path.join(UPLOAD_DIR, subDir) : UPLOAD_DIR;

  try {
    await fs.access(targetDir);
  } catch {
    await fs.mkdir(targetDir, { recursive: true });
  }

  return targetDir;
}

/**
 * Generate unique filename
 */
function generateFilename(originalName: string): string {
  const ext = path.extname(originalName).toLowerCase();
  const timestamp = Date.now();
  const randomStr = crypto.randomBytes(8).toString("hex");
  return `${timestamp}-${randomStr}${ext}`;
}

/**
 * Get file category from mime type
 */
export function getFileCategory(mimeType: string): FileCategory | null {
  for (const [category, types] of Object.entries(ALLOWED_TYPES)) {
    if (types.includes(mimeType)) {
      return category as FileCategory;
    }
  }
  return null;
}

/**
 * Validate file
 */
export function validateFile(
  file: { size: number; type: string },
  allowedCategories?: FileCategory[]
): { valid: boolean; error?: string } {
  // Check size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`,
    };
  }

  // Check type
  const category = getFileCategory(file.type);
  if (!category) {
    return {
      valid: false,
      error: `File type ${file.type} is not allowed`,
    };
  }

  // Check if category is in allowed list
  if (allowedCategories && !allowedCategories.includes(category)) {
    return {
      valid: false,
      error: `File category ${category} is not allowed for this upload`,
    };
  }

  return { valid: true };
}

/**
 * Upload a file to local storage
 */
export async function uploadFile(
  file: File,
  options?: {
    subDir?: string;
    allowedCategories?: FileCategory[];
  }
): Promise<UploadResult> {
  // Validate file
  const validation = validateFile(
    { size: file.size, type: file.type },
    options?.allowedCategories
  );
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // Get category for subdirectory organization
  const category = getFileCategory(file.type);
  const subDir = options?.subDir || category || "misc";

  // Ensure directory exists
  const uploadDir = await ensureUploadDir(subDir);

  // Generate unique filename
  const filename = generateFilename(file.name);
  const filePath = path.join(uploadDir, filename);

  // Write file
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(filePath, buffer);

  // Return result
  const relativePath = path.join("uploads", subDir, filename).replace(/\\/g, "/");

  return {
    filename,
    originalName: file.name,
    mimeType: file.type,
    size: file.size,
    // Use API route for serving uploads to bypass standalone server static file caching
    url: `/api/${relativePath}`,
    path: relativePath,
  };
}

/**
 * Delete a file from local storage
 */
export async function deleteFile(filePath: string): Promise<boolean> {
  try {
    // Construct full path from relative path
    const fullPath = path.join(process.cwd(), "public", filePath);

    // Security: ensure path is within uploads directory
    const normalizedPath = path.normalize(fullPath);
    if (!normalizedPath.startsWith(UPLOAD_DIR)) {
      throw new Error("Invalid file path");
    }

    await fs.unlink(fullPath);
    return true;
  } catch (error) {
    console.error("Error deleting file:", error);
    return false;
  }
}

/**
 * Get file info
 */
export async function getFileInfo(
  filePath: string
): Promise<{ exists: boolean; size?: number; mtime?: Date }> {
  try {
    const fullPath = path.join(process.cwd(), "public", filePath);
    const stats = await fs.stat(fullPath);
    return {
      exists: true,
      size: stats.size,
      mtime: stats.mtime,
    };
  } catch {
    return { exists: false };
  }
}

/**
 * List files in upload directory
 */
export async function listFiles(
  subDir?: string
): Promise<{ name: string; path: string; size: number; mtime: Date }[]> {
  const targetDir = subDir ? path.join(UPLOAD_DIR, subDir) : UPLOAD_DIR;

  try {
    const entries = await fs.readdir(targetDir, { withFileTypes: true });
    const files: { name: string; path: string; size: number; mtime: Date }[] = [];

    for (const entry of entries) {
      if (entry.isFile()) {
        const filePath = path.join(targetDir, entry.name);
        const stats = await fs.stat(filePath);
        const relativePath = path
          .join("uploads", subDir || "", entry.name)
          .replace(/\\/g, "/");

        files.push({
          name: entry.name,
          path: relativePath,
          size: stats.size,
          mtime: stats.mtime,
        });
      }
    }

    return files.sort((a, b) => b.mtime.getTime() - a.mtime.getTime());
  } catch {
    return [];
  }
}
