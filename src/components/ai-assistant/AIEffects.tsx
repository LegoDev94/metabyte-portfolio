"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Bot, ArrowRight, X } from "lucide-react";
import confetti from "canvas-confetti";

// ============================================
// TYPES
// ============================================

interface FloatingReaction {
  id: string;
  emoji: string;
  x: number;
  y: number;
}

interface AIBubble {
  id: string;
  message: string;
  x: number;
  y: number;
  type: "tip" | "comment" | "celebration";
}

interface SpotlightTarget {
  selector: string;
  message: string;
}

// ============================================
// MATRIX RAIN EFFECT
// ============================================

export function MatrixRain({ duration = 5000, onComplete }: { duration?: number; onComplete?: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const chars = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF<>/{}[]";
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops: number[] = Array(columns).fill(1);

    const draw = () => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "#00ffff";
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    const interval = setInterval(draw, 33);
    const timeout = setTimeout(() => {
      clearInterval(interval);
      onComplete?.();
    }, duration);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [duration, onComplete]);

  return (
    <motion.canvas
      ref={canvasRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] pointer-events-none"
    />
  );
}

// ============================================
// GLITCH EFFECT
// ============================================

export function GlitchOverlay({ duration = 2000, onComplete }: { duration?: number; onComplete?: () => void }) {
  useEffect(() => {
    const timeout = setTimeout(() => {
      onComplete?.();
    }, duration);
    return () => clearTimeout(timeout);
  }, [duration, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] pointer-events-none"
    >
      {/* Scanlines */}
      <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,255,255,0.03)_50%)] bg-[length:100%_4px] animate-pulse" />

      {/* RGB Split effect */}
      <motion.div
        animate={{
          x: [0, -3, 3, -2, 0],
          opacity: [0.5, 0.8, 0.5, 0.7, 0.5],
        }}
        transition={{ repeat: Infinity, duration: 0.2 }}
        className="absolute inset-0 mix-blend-screen"
        style={{
          background: "linear-gradient(90deg, rgba(255,0,0,0.1) 33%, rgba(0,255,0,0.1) 33% 66%, rgba(0,0,255,0.1) 66%)",
        }}
      />

      {/* Noise */}
      <div className="absolute inset-0 opacity-20">
        <svg className="w-full h-full">
          <filter id="noise">
            <feTurbulence baseFrequency="0.9" numOctaves="4" seed={Date.now()} />
          </filter>
          <rect width="100%" height="100%" filter="url(#noise)" />
        </svg>
      </div>
    </motion.div>
  );
}

// ============================================
// PARTICLE EXPLOSION
// ============================================

export function ParticleExplosion({ x, y, color = "#00ffff", count = 30 }: { x: number; y: number; color?: string; count?: number }) {
  const particles = Array.from({ length: count }, (_, i) => ({
    id: i,
    angle: (360 / count) * i,
    distance: 50 + Math.random() * 100,
  }));

  return (
    <div className="fixed inset-0 z-[200] pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ x, y, scale: 1, opacity: 1 }}
          animate={{
            x: x + Math.cos((p.angle * Math.PI) / 180) * p.distance,
            y: y + Math.sin((p.angle * Math.PI) / 180) * p.distance,
            scale: 0,
            opacity: 0,
          }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="absolute w-2 h-2 rounded-full"
          style={{ backgroundColor: color }}
        />
      ))}
    </div>
  );
}

// ============================================
// FLOATING AI BUBBLE
// ============================================

