"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ProjectCard } from "@/components/project/ProjectCard";
import { cn } from "@/lib/utils";
import type { Project } from "@/data/projects";

interface Category {
  value: string;
  label: string;
  count?: number;
}

interface ProjectsContentProps {
  projects: Project[];
  categories: Category[];
}

export function ProjectsContent({ projects, categories }: ProjectsContentProps) {
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredProjects = activeCategory === "all"
    ? projects
    : projects.filter((p) => p.category === activeCategory);

  const stats = [
    { label: "Всего проектов", value: projects.length },
    { label: "Игры", value: projects.filter((p) => p.category === "games").length },
    { label: "FinTech", value: projects.filter((p) => p.category === "fintech").length },
    { label: "Мобильные", value: projects.filter((p) => p.category === "mobile").length },
    { label: "Enterprise", value: projects.filter((p) => p.category === "enterprise").length },
    { label: "Автоматизация", value: projects.filter((p) => p.category === "automation").length },
  ].filter((s) => s.value > 0);

  return (
    <>
      {/* Hero */}
      <section className="py-16 relative">
        <div className="absolute inset-0 cyber-grid opacity-20" />
        <div className="container mx-auto px-4 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto"
          >
            <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              Портфолио
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display tracking-wide mb-6">
              <span className="text-foreground">Мои </span>
              <span className="text-primary text-glow-cyan">проекты</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Коллекция работ, демонстрирующих мой опыт в разработке
              веб-приложений, игр и Telegram Mini Apps
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 border-y border-border bg-card/30">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-3">
            {categories.map((category) => (
              <button
                key={category.value}
                onClick={() => setActiveCategory(category.value)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300",
                  activeCategory === category.value
                    ? "bg-primary text-primary-foreground shadow-[0_0_20px_rgba(0,255,255,0.3)]"
                    : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                )}
              >
                {category.label}
                {category.count !== undefined && (
                  <span className="ml-2 text-xs opacity-70">({category.count})</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredProjects.map((project, index) => (
              <ProjectCard
                key={project.slug}
                project={project}
                index={index}
              />
            ))}
          </motion.div>

          {filteredProjects.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground">
                Проекты в этой категории не найдены
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 border-t border-border bg-card/30">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-display text-primary mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
