"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Github, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { type Project } from "@/data/projects";
import { cn } from "@/lib/utils";

interface ProjectCardProps {
  project: Project;
  index?: number;
}

export function ProjectCard({ project, index = 0 }: ProjectCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative"
    >
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl",
          "bg-card border border-border",
          "transition-all duration-500",
          "hover:border-primary/50",
          "hover:shadow-[0_0_30px_rgba(0,255,255,0.15)]"
        )}
      >
        <Link href={`/projects/${project.slug}`} className="block">
          {/* Image or Video */}
          <div className="relative aspect-video bg-gradient-to-br from-primary/10 to-accent/10 overflow-hidden">
            {/* Project Video or Image */}
            {project.video?.type === "file" && project.video.src ? (
              <video
                src={project.video.src}
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : project.video?.type === "vimeo" && project.video.id ? (
              <iframe
                src={`https://player.vimeo.com/video/${project.video.id}?background=1&autoplay=1&loop=1&muted=1&controls=0&title=0&byline=0&portrait=0&sidedock=0`}
                className="absolute inset-0 w-full h-full scale-150 transition-transform duration-500 group-hover:scale-[1.6]"
                allow="autoplay; fullscreen"
                style={{ border: 0, pointerEvents: "none" }}
              />
            ) : (
              <Image
                src={project.image}
                alt={project.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            )}

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent z-10" />

            {/* Category Badge */}
            <div className="absolute top-4 left-4 z-20">
              <Badge
                variant="secondary"
                className="bg-background/80 backdrop-blur-sm text-xs"
              >
                {project.categoryLabel}
              </Badge>
            </div>

            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Title */}
            <div className="flex items-start justify-between gap-4 mb-3">
              <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                {project.title}
              </h3>
              <ArrowUpRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
            </div>

            {/* Subtitle */}
            <p className="text-sm text-primary/80 font-mono mb-3">
              {project.subtitle}
            </p>

            {/* Description */}
            <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
              {project.description}
            </p>

            {/* Technologies */}
            <div className="flex flex-wrap gap-2">
              {project.technologies.slice(0, 4).map((tech) => (
                <span
                  key={tech.name}
                  className="px-2 py-1 text-xs rounded-md bg-secondary text-muted-foreground"
                >
                  {tech.name}
                </span>
              ))}
              {project.technologies.length > 4 && (
                <span className="px-2 py-1 text-xs rounded-md bg-secondary text-muted-foreground">
                  +{project.technologies.length - 4}
                </span>
              )}
            </div>
          </div>
        </Link>

        {/* Quick Links - Outside of Link to avoid nested <a> tags */}
        <div className="absolute bottom-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
          {project.links.github && (
            <a
              href={project.links.github}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg bg-background/80 backdrop-blur-sm text-muted-foreground hover:text-primary transition-colors"
              aria-label="GitHub"
            >
              <Github className="w-4 h-4" />
            </a>
          )}
          {project.links.demo && (
            <a
              href={project.links.demo}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg bg-background/80 backdrop-blur-sm text-muted-foreground hover:text-primary transition-colors"
              aria-label="Live Demo"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>

        {/* Glow Effect */}
        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/10 to-accent/10" />
        </div>
      </div>
    </motion.article>
  );
}
