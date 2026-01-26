import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getLocaleFromCountry, defaultLocale, locales, type Locale } from "./i18n/config";

const LOCALE_COOKIE = "locale";
const COUNTRY_COOKIE = "user-country";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Check if locale cookie already exists
  const existingLocale = request.cookies.get(LOCALE_COOKIE)?.value as Locale | undefined;
  if (existingLocale && locales.includes(existingLocale)) {
    return response;
  }

  // Try to get country from various sources
  let country: string | null = null;

  // 1. Check Vercel's geo header (available on Vercel deployment)
  country = request.headers.get("x-vercel-ip-country");

  // 2. Check Cloudflare's geo header (if behind Cloudflare)
  if (!country) {
    country = request.headers.get("cf-ipcountry");
  }

  // 3. Check cached country cookie (from previous API call)
  if (!country) {
    country = request.cookies.get(COUNTRY_COOKIE)?.value || null;
  }

  // 4. If no country detected and it's not an API/static request,
  // we'll let the client-side detect it
  if (!country) {
    // Get IP for client-side geolocation fallback
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
               request.headers.get("x-real-ip") ||
               null;

    // For now, use default locale and let client-side handle detection
    const locale = defaultLocale;
    response.cookies.set(LOCALE_COOKIE, locale, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365, // 1 year
      sameSite: "lax",
    });

    // Store IP for client-side geolocation if needed
    if (ip) {
      response.headers.set("x-user-ip", ip);
    }

    return response;
  }

  // Determine locale from country
  const locale = getLocaleFromCountry(country);

  // Set cookies
  response.cookies.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 year
    sameSite: "lax",
  });

  response.cookies.set(COUNTRY_COOKIE, country, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 year
    sameSite: "lax",
  });

  return response;
}

export const config = {
  matcher: [
    // Match all paths except:
    // - API routes that start with /api
    // - Static files (_next/static, _next/image, favicon.ico, etc.)
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*$).*)",
  ],
};
