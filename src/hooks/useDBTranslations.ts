"use client";

import { useLocaleContext } from "@/components/providers/LocaleProvider";
import { useCallback, useMemo } from "react";

/**
 * Hook for accessing UI translations from the database
 * Replaces next-intl's useTranslations hook
 *
 * @param namespace - Optional namespace to scope translations (e.g., "hero", "nav")
 * @returns Translation function t(key) that returns the translated string
 *
 * @example
 * // Without namespace - use full keys
 * const t = useDBTranslations();
 * const text = t("hero.badge"); // Uses full key "hero.badge"
 *
 * @example
 * // With namespace - use short keys
 * const t = useDBTranslations("hero");
 * const text = t("badge"); // Looks up "hero.badge"
 */
export function useDBTranslations(namespace?: string) {
  const { uiStrings } = useLocaleContext();

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      const fullKey = namespace ? `${namespace}.${key}` : key;
      let value = uiStrings[fullKey];

      // Return key as fallback if not found
      if (!value) {
        console.warn(`Missing translation for key: ${fullKey}`);
        return fullKey;
      }

      // Handle interpolation params like {name}, {count}
      if (params) {
        Object.entries(params).forEach(([paramKey, paramValue]) => {
          value = value.replace(new RegExp(`\\{${paramKey}\\}`, "g"), String(paramValue));
        });
      }

      return value;
    },
    [uiStrings, namespace]
  );

  // Return a function that also has a raw property for accessing all strings
  return useMemo(() => {
    const translationFn = t as typeof t & {
      raw: (key: string) => string | undefined;
      has: (key: string) => boolean;
    };

    // Access raw value without warning
    translationFn.raw = (key: string) => {
      const fullKey = namespace ? `${namespace}.${key}` : key;
      return uiStrings[fullKey];
    };

    // Check if key exists
    translationFn.has = (key: string) => {
      const fullKey = namespace ? `${namespace}.${key}` : key;
      return fullKey in uiStrings;
    };

    return translationFn;
  }, [t, uiStrings, namespace]);
}

/**
 * Hook for accessing all UI strings as a flat object
 * Useful for passing translations to components that need multiple keys
 */
export function useAllTranslations() {
  const { uiStrings } = useLocaleContext();
  return uiStrings;
}

/**
 * Hook for accessing translations by namespace as an object
 * Returns all keys within a namespace as key-value pairs
 */
export function useNamespaceTranslations(namespace: string) {
  const { uiStrings } = useLocaleContext();

  return useMemo(() => {
    const prefix = `${namespace}.`;
    const result: Record<string, string> = {};

    Object.entries(uiStrings).forEach(([key, value]) => {
      if (key.startsWith(prefix)) {
        result[key.slice(prefix.length)] = value;
      }
    });

    return result;
  }, [uiStrings, namespace]);
}

// Re-export for convenience
export { useLocaleContext } from "@/components/providers/LocaleProvider";
