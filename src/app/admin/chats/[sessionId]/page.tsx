"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { AdminHeader } from "@/components/admin/AdminHeader";
import {
  ArrowLeft,
  Send,
  User,
  Bot,
  Shield,
  MapPin,
  Clock,
  ExternalLink,
  Phone,
  AtSign,
  Eye,
  Info,
  Languages,
  Loader2,
  Copy,
  Check,
  ArrowRightLeft,
} from "lucide-react";
import Link from "next/link";

interface Message {
  id: string;
  role: "USER" | "ASSISTANT" | "ADMIN" | "SYSTEM";
  content: string;
  createdAt: string;
}

interface PageView {
  id: string;
  path: string;
  createdAt: string;
  duration: number | null;
}

interface ChatSession {
  id: string;
  sessionToken: string;
  status: "ACTIVE" | "ADMIN_ACTIVE" | "ENDED" | "ABANDONED";
  currentPage: string | null;
  locale: string;
  isAdminTakeover: boolean;
  adminTakeoverBy: string | null;
  startedAt: string;
  lastActivityAt: string;
  visitor: {
    id: string;
    visitorId: string;
    city: string | null;
    country: string | null;
    firstVisitAt: string;
    totalVisits: number;
    contact: {
      name: string;
      contact: string;
      message: string | null;
    } | null;
    pageViews: PageView[];
  };
  messages: Message[];
}

