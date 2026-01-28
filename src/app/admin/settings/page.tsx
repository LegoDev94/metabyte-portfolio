"use client";

import { useEffect, useState } from "react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Save, Globe, Settings, Mail, Send, Github, ExternalLink, User, Plus, X, Building } from "lucide-react";

interface SiteTranslation {
  locale: string;
  companyName: string;
  subtitle: string;
  badgeText: string;
  heroServices: string[];
  founderName: string;
  founderTitle: string;
  founderBioShort: string;
  founderBioLong?: string;
}

interface ContactTranslation {
  locale: string;
  responseTime: string;
}

interface SiteSettings {
  heroTechStack: string[];
  projectsCount: number;
  rating: number;
  countriesCount: number;
  founderPhoto: string;
  translations: SiteTranslation[];
}

interface ContactInfo {
  email: string;
  telegram: string;
  github: string;
  youdoUrl?: string;
  translations: ContactTranslation[];
}

const initialSiteTranslation = (locale: string): SiteTranslation => ({
  locale,
  companyName: "METABYTE",
  subtitle: "",
  badgeText: "",
  heroServices: [],
  founderName: "",
  founderTitle: "",
  founderBioShort: "",
  founderBioLong: "",
});

const initialContactTranslation = (locale: string): ContactTranslation => ({
  locale,
  responseTime: locale === "ru" ? "24 часа" : "24 ore",
});

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"site" | "contact">("site");
  const [activeLocale, setActiveLocale] = useState<"ru" | "ro">("ru");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [techInput, setTechInput] = useState("");
  const [serviceInput, setServiceInput] = useState("");

  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    heroTechStack: [],
    projectsCount: 17,
    rating: 4.9,
    countriesCount: 5,
    founderPhoto: "",
    translations: [initialSiteTranslation("ru"), initialSiteTranslation("ro")],
  });

  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    email: "",
    telegram: "",
    github: "",
    youdoUrl: "",
    translations: [initialContactTranslation("ru"), initialContactTranslation("ro")],
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/settings");
      if (response.ok) {
        const data = await response.json();
        if (data.siteSettings) {
          setSiteSettings({
            heroTechStack: data.siteSettings.heroTechStack || [],
            projectsCount: data.siteSettings.projectsCount || 17,
            rating: data.siteSettings.rating || 4.9,
            countriesCount: data.siteSettings.countriesCount || 5,
            founderPhoto: data.siteSettings.founderPhoto || "",
            translations: data.siteSettings.translations?.length > 0
              ? data.siteSettings.translations
              : [initialSiteTranslation("ru"), initialSiteTranslation("ro")],
          });
        }
        if (data.contactInfo) {
          setContactInfo({
            email: data.contactInfo.email || "",
            telegram: data.contactInfo.telegram || "",
            github: data.contactInfo.github || "",
            youdoUrl: data.contactInfo.youdoUrl || "",
            translations: data.contactInfo.translations?.length > 0
              ? data.contactInfo.translations
              : [initialContactTranslation("ru"), initialContactTranslation("ro")],
          });
        }
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSaveSite() {
    setIsSaving(true);
    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "site", ...siteSettings }),
      });
      if (response.ok) await fetchSettings();
    } catch (error) {
      console.error("Save error:", error);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSaveContact() {
    setIsSaving(true);
    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "contact", ...contactInfo }),
      });
      if (response.ok) await fetchSettings();
    } catch (error) {
      console.error("Save error:", error);
    } finally {
      setIsSaving(false);
    }
  }

  const getSiteTranslation = (locale: string) =>
    siteSettings.translations.find((t) => t.locale === locale) || initialSiteTranslation(locale);

  const updateSiteTranslation = (locale: string, field: keyof SiteTranslation, value: string | string[]) => {
    setSiteSettings((prev) => ({
      ...prev,
      translations: prev.translations.map((t) =>
        t.locale === locale ? { ...t, [field]: value } : t
      ),
    }));
  };

  const getContactTranslation = (locale: string) =>
    contactInfo.translations.find((t) => t.locale === locale) || initialContactTranslation(locale);

  const updateContactTranslation = (locale: string, field: keyof ContactTranslation, value: string) => {
    setContactInfo((prev) => ({
      ...prev,
      translations: prev.translations.map((t) =>
        t.locale === locale ? { ...t, [field]: value } : t
      ),
    }));
  };

  const addTech = () => {
    if (techInput.trim() && !siteSettings.heroTechStack.includes(techInput.trim())) {
      setSiteSettings((prev) => ({
        ...prev,
        heroTechStack: [...prev.heroTechStack, techInput.trim()],
      }));
      setTechInput("");
    }
  };

  const removeTech = (tech: string) => {
    setSiteSettings((prev) => ({
      ...prev,
      heroTechStack: prev.heroTechStack.filter((t) => t !== tech),
    }));
  };

  const addService = () => {
    if (serviceInput.trim()) {
      const current = getSiteTranslation(activeLocale);
      updateSiteTranslation(activeLocale, "heroServices", [...current.heroServices, serviceInput.trim()]);
      setServiceInput("");
    }
  };

  const removeService = (index: number) => {
    const current = getSiteTranslation(activeLocale);
    updateSiteTranslation(activeLocale, "heroServices", current.heroServices.filter((_, i) => i !== index));
  };

  const currentSiteTranslation = getSiteTranslation(activeLocale);
  const currentContactTranslation = getContactTranslation(activeLocale);

  if (isLoading) {
    return (
      <>
        <AdminHeader title="Настройки" description="Загрузка..." />
        <div className="p-6">
          <div className="h-96 bg-card border border-border rounded-xl animate-pulse" />
        </div>
      </>
    );
  }

  return (
    <>
      <AdminHeader title="Настройки" description="Настройки сайта и контактная информация" />
      <div className="p-6 space-y-6">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("site")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === "site"
                ? "bg-primary text-primary-foreground"
                : "bg-card border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            <Building className="w-4 h-4" />
            Сайт
          </button>
          <button
            onClick={() => setActiveTab("contact")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === "contact"
                ? "bg-primary text-primary-foreground"
                : "bg-card border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            <Mail className="w-4 h-4" />
            Контакты
          </button>
        </div>

        {activeTab === "site" && (
          <div className="bg-card border border-border rounded-xl p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Настройки сайта
              </h2>
              <button
                onClick={handleSaveSite}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {isSaving ? "Сохранение..." : "Сохранить"}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Кол-во проектов</label>
                <input
                  type="number"
                  value={siteSettings.projectsCount}
                  onChange={(e) => setSiteSettings({ ...siteSettings, projectsCount: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Рейтинг</label>
                <input
                  type="number"
                  step="0.1"
                  value={siteSettings.rating}
                  onChange={(e) => setSiteSettings({ ...siteSettings, rating: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Кол-во стран</label>
                <input
                  type="number"
                  value={siteSettings.countriesCount}
                  onChange={(e) => setSiteSettings({ ...siteSettings, countriesCount: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Фото основателя</label>
                <input
                  type="text"
                  value={siteSettings.founderPhoto}
                  onChange={(e) => setSiteSettings({ ...siteSettings, founderPhoto: e.target.value })}
                  placeholder="/images/founder.jpg"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Технологии в Hero</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={techInput}
                  onChange={(e) => setTechInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTech())}
                  placeholder="React, Next.js..."
                  className="flex-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button onClick={addTech} className="px-3 py-2 bg-muted hover:bg-muted/80 rounded-lg">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {siteSettings.heroTechStack.map((tech) => (
                  <span key={tech} className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded text-sm">
                    {tech}
                    <button onClick={() => removeTech(tech)} className="hover:text-red-500">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-4 border-t border-border">
              <Globe className="w-4 h-4 text-muted-foreground" />
              <div className="flex rounded-lg border border-border overflow-hidden">
                <button
                  type="button"
                  onClick={() => setActiveLocale("ru")}
                  className={`px-4 py-1.5 text-sm font-medium ${activeLocale === "ru" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground"}`}
                >
                  Русский
                </button>
                <button
                  type="button"
                  onClick={() => setActiveLocale("ro")}
                  className={`px-4 py-1.5 text-sm font-medium ${activeLocale === "ro" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground"}`}
                >
                  Română
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Название компании</label>
                <input type="text" value={currentSiteTranslation.companyName} onChange={(e) => updateSiteTranslation(activeLocale, "companyName", e.target.value)} className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Подзаголовок</label>
                <input type="text" value={currentSiteTranslation.subtitle} onChange={(e) => updateSiteTranslation(activeLocale, "subtitle", e.target.value)} className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Бейдж</label>
                <input type="text" value={currentSiteTranslation.badgeText} onChange={(e) => updateSiteTranslation(activeLocale, "badgeText", e.target.value)} className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border">
              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2"><User className="w-4 h-4" /> Имя основателя</label>
                <input type="text" value={currentSiteTranslation.founderName} onChange={(e) => updateSiteTranslation(activeLocale, "founderName", e.target.value)} className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Должность</label>
                <input type="text" value={currentSiteTranslation.founderTitle} onChange={(e) => updateSiteTranslation(activeLocale, "founderTitle", e.target.value)} className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Краткая биография</label>
              <textarea value={currentSiteTranslation.founderBioShort} onChange={(e) => updateSiteTranslation(activeLocale, "founderBioShort", e.target.value)} rows={3} className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Полная биография</label>
              <textarea value={currentSiteTranslation.founderBioLong || ""} onChange={(e) => updateSiteTranslation(activeLocale, "founderBioLong", e.target.value)} rows={5} className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Услуги в Hero</label>
              <div className="flex gap-2 mb-2">
                <input type="text" value={serviceInput} onChange={(e) => setServiceInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addService())} placeholder={activeLocale === "ru" ? "Веб-разработка" : "Dezvoltare web"} className="flex-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                <button onClick={addService} className="px-3 py-2 bg-muted hover:bg-muted/80 rounded-lg"><Plus className="w-4 h-4" /></button>
              </div>
              <div className="space-y-1">
                {currentSiteTranslation.heroServices.map((service, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                    <span className="flex-1 text-sm">{service}</span>
                    <button onClick={() => removeService(index)} className="text-muted-foreground hover:text-red-500"><X className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "contact" && (
          <div className="bg-card border border-border rounded-xl p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Контактная информация
              </h2>
              <button
                onClick={handleSaveContact}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {isSaving ? "Сохранение..." : "Сохранить"}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2"><Mail className="w-4 h-4" /> Email</label>
                <input type="email" value={contactInfo.email} onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })} placeholder="contact@metabyte.md" className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2"><Send className="w-4 h-4" /> Telegram</label>
                <input type="text" value={contactInfo.telegram} onChange={(e) => setContactInfo({ ...contactInfo, telegram: e.target.value })} placeholder="@metabyte" className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2"><Github className="w-4 h-4" /> GitHub</label>
                <input type="text" value={contactInfo.github} onChange={(e) => setContactInfo({ ...contactInfo, github: e.target.value })} placeholder="https://github.com/metabyte" className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2"><ExternalLink className="w-4 h-4" /> YouDo URL</label>
                <input type="text" value={contactInfo.youdoUrl || ""} onChange={(e) => setContactInfo({ ...contactInfo, youdoUrl: e.target.value })} placeholder="https://youdo.com/..." className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-4 border-t border-border">
              <Globe className="w-4 h-4 text-muted-foreground" />
              <div className="flex rounded-lg border border-border overflow-hidden">
                <button type="button" onClick={() => setActiveLocale("ru")} className={`px-4 py-1.5 text-sm font-medium ${activeLocale === "ru" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground"}`}>Русский</button>
                <button type="button" onClick={() => setActiveLocale("ro")} className={`px-4 py-1.5 text-sm font-medium ${activeLocale === "ro" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground"}`}>Română</button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Время ответа</label>
              <input type="text" value={currentContactTranslation.responseTime} onChange={(e) => updateContactTranslation(activeLocale, "responseTime", e.target.value)} placeholder={activeLocale === "ru" ? "24 часа" : "24 ore"} className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
