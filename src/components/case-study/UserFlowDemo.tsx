"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Play, Check } from "lucide-react";
import * as LucideIcons from "lucide-react";
import type { UserFlow } from "@/data/projects";
import { cn } from "@/lib/utils";

interface UserFlowDemoProps {
  flows: UserFlow[];
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

export function UserFlowDemo({ flows }: UserFlowDemoProps) {
  const [activeFlow, setActiveFlow] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const currentFlow = flows[activeFlow];
  const currentSteps = currentFlow?.steps || [];

  // Auto-play functionality
  const playDemo = () => {
    const steps = flows[activeFlow]?.steps || [];
    if (steps.length === 0) return;

    setIsPlaying(true);
    setActiveStep(0);

    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step >= steps.length) {
        clearInterval(interval);
        setIsPlaying(false);
      } else {
        setActiveStep(step);
      }
    }, 1500);
  };

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
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-4">
            <DynamicIcon name="play-circle" className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-accent">Интерактивная демонстрация</span>
          </div>
          <h2 className="text-3xl font-display tracking-wide mb-4">
            <span className="text-foreground">Как это </span>
            <span className="text-primary">работает</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Нажмите «Запустить демо» чтобы увидеть путь пользователя по шагам
          </p>
        </motion.div>

        {/* Flow selector tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-10 relative z-20">
          {flows.map((flow, index) => {
            const isActive = activeFlow === index;
            return (
              <button
                key={flow.id}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log("Tab clicked:", index, flow.title);
                  setActiveFlow(index);
                  setActiveStep(0);
                  setIsPlaying(false);
                }}
                className={cn(
                  "flex items-center gap-2 px-5 py-3 rounded-xl border transition-all duration-300 relative z-10 cursor-pointer",
                  isActive
                    ? "bg-primary/10 border-primary text-primary shadow-[0_0_15px_rgba(0,255,255,0.2)]"
                    : "bg-card border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                )}
              >
                <DynamicIcon name={flow.icon} className="w-5 h-5" />
                <span className="font-medium">{flow.title}</span>
              </button>
            );
          })}
        </div>

        {/* Flow description */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeFlow}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="text-center mb-8"
          >
            <p className="text-muted-foreground">{currentFlow?.description}</p>
          </motion.div>
        </AnimatePresence>

        {/* Interactive flow visualization */}
        <div className="relative max-w-5xl mx-auto">
          {/* Play button */}
          <div className="flex justify-center mb-8">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={playDemo}
              disabled={isPlaying}
              className={cn(
                "flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300",
                isPlaying
                  ? "bg-muted text-muted-foreground cursor-not-allowed"
                  : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_20px_rgba(0,255,255,0.3)]"
              )}
            >
              <Play className="w-5 h-5" />
              {isPlaying ? "Воспроизведение..." : "Запустить демо"}
            </motion.button>
          </div>

          {/* Steps visualization */}
          <div className="relative">
            {/* Connection line */}
            <div className="absolute top-12 left-0 right-0 h-0.5 bg-border hidden lg:block" />
            <motion.div
              className="absolute top-12 left-0 h-0.5 bg-primary hidden lg:block"
              initial={{ width: "0%" }}
              animate={{ width: `${(activeStep / (currentSteps.length - 1)) * 100}%` }}
              transition={{ duration: 0.5 }}
              style={{ boxShadow: "0 0 10px var(--primary)" }}
            />

            {/* Steps */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeFlow}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-2"
              >
                {currentSteps.map((step, index) => {
                  const isActive = index === activeStep;
                  const isCompleted = index < activeStep;

                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      onClick={() => {
                        setActiveStep(index);
                        setIsPlaying(false);
                      }}
                      className="relative cursor-pointer group"
                    >
                      {/* Step indicator */}
                      <div className="flex justify-center mb-4">
                        <div
                          className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 z-10 bg-background",
                            isActive && "border-primary bg-primary/20 shadow-[0_0_15px_rgba(0,255,255,0.5)]",
                            isCompleted && "border-green-500 bg-green-500/20",
                            !isActive && !isCompleted && "border-border group-hover:border-primary/50"
                          )}
                        >
                          {isCompleted ? (
                            <Check className="w-5 h-5 text-green-500" />
                          ) : (
                            <span
                              className={cn(
                                "text-sm font-bold transition-colors",
                                isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                              )}
                            >
                              {index + 1}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Step card */}
                      <div
                        className={cn(
                          "p-4 rounded-xl border transition-all duration-300",
                          isActive
                            ? "bg-primary/5 border-primary shadow-[0_0_20px_rgba(0,255,255,0.15)]"
                            : "bg-card border-border group-hover:border-primary/30"
                        )}
                      >
                        {step.icon && (
                          <div
                            className={cn(
                              "w-8 h-8 rounded-lg flex items-center justify-center mb-3 transition-colors",
                              isActive ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                            )}
                          >
                            <DynamicIcon name={step.icon} className="w-4 h-4" />
                          </div>
                        )}
                        <h4
                          className={cn(
                            "font-semibold mb-1 transition-colors",
                            isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                          )}
                        >
                          {step.title}
                        </h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">{step.description}</p>
                      </div>

                      {/* Arrow between steps (mobile) */}
                      {index < currentSteps.length - 1 && (
                        <div className="flex justify-center my-2 md:hidden">
                          <ChevronRight
                            className={cn(
                              "w-5 h-5 rotate-90 transition-colors",
                              isCompleted ? "text-green-500" : "text-border"
                            )}
                          />
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
