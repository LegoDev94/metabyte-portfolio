"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminHeader } from "@/components/admin/AdminHeader";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Star,
  ExternalLink,
  MoreVertical,
  FileText,
} from "lucide-react";

interface Project {
  id: string;
  slug: string;
  category: string;
  image: string;
  featured: boolean;
  order: number;
  translations: Array<{
    locale: string;
    title: string;
    subtitle: string;
  }>;
  technologies: Array<{
    name: string;
    icon: string;
  }>;
  caseStudy: { id: string } | null;
}

const categoryLabels: Record<string, string> = {
  games: "Игры",
  fintech: "Финтех",
  mobile: "Мобильные",
  enterprise: "Enterprise",
  automation: "Автоматизация",
};

const categoryColors: Record<string, string> = {
  games: "bg-purple-500/10 text-purple-500",
  fintech: "bg-green-500/10 text-green-500",
  mobile: "bg-blue-500/10 text-blue-500",
  enterprise: "bg-orange-500/10 text-orange-500",
  automation: "bg-cyan-500/10 text-cyan-500",
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  async function fetchProjects() {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/projects");
      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects);
      }
    } catch (error) {
      console.error("Failed to fetch projects:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete(slug: string) {
    try {
      const response = await fetch(`/api/admin/projects/${slug}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setProjects(projects.filter((p) => p.slug !== slug));
        setDeleteConfirm(null);
      }
    } catch (error) {
      console.error("Failed to delete project:", error);
    }
  }

  const filteredProjects = projects.filter((project) => {
    const ruTitle = project.translations.find((t) => t.locale === "ru")?.title || "";
    const matchesSearch = ruTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.slug.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !categoryFilter || project.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <>
      <AdminHeader
        title="Проекты"
        description="Управление портфолио проектов"
      />

      <div className="p-6 space-y-6">
        {/* Actions bar */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-1 gap-4 w-full sm:w-auto">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Поиск проектов..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Category filter */}
            <select
              value={categoryFilter || ""}
              onChange={(e) => setCategoryFilter(e.target.value || null)}
              className="px-3 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Все категории</option>
              {Object.entries(categoryLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Add button */}
          <Link
            href="/admin/projects/new"
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Добавить проект
          </Link>
        </div>

        {/* Projects list */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {isLoading ? (
            <div className="p-8 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchQuery || categoryFilter
                  ? "Проекты не найдены"
                  : "Нет проектов"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredProjects.map((project) => {
                const ruTranslation = project.translations.find(
                  (t) => t.locale === "ru"
                );

                return (
                  <div
                    key={project.id}
                    className="p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      {/* Image */}
                      <div className="w-20 h-14 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        <img
                          src={project.image}
                          alt={ruTranslation?.title || project.slug}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-foreground truncate">
                            {ruTranslation?.title || project.slug}
                          </h3>
                          {project.featured && (
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 flex-shrink-0" />
                          )}
                          {project.caseStudy && (
                            <span className="px-1.5 py-0.5 text-xs bg-primary/10 text-primary rounded">
                              Кейс
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {ruTranslation?.subtitle}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                              categoryColors[project.category]
                            }`}
                          >
                            {categoryLabels[project.category]}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            /{project.slug}
                          </span>
                        </div>
                      </div>

                      {/* Technologies */}
                      <div className="hidden lg:flex items-center gap-1 flex-wrap max-w-xs">
                        {project.technologies.slice(0, 4).map((tech, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 rounded bg-muted text-xs text-muted-foreground whitespace-nowrap"
                            title={tech.name}
                          >
                            {tech.name}
                          </span>
                        ))}
                        {project.technologies.length > 4 && (
                          <span className="text-xs text-muted-foreground">
                            +{project.technologies.length - 4}
                          </span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <a
                          href={`/projects/${project.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                          title="Открыть на сайте"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <Link
                          href={`/admin/projects/${project.slug}`}
                          className="p-2 text-muted-foreground hover:text-primary transition-colors"
                          title="Редактировать"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        {deleteConfirm === project.slug ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDelete(project.slug)}
                              className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                            >
                              Удалить
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="px-2 py-1 text-xs bg-muted text-foreground rounded hover:bg-muted/80 transition-colors"
                            >
                              Отмена
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(project.slug)}
                            className="p-2 text-muted-foreground hover:text-red-500 transition-colors"
                            title="Удалить"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>Всего: {projects.length}</span>
          <span>|</span>
          <span>Избранных: {projects.filter((p) => p.featured).length}</span>
          <span>|</span>
          <span>С кейсами: {projects.filter((p) => p.caseStudy).length}</span>
        </div>
      </div>
    </>
  );
}
