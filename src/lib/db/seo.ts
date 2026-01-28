import { prisma } from "@/lib/prisma";

export type PageKey = "home" | "about" | "contact" | "pricing" | "projects";

export const PAGE_KEYS: PageKey[] = ["home", "about", "contact", "pricing", "projects"];

export interface PageSEOData {
  pageKey: PageKey;
  ogImage: string | null;
  translations: {
    locale: string;
    metaTitle: string;
    metaDescription: string;
    metaKeywords: string[];
  }[];
}

/**
 * Get all page SEO settings
 */
export async function getAllPageSEO(): Promise<PageSEOData[]> {
  const pages = await prisma.pageSEO.findMany({
    include: {
      translations: true,
    },
    orderBy: {
      pageKey: "asc",
    },
  });

  return pages.map((page) => ({
    pageKey: page.pageKey as PageKey,
    ogImage: page.ogImage,
    translations: page.translations.map((t) => ({
      locale: t.locale,
      metaTitle: t.metaTitle,
      metaDescription: t.metaDescription,
      metaKeywords: t.metaKeywords,
    })),
  }));
}

/**
 * Get SEO for a specific page
 */
export async function getPageSEO(pageKey: PageKey): Promise<PageSEOData | null> {
  const page = await prisma.pageSEO.findUnique({
    where: { pageKey },
    include: {
      translations: true,
    },
  });

  if (!page) return null;

  return {
    pageKey: page.pageKey as PageKey,
    ogImage: page.ogImage,
    translations: page.translations.map((t) => ({
      locale: t.locale,
      metaTitle: t.metaTitle,
      metaDescription: t.metaDescription,
      metaKeywords: t.metaKeywords,
    })),
  };
}

/**
 * Get SEO for a specific page and locale (for frontend metadata)
 */
export async function getPageSEOForLocale(
  pageKey: PageKey,
  locale: string
): Promise<{
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string[];
  ogImage: string | null;
} | null> {
  const page = await prisma.pageSEO.findUnique({
    where: { pageKey },
    include: {
      translations: {
        where: { locale },
      },
    },
  });

  if (!page || page.translations.length === 0) return null;

  const translation = page.translations[0];
  return {
    metaTitle: translation.metaTitle,
    metaDescription: translation.metaDescription,
    metaKeywords: translation.metaKeywords,
    ogImage: page.ogImage,
  };
}

/**
 * Update page SEO
 */
export async function updatePageSEO(
  pageKey: PageKey,
  data: {
    ogImage?: string | null;
    translations: {
      locale: string;
      metaTitle: string;
      metaDescription: string;
      metaKeywords: string[];
    }[];
  }
): Promise<PageSEOData> {
  // Get or create the page SEO record
  let page = await prisma.pageSEO.findUnique({
    where: { pageKey },
  });

  if (!page) {
    page = await prisma.pageSEO.create({
      data: {
        pageKey,
        ogImage: data.ogImage,
      },
    });
  } else if (data.ogImage !== undefined) {
    page = await prisma.pageSEO.update({
      where: { pageKey },
      data: { ogImage: data.ogImage },
    });
  }

  // Upsert translations
  for (const t of data.translations) {
    await prisma.pageSEOTranslation.upsert({
      where: {
        pageSeoId_locale: {
          pageSeoId: page.id,
          locale: t.locale,
        },
      },
      update: {
        metaTitle: t.metaTitle,
        metaDescription: t.metaDescription,
        metaKeywords: t.metaKeywords,
      },
      create: {
        pageSeoId: page.id,
        locale: t.locale,
        metaTitle: t.metaTitle,
        metaDescription: t.metaDescription,
        metaKeywords: t.metaKeywords,
      },
    });
  }

  return getPageSEO(pageKey) as Promise<PageSEOData>;
}
