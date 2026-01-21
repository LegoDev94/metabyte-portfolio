"use client";

import { motion } from "framer-motion";
import { Star, ExternalLink, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";

const testimonials = [
  {
    author: "Inna N.",
    task: "Сложный телеграм бот",
    text: "Владимир проделал отличную работу по созданию Telegram-бота, который взаимодействует с нашим API. Задание было выполнено на высоком уровне, все требования были учтены, и бот работает безупречно.",
    rating: 5,
  },
  {
    author: "Татьяна М.",
    task: "Доделать сайт на React",
    text: "Огромное спасибо Владимиру за проделанную работу. В процессе нам потребовалось сделать даже больше, чем мы планировали, и Владимир отлично со всем справился, сделав все очень качественно.",
    rating: 5,
  },
  {
    author: "Иван И.",
    task: "Разработка сайта",
    text: "Профессионально и четко проговорили, спланировали и реализовали проект сайта. Рекомендую!",
    rating: 5,
  },
  {
    author: "Елизавета",
    task: "Создать мобильное приложение",
    text: "Владимир сделал именно то, что было нужно, был внимателен к мельчайшим деталям и изменениям, которые я вносила по ходу.",
    rating: 5,
  },
  {
    author: "Ростислав К.",
    task: "Разработка в Telegram",
    text: "Очень рекомендую этого человека для сотрудничества: он вежлив, доброжелателен и всегда придерживается установленных сроков.",
    rating: 5,
  },
  {
    author: "Роман",
    task: "Сделать сайт рулетку кс",
    text: "Все максимально внятно, понятно, а главное быстро. Созвонились по видео, обсудили все детали и рабочие моменты, спустя пару часов приступили к работе. Рекомендую",
    rating: 5,
  },
];

const stats = {
  rating: 4.9,
  positive: 27,
  negative: 0,
};

export function Testimonials() {
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
            <span className="text-foreground">Отзывы </span>
            <span className="text-primary text-glow-cyan">клиентов</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Реальные отзывы заказчиков с платформы YouDo
          </p>

          {/* Stats */}
          <div className="flex items-center justify-center gap-8 mt-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <span className="text-3xl font-display text-primary">{stats.rating}</span>
                <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
              </div>
              <div className="text-sm text-muted-foreground">Средняя оценка</div>
            </div>
            <div className="w-px h-12 bg-border" />
            <div className="text-center">
              <div className="text-3xl font-display text-green-500">{stats.positive}</div>
              <div className="text-sm text-muted-foreground">Положительных</div>
            </div>
            <div className="w-px h-12 bg-border" />
            <div className="text-center">
              <div className="text-3xl font-display text-muted-foreground">{stats.negative}</div>
              <div className="text-sm text-muted-foreground">Отрицательных</div>
            </div>
          </div>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.author}
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
              href="https://youdo.com/u11536152"
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Все отзывы на YouDo
            </a>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
