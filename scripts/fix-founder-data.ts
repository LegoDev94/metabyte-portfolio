/**
 * Fix Founder Data Script
 * Fixes the founder name and data that was incorrectly set
 *
 * Usage: npx tsx scripts/fix-founder-data.ts
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Fixing founder data...\n");

  // Fix TeamMember translations for founder
  const founder = await prisma.teamMember.findFirst({
    where: { isFounder: true },
  });

  if (founder) {
    console.log("Found founder:", founder.id);

    // Delete existing translations
    await prisma.teamMemberTranslation.deleteMany({
      where: { memberId: founder.id },
    });

    // Create correct translations
    await prisma.teamMemberTranslation.createMany({
      data: [
        {
          memberId: founder.id,
          locale: "ru",
          name: "Владимир",
          role: "Full-Stack разработчик и основатель",
          description: "Создаю веб-приложения, мобильные приложения на Flutter, браузерные мультиплеерные игры и системы с AI-интеграцией.",
          bio: "За плечами 17+ коммерческих проектов: от FinTech платформ и EdTech приложений до 3D браузерных игр с real-time мультиплеером. Работаю с React, Next.js, Vue, Flutter, Node.js и современными AI API.",
        },
        {
          memberId: founder.id,
          locale: "ro",
          name: "Vladimir",
          role: "Dezvoltator Full-Stack și fondator",
          description: "Creez aplicații web, aplicații mobile pe Flutter, jocuri multiplayer în browser și sisteme cu integrare AI.",
          bio: "Am în spate 17+ proiecte comerciale: de la platforme FinTech și aplicații EdTech până la jocuri 3D în browser cu multiplayer în timp real. Lucrez cu React, Next.js, Vue, Flutter, Node.js și API-uri AI moderne.",
        },
      ],
    });

    console.log("  Fixed TeamMember translations for founder");
  }

  // Fix SiteSettings translations
  const siteSettings = await prisma.siteSettings.findFirst();

  if (siteSettings) {
    console.log("\nFound site settings:", siteSettings.id);

    // Delete existing translations
    await prisma.siteSettingsTranslation.deleteMany({
      where: { settingsId: siteSettings.id },
    });

    // Create correct translations
    await prisma.siteSettingsTranslation.createMany({
      data: [
        {
          settingsId: siteSettings.id,
          locale: "ru",
          companyName: "METABYTE",
          subtitle: "Full-Stack Development Studio",
          badgeText: "Открыт для предложений",
          heroServices: ["Веб-приложения", "Мобильные приложения", "Браузерные игры", "AI интеграции"],
          founderName: "Владимир",
          founderTitle: "Full-Stack разработчик и основатель IT-студии METABYTE",
          founderBioShort: "Создаю веб-приложения, мобильные приложения на Flutter, браузерные мультиплеерные игры и системы с AI-интеграцией.",
          founderBioLong: "За плечами 17+ коммерческих проектов: от FinTech платформ и EdTech приложений до 3D браузерных игр с real-time мультиплеером. Работаю с React, Next.js, Vue, Flutter, Node.js и современными AI API.",
        },
        {
          settingsId: siteSettings.id,
          locale: "ro",
          companyName: "METABYTE",
          subtitle: "Full-Stack Development Studio",
          badgeText: "Deschis pentru propuneri",
          heroServices: ["Aplicații web", "Aplicații mobile", "Jocuri în browser", "Integrări AI"],
          founderName: "Vladimir",
          founderTitle: "Dezvoltator Full-Stack și fondator al studioului IT METABYTE",
          founderBioShort: "Creez aplicații web, aplicații mobile pe Flutter, jocuri multiplayer în browser și sisteme cu integrare AI.",
          founderBioLong: "Am în spate 17+ proiecte comerciale: de la platforme FinTech și aplicații EdTech până la jocuri 3D în browser cu multiplayer în timp real. Lucrez cu React, Next.js, Vue, Flutter, Node.js și API-uri AI moderne.",
        },
      ],
    });

    console.log("  Fixed SiteSettings translations");
  }

  // Also fix the other team members
  const otherMembers = await prisma.teamMember.findMany({
    where: { isFounder: false },
    orderBy: { order: "asc" },
  });

  const otherMembersData = [
    {
      ru: { name: "UI/UX Дизайнер", role: "Дизайнер интерфейсов", description: "Создание современных и удобных интерфейсов" },
      ro: { name: "UI/UX Designer", role: "Designer de interfețe", description: "Crearea interfețelor moderne și convenabile" },
    },
    {
      ru: { name: "DevOps Инженер", role: "DevOps специалист", description: "Настройка инфраструктуры и CI/CD" },
      ro: { name: "Inginer DevOps", role: "Specialist DevOps", description: "Configurarea infrastructurii și CI/CD" },
    },
  ];

  for (let i = 0; i < otherMembers.length && i < otherMembersData.length; i++) {
    const member = otherMembers[i];
    const data = otherMembersData[i];

    await prisma.teamMemberTranslation.deleteMany({
      where: { memberId: member.id },
    });

    await prisma.teamMemberTranslation.createMany({
      data: [
        { memberId: member.id, locale: "ru", name: data.ru.name, role: data.ru.role, description: data.ru.description, bio: null },
        { memberId: member.id, locale: "ro", name: data.ro.name, role: data.ro.role, description: data.ro.description, bio: null },
      ],
    });

    console.log(`  Fixed TeamMember: ${data.ru.name}`);
  }

  console.log("\nFounder data fixed successfully!");

  await prisma.$disconnect();
  await pool.end();
}

main().catch(console.error);
