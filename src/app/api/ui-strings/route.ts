import { NextResponse } from "next/server";
import { getUIStrings } from "@/lib/db/ui-strings";
import { normalizeLocale, type SupportedLocale } from "@/lib/db/utils/i18n";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const locale = normalizeLocale(searchParams.get("locale") ?? undefined) as SupportedLocale;

    const strings = await getUIStrings(locale);

    return NextResponse.json({
      locale,
      strings,
      count: Object.keys(strings).length,
    });
  } catch (error) {
    console.error("Failed to fetch UI strings:", error);
    return NextResponse.json(
      { error: "Failed to fetch UI strings" },
      { status: 500 }
    );
  }
}
