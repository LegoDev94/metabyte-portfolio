import { prisma } from "@/lib/prisma";

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

// Fetch all team members
export async function getTeamMembers(): Promise<TeamMember[]> {
  const dbMembers = await prisma.teamMember.findMany({
    include: {
      socialLinks: true,
    },
    orderBy: { order: "asc" },
  });

  return dbMembers.map((m) => ({
    id: m.id,
    name: m.name,
    role: m.role,
    description: m.description,
    photo: m.photo,
    skills: m.skills,
    bio: m.bio,
    isFounder: m.isFounder,
    socials: {
      github: m.socialLinks?.github || undefined,
      telegram: m.socialLinks?.telegram || undefined,
      linkedin: m.socialLinks?.linkedin || undefined,
    },
  }));
}

// Get founder/primary team member
export async function getFounder(): Promise<TeamMember | null> {
  const dbMember = await prisma.teamMember.findFirst({
    where: { isFounder: true },
    include: {
      socialLinks: true,
    },
  });

  if (!dbMember) return null;

  return {
    id: dbMember.id,
    name: dbMember.name,
    role: dbMember.role,
    description: dbMember.description,
    photo: dbMember.photo,
    skills: dbMember.skills,
    bio: dbMember.bio,
    isFounder: dbMember.isFounder,
    socials: {
      github: dbMember.socialLinks?.github || undefined,
      telegram: dbMember.socialLinks?.telegram || undefined,
      linkedin: dbMember.socialLinks?.linkedin || undefined,
    },
  };
}
