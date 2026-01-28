"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  FolderKanban,
  MessageSquareQuote,
  Users,
  CreditCard,
  HelpCircle,
  Settings,
  MessageCircle,
  BarChart3,
  Image,
  Mail,
  LogOut,
  ChevronRight,
} from "lucide-react";

const menuItems = [
  {
    title: "Главная",
    items: [
      { href: "/admin/dashboard", label: "Дашборд", icon: LayoutDashboard },
    ],
  },
  {
    title: "Контент",
    items: [
      { href: "/admin/projects", label: "Проекты", icon: FolderKanban },
      { href: "/admin/testimonials", label: "Отзывы", icon: MessageSquareQuote },
      { href: "/admin/team", label: "Команда", icon: Users },
      { href: "/admin/pricing", label: "Тарифы", icon: CreditCard },
      { href: "/admin/faq", label: "FAQ", icon: HelpCircle },
    ],
  },
  {
    title: "Коммуникации",
    items: [
      { href: "/admin/chats", label: "AI Чаты", icon: MessageCircle },
      { href: "/admin/contacts", label: "Заявки", icon: Mail },
    ],
  },
  {
    title: "Система",
    items: [
      { href: "/admin/analytics", label: "Аналитика", icon: BarChart3 },
      { href: "/admin/media", label: "Медиатека", icon: Image },
      { href: "/admin/settings", label: "Настройки", icon: Settings },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  // Don't show sidebar on login page
  if (pathname === "/admin/login") {
    return null;
  }

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/admin/login" });
  };

  return (
    <aside className="w-64 min-h-screen bg-card border-r border-border flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <Link href="/admin/dashboard" className="block">
          <h1 className="font-display text-2xl tracking-wider">
            <span className="text-primary">META</span>
            <span className="text-foreground">BYTE</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1">Админ панель</p>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
        {menuItems.map((group) => (
          <div key={group.title}>
            <h2 className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {group.title}
            </h2>
            <ul className="space-y-1">
              {group.items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                const Icon = item.icon;

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all group ${
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${isActive ? "text-primary" : ""}`} />
                      <span className="flex-1">{item.label}</span>
                      {isActive && (
                        <ChevronRight className="w-4 h-4 opacity-50" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Logout button */}
      <div className="p-4 border-t border-border">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm font-medium text-muted-foreground hover:bg-red-500/10 hover:text-red-400 transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span>Выйти</span>
        </button>
      </div>
    </aside>
  );
}
