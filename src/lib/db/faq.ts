import { prisma } from "@/lib/prisma";
import { DEFAULT_LOCALE, type SupportedLocale } from "./utils/i18n";

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

// Get translation from array
function getTranslation<T extends { locale: string }>(
  translations: T[] | undefined,
  locale: string
): T | undefined {
  if (!translations || translations.length === 0) return undefined;
  return translations.find((t) => t.locale === locale)
    || translations.find((t) => t.locale === DEFAULT_LOCALE);
}

// Fetch all FAQ items
export async function getFAQItems(locale: SupportedLocale = DEFAULT_LOCALE): Promise<FAQItem[]> {
  const dbFAQ = await prisma.faqItem.findMany({
    include: { translations: true },
    orderBy: { order: "asc" },
  });

  return dbFAQ.map((f) => {
    const trans = getTranslation(f.translations, locale);
    return {
      id: f.id,
      question: trans?.question || "",
      answer: trans?.answer || "",
      category: f.category || "general",
    };
  });
}

// Fetch FAQ items by category
export async function getFAQByCategory(
  category: string,
  locale: SupportedLocale = DEFAULT_LOCALE
): Promise<FAQItem[]> {
  const dbFAQ = await prisma.faqItem.findMany({
    where: { category },
    include: { translations: true },
    orderBy: { order: "asc" },
  });

  return dbFAQ.map((f) => {
    const trans = getTranslation(f.translations, locale);
    return {
      id: f.id,
      question: trans?.question || "",
      answer: trans?.answer || "",
      category: f.category || "general",
    };
  });
}

// Get FAQ categories
export async function getFAQCategories(): Promise<string[]> {
  const categories = await prisma.faqItem.findMany({
    distinct: ["category"],
    select: { category: true },
    orderBy: { order: "asc" },
  });

  return categories
    .map((c) => c.category)
    .filter((c): c is string => c !== null);
}
