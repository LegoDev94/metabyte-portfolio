"use client";

import { motion } from "framer-motion";
import { Layers, ArrowDown } from "lucide-react";
import type { ArchitectureInfo } from "@/data/projects";
import { useLocaleContext } from "@/components/providers/LocaleProvider";

interface ArchitectureDiagramProps {
  architecture: ArchitectureInfo;
}

export function ArchitectureDiagram({ architecture }: ArchitectureDiagramProps) {
  const { locale } = useLocaleContext();

  return (
    <section className="py-16 border-t border-border">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-4">
            <Layers className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-accent">
              {locale === "ro" ? "Sub capota" : "Под капотом"}
            </span>
          </div>
          <h2 className="text-3xl font-display tracking-wide mb-4">
            <span className="text-foreground">
              {locale === "ro" ? "Cum " : "Как это "}
            </span>
            <span className="text-primary">
              {locale === "ro" ? "functioneaza" : "устроено"}
            </span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {locale === "ro"
              ? "Arhitectura pe niveluri pentru fiabilitate: fiecare nivel este responsabil de propria sarcina"
              : "Многоуровневая архитектура для надёжности: каждый слой отвечает за свою задачу"}
          </p>
        </motion.div>

        {/* Architecture layers */}
        <div className="max-w-4xl mx-auto space-y-4">
          {architecture.layers.map((layer, index) => (
            <motion.div
              key={layer.name}
              initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              {/* Arrow connector */}
              {index > 0 && (
                <div className="flex justify-center py-2">
                  <ArrowDown className="w-5 h-5 text-muted-foreground" />
                </div>
              )}

              {/* Layer card */}
              <div
                className="relative p-6 rounded-2xl border bg-card/50 backdrop-blur-sm overflow-hidden group hover:border-primary/30 transition-all duration-300"
                style={{
                  borderColor: `${layer.color}30`,
                }}
              >
                {/* Glow effect on hover */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{
                    background: `radial-gradient(ellipse at center, ${layer.color}10 0%, transparent 70%)`,
                  }}
                />

                {/* Layer indicator */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
                  style={{ backgroundColor: layer.color }}
                />

                <div className="relative">
                  {/* Layer name */}
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${layer.color}20` }}
                    >
                      <span className="text-lg font-bold" style={{ color: layer.color }}>
                        {index + 1}
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold text-foreground">{layer.name}</h3>
                  </div>

                  {/* Components */}
                  <div className="flex flex-wrap gap-2">
                    {layer.components.map((component, compIndex) => (
                      <motion.span
                        key={component}
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.2, delay: index * 0.1 + compIndex * 0.05 }}
                        className="px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors hover:bg-primary/10 cursor-default"
                        style={{
                          borderColor: `${layer.color}40`,
                          color: layer.color,
                        }}
                      >
                        {component}
                      </motion.span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
