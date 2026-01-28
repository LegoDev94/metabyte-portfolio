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
  Star,
  DollarSign,
  Check,
  Minus,
  Sparkles,
  Loader2,
} from "lucide-react";

interface PricingTranslation {
  locale: string;
  name: string;
  description: string;
  features: string[];
  notIncluded: string[];
}

interface PricingPackage {
  id: string;
  price: string;
  icon: string;
  color: string;
  popular: boolean;
  order: number;
  translations: PricingTranslation[];
}

interface ServiceTranslation {
  locale: string;
  name: string;
  description: string;
}

interface AdditionalService {
  id: string;
  price: string;
  order: number;
  translations: ServiceTranslation[];
}

const initialTranslation = (locale: string): PricingTranslation => ({
  locale,
  name: "",
  description: "",
  features: [],
  notIncluded: [],
});

const initialServiceTranslation = (locale: string): ServiceTranslation => ({
  locale,
  name: "",
  description: "",
});

export default function PricingPage() {
  const [packages, setPackages] = useState<PricingPackage[]>([]);
  const [services, setServices] = useState<AdditionalService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isCreatingService, setIsCreatingService] = useState(false);
  const [activeLocale, setActiveLocale] = useState<"ru" | "ro">("ru");
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [featureInput, setFeatureInput] = useState("");
  const [notIncludedInput, setNotIncludedInput] = useState("");
  const [activeTab, setActiveTab] = useState<"packages" | "services">("packages");
  const [isGenerating, setIsGenerating] = useState(false);

  const [formData, setFormData] = useState<Omit<PricingPackage, "id">>({
    price: "",
    icon: "package",
    color: "#00ffff",
    popular: false,
    order: 0,
    translations: [initialTranslation("ru"), initialTranslation("ro")],
  });

  const [serviceFormData, setServiceFormData] = useState<Omit<AdditionalService, "id">>({
    price: "",
    order: 0,
    translations: [initialServiceTranslation("ru"), initialServiceTranslation("ro")],
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setIsLoading(true);
    try {
      const [packagesRes, servicesRes] = await Promise.all([
        fetch("/api/admin/pricing"),
        fetch("/api/admin/pricing/services"),
      ]);
      if (packagesRes.ok) {
        const data = await packagesRes.json();
        setPackages(data.packages);
      }
      if (servicesRes.ok) {
        const data = await servicesRes.json();
        setServices(data.services);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setIsLoading(false);
    }
  }

  // Package functions
  function startEditing(pkg: PricingPackage) {
    setFormData({
      price: pkg.price,
      icon: pkg.icon,
      color: pkg.color,
      popular: pkg.popular,
      order: pkg.order,
      translations: pkg.translations.length > 0
        ? pkg.translations
        : [initialTranslation("ru"), initialTranslation("ro")],
    });
    setEditingId(pkg.id);
    setIsCreating(false);
  }

  function startCreating() {
    setFormData({
      price: "",
      icon: "package",
      color: "#00ffff",
      popular: false,
      order: packages.length,
      translations: [initialTranslation("ru"), initialTranslation("ro")],
    });
    setIsCreating(true);
    setEditingId(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setIsCreating(false);
    setFeatureInput("");
    setNotIncludedInput("");
  }

  async function handleSave() {
    setIsSaving(true);
    try {
      const url = "/api/admin/pricing";
      const method = isCreating ? "POST" : "PUT";
      const body = isCreating ? formData : { id: editingId, ...formData };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        await fetchData();
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
      const response = await fetch(`/api/admin/pricing?id=${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setPackages(packages.filter((p) => p.id !== id));
        setDeleteConfirm(null);
      }
    } catch (error) {
      console.error("Delete error:", error);
    }
  }

  const getTranslation = (locale: string) => {
    return formData.translations.find((t) => t.locale === locale) || initialTranslation(locale);
  };

  const updateTranslation = (locale: string, field: keyof PricingTranslation, value: string | string[]) => {
    setFormData((prev) => ({
      ...prev,
      translations: prev.translations.map((t) =>
        t.locale === locale ? { ...t, [field]: value } : t
      ),
    }));
  };

  const addFeature = () => {
    if (featureInput.trim()) {
      const current = getTranslation(activeLocale);
      updateTranslation(activeLocale, "features", [...current.features, featureInput.trim()]);
      setFeatureInput("");
    }
  };

  const removeFeature = (index: number) => {
    const current = getTranslation(activeLocale);
    updateTranslation(activeLocale, "features", current.features.filter((_, i) => i !== index));
  };

  const addNotIncluded = () => {
    if (notIncludedInput.trim()) {
      const current = getTranslation(activeLocale);
      updateTranslation(activeLocale, "notIncluded", [...current.notIncluded, notIncludedInput.trim()]);
      setNotIncludedInput("");
    }
  };

  const removeNotIncluded = (index: number) => {
    const current = getTranslation(activeLocale);
    updateTranslation(activeLocale, "notIncluded", current.notIncluded.filter((_, i) => i !== index));
  };

  // Service functions
  function startEditingService(service: AdditionalService) {
    setServiceFormData({
      price: service.price,
      order: service.order,
      translations: service.translations.length > 0
        ? service.translations
        : [initialServiceTranslation("ru"), initialServiceTranslation("ro")],
    });
    setEditingServiceId(service.id);
    setIsCreatingService(false);
  }

  function startCreatingService() {
    setServiceFormData({
      price: "",
      order: services.length,
      translations: [initialServiceTranslation("ru"), initialServiceTranslation("ro")],
    });
    setIsCreatingService(true);
    setEditingServiceId(null);
  }

  function cancelServiceEdit() {
    setEditingServiceId(null);
    setIsCreatingService(false);
  }

  async function handleServiceSave() {
    setIsSaving(true);
    try {
      const url = "/api/admin/pricing/services";
      const method = isCreatingService ? "POST" : "PUT";
      const body = isCreatingService ? serviceFormData : { id: editingServiceId, ...serviceFormData };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        await fetchData();
        cancelServiceEdit();
      }
    } catch (error) {
      console.error("Save error:", error);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleServiceDelete(id: string) {
    try {
      const response = await fetch(`/api/admin/pricing/services?id=${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setServices(services.filter((s) => s.id !== id));
        setDeleteConfirm(null);
      }
    } catch (error) {
      console.error("Delete error:", error);
    }
  }

  const getServiceTranslation = (locale: string) => {
    return serviceFormData.translations.find((t) => t.locale === locale) || initialServiceTranslation(locale);
  };

  const updateServiceTranslation = (locale: string, field: keyof ServiceTranslation, value: string) => {
    setServiceFormData((prev) => ({
      ...prev,
      translations: prev.translations.map((t) =>
        t.locale === locale ? { ...t, [field]: value } : t
      ),
    }));
  };

  async function generateServiceDescription() {
    const currentTrans = getServiceTranslation(activeLocale);
    if (!currentTrans.name) return;

    setIsGenerating(true);
    try {
      const response = await fetch("/api/admin/ai/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: `Напиши короткое описание (до 50 символов) для услуги "${currentTrans.name}" в контексте веб-разработки.`,
          targetLocale: activeLocale,
          sourceLocale: "ru",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.result) {
          updateServiceTranslation(activeLocale, "description", data.result);
        }
      }
    } catch (error) {
      console.error("AI generation error:", error);
    } finally {
      setIsGenerating(false);
    }
  }

  const currentTranslation = getTranslation(activeLocale);
  const currentServiceTranslation = getServiceTranslation(activeLocale);

  return (
    <>
      <AdminHeader
        title="Ценообразование"
        description="Управление тарифами и дополнительными услугами"
      />

      <div className="p-6 space-y-6">
        {/* Tabs */}
        <div className="flex gap-2 border-b border-border pb-4">
          <button
            onClick={() => setActiveTab("packages")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === "packages"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            <DollarSign className="w-4 h-4 inline mr-2" />
            Тарифы ({packages.length})
          </button>
          <button
            onClick={() => setActiveTab("services")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === "services"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            <Plus className="w-4 h-4 inline mr-2" />
            Доп. услуги ({services.length})
          </button>
        </div>

        {/* Packages Tab */}
        {activeTab === "packages" && (
          <>
            {!isCreating && !editingId && (
              <button
                onClick={startCreating}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Добавить тариф
              </button>
            )}

            {(isCreating || editingId) && (
              <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">
                    {isCreating ? "Новый тариф" : "Редактирование тарифа"}
                  </h2>
                  <button onClick={cancelEdit} className="p-2 text-muted-foreground hover:text-foreground">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Цена</label>
                    <input type="text" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} placeholder="от $500" className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Иконка</label>
                    <input type="text" value={formData.icon} onChange={(e) => setFormData({ ...formData, icon: e.target.value })} placeholder="package" className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Цвет</label>
                    <div className="flex gap-2">
                      <input type="color" value={formData.color} onChange={(e) => setFormData({ ...formData, color: e.target.value })} className="w-12 h-10 rounded cursor-pointer" />
                      <input type="text" value={formData.color} onChange={(e) => setFormData({ ...formData, color: e.target.value })} className="flex-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Порядок</label>
                    <input type="number" value={formData.order} onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input type="checkbox" id="popular" checked={formData.popular} onChange={(e) => setFormData({ ...formData, popular: e.target.checked })} className="w-4 h-4 rounded" />
                  <label htmlFor="popular" className="text-sm flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-500" /> Популярный
                  </label>
                </div>

                <div className="flex items-center gap-2 pt-4 border-t border-border">
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  <div className="flex rounded-lg border border-border overflow-hidden">
                    <button type="button" onClick={() => setActiveLocale("ru")} className={`px-4 py-1.5 text-sm font-medium ${activeLocale === "ru" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground"}`}>Русский</button>
                    <button type="button" onClick={() => setActiveLocale("ro")} className={`px-4 py-1.5 text-sm font-medium ${activeLocale === "ro" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground"}`}>Română</button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Название</label>
                    <input type="text" value={currentTranslation.name} onChange={(e) => updateTranslation(activeLocale, "name", e.target.value)} placeholder={activeLocale === "ru" ? "Стартовый" : "Start"} className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Описание</label>
                    <input type="text" value={currentTranslation.description} onChange={(e) => updateTranslation(activeLocale, "description", e.target.value)} placeholder={activeLocale === "ru" ? "Для небольших проектов" : "Pentru proiecte mici"} className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> Включено</label>
                  <div className="flex gap-2 mb-2">
                    <input type="text" value={featureInput} onChange={(e) => setFeatureInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addFeature())} placeholder={activeLocale === "ru" ? "Адаптивный дизайн" : "Design responsive"} className="flex-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                    <button type="button" onClick={addFeature} className="px-3 py-2 bg-muted hover:bg-muted/80 rounded-lg"><Plus className="w-4 h-4" /></button>
                  </div>
                  <div className="space-y-1">
                    {currentTranslation.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-green-500/10 rounded">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span className="flex-1 text-sm">{feature}</span>
                        <button type="button" onClick={() => removeFeature(index)} className="text-muted-foreground hover:text-red-500"><X className="w-4 h-4" /></button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center gap-2"><Minus className="w-4 h-4 text-muted-foreground" /> Не включено</label>
                  <div className="flex gap-2 mb-2">
                    <input type="text" value={notIncludedInput} onChange={(e) => setNotIncludedInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addNotIncluded())} placeholder={activeLocale === "ru" ? "SEO оптимизация" : "Optimizare SEO"} className="flex-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                    <button type="button" onClick={addNotIncluded} className="px-3 py-2 bg-muted hover:bg-muted/80 rounded-lg"><Plus className="w-4 h-4" /></button>
                  </div>
                  <div className="space-y-1">
                    {currentTranslation.notIncluded.map((item, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                        <Minus className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <span className="flex-1 text-sm text-muted-foreground">{item}</span>
                        <button type="button" onClick={() => removeNotIncluded(index)} className="text-muted-foreground hover:text-red-500"><X className="w-4 h-4" /></button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <button onClick={cancelEdit} className="px-4 py-2 text-muted-foreground hover:text-foreground">Отмена</button>
                  <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50">
                    <Save className="w-4 h-4" />{isSaving ? "Сохранение..." : "Сохранить"}
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {isLoading ? (
                [1, 2, 3].map((i) => <div key={i} className="h-64 bg-card border border-border rounded-xl animate-pulse" />)
              ) : packages.length === 0 ? (
                <div className="col-span-full p-12 text-center text-muted-foreground bg-card border border-border rounded-xl">
                  <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />Нет тарифов
                </div>
              ) : (
                packages.map((pkg) => {
                  const ruTranslation = pkg.translations.find((t) => t.locale === "ru");
                  return (
                    <div key={pkg.id} className={`relative bg-card border rounded-xl p-6 ${pkg.popular ? "border-primary" : "border-border"} ${editingId === pkg.id ? "ring-2 ring-primary" : ""}`}>
                      {pkg.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full">Популярный</div>}
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">{ruTranslation?.name || "Без названия"}</h3>
                          <p className="text-sm text-muted-foreground">{ruTranslation?.description}</p>
                        </div>
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${pkg.color}20`, color: pkg.color }}><DollarSign className="w-4 h-4" /></div>
                      </div>
                      <div className="text-2xl font-bold mb-4" style={{ color: pkg.color }}>{pkg.price}</div>
                      <div className="space-y-2 mb-4">
                        {ruTranslation?.features.slice(0, 3).map((feature, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm"><Check className="w-4 h-4 text-green-500" /><span>{feature}</span></div>
                        ))}
                        {(ruTranslation?.features.length || 0) > 3 && <div className="text-xs text-muted-foreground">+{(ruTranslation?.features.length || 0) - 3} еще</div>}
                      </div>
                      <div className="flex items-center gap-2 pt-4 border-t border-border">
                        <button onClick={() => startEditing(pkg)} className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm bg-muted hover:bg-muted/80 rounded-lg"><Edit className="w-4 h-4" />Редактировать</button>
                        {deleteConfirm === pkg.id ? (
                          <div className="flex items-center gap-1">
                            <button onClick={() => handleDelete(pkg.id)} className="px-2 py-2 text-xs bg-red-500 text-white rounded hover:bg-red-600">Удалить</button>
                            <button onClick={() => setDeleteConfirm(null)} className="px-2 py-2 text-xs bg-muted rounded">Отмена</button>
                          </div>
                        ) : (
                          <button onClick={() => setDeleteConfirm(pkg.id)} className="p-2 text-muted-foreground hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}

        {/* Services Tab */}
        {activeTab === "services" && (
          <>
            {!isCreatingService && !editingServiceId && (
              <button
                onClick={startCreatingService}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Добавить услугу
              </button>
            )}

            {(isCreatingService || editingServiceId) && (
              <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">
                    {isCreatingService ? "Новая услуга" : "Редактирование услуги"}
                  </h2>
                  <button onClick={cancelServiceEdit} className="p-2 text-muted-foreground hover:text-foreground">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Цена</label>
                    <input
                      type="text"
                      value={serviceFormData.price}
                      onChange={(e) => setServiceFormData({ ...serviceFormData, price: e.target.value })}
                      placeholder="от 30 000 ₽"
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Порядок</label>
                    <input
                      type="number"
                      value={serviceFormData.order}
                      onChange={(e) => setServiceFormData({ ...serviceFormData, order: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-4 border-t border-border">
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  <div className="flex rounded-lg border border-border overflow-hidden">
                    <button type="button" onClick={() => setActiveLocale("ru")} className={`px-4 py-1.5 text-sm font-medium ${activeLocale === "ru" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground"}`}>Русский</button>
                    <button type="button" onClick={() => setActiveLocale("ro")} className={`px-4 py-1.5 text-sm font-medium ${activeLocale === "ro" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground"}`}>Română</button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Название</label>
                    <input
                      type="text"
                      value={currentServiceTranslation.name}
                      onChange={(e) => updateServiceTranslation(activeLocale, "name", e.target.value)}
                      placeholder={activeLocale === "ru" ? "Telegram Bot" : "Bot Telegram"}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Описание</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={currentServiceTranslation.description}
                        onChange={(e) => updateServiceTranslation(activeLocale, "description", e.target.value)}
                        placeholder={activeLocale === "ru" ? "Бот с любым функционалом" : "Bot cu orice funcționalitate"}
                        className="flex-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <button
                        type="button"
                        onClick={generateServiceDescription}
                        disabled={isGenerating || !currentServiceTranslation.name}
                        className="px-3 py-2 bg-accent/20 text-accent hover:bg-accent/30 rounded-lg disabled:opacity-50 transition-colors"
                        title="Сгенерировать с AI"
                      >
                        {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <button onClick={cancelServiceEdit} className="px-4 py-2 text-muted-foreground hover:text-foreground">Отмена</button>
                  <button onClick={handleServiceSave} disabled={isSaving} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50">
                    <Save className="w-4 h-4" />{isSaving ? "Сохранение..." : "Сохранить"}
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {isLoading ? (
                [1, 2, 3].map((i) => <div key={i} className="h-32 bg-card border border-border rounded-xl animate-pulse" />)
              ) : services.length === 0 ? (
                <div className="col-span-full p-12 text-center text-muted-foreground bg-card border border-border rounded-xl">
                  <Plus className="w-12 h-12 mx-auto mb-4 opacity-50" />Нет дополнительных услуг
                </div>
              ) : (
                services.map((service) => {
                  const ruTranslation = service.translations.find((t) => t.locale === "ru");
                  return (
                    <div key={service.id} className={`bg-card border border-border rounded-xl p-4 ${editingServiceId === service.id ? "ring-2 ring-primary" : ""}`}>
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold">{ruTranslation?.name || "Без названия"}</h3>
                          <p className="text-sm text-muted-foreground">{ruTranslation?.description || "Нет описания"}</p>
                        </div>
                        <span className="text-primary font-semibold text-sm whitespace-nowrap ml-2">{service.price}</span>
                      </div>
                      <div className="flex items-center gap-2 pt-3 border-t border-border">
                        <button onClick={() => startEditingService(service)} className="flex-1 flex items-center justify-center gap-2 px-3 py-1.5 text-sm bg-muted hover:bg-muted/80 rounded-lg">
                          <Edit className="w-4 h-4" />Редактировать
                        </button>
                        {deleteConfirm === service.id ? (
                          <div className="flex items-center gap-1">
                            <button onClick={() => handleServiceDelete(service.id)} className="px-2 py-1.5 text-xs bg-red-500 text-white rounded hover:bg-red-600">Удалить</button>
                            <button onClick={() => setDeleteConfirm(null)} className="px-2 py-1.5 text-xs bg-muted rounded">Отмена</button>
                          </div>
                        ) : (
                          <button onClick={() => setDeleteConfirm(service.id)} className="p-1.5 text-muted-foreground hover:text-red-500">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}

        <div className="text-sm text-muted-foreground">
          Всего тарифов: {packages.length} | Доп. услуг: {services.length}
        </div>
      </div>
    </>
  );
}
