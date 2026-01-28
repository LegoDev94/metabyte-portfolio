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
  Search,
  Sparkles,
  Loader2,
  Eye,
  FileText,
  CheckCircle,
  Video,
  Link,
  Images,
} from "lucide-react";
import { MediaPicker } from "@/components/admin/MediaPicker";

interface ProjectTranslation {
  locale: string;
  title: string;
  subtitle: string;
  description: string;
  fullDescription: string;
  categoryLabel: string;
  // SEO fields
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
}

interface Technology {
  id?: string;
  name: string;
  icon: string;
  color: string;
  order: number;
}

interface CaseStudyTranslation {
  locale: string;
  challenge: string;
  solution: string;
  results: string[];
}

interface CaseStudyData {
  id?: string;
  translations: CaseStudyTranslation[];
}

interface GalleryItemTranslation {
  locale: string;
  alt: string;
  caption?: string;
}

interface GalleryItem {
  id?: string;
  type: "IMAGE" | "VIDEO";
  src: string;
  videoUrl?: string;
  videoProvider?: string;
  order: number;
  translations: GalleryItemTranslation[];
}

const initialCaseStudyTranslation = (locale: string): CaseStudyTranslation => ({
  locale,
  challenge: "",
  solution: "",
  results: [],
});

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
  metaTitle: "",
  metaDescription: "",
  metaKeywords: [],
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
  const [activeLocale, setActiveLocale] = useState<"ru" | "ro" | "en">("ru");
  const [generating, setGenerating] = useState<string | null>(null);

  const [formData, setFormData] = useState<ProjectData>({
    slug: "",
    category: "games",
    image: "/images/projects/placeholder.jpg",
    video: null,
    featured: false,
    order: 0,
    translations: [initialTranslation("ru"), initialTranslation("ro"), initialTranslation("en")],
    technologies: [],
  });

  const [caseStudy, setCaseStudy] = useState<CaseStudyData>({
    translations: [initialCaseStudyTranslation("ru"), initialCaseStudyTranslation("ro"), initialCaseStudyTranslation("en")],
  });
  const [isSavingCaseStudy, setIsSavingCaseStudy] = useState(false);
  const [resultInput, setResultInput] = useState("");

  // Gallery state
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [isSavingGallery, setIsSavingGallery] = useState(false);
  const [showAddGalleryItem, setShowAddGalleryItem] = useState(false);
  const [newGalleryItem, setNewGalleryItem] = useState<{
    type: "IMAGE" | "VIDEO";
    src: string;
    videoUrl: string;
    videoProvider: string;
  }>({ type: "IMAGE", src: "", videoUrl: "", videoProvider: "" });

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
            : [initialTranslation("ru"), initialTranslation("ro"), initialTranslation("en")],
          technologies: data.project.technologies || [],
        });

        // Load case study if exists
        if (data.project.caseStudy) {
          setCaseStudy({
            id: data.project.caseStudy.id,
            translations: data.project.caseStudy.translations.length > 0
              ? data.project.caseStudy.translations.map((t: CaseStudyTranslation & { id?: string; caseStudyId?: string }) => ({
                  locale: t.locale,
                  challenge: t.challenge,
                  solution: t.solution,
                  results: t.results || [],
                }))
              : [initialCaseStudyTranslation("ru"), initialCaseStudyTranslation("ro")],
          });

          // Load gallery if exists
          if (data.project.caseStudy.gallery) {
            setGallery(data.project.caseStudy.gallery.map((item: GalleryItem & { id: string }) => ({
              id: item.id,
              type: item.type || "IMAGE",
              src: item.src,
              videoUrl: item.videoUrl || "",
              videoProvider: item.videoProvider || "",
              order: item.order,
              translations: item.translations || [],
            })));
          }
        }
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

      // Filter out incomplete translations (keep only fully filled ones)
      // Also sanitize SEO fields (convert null to empty string)
      const filteredTranslations = formData.translations
        .filter(t =>
          t.title.trim() &&
          t.subtitle.trim() &&
          t.description.trim() &&
          t.fullDescription.trim() &&
          t.categoryLabel.trim()
        )
        .map(t => ({
          ...t,
          metaTitle: t.metaTitle || "",
          metaDescription: t.metaDescription || "",
          metaKeywords: t.metaKeywords || [],
        }));

      // For new projects, require at least one complete translation
      if (isNew && filteredTranslations.length === 0) {
        setError("Заполните хотя бы один перевод полностью (название, подзаголовок, описание, полное описание, метка категории)");
        setIsSaving(false);
        return;
      }

      const dataToSend = {
        ...formData,
        translations: filteredTranslations.length > 0 ? filteredTranslations : undefined,
      };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
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
        console.error("Validation error details:", data);
        const errorMsg = data.details
          ? `${data.error}: ${JSON.stringify(data.details, null, 2)}`
          : data.error || "Failed to save project";
        setError(errorMsg);
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

  const generateSEO = async (locale: string, field: "title" | "description" | "keywords") => {
    const key = `${locale}-${field}`;
    setGenerating(key);

    try {
      const translation = getTranslation(locale);

      // Validate that we have enough context
      if (!translation.title && !translation.description && !translation.fullDescription) {
        alert("Сначала заполните название или описание проекта");
        return;
      }

      const res = await fetch("/api/admin/ai/seo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "project",
          field,
          locale,
          context: {
            projectTitle: translation.title || "Проект",
            projectDescription: translation.description || translation.fullDescription || "",
            projectCategory: formData.category,
            currentTitle: translation.metaTitle,
            currentDescription: translation.metaDescription,
          },
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "AI generation failed");
      }

      const data = await res.json();

      // Update the field
      setFormData((prev) => ({
        ...prev,
        translations: prev.translations.map((t) => {
          if (t.locale !== locale) return t;
          if (field === "title") return { ...t, metaTitle: data.result };
          if (field === "description") return { ...t, metaDescription: data.result };
          if (field === "keywords") return { ...t, metaKeywords: data.result };
          return t;
        }),
      }));
    } catch (error) {
      console.error("AI generation error:", error);
      alert(`Ошибка генерации: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setGenerating(null);
    }
  };

  // Case Study functions
  const getCaseStudyTranslation = (locale: string) => {
    return caseStudy.translations.find((t) => t.locale === locale) || initialCaseStudyTranslation(locale);
  };

  const updateCaseStudyTranslation = (locale: string, field: keyof CaseStudyTranslation, value: string | string[]) => {
    setCaseStudy((prev) => ({
      ...prev,
      translations: prev.translations.map((t) =>
        t.locale === locale ? { ...t, [field]: value } : t
      ),
    }));
  };

  const addResult = () => {
    if (resultInput.trim()) {
      const currentResults = getCaseStudyTranslation(activeLocale).results;
      updateCaseStudyTranslation(activeLocale, "results", [...currentResults, resultInput.trim()]);
      setResultInput("");
    }
  };

  const removeResult = (index: number) => {
    const currentResults = getCaseStudyTranslation(activeLocale).results;
    updateCaseStudyTranslation(activeLocale, "results", currentResults.filter((_, i) => i !== index));
  };

  const generateCaseStudyContent = async (locale: string, field: "challenge" | "solution" | "results") => {
    const key = `casestudy-${locale}-${field}`;
    setGenerating(key);

    try {
      const translation = getTranslation(locale);
      const csTranslation = getCaseStudyTranslation(locale);
      const res = await fetch("/api/admin/ai/case-study", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          field,
          locale,
          context: {
            projectTitle: translation.title,
            projectDescription: translation.description || translation.fullDescription,
            projectCategory: formData.category,
            technologies: formData.technologies.map((t) => t.name),
            currentChallenge: csTranslation.challenge,
            currentSolution: csTranslation.solution,
          },
        }),
      });

      if (!res.ok) throw new Error("AI generation failed");

      const data = await res.json();
      updateCaseStudyTranslation(locale, field, data.result);
    } catch (error) {
      console.error("AI case study generation error:", error);
      alert("Ошибка генерации");
    } finally {
      setGenerating(null);
    }
  };

  const saveCaseStudy = async () => {
    setIsSavingCaseStudy(true);
    try {
      const res = await fetch(`/api/admin/projects/${slug}/case-study`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ translations: caseStudy.translations }),
      });

      if (!res.ok) throw new Error("Failed to save case study");

      const data = await res.json();
      setCaseStudy({
        id: data.caseStudy.id,
        translations: data.caseStudy.translations.map((t: CaseStudyTranslation & { id?: string; caseStudyId?: string }) => ({
          locale: t.locale,
          challenge: t.challenge,
          solution: t.solution,
          results: t.results || [],
        })),
      });
    } catch (error) {
      console.error("Save case study error:", error);
      alert("Ошибка сохранения кейс-стади");
    } finally {
      setIsSavingCaseStudy(false);
    }
  };

  // Gallery functions
  const addGalleryItem = () => {
    if (!newGalleryItem.src && newGalleryItem.type === "IMAGE") {
      alert("Выберите изображение");
      return;
    }
    if (newGalleryItem.type === "VIDEO" && !newGalleryItem.videoUrl && !newGalleryItem.src) {
      alert("Укажите ссылку на видео или загрузите файл");
      return;
    }

    const item: GalleryItem = {
      type: newGalleryItem.type,
      src: newGalleryItem.src || "/images/video-placeholder.jpg",
      videoUrl: newGalleryItem.videoUrl || undefined,
      videoProvider: newGalleryItem.videoProvider || (newGalleryItem.videoUrl?.includes("vimeo") ? "vimeo" : newGalleryItem.videoUrl?.includes("youtube") ? "youtube" : "local"),
      order: gallery.length,
      translations: [
        { locale: "ru", alt: "", caption: "" },
        { locale: "ro", alt: "", caption: "" },
        { locale: "en", alt: "", caption: "" },
      ],
    };

    setGallery([...gallery, item]);
    setNewGalleryItem({ type: "IMAGE", src: "", videoUrl: "", videoProvider: "" });
    setShowAddGalleryItem(false);
  };

  const removeGalleryItem = (index: number) => {
    setGallery(gallery.filter((_, i) => i !== index));
  };

  const updateGalleryItemTranslation = (index: number, locale: string, field: "alt" | "caption", value: string) => {
    setGallery(gallery.map((item, i) => {
      if (i !== index) return item;
      return {
        ...item,
        translations: item.translations.map((t) =>
          t.locale === locale ? { ...t, [field]: value } : t
        ),
      };
    }));
  };

  const saveGallery = async () => {
    setIsSavingGallery(true);
    try {
      const res = await fetch(`/api/admin/projects/${slug}/gallery`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: gallery }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to save gallery");
      }

      const data = await res.json();
      setGallery(data.gallery.map((item: GalleryItem & { id: string }) => ({
        id: item.id,
        type: item.type || "IMAGE",
        src: item.src,
        videoUrl: item.videoUrl || "",
        videoProvider: item.videoProvider || "",
        order: item.order,
        translations: item.translations || [],
      })));
      alert("Галерея сохранена!");
    } catch (error) {
      console.error("Save gallery error:", error);
      alert(`Ошибка сохранения галереи: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsSavingGallery(false);
    }
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

            <div className="md:col-span-2">
              <MediaPicker
                label="Изображение проекта"
                value={formData.image}
                onChange={(url) => setFormData({ ...formData, image: url || "/images/projects/placeholder.jpg" })}
                placeholder="Выбрать изображение"
                aspectRatio={16 / 9}
              />
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

        {/* SEO */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Search className="w-5 h-5" />
              SEO Настройки
            </h2>
            <div className="flex rounded-lg border border-border overflow-hidden">
              <button
                type="button"
                onClick={() => setActiveLocale("ru")}
                className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                  activeLocale === "ru"
                    ? "bg-primary text-primary-foreground"
                    : "bg-background text-muted-foreground hover:text-foreground"
                }`}
              >
                RU
              </button>
              <button
                type="button"
                onClick={() => setActiveLocale("ro")}
                className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                  activeLocale === "ro"
                    ? "bg-primary text-primary-foreground"
                    : "bg-background text-muted-foreground hover:text-foreground"
                }`}
              >
                RO
              </button>
              <button
                type="button"
                onClick={() => setActiveLocale("en")}
                className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                  activeLocale === "en"
                    ? "bg-primary text-primary-foreground"
                    : "bg-background text-muted-foreground hover:text-foreground"
                }`}
              >
                EN
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {/* Meta Title */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Meta Title</label>
                <span className={`text-xs ${(currentTranslation.metaTitle?.length || 0) > 60 ? "text-red-400" : "text-muted-foreground"}`}>
                  {currentTranslation.metaTitle?.length || 0}/60
                </span>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={currentTranslation.metaTitle || ""}
                  onChange={(e) => updateTranslation(activeLocale, "metaTitle" as keyof ProjectTranslation, e.target.value)}
                  placeholder="SEO заголовок для поисковиков"
                  className="flex-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  type="button"
                  onClick={() => generateSEO(activeLocale, "title")}
                  disabled={generating === `${activeLocale}-title`}
                  className="px-3 py-2 bg-primary/20 hover:bg-primary/30 text-primary rounded-lg transition-colors disabled:opacity-50"
                  title="Сгенерировать с AI"
                >
                  {generating === `${activeLocale}-title` ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Meta Description */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Meta Description</label>
                <span className={`text-xs ${(currentTranslation.metaDescription?.length || 0) > 160 ? "text-red-400" : "text-muted-foreground"}`}>
                  {currentTranslation.metaDescription?.length || 0}/160
                </span>
              </div>
              <div className="flex gap-2">
                <textarea
                  value={currentTranslation.metaDescription || ""}
                  onChange={(e) => updateTranslation(activeLocale, "metaDescription" as keyof ProjectTranslation, e.target.value)}
                  placeholder="SEO описание для поисковиков"
                  rows={3}
                  className="flex-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
                <button
                  type="button"
                  onClick={() => generateSEO(activeLocale, "description")}
                  disabled={generating === `${activeLocale}-description`}
                  className="px-3 py-2 bg-primary/20 hover:bg-primary/30 text-primary rounded-lg transition-colors disabled:opacity-50 h-fit"
                  title="Сгенерировать с AI"
                >
                  {generating === `${activeLocale}-description` ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Keywords */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Keywords</label>
                <span className="text-xs text-muted-foreground">
                  {currentTranslation.metaKeywords?.length || 0} ключевых слов
                </span>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={(currentTranslation.metaKeywords || []).join(", ")}
                  onChange={(e) => {
                    const keywords = e.target.value.split(",").map(k => k.trim()).filter(k => k);
                    setFormData((prev) => ({
                      ...prev,
                      translations: prev.translations.map((t) =>
                        t.locale === activeLocale ? { ...t, metaKeywords: keywords } : t
                      ),
                    }));
                  }}
                  placeholder="ключевое слово 1, ключевое слово 2, ..."
                  className="flex-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  type="button"
                  onClick={() => generateSEO(activeLocale, "keywords")}
                  disabled={generating === `${activeLocale}-keywords`}
                  className="px-3 py-2 bg-primary/20 hover:bg-primary/30 text-primary rounded-lg transition-colors disabled:opacity-50"
                  title="Сгенерировать с AI"
                >
                  {generating === `${activeLocale}-keywords` ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Preview */}
            {currentTranslation.metaTitle && (
              <div className="mt-4 p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
                  <Eye className="w-3 h-3" />
                  Превью в Google
                </div>
                <div className="space-y-1">
                  <div className="text-blue-400 text-lg hover:underline cursor-pointer truncate">
                    {currentTranslation.metaTitle}
                  </div>
                  <div className="text-green-400 text-sm">
                    mtbyte.io/projects/{formData.slug}
                  </div>
                  <div className="text-muted-foreground text-sm line-clamp-2">
                    {currentTranslation.metaDescription}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Case Study */}
        {!isNew && (
          <div className="bg-card border border-border rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Кейс-стади
              </h2>
              <div className="flex items-center gap-3">
                <div className="flex rounded-lg border border-border overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setActiveLocale("ru")}
                    className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                      activeLocale === "ru"
                        ? "bg-primary text-primary-foreground"
                        : "bg-background text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    RU
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveLocale("ro")}
                    className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                      activeLocale === "ro"
                        ? "bg-primary text-primary-foreground"
                        : "bg-background text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    RO
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveLocale("en")}
                    className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                      activeLocale === "en"
                        ? "bg-primary text-primary-foreground"
                        : "bg-background text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    EN
                  </button>
                </div>
                <button
                  type="button"
                  onClick={saveCaseStudy}
                  disabled={isSavingCaseStudy}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                  {isSavingCaseStudy ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Сохранить кейс
                </button>
              </div>
            </div>

            {(() => {
              const csTranslation = getCaseStudyTranslation(activeLocale);
              return (
                <div className="space-y-4">
                  {/* Challenge */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium">Вызов / Проблема</label>
                      <button
                        type="button"
                        onClick={() => generateCaseStudyContent(activeLocale, "challenge")}
                        disabled={generating === `casestudy-${activeLocale}-challenge`}
                        className="flex items-center gap-1 px-2 py-1 text-xs bg-primary/20 hover:bg-primary/30 text-primary rounded transition-colors disabled:opacity-50"
                      >
                        {generating === `casestudy-${activeLocale}-challenge` ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Sparkles className="w-3 h-3" />
                        )}
                        AI
                      </button>
                    </div>
                    <textarea
                      value={csTranslation.challenge}
                      onChange={(e) => updateCaseStudyTranslation(activeLocale, "challenge", e.target.value)}
                      placeholder={activeLocale === "ru"
                        ? "Опишите бизнес-проблему или техническую задачу клиента..."
                        : "Descrieți problema de afaceri sau sarcina tehnică a clientului..."}
                      rows={6}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    />
                  </div>

                  {/* Solution */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium">Решение</label>
                      <button
                        type="button"
                        onClick={() => generateCaseStudyContent(activeLocale, "solution")}
                        disabled={generating === `casestudy-${activeLocale}-solution`}
                        className="flex items-center gap-1 px-2 py-1 text-xs bg-primary/20 hover:bg-primary/30 text-primary rounded transition-colors disabled:opacity-50"
                      >
                        {generating === `casestudy-${activeLocale}-solution` ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Sparkles className="w-3 h-3" />
                        )}
                        AI
                      </button>
                    </div>
                    <textarea
                      value={csTranslation.solution}
                      onChange={(e) => updateCaseStudyTranslation(activeLocale, "solution", e.target.value)}
                      placeholder={activeLocale === "ru"
                        ? "Опишите как METABYTE решил эту задачу..."
                        : "Descrieți cum METABYTE a rezolvat această sarcină..."}
                      rows={6}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    />
                  </div>

                  {/* Results */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium">Результаты</label>
                      <button
                        type="button"
                        onClick={() => generateCaseStudyContent(activeLocale, "results")}
                        disabled={generating === `casestudy-${activeLocale}-results`}
                        className="flex items-center gap-1 px-2 py-1 text-xs bg-primary/20 hover:bg-primary/30 text-primary rounded transition-colors disabled:opacity-50"
                      >
                        {generating === `casestudy-${activeLocale}-results` ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Sparkles className="w-3 h-3" />
                        )}
                        AI
                      </button>
                    </div>
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        value={resultInput}
                        onChange={(e) => setResultInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addResult())}
                        placeholder={activeLocale === "ru" ? "Новый результат..." : "Rezultat nou..."}
                        className="flex-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <button
                        type="button"
                        onClick={addResult}
                        className="px-3 py-2 bg-muted hover:bg-muted/80 rounded-lg transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    {csTranslation.results.length === 0 ? (
                      <p className="text-muted-foreground text-sm py-4 text-center">
                        Нет результатов. Добавьте или сгенерируйте с помощью AI.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {csTranslation.results.map((result, index) => (
                          <div
                            key={index}
                            className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg"
                          >
                            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="flex-1 text-sm">{result}</span>
                            <button
                              type="button"
                              onClick={() => removeResult(index)}
                              className="p-1 text-muted-foreground hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Gallery */}
        {!isNew && (
          <div className="bg-card border border-border rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Images className="w-5 h-5" />
                Галерея кейса
              </h2>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddGalleryItem(true)}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm bg-muted hover:bg-muted/80 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Добавить
                </button>
                <button
                  type="button"
                  onClick={saveGallery}
                  disabled={isSavingGallery}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                  {isSavingGallery ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Сохранить
                </button>
              </div>
            </div>

            {/* Add new item modal */}
            {showAddGalleryItem && (
              <div className="p-4 bg-muted/50 rounded-lg space-y-4">
                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium">Тип:</label>
                  <div className="flex rounded-lg border border-border overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setNewGalleryItem({ ...newGalleryItem, type: "IMAGE" })}
                      className={`px-3 py-1.5 text-sm font-medium transition-colors flex items-center gap-1 ${
                        newGalleryItem.type === "IMAGE"
                          ? "bg-primary text-primary-foreground"
                          : "bg-background text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <ImageIcon className="w-4 h-4" />
                      Фото
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewGalleryItem({ ...newGalleryItem, type: "VIDEO" })}
                      className={`px-3 py-1.5 text-sm font-medium transition-colors flex items-center gap-1 ${
                        newGalleryItem.type === "VIDEO"
                          ? "bg-primary text-primary-foreground"
                          : "bg-background text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Video className="w-4 h-4" />
                      Видео
                    </button>
                  </div>
                </div>

                {newGalleryItem.type === "IMAGE" ? (
                  <div>
                    <label className="text-sm font-medium mb-2 block">Изображение:</label>
                    <MediaPicker
                      value={newGalleryItem.src}
                      onChange={(url) => setNewGalleryItem({ ...newGalleryItem, src: url || "" })}
                      label="Выбрать изображение"
                    />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        <Link className="w-4 h-4 inline mr-1" />
                        Ссылка на видео (Vimeo/YouTube):
                      </label>
                      <input
                        type="text"
                        value={newGalleryItem.videoUrl}
                        onChange={(e) => setNewGalleryItem({ ...newGalleryItem, videoUrl: e.target.value })}
                        placeholder="https://player.vimeo.com/video/..."
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Превью (опционально):</label>
                      <MediaPicker
                        value={newGalleryItem.src}
                        onChange={(url) => setNewGalleryItem({ ...newGalleryItem, src: url || "" })}
                        label="Выбрать превью"
                      />
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={addGalleryItem}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Добавить
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddGalleryItem(false);
                      setNewGalleryItem({ type: "IMAGE", src: "", videoUrl: "", videoProvider: "" });
                    }}
                    className="px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg transition-colors"
                  >
                    Отмена
                  </button>
                </div>
              </div>
            )}

            {/* Gallery items */}
            {gallery.length === 0 ? (
              <p className="text-muted-foreground text-sm py-8 text-center">
                Нет элементов в галерее. Добавьте фото или видео.
              </p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {gallery.map((item, index) => {
                  const translation = item.translations.find((t) => t.locale === activeLocale) || { alt: "", caption: "" };
                  return (
                    <div key={index} className="relative group bg-muted/50 rounded-lg overflow-hidden">
                      <div className="aspect-video relative">
                        {item.type === "VIDEO" ? (
                          <>
                            {item.src ? (
                              <img
                                src={item.src}
                                alt={translation.alt || "Video preview"}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-muted flex items-center justify-center">
                                <Video className="w-8 h-8 text-muted-foreground" />
                              </div>
                            )}
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                              <Video className="w-10 h-10 text-white" />
                            </div>
                          </>
                        ) : (
                          <img
                            src={item.src}
                            alt={translation.alt || "Gallery image"}
                            className="w-full h-full object-cover"
                          />
                        )}
                        <button
                          type="button"
                          onClick={() => removeGalleryItem(index)}
                          className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/50 text-white text-xs rounded">
                          {item.type === "VIDEO" ? "Видео" : "Фото"}
                        </div>
                      </div>
                      <div className="p-2 space-y-2">
                        <input
                          type="text"
                          value={translation.alt}
                          onChange={(e) => updateGalleryItemTranslation(index, activeLocale, "alt", e.target.value)}
                          placeholder="Alt текст"
                          className="w-full px-2 py-1 text-xs bg-background border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                        <input
                          type="text"
                          value={translation.caption || ""}
                          onChange={(e) => updateGalleryItemTranslation(index, activeLocale, "caption", e.target.value)}
                          placeholder="Подпись"
                          className="w-full px-2 py-1 text-xs bg-background border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </form>
    </>
  );
}
