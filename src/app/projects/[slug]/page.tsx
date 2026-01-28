import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ProjectDetail } from "@/components/project/ProjectDetail";
import { getProjectBySlug, getProjectSEO } from "@/lib/db";
import { normalizeLocale } from "@/lib/db/utils/i18n";
import { projects } from "@/data/projects";
import { getLocalizedProject } from "@/lib/utils/get-locale-projects";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

// Use local data for static params to avoid DB connection pool issues during build
export async function generateStaticParams() {
  return projects.map((project) => ({
    slug: project.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const cookieStore = await cookies();
  const locale = normalizeLocale(cookieStore.get("locale")?.value);

  // Try to get SEO data from database
  const seo = await getProjectSEO(slug, locale);

  // Fallback to project data if no SEO
  if (!seo || (!seo.metaTitle && !seo.metaDescription)) {
    let project = await getProjectBySlug(slug, locale);
    if (!project) {
      project = getLocalizedProject(slug, locale) || null;
    }

    if (!project) {
      return {
        title: locale === "ro" ? "Proiect negasit" : "Проект не найден",
      };
    }

    return {
      title: `${project.title} | Metabyte`,
      description: project.description,
      openGraph: {
        title: `${project.title} | Metabyte`,
        description: project.description,
        type: "article",
        ...(project.image && { images: [project.image] }),
      },
    };
  }

  // Use SEO data from database
  const title = seo.metaTitle || `${slug} | Metabyte`;
  const description = seo.metaDescription || "";

  return {
    title,
    description,
    keywords: seo.metaKeywords,
    openGraph: {
      title,
      description,
      type: "article",
      locale: locale === "ru" ? "ru_RU" : "ro_RO",
      ...(seo.image && { images: [seo.image] }),
    },
  };
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const cookieStore = await cookies();
  const locale = normalizeLocale(cookieStore.get("locale")?.value);

  // Try DB first, then localized static data
  let project = await getProjectBySlug(slug, locale);
  if (!project) {
    project = getLocalizedProject(slug, locale) || null;
  }

  if (!project) {
    notFound();
  }

  return (
    <>
      <Header />
      <main className="min-h-screen pt-24">
        <ProjectDetail project={project} />
      </main>
      <Footer />
    </>
  );
}
