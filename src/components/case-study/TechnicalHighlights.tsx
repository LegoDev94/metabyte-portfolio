"use client";

import { motion } from "framer-motion";
import { Code2 } from "lucide-react";
import * as LucideIcons from "lucide-react";
import type { TechnicalHighlight } from "@/data/projects";
import { useLocaleContext } from "@/components/providers/LocaleProvider";

interface TechnicalHighlightsProps {
  highlights: TechnicalHighlight[];
}

// Dynamic icon component
function DynamicIcon({ name, className }: { name: string; className?: string }) {
  const iconName = name
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("") as keyof typeof LucideIcons;

  const Icon = (LucideIcons[iconName] as React.ComponentType<{ className?: string }>) || LucideIcons.Code;
  return <Icon className={className} />;
}

interface HighlightCardProps {
  highlight: TechnicalHighlight;
  index: number;
}

function HighlightCard({ highlight, index }: HighlightCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="group"
    >
      <div className="p-6 rounded-2xl border bg-card transition-all duration-300 border-border hover:border-primary/30 hover:shadow-[0_0_25px_rgba(0,255,255,0.1)]">
        {/* Header */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
            <DynamicIcon name={highlight.icon} className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground mb-2">{highlight.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{highlight.description}</p>

            {/* Tags as benefits */}
            {highlight.tags && highlight.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {highlight.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function TechnicalHighlights({ highlights }: TechnicalHighlightsProps) {
  const { locale } = useLocaleContext();

  return (
    <section className="py-16 border-t border-border bg-card/30">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Code2 className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              {locale === "ro" ? "De ce functioneaza" : "Почему это работает"}
            </span>
          </div>
          <h2 className="text-3xl font-display tracking-wide mb-4">
            <span className="text-foreground">
              {locale === "ro" ? "Ce ofera " : "Что даёт "}
            </span>
            <span className="text-primary">
              {locale === "ro" ? "afacerii" : "бизнесу"}
            </span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {locale === "ro"
              ? "Fiecare solutie = beneficiu concret pentru afacere: economie, viteza, conversie"
              : "Каждое решение = конкретная выгода для бизнеса: экономия, скорость, конверсия"}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {highlights.map((highlight, index) => (
            <HighlightCard key={highlight.title} highlight={highlight} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
