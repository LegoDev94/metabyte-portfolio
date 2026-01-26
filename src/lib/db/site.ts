import { prisma } from "@/lib/prisma";

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

export async function getSiteSettings(): Promise<SiteSettings | null> {
  const settings = await prisma.siteSettings.findFirst();

  if (!settings) return null;

  return {
    companyName: settings.companyName,
    subtitle: settings.subtitle,
    badgeText: settings.badgeText,
    heroServices: settings.heroServices,
    heroTechStack: settings.heroTechStack,
    projectsCount: settings.projectsCount,
    rating: settings.rating,
    countriesCount: settings.countriesCount,
    founderName: settings.founderName,
    founderTitle: settings.founderTitle,
    founderBioShort: settings.founderBioShort,
    founderBioLong: settings.founderBioLong,
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

export async function getWorkProcessSteps(): Promise<WorkProcessStep[]> {
  const steps = await prisma.workProcessStep.findMany({
    orderBy: { order: "asc" },
  });

  return steps.map((step) => ({
    id: step.id,
    number: step.number,
    title: step.title,
    description: step.description,
    icon: step.icon,
    color: step.color,
  }));
}

// ==================== Skill Categories ====================

export interface SkillCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  items: string[];
}

export async function getSkillCategories(): Promise<SkillCategory[]> {
  const categories = await prisma.skillCategory.findMany({
    orderBy: { order: "asc" },
  });

  return categories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    icon: cat.icon,
    color: cat.color,
    items: cat.items,
  }));
}

// ==================== Contact Info ====================

export interface ContactInfo {
  email: string;
  telegram: string;
  github: string;
  youdoUrl: string | null;
  responseTime: string;
}

export async function getContactInfo(): Promise<ContactInfo | null> {
  const info = await prisma.contactInfo.findFirst();

  if (!info) return null;

  return {
    email: info.email,
    telegram: info.telegram,
    github: info.github,
    youdoUrl: info.youdoUrl,
    responseTime: info.responseTime,
  };
}
