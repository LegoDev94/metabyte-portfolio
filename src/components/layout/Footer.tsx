"use client";

import Link from "next/link";
import { Github, Send, Mail, Heart } from "lucide-react";
import { useLocaleContext } from "@/components/providers/LocaleProvider";

const footerLinksRu = [
  { href: "/", label: "Главная" },
  { href: "/projects", label: "Проекты" },
  { href: "/about", label: "Команда" },
  { href: "/contact", label: "Контакты" },
];

const footerLinksRo = [
  { href: "/", label: "Acasa" },
  { href: "/projects", label: "Proiecte" },
  { href: "/about", label: "Echipa" },
  { href: "/contact", label: "Contacte" },
];

const socialLinks = [
  {
    href: "https://github.com/LegoDev94",
    icon: Github,
    label: "GitHub",
  },
  {
    href: "https://t.me/metabytemd",
    icon: Send,
    label: "Telegram",
  },
  {
    href: "mailto:vm@metabyte.md",
    icon: Mail,
    label: "Email",
  },
];

export function Footer() {
  const currentYear = new Date().getFullYear();
  const { locale } = useLocaleContext();
  const footerLinks = locale === "ro" ? footerLinksRo : footerLinksRu;

  return (
    <footer className="border-t border-border bg-card/50">
      <div className="container mx-auto px-4 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <span className="font-display text-2xl tracking-wider text-primary">
                META
                <span className="text-foreground">BYTE</span>
              </span>
            </Link>
            <p className="text-muted-foreground text-sm max-w-xs">
              {locale === "ro"
                ? "Dezvoltator Full-Stack. Creez aplicatii web moderne, jocuri si Telegram Mini Apps."
                : "Full-Stack разработчик. Создаю современные веб-приложения, игры и Telegram Mini Apps."}
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">
              {locale === "ro" ? "Navigare" : "Навигация"}
            </h3>
            <ul className="space-y-2">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">
              {locale === "ro" ? "Contacte" : "Контакты"}
            </h3>
            <ul className="space-y-3">
              {socialLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors text-sm group"
                  >
                    <link.icon className="w-4 h-4 group-hover:text-primary transition-colors" />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-muted-foreground text-sm">
            &copy; {currentYear} Metabyte. {locale === "ro" ? "Toate drepturile rezervate." : "Все права защищены."}
          </p>
          <p className="text-muted-foreground text-sm flex items-center gap-1">
            {locale === "ro" ? "Creat cu" : "Сделано с"} <Heart className="w-4 h-4 text-red-500 fill-red-500" /> {locale === "ro" ? "si" : "и"}{" "}
            <span className="text-primary">React</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
