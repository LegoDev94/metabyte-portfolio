"use client";

import { motion } from "framer-motion";
import {
  Triangle,
  Hexagon,
  Database,
  Cloud,
  FileCode,
  Smartphone,
} from "lucide-react";

const technologies = [
  {
    name: "Next.js",
    icon: Triangle,
    color: "#ffffff",
    category: "Frontend",
  },
  {
    name: "TypeScript",
    icon: FileCode,
    color: "#3178c6",
    category: "Language",
  },
  {
    name: "Node.js",
    icon: Hexagon,
    color: "#339933",
    category: "Backend",
  },
  {
    name: "Flutter",
    icon: Smartphone,
    color: "#02569B",
    category: "Mobile",
  },
  {
    name: "PostgreSQL",
    icon: Database,
    color: "#336791",
    category: "Database",
  },
  {
    name: "Docker",
    icon: Cloud,
    color: "#2496ed",
    category: "DevOps",
  },
];

export function TechStack() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-card/30 via-background to-card/30" />

      <div className="container mx-auto px-4 lg:px-8 relative">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
            Технологии
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display tracking-wide mb-4">
            <span className="text-foreground">Наш </span>
            <span className="text-accent text-glow-magenta">стек</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Ключевые технологии, которые мы используем для создания
            надёжных решений
          </p>
        </motion.div>

        {/* Tech Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6 max-w-4xl mx-auto lg:max-w-none">
          {technologies.map((tech, index) => (
            <motion.div
              key={tech.name}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ y: -5, scale: 1.05 }}
              className="group"
            >
              <div className="relative p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,255,255,0.1)]">
                {/* Icon */}
                <div className="flex flex-col items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300"
                    style={{
                      backgroundColor: `${tech.color}15`,
                    }}
                  >
                    <tech.icon
                      className="w-6 h-6 transition-transform duration-300 group-hover:scale-110"
                      style={{ color: tech.color }}
                    />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors text-center">
                    {tech.name}
                  </span>
                </div>

                {/* Hover Glow */}
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{
                    boxShadow: `0 0 30px ${tech.color}20`,
                  }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
