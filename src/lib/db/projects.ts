import { prisma } from "@/lib/prisma";
import { flattenNestedTranslations, DEFAULT_LOCALE, type SupportedLocale } from "./utils/i18n";
import type { Project, Technology, Feature, Metric, CaseStudy } from "@/data/projects";

// Project include config for all queries - includes full case study data with translations
const projectInclude = {
  translations: true,
  technologies: { orderBy: { order: "asc" as const } },
  features: {
    include: { translations: true },
    orderBy: { order: "asc" as const },
  },
  metrics: {
    include: { translations: true },
    orderBy: { order: "asc" as const },
  },
  links: true,
  caseStudy: {
    include: {
      translations: true,
      gallery: {
        include: { translations: true },
        orderBy: { order: "asc" as const },
      },
      performance: true,
      architecture: {
        include: {
          translations: true,
          layers: {
            include: { translations: true },
            orderBy: { order: "asc" as const },
          },
        },
      },
      userFlows: {
        include: {
          translations: true,
          steps: {
            include: { translations: true },
            orderBy: { order: "asc" as const },
          },
        },
        orderBy: { order: "asc" as const },
      },
      technicalHighlights: {
        include: { translations: true },
        orderBy: { order: "asc" as const },
      },
      integrations: {
        include: { translations: true },
        orderBy: { order: "asc" as const },
      },
      testimonial: {
        include: { translations: true },
      },
    },
  },
};

// Fetch all projects from database
export async function getProjects(locale: SupportedLocale = DEFAULT_LOCALE): Promise<Project[]> {
  const dbProjects = await prisma.project.findMany({
    include: projectInclude,
    orderBy: [
      { featured: "desc" },
      { order: "asc" },
    ],
  });

  return dbProjects.map((p) => mapDbProjectToProject(p, locale));
}

// Fetch featured projects
export async function getFeaturedProjects(locale: SupportedLocale = DEFAULT_LOCALE): Promise<Project[]> {
  const dbProjects = await prisma.project.findMany({
    where: { featured: true },
    include: projectInclude,
    orderBy: { order: "asc" },
    take: 3,
  });

  return dbProjects.map((p) => mapDbProjectToProject(p, locale));
}

// Fetch single project by slug
export async function getProjectBySlug(
  slug: string,
  locale: SupportedLocale = DEFAULT_LOCALE
): Promise<Project | null> {
  const dbProject = await prisma.project.findUnique({
    where: { slug },
    include: projectInclude,
  });

  if (!dbProject) return null;
  return mapDbProjectToProject(dbProject, locale);
}

// Fetch projects by category
export async function getProjectsByCategory(
  category: string,
  locale: SupportedLocale = DEFAULT_LOCALE
): Promise<Project[]> {
  if (category === "all") {
    return getProjects(locale);
  }

  const dbProjects = await prisma.project.findMany({
    where: {
      category: category as any,
    },
    include: projectInclude,
    orderBy: [
      { featured: "desc" },
      { order: "asc" },
    ],
  });

  return dbProjects.map((p) => mapDbProjectToProject(p, locale));
}

// Get project SEO metadata for generateMetadata
export async function getProjectSEO(
  slug: string,
  locale: SupportedLocale = DEFAULT_LOCALE
): Promise<{
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string[];
  image: string | null;
} | null> {
  const dbProject = await prisma.project.findUnique({
    where: { slug },
    include: {
      translations: {
        where: { locale },
      },
    },
  });

  if (!dbProject) return null;

  const trans = dbProject.translations[0];
  if (!trans) {
    // Fallback to default locale
    const defaultTrans = await prisma.projectTranslation.findFirst({
      where: { projectId: dbProject.id, locale: DEFAULT_LOCALE },
    });

    return {
      metaTitle: defaultTrans?.metaTitle || null,
      metaDescription: defaultTrans?.metaDescription || null,
      metaKeywords: defaultTrans?.metaKeywords || [],
      image: dbProject.image,
    };
  }

  return {
    metaTitle: trans.metaTitle,
    metaDescription: trans.metaDescription,
    metaKeywords: trans.metaKeywords || [],
    image: dbProject.image,
  };
}

