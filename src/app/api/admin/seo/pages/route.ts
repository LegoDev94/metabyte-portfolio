import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { getAllPageSEO, PAGE_KEYS } from "@/lib/db/seo";

// GET - List all page SEO settings
export async function GET(request: NextRequest) {
  const session = await requireAdmin(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const pages = await getAllPageSEO();

    // Ensure all pages are included (even if no SEO set yet)
    const pageMap = new Map(pages.map(p => [p.pageKey, p]));
    const allPages = PAGE_KEYS.map(key => pageMap.get(key) || {
      pageKey: key,
      ogImage: null,
      translations: [],
    });

    return NextResponse.json({ pages: allPages });
  } catch (error) {
    console.error("SEO pages list error:", error);
    return NextResponse.json(
      { error: "Failed to fetch SEO pages" },
      { status: 500 }
    );
  }
}
