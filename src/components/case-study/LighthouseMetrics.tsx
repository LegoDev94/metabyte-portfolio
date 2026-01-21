"use client";

import { motion } from "framer-motion";
import { Gauge, Eye, ShieldCheck, Search, Zap, Timer, Clock, Move } from "lucide-react";
import type { PerformanceMetrics } from "@/data/projects";

interface LighthouseMetricsProps {
  metrics: PerformanceMetrics;
}

interface CircularProgressProps {
  value: number;
  label: string;
  icon: React.ReactNode;
  color: string;
  delay?: number;
}

function CircularProgress({ value, label, icon, color, delay = 0 }: CircularProgressProps) {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  const getScoreColor = (score: number) => {
    if (score >= 90) return "#00ff00";
    if (score >= 50) return "#ffaa00";
    return "#ff4444";
  };

  const actualColor = color === "auto" ? getScoreColor(value) : color;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="flex flex-col items-center"
    >
      <div className="relative w-28 h-28">
        {/* Background circle */}
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="56"
            cy="56"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-border"
          />
          <motion.circle
            cx="56"
            cy="56"
            r={radius}
            fill="none"
            stroke={actualColor}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            whileInView={{ strokeDashoffset }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, delay: delay + 0.2, ease: "easeOut" }}
            style={{ filter: `drop-shadow(0 0 8px ${actualColor}50)` }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: delay + 1 }}
            className="text-2xl font-bold"
            style={{ color: actualColor }}
          >
            {value}
          </motion.span>
          <span className="text-xs text-muted-foreground mt-0.5">{icon}</span>
        </div>
      </div>
      <span className="text-sm text-muted-foreground mt-3 text-center">{label}</span>
    </motion.div>
  );
}

interface MetricBadgeProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  delay?: number;
}

function MetricBadge({ label, value, icon, delay = 0 }: MetricBadgeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3, delay }}
      className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors"
    >
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
        {icon}
      </div>
      <div>
        <div className="text-lg font-semibold text-foreground">{value}</div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </div>
    </motion.div>
  );
}

export function LighthouseMetrics({ metrics }: LighthouseMetricsProps) {
  return (
    <section className="py-12">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 mb-4">
            <Gauge className="w-4 h-4 text-green-400" />
            <span className="text-sm font-medium text-green-400">Google Lighthouse — официальный тест скорости</span>
          </div>
          <h2 className="text-3xl font-display tracking-wide">
            <span className="text-foreground">Быстрее </span>
            <span className="text-primary">95% сайтов в интернете</span>
          </h2>
          <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
            Каждая секунда задержки = -7% конверсии. Этот сайт загружается мгновенно — пользователи не уходят.
          </p>
        </motion.div>

        {/* Main scores */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <CircularProgress
            value={metrics.score}
            label="Производительность"
            icon={<Zap className="w-4 h-4" />}
            color="auto"
            delay={0}
          />
          <CircularProgress
            value={metrics.accessibility}
            label="Доступность"
            icon={<Eye className="w-4 h-4" />}
            color="auto"
            delay={0.1}
          />
          <CircularProgress
            value={metrics.bestPractices}
            label="Лучшие практики"
            icon={<ShieldCheck className="w-4 h-4" />}
            color="auto"
            delay={0.2}
          />
          <CircularProgress
            value={metrics.seo}
            label="SEO"
            icon={<Search className="w-4 h-4" />}
            color="auto"
            delay={0.3}
          />
        </div>

        {/* Detailed metrics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <MetricBadge
            label="Первая отрисовка"
            value={metrics.fcp}
            icon={<Zap className="w-5 h-5" />}
            delay={0.4}
          />
          <MetricBadge
            label="Загрузка контента"
            value={metrics.lcp}
            icon={<Timer className="w-5 h-5" />}
            delay={0.5}
          />
          <MetricBadge
            label="Время блокировки"
            value={metrics.tbt}
            icon={<Clock className="w-5 h-5" />}
            delay={0.6}
          />
          <MetricBadge
            label="Сдвиг макета"
            value={metrics.cls}
            icon={<Move className="w-5 h-5" />}
            delay={0.7}
          />
          <MetricBadge
            label="Индекс скорости"
            value={metrics.speedIndex}
            icon={<Gauge className="w-5 h-5" />}
            delay={0.8}
          />
        </div>
      </div>
    </section>
  );
}
