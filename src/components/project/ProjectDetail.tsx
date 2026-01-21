"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  ExternalLink,
  Github,
  Send,
  Code,
  Layers,
} from "lucide-react";
import * as LucideIcons from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { type Project } from "@/data/projects";
import {
  LighthouseMetrics,
  UserFlowDemo,
  ArchitectureDiagram,
  TechnicalHighlights,
  IntegrationsList,
  ChallengeSolution,
  Model3DViewer,
} from "@/components/case-study";

interface ProjectDetailProps {
  project: Project;
}

// Dynamic icon component
interface DynamicIconProps {
  name: string;
  className?: string;
  style?: React.CSSProperties;
}

function DynamicIcon({ name, className, style }: DynamicIconProps) {
  const iconName = name
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("") as keyof typeof LucideIcons;

  const Icon = (LucideIcons[iconName] as React.ComponentType<{ className?: string; style?: React.CSSProperties }>) || Code;
  return <Icon className={className} style={style} />;
}

// Render inline markdown (**bold**)
function renderInlineMarkdown(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <span key={i} className="text-foreground font-medium">
          {part.slice(2, -2)}
        </span>
      );
    }
    return part;
  });
}

export function ProjectDetail({ project }: ProjectDetailProps) {
  return (
    <div className="relative">
      {/* Background */}
      <div className="absolute inset-0 cyber-grid opacity-10" />

      {/* Back Button */}
      <div className="container mx-auto px-4 lg:px-8 py-6 relative z-20">
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Все проекты
        </Link>
      </div>

      {/* Hero Section */}
      <section className="py-12 relative">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge
                variant="secondary"
                className="mb-4 bg-primary/10 text-primary border-primary/20"
              >
                {project.categoryLabel}
              </Badge>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display tracking-wide mb-4">
                <span className="text-primary text-glow-cyan">
                  {project.title}
                </span>
              </h1>

              <p className="text-xl text-muted-foreground font-mono mb-6">
                {project.subtitle}
              </p>

              <p className="text-lg text-foreground/80 mb-8 leading-relaxed">
                {project.description}
              </p>

              {/* Links */}
              <div className="flex flex-wrap gap-4">
                {project.links.demo && (
                  <Button
                    asChild
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <a
                      href={project.links.demo}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Live Demo
                    </a>
                  </Button>
                )}
                {project.links.github && (
                  <Button asChild variant="outline">
                    <a
                      href={project.links.github}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Github className="w-4 h-4 mr-2" />
                      GitHub
                    </a>
                  </Button>
                )}
                {project.links.telegram && (
                  <Button asChild variant="outline">
                    <a
                      href={project.links.telegram}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Telegram
                    </a>
                  </Button>
                )}
              </div>
            </motion.div>

            {/* Preview */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative"
            >
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-gradient-to-br from-primary/20 to-accent/20 border border-border">
                {/* Project Video or Screenshot */}
                {project.video?.type === "file" && project.video.src ? (
                  <video
                    src={project.video.src}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : project.video?.type === "vimeo" && project.video.id ? (
                  <iframe
                    src={`https://player.vimeo.com/video/${project.video.id}?background=1&autoplay=1&loop=1&muted=1&controls=0&title=0&byline=0&portrait=0&sidedock=0`}
                    className="absolute inset-0 w-full h-full"
                    allow="autoplay; fullscreen"
                    style={{ border: 0 }}
                  />
                ) : (
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    priority
                  />
                )}

                {/* Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-t from-background/50 via-transparent to-transparent pointer-events-none" />
              </div>

              {/* Decorative Elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/20 rounded-full blur-2xl" />
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-accent/20 rounded-full blur-2xl" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Metrics */}
      {project.metrics && project.metrics.length > 0 && (
        <section className="py-12 border-y border-border bg-card/30">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {project.metrics.map((metric, index) => (
                <motion.div
                  key={metric.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-4">
                    <DynamicIcon name={metric.icon} className="w-6 h-6 text-primary" />
                  </div>
                  <div className="text-3xl font-display text-foreground mb-1">
                    {metric.value}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {metric.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Full Description */}
      <section className="py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Description */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-2xl font-display tracking-wide mb-6 flex items-center gap-3">
                  <Layers className="w-6 h-6 text-primary" />
                  <span className="text-foreground">О проекте</span>
                </h2>
                <div className="space-y-6">
                  {project.fullDescription.split("\n\n").map((paragraph, index) => {
                    // Check for ## Heading (Markdown h2)
                    const h2Match = paragraph.match(/^##\s+(.+)/);
                    if (h2Match) {
                      return (
                        <h3 key={index} className="text-xl font-semibold text-primary mt-6 first:mt-0">
                          {h2Match[1]}
                        </h3>
                      );
                    }

                    // Check if paragraph starts with **Header:**
                    const headerMatch = paragraph.match(/^\*\*(.+?):\*\*\s*([\s\S]*)/);
                    if (headerMatch) {
                      const [, header, content] = headerMatch;
                      const lines = content.split("\n").filter(l => l.trim());
                      const isList = lines.every(l => l.trim().startsWith("•"));

                      return (
                        <div key={index} className="space-y-3">
                          <h3 className="text-lg font-semibold text-primary">
                            {header}
                          </h3>
                          {isList ? (
                            <ul className="space-y-2 pl-4">
                              {lines.map((line, i) => (
                                <li key={i} className="text-muted-foreground leading-relaxed flex items-center gap-2">
                                  <span className="text-primary flex-shrink-0">→</span>
                                  <span>{line.replace(/^•\s*/, "")}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-muted-foreground leading-relaxed">
                              {content}
                            </p>
                          )}
                        </div>
                      );
                    }

                    // Check for list items (- item)
                    if (paragraph.trim().startsWith("- ")) {
                      const lines = paragraph.split("\n").filter(l => l.trim());
                      return (
                        <ul key={index} className="space-y-2 pl-4">
                          {lines.map((line, i) => (
                            <li key={i} className="text-muted-foreground leading-relaxed flex items-center gap-2">
                              <span className="text-primary flex-shrink-0">→</span>
                              <span>{renderInlineMarkdown(line.replace(/^-\s*/, ""))}</span>
                            </li>
                          ))}
                        </ul>
                      );
                    }

                    // Regular paragraph with inline markdown support
                    return (
                      <p
                        key={index}
                        className="text-muted-foreground leading-relaxed"
                      >
                        {renderInlineMarkdown(paragraph)}
                      </p>
                    );
                  })}
                </div>
              </motion.div>
            </div>

            {/* Technologies */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <h2 className="text-2xl font-display tracking-wide mb-6 flex items-center gap-3">
                  <Code className="w-6 h-6 text-accent" />
                  <span className="text-foreground">Технологии</span>
                </h2>
                <div className="space-y-3">
                  {project.technologies.map((tech, index) => (
                    <motion.div
                      key={tech.name}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border hover:border-primary/30 transition-colors group"
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${tech.color}20` }}
                      >
                        <DynamicIcon
                          name={tech.icon}
                          className="w-4 h-4"
                          style={{ color: tech.color } as React.CSSProperties}
                        />
                      </div>
                      <span className="text-muted-foreground group-hover:text-foreground transition-colors">
                        {tech.name}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 border-t border-border bg-card/30">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-display tracking-wide">
              <span className="text-foreground">Ключевые </span>
              <span className="text-primary">функции</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {project.features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,255,255,0.1)] group"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <DynamicIcon
                    name={feature.icon}
                    className="w-6 h-6 text-primary"
                  />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Case Study Sections */}
      {project.caseStudy && (
        <>
          {/* Challenge - Solution - Results */}
          {project.caseStudy.challenge && project.caseStudy.solution && project.caseStudy.results && (
            <ChallengeSolution
              challenge={project.caseStudy.challenge}
              solution={project.caseStudy.solution}
              results={project.caseStudy.results}
            />
          )}

          {/* Lighthouse Performance Metrics */}
          {project.caseStudy.performance && (
            <LighthouseMetrics metrics={project.caseStudy.performance} />
          )}

          {/* User Flows Demo */}
          {project.caseStudy.userFlows && project.caseStudy.userFlows.length > 0 && (
            <UserFlowDemo flows={project.caseStudy.userFlows} />
          )}

          {/* Technical Highlights */}
          {project.caseStudy.technicalHighlights && project.caseStudy.technicalHighlights.length > 0 && (
            <TechnicalHighlights highlights={project.caseStudy.technicalHighlights} />
          )}

          {/* Architecture Diagram */}
          {project.caseStudy.architecture && (
            <ArchitectureDiagram architecture={project.caseStudy.architecture} />
          )}

          {/* Integrations */}
          {project.caseStudy.integrations && project.caseStudy.integrations.length > 0 && (
            <IntegrationsList integrations={project.caseStudy.integrations} />
          )}

          {/* 3D Models Viewer */}
          {project.caseStudy.gallery && project.caseStudy.gallery.some(item =>
            item.src.endsWith('.glb') || item.src.endsWith('.gltf')
          ) && (
            <Model3DViewer
              models={project.caseStudy.gallery.filter(item =>
                item.src.endsWith('.glb') || item.src.endsWith('.gltf')
              )}
            />
          )}
        </>
      )}

      {/* CTA */}
      <section className="py-16 relative z-20">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <p className="text-muted-foreground mb-6">
              Заинтересовал проект? Свяжитесь со мной для обсуждения деталей.
            </p>
            <div className="flex flex-wrap justify-center gap-4 relative z-20">
              <Button
                asChild
                className="bg-primary text-primary-foreground hover:bg-primary/90 relative z-20"
              >
                <Link href="/contact">Связаться</Link>
              </Button>
              <Button asChild variant="outline" className="relative z-20">
                <Link href="/projects">Другие проекты</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
