import { NextRequest, NextResponse } from "next/server";
import { getLocaleFromCountry, localeCurrency, type Locale } from "@/i18n/config";

export async function GET(request: NextRequest) {
  // Try to get country from headers (set by middleware or CDN)
  let country =
    request.headers.get("x-vercel-ip-country") ||
    request.headers.get("cf-ipcountry") ||
    request.cookies.get("user-country")?.value ||
    null;

  // If no country from headers, try to detect via IP
  if (!country) {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      null;

    if (ip && ip !== "127.0.0.1" && ip !== "::1") {
      try {
        // Use free IP geolocation API
        const geoResponse = await fetch(`http://ip-api.com/json/${ip}?fields=countryCode`, {
          next: { revalidate: 86400 }, // Cache for 24 hours
        });

        if (geoResponse.ok) {
          const geoData = await geoResponse.json();
          country = geoData.countryCode || null;
        }
      } catch (error) {
        console.error("Geolocation API error:", error);
      }
    }
  }

  const locale = getLocaleFromCountry(country);
  const currency = localeCurrency[locale];

  const response = NextResponse.json({
    country,
    locale,
    currency,
  });

  // Set cookies if we detected a country
  if (country) {
    response.cookies.set("user-country", country, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365, // 1 year
      sameSite: "lax",
    });
    response.cookies.set("locale", locale, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365, // 1 year
      sameSite: "lax",
    });
  }

  return response;
}

// API to manually set locale
export async function POST(request: NextRequest) {
  try {
    const { locale } = await request.json();

    if (!locale || !["ru", "ro"].includes(locale)) {
      return NextResponse.json(
        { error: "Invalid locale" },
        { status: 400 }
      );
    }

    const currency = localeCurrency[locale as Locale];

    const response = NextResponse.json({
      locale,
      currency,
      success: true,
    });

    response.cookies.set("locale", locale, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365, // 1 year
      sameSite: "lax",
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}
