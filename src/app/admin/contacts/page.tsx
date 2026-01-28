"use client";

import { useEffect, useState } from "react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Mail, Clock, CheckCircle, Eye, MessageSquare } from "lucide-react";

interface Contact {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  status: "NEW" | "READ" | "RESPONDED";
  createdAt: string;
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // For now, we'll show placeholder - contacts API will be added later
    setIsLoading(false);
    setContacts([]);
  }, []);

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

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("ru-RU", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateString));
  };

  return (
    <>
      <AdminHeader
        title="Заявки"
        description="Заявки с формы обратной связи"
      />

      <div className="p-6 space-y-6">
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {isLoading ? (
            <div className="p-8 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : contacts.length === 0 ? (
            <div className="p-12 text-center">
              <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Нет заявок
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Заявки с формы обратной связи будут отображаться здесь
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {contacts.map((contact) => {
                const status = getStatusBadge(contact.status);
                const StatusIcon = status.icon;

                return (
                  <div
                    key={contact.id}
                    className="p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{contact.name}</span>
                          <span
                            className={`flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${status.color}`}
                          >
                            <StatusIcon className="w-3 h-3" />
                            {status.label}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          {contact.email}
                        </p>
                        {contact.subject && (
                          <p className="text-sm font-medium mb-1">{contact.subject}</p>
                        )}
                        <p className="text-sm line-clamp-2">{contact.message}</p>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
                        <Clock className="w-3 h-3" />
                        {formatDate(contact.createdAt)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
