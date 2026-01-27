"use client";

import { motion } from "framer-motion";
import { Plug, ExternalLink } from "lucide-react";
import * as LucideIcons from "lucide-react";
import type { Integration } from "@/data/projects";
import { useLocaleContext } from "@/components/providers/LocaleProvider";

interface IntegrationsListProps {
  integrations: Integration[];
}

// Dynamic icon component
function DynamicIcon({ name, className, style }: { name: string; className?: string; style?: React.CSSProperties }) {
  const iconName = name
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("") as keyof typeof LucideIcons;

  const Icon = (LucideIcons[iconName] as React.ComponentType<{ className?: string; style?: React.CSSProperties }>) || LucideIcons.Box;
  return <Icon className={className} style={style} />;
}

export function IntegrationsList({ integrations }: IntegrationsListProps) {
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
            <Plug className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-accent">
              {locale === "ro" ? "Servicii verificate" : "Проверенные сервисы"}
            </span>
          </div>
          <h2 className="text-3xl font-display tracking-wide mb-4">
            <span className="text-foreground">
              {locale === "ro" ? "Functioneaza pe " : "Работает на "}
            </span>
            <span className="text-primary">
              {locale === "ro" ? "cele mai bune solutii" : "лучших решениях"}
            </span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {locale === "ro"
              ? "Lideri mondiali integrati: Stripe pentru plati, OpenAI pentru AI, SendGrid pentru email-uri — fiabilitate si scalare"
              : "Интегрированы мировые лидеры: Stripe для платежей, OpenAI для AI, SendGrid для писем — надёжность и масштаб"}
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {integrations.map((integration, index) => (
            <motion.div
              key={integration.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="group relative"
            >
              <div
                className="p-6 rounded-2xl border bg-card h-full transition-all duration-300 hover:shadow-lg cursor-pointer"
                style={{
                  borderColor: `${integration.color}30`,
                }}
              >
                {/* Hover glow */}
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{
                    background: `radial-gradient(ellipse at center, ${integration.color}15 0%, transparent 70%)`,
                  }}
                />

                <div className="relative flex flex-col h-full">
                  {/* Logo */}
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                    style={{ backgroundColor: `${integration.color}20` }}
                  >
                    <DynamicIcon
                      name={integration.logo}
                      className="w-7 h-7"
                      style={{ color: integration.color }}
                    />
                  </div>

                  {/* Name */}
                  <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
                    {integration.name}
                    <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground leading-relaxed flex-grow">
                    {integration.description}
                  </p>

                  {/* Decorative line */}
                  <div
                    className="absolute bottom-0 left-0 right-0 h-1 rounded-b-2xl opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ backgroundColor: integration.color }}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
