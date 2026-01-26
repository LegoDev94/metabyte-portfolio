import { prisma } from "@/lib/prisma";
import type { Project, Technology, Feature, Metric, CaseStudy } from "@/data/projects";

// Project include config for all queries - includes full case study data
const projectInclude = {
  technologies: true,
  features: true,
  metrics: true,
  links: true,
  caseStudy: {
    include: {
      gallery: { orderBy: { order: "asc" as const } },
      performance: true,
      architecture: {
        include: {
          layers: { orderBy: { order: "asc" as const } },
        },
      },
      userFlows: {
        include: {
          steps: { orderBy: { order: "asc" as const } },
        },
        orderBy: { order: "asc" as const },
      },
      technicalHighlights: { orderBy: { order: "asc" as const } },
      integrations: { orderBy: { order: "asc" as const } },
      testimonial: true,
    },
  },
};

// Fetch all projects from database
export async function getProjects(): Promise<Project[]> {
  const dbProjects = await prisma.project.findMany({
    include: projectInclude,
    orderBy: [
      { featured: "desc" },
      { order: "asc" },
    ],
  });

  return dbProjects.map(mapDbProjectToProject);
}

// Fetch featured projects
export async function getFeaturedProjects(): Promise<Project[]> {
  const dbProjects = await prisma.project.findMany({
    where: { featured: true },
    include: projectInclude,
    orderBy: { order: "asc" },
    take: 3,
  });

  return dbProjects.map(mapDbProjectToProject);
}

// Fetch single project by slug
export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const dbProject = await prisma.project.findUnique({
    where: { slug },
    include: projectInclude,
  });

  if (!dbProject) return null;
  return mapDbProjectToProject(dbProject);
}

// Fetch projects by category
export async function getProjectsByCategory(category: string): Promise<Project[]> {
  if (category === "all") {
    return getProjects();
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

  return dbProjects.map(mapDbProjectToProject);
}

// Get project categories with counts
export async function getProjectCategories() {
  const categories = await prisma.project.groupBy({
    by: ["category"],
    _count: { category: true },
  });

  const categoryMap: Record<string, string> = {
    games: "Игры",
    fintech: "FinTech",
    mobile: "Мобильные",
    enterprise: "Enterprise",
    automation: "Автоматизация",
  };

  return [
    { value: "all", label: "Все проекты" },
    ...categories.map((c) => ({
      value: c.category,
      label: categoryMap[c.category] || c.category,
      count: c._count.category,
    })),
  ];
}

// Map database project to frontend Project interface
function mapDbProjectToProject(dbProject: any): Project {
  const technologies: Technology[] = dbProject.technologies.map((t: any) => ({
    name: t.name,
    icon: t.icon,
    color: t.color,
  }));

  const features: Feature[] = dbProject.features.map((f: any) => ({
    title: f.title,
    description: f.description,
    icon: f.icon,
  }));

  const metrics: Metric[] | undefined = dbProject.metrics.length > 0
    ? dbProject.metrics.map((m: any) => ({
        label: m.label,
        value: m.value,
        icon: m.icon,
      }))
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
  const caseStudy = mapCaseStudy(dbProject.caseStudy);

  return {
    slug: dbProject.slug,
    title: dbProject.title,
    subtitle: dbProject.subtitle,
    description: dbProject.description,
    fullDescription: dbProject.fullDescription,
    category: dbProject.category as any,
    categoryLabel: dbProject.categoryLabel,
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

// Map case study with all nested relations
function mapCaseStudy(dbCaseStudy: any): CaseStudy | undefined {
  if (!dbCaseStudy) return undefined;

  return {
    challenge: dbCaseStudy.challenge || undefined,
    solution: dbCaseStudy.solution || undefined,
    results: dbCaseStudy.results?.length > 0 ? dbCaseStudy.results : undefined,

    // Gallery
    gallery: dbCaseStudy.gallery?.length > 0
      ? dbCaseStudy.gallery.map((g: any) => ({
          src: g.src,
          alt: g.alt,
          caption: g.caption || undefined,
        }))
      : undefined,

    // Performance metrics
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
      ? {
          description: dbCaseStudy.architecture.description,
          layers: dbCaseStudy.architecture.layers?.map((l: any) => ({
            name: l.name,
            components: l.components,
            color: l.color,
          })) || [],
        }
      : undefined,

    // User flows
    userFlows: dbCaseStudy.userFlows?.length > 0
      ? dbCaseStudy.userFlows.map((f: any) => ({
          id: f.id,
          title: f.title,
          description: f.description,
          icon: f.icon,
          steps: f.steps?.map((s: any) => ({
            title: s.title,
            description: s.description,
            icon: s.icon || undefined,
          })) || [],
        }))
      : undefined,

    // Technical highlights
    technicalHighlights: dbCaseStudy.technicalHighlights?.length > 0
      ? dbCaseStudy.technicalHighlights.map((h: any) => ({
          title: h.title,
          description: h.description,
          icon: h.icon,
          codePreview: h.codePreview || undefined,
          tags: h.tags?.length > 0 ? h.tags : undefined,
        }))
      : undefined,

    // Integrations
    integrations: dbCaseStudy.integrations?.length > 0
      ? dbCaseStudy.integrations.map((i: any) => ({
          name: i.name,
          logo: i.logo,
          description: i.description,
          color: i.color,
        }))
      : undefined,

    // Testimonial
    testimonial: dbCaseStudy.testimonial
      ? {
          quote: dbCaseStudy.testimonial.quote,
          author: dbCaseStudy.testimonial.author,
          role: dbCaseStudy.testimonial.role,
          avatar: dbCaseStudy.testimonial.avatar || undefined,
        }
      : undefined,
  };
}
