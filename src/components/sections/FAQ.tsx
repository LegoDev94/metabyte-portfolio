"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle } from "lucide-react";

const faqs = [
  {
    question: "Сколько стоит разработка?",
    answer: "Стоимость зависит от сложности проекта. Landing page — от $500, Web-приложение — от $2000, Mobile app — от $3000. Точную оценку дадим после обсуждения требований. Первая консультация бесплатно."
  },
  {
    question: "Какие сроки разработки?",
    answer: "Landing page — 1-2 недели. Web-приложение средней сложности — 1-2 месяца. Сложные проекты — 2-4 месяца. Сроки фиксируем в договоре."
  },
  {
    question: "Как происходит оплата?",
    answer: "Работаем по предоплате 50%. Оставшиеся 50% — после сдачи проекта. Для крупных проектов возможна помесячная оплата. Принимаем переводы на карту, криптовалюту, PayPal."
  },
  {
    question: "Что если результат не понравится?",
    answer: "На каждом этапе согласовываем результат с вами. Дизайн утверждаем до начала разработки. Если что-то не устраивает — вносим правки. Гарантия на исправление багов — 30 дней после запуска."
  },
  {
    question: "Делаете ли поддержку после запуска?",
    answer: "Да, предлагаем пакеты поддержки: исправление багов, мелкие доработки, хостинг и мониторинг. Первые 30 дней поддержки включены в стоимость проекта."
  },
  {
    question: "Работаете ли с иностранными клиентами?",
    answer: "Да, работаем с клиентами из любых стран. Общаемся на русском и английском. Оплата в USD, EUR или криптовалюте."
  },
  {
    question: "Какие технологии используете?",
    answer: "Frontend: React, Next.js, Vue, Flutter. Backend: Node.js, Python. Базы данных: PostgreSQL, MongoDB, Supabase. Выбираем стек под задачу клиента."
  },
  {
    question: "Можно ли посмотреть код после завершения?",
    answer: "Да, передаём полный исходный код и все доступы. Код остаётся вашей собственностью. Используем Git для версионирования."
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 cyber-grid opacity-10" />
      <div className="absolute top-1/4 -right-32 w-96 h-96 bg-accent/10 rounded-full blur-[128px]" />

      <div className="container mx-auto px-4 lg:px-8 relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-6">
            <HelpCircle className="w-4 h-4 text-accent" />
            <span className="text-sm text-accent font-medium">FAQ</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-display mb-4">
            Частые{" "}
            <span className="text-accent text-glow-magenta">вопросы</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Ответы на популярные вопросы о работе с нами
          </p>
        </motion.div>

        {/* FAQ List */}
        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full text-left p-5 rounded-xl bg-card border border-border hover:border-primary/30 transition-all duration-300"
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="font-medium">{faq.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-muted-foreground transition-transform duration-300 flex-shrink-0 ${
                      openIndex === index ? "rotate-180" : ""
                    }`}
                  />
                </div>
                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <p className="pt-4 text-muted-foreground text-sm leading-relaxed">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center mt-12"
        >
          <p className="text-muted-foreground">
            Не нашли ответ?{" "}
            <a
              href="https://t.me/metabytemd"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Напишите нам в Telegram
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
