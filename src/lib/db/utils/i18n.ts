/**
 * i18n Database Utilities
 * Helpers for working with translation tables
 */

// Default locale for fallback
export const DEFAULT_LOCALE = "ru";

// Supported locales
export const SUPPORTED_LOCALES = ["ru", "ro"] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

/**
 * Merge a base entity with its translation for a given locale
 * Falls back to default locale if translation not found
 *
 * @example
 * const project = await prisma.project.findUnique({
 *   where: { slug },
 *   include: { translations: true }
 * });
 * const localizedProject = mergeTranslation(project, "ro");
 */
export function mergeTranslation<
  T extends { translations: TTranslation[] },
  TTranslation extends { locale: string }
>(
  entity: T,
  locale: string,
  defaultLocale: string = DEFAULT_LOCALE
): Omit<T, "translations"> & Omit<TTranslation, "id" | "locale"> {
  const { translations, ...base } = entity;

  // Find translation for requested locale
  let translation = translations.find((t) => t.locale === locale);

  // Fallback to default locale if not found
  if (!translation && locale !== defaultLocale) {
    translation = translations.find((t) => t.locale === defaultLocale);
  }

  // If we have a translation, merge it with the base
  if (translation) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, locale: _, ...translatedFields } = translation as TTranslation & { id: string };
    return { ...base, ...translatedFields } as Omit<T, "translations"> & Omit<TTranslation, "id" | "locale">;
  }

  // Return base entity if no translation found
  return base as Omit<T, "translations"> & Omit<TTranslation, "id" | "locale">;
}

/**
 * Merge an array of entities with their translations
 *
 * @example
 * const projects = await prisma.project.findMany({
 *   include: { translations: true }
 * });
 * const localizedProjects = mergeTranslations(projects, "ro");
 */
export function mergeTranslations<
  T extends { translations: TTranslation[] },
  TTranslation extends { locale: string }
>(
  entities: T[],
  locale: string,
  defaultLocale: string = DEFAULT_LOCALE
): Array<Omit<T, "translations"> & Omit<TTranslation, "id" | "locale">> {
  return entities.map((entity) => mergeTranslation<T, TTranslation>(entity, locale, defaultLocale));
}

/**
 * Get translation for a specific locale from translations array
 * Returns undefined if not found
 */
export function getTranslation<T extends { locale: string }>(
  translations: T[],
  locale: string,
  defaultLocale: string = DEFAULT_LOCALE
): T | undefined {
  return (
    translations.find((t) => t.locale === locale) ||
    translations.find((t) => t.locale === defaultLocale)
  );
}

/**
 * Check if locale is supported
 */
export function isValidLocale(locale: string): locale is SupportedLocale {
  return SUPPORTED_LOCALES.includes(locale as SupportedLocale);
}

/**
 * Normalize locale to supported locale
 */
export function normalizeLocale(locale: string | undefined): SupportedLocale {
  if (locale && isValidLocale(locale)) {
    return locale;
  }
  return DEFAULT_LOCALE;
}

/**
 * Create include object for Prisma query with translations
 * This helper ensures consistent translation loading
 */
export function withTranslations<T extends Record<string, unknown>>(
  include?: T
): T & { translations: true } {
  return {
    ...include,
    translations: true,
  } as T & { translations: true };
}

/**
 * Flatten nested translations in related entities
 * Useful for deeply nested structures like CaseStudy
 *
 * @example
 * const caseStudy = await prisma.caseStudy.findUnique({
 *   include: {
 *     translations: true,
 *     userFlows: { include: { translations: true, steps: { include: { translations: true } } } }
 *   }
 * });
 * const localized = flattenNestedTranslations(caseStudy, "ro");
 */
export function flattenNestedTranslations<T>(
  entity: T,
  locale: string,
  defaultLocale: string = DEFAULT_LOCALE
): T {
  if (!entity || typeof entity !== "object") {
    return entity;
  }

  // Handle arrays
  if (Array.isArray(entity)) {
    return entity.map((item) =>
      flattenNestedTranslations(item, locale, defaultLocale)
    ) as T;
  }

  const result = { ...entity } as Record<string, unknown>;

  // If entity has translations, merge them
  if ("translations" in result && Array.isArray(result.translations)) {
    const { translations, ...rest } = result;
    const translation = getTranslation(
      translations as Array<{ locale: string }>,
      locale,
      defaultLocale
    );
    if (translation) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, locale: _, ...translatedFields } = translation as { id: string; locale: string };
      Object.assign(result, rest, translatedFields);
      delete result.translations;
    }
  }

  // Recursively process nested objects
  for (const key of Object.keys(result)) {
    if (result[key] && typeof result[key] === "object") {
      result[key] = flattenNestedTranslations(
        result[key],
        locale,
        defaultLocale
      );
    }
  }

  return result as T;
}