export function AIBubbleComponent({ bubble, onClose }: { bubble: AIBubble; onClose: () => void }) {
  useEffect(() => {
    const timeout = setTimeout(onClose, 8000);
    return () => clearTimeout(timeout);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: -10 }}
      className="fixed z-[100] max-w-xs right-6 bottom-24"
    >
      <div className="relative bg-card border border-primary/30 rounded-2xl p-3 shadow-lg shadow-primary/10">
        {/* Arrow pointing down to AI button */}
        <div className="absolute -bottom-2 right-4 w-4 h-4 bg-card border-b border-r border-primary/30 rotate-45" />

        <div className="flex items-start gap-2">
          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
            <Bot className="w-3 h-3 text-primary" />
          </div>
          <p className="text-sm text-foreground">{bubble.message}</p>
          <button
            onClick={onClose}
            className="p-1 hover:bg-muted rounded transition-colors flex-shrink-0"
          >
            <X className="w-3 h-3 text-muted-foreground" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================
// FLOATING REACTIONS
// ============================================

export function FloatingReactionComponent({ reaction }: { reaction: FloatingReaction }) {
  return (
    <motion.div
      initial={{ opacity: 1, y: 0, scale: 1 }}
      animate={{ opacity: 0, y: -50, scale: 1.5 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.5 }}
      className="fixed z-[150] text-2xl pointer-events-none"
      style={{ left: reaction.x, top: reaction.y }}
    >
      {reaction.emoji}
    </motion.div>
  );
}

// ============================================
// SPOTLIGHT EFFECT
// ============================================

export function SpotlightEffect({
  target,
  message,
  onClose,
  locale = "ru"
}: {
  target: Element;
  message: string;
  onClose: () => void;
  locale?: string;
}) {
  const rect = target.getBoundingClientRect();
  const padding = 10;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[90]"
      onClick={onClose}
    >
      {/* Dark overlay with hole */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Spotlight hole */}
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        className="absolute rounded-xl"
        style={{
          left: rect.left - padding,
          top: rect.top - padding,
          width: rect.width + padding * 2,
          height: rect.height + padding * 2,
          boxShadow: `
            0 0 0 9999px rgba(0,0,0,0.6),
            0 0 30px rgba(0,255,255,0.5),
            inset 0 0 20px rgba(0,255,255,0.3)
          `,
        }}
      />

      {/* Pulsing ring */}
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute rounded-xl border-2 border-primary"
        style={{
          left: rect.left - padding,
          top: rect.top - padding,
          width: rect.width + padding * 2,
          height: rect.height + padding * 2,
        }}
      />

      {/* AI Message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="absolute"
        style={{
          left: rect.left,
          top: rect.bottom + 20,
        }}
      >
        <div className="bg-card border border-primary/30 rounded-xl p-4 max-w-sm shadow-lg shadow-primary/20">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-sm text-foreground mb-2">{message}</p>
              <button
                onClick={onClose}
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                {locale === "ro" ? "Am înțeles" : "Понятно"} <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ============================================
// EXIT INTENT POPUP
// ============================================

export function ExitIntentPopup({
  onClose,
  onContact,
  userName,
  locale = "ru",
}: {
  onClose: () => void;
  onContact: () => void;
  userName?: string;
  locale?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 50 }}
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-md mx-4"
      >
        {/* Glow */}
        <div className="absolute -inset-4 bg-gradient-to-r from-primary/30 via-accent/30 to-primary/30 rounded-3xl blur-xl" />

        <div className="relative bg-card border border-primary/30 rounded-2xl p-6 shadow-2xl">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>

          {/* Avatar */}
          <div className="flex justify-center mb-4">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/30"
            >
              <Bot className="w-8 h-8 text-primary-foreground" />
            </motion.div>
          </div>

          <h2 className="text-xl font-display text-center text-foreground mb-2">
            {locale === "ro"
              ? (userName ? `${userName}, așteptați!` : "Așteptați!")
              : (userName ? `${userName}, подождите!` : "Подождите!")}
          </h2>

          <p className="text-center text-muted-foreground mb-4">
            {locale === "ro"
              ? "Plecați deja? Lăsați contactul — vă voi trimite o selecție cu cele mai bune proiecte și voi putea răspunde la întrebări!"
              : "Уже уходите? Оставьте контакт — я отправлю вам подборку лучших проектов и смогу ответить на вопросы!"}
          </p>

          <div className="flex gap-3">
            <button
              onClick={onContact}
              className="flex-1 py-3 px-4 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/30"
            >
              {locale === "ro" ? "Lăsați contactul" : "Оставить контакт"}
            </button>
            <button
              onClick={onClose}
              className="py-3 px-4 bg-muted text-muted-foreground rounded-xl hover:bg-muted/80 transition-colors"
            >
              {locale === "ro" ? "Nu acum" : "Не сейчас"}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ============================================
// PROGRESS CELEBRATION
// ============================================

export function ProgressCelebration({
  projectsViewed,
  onClose,
  onAskFavorite,
  locale = "ru",
}: {
  projectsViewed: number;
  onClose: () => void;
  onAskFavorite: () => void;
  locale?: string;
}) {
  useEffect(() => {
    // Trigger confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#00ffff", "#ff00ff", "#00ff00"],
    });
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 50 }}
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-sm mx-4"
      >
        <div className="absolute -inset-4 bg-gradient-to-r from-primary/30 via-accent/30 to-primary/30 rounded-3xl blur-xl" />

        <div className="relative bg-card border border-primary/30 rounded-2xl p-6 shadow-2xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>

          <div className="flex flex-col items-center text-center mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-3 shadow-lg shadow-primary/30">
              <span className="text-3xl">🎉</span>
            </div>
            <h3 className="text-xl font-bold text-foreground">
              {locale === "ro" ? "Excelent!" : "Отлично!"}
            </h3>
            <p className="text-muted-foreground">
              {locale === "ro"
                ? `Ați explorat deja ${projectsViewed} proiect${projectsViewed === 1 ? "" : "e"}!`
                : `Вы изучили уже ${projectsViewed} проект${projectsViewed === 1 ? "" : projectsViewed < 5 ? "а" : "ов"}!`}
            </p>
          </div>

          <p className="text-center text-muted-foreground mb-4">
            {locale === "ro"
              ? "Care v-a plăcut cel mai mult? Spuneți-ne în chat!"
              : "Какой понравился больше всего? Расскажите в чате!"}
          </p>

          <button
            onClick={onAskFavorite}
            className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/30"
          >
            {locale === "ro" ? "Povestiți" : "Рассказать"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ============================================
// TYPING TEXT EFFECT
// ============================================

export function TypingText({
  text,
  speed = 50,
  onComplete,
}: {
  text: string;
  speed?: number;
  onComplete?: () => void;
}) {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayed(text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
        onComplete?.();
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed, onComplete]);

  return (
    <span>
      {displayed}
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ repeat: Infinity, duration: 0.5 }}
      >
        |
      </motion.span>
    </span>
  );
}

