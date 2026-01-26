"use client";

import { motion } from "framer-motion";
import {
  MessageSquare,
  FileSearch,
  Palette,
  Code,
  TestTube,
  Rocket,
  ArrowRight
} from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Бриф",
    description: "Обсуждаем задачу, требования и сроки. Бесплатная консультация.",
    icon: MessageSquare,
    color: "#00ffff",
  },
  {
    number: "02",
    title: "Анализ",
    description: "Изучаем нишу, конкурентов. Готовим ТЗ и смету.",
    icon: FileSearch,
    color: "#ff00ff",
  },
  {
    number: "03",
    title: "Дизайн",
    description: "Создаём прототипы и UI/UX дизайн. Утверждаем с вами.",
    icon: Palette,
    color: "#00ff88",
  },
  {
    number: "04",
    title: "Разработка",
    description: "Пишем код, интегрируем API. Еженедельные демо.",
    icon: Code,
    color: "#ffaa00",
  },
  {
    number: "05",
    title: "Тестирование",
    description: "QA тестирование, исправление багов, оптимизация.",
    icon: TestTube,
    color: "#ff5555",
  },
  {
    number: "06",
    title: "Запуск",
    description: "Деплой на сервер, обучение, поддержка 30 дней.",
    icon: Rocket,
    color: "#00ffff",
  },
];

export function WorkProcess() {
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
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
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
                  <step.icon
                    className="w-6 h-6"
                    style={{ color: step.color }}
                  />
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>

                {/* Arrow to next (hidden on last in row) */}
                {index < steps.length - 1 && (index + 1) % 3 !== 0 && (
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
