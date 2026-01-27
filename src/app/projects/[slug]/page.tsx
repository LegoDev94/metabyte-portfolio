import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ProjectDetail } from "@/components/project/ProjectDetail";
import { getProjectBySlug } from "@/lib/db";
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

  // Try DB first, then localized static data
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
