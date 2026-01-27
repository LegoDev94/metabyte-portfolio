import { cookies } from "next/headers";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ProjectsContent } from "@/components/projects/ProjectsContent";
import { getProjects, getProjectCategories } from "@/lib/db";
import { getLocalizedProjects } from "@/lib/utils/get-locale-projects";
import { normalizeLocale } from "@/lib/db/utils/i18n";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const cookieStore = await cookies();
  const locale = normalizeLocale(cookieStore.get("locale")?.value);

  const [dbProjects, categories] = await Promise.all([
    getProjects(locale),
    getProjectCategories(locale),
  ]);

  // Use localized projects from static data, or fall back to DB projects
  const projects = dbProjects.length > 0 ? dbProjects : getLocalizedProjects(locale);

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
