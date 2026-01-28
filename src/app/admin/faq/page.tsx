"use client";

import { useEffect, useState } from "react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Globe,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface FaqTranslation {
  locale: string;
  question: string;
  answer: string;
}

interface FaqItem {
  id: string;
  category: string | null;
  helpfulCount: number;
  order: number;
  translations: FaqTranslation[];
}

const initialTranslation = (locale: string): FaqTranslation => ({
  locale,
  question: "",
  answer: "",
});

const categoryOptions = [
  { value: "", label: "Без категории" },
  { value: "general", label: "Общие вопросы" },
  { value: "pricing", label: "Цены и оплата" },
  { value: "process", label: "Процесс работы" },
  { value: "technical", label: "Технические вопросы" },
  { value: "support", label: "Поддержка" },
];

export default function FAQPage() {
  const [items, setItems] = useState<FaqItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [activeLocale, setActiveLocale] = useState<"ru" | "ro">("ru");
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Omit<FaqItem, "id" | "helpfulCount">>({
    category: null,
    order: 0,
    translations: [initialTranslation("ru"), initialTranslation("ro")],
  });

  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/faq");
      if (response.ok) {
        const data = await response.json();
        setItems(data.items);
      }
    } catch (error) {
      console.error("Failed to fetch FAQ items:", error);
    } finally {
      setIsLoading(false);
    }
  }

  function startEditing(item: FaqItem) {
    setFormData({
      category: item.category,
      order: item.order,
      translations: item.translations.length > 0
        ? item.translations
        : [initialTranslation("ru"), initialTranslation("ro")],
    });
    setEditingId(item.id);
    setIsCreating(false);
  }

  function startCreating() {
    setFormData({
      category: null,
      order: items.length,
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
      const url = "/api/admin/faq";
      const method = isCreating ? "POST" : "PUT";
      const body = isCreating ? formData : { id: editingId, ...formData };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        await fetchItems();
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
      const response = await fetch(`/api/admin/faq?id=${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setItems(items.filter((item) => item.id !== id));
        setDeleteConfirm(null);
      }
    } catch (error) {
      console.error("Delete error:", error);
    }
  }

  const getTranslation = (locale: string) => {
    return formData.translations.find((t) => t.locale === locale) || initialTranslation(locale);
  };

  const updateTranslation = (locale: string, field: keyof FaqTranslation, value: string) => {
    setFormData((prev) => ({
      ...prev,
      translations: prev.translations.map((t) =>
        t.locale === locale ? { ...t, [field]: value } : t
      ),
    }));
  };

  const currentTranslation = getTranslation(activeLocale);

  const getCategoryLabel = (category: string | null) => {
    return categoryOptions.find((c) => c.value === (category || ""))?.label || "Без категории";
  };

  return (
    <>
      <AdminHeader
        title="FAQ"
        description="Управление часто задаваемыми вопросами"
      />

      <div className="p-6 space-y-6">
        {!isCreating && !editingId && (
          <button
            onClick={startCreating}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Добавить вопрос
          </button>
        )}

        {(isCreating || editingId) && (
          <div className="bg-card border border-border rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {isCreating ? "Новый вопрос" : "Редактирование вопроса"}
              </h2>
              <button
                onClick={cancelEdit}
                className="p-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Категория</label>
                <select
                  value={formData.category || ""}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value || null })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {categoryOptions.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
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

            <div>
              <label className="block text-sm font-medium mb-2">Вопрос</label>
              <input
                type="text"
                value={currentTranslation.question}
                onChange={(e) => updateTranslation(activeLocale, "question", e.target.value)}
                placeholder={activeLocale === "ru" ? "Как заказать проект?" : "Cum pot comanda un proiect?"}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Ответ</label>
              <textarea
                value={currentTranslation.answer}
                onChange={(e) => updateTranslation(activeLocale, "answer", e.target.value)}
                placeholder={activeLocale === "ru" ? "Подробный ответ на вопрос..." : "Răspuns detaliat..."}
                rows={5}
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

        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {isLoading ? (
            <div className="p-8 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <HelpCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              Нет вопросов
            </div>
          ) : (
            <div className="divide-y divide-border">
              {items.map((item) => {
                const ruTranslation = item.translations.find((t) => t.locale === "ru");
                const isExpanded = expandedId === item.id;

                return (
                  <div
                    key={item.id}
                    className={`hover:bg-muted/50 transition-colors ${
                      editingId === item.id ? "bg-muted/50" : ""
                    }`}
                  >
                    <div className="p-4">
                      <div className="flex items-start gap-4">
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : item.id)}
                          className="p-1 text-muted-foreground hover:text-foreground mt-0.5"
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">
                              {ruTranslation?.question || "Без вопроса"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="px-2 py-0.5 bg-muted rounded">
                              {getCategoryLabel(item.category)}
                            </span>
                            <span>#{item.order}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => startEditing(item)}
                            className="p-2 text-muted-foreground hover:text-primary transition-colors"
                            title="Редактировать"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          {deleteConfirm === item.id ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleDelete(item.id)}
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
                              onClick={() => setDeleteConfirm(item.id)}
                              className="p-2 text-muted-foreground hover:text-red-500 transition-colors"
                              title="Удалить"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      {isExpanded && ruTranslation && (
                        <div className="mt-3 ml-9 p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground">
                          {ruTranslation.answer}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="text-sm text-muted-foreground">
          Всего вопросов: {items.length}
        </div>
      </div>
    </>
  );
}
