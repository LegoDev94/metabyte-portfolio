import { prisma } from "@/lib/prisma";
import { DEFAULT_LOCALE, type SupportedLocale } from "./utils/i18n";

// Get translation from array
function getTranslation<T extends { locale: string }>(
  translations: T[] | undefined,
  locale: string
): T | undefined {
  if (!translations || translations.length === 0) return undefined;
  return translations.find((t) => t.locale === locale)
    || translations.find((t) => t.locale === DEFAULT_LOCALE);
}

// ==================== Site Settings ====================

export interface SiteSettings {
  companyName: string;
  subtitle: string;
  badgeText: string;
  heroServices: string[];
  heroTechStack: string[];
  projectsCount: number;
  rating: number;
  countriesCount: number;
  founderName: string;
  founderTitle: string;
  founderBioShort: string;
  founderBioLong: string | null;
  founderPhoto: string;
}

export async function getSiteSettings(locale: SupportedLocale = DEFAULT_LOCALE): Promise<SiteSettings | null> {
  const settings = await prisma.siteSettings.findFirst({
    include: { translations: true },
  });

  if (!settings) return null;

  const trans = getTranslation(settings.translations, locale);

  return {
    companyName: trans?.companyName || "METABYTE",
    subtitle: trans?.subtitle || "Full-Stack Development Studio",
    badgeText: trans?.badgeText || "",
    heroServices: trans?.heroServices || [],
    heroTechStack: settings.heroTechStack,
    projectsCount: settings.projectsCount,
    rating: settings.rating,
    countriesCount: settings.countriesCount,
    founderName: trans?.founderName || "",
    founderTitle: trans?.founderTitle || "",
    founderBioShort: trans?.founderBioShort || "",
    founderBioLong: trans?.founderBioLong || null,
    founderPhoto: settings.founderPhoto,
  };
}

// ==================== Tech Stack ====================

export interface TechStackItem {
  id: string;
  name: string;
  icon: string;
  color: string;
  category: string;
  featured: boolean;
}

export async function getTechStack(): Promise<TechStackItem[]> {
  const items = await prisma.techStackItem.findMany({
    orderBy: { order: "asc" },
  });

  return items.map((item) => ({
    id: item.id,
    name: item.name,
    icon: item.icon,
    color: item.color,
    category: item.category,
    featured: item.featured,
  }));
}

export async function getFeaturedTechStack(): Promise<TechStackItem[]> {
  const items = await prisma.techStackItem.findMany({
    where: { featured: true },
    orderBy: { order: "asc" },
  });

  return items.map((item) => ({
    id: item.id,
    name: item.name,
    icon: item.icon,
    color: item.color,
    category: item.category,
    featured: item.featured,
  }));
}

// ==================== Work Process ====================

export interface WorkProcessStep {
  id: string;
  number: string;
  title: string;
  description: string;
  icon: string;
  color: string;
}

export async function getWorkProcessSteps(locale: SupportedLocale = DEFAULT_LOCALE): Promise<WorkProcessStep[]> {
  const steps = await prisma.workProcessStep.findMany({
    include: { translations: true },
    orderBy: { order: "asc" },
  });

  return steps.map((step) => {
    const trans = getTranslation(step.translations, locale);
    return {
      id: step.id,
      number: step.number,
      title: trans?.title || "",
      description: trans?.description || "",
      icon: step.icon,
      color: step.color,
    };
  });
}

// ==================== Skill Categories ====================

export interface SkillCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  items: string[];
}

export async function getSkillCategories(locale: SupportedLocale = DEFAULT_LOCALE): Promise<SkillCategory[]> {
  const categories = await prisma.skillCategory.findMany({
    include: { translations: true },
    orderBy: { order: "asc" },
  });

  return categories.map((cat) => {
    const trans = getTranslation(cat.translations, locale);
    return {
      id: cat.id,
      name: trans?.name || "",
      icon: cat.icon,
      color: cat.color,
      items: cat.items,
    };
  });
}

// ==================== Contact Info ====================

export interface ContactInfo {
  email: string;
  telegram: string;
  github: string;
  youdoUrl: string | null;
  responseTime: string;
}

export async function getContactInfo(locale: SupportedLocale = DEFAULT_LOCALE): Promise<ContactInfo | null> {
  const info = await prisma.contactInfo.findFirst({
    include: { translations: true },
  });

  if (!info) return null;

  const trans = getTranslation(info.translations, locale);

  return {
    email: info.email,
    telegram: info.telegram,
    github: info.github,
    youdoUrl: info.youdoUrl,
    responseTime: trans?.responseTime || "24 часа",
  };
}
