import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, logAdminAction } from "@/lib/admin/auth";
import { z } from "zod";

const siteSettingsSchema = z.object({
  heroTechStack: z.array(z.string()),
  projectsCount: z.number().int(),
  rating: z.number(),
  countriesCount: z.number().int(),
  founderPhoto: z.string(),
  translations: z.array(z.object({
    locale: z.string(),
    companyName: z.string(),
    subtitle: z.string(),
    badgeText: z.string(),
    heroServices: z.array(z.string()),
    founderName: z.string(),
    founderTitle: z.string(),
    founderBioShort: z.string(),
    founderBioLong: z.string().optional(),
  })),
});

const contactInfoSchema = z.object({
  email: z.string().email(),
  telegram: z.string(),
  github: z.string(),
  youdoUrl: z.string().optional(),
  translations: z.array(z.object({
    locale: z.string(),
    responseTime: z.string(),
  })),
});

// GET - Get site settings and contact info
export async function GET(request: NextRequest) {
  const session = await requireAdmin(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [siteSettings, contactInfo] = await Promise.all([
      prisma.siteSettings.findUnique({
        where: { id: "default" },
        include: { translations: true },
      }),
      prisma.contactInfo.findUnique({
        where: { id: "default" },
        include: { translations: true },
      }),
    ]);

    return NextResponse.json({ siteSettings, contactInfo });
  } catch (error) {
    console.error("Settings API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

// PUT - Update site settings
export async function PUT(request: NextRequest) {
  const session = await requireAdmin(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { type, ...data } = body;

    if (type === "site") {
      const validatedData = siteSettingsSchema.parse(data);

      const settings = await prisma.$transaction(async (tx) => {
        // Upsert main settings
        await tx.siteSettings.upsert({
          where: { id: "default" },
          create: {
            id: "default",
            heroTechStack: validatedData.heroTechStack,
            projectsCount: validatedData.projectsCount,
            rating: validatedData.rating,
            countriesCount: validatedData.countriesCount,
            founderPhoto: validatedData.founderPhoto,
          },
          update: {
            heroTechStack: validatedData.heroTechStack,
            projectsCount: validatedData.projectsCount,
            rating: validatedData.rating,
            countriesCount: validatedData.countriesCount,
            founderPhoto: validatedData.founderPhoto,
          },
        });

        // Delete existing translations
        await tx.siteSettingsTranslation.deleteMany({
          where: { settingsId: "default" },
        });

        // Create new translations
        await tx.siteSettingsTranslation.createMany({
          data: validatedData.translations.map((t) => ({
            settingsId: "default",
            ...t,
          })),
        });

        return tx.siteSettings.findUnique({
          where: { id: "default" },
          include: { translations: true },
        });
      });

      await logAdminAction({
        adminId: session.adminId,
        action: "site_settings_update",
        targetType: "site_settings",
        targetId: "default",
        request,
      });

      return NextResponse.json({ siteSettings: settings });
    } else if (type === "contact") {
      const validatedData = contactInfoSchema.parse(data);

      const contactInfo = await prisma.$transaction(async (tx) => {
        await tx.contactInfo.upsert({
          where: { id: "default" },
          create: {
            id: "default",
            email: validatedData.email,
            telegram: validatedData.telegram,
            github: validatedData.github,
            youdoUrl: validatedData.youdoUrl,
          },
          update: {
            email: validatedData.email,
            telegram: validatedData.telegram,
            github: validatedData.github,
            youdoUrl: validatedData.youdoUrl,
          },
        });

        await tx.contactInfoTranslation.deleteMany({
          where: { contactId: "default" },
        });

        await tx.contactInfoTranslation.createMany({
          data: validatedData.translations.map((t) => ({
            contactId: "default",
            ...t,
          })),
        });

        return tx.contactInfo.findUnique({
          where: { id: "default" },
          include: { translations: true },
        });
      });

      await logAdminAction({
        adminId: session.adminId,
        action: "contact_info_update",
        targetType: "contact_info",
        targetId: "default",
        request,
      });

      return NextResponse.json({ contactInfo });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Update settings error:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
