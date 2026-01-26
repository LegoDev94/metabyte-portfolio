import { notFound } from "next/navigation";
import { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ProjectDetail } from "@/components/project/ProjectDetail";
import { getProjectBySlug, getProjects } from "@/lib/db";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map((project) => ({
    slug: project.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    return {
      title: "Проект не найден",
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
  const project = await getProjectBySlug(slug);

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
