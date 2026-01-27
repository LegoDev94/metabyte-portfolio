"use client";

import { motion } from "framer-motion";
import { ArrowDown, Sparkles, Star, Briefcase, Globe } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Typewriter } from "@/components/animations/motion";
import type { SiteSettings } from "@/lib/db/site";
import { useLocaleContext } from "@/components/providers/LocaleProvider";

interface HeroProps {
  settings?: SiteSettings | null;
}

// Default fallback values
const defaultSettings: SiteSettings = {
  companyName: "METABYTE",
  subtitle: "Full-Stack Development Studio",
  badgeText: "Открыт для предложений",
  heroServices: ["SaaS", "FinTech", "E-commerce", "Игры", "Mobile Apps"],
  heroTechStack: ["React", "Next.js", "Flutter", "Node.js", "TypeScript"],
  projectsCount: 17,
  rating: 4.9,
  countriesCount: 5,
  founderName: "Владимир",
  founderTitle: "Full-Stack разработчик",
  founderBioShort: "",
  founderBioLong: null,
  founderPhoto: "/images/team/vladimir.png",
};

export function Hero({ settings }: HeroProps) {
  const t = useTranslations("hero");
  const { locale } = useLocaleContext();
  const data = settings || defaultSettings;

  // Split company name for styling (assumes format like "METABYTE" -> "META" + "BYTE")
  const nameParts = data.companyName.match(/^([A-Z]+)([A-Z]+)$/i);
  const firstName = nameParts ? nameParts[1] : data.companyName.slice(0, 4);
  const lastName = nameParts ? nameParts[2] : data.companyName.slice(4);

  // Format services for typewriter - localized
  const servicesRo = ["SaaS", "FinTech", "E-commerce", "Jocuri", "Mobile Apps"];
  const services = locale === "ro" ? servicesRo : data.heroServices;
  const servicesText = services.join(" • ");

  // Badge text localized
  const badgeText = locale === "ro" ? "Disponibil pentru colaborare" : data.badgeText;

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Cyber Grid Background */}
      <div className="absolute inset-0 cyber-grid opacity-30" />

      {/* Gradient Orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/20 rounded-full blur-[128px] animate-pulse" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-accent/20 rounded-full blur-[128px] animate-pulse" />

      {/* Content */}
      <div className="relative container mx-auto px-4 lg:px-8 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8"
        >
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm text-primary font-medium">
            {badgeText}
          </span>
        </motion.div>

        {/* Name */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-5xl md:text-7xl lg:text-8xl font-display tracking-wider mb-4"
        >
          <span className="text-primary text-glow-cyan">{firstName}</span>
          <span className="text-foreground">{lastName}</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg md:text-xl text-muted-foreground mb-6"
        >
          {data.subtitle}
        </motion.p>

        {/* Services Typewriter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="h-10 md:h-12 flex items-center justify-center mb-8"
        >
          <span className="text-xl md:text-2xl font-mono gradient-text">
            <Typewriter text={servicesText} delay={0.5} speed={50} />
          </span>
        </motion.div>

        {/* Tech Stack */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-3 mb-12"
        >
          {data.heroTechStack.map((tech) => (
            <span
              key={tech}
              className="px-3 py-1 text-sm font-mono bg-muted/50 border border-border rounded-full text-foreground"
            >
              {tech}
            </span>
          ))}
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Button
            asChild
            size="lg"
            className="bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-[0_0_30px_rgba(0,255,255,0.4)] transition-all duration-300 px-8"
          >
            <Link href="/projects">{t("cta.projects")}</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="border-border hover:border-primary hover:text-primary transition-all duration-300 px-8"
          >
            <Link href="/contact">{t("cta.contact")}</Link>
          </Button>
        </motion.div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="flex flex-wrap items-center justify-center gap-6 md:gap-10 mt-12 pt-8 border-t border-border/30"
        >
          <div className="flex items-center gap-2 text-muted-foreground">
            <Briefcase className="w-5 h-5 text-primary" />
            <span className="text-2xl font-bold text-foreground">{data.projectsCount}+</span>
            <span className="text-sm">{t("stats.projects")}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
            <span className="text-2xl font-bold text-foreground">{data.rating}</span>
            <span className="text-sm">{t("stats.rating")}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Globe className="w-5 h-5 text-primary" />
            <span className="text-2xl font-bold text-foreground">{data.countriesCount}+</span>
            <span className="text-sm">{t("stats.countries")}</span>
          </div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 1 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="flex flex-col items-center gap-2 text-muted-foreground"
        >
          <span className="text-xs uppercase tracking-wider">
            {locale === "ro" ? "Scroll" : "Скролл"}
          </span>
          <ArrowDown className="w-4 h-4" />
        </motion.div>
      </motion.div>
    </section>
  );
}
