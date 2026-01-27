"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { ProjectCard } from "@/components/project/ProjectCard";
import type { Project } from "@/data/projects";
import { useLocaleContext } from "@/components/providers/LocaleProvider";

interface FeaturedProjectsProps {
  projects?: Project[];
}

export function FeaturedProjects({ projects }: FeaturedProjectsProps) {
  const t = useTranslations("projects");
  const { locale } = useLocaleContext();

  // If no projects passed, return null (data should come from parent)
  if (!projects || projects.length === 0) {
    return null;
  }

  return (
    <section className="py-24 relative">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-card/50 to-transparent" />

      <div className="container mx-auto px-4 lg:px-8 relative">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            {locale === "ro" ? "Portofoliu" : "Портфолио"}
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display tracking-wide mb-4">
            <span className="text-foreground">
              {locale === "ro" ? "Proiecte " : "Избранные "}
            </span>
            <span className="text-primary text-glow-cyan">
              {locale === "ro" ? "recomandate" : "проекты"}
            </span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {locale === "ro"
              ? "Cele mai bune lucrari din portofoliul meu. Fiecare proiect este o experienta unica si o solutie la probleme reale."
              : "Лучшие работы из моего портфолио. Каждый проект — это уникальный опыт и решение реальных задач."}
          </p>
        </motion.div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {projects.map((project, index) => (
            <ProjectCard key={project.slug} project={project} index={index} />
          ))}
        </div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center"
        >
          <Button
            asChild
            variant="outline"
            size="lg"
            className="border-border hover:border-primary hover:text-primary group"
          >
            <Link href="/projects">
              {t("all")}
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
