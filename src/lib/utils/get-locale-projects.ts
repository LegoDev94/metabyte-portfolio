// Utility to get projects based on locale
import { projects as projectsRu } from "@/data/projects";
import { projectsRo } from "@/data/projects-ro";
import type { Project } from "@/data/projects";

/**
 * Get project by slug with locale-aware content
 * Falls back to Russian if no Romanian translation exists
 */
export function getLocalizedProject(slug: string, locale: string = "ru"): Project | undefined {
  if (locale === "ro") {
    // Try to find Romanian version first
    const roProject = projectsRo.find(p => p.slug === slug);
    if (roProject) return roProject;
  }

  // Fallback to Russian
  return projectsRu.find(p => p.slug === slug);
}

/**
 * Get all projects with locale-aware content
 * Returns Romanian translations where available, Russian otherwise
 */
export function getLocalizedProjects(locale: string = "ru"): Project[] {
  if (locale === "ro") {
    // Create a map of Romanian projects for quick lookup
    const roProjectsMap = new Map(projectsRo.map(p => [p.slug, p]));

    // Return Romanian version if available, otherwise Russian
    return projectsRu.map(ruProject => {
      const roProject = roProjectsMap.get(ruProject.slug);
      return roProject || ruProject;
    });
  }

  return projectsRu;
}

/**
 * Get featured projects with locale-aware content
 */
export function getLocalizedFeaturedProjects(locale: string = "ru"): Project[] {
  const allProjects = getLocalizedProjects(locale);
  return allProjects.filter(p => p.featured).slice(0, 3);
}
