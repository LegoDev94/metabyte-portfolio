"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import {
  Upload,
  Image as ImageIcon,
  Video,
  FileText,
  Trash2,
  Search,
  Grid,
  List,
  Copy,
  Check,
  X,
  Loader2,
  Filter,
  Sparkles,
  Save,
  Globe,
} from "lucide-react";

interface MediaTranslation {
  locale: string;
  altText: string;
  title: string;
  description: string;
}

interface MediaItem {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  path: string;
  linkedTo: string | null;
  createdAt: string;
  translations?: MediaTranslation[];
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

type ViewMode = "grid" | "list";
type MediaType = "all" | "image" | "video" | "document";

export default function MediaPage() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [mediaType, setMediaType] = useState<MediaType>("all");
  const [search, setSearch] = useState("");
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null);
  const [seoLocale, setSeoLocale] = useState<"ru" | "ro" | "en">("ru");
  const [seoData, setSeoData] = useState<Record<string, MediaTranslation>>({});
  const [isSavingSeo, setIsSavingSeo] = useState(false);
  const [generating, setGenerating] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMedia = useCallback(
    async (page = 1) => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: "20",
          includeTranslations: "true",
        });
        if (mediaType !== "all") {
          params.set("type", mediaType);
        }
        if (search) {
          params.set("search", search);
        }

        const res = await fetch(`/api/admin/media?${params}`);
        if (res.ok) {
          const data = await res.json();
          setMedia(data.media);
          setPagination(data.pagination);
        }
      } catch (error) {
        console.error("Error fetching media:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [mediaType, search]
  );

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);

    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch("/api/admin/media", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const error = await res.json();
          alert(`Failed to upload ${file.name}: ${error.error}`);
        }
      } catch (error) {
        console.error("Upload error:", error);
        alert(`Failed to upload ${file.name}`);
      }
    }

    setIsUploading(false);
    fetchMedia();

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/media/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setMedia((prev) => prev.filter((m) => m.id !== id));
        setSelectedItems((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }
    } catch (error) {
      console.error("Delete error:", error);
    }
    setDeleteConfirm(null);
  };

  const handleBulkDelete = async () => {
    for (const id of selectedItems) {
      await handleDelete(id);
    }
    setSelectedItems(new Set());
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Initialize SEO data when preview item changes
  const initializeSeoData = (item: MediaItem) => {
    const data: Record<string, MediaTranslation> = {};
    ["ru", "ro", "en"].forEach((locale) => {
      const existing = item.translations?.find((t) => t.locale === locale);
      data[locale] = existing || {
        locale,
        altText: "",
        title: "",
        description: "",
      };
    });
    setSeoData(data);
  };

  const handlePreviewOpen = (item: MediaItem) => {
    setPreviewItem(item);
    initializeSeoData(item);
  };

  const updateSeoField = (locale: string, field: keyof MediaTranslation, value: string) => {
    setSeoData((prev) => ({
      ...prev,
      [locale]: {
        ...prev[locale],
        [field]: value,
      },
    }));
  };

  const saveSeoData = async () => {
    if (!previewItem) return;
    setIsSavingSeo(true);
    setSaveSuccess(false);

    try {
      const translations = Object.values(seoData);
      const res = await fetch(`/api/admin/media/${previewItem.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ translations }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to save SEO");
      }

      const { media: updatedMedia } = await res.json();

      // Update local media state with server response
      if (updatedMedia) {
        setMedia((prev) =>
          prev.map((m) =>
            m.id === previewItem.id ? updatedMedia : m
          )
        );
        // Update preview item too
        setPreviewItem(updatedMedia);
        // Re-initialize seoData from server response
        initializeSeoData(updatedMedia);
      }

      // Show success notification
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Save SEO error:", error);
      alert("Ошибка сохранения SEO данных");
    } finally {
      setIsSavingSeo(false);
    }
  };

  const generateSeoField = async (locale: string, field: "altText" | "title" | "description") => {
    if (!previewItem) return;
    setGenerating(`${locale}-${field}`);

    try {
      const res = await fetch("/api/admin/ai/seo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "media",
          field,
          locale,
          context: {
            mediaFilename: previewItem.originalName,
            mediaLinkedTo: previewItem.linkedTo || null,
          },
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error("AI generation error response:", errorData);
        throw new Error("AI generation failed");
      }

      const data = await res.json();
      updateSeoField(locale, field, data.result);
    } catch (error) {
      console.error("AI generation error:", error);
      alert("Ошибка генерации");
    } finally {
      setGenerating(null);
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) return ImageIcon;
    if (mimeType.startsWith("video/")) return Video;
    return FileText;
  };

  const isImage = (mimeType: string) => mimeType.startsWith("image/");
  const isVideo = (mimeType: string) => mimeType.startsWith("video/");

  return (
    <>
      <AdminHeader
        title="Медиатека"
        description="Управление загруженными файлами"
      />
      <div className="p-6 space-y-6">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Upload button */}
          <label className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg cursor-pointer hover:bg-primary/90 transition-colors">
            {isUploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            <span>{isUploading ? "Загрузка..." : "Загрузить"}</span>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml,video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov,.pdf"
              onChange={handleFileSelect}
              className="hidden"
              disabled={isUploading}
            />
          </label>

          {/* Bulk actions */}
          {selectedItems.size > 0 && (
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Удалить ({selectedItems.size})</span>
            </button>
          )}

          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Поиск файлов..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-muted rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Filter by type */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <select
              value={mediaType}
              onChange={(e) => setMediaType(e.target.value as MediaType)}
              className="px-3 py-2 bg-muted rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">Все файлы</option>
              <option value="image">Изображения</option>
              <option value="video">Видео</option>
              <option value="document">Документы</option>
            </select>
          </div>

          {/* View mode toggle */}
          <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded ${
                viewMode === "grid"
                  ? "bg-background text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded ${
                viewMode === "list"
                  ? "bg-background text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Media grid/list */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : media.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <ImageIcon className="w-12 h-12 mb-4" />
            <p>Нет загруженных файлов</p>
            <p className="text-sm">Загрузите файлы, чтобы начать</p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {media.map((item) => {
              const Icon = getFileIcon(item.mimeType);
              const isSelected = selectedItems.has(item.id);

              return (
                <div
                  key={item.id}
                  className={`relative group bg-card border rounded-xl overflow-hidden cursor-pointer transition-all ${
                    isSelected
                      ? "border-primary ring-2 ring-primary/20"
                      : "border-border hover:border-muted-foreground"
                  }`}
                  onClick={() => handlePreviewOpen(item)}
                >
                  {/* Checkbox */}
                  <div
                    className="absolute top-2 left-2 z-10"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedItems((prev) => {
                        const next = new Set(prev);
                        if (next.has(item.id)) {
                          next.delete(item.id);
                        } else {
                          next.add(item.id);
                        }
                        return next;
                      });
                    }}
                  >
                    <div
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        isSelected
                          ? "bg-primary border-primary"
                          : "border-white/50 bg-black/30 group-hover:border-white"
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                    </div>
                  </div>

                  {/* Preview */}
                  <div className="aspect-square bg-muted flex items-center justify-center">
                    {isImage(item.mimeType) ? (
                      <img
                        src={item.url}
                        alt={item.originalName}
                        className="w-full h-full object-cover"
                      />
                    ) : isVideo(item.mimeType) ? (
                      <video
                        src={item.url}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Icon className="w-12 h-12 text-muted-foreground" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-2">
                    <p className="text-xs truncate">{item.originalName}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(item.size)}
                    </p>
                  </div>

                  {/* Actions overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        copyUrl(item.url);
                      }}
                      className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                      title="Копировать URL"
                    >
                      {copiedUrl === item.url ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4 text-white" />
                      )}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirm(item.id);
                      }}
                      className="p-2 bg-white/10 rounded-lg hover:bg-red-500/50 transition-colors"
                      title="Удалить"
                    >
                      <Trash2 className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="p-3 text-left">
                    <input
                      type="checkbox"
                      checked={
                        selectedItems.size === media.length && media.length > 0
                      }
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedItems(new Set(media.map((m) => m.id)));
                        } else {
                          setSelectedItems(new Set());
                        }
                      }}
                      className="rounded"
                    />
                  </th>
                  <th className="p-3 text-left text-sm font-medium">Файл</th>
                  <th className="p-3 text-left text-sm font-medium">Тип</th>
                  <th className="p-3 text-left text-sm font-medium">Размер</th>
                  <th className="p-3 text-left text-sm font-medium">Дата</th>
                  <th className="p-3 text-left text-sm font-medium">Действия</th>
                </tr>
              </thead>
              <tbody>
                {media.map((item) => {
                  const Icon = getFileIcon(item.mimeType);
                  const isSelected = selectedItems.has(item.id);

                  return (
                    <tr
                      key={item.id}
                      className={`border-b border-border last:border-b-0 ${
                        isSelected ? "bg-primary/5" : "hover:bg-muted/30"
                      }`}
                    >
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {
                            setSelectedItems((prev) => {
                              const next = new Set(prev);
                              if (next.has(item.id)) {
                                next.delete(item.id);
                              } else {
                                next.add(item.id);
                              }
                              return next;
                            });
                          }}
                          className="rounded"
                        />
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded bg-muted flex items-center justify-center overflow-hidden">
                            {isImage(item.mimeType) ? (
                              <img
                                src={item.url}
                                alt={item.originalName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Icon className="w-5 h-5 text-muted-foreground" />
                            )}
                          </div>
                          <span className="text-sm truncate max-w-[200px]">
                            {item.originalName}
                          </span>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="text-sm text-muted-foreground">
                          {item.mimeType.split("/")[1].toUpperCase()}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="text-sm text-muted-foreground">
                          {formatFileSize(item.size)}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="text-sm text-muted-foreground">
                          {new Date(item.createdAt).toLocaleDateString("ru-RU")}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => copyUrl(item.url)}
                            className="p-2 hover:bg-muted rounded-lg transition-colors"
                            title="Копировать URL"
                          >
                            {copiedUrl === item.url ? (
                              <Check className="w-4 h-4 text-green-500" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handlePreviewOpen(item)}
                            className="p-2 hover:bg-muted rounded-lg transition-colors"
                            title="Просмотр"
                          >
                            <ImageIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(item.id)}
                            className="p-2 hover:bg-red-500/10 text-red-500 rounded-lg transition-colors"
                            title="Удалить"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
              (page) => (
                <button
                  key={page}
                  onClick={() => fetchMedia(page)}
                  className={`w-8 h-8 rounded-lg text-sm transition-colors ${
                    page === pagination.page
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted/80 text-muted-foreground"
                  }`}
                >
                  {page}
                </button>
              )
            )}
          </div>
        )}

        {/* Delete confirmation modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-card border border-border rounded-xl p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-2">Удалить файл?</h3>
              <p className="text-muted-foreground mb-6">
                Это действие нельзя отменить. Файл будет удален навсегда.
              </p>
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                >
                  Отмена
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Удалить
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Preview modal */}
        {previewItem && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
            onClick={() => setPreviewItem(null)}
          >
            <div
              className="relative max-w-4xl w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setPreviewItem(null)}
                className="absolute -top-12 right-0 p-2 text-white hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>

              {isImage(previewItem.mimeType) ? (
                <img
                  src={previewItem.url}
                  alt={previewItem.originalName}
                  className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
                />
              ) : isVideo(previewItem.mimeType) ? (
                <video
                  src={previewItem.url}
                  controls
                  autoPlay
                  className="w-full h-auto max-h-[80vh] rounded-lg"
                />
              ) : (
                <div className="bg-card p-12 rounded-lg text-center">
                  <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-medium">{previewItem.originalName}</p>
                  <p className="text-muted-foreground mt-2">
                    {formatFileSize(previewItem.size)}
                  </p>
                  <a
                    href={previewItem.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
                  >
                    Открыть файл
                  </a>
                </div>
              )}

              {/* File info & SEO */}
              <div className="mt-4 bg-card border border-border rounded-lg overflow-hidden">
                {/* File info header */}
                <div className="p-4 flex items-center justify-between border-b border-border">
                  <div>
                    <p className="font-medium">{previewItem.originalName}</p>
                    <p className="text-sm text-muted-foreground">
                      {previewItem.mimeType} • {formatFileSize(previewItem.size)}
                    </p>
                  </div>
                  <button
                    onClick={() => copyUrl(previewItem.url)}
                    className="flex items-center gap-2 px-4 py-2 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                  >
                    {copiedUrl === previewItem.url ? (
                      <>
                        <Check className="w-4 h-4 text-green-500" />
                        <span>Скопировано</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Копировать URL</span>
                      </>
                    )}
                  </button>
                </div>

                {/* SEO section - only for images */}
                {isImage(previewItem.mimeType) && (
                  <div className="p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        SEO Настройки
                      </h4>
                      <div className="flex gap-1">
                        <button
                          onClick={() => setSeoLocale("ru")}
                          className={`px-3 py-1 text-xs rounded ${
                            seoLocale === "ru"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          RU
                        </button>
                        <button
                          onClick={() => setSeoLocale("ro")}
                          className={`px-3 py-1 text-xs rounded ${
                            seoLocale === "ro"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          RO
                        </button>
                        <button
                          onClick={() => setSeoLocale("en")}
                          className={`px-3 py-1 text-xs rounded ${
                            seoLocale === "en"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          EN
                        </button>
                      </div>
                    </div>

                    {/* Alt Text */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-sm font-medium">Alt Text</label>
                        <span className="text-xs text-muted-foreground">
                          {seoData[seoLocale]?.altText?.length || 0}/125
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={seoData[seoLocale]?.altText || ""}
                          onChange={(e) => updateSeoField(seoLocale, "altText", e.target.value)}
                          placeholder="Описание изображения для поисковиков и скринридеров"
                          className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-sm"
                        />
                        <button
                          onClick={() => generateSeoField(seoLocale, "altText")}
                          disabled={generating === `${seoLocale}-altText`}
                          className="px-3 py-2 bg-primary/20 hover:bg-primary/30 text-primary rounded-lg transition-colors disabled:opacity-50"
                          title="Сгенерировать с AI"
                        >
                          {generating === `${seoLocale}-altText` ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Sparkles className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Title */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-sm font-medium">Title</label>
                        <span className="text-xs text-muted-foreground">
                          {seoData[seoLocale]?.title?.length || 0}/70
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={seoData[seoLocale]?.title || ""}
                          onChange={(e) => updateSeoField(seoLocale, "title", e.target.value)}
                          placeholder="Заголовок изображения"
                          className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-sm"
                        />
                        <button
                          onClick={() => generateSeoField(seoLocale, "title")}
                          disabled={generating === `${seoLocale}-title`}
                          className="px-3 py-2 bg-primary/20 hover:bg-primary/30 text-primary rounded-lg transition-colors disabled:opacity-50"
                          title="Сгенерировать с AI"
                        >
                          {generating === `${seoLocale}-title` ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Sparkles className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-sm font-medium">Description</label>
                        <span className="text-xs text-muted-foreground">
                          {seoData[seoLocale]?.description?.length || 0}/200
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <textarea
                          value={seoData[seoLocale]?.description || ""}
                          onChange={(e) => updateSeoField(seoLocale, "description", e.target.value)}
                          placeholder="Подробное описание изображения"
                          rows={2}
                          className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-sm resize-none"
                        />
                        <button
                          onClick={() => generateSeoField(seoLocale, "description")}
                          disabled={generating === `${seoLocale}-description`}
                          className="px-3 py-2 bg-primary/20 hover:bg-primary/30 text-primary rounded-lg transition-colors disabled:opacity-50 self-start"
                          title="Сгенерировать с AI"
                        >
                          {generating === `${seoLocale}-description` ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Sparkles className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Save button */}
                    <button
                      onClick={saveSeoData}
                      disabled={isSavingSeo || saveSuccess}
                      className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 ${
                        saveSuccess
                          ? "bg-green-600 hover:bg-green-600 text-white"
                          : "bg-primary hover:bg-primary/90 text-primary-foreground"
                      }`}
                    >
                      {isSavingSeo ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : saveSuccess ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      {saveSuccess ? "Сохранено!" : "Сохранить SEO"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
