"use client";

import { useEffect, useState } from "react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import {
  Plus,
  Edit,
  Trash2,
  Star,
  Save,
  X,
  Globe,
} from "lucide-react";

interface TestimonialTranslation {
  locale: string;
  author: string;
  task: string;
  text: string;
}

interface Testimonial {
  id: string;
  rating: number;
  source: string;
  order: number;
  translations: TestimonialTranslation[];
}

const initialTranslation = (locale: string): TestimonialTranslation => ({
  locale,
  author: "",
  task: "",
  text: "",
});

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [activeLocale, setActiveLocale] = useState<"ru" | "ro">("ru");
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const [formData, setFormData] = useState<Omit<Testimonial, "id">>({
    rating: 5,
    source: "YouDo",
    order: 0,
    translations: [initialTranslation("ru"), initialTranslation("ro")],
  });

  useEffect(() => {
    fetchTestimonials();
  }, []);

  async function fetchTestimonials() {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/testimonials");
      if (response.ok) {
        const data = await response.json();
        setTestimonials(data.testimonials);
      }
    } catch (error) {
      console.error("Failed to fetch testimonials:", error);
    } finally {
      setIsLoading(false);
    }
  }

  function startEditing(testimonial: Testimonial) {
    setFormData({
      rating: testimonial.rating,
      source: testimonial.source,
      order: testimonial.order,
      translations: testimonial.translations.length > 0
        ? testimonial.translations
        : [initialTranslation("ru"), initialTranslation("ro")],
    });
    setEditingId(testimonial.id);
    setIsCreating(false);
  }

  function startCreating() {
    setFormData({
      rating: 5,
      source: "YouDo",
      order: testimonials.length,
      translations: [initialTranslation("ru"), initialTranslation("ro")],
    });
    setIsCreating(true);
    setEditingId(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setIsCreating(false);
  }

  async function handleSave() {
    setIsSaving(true);
    try {
      const url = "/api/admin/testimonials";
      const method = isCreating ? "POST" : "PUT";
      const body = isCreating ? formData : { id: editingId, ...formData };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        await fetchTestimonials();
        cancelEdit();
      }
    } catch (error) {
      console.error("Save error:", error);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      const response = await fetch(`/api/admin/testimonials?id=${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setTestimonials(testimonials.filter((t) => t.id !== id));
        setDeleteConfirm(null);
      }
    } catch (error) {
      console.error("Delete error:", error);
    }
  }

  const getTranslation = (locale: string) => {
    return formData.translations.find((t) => t.locale === locale) || initialTranslation(locale);
  };

  const updateTranslation = (locale: string, field: keyof TestimonialTranslation, value: string) => {
    setFormData((prev) => ({
      ...prev,
      translations: prev.translations.map((t) =>
        t.locale === locale ? { ...t, [field]: value } : t
      ),
    }));
  };

  const currentTranslation = getTranslation(activeLocale);

  return (
    <>
      <AdminHeader
        title="Отзывы"
        description="Управление отзывами клиентов"
      />

      <div className="p-6 space-y-6">
        {/* Add button */}
        {!isCreating && !editingId && (
          <button
            onClick={startCreating}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Добавить отзыв
          </button>
        )}

        {/* Edit/Create form */}
        {(isCreating || editingId) && (
          <div className="bg-card border border-border rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {isCreating ? "Новый отзыв" : "Редактирование отзыва"}
              </h2>
              <button
                onClick={cancelEdit}
                className="p-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Рейтинг</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating })}
                      className="p-1"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          rating <= formData.rating
                            ? "text-yellow-500 fill-yellow-500"
                            : "text-muted-foreground"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Источник</label>
                <input
                  type="text"
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  placeholder="YouDo"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
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

            {/* Locale tabs */}
            <div className="flex items-center gap-2 pt-4 border-t border-border">
              <Globe className="w-4 h-4 text-muted-foreground" />
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Автор</label>
                <input
                  type="text"
                  value={currentTranslation.author}
                  onChange={(e) => updateTranslation(activeLocale, "author", e.target.value)}
                  placeholder={activeLocale === "ru" ? "Имя клиента" : "Numele clientului"}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Задача</label>
                <input
                  type="text"
                  value={currentTranslation.task}
                  onChange={(e) => updateTranslation(activeLocale, "task", e.target.value)}
                  placeholder={activeLocale === "ru" ? "Разработка сайта" : "Dezvoltarea site-ului"}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Текст отзыва</label>
              <textarea
                value={currentTranslation.text}
                onChange={(e) => updateTranslation(activeLocale, "text", e.target.value)}
                placeholder={activeLocale === "ru" ? "Текст отзыва..." : "Textul recenziei..."}
                rows={4}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <button
                onClick={cancelEdit}
                className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                <Save className="w-4 h-4" />
                {isSaving ? "Сохранение..." : "Сохранить"}
              </button>
            </div>
          </div>
        )}

        {/* Testimonials list */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {isLoading ? (
            <div className="p-8 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : testimonials.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              Нет отзывов
            </div>
          ) : (
            <div className="divide-y divide-border">
              {testimonials.map((testimonial) => {
                const ruTranslation = testimonial.translations.find((t) => t.locale === "ru");

                return (
                  <div
                    key={testimonial.id}
                    className={`p-4 hover:bg-muted/50 transition-colors ${
                      editingId === testimonial.id ? "bg-muted/50" : ""
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{ruTranslation?.author || "Без имени"}</span>
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-4 h-4 ${
                                  star <= testimonial.rating
                                    ? "text-yellow-500 fill-yellow-500"
                                    : "text-muted-foreground"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-muted-foreground px-2 py-0.5 bg-muted rounded">
                            {testimonial.source}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          {ruTranslation?.task}
                        </p>
                        <p className="text-sm line-clamp-2">
                          {ruTranslation?.text}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => startEditing(testimonial)}
                          className="p-2 text-muted-foreground hover:text-primary transition-colors"
                          title="Редактировать"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {deleteConfirm === testimonial.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDelete(testimonial.id)}
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
                            onClick={() => setDeleteConfirm(testimonial.id)}
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
        <div className="text-sm text-muted-foreground">
          Всего отзывов: {testimonials.length}
        </div>
      </div>
    </>
  );
}
