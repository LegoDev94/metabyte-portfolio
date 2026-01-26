import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ProjectsContent } from "@/components/projects/ProjectsContent";
import { getProjects, getProjectCategories } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const [projects, categories] = await Promise.all([
    getProjects(),
    getProjectCategories(),
  ]);

  return (
    <>
      <Header />
      <main className="min-h-screen pt-24">
        <ProjectsContent projects={projects} categories={categories} />
      </main>
      <Footer />
    </>
  );
}
