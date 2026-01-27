import { prisma } from "@/lib/prisma";
import { DEFAULT_LOCALE, type SupportedLocale } from "./utils/i18n";

export interface Testimonial {
  id: string;
  author: string;
  task: string;
  text: string;
  rating: number;
  source: string | null;
}

export interface TestimonialStats {
  avgRating: number;
  totalPositive: number;
  totalNegative: number;
  platform: string;
  platformUrl: string | null;
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

// Fetch all testimonials
export async function getTestimonials(locale: SupportedLocale = DEFAULT_LOCALE): Promise<Testimonial[]> {
  const dbTestimonials = await prisma.testimonial.findMany({
    include: { translations: true },
    orderBy: { order: "asc" },
  });

  return dbTestimonials.map((t) => {
    const trans = getTranslation(t.translations, locale);
    return {
      id: t.id,
      author: trans?.author || "",
      task: trans?.task || "",
      text: trans?.text || "",
      rating: t.rating,
      source: t.source,
    };
  });
}

// Fetch limited testimonials for display
export async function getFeaturedTestimonials(
  limit: number = 6,
  locale: SupportedLocale = DEFAULT_LOCALE
): Promise<Testimonial[]> {
  const dbTestimonials = await prisma.testimonial.findMany({
    include: { translations: true },
    orderBy: { order: "asc" },
    take: limit,
  });

  return dbTestimonials.map((t) => {
    const trans = getTranslation(t.translations, locale);
    return {
      id: t.id,
      author: trans?.author || "",
      task: trans?.task || "",
      text: trans?.text || "",
      rating: t.rating,
      source: t.source,
    };
  });
}

// Get testimonials stats
export async function getTestimonialStats(): Promise<TestimonialStats | null> {
  const stats = await prisma.testimonialStats.findFirst();

  if (!stats) return null;

  return {
    avgRating: stats.avgRating,
    totalPositive: stats.totalPositive,
    totalNegative: stats.totalNegative,
    platform: stats.platform,
    platformUrl: stats.platformUrl,
  };
}

// Get testimonials count
export async function getTestimonialsCount(): Promise<number> {
  return prisma.testimonial.count();
}
