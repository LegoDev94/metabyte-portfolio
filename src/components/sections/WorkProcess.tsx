"use client";

import { motion } from "framer-motion";
import * as LucideIcons from "lucide-react";
import { ArrowRight } from "lucide-react";
import type { WorkProcessStep } from "@/lib/db/site";

interface WorkProcessProps {
  steps?: WorkProcessStep[];
}

// Default fallback data
const defaultSteps: WorkProcessStep[] = [
  { id: "1", number: "01", title: "Бриф", description: "Обсуждаем задачу, требования и сроки. Бесплатная консультация.", icon: "MessageSquare", color: "#00ffff" },
  { id: "2", number: "02", title: "Анализ", description: "Изучаем нишу, конкурентов. Готовим ТЗ и смету.", icon: "Search", color: "#ff00ff" },
  { id: "3", number: "03", title: "Дизайн", description: "Создаём прототипы и UI/UX дизайн. Утверждаем с вами.", icon: "Palette", color: "#00ff88" },
  { id: "4", number: "04", title: "Разработка", description: "Пишем код, интегрируем API. Еженедельные демо.", icon: "Code2", color: "#ffaa00" },
  { id: "5", number: "05", title: "Тестирование", description: "QA тестирование, исправление багов, оптимизация.", icon: "TestTube2", color: "#ff5555" },
  { id: "6", number: "06", title: "Запуск", description: "Деплой на сервер, обучение, поддержка 30 дней.", icon: "Rocket", color: "#00ffff" },
];

// Dynamic icon component
function DynamicIcon({ name, className, style }: { name: string; className?: string; style?: React.CSSProperties }) {
  const iconName = name
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("") as keyof typeof LucideIcons;

  const Icon = (LucideIcons[iconName] as React.ComponentType<{ className?: string; style?: React.CSSProperties }>) || LucideIcons.Code;
  return <Icon className={className} style={style} />;
}

export function WorkProcess({ steps }: WorkProcessProps) {
  const processSteps = steps && steps.length > 0 ? steps : defaultSteps;

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 cyber-grid opacity-10" />

      <div className="container mx-auto px-4 lg:px-8 relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-display mb-4">
            Как мы{" "}
            <span className="text-primary text-glow-cyan">работаем</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Прозрачный процесс от идеи до запуска. Вы всегда в курсе статуса проекта.
          </p>
        </motion.div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {processSteps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative"
            >
              <div className="relative p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-all duration-300">
                {/* Step Number */}
                <div
                  className="absolute -top-3 -left-3 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                  style={{
                    backgroundColor: step.color + "20",
                    color: step.color,
                    boxShadow: `0 0 20px ${step.color}40`
                  }}
                >
                  {step.number}
                </div>

                {/* Icon */}
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 mt-2"
                  style={{ backgroundColor: step.color + "15" }}
                >
                  <DynamicIcon
                    name={step.icon}
                    className="w-6 h-6"
                    style={{ color: step.color }}
                  />
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>

                {/* Arrow to next (hidden on last in row) */}
                {index < processSteps.length - 1 && (index + 1) % 3 !== 0 && (
                  <ArrowRight
                    className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 text-border group-hover:text-primary transition-colors"
                  />
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-center mt-12"
        >
          <p className="text-muted-foreground mb-4">
            Готовы начать проект? Первая консультация бесплатно.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