// Get project categories with counts - from database translations
export async function getProjectCategories(locale: SupportedLocale = DEFAULT_LOCALE) {
  // First try to get from database
  const dbCategories = await prisma.projectCategory.findMany({
    include: { translations: true },
    orderBy: { order: "asc" },
  });

  const categoryCounts = await prisma.project.groupBy({
    by: ["category"],
    _count: { category: true },
  });

  const countMap = Object.fromEntries(
    categoryCounts.map((c) => [c.category, c._count.category])
  );

  // If we have database categories with translations, use them
  if (dbCategories.length > 0) {
    const allLabel = locale === "ro" ? "Toate proiectele" : "Все проекты";
    const totalCount = categoryCounts.reduce((sum, c) => sum + c._count.category, 0);

    return [
      { value: "all", label: allLabel, count: totalCount },
      ...dbCategories.map((cat) => {
        const translation = cat.translations.find((t) => t.locale === locale)
          || cat.translations.find((t) => t.locale === DEFAULT_LOCALE);
        return {
          value: cat.value,
          label: translation?.label || cat.value,
          count: countMap[cat.value] || 0,
        };
      }),
    ];
  }

  // Fallback to hardcoded labels if no database categories
  const categoryMapRu: Record<string, string> = {
    games: "Игры",
    fintech: "FinTech",
    mobile: "Мобильные",
    enterprise: "Enterprise",
    automation: "Автоматизация",
  };

  const categoryMapRo: Record<string, string> = {
    games: "Jocuri",
    fintech: "FinTech",
    mobile: "Mobile",
    enterprise: "Enterprise",
    automation: "Automatizare",
  };

  const categoryMap = locale === "ro" ? categoryMapRo : categoryMapRu;
  const allLabel = locale === "ro" ? "Toate proiectele" : "Все проекты";

  return [
    { value: "all", label: allLabel },
    ...categoryCounts.map((c) => ({
      value: c.category,
      label: categoryMap[c.category] || c.category,
      count: c._count.category,
    })),
  ];
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

// Helper to find translation in array with any type (avoids narrow type inference)
function findTrans(translations: any[] | undefined, locale: string): any {
  if (!translations || translations.length === 0) return undefined;
  return translations.find((t: any) => t.locale === locale)
    || translations.find((t: any) => t.locale === DEFAULT_LOCALE);
}

// Map database project to frontend Project interface
function mapDbProjectToProject(dbProject: any, locale: SupportedLocale): Project {
  // Get project translation using findTrans (returns any)
  const projectTrans = findTrans(dbProject.translations, locale);

  const technologies: Technology[] = dbProject.technologies.map((t: any) => ({
    name: t.name,
    icon: t.icon,
    color: t.color,
  }));

  const features: Feature[] = dbProject.features.map((f: any) => {
    const trans = findTrans(f.translations, locale);
    return {
      title: trans?.title || "",
      description: trans?.description || "",
      icon: f.icon,
    };
  });

  const metrics: Metric[] | undefined = dbProject.metrics.length > 0
    ? dbProject.metrics.map((m: any) => {
        const trans = findTrans(m.translations, locale);
        return {
          label: trans?.label || "",
          value: m.value,
          icon: m.icon,
        };
      })
    : undefined;

  // Parse video from JSON field
  const video = dbProject.video
    ? {
        type: dbProject.video.type as "file" | "vimeo",
        id: dbProject.video.id,
        src: dbProject.video.src,
      }
    : undefined;

  // Map links from relation
  const links = {
    demo: dbProject.links?.demo || undefined,
    github: dbProject.links?.github || undefined,
    telegram: dbProject.links?.telegram || undefined,
  };

  // Map full case study from relation
  const caseStudy = mapCaseStudy(dbProject.caseStudy, locale);

  return {
    slug: dbProject.slug,
    title: projectTrans?.title || "",
    subtitle: projectTrans?.subtitle || "",
    description: projectTrans?.description || "",
    fullDescription: projectTrans?.fullDescription || "",
    category: dbProject.category as any,
    categoryLabel: projectTrans?.categoryLabel || "",
    image: dbProject.image,
    video,
    technologies,
    features,
    links,
    metrics,
    featured: dbProject.featured,
    caseStudy,
  };
}

// Map case study with all nested relations and translations
function mapCaseStudy(dbCaseStudy: any, locale: SupportedLocale): CaseStudy | undefined {
  if (!dbCaseStudy) return undefined;

  const csTrans = findTrans(dbCaseStudy.translations, locale);

  return {
    challenge: csTrans?.challenge || undefined,
    solution: csTrans?.solution || undefined,
    results: csTrans?.results?.length > 0 ? csTrans.results : undefined,

    // Gallery
    gallery: dbCaseStudy.gallery?.length > 0
      ? dbCaseStudy.gallery.map((g: any) => {
          const trans = findTrans(g.translations, locale);
          return {
            src: g.src,
            alt: trans?.alt || "",
            caption: trans?.caption || undefined,
          };
        })
      : undefined,

    // Performance metrics (no translations needed)
    performance: dbCaseStudy.performance
      ? {
          score: dbCaseStudy.performance.score,
          accessibility: dbCaseStudy.performance.accessibility,
          bestPractices: dbCaseStudy.performance.bestPractices,
          seo: dbCaseStudy.performance.seo,
          fcp: dbCaseStudy.performance.fcp,
          lcp: dbCaseStudy.performance.lcp,
          tbt: dbCaseStudy.performance.tbt,
          cls: dbCaseStudy.performance.cls,
          speedIndex: dbCaseStudy.performance.speedIndex,
        }
      : undefined,

    // Architecture diagram
    architecture: dbCaseStudy.architecture
      ? (() => {
          const archTrans = findTrans(dbCaseStudy.architecture.translations, locale);
          return {
            description: archTrans?.description || "",
            layers: dbCaseStudy.architecture.layers?.map((l: any) => {
              const layerTrans = findTrans(l.translations, locale);
              return {
                name: layerTrans?.name || "",
                components: l.components,
                color: l.color,
              };
            }) || [],
          };
        })()
      : undefined,

    // User flows
    userFlows: dbCaseStudy.userFlows?.length > 0
      ? dbCaseStudy.userFlows.map((f: any) => {
          const flowTrans = findTrans(f.translations, locale);
          return {
            id: f.id,
            title: flowTrans?.title || "",
            description: flowTrans?.description || "",
            icon: f.icon,
            steps: f.steps?.map((s: any) => {
              const stepTrans = findTrans(s.translations, locale);
              return {
                title: stepTrans?.title || "",
                description: stepTrans?.description || "",
                icon: s.icon || undefined,
              };
            }) || [],
          };
        })
      : undefined,

    // Technical highlights
    technicalHighlights: dbCaseStudy.technicalHighlights?.length > 0
      ? dbCaseStudy.technicalHighlights.map((h: any) => {
          const hlTrans = findTrans(h.translations, locale);
          return {
            title: hlTrans?.title || "",
            description: hlTrans?.description || "",
            icon: h.icon,
            codePreview: h.codePreview || undefined,
            tags: hlTrans?.tags?.length > 0 ? hlTrans.tags : undefined,
          };
        })
      : undefined,

    // Integrations
    integrations: dbCaseStudy.integrations?.length > 0
      ? dbCaseStudy.integrations.map((i: any) => {
          const intTrans = findTrans(i.translations, locale);
          return {
            name: i.name,
            logo: i.logo,
            description: intTrans?.description || "",
            color: i.color,
          };
        })
      : undefined,

    // Testimonial
    testimonial: dbCaseStudy.testimonial
      ? (() => {
          const testTrans = findTrans(dbCaseStudy.testimonial.translations, locale);
          return {
            quote: testTrans?.quote || "",
            author: testTrans?.author || "",
            role: testTrans?.role || "",
            avatar: dbCaseStudy.testimonial.avatar || undefined,
          };
        })()
      : undefined,
  };
}
