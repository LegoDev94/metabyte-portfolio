/**
 * UI Strings Database Layer
 * Handles UI translations stored in the database
 */

import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";
import { DEFAULT_LOCALE, type SupportedLocale } from "./utils/i18n";

// Type for UI strings dictionary
export type UIStringsDict = Record<string, string>;

/**
 * Get all UI strings for a locale (cached)
 */
export const getUIStrings = unstable_cache(
  async (locale: SupportedLocale = DEFAULT_LOCALE): Promise<UIStringsDict> => {
    try {
      const strings = await prisma.uIString.findMany({
        where: { locale },
        select: { key: true, value: true },
      });

      return Object.fromEntries(strings.map((s) => [s.key, s.value]));
    } catch (error) {
      console.error(`Failed to load UI strings for locale ${locale}:`, error);
      return {};
    }
  },
  ["ui-strings"],
  {
    revalidate: 300, // 5 minutes
    tags: ["ui-strings"],
  }
);

/**
 * Get UI strings by namespace (cached)
 */
export const getUIStringsByNamespace = unstable_cache(
  async (
    locale: SupportedLocale = DEFAULT_LOCALE,
    namespace: string
  ): Promise<UIStringsDict> => {
    try {
      const strings = await prisma.uIString.findMany({
        where: { locale, namespace },
        select: { key: true, value: true },
      });

      // Return with namespace stripped from keys
      return Object.fromEntries(
        strings.map((s) => [s.key.replace(`${namespace}.`, ""), s.value])
      );
    } catch (error) {
      console.error(
        `Failed to load UI strings for namespace ${namespace}:`,
        error
      );
      return {};
    }
  },
  ["ui-strings-namespace"],
  {
    revalidate: 300,
    tags: ["ui-strings"],
  }
);

/**
 * Get a single UI string value
 */
export async function getUIString(
  key: string,
  locale: SupportedLocale = DEFAULT_LOCALE
): Promise<string | null> {
  try {
    const result = await prisma.uIString.findUnique({
      where: { key_locale: { key, locale } },
      select: { value: true },
    });

    if (!result && locale !== DEFAULT_LOCALE) {
      // Fallback to default locale
      const fallback = await prisma.uIString.findUnique({
        where: { key_locale: { key, locale: DEFAULT_LOCALE } },
        select: { value: true },
      });
      return fallback?.value ?? null;
    }

    return result?.value ?? null;
  } catch (error) {
    console.error(`Failed to load UI string ${key}:`, error);
    return null;
  }
}

/**
 * Upsert UI string (for admin/migration)
 */
export async function upsertUIString(
  key: string,
  locale: SupportedLocale,
  value: string,
  namespace?: string
): Promise<void> {
  await prisma.uIString.upsert({
    where: { key_locale: { key, locale } },
    create: { key, locale, value, namespace },
    update: { value, namespace },
  });
}

/**
 * Bulk upsert UI strings (for migration)
 */
export async function bulkUpsertUIStrings(
  strings: Array<{
    key: string;
    locale: SupportedLocale;
    value: string;
    namespace?: string;
  }>
): Promise<void> {
  // Use transaction for atomicity
  await prisma.$transaction(
    strings.map((s) =>
      prisma.uIString.upsert({
        where: { key_locale: { key: s.key, locale: s.locale } },
        create: s,
        update: { value: s.value, namespace: s.namespace },
      })
    )
  );
}

/**
 * Delete UI string
 */
export async function deleteUIString(
  key: string,
  locale: SupportedLocale
): Promise<void> {
  await prisma.uIString.delete({
    where: { key_locale: { key, locale } },
  });
}

/**
 * Get all namespaces
 */
export async function getUIStringNamespaces(): Promise<string[]> {
  const result = await prisma.uIString.findMany({
    where: { namespace: { not: null } },
    select: { namespace: true },
    distinct: ["namespace"],
  });

  return result
    .map((r) => r.namespace)
    .filter((ns): ns is string => ns !== null);
}

/**
 * Check if UI strings are loaded in database
 */
export async function hasUIStrings(locale: SupportedLocale): Promise<boolean> {
  const count = await prisma.uIString.count({
    where: { locale },
  });
  return count > 0;
}

/**
 * Get UI strings count by locale
 */
export async function getUIStringsCount(): Promise<Record<string, number>> {
  const result = await prisma.uIString.groupBy({
    by: ["locale"],
    _count: true,
  });

  return Object.fromEntries(result.map((r) => [r.locale, r._count]));
}
