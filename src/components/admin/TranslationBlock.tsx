"use client";

import { useState } from "react";
import { Languages, ArrowRightLeft, Loader2, Copy, Check } from "lucide-react";

type Locale = "ru" | "ro" | "en" | "auto";

const LOCALE_LABELS: Record<Locale, string> = {
  auto: "Авто",
  ru: "Русский",
  ro: "Română",
  en: "English",
};

export function TranslationBlock() {
  const [sourceText, setSourceText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [sourceLocale, setSourceLocale] = useState<Locale>("auto");
  const [targetLocale, setTargetLocale] = useState<Locale>("en");
  const [isTranslating, setIsTranslating] = useState(false);
  const [detectedLocale, setDetectedLocale] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  async function handleTranslate() {
    if (!sourceText.trim()) return;

    setIsTranslating(true);
    setDetectedLocale(null);

    try {
      const res = await fetch("/api/admin/ai/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: sourceText,
          sourceLocale,
          targetLocale,
        }),
      });

      if (!res.ok) throw new Error("Translation failed");

      const data = await res.json();
      setTranslatedText(data.translation);
      if (sourceLocale === "auto" && data.detectedLocale) {
        setDetectedLocale(data.detectedLocale);
      }
    } catch (error) {
      console.error("Translation error:", error);
      setTranslatedText("Ошибка перевода");
    } finally {
      setIsTranslating(false);
    }
  }

  function handleSwapLanguages() {
    if (sourceLocale === "auto") return;
    const temp = sourceLocale;
    setSourceLocale(targetLocale);
    setTargetLocale(temp);
    setSourceText(translatedText);
    setTranslatedText(sourceText);
  }

  async function handleCopy() {
    if (!translatedText) return;
    await navigator.clipboard.writeText(translatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden mb-6">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Languages className="w-5 h-5 text-primary" />
          <span className="font-medium">Быстрый переводчик</span>
        </div>
        <span className="text-xs text-muted-foreground">
          {isExpanded ? "Свернуть" : "Развернуть"}
        </span>
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="border-t border-border p-4 space-y-4">
          {/* Language selectors */}
          <div className="flex items-center gap-2">
            <select
              value={sourceLocale}
              onChange={(e) => setSourceLocale(e.target.value as Locale)}
              className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-sm"
            >
              {Object.entries(LOCALE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>

            <button
              onClick={handleSwapLanguages}
              disabled={sourceLocale === "auto"}
              className="p-2 hover:bg-muted rounded-lg transition-colors disabled:opacity-50"
              title="Поменять местами"
            >
              <ArrowRightLeft className="w-4 h-4" />
            </button>

            <select
              value={targetLocale}
              onChange={(e) => setTargetLocale(e.target.value as Locale)}
              className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-sm"
            >
              {Object.entries(LOCALE_LABELS)
                .filter(([value]) => value !== "auto")
                .map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
            </select>
          </div>

          {/* Source text */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs text-muted-foreground">
                Исходный текст
                {detectedLocale && (
                  <span className="ml-2 text-primary">
                    (определён: {LOCALE_LABELS[detectedLocale as Locale] || detectedLocale})
                  </span>
                )}
              </label>
              <span className="text-xs text-muted-foreground">
                {sourceText.length} символов
              </span>
            </div>
            <textarea
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              placeholder="Введите текст для перевода..."
              rows={4}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm resize-none"
            />
          </div>

          {/* Translate button */}
          <button
            onClick={handleTranslate}
            disabled={isTranslating || !sourceText.trim()}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors disabled:opacity-50"
          >
            {isTranslating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Переводим...
              </>
            ) : (
              <>
                <Languages className="w-4 h-4" />
                Перевести
              </>
            )}
          </button>

          {/* Translated text */}
          {translatedText && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs text-muted-foreground">Перевод</label>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-green-400" />
                      Скопировано
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      Копировать
                    </>
                  )}
                </button>
              </div>
              <textarea
                value={translatedText}
                readOnly
                rows={4}
                className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-sm resize-none"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