// ============================================
// HACK TERMINAL EFFECT
// ============================================

export function HackTerminal({
  duration = 3000,
  onComplete,
  locale = "ru"
}: {
  duration?: number;
  onComplete?: () => void;
  locale?: string;
}) {
  const [lines, setLines] = useState<string[]>([]);
  const hackLines = locale === "ro" ? [
    "Inițializare hack...",
    "Conectare la server...",
    "Ocolire firewall... [OK]",
    "Obținere acces...",
    "Descărcare date...",
    "root@metabyte:~# ACCESS GRANTED",
    "Glumesc! 😄 E doar un efect",
  ] : [
    "Инициализация взлома...",
    "Подключение к серверу...",
    "Обход файрволла... [OK]",
    "Получение доступа...",
    "Скачивание данных...",
    "root@metabyte:~# ACCESS GRANTED",
    "Шучу! 😄 Это просто эффект",
  ];

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < hackLines.length) {
        setLines((prev) => [...prev, hackLines[i]]);
        i++;
      } else {
        clearInterval(interval);
        setTimeout(() => onComplete?.(), 1000);
      }
    }, duration / hackLines.length);

    return () => clearInterval(interval);
  }, [duration, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-4"
    >
      <div className="w-full max-w-2xl bg-black border border-green-500/50 rounded-lg p-4 font-mono text-green-500 text-sm">
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-green-500/30">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="ml-2 text-xs">terminal@metabyte</span>
        </div>

        {lines.map((line, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-1"
          >
            <span className="text-green-300">$</span> {line}
          </motion.div>
        ))}

        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ repeat: Infinity, duration: 0.5 }}
          className="inline-block w-2 h-4 bg-green-500 ml-1"
        />
      </div>
    </motion.div>
  );
}

// ============================================
// EMOJI RAIN
// ============================================

