"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminHeader } from "@/components/admin/AdminHeader";
import {
  Mail,
  Clock,
  CheckCircle,
  Eye,
  MessageSquare,
  Bot,
  FileText,
  Trash2,
  Send,
  MapPin,
  ExternalLink,
  Filter,
} from "lucide-react";

interface Contact {
  id: string;
  type: "ai_assistant" | "form";
  name: string;
  contact: string | null;
  email: string | null;
  subject: string | null;
  message: string | null;
  status: "NEW" | "READ" | "RESPONDED";
  source: string;
  createdAt: string;
  visitorId: string | null;
  chatSessionId: string | null;
  city: string | null;
  country: string | null;
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<"all" | "ai_assistant" | "form">("all");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchContacts();
  }, []);

  async function fetchContacts() {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/contacts");
      if (response.ok) {
        const data = await response.json();
        setContacts(data.contacts);
      }
    } catch (error) {
      console.error("Failed to fetch contacts:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleStatusUpdate(id: string, status: "NEW" | "READ" | "RESPONDED") {
    try {
      const response = await fetch("/api/admin/contacts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (response.ok) {
        setContacts(contacts.map((c) => (c.id === id ? { ...c, status } : c)));
      }
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  }

  async function handleDelete(id: string, type: string) {
    try {
      const response = await fetch(`/api/admin/contacts?id=${id}&type=${type}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setContacts(contacts.filter((c) => c.id !== id));
        setDeleteConfirm(null);
      }
    } catch (error) {
      console.error("Failed to delete contact:", error);
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "NEW":
        return { icon: Mail, color: "bg-blue-500/10 text-blue-500", label: "Новая" };
      case "READ":
        return { icon: Eye, color: "bg-yellow-500/10 text-yellow-500", label: "Прочитана" };
      case "RESPONDED":
        return { icon: CheckCircle, color: "bg-green-500/10 text-green-500", label: "Отвечено" };
      default:
        return { icon: Mail, color: "bg-muted text-muted-foreground", label: status };
    }
  };

  const getTypeBadge = (type: string) => {
    if (type === "ai_assistant") {
      return { icon: Bot, color: "bg-purple-500/10 text-purple-500", label: "AI" };
    }
    return { icon: FileText, color: "bg-cyan-500/10 text-cyan-500", label: "Форма" };
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("ru-RU", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateString));
  };

  const filteredContacts = contacts.filter((c) => {
    if (typeFilter === "all") return true;
    return c.type === typeFilter;
  });

  const aiCount = contacts.filter((c) => c.type === "ai_assistant").length;
  const formCount = contacts.filter((c) => c.type === "form").length;
  const newCount = contacts.filter((c) => c.status === "NEW").length;

  return (
    <>
      <AdminHeader
        title="Заявки"
        description="Заявки с AI-ассистента и формы обратной связи"
      />

      <div className="p-6 space-y-6">
        {/* Filter and stats */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <div className="flex rounded-lg border border-border overflow-hidden">
              <button
                onClick={() => setTypeFilter("all")}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  typeFilter === "all"
                    ? "bg-primary text-primary-foreground"
                    : "bg-background text-muted-foreground hover:text-foreground"
                }`}
              >
                Все ({contacts.length})
              </button>
              <button
                onClick={() => setTypeFilter("ai_assistant")}
                className={`px-4 py-2 text-sm font-medium transition-colors flex items-center gap-1 ${
                  typeFilter === "ai_assistant"
                    ? "bg-primary text-primary-foreground"
                    : "bg-background text-muted-foreground hover:text-foreground"
                }`}
              >
                <Bot className="w-4 h-4" /> AI ({aiCount})
              </button>
              <button
                onClick={() => setTypeFilter("form")}
                className={`px-4 py-2 text-sm font-medium transition-colors flex items-center gap-1 ${
                  typeFilter === "form"
                    ? "bg-primary text-primary-foreground"
                    : "bg-background text-muted-foreground hover:text-foreground"
                }`}
              >
                <FileText className="w-4 h-4" /> Форма ({formCount})
              </button>
            </div>
          </div>

          {newCount > 0 && (
            <span className="px-3 py-1 bg-blue-500/10 text-blue-500 text-sm font-medium rounded-full">
              {newCount} новых
            </span>
          )}
        </div>

        {/* Contacts list */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {isLoading ? (
            <div className="p-8 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="p-12 text-center">
              <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {typeFilter !== "all" ? "Нет заявок данного типа" : "Нет заявок"}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Заявки с AI-ассистента и формы обратной связи будут отображаться здесь
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredContacts.map((contact) => {
                const status = getStatusBadge(contact.status);
                const type = getTypeBadge(contact.type);
                const StatusIcon = status.icon;
                const TypeIcon = type.icon;
                const isExpanded = expandedId === contact.id;

                return (
                  <div
                    key={contact.id}
                    className={`transition-colors ${
                      contact.status === "NEW" ? "bg-blue-500/5" : ""
                    }`}
                  >
                    <div
                      className="p-4 hover:bg-muted/50 cursor-pointer"
                      onClick={() => setExpandedId(isExpanded ? null : contact.id)}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="font-medium">{contact.name}</span>
                            <span
                              className={`flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${type.color}`}
                            >
                              <TypeIcon className="w-3 h-3" />
                              {type.label}
                            </span>
                            {contact.type === "form" && (
                              <span
                                className={`flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${status.color}`}
                              >
                                <StatusIcon className="w-3 h-3" />
                                {status.label}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground mb-1 flex-wrap">
                            {contact.contact && (
                              <span className="flex items-center gap-1">
                                <Send className="w-3 h-3" />
                                {contact.contact}
                              </span>
                            )}
                            {contact.email && (
                              <span className="flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {contact.email}
                              </span>
                            )}
                            {(contact.city || contact.country) && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {[contact.city, contact.country].filter(Boolean).join(", ")}
                              </span>
                            )}
                          </div>
                          {contact.subject && (
                            <p className="text-sm font-medium mb-1">{contact.subject}</p>
                          )}
                          {contact.message && (
                            <p className="text-sm line-clamp-2">{contact.message}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
                            <Clock className="w-3 h-3" />
                            {formatDate(contact.createdAt)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Expanded view */}
                    {isExpanded && (
                      <div className="px-4 pb-4 border-t border-border bg-muted/30">
                        <div className="pt-4 space-y-4">
                          {contact.message && (
                            <div>
                              <p className="text-sm font-medium mb-1">Сообщение:</p>
                              <p className="text-sm bg-background p-3 rounded-lg">{contact.message}</p>
                            </div>
                          )}

                          <div className="flex items-center gap-2 flex-wrap">
                            {contact.type === "form" && (
                              <>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleStatusUpdate(contact.id, "READ");
                                  }}
                                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                                    contact.status === "READ"
                                      ? "bg-yellow-500 text-white"
                                      : "bg-muted hover:bg-muted/80"
                                  }`}
                                >
                                  <Eye className="w-4 h-4 inline mr-1" />
                                  Прочитано
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleStatusUpdate(contact.id, "RESPONDED");
                                  }}
                                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                                    contact.status === "RESPONDED"
                                      ? "bg-green-500 text-white"
                                      : "bg-muted hover:bg-muted/80"
                                  }`}
                                >
                                  <CheckCircle className="w-4 h-4 inline mr-1" />
                                  Отвечено
                                </button>
                              </>
                            )}

                            {contact.chatSessionId && (
                              <Link
                                href={`/admin/chats/${contact.chatSessionId}`}
                                onClick={(e) => e.stopPropagation()}
                                className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-1"
                              >
                                <ExternalLink className="w-4 h-4" />
                                Открыть чат
                              </Link>
                            )}

                            {deleteConfirm === contact.id ? (
                              <div className="flex items-center gap-1 ml-auto">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(contact.id, contact.type);
                                  }}
                                  className="px-3 py-1.5 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600"
                                >
                                  Удалить
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDeleteConfirm(null);
                                  }}
                                  className="px-3 py-1.5 text-sm bg-muted rounded-lg"
                                >
                                  Отмена
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteConfirm(contact.id);
                                }}
                                className="ml-auto p-2 text-muted-foreground hover:text-red-500 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>Всего: {contacts.length}</span>
          <span>|</span>
          <span>От AI: {aiCount}</span>
          <span>|</span>
          <span>С формы: {formCount}</span>
          <span>|</span>
          <span>Новых: {newCount}</span>
        </div>
      </div>
    </>
  );
}
