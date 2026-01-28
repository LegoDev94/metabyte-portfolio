"use client";

import { useEffect, useState, useCallback } from "react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { TranslationBlock } from "@/components/admin/TranslationBlock";
import {
  MessageCircle,
  Radio,
  User,
  MapPin,
  Clock,
  ExternalLink,
  Shield,
  Bot,
} from "lucide-react";
import Link from "next/link";

interface ChatSession {
  id: string;
  sessionToken: string;
  status: "ACTIVE" | "ADMIN_ACTIVE" | "ENDED" | "ABANDONED";
  currentPage: string | null;
  locale: string;
  isAdminTakeover: boolean;
  startedAt: string;
  lastActivityAt: string;
  visitor: {
    id: string;
    visitorId: string;
    city: string | null;
    country: string | null;
    contact: {
      name: string;
      contact: string;
    } | null;
  };
  messages: Array<{
    id: string;
    role: string;
    content: string;
    createdAt: string;
  }>;
  _count: {
    messages: number;
  };
}

export default function ChatsPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"active" | "all">("active");

  const fetchSessions = useCallback(async () => {
    try {
      const url = activeTab === "active"
        ? "/api/admin/chats?active=true"
        : "/api/admin/chats?limit=50";
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setSessions(data.sessions);
      }
    } catch (error) {
      console.error("Error fetching sessions:", error);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchSessions();

    // Set up SSE connection for real-time updates
    const eventSource = new EventSource("/api/admin/chats/sse");

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "session_started" || data.type === "new_message") {
        // Refresh sessions list
        fetchSessions();
      }
    };

    eventSource.onerror = () => {
      console.error("SSE connection error");
    };

    return () => {
      eventSource.close();
    };
  }, [fetchSessions]);

  const getStatusBadge = (session: ChatSession) => {
    if (session.isAdminTakeover) {
      return {
        icon: Shield,
        color: "bg-blue-500/10 text-blue-500",
        label: "Админ",
      };
    }
    switch (session.status) {
      case "ACTIVE":
        return {
          icon: Bot,
          color: "bg-green-500/10 text-green-500",
          label: "AI активен",
        };
      case "ADMIN_ACTIVE":
        return {
          icon: Shield,
          color: "bg-blue-500/10 text-blue-500",
          label: "Админ активен",
        };
      case "ENDED":
        return {
          icon: MessageCircle,
          color: "bg-muted text-muted-foreground",
          label: "Завершён",
        };
      case "ABANDONED":
        return {
          icon: Clock,
          color: "bg-yellow-500/10 text-yellow-500",
          label: "Заброшен",
        };
      default:
        return {
          icon: MessageCircle,
          color: "bg-muted text-muted-foreground",
          label: session.status,
        };
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "только что";
    if (diffMins < 60) return `${diffMins} мин. назад`;
    if (diffHours < 24) return `${diffHours} ч. назад`;
    if (diffDays < 7) return `${diffDays} дн. назад`;

    return date.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "short",
    });
  };

  const getLastMessage = (session: ChatSession) => {
    if (session.messages.length === 0) return "Нет сообщений";
    const msg = session.messages[0];
    const prefix =
      msg.role === "USER"
        ? "Клиент: "
        : msg.role === "ADMIN"
          ? "Админ: "
          : "AI: ";
    return prefix + msg.content.slice(0, 60) + (msg.content.length > 60 ? "..." : "");
  };

  return (
    <>
      <AdminHeader
        title="AI Чаты"
        description="Мониторинг и управление AI чатами в реальном времени"
      />
      <div className="p-6 space-y-6">
        {/* Quick Translation Tool */}
        <TranslationBlock />
        {/* Live indicator */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <Radio className="w-4 h-4 text-green-500 animate-pulse" />
            <span className="text-muted-foreground">
              Активных чатов:{" "}
              {sessions.filter((s) => s.status === "ACTIVE" || s.status === "ADMIN_ACTIVE").length}
            </span>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-muted rounded-lg p-1">
            <button
              onClick={() => setActiveTab("active")}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                activeTab === "active"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Активные
            </button>
            <button
              onClick={() => setActiveTab("all")}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                activeTab === "all"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Все
            </button>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {isLoading ? (
            <div className="p-8 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : sessions.length === 0 ? (
            <div className="p-12 text-center">
              <MessageCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {activeTab === "active"
                  ? "Нет активных чатов"
                  : "Нет чатов"}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Чаты будут появляться когда посетители начнут общаться с AI
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {sessions.map((session) => {
                const status = getStatusBadge(session);
                const StatusIcon = status.icon;

                return (
                  <Link
                    key={session.id}
                    href={`/admin/chats/${session.id}`}
                    className="block p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">
                            {session.visitor.contact?.name ||
                              `Посетитель ${session.visitor.visitorId.slice(0, 8)}`}
                          </span>
                          <span
                            className={`flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${status.color}`}
                          >
                            <StatusIcon className="w-3 h-3" />
                            {status.label}
                          </span>
                          {session.visitor.contact && (
                            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-green-500/10 text-green-500">
                              Контакт собран
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                          {session.visitor.city && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {session.visitor.city}
                              {session.visitor.country && `, ${session.visitor.country}`}
                            </span>
                          )}
                          {session.currentPage && (
                            <span className="flex items-center gap-1">
                              <ExternalLink className="w-3 h-3" />
                              {session.currentPage}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <MessageCircle className="w-3 h-3" />
                            {session._count.messages} сообщений
                          </span>
                        </div>

                        <p className="text-sm line-clamp-1 text-muted-foreground">
                          {getLastMessage(session)}
                        </p>
                      </div>

                      <div className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
                        <Clock className="w-3 h-3" />
                        {formatTime(session.lastActivityAt)}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
