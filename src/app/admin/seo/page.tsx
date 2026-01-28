"use client";

import { useState, useEffect } from "react";
import { Search, Globe, Sparkles, Save, Loader2, Eye, ChevronDown, ChevronUp } from "lucide-react";

type PageKey = "home" | "about" | "contact" | "pricing" | "projects";

interface PageSEOTranslation {
  locale: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string[];
}

interface PageSEOData {
  pageKey: PageKey;
  ogImage: string | null;
  translations: PageSEOTranslation[];
}

const PAGE_LABELS: Record<PageKey, { ru: string; ro: string }> = {
  home: { ru: "Главная", ro: "Pagina principală" },
  about: { ru: "О нас", ro: "Despre noi" },
  contact: { ru: "Контакты", ro: "Contact" },
  pricing: { ru: "Цены", ro: "Prețuri" },
  projects: { ru: "Проекты", ro: "Proiecte" },
};

const LOCALES = ["ru", "ro"] as const;

export default function SEOPage() {
  const [pages, setPages] = useState<PageSEOData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [generating, setGenerating] = useState<string | null>(null);
  const [expandedPage, setExpandedPage] = useState<PageKey | null>(null);
  const [editData, setEditData] = useState<Record<PageKey, PageSEOData>>({} as Record<PageKey, PageSEOData>);

  useEffect(() => {
    fetchPages();
  }, []);

  async function fetchPages() {
    try {
      const res = await fetch("/api/admin/seo/pages");
      const data = await res.json();
      setPages(data.pages);

      // Initialize edit data
      const edit: Record<PageKey, PageSEOData> = {} as Record<PageKey, PageSEOData>;
      for (const page of data.pages) {
        edit[page.pageKey as PageKey] = {
          ...page,
          translations: LOCALES.map(locale => {
            const existing = page.translations.find((t: PageSEOTranslation) => t.locale === locale);
            return existing || {
              locale,
              metaTitle: "",
              metaDescription: "",
              metaKeywords: [],
            };
          }),
        };
      }
      setEditData(edit);
    } catch (error) {
      console.error("Failed to fetch pages:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(pageKey: PageKey) {
    setSaving(pageKey);
    try {
      const res = await fetch(`/api/admin/seo/pages/${pageKey}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData[pageKey]),
      });

      if (!res.ok) throw new Error("Failed to save");

      // Refresh data
      await fetchPages();
    } catch (error) {
      console.error("Save error:", error);
      alert("Ошибка сохранения");
    } finally {
      setSaving(null);
    }
  }

  async function generateWithAI(pageKey: PageKey, locale: string, field: "title" | "description" | "keywords") {
    const key = `${pageKey}-${locale}-${field}`;
    setGenerating(key);

    try {
      const currentData = editData[pageKey];
      const translation = currentData.translations.find(t => t.locale === locale);

      const res = await fetch("/api/admin/ai/seo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "page",
          field,
          locale,
          context: {
            pageKey,
            currentTitle: translation?.metaTitle,
            currentDescription: translation?.metaDescription,
          },
        }),
      });

      if (!res.ok) throw new Error("AI generation failed");

      const data = await res.json();

      // Update the field
      setEditData(prev => ({
        ...prev,
        [pageKey]: {
          ...prev[pageKey],
          translations: prev[pageKey].translations.map(t => {
            if (t.locale !== locale) return t;
            if (field === "title") return { ...t, metaTitle: data.result };
            if (field === "description") return { ...t, metaDescription: data.result };
            if (field === "keywords") return { ...t, metaKeywords: data.result };
            return t;
          }),
        },
      }));
    } catch (error) {
      console.error("AI generation error:", error);
      alert("Ошибка генерации");
    } finally {
      setGenerating(null);
    }
  }

  function updateField(pageKey: PageKey, locale: string, field: string, value: string | string[]) {
    setEditData(prev => ({
      ...prev,
      [pageKey]: {
        ...prev[pageKey],
        translations: prev[pageKey].translations.map(t => {
          if (t.locale !== locale) return t;
          return { ...t, [field]: value };
        }),
      },
    }));
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Search className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">SEO Настройки</h1>
          <p className="text-muted-foreground">Управление мета-тегами страниц</p>
        </div>
      </div>

      <div className="space-y-4">
        {Object.keys(PAGE_LABELS).map((key) => {
          const pageKey = key as PageKey;
          const pageData = editData[pageKey];
          const isExpanded = expandedPage === pageKey;

          if (!pageData) return null;

          return (
            <div key={pageKey} className="bg-card border border-border rounded-lg overflow-hidden">
              {/* Header */}
              <button
                onClick={() => setExpandedPage(isExpanded ? null : pageKey)}
                className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-primary" />
                  <div className="text-left">
                    <h3 className="font-semibold">{PAGE_LABELS[pageKey].ru}</h3>
                    <p className="text-sm text-muted-foreground">/{pageKey === "home" ? "" : pageKey}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {pageData.translations.some(t => t.metaTitle) && (
                    <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
                      Настроено
                    </span>
                  )}
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
              </button>

              {/* Content */}
              {isExpanded && (
                <div className="border-t border-border p-4 space-y-6">
                  {LOCALES.map((locale) => {
                    const translation = pageData.translations.find(t => t.locale === locale);
                    if (!translation) return null;

                    return (
                      <div key={locale} className="space-y-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold uppercase bg-primary/20 text-primary px-2 py-1 rounded">
                            {locale === "ru" ? "Русский" : "Română"}
                          </span>
                        </div>

                        {/* Meta Title */}
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-sm font-medium">Meta Title</label>
                            <span className={`text-xs ${translation.metaTitle.length > 60 ? "text-red-400" : "text-muted-foreground"}`}>
                              {translation.metaTitle.length}/60
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={translation.metaTitle}
                              onChange={(e) => updateField(pageKey, locale, "metaTitle", e.target.value)}
                              className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-sm"
                              placeholder="SEO заголовок страницы"
                            />
                            <button
                              onClick={() => generateWithAI(pageKey, locale, "title")}
                              disabled={generating === `${pageKey}-${locale}-title`}
                              className="px-3 py-2 bg-primary/20 hover:bg-primary/30 text-primary rounded-lg transition-colors disabled:opacity-50"
                              title="Сгенерировать с AI"
                            >
                              {generating === `${pageKey}-${locale}-title` ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Sparkles className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Meta Description */}
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-sm font-medium">Meta Description</label>
                            <span className={`text-xs ${translation.metaDescription.length > 160 ? "text-red-400" : "text-muted-foreground"}`}>
                              {translation.metaDescription.length}/160
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <textarea
                              value={translation.metaDescription}
                              onChange={(e) => updateField(pageKey, locale, "metaDescription", e.target.value)}
                              className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-sm min-h-[80px] resize-none"
                              placeholder="SEO описание страницы"
                            />
                            <button
                              onClick={() => generateWithAI(pageKey, locale, "description")}
                              disabled={generating === `${pageKey}-${locale}-description`}
                              className="px-3 py-2 bg-primary/20 hover:bg-primary/30 text-primary rounded-lg transition-colors disabled:opacity-50 h-fit"
                              title="Сгенерировать с AI"
                            >
                              {generating === `${pageKey}-${locale}-description` ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Sparkles className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Keywords */}
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-sm font-medium">Keywords</label>
                            <span className="text-xs text-muted-foreground">
                              {translation.metaKeywords.length} ключевых слов
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={translation.metaKeywords.join(", ")}
                              onChange={(e) => updateField(
                                pageKey,
                                locale,
                                "metaKeywords",
                                e.target.value.split(",").map(k => k.trim()).filter(k => k)
                              )}
                              className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-sm"
                              placeholder="ключевое слово 1, ключевое слово 2, ..."
                            />
                            <button
                              onClick={() => generateWithAI(pageKey, locale, "keywords")}
                              disabled={generating === `${pageKey}-${locale}-keywords`}
                              className="px-3 py-2 bg-primary/20 hover:bg-primary/30 text-primary rounded-lg transition-colors disabled:opacity-50"
                              title="Сгенерировать с AI"
                            >
                              {generating === `${pageKey}-${locale}-keywords` ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Sparkles className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Preview */}
                        {translation.metaTitle && (
                          <div className="mt-4 p-4 bg-muted/30 rounded-lg">
                            <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
                              <Eye className="w-3 h-3" />
                              Превью в Google
                            </div>
                            <div className="space-y-1">
                              <div className="text-blue-400 text-lg hover:underline cursor-pointer truncate">
                                {translation.metaTitle}
                              </div>
                              <div className="text-green-400 text-sm">
                                mtbyte.io{pageKey === "home" ? "" : `/${pageKey}`}
                              </div>
                              <div className="text-muted-foreground text-sm line-clamp-2">
                                {translation.metaDescription}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Save button */}
                  <div className="flex justify-end pt-4 border-t border-border">
                    <button
                      onClick={() => handleSave(pageKey)}
                      disabled={saving === pageKey}
                      className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors disabled:opacity-50"
                    >
                      {saving === pageKey ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      Сохранить
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
