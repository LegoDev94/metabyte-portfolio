"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AdminHeader } from "@/components/admin/AdminHeader";
import {
  Save,
  ArrowLeft,
  Plus,
  Trash2,
  GripVertical,
  Star,
  Globe,
  Image as ImageIcon,
} from "lucide-react";

interface ProjectTranslation {
  locale: string;
  title: string;
  subtitle: string;
  description: string;
  fullDescription: string;
  categoryLabel: string;
}

interface Technology {
  id?: string;
  name: string;
  icon: string;
  color: string;
  order: number;
}

interface ProjectData {
  slug: string;
  category: string;
  image: string;
  video: { type: string; id?: string; src?: string } | null;
  featured: boolean;
  order: number;
  translations: ProjectTranslation[];
  technologies: Technology[];
}

const initialTranslation = (locale: string): ProjectTranslation => ({
  locale,
  title: "",
  subtitle: "",
  description: "",
  fullDescription: "",
  categoryLabel: locale === "ru" ? "Игры" : "Jocuri",
});

const categoryOptions = [
  { value: "games", labelRu: "Игры", labelRo: "Jocuri" },
  { value: "fintech", labelRu: "Финтех", labelRo: "Fintech" },
  { value: "mobile", labelRu: "Мобильные", labelRo: "Mobile" },
  { value: "enterprise", labelRu: "Enterprise", labelRo: "Enterprise" },
  { value: "automation", labelRu: "Автоматизация", labelRo: "Automatizare" },
];

