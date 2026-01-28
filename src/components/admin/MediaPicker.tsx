"use client";

import { useState, useEffect, useRef } from "react";
import {
  Image as ImageIcon,
  Video,
  Upload,
  X,
  Search,
  Check,
  Loader2,
  Trash2,
} from "lucide-react";

interface MediaItem {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
}

type MediaType = "image" | "video" | "all";

interface MediaPickerProps {
  value?: string;
  onChange: (url: string | null) => void;
  type?: MediaType;
  label?: string;
  placeholder?: string;
  className?: string;
}

export function MediaPicker({
  value,
  onChange,
  type = "image",
  label,
  placeholder = "Выберите файл",
  className = "",
}: MediaPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedUrl, setSelectedUrl] = useState<string | null>(value || null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMedia = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ limit: "50" });
      if (type !== "all") {
        params.set("type", type);
      }
      if (search) {
        params.set("search", search);
      }

      const res = await fetch(`/api/admin/media?${params}`);
      if (res.ok) {
        const data = await res.json();
        setMedia(data.media);
      }
    } catch (error) {
      console.error("Error fetching media:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMedia();
    }
  }, [isOpen, search, type]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/media", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setSelectedUrl(data.media.url);
        onChange(data.media.url);
        fetchMedia();
      } else {
        const error = await res.json();
        alert(`Upload failed: ${error.error}`);
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Upload failed");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSelect = (url: string) => {
    setSelectedUrl(url);
    onChange(url);
    setIsOpen(false);
  };

  const handleClear = () => {
    setSelectedUrl(null);
    onChange(null);
  };

  const getAcceptTypes = () => {
    switch (type) {
      case "image":
        return "image/*";
      case "video":
        return "video/*";
      default:
        return "image/*,video/*";
    }
  };

  const isImage = (url: string) => {
    return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url);
  };

  const isVideo = (url: string) => {
    return /\.(mp4|webm|mov)$/i.test(url);
  };

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium mb-2">{label}</label>
      )}

      {/* Current value preview */}
      <div className="relative">
        {selectedUrl ? (
          <div className="relative border border-border rounded-lg overflow-hidden bg-muted">
            {isImage(selectedUrl) ? (
              <img
                src={selectedUrl}
                alt="Selected"
                className="w-full h-40 object-cover"
              />
            ) : isVideo(selectedUrl) ? (
              <video
                src={selectedUrl}
                className="w-full h-40 object-cover"
              />
            ) : (
              <div className="w-full h-40 flex items-center justify-center">
                <ImageIcon className="w-12 h-12 text-muted-foreground" />
              </div>
            )}

            {/* Actions overlay */}
            <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-white text-sm transition-colors"
              >
                Заменить
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="p-2 bg-red-500/50 hover:bg-red-500 rounded-lg text-white transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="w-full h-40 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
          >
            {type === "video" ? (
              <Video className="w-8 h-8" />
            ) : (
              <ImageIcon className="w-8 h-8" />
            )}
            <span className="text-sm">{placeholder}</span>
          </button>
        )}
      </div>

      {/* Media picker modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="bg-card border border-border rounded-xl max-w-3xl w-full mx-4 max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="text-lg font-semibold">Выбрать медиафайл</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Toolbar */}
            <div className="flex items-center gap-3 p-4 border-b border-border">
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
                  accept={getAcceptTypes()}
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={isUploading}
                />
              </label>

              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Поиск..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-muted rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {/* Media grid */}
            <div className="flex-1 overflow-y-auto p-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : media.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <ImageIcon className="w-12 h-12 mb-4" />
                  <p>Нет медиафайлов</p>
                  <p className="text-sm">Загрузите файл для начала</p>
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-3">
                  {media.map((item) => {
                    const isSelected = selectedUrl === item.url;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelect(item.url)}
                        className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                          isSelected
                            ? "border-primary ring-2 ring-primary/20"
                            : "border-transparent hover:border-muted-foreground"
                        }`}
                      >
                        {item.mimeType.startsWith("image/") ? (
                          <img
                            src={item.url}
                            alt={item.originalName}
                            className="w-full h-full object-cover"
                          />
                        ) : item.mimeType.startsWith("video/") ? (
                          <video
                            src={item.url}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-muted flex items-center justify-center">
                            <ImageIcon className="w-8 h-8 text-muted-foreground" />
                          </div>
                        )}

                        {isSelected && (
                          <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                              <Check className="w-5 h-5 text-white" />
                            </div>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-4 border-t border-border">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
