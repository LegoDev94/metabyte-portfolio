export const locales = ["ru", "ro"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "ru";

// Mapping countries to locales
export const countryToLocale: Record<string, Locale> = {
  // Moldova -> Romanian
  MD: "ro",

  // CIS Russian-speaking countries -> Russian
  RU: "ru",
  BY: "ru",
  KZ: "ru",
  UZ: "ru",
  KG: "ru",
  TJ: "ru",
  AM: "ru",
  AZ: "ru",
  UA: "ru",
  GE: "ru",
  TM: "ru",
};

// Currency configuration per locale
export const localeCurrency: Record<Locale, { code: string; symbol: string; rate: number }> = {
  ru: { code: "RUB", symbol: "₽", rate: 1 },
  ro: { code: "MDL", symbol: "lei", rate: 0.2 }, // Approximate rate: 1 RUB ≈ 0.2 MDL
};

export function getLocaleFromCountry(countryCode: string | null): Locale {
  if (!countryCode) return defaultLocale;
  return countryToLocale[countryCode.toUpperCase()] || defaultLocale;
}
