import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { getPageSEO, updatePageSEO, PAGE_KEYS, PageKey } from "@/lib/db/seo";
import { z } from "zod";

const translationSchema = z.object({
  locale: z.string(),
  metaTitle: z.string().min(1).max(70),
  metaDescription: z.string().min(1).max(160),
  metaKeywords: z.array(z.string()),
});

const updateSchema = z.object({
  ogImage: z.string().nullable().optional(),
  translations: z.array(translationSchema),
});

// GET - Get SEO for specific page
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ pageKey: string }> }
) {
  const session = await requireAdmin(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { pageKey } = await params;

  if (!PAGE_KEYS.includes(pageKey as PageKey)) {
    return NextResponse.json({ error: "Invalid page key" }, { status: 400 });
  }

  try {
    const seo = await getPageSEO(pageKey as PageKey);

    if (!seo) {
      return NextResponse.json({
        pageKey,
        ogImage: null,
        translations: [],
      });
    }

    return NextResponse.json(seo);
  } catch (error) {
    console.error("SEO page get error:", error);
    return NextResponse.json(
      { error: "Failed to fetch page SEO" },
      { status: 500 }
    );
  }
}

// PUT - Update SEO for specific page
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ pageKey: string }> }
) {
  const session = await requireAdmin(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { pageKey } = await params;

  if (!PAGE_KEYS.includes(pageKey as PageKey)) {
    return NextResponse.json({ error: "Invalid page key" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const validated = updateSchema.parse(body);

    const updated = await updatePageSEO(pageKey as PageKey, validated);

    return NextResponse.json({
      success: true,
      seo: updated,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }

    console.error("SEO page update error:", error);
    return NextResponse.json(
      { error: "Failed to update page SEO" },
      { status: 500 }
    );
  }
}
