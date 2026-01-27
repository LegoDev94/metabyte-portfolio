import { prisma } from "@/lib/prisma";
import { DEFAULT_LOCALE, type SupportedLocale } from "./utils/i18n";

export interface PricingPlan {
  id: string;
  name: string;
  price: string;
  description: string;
  icon: string;
  color: string;
  popular: boolean;
  features: string[];
  notIncluded: string[];
}

export interface AdditionalService {
  id: string;
  name: string;
  price: string;
  description: string;
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

// Fetch all pricing plans
export async function getPricingPlans(locale: SupportedLocale = DEFAULT_LOCALE): Promise<PricingPlan[]> {
  const dbPlans = await prisma.pricingPackage.findMany({
    include: { translations: true },
    orderBy: { order: "asc" },
  });

  return dbPlans.map((p) => {
    const trans = getTranslation(p.translations, locale);
    return {
      id: p.id,
      name: trans?.name || "",
      price: p.price,
      description: trans?.description || "",
      icon: p.icon,
      color: p.color,
      popular: p.popular,
      features: trans?.features || [],
      notIncluded: trans?.notIncluded || [],
    };
  });
}

// Get popular/highlighted plan
export async function getPopularPlan(locale: SupportedLocale = DEFAULT_LOCALE): Promise<PricingPlan | null> {
  const dbPlan = await prisma.pricingPackage.findFirst({
    where: { popular: true },
    include: { translations: true },
  });

  if (!dbPlan) return null;

  const trans = getTranslation(dbPlan.translations, locale);
  return {
    id: dbPlan.id,
    name: trans?.name || "",
    price: dbPlan.price,
    description: trans?.description || "",
    icon: dbPlan.icon,
    color: dbPlan.color,
    popular: dbPlan.popular,
    features: trans?.features || [],
    notIncluded: trans?.notIncluded || [],
  };
}

// Fetch additional services
export async function getAdditionalServices(locale: SupportedLocale = DEFAULT_LOCALE): Promise<AdditionalService[]> {
  const dbServices = await prisma.additionalService.findMany({
    include: { translations: true },
    orderBy: { order: "asc" },
  });

  return dbServices.map((s) => {
    const trans = getTranslation(s.translations, locale);
    return {
      id: s.id,
      name: trans?.name || "",
      price: s.price,
      description: trans?.description || "",
    };
  });
}
