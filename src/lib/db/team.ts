import { prisma } from "@/lib/prisma";
import { DEFAULT_LOCALE, type SupportedLocale } from "./utils/i18n";

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  description: string;
  photo: string;
  skills: string[];
  bio: string | null;
  isFounder: boolean;
  socials: {
    github?: string;
    telegram?: string;
    linkedin?: string;
  };
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

// Fetch all team members
export async function getTeamMembers(locale: SupportedLocale = DEFAULT_LOCALE): Promise<TeamMember[]> {
  const dbMembers = await prisma.teamMember.findMany({
    include: {
      translations: true,
      socialLinks: true,
    },
    orderBy: { order: "asc" },
  });

  return dbMembers.map((m) => {
    const trans = getTranslation(m.translations, locale);
    return {
      id: m.id,
      name: trans?.name || "",
      role: trans?.role || "",
      description: trans?.description || "",
      photo: m.photo,
      skills: m.skills,
      bio: trans?.bio || null,
      isFounder: m.isFounder,
      socials: {
        github: m.socialLinks?.github || undefined,
        telegram: m.socialLinks?.telegram || undefined,
        linkedin: m.socialLinks?.linkedin || undefined,
      },
    };
  });
}

// Get founder/primary team member
export async function getFounder(locale: SupportedLocale = DEFAULT_LOCALE): Promise<TeamMember | null> {
  const dbMember = await prisma.teamMember.findFirst({
    where: { isFounder: true },
    include: {
      translations: true,
      socialLinks: true,
    },
  });

  if (!dbMember) return null;

  const trans = getTranslation(dbMember.translations, locale);
  return {
    id: dbMember.id,
    name: trans?.name || "",
    role: trans?.role || "",
    description: trans?.description || "",
    photo: dbMember.photo,
    skills: dbMember.skills,
    bio: trans?.bio || null,
    isFounder: dbMember.isFounder,
    socials: {
      github: dbMember.socialLinks?.github || undefined,
      telegram: dbMember.socialLinks?.telegram || undefined,
      linkedin: dbMember.socialLinks?.linkedin || undefined,
    },
  };
}
