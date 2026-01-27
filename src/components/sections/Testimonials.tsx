"use client";

import { motion } from "framer-motion";
import { Star, ExternalLink, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Testimonial, TestimonialStats } from "@/lib/db/testimonials";
import { useLocaleContext } from "@/components/providers/LocaleProvider";

interface TestimonialsProps {
  testimonials?: Testimonial[];
  stats?: TestimonialStats | null;
}

// Default hardcoded data for fallback
const defaultTestimonials: Testimonial[] = [
  {
    id: "1",
    author: "Inna N.",
    task: "Сложный телеграм бот",
    text: "Владимир проделал отличную работу по созданию Telegram-бота, который взаимодействует с нашим API. Задание было выполнено на высоком уровне, все требования были учтены, и бот работает безупречно.",
    rating: 5,
    source: "YouDo",
  },
  {
    id: "2",
    author: "Татьяна М.",
    task: "Доделать сайт на React",
    text: "Огромное спасибо Владимиру за проделанную работу. В процессе нам потребовалось сделать даже больше, чем мы планировали, и Владимир отлично со всем справился, сделав все очень качественно.",
    rating: 5,
    source: "YouDo",
  },
  {
    id: "3",
    author: "Иван И.",
    task: "Разработка сайта",
    text: "Профессионально и четко проговорили, спланировали и реализовали проект сайта. Рекомендую!",
    rating: 5,
    source: "YouDo",
  },
  {
    id: "4",
    author: "Елизавета",
    task: "Создать мобильное приложение",
    text: "Владимир сделал именно то, что было нужно, был внимателен к мельчайшим деталям и изменениям, которые я вносила по ходу.",
    rating: 5,
    source: "YouDo",
  },
  {
    id: "5",
    author: "Ростислав К.",
    task: "Разработка в Telegram",
    text: "Очень рекомендую этого человека для сотрудничества: он вежлив, доброжелателен и всегда придерживается установленных сроков.",
    rating: 5,
    source: "YouDo",
  },
  {
    id: "6",
    author: "Роман",
    task: "Сделать сайт рулетку кс",
    text: "Все максимально внятно, понятно, а главное быстро. Созвонились по видео, обсудили все детали и рабочие моменты, спустя пару часов приступили к работе. Рекомендую",
    rating: 5,
    source: "YouDo",
  },
];

const defaultStats: TestimonialStats = {
  avgRating: 4.9,
  totalPositive: 28,
  totalNegative: 0,
  platform: "YouDo",
  platformUrl: "https://youdo.com/u11536152",
};

export function Testimonials({ testimonials, stats }: TestimonialsProps) {
  const { locale } = useLocaleContext();
  const items = testimonials && testimonials.length > 0 ? testimonials : defaultTestimonials;
  const displayStats = stats || defaultStats;

  return (
    <section className="py-16 border-t border-border">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-display tracking-wide mb-4">
            <span className="text-foreground">
              {locale === "ro" ? "Recenzii " : "Отзывы "}
            </span>
            <span className="text-primary text-glow-cyan">
              {locale === "ro" ? "clienti" : "клиентов"}
            </span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            {locale === "ro"
              ? `Recenzii reale de la clienti de pe platforma ${displayStats.platform}`
              : `Реальные отзывы заказчиков с платформы ${displayStats.platform}`}
          </p>

          {/* Stats */}
          <div className="flex items-center justify-center gap-4 sm:gap-8 mt-6 flex-wrap">
            <div className="text-center min-w-[80px]">
              <div className="flex items-center justify-center gap-1 mb-1">
                <span className="text-2xl sm:text-3xl font-display text-primary">{displayStats.avgRating}</span>
                <Star className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500 fill-yellow-500" />
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground">
                {locale === "ro" ? "Nota medie" : "Средняя оценка"}
              </div>
            </div>
            <div className="w-px h-10 sm:h-12 bg-border hidden sm:block" />
            <div className="text-center min-w-[80px]">
              <div className="text-2xl sm:text-3xl font-display text-green-500">{displayStats.totalPositive}</div>
              <div className="text-xs sm:text-sm text-muted-foreground">
                {locale === "ro" ? "Pozitive" : "Положительных"}
              </div>
            </div>
            <div className="w-px h-10 sm:h-12 bg-border hidden sm:block" />
            <div className="text-center min-w-[80px]">
              <div className="text-2xl sm:text-3xl font-display text-muted-foreground">{displayStats.totalNegative}</div>
              <div className="text-xs sm:text-sm text-muted-foreground">
                {locale === "ro" ? "Negative" : "Отрицательных"}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {items.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all duration-300 relative"
            >
              {/* Quote Icon */}
              <Quote className="absolute top-4 right-4 w-8 h-8 text-primary/10" />

              {/* Rating */}
              <div className="flex items-center gap-1 mb-3">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                ))}
              </div>

              {/* Task */}
              <div className="text-xs text-primary font-mono mb-2">
                {testimonial.task}
              </div>

              {/* Text */}
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                &ldquo;{testimonial.text}&rdquo;
              </p>

              {/* Author */}
              <div className="text-sm font-medium text-foreground">
                {testimonial.author}
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center"
        >
          <Button
            asChild
            variant="outline"
            className="border-border hover:border-primary hover:text-primary"
          >
            <a
              href={displayStats.platformUrl || "https://youdo.com/u11536152"}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              {locale === "ro"
                ? `Toate recenziile pe ${displayStats.platform}`
                : `Все отзывы на ${displayStats.platform}`}
            </a>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
