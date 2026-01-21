"use client";

import { motion } from "framer-motion";
import { AlertTriangle, Lightbulb, Trophy, Check, TrendingUp } from "lucide-react";

interface ChallengeSolutionProps {
  challenge: string;
  solution: string;
  results: string[];
}

// Animated neon arrow component
function NeonArrow({ color = "primary", delay = 0 }: { color?: "orange" | "primary"; delay?: number }) {
  const gradientColors = color === "orange"
    ? { from: "#f97316", to: "#00ffff" }
    : { from: "#00ffff", to: "#22c55e" };

  return (
    <div className="hidden lg:flex absolute -right-6 top-1/2 -translate-y-1/2 z-10">
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: delay + 0.3 }}
        className="relative"
      >
        {/* Glow effect */}
        <motion.div
          animate={{
            opacity: [0.3, 0.7, 0.3],
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute inset-0 blur-md"
          style={{
            background: `linear-gradient(90deg, ${gradientColors.from}, ${gradientColors.to})`,
            borderRadius: "50%"
          }}
        />

        {/* Arrow SVG */}
        <svg
          width="48"
          height="48"
          viewBox="0 0 48 48"
          className="relative z-10"
        >
          <defs>
            <linearGradient id={`arrow-gradient-${color}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={gradientColors.from} />
              <stop offset="100%" stopColor={gradientColors.to} />
            </linearGradient>
            <filter id={`glow-${color}`}>
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Animated line */}
          <motion.path
            d="M8 24 L32 24"
            stroke={`url(#arrow-gradient-${color})`}
            strokeWidth="3"
            strokeLinecap="round"
            filter={`url(#glow-${color})`}
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: delay + 0.4 }}
          />

          {/* Arrow head */}
          <motion.path
            d="M28 16 L40 24 L28 32"
            stroke={`url(#arrow-gradient-${color})`}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            filter={`url(#glow-${color})`}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: delay + 0.8 }}
          />

          {/* Animated dot traveling along the arrow */}
          <motion.circle
            r="3"
            fill={gradientColors.to}
            filter={`url(#glow-${color})`}
            animate={{
              cx: [8, 40],
              opacity: [0, 1, 1, 0]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatDelay: 1,
              ease: "easeInOut"
            }}
            cy="24"
          />
        </svg>
      </motion.div>
    </div>
  );
}

// Mobile arrow (vertical)
function MobileArrow({ color = "primary" }: { color?: "orange" | "primary" | "green" }) {
  const gradientColors = {
    orange: { from: "#f97316", to: "#00ffff" },
    primary: { from: "#00ffff", to: "#22c55e" },
    green: { from: "#22c55e", to: "#00ffff" }
  }[color];

  return (
    <div className="flex lg:hidden justify-center py-4">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="relative"
      >
        <svg width="32" height="32" viewBox="0 0 32 32">
          <defs>
            <linearGradient id={`mobile-arrow-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={gradientColors.from} />
              <stop offset="100%" stopColor={gradientColors.to} />
            </linearGradient>
          </defs>
          <motion.path
            d="M16 4 L16 20 M8 16 L16 28 L24 16"
            stroke={`url(#mobile-arrow-${color})`}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          />
        </svg>
      </motion.div>
    </div>
  );
}

export function ChallengeSolution({ challenge, solution, results }: ChallengeSolutionProps) {
  return (
    <section className="py-16 border-t border-border bg-gradient-to-br from-card/50 to-background">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Бизнес-результат</span>
          </div>
          <h2 className="text-3xl font-display tracking-wide">
            <span className="text-foreground">Задача клиента → </span>
            <span className="text-primary">Результат</span>
          </h2>
          <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
            Как я решил бизнес-задачу и какую ценность это принесло
          </p>
        </motion.div>

        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-4 lg:gap-8">
            {/* Challenge */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              <div className="p-6 rounded-2xl border border-orange-500/30 bg-orange-500/5 h-full">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-orange-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-orange-400">Задача клиента</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed">{challenge}</p>
              </div>

              {/* Neon Arrow */}
              <NeonArrow color="orange" delay={0} />
            </motion.div>

            {/* Mobile Arrow */}
            <MobileArrow color="orange" />

            {/* Solution */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="relative"
            >
              <div className="p-6 rounded-2xl border border-primary/30 bg-primary/5 h-full">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                    <Lightbulb className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-primary">Что я сделал</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed">{solution}</p>
              </div>

              {/* Neon Arrow */}
              <NeonArrow color="primary" delay={0.2} />
            </motion.div>

            {/* Mobile Arrow */}
            <MobileArrow color="primary" />

            {/* Results */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="p-6 rounded-2xl border border-green-500/30 bg-green-500/5 h-full relative overflow-hidden">
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-transparent to-transparent pointer-events-none" />

                <div className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                      <Trophy className="w-5 h-5 text-green-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-green-400">Бизнес-результат</h3>
                  </div>
                  <ul className="space-y-3">
                    {results.map((result, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: 10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                        className="flex items-start gap-2"
                      >
                        <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-1" />
                        <span className="text-sm text-foreground/80">{result}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
