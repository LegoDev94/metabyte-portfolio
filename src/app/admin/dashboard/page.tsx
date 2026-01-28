"use client";

import { useEffect, useState } from "react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import {
  FolderKanban,
  MessageSquareQuote,
  Users,
  HelpCircle,
  Mail,
  Eye,
  MessageCircle,
  TrendingUp,
  Clock,
} from "lucide-react";

interface DashboardData {
  overview: {
    projectsCount: number;
    testimonialsCount: number;
    faqCount: number;
    teamCount: number;
    contactsCount: number;
    newContactsCount: number;
    visitorsCount: number;
    activeChatSessions: number;
  };
  recentContacts: Array<{
    id: string;
    name: string;
    email: string;
    subject: string | null;
    status: string;
    createdAt: string;
  }>;
  projectsByCategory: Array<{
    category: string;
    count: number;
  }>;
}

const statCards = [
  { key: "projectsCount", label: "Проекты", icon: FolderKanban, color: "text-blue-500", bg: "bg-blue-500/10" },
  { key: "testimonialsCount", label: "Отзывы", icon: MessageSquareQuote, color: "text-green-500", bg: "bg-green-500/10" },
  { key: "teamCount", label: "Команда", icon: Users, color: "text-purple-500", bg: "bg-purple-500/10" },
  { key: "faqCount", label: "FAQ", icon: HelpCircle, color: "text-yellow-500", bg: "bg-yellow-500/10" },
  { key: "contactsCount", label: "Заявки", icon: Mail, color: "text-red-500", bg: "bg-red-500/10" },
  { key: "visitorsCount", label: "Посетители", icon: Eye, color: "text-cyan-500", bg: "bg-cyan-500/10" },
  { key: "activeChatSessions", label: "Активные чаты", icon: MessageCircle, color: "text-primary", bg: "bg-primary/10" },
  { key: "newContactsCount", label: "Новые заявки", icon: TrendingUp, color: "text-orange-500", bg: "bg-orange-500/10" },
];

const categoryLabels: Record<string, string> = {
  games: "Игры",
  fintech: "Финтех",
  mobile: "Мобильные",
  enterprise: "Enterprise",
  automation: "Автоматизация",
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("7d");

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/admin/dashboard?range=${timeRange}`);
        if (response.ok) {
          const result = await response.json();
          setData(result);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [timeRange]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("ru-RU", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "NEW":
        return "bg-blue-500/10 text-blue-500";
      case "READ":
        return "bg-yellow-500/10 text-yellow-500";
      case "RESPONDED":
        return "bg-green-500/10 text-green-500";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "NEW":
        return "Новая";
      case "READ":
        return "Прочитана";
      case "RESPONDED":
        return "Отвечено";
      default:
        return status;
    }
  };

  return (
    <>
      <AdminHeader
        title="Дашборд"
        description="Обзор ключевых метрик и активности"
      />

      <div className="p-6 space-y-6">
        {/* Time range selector */}
        <div className="flex items-center gap-2">
          {["24h", "7d", "30d", "90d"].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                timeRange === range
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {range === "24h" ? "24 часа" : range === "7d" ? "7 дней" : range === "30d" ? "30 дней" : "90 дней"}
            </button>
          ))}
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            const value = data?.overview[stat.key as keyof DashboardData["overview"]] ?? 0;

            return (
              <div
                key={stat.key}
                className="bg-card border border-border rounded-xl p-4 hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-semibold mt-1">
                      {isLoading ? (
                        <span className="inline-block w-12 h-8 bg-muted animate-pulse rounded" />
                      ) : (
                        value
                      )}
                    </p>
                  </div>
                  <div className={`p-2 rounded-lg ${stat.bg}`}>
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent contacts */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Последние заявки</h2>
              <a
                href="/admin/contacts"
                className="text-sm text-primary hover:underline"
              >
                Все заявки
              </a>
            </div>

            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            ) : data?.recentContacts.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Нет заявок
              </p>
            ) : (
              <div className="space-y-3">
                {data?.recentContacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-foreground">{contact.name}</p>
                        <p className="text-sm text-muted-foreground">{contact.email}</p>
                      </div>
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(
                          contact.status
                        )}`}
                      >
                        {getStatusLabel(contact.status)}
                      </span>
                    </div>
                    {contact.subject && (
                      <p className="text-sm text-foreground mt-2 truncate">
                        {contact.subject}
                      </p>
                    )}
                    <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {formatDate(contact.createdAt)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Projects by category */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Проекты по категориям</h2>

            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-10 bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {data?.projectsByCategory.map((cat) => {
                  const total = data.overview.projectsCount || 1;
                  const percentage = Math.round((cat.count / total) * 100);

                  return (
                    <div key={cat.category}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">
                          {categoryLabels[cat.category] || cat.category}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {cat.count} ({percentage}%)
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Быстрые действия</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <a
              href="/admin/projects/new"
              className="flex flex-col items-center gap-2 p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors text-center"
            >
              <FolderKanban className="w-6 h-6 text-primary" />
              <span className="text-sm font-medium">Новый проект</span>
            </a>
            <a
              href="/admin/testimonials"
              className="flex flex-col items-center gap-2 p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors text-center"
            >
              <MessageSquareQuote className="w-6 h-6 text-primary" />
              <span className="text-sm font-medium">Добавить отзыв</span>
            </a>
            <a
              href="/admin/chats"
              className="flex flex-col items-center gap-2 p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors text-center"
            >
              <MessageCircle className="w-6 h-6 text-primary" />
              <span className="text-sm font-medium">AI Чаты</span>
            </a>
            <a
              href="/admin/settings"
              className="flex flex-col items-center gap-2 p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors text-center"
            >
              <TrendingUp className="w-6 h-6 text-primary" />
              <span className="text-sm font-medium">Настройки</span>
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
