"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Cropper, { Area } from "react-easy-crop";
import {
  Image as ImageIcon,
  Video,
  Upload,
  X,
  Search,
  Check,
  Loader2,
  Trash2,
  Crop,
  ZoomIn,
  ZoomOut,
  RotateCw,
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
  aspectRatio?: number; // e.g., 16/9, 1, 4/3 - if provided, enables cropping
  cropShape?: "rect" | "round";
}

export function MediaPicker({
  value,
  onChange,
  type = "image",
  label,
  placeholder = "Выберите файл",
  className = "",
  aspectRatio,
  cropShape = "rect",
}: MediaPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedUrl, setSelectedUrl] = useState<string | null>(value || null);

  // Cropping state
  const [step, setStep] = useState<"browse" | "crop">("browse");
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isSaving, setIsSaving] = useState(false);

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
        // If aspectRatio is set and it's an image, go to crop mode
        if (aspectRatio && file.type.startsWith("image/")) {
          setImageToCrop(data.media.url);
          setStep("crop");
          setCrop({ x: 0, y: 0 });
          setZoom(1);
          setRotation(0);
        } else {
          setSelectedUrl(data.media.url);
          onChange(data.media.url);
          setIsOpen(false);
        }
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

  const handleSelect = (url: string, mimeType: string) => {
    // If aspectRatio is set and it's an image, go to crop mode
    if (aspectRatio && mimeType.startsWith("image/")) {
      setImageToCrop(url);
      setStep("crop");
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setRotation(0);
    } else {
      setSelectedUrl(url);
      onChange(url);
      setIsOpen(false);
    }
  };

  const handleClear = () => {
    setSelectedUrl(null);
    onChange(null);
  };

  const handleClose = () => {
    setIsOpen(false);
    setStep("browse");
    setImageToCrop(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
  };

  const handleBackToBrowse = () => {
    setStep("browse");
    setImageToCrop(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
  };

  const onCropComplete = useCallback((_: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSaveCrop = async () => {
    if (!imageToCrop || !croppedAreaPixels) return;

    setIsSaving(true);
    try {
      // Create cropped image
      const croppedImageUrl = await getCroppedImg(
        imageToCrop,
        croppedAreaPixels,
        rotation
      );

      if (croppedImageUrl) {
        // Upload cropped image to server
        const blob = await fetch(croppedImageUrl).then((r) => r.blob());
        const formData = new FormData();
        formData.append("file", blob, `cropped-${Date.now()}.webp`);

        const res = await fetch("/api/admin/media", {
          method: "POST",
          body: formData,
        });

        if (res.ok) {
          const data = await res.json();
          setSelectedUrl(data.media.url);
          onChange(data.media.url);
          handleClose();
        } else {
          console.error("Failed to upload cropped image");
        }

        // Clean up blob URL
        URL.revokeObjectURL(croppedImageUrl);
      }
    } catch (error) {
      console.error("Error saving cropped image:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUseOriginal = () => {
    if (imageToCrop) {
      setSelectedUrl(imageToCrop);
      onChange(imageToCrop);
      handleClose();
    }
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
            {aspectRatio && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Crop className="w-3 h-3" />
                С обрезкой
              </span>
            )}
          </button>
        )}
      </div>

      {/* Media picker modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={handleClose}
        >
          <div
            className="bg-card border border-border rounded-xl max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-3">
                {step === "crop" && (
                  <button
                    onClick={handleBackToBrowse}
                    className="p-1.5 hover:bg-muted rounded-md transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <h3 className="text-lg font-semibold">
                  {step === "browse" ? "Выбрать медиафайл" : "Обрезать изображение"}
                </h3>
              </div>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {step === "browse" ? (
              <>
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

                  {aspectRatio && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-muted rounded-lg text-sm text-muted-foreground">
                      <Crop className="w-4 h-4" />
                      <span>Обрезка {cropShape === "round" ? "(круг)" : ""}</span>
                    </div>
                  )}
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
                            onClick={() => handleSelect(item.url, item.mimeType)}
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
                    onClick={handleClose}
                    className="px-4 py-2 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                  >
                    Отмена
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Crop Area */}
                <div className="relative flex-1 min-h-[400px] bg-black">
                  <Cropper
                    image={imageToCrop || ""}
                    crop={crop}
                    zoom={zoom}
                    rotation={rotation}
                    aspect={aspectRatio}
                    cropShape={cropShape}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onRotationChange={setRotation}
                    onCropComplete={onCropComplete}
                  />
                </div>

                {/* Crop Controls */}
                <div className="p-4 border-t border-border space-y-4">
                  {/* Zoom */}
                  <div className="flex items-center gap-4">
                    <ZoomOut className="w-4 h-4 text-muted-foreground" />
                    <input
                      type="range"
                      min={1}
                      max={3}
                      step={0.1}
                      value={zoom}
                      onChange={(e) => setZoom(Number(e.target.value))}
                      className="flex-1 accent-primary"
                    />
                    <ZoomIn className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground w-12">
                      {Math.round(zoom * 100)}%
                    </span>
                  </div>

                  {/* Rotation */}
                  <div className="flex items-center gap-4">
                    <RotateCw className="w-4 h-4 text-muted-foreground" />
                    <input
                      type="range"
                      min={0}
                      max={360}
                      step={1}
                      value={rotation}
                      onChange={(e) => setRotation(Number(e.target.value))}
                      className="flex-1 accent-primary"
                    />
                    <span className="text-sm text-muted-foreground w-12">
                      {rotation}°
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleUseOriginal}
                      className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors"
                    >
                      Использовать оригинал
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveCrop}
                      disabled={isSaving}
                      className="flex items-center gap-2 px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                      {isSaving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                      Сохранить
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Helper function to create cropped image
async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
  rotation = 0
): Promise<string | null> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) return null;

  const maxSize = Math.max(image.width, image.height);
  const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

  // Set canvas size to safe area for rotation
  canvas.width = safeArea;
  canvas.height = safeArea;

  // Translate canvas context to center
  ctx.translate(safeArea / 2, safeArea / 2);
  ctx.rotate(getRadianAngle(rotation));
  ctx.translate(-safeArea / 2, -safeArea / 2);

  // Draw rotated image
  ctx.drawImage(
    image,
    safeArea / 2 - image.width * 0.5,
    safeArea / 2 - image.height * 0.5
  );

  // Get data from rotated image
  const data = ctx.getImageData(0, 0, safeArea, safeArea);

  // Set canvas size to final crop size
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  // Paste the rotated image with offset
  ctx.putImageData(
    data,
    Math.round(0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x),
    Math.round(0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y)
  );

  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          resolve(null);
          return;
        }
        resolve(URL.createObjectURL(blob));
      },
      "image/webp",
      0.9
    );
  });
}

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });
}

function getRadianAngle(degreeValue: number) {
  return (degreeValue * Math.PI) / 180;
}