export default function ChatViewPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;

  const [session, setSession] = useState<ChatSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isTakingOver, setIsTakingOver] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Translator state
  const [translateText, setTranslateText] = useState("");
  const [translateResult, setTranslateResult] = useState("");
  const [translateFrom, setTranslateFrom] = useState<"auto" | "ru" | "ro" | "en">("auto");
  const [translateTo, setTranslateTo] = useState<"ru" | "ro" | "en">("ru");
  const [isTranslating, setIsTranslating] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchSession = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/chats/${sessionId}`);
      if (res.ok) {
        const data = await res.json();
        setSession(data.session);
      } else if (res.status === 404) {
        router.push("/admin/chats");
      }
    } catch (error) {
      console.error("Error fetching session:", error);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, router]);

  useEffect(() => {
    fetchSession();

    // Set up SSE for this session
    const eventSource = new EventSource(
      `/api/admin/chats/sse?sessionId=${sessionId}`
    );

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "new_message") {
        // Add new message
        setSession((prev) => {
          if (!prev) return prev;
          const newMessage = data.data.message;
          // Check if message already exists
          if (prev.messages.some((m) => m.id === newMessage.id)) {
            return prev;
          }
          return {
            ...prev,
            messages: [...prev.messages, newMessage],
          };
        });
      } else if (data.type === "admin_joined" || data.type === "admin_left") {
        fetchSession();
      }
    };

    return () => {
      eventSource.close();
    };
  }, [sessionId, fetchSession]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [session?.messages]);

  const handleTakeover = async () => {
    setIsTakingOver(true);
    try {
      const res = await fetch(`/api/admin/chats/${sessionId}/takeover`, {
        method: "POST",
      });
      if (res.ok) {
        fetchSession();
      }
    } catch (error) {
      console.error("Error taking over:", error);
    } finally {
      setIsTakingOver(false);
    }
  };

  const handleRelease = async () => {
    setIsTakingOver(true);
    try {
      const res = await fetch(`/api/admin/chats/${sessionId}/takeover`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchSession();
      }
    } catch (error) {
      console.error("Error releasing:", error);
    } finally {
      setIsTakingOver(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isSending) return;

    setIsSending(true);
    try {
      const res = await fetch(`/api/admin/chats/${sessionId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: message }),
      });
      if (res.ok) {
        setMessage("");
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsSending(false);
    }
  };

  const formatTime = (dateString: string) => {
    return new Intl.DateTimeFormat("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateString));
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("ru-RU", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateString));
  };

  const handleTranslate = async () => {
    if (!translateText.trim() || isTranslating) return;

    setIsTranslating(true);
    setTranslateResult("");

    try {
      const res = await fetch("/api/admin/ai/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: translateText,
          sourceLocale: translateFrom,
          targetLocale: translateTo,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setTranslateResult(data.translation || "");
      } else {
        setTranslateResult("Ошибка перевода");
      }
    } catch (error) {
      console.error("Translation error:", error);
      setTranslateResult("Ошибка перевода");
    } finally {
      setIsTranslating(false);
    }
  };

  const swapLanguages = () => {
    if (translateFrom !== "auto" && translateResult) {
      setTranslateText(translateResult);
      setTranslateResult("");
      const temp = translateFrom;
      setTranslateFrom(translateTo);
      setTranslateTo(temp);
    }
  };

  const copyTranslation = () => {
    navigator.clipboard.writeText(translateResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const useInMessage = () => {
    setMessage(translateResult);
    setTranslateResult("");
    setTranslateText("");
  };

  if (isLoading) {
    return (
      <>
        <AdminHeader title="Загрузка..." />
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3" />
            <div className="h-96 bg-muted rounded" />
          </div>
        </div>
      </>
    );
  }

  if (!session) {
    return (
      <>
        <AdminHeader title="Чат не найден" />
        <div className="p-6 text-center">
          <p className="text-muted-foreground mb-4">Чат-сессия не найдена</p>
          <Link
            href="/admin/chats"
            className="text-primary hover:underline"
          >
            Вернуться к списку чатов
          </Link>
        </div>
      </>
    );
  }

  const visitorName =
    session.visitor.contact?.name ||
    `Посетитель ${session.visitor.visitorId.slice(0, 8)}`;

  return (
    <>
      <AdminHeader
        title={visitorName}
        description={`Чат-сессия от ${formatDate(session.startedAt)}`}
      />
      <div className="flex h-[calc(100vh-8rem)]">
        {/* Chat area */}
        <div className="flex-1 flex flex-col">
          {/* Top bar */}
          <div className="p-4 border-b border-border flex items-center justify-between">
            <Link
              href="/admin/chats"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
              Назад к списку
            </Link>

            <div className="flex items-center gap-2">
              {session.isAdminTakeover ? (
                <button
                  onClick={handleRelease}
                  disabled={isTakingOver}
                  className="px-4 py-2 text-sm bg-muted hover:bg-muted/80 rounded-lg transition-colors disabled:opacity-50"
                >
                  {isTakingOver ? "..." : "Вернуть AI"}
                </button>
              ) : (
                <button
                  onClick={handleTakeover}
                  disabled={isTakingOver || session.status === "ENDED"}
                  className="px-4 py-2 text-sm bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg transition-colors disabled:opacity-50"
                >
                  {isTakingOver ? "..." : "Перехватить чат"}
                </button>
              )}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {session.messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.role === "USER" ? "justify-start" : "justify-end"
                }`}
              >
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                    msg.role === "USER"
                      ? "bg-muted"
                      : msg.role === "ADMIN"
                        ? "bg-blue-500 text-white"
                        : msg.role === "SYSTEM"
                          ? "bg-yellow-500/10 text-yellow-600 text-sm italic"
                          : "bg-primary text-primary-foreground"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1 text-xs opacity-70">
                    {msg.role === "USER" && (
                      <>
                        <User className="w-3 h-3" />
                        <span>Клиент</span>
                      </>
                    )}
                    {msg.role === "ASSISTANT" && (
                      <>
                        <Bot className="w-3 h-3" />
                        <span>AI</span>
                      </>
                    )}
                    {msg.role === "ADMIN" && (
                      <>
                        <Shield className="w-3 h-3" />
                        <span>Админ</span>
                      </>
                    )}
                    {msg.role === "SYSTEM" && (
                      <>
                        <Info className="w-3 h-3" />
                        <span>Система</span>
                      </>
                    )}
                    <span>{formatTime(msg.createdAt)}</span>
                  </div>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <form
            onSubmit={handleSendMessage}
            className="p-4 border-t border-border"
          >
            {!session.isAdminTakeover ? (
              <div className="bg-muted/50 rounded-lg p-4 text-center text-sm text-muted-foreground">
                <Shield className="w-5 h-5 mx-auto mb-2" />
                Нажмите &quot;Перехватить чат&quot; чтобы отвечать вместо AI
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Введите сообщение..."
                  className="flex-1 px-4 py-2 bg-muted rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={isSending}
                />
                <button
                  type="submit"
                  disabled={isSending || !message.trim()}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Sidebar - visitor info */}
        <div className="w-80 border-l border-border overflow-y-auto p-4 space-y-6">
          {/* Visitor info */}
          <div className="space-y-4">
            <h3 className="font-medium flex items-center gap-2">
              <User className="w-4 h-4" />
              Информация о посетителе
            </h3>

            <div className="space-y-2 text-sm">
              {session.visitor.contact && (
                <>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span>{session.visitor.contact.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {session.visitor.contact.contact.startsWith("@") ? (
                      <AtSign className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <Phone className="w-4 h-4 text-muted-foreground" />
                    )}
                    <span className="text-primary">
                      {session.visitor.contact.contact}
                    </span>
                  </div>
                  {session.visitor.contact.message && (
                    <div className="p-2 bg-muted rounded text-muted-foreground">
                      {session.visitor.contact.message}
                    </div>
                  )}
                </>
              )}

              {session.visitor.city && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>
                    {session.visitor.city}
                    {session.visitor.country && `, ${session.visitor.country}`}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-muted-foreground" />
                <span>{session.visitor.totalVisits} визитов</span>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span>
                  Первый визит: {formatDate(session.visitor.firstVisitAt)}
                </span>
              </div>

              {session.currentPage && (
                <div className="flex items-center gap-2">
                  <ExternalLink className="w-4 h-4 text-muted-foreground" />
                  <span className="truncate">{session.currentPage}</span>
                </div>
              )}
            </div>
          </div>

          {/* Page views */}
          {session.visitor.pageViews.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-medium flex items-center gap-2">
                <Eye className="w-4 h-4" />
                История просмотров
              </h3>

              <div className="space-y-2">
                {session.visitor.pageViews.map((pv) => (
                  <div
                    key={pv.id}
                    className="flex items-center justify-between text-sm p-2 bg-muted/50 rounded"
                  >
                    <span className="truncate flex-1">{pv.path}</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      {formatTime(pv.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Session info */}
          <div className="space-y-3">
            <h3 className="font-medium flex items-center gap-2">
              <Info className="w-4 h-4" />
              Сессия
            </h3>

            <div className="text-sm space-y-1 text-muted-foreground">
              <p>ID: {session.id.slice(0, 12)}...</p>
              <p>Статус: {session.status}</p>
              <p>Язык: {session.locale.toUpperCase()}</p>
              <p>Сообщений: {session.messages.length}</p>
            </div>
          </div>

          {/* Quick Translator */}
          <div className="space-y-3 border-t border-border pt-6">
            <h3 className="font-medium flex items-center gap-2">
              <Languages className="w-4 h-4" />
              Быстрый перевод
            </h3>

            {/* Language selectors */}
            <div className="flex items-center gap-2">
              <select
                value={translateFrom}
                onChange={(e) => setTranslateFrom(e.target.value as "auto" | "ru" | "ro" | "en")}
                className="flex-1 px-2 py-1.5 text-sm bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="auto">Авто</option>
                <option value="ru">Русский</option>
                <option value="ro">Română</option>
                <option value="en">English</option>
              </select>

              <button
                onClick={swapLanguages}
                disabled={translateFrom === "auto" || !translateResult}
                className="p-1.5 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                title="Поменять языки"
              >
                <ArrowRightLeft className="w-4 h-4" />
              </button>

              <select
                value={translateTo}
                onChange={(e) => setTranslateTo(e.target.value as "ru" | "ro" | "en")}
                className="flex-1 px-2 py-1.5 text-sm bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="ru">Русский</option>
                <option value="ro">Română</option>
                <option value="en">English</option>
              </select>
            </div>

            {/* Input */}
            <textarea
              value={translateText}
              onChange={(e) => setTranslateText(e.target.value)}
              placeholder="Введите текст для перевода..."
              rows={3}
              className="w-full px-3 py-2 text-sm bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />

            {/* Translate button */}
            <button
              onClick={handleTranslate}
              disabled={isTranslating || !translateText.trim()}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {isTranslating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Перевод...
                </>
              ) : (
                <>
                  <Languages className="w-4 h-4" />
                  Перевести
                </>
              )}
            </button>

            {/* Result */}
            {translateResult && (
              <div className="space-y-2">
                <div className="p-3 bg-muted/50 border border-border rounded-lg text-sm whitespace-pre-wrap">
                  {translateResult}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={copyTranslation}
                    className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 text-xs bg-muted hover:bg-muted/80 rounded-lg transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3 h-3 text-green-500" />
                        Скопировано
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        Копировать
                      </>
                    )}
                  </button>
                  {session.isAdminTakeover && (
                    <button
                      onClick={useInMessage}
                      className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 text-xs bg-primary/20 text-primary hover:bg-primary/30 rounded-lg transition-colors"
                    >
                      <Send className="w-3 h-3" />
                      В сообщение
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
