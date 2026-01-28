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
  User,
  Star,
  Github,
  Send,
  Linkedin,
} from "lucide-react";
import { MediaPicker } from "@/components/admin/MediaPicker";

interface TeamMemberTranslation {
  locale: string;
  name: string;
  role: string;
  description: string;
  bio?: string;
}

interface SocialLinks {
  github?: string;
  telegram?: string;
  linkedin?: string;
}

interface TeamMember {
  id: string;
  photo: string;
  skills: string[];
  isFounder: boolean;
  order: number;
  translations: TeamMemberTranslation[];
  socialLinks: SocialLinks | null;
}

const initialTranslation = (locale: string): TeamMemberTranslation => ({
  locale,
  name: "",
  role: "",
  description: "",
  bio: "",
});

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [activeLocale, setActiveLocale] = useState<"ru" | "ro">("ru");
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [skillInput, setSkillInput] = useState("");

  const [formData, setFormData] = useState<Omit<TeamMember, "id">>({
    photo: "/images/team/placeholder.jpg",
    skills: [],
    isFounder: false,
    order: 0,
    translations: [initialTranslation("ru"), initialTranslation("ro")],
    socialLinks: null,
  });

  useEffect(() => {
    fetchMembers();
  }, []);

  async function fetchMembers() {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/team");
      if (response.ok) {
        const data = await response.json();
        setMembers(data.members);
      }
    } catch (error) {
      console.error("Failed to fetch team members:", error);
    } finally {
      setIsLoading(false);
    }
  }

  function startEditing(member: TeamMember) {
    // Clean up socialLinks - remove DB fields (id, memberId)
    const cleanSocialLinks = member.socialLinks ? {
      github: member.socialLinks.github || undefined,
      telegram: member.socialLinks.telegram || undefined,
      linkedin: member.socialLinks.linkedin || undefined,
    } : null;

    // Clean up translations - keep only required fields
    const cleanTranslations = member.translations.length > 0
      ? member.translations.map(t => ({
          locale: t.locale,
          name: t.name,
          role: t.role,
          description: t.description,
          bio: t.bio || "",
        }))
      : [initialTranslation("ru"), initialTranslation("ro")];

    setFormData({
      photo: member.photo || "/images/team/placeholder.jpg",
      skills: member.skills || [],
      isFounder: member.isFounder,
      order: member.order,
      translations: cleanTranslations,
      socialLinks: cleanSocialLinks,
    });
    setEditingId(member.id);
    setIsCreating(false);
  }

  function startCreating() {
    setFormData({
      photo: "/images/team/placeholder.jpg",
      skills: [],
      isFounder: false,
      order: members.length,
      translations: [initialTranslation("ru"), initialTranslation("ro")],
      socialLinks: null,
    });
    setIsCreating(true);
    setEditingId(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setIsCreating(false);
    setSkillInput("");
  }

  async function handleSave() {
    setIsSaving(true);
    try {
      const url = "/api/admin/team";
      const method = isCreating ? "POST" : "PUT";

      // Clean up data before sending
      const cleanedSocialLinks = formData.socialLinks && (
        formData.socialLinks.github ||
        formData.socialLinks.telegram ||
        formData.socialLinks.linkedin
      ) ? {
        github: formData.socialLinks.github || undefined,
        telegram: formData.socialLinks.telegram || undefined,
        linkedin: formData.socialLinks.linkedin || undefined,
      } : undefined;

      const cleanedData = {
        photo: formData.photo || "/images/team/placeholder.jpg",
        skills: formData.skills || [],
        isFounder: formData.isFounder,
        order: formData.order,
        translations: formData.translations.map(t => ({
          locale: t.locale,
          name: t.name,
          role: t.role,
          description: t.description,
          bio: t.bio || undefined,
        })),
        socialLinks: cleanedSocialLinks,
      };

      const body = isCreating ? cleanedData : { id: editingId, ...cleanedData };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        await fetchMembers();
        cancelEdit();
      } else {
        const errorData = await response.json();
        console.error("Save error response:", errorData);
      }
    } catch (error) {
      console.error("Save error:", error);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      const response = await fetch(`/api/admin/team?id=${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setMembers(members.filter((m) => m.id !== id));
        setDeleteConfirm(null);
      }
    } catch (error) {
      console.error("Delete error:", error);
    }
  }

  const getTranslation = (locale: string) => {
    return formData.translations.find((t) => t.locale === locale) || initialTranslation(locale);
  };

  const updateTranslation = (locale: string, field: keyof TeamMemberTranslation, value: string) => {
    setFormData((prev) => ({
      ...prev,
      translations: prev.translations.map((t) =>
        t.locale === locale ? { ...t, [field]: value } : t
      ),
    }));
  };

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()],
      }));
      setSkillInput("");
    }
  };

  const removeSkill = (skill: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skill),
    }));
  };

  const updateSocialLinks = (field: keyof SocialLinks, value: string) => {
    setFormData((prev) => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [field]: value || undefined,
      },
    }));
  };

  const currentTranslation = getTranslation(activeLocale);

  return (
    <>
      <AdminHeader
        title="Команда"
        description="Управление участниками команды"
      />

      <div className="p-6 space-y-6">
        {/* Add button */}
        {!isCreating && !editingId && (
          <button
            onClick={startCreating}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Добавить участника
          </button>
        )}

        {/* Edit/Create form */}
        {(isCreating || editingId) && (
          <div className="bg-card border border-border rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {isCreating ? "Новый участник" : "Редактирование"}
              </h2>
              <button
                onClick={cancelEdit}
                className="p-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <MediaPicker
                label="Фото"
                value={formData.photo}
                onChange={(url) => setFormData({ ...formData, photo: (url && url.trim()) ? url.trim() : "/images/team/placeholder.jpg" })}
                placeholder="Выбрать фото"
                aspectRatio={1}
                cropShape="round"
              />

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
                id="isFounder"
                checked={formData.isFounder}
                onChange={(e) => setFormData({ ...formData, isFounder: e.target.checked })}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
              />
              <label htmlFor="isFounder" className="text-sm flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500" />
                Основатель
              </label>
            </div>

            {/* Skills */}
            <div>
              <label className="block text-sm font-medium mb-2">Навыки</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                  placeholder="React, Node.js..."
                  className="flex-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  type="button"
                  onClick={addSkill}
                  className="px-3 py-2 bg-muted hover:bg-muted/80 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded text-sm"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Social links */}
            <div>
              <label className="block text-sm font-medium mb-2">Социальные сети</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="flex items-center gap-2">
                  <Github className="w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={formData.socialLinks?.github || ""}
                    onChange={(e) => updateSocialLinks("github", e.target.value)}
                    placeholder="GitHub URL"
                    className="flex-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Send className="w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={formData.socialLinks?.telegram || ""}
                    onChange={(e) => updateSocialLinks("telegram", e.target.value)}
                    placeholder="Telegram @username"
                    className="flex-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Linkedin className="w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={formData.socialLinks?.linkedin || ""}
                    onChange={(e) => updateSocialLinks("linkedin", e.target.value)}
                    placeholder="LinkedIn URL"
                    className="flex-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  />
                </div>
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
                <label className="block text-sm font-medium mb-2">Имя</label>
                <input
                  type="text"
                  value={currentTranslation.name}
                  onChange={(e) => updateTranslation(activeLocale, "name", e.target.value)}
                  placeholder={activeLocale === "ru" ? "Иван Иванов" : "Ion Ionescu"}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Должность</label>
                <input
                  type="text"
                  value={currentTranslation.role}
                  onChange={(e) => updateTranslation(activeLocale, "role", e.target.value)}
                  placeholder={activeLocale === "ru" ? "Full-Stack Developer" : "Dezvoltator Full-Stack"}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Краткое описание</label>
              <textarea
                value={currentTranslation.description}
                onChange={(e) => updateTranslation(activeLocale, "description", e.target.value)}
                placeholder={activeLocale === "ru" ? "Описание специалиста..." : "Descrierea specialistului..."}
                rows={3}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Биография (необязательно)</label>
              <textarea
                value={currentTranslation.bio || ""}
                onChange={(e) => updateTranslation(activeLocale, "bio", e.target.value)}
                placeholder={activeLocale === "ru" ? "Подробная биография..." : "Biografie detaliată..."}
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

        {/* Team list */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {isLoading ? (
            <div className="p-8 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : members.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
              Нет участников команды
            </div>
          ) : (
            <div className="divide-y divide-border">
              {members.map((member) => {
                const ruTranslation = member.translations.find((t) => t.locale === "ru");

                return (
                  <div
                    key={member.id}
                    className={`p-4 hover:bg-muted/50 transition-colors ${
                      editingId === member.id ? "bg-muted/50" : ""
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-muted flex-shrink-0">
                        <img
                          src={member.photo}
                          alt={ruTranslation?.name || ""}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{ruTranslation?.name || "Без имени"}</span>
                          {member.isFounder && (
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {ruTranslation?.role}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {member.skills.slice(0, 4).map((skill) => (
                            <span
                              key={skill}
                              className="px-1.5 py-0.5 text-xs bg-muted rounded"
                            >
                              {skill}
                            </span>
                          ))}
                          {member.skills.length > 4 && (
                            <span className="text-xs text-muted-foreground">
                              +{member.skills.length - 4}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => startEditing(member)}
                          className="p-2 text-muted-foreground hover:text-primary transition-colors"
                          title="Редактировать"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {deleteConfirm === member.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDelete(member.id)}
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
                            onClick={() => setDeleteConfirm(member.id)}
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
          Всего участников: {members.length} | Основателей: {members.filter((m) => m.isFounder).length}
        </div>
      </div>
    </>
  );
}