export default function ProjectEditPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const isNew = slug === "new";

  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeLocale, setActiveLocale] = useState<"ru" | "ro">("ru");

  const [formData, setFormData] = useState<ProjectData>({
    slug: "",
    category: "games",
    image: "/images/projects/placeholder.jpg",
    video: null,
    featured: false,
    order: 0,
    translations: [initialTranslation("ru"), initialTranslation("ro")],
    technologies: [],
  });

  useEffect(() => {
    if (!isNew) {
      fetchProject();
    }
  }, [slug, isNew]);

  async function fetchProject() {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/projects/${slug}`);
      if (response.ok) {
        const data = await response.json();
        setFormData({
          slug: data.project.slug,
          category: data.project.category,
          image: data.project.image,
          video: data.project.video,
          featured: data.project.featured,
          order: data.project.order,
          translations: data.project.translations.length > 0
            ? data.project.translations
            : [initialTranslation("ru"), initialTranslation("ro")],
          technologies: data.project.technologies || [],
        });
      } else {
        setError("Project not found");
      }
    } catch (error) {
      console.error("Failed to fetch project:", error);
      setError("Failed to load project");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      const url = isNew ? "/api/admin/projects" : `/api/admin/projects/${slug}`;
      const method = isNew ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        if (isNew) {
          router.push(`/admin/projects/${data.project.slug}`);
        } else {
          // Refresh if slug changed
          if (formData.slug !== slug) {
            router.push(`/admin/projects/${formData.slug}`);
          }
        }
      } else {
        const data = await response.json();
        setError(data.error || "Failed to save project");
      }
    } catch (error) {
      console.error("Save error:", error);
      setError("Failed to save project");
    } finally {
      setIsSaving(false);
    }
  }

  const getTranslation = (locale: string) => {
    return formData.translations.find((t) => t.locale === locale) || initialTranslation(locale);
  };

  const updateTranslation = (locale: string, field: keyof ProjectTranslation, value: string) => {
    setFormData((prev) => ({
      ...prev,
      translations: prev.translations.map((t) =>
        t.locale === locale ? { ...t, [field]: value } : t
      ),
    }));
  };

  const addTechnology = () => {
    setFormData((prev) => ({
      ...prev,
      technologies: [
        ...prev.technologies,
        { name: "", icon: "", color: "#00ffff", order: prev.technologies.length },
      ],
    }));
  };

  const updateTechnology = (index: number, field: keyof Technology, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      technologies: prev.technologies.map((t, i) =>
        i === index ? { ...t, [field]: value } : t
      ),
    }));
  };

  const removeTechnology = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      technologies: prev.technologies.filter((_, i) => i !== index),
    }));
  };

  if (isLoading) {
    return (
      <>
        <AdminHeader title="Загрузка..." />
        <div className="p-6">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </div>
      </>
    );
  }

  const currentTranslation = getTranslation(activeLocale);

  return (
    <>
      <AdminHeader
        title={isNew ? "Новый проект" : `Редактирование: ${getTranslation("ru").title || slug}`}
        description={isNew ? "Создание нового проекта" : "Редактирование данных проекта"}
      />

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Back button and save */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.push("/admin/projects")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Назад к списку
          </button>

          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            <Save className="w-4 h-4" />
            {isSaving ? "Сохранение..." : "Сохранить"}
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
            {error}
          </div>
        )}

        {/* Basic info */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold">Основная информация</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Slug (URL)</label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })}
                placeholder="my-project"
                required
                className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Категория</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {categoryOptions.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.labelRu}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Изображение (URL)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="/images/projects/..."
                  required
                  className="flex-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {formData.image && (
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted">
                    <img src={formData.image} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Порядок</label>
              <input
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="featured"
              checked={formData.featured}
              onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
              className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
            />
            <label htmlFor="featured" className="text-sm flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-500" />
              Показывать на главной (Featured)
            </label>
          </div>
        </div>

        {/* Translations */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Переводы
            </h2>
            <div className="flex rounded-lg border border-border overflow-hidden">
              <button
                type="button"
                onClick={() => setActiveLocale("ru")}
                className={`px-4 py-1.5 text-sm font-medium transition-colors ${
                  activeLocale === "ru"
                    ? "bg-primary text-primary-foreground"
                    : "bg-background text-muted-foreground hover:text-foreground"
                }`}
              >
                Русский
              </button>
              <button
                type="button"
                onClick={() => setActiveLocale("ro")}
                className={`px-4 py-1.5 text-sm font-medium transition-colors ${
                  activeLocale === "ro"
                    ? "bg-primary text-primary-foreground"
                    : "bg-background text-muted-foreground hover:text-foreground"
                }`}
              >
                Română
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Название</label>
              <input
                type="text"
                value={currentTranslation.title}
                onChange={(e) => updateTranslation(activeLocale, "title", e.target.value)}
                placeholder={activeLocale === "ru" ? "Название проекта" : "Titlul proiectului"}
                required
                className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Подзаголовок</label>
              <input
                type="text"
                value={currentTranslation.subtitle}
                onChange={(e) => updateTranslation(activeLocale, "subtitle", e.target.value)}
                placeholder={activeLocale === "ru" ? "Краткое описание" : "Descriere scurtă"}
                required
                className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Описание (короткое)</label>
              <textarea
                value={currentTranslation.description}
                onChange={(e) => updateTranslation(activeLocale, "description", e.target.value)}
                placeholder={activeLocale === "ru" ? "Описание для карточки" : "Descriere pentru card"}
                rows={3}
                required
                className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Полное описание</label>
              <textarea
                value={currentTranslation.fullDescription}
                onChange={(e) => updateTranslation(activeLocale, "fullDescription", e.target.value)}
                placeholder={activeLocale === "ru" ? "Подробное описание проекта" : "Descriere detaliată a proiectului"}
                rows={6}
                required
                className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Метка категории</label>
              <input
                type="text"
                value={currentTranslation.categoryLabel}
                onChange={(e) => updateTranslation(activeLocale, "categoryLabel", e.target.value)}
                placeholder={activeLocale === "ru" ? "Игры" : "Jocuri"}
                required
                className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* Technologies */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Технологии</h2>
            <button
              type="button"
              onClick={addTechnology}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-muted hover:bg-muted/80 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Добавить
            </button>
          </div>

          {formData.technologies.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              Нет технологий. Добавьте первую.
            </p>
          ) : (
            <div className="space-y-3">
              {formData.technologies.map((tech, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
                >
                  <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                  <input
                    type="text"
                    value={tech.name}
                    onChange={(e) => updateTechnology(index, "name", e.target.value)}
                    placeholder="Название"
                    className="flex-1 px-3 py-1.5 bg-background border border-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <input
                    type="text"
                    value={tech.icon}
                    onChange={(e) => updateTechnology(index, "icon", e.target.value)}
                    placeholder="Иконка (emoji)"
                    className="w-20 px-3 py-1.5 bg-background border border-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary text-center"
                  />
                  <input
                    type="color"
                    value={tech.color}
                    onChange={(e) => updateTechnology(index, "color", e.target.value)}
                    className="w-10 h-8 rounded cursor-pointer"
                  />
                  <button
                    type="button"
                    onClick={() => removeTechnology(index)}
                    className="p-1.5 text-muted-foreground hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Note about case studies */}
        {!isNew && (
          <div className="bg-muted/50 border border-border rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-2">Кейс-стади</h2>
            <p className="text-muted-foreground text-sm">
              Для редактирования кейс-стади (challenge, solution, архитектура, user flows и т.д.)
              используйте отдельный раздел управления кейсами.
            </p>
          </div>
        )}
      </form>
    </>
  );
}