export function EmojiRain({
  emojis = ["🚀", "💻", "⚡", "🎮", "💰"],
  duration = 3000,
  onComplete,
}: {
  emojis?: string[];
  duration?: number;
  onComplete?: () => void;
}) {
  const [drops, setDrops] = useState<Array<{ id: number; emoji: string; x: number; delay: number }>>([]);

  useEffect(() => {
    const newDrops = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
      x: Math.random() * 100,
      delay: Math.random() * 2,
    }));
    setDrops(newDrops);

    const timeout = setTimeout(() => onComplete?.(), duration);
    return () => clearTimeout(timeout);
  }, [emojis, duration, onComplete]);

  return (
    <div className="fixed inset-0 z-[200] pointer-events-none overflow-hidden">
      {drops.map((drop) => (
        <motion.div
          key={drop.id}
          initial={{ y: -50, x: `${drop.x}vw` }}
          animate={{ y: "110vh" }}
          transition={{
            duration: 3,
            delay: drop.delay,
            ease: "linear",
          }}
          className="absolute text-3xl"
        >
          {drop.emoji}
        </motion.div>
      ))}
    </div>
  );
}

// ============================================
// HOOK: useAIEffects
// ============================================

export function useAIEffects() {
  const [activeEffect, setActiveEffect] = useState<string | null>(null);
  const [floatingReactions, setFloatingReactions] = useState<FloatingReaction[]>([]);
  const [aiBubbles, setAIBubbles] = useState<AIBubble[]>([]);
  const [showExitIntent, setShowExitIntent] = useState(false);
  const [spotlightTarget, setSpotlightTarget] = useState<{ element: Element; message: string } | null>(null);
  const [progressCelebration, setProgressCelebration] = useState<number | null>(null);
  const exitIntentShownRef = useRef(false);

  // Trigger Matrix effect
  const showMatrix = useCallback((duration = 5000) => {
    setActiveEffect("matrix");
    setTimeout(() => setActiveEffect(null), duration);
  }, []);

  // Trigger Glitch effect
  const showGlitch = useCallback((duration = 2000) => {
    setActiveEffect("glitch");
    setTimeout(() => setActiveEffect(null), duration);
  }, []);

  // Trigger Hack Terminal
  const showHackTerminal = useCallback((duration = 4000) => {
    setActiveEffect("hack");
    setTimeout(() => setActiveEffect(null), duration);
  }, []);

  // Trigger Emoji Rain
  const showEmojiRain = useCallback((emojis?: string[], duration = 3000) => {
    setActiveEffect("emoji");
    setTimeout(() => setActiveEffect(null), duration);
  }, []);

  // Add floating reaction
  const addReaction = useCallback((emoji: string, x: number, y: number) => {
    const id = Date.now().toString();
    setFloatingReactions((prev) => [...prev, { id, emoji, x, y }]);
    setTimeout(() => {
      setFloatingReactions((prev) => prev.filter((r) => r.id !== id));
    }, 1500);
  }, []);

  // Add AI bubble
  const addBubble = useCallback((message: string, x: number, y: number, type: AIBubble["type"] = "tip") => {
    const id = Date.now().toString();
    setAIBubbles((prev) => [...prev, { id, message, x, y, type }]);
  }, []);

  // Remove AI bubble
  const removeBubble = useCallback((id: string) => {
    setAIBubbles((prev) => prev.filter((b) => b.id !== id));
  }, []);

  // Show spotlight
  const showSpotlight = useCallback((selector: string, message: string) => {
    const element = document.querySelector(selector);
    if (element) {
      setSpotlightTarget({ element, message });
    }
  }, []);

  // Show progress celebration
  const showProgressCelebration = useCallback((count: number) => {
    setProgressCelebration(count);
  }, []);

  // Exit intent detection
  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !exitIntentShownRef.current) {
        exitIntentShownRef.current = true;
        setShowExitIntent(true);
      }
    };

    document.addEventListener("mouseleave", handleMouseLeave);
    return () => document.removeEventListener("mouseleave", handleMouseLeave);
  }, []);

  return {
    activeEffect,
    floatingReactions,
    aiBubbles,
    showExitIntent,
    spotlightTarget,
    progressCelebration,
    showMatrix,
    showGlitch,
    showHackTerminal,
    showEmojiRain,
    addReaction,
    addBubble,
    removeBubble,
    showSpotlight,
    showProgressCelebration,
    setShowExitIntent,
    setSpotlightTarget,
    setProgressCelebration,
  };
}
