"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { useLocaleContext } from "@/components/providers/LocaleProvider";

export interface FAQItem {
  id?: string;
  question: string;
  answer: string;
  category?: string;
}

interface FAQProps {
  items?: FAQItem[];
}

const defaultFAQsRu: FAQItem[] = [
  {
    id: "1",
    question: "Сколько стоит разработка?",
    answer: "Стоимость зависит от сложности проекта. Landing page — от $500, Web-приложение — от $2000, Mobile app — от $3000. Точную оценку дадим после обсуждения требований. Первая консультация бесплатно."
  },
  {
    id: "2",
    question: "Какие сроки разработки?",
    answer: "Landing page — 1-2 недели. Web-приложение средней сложности — 1-2 месяца. Сложные проекты — 2-4 месяца. Сроки фиксируем в договоре."
  },
  {
    id: "3",
    question: "Как происходит оплата?",
    answer: "Работаем по предоплате 50%. Оставшиеся 50% — после сдачи проекта. Для крупных проектов возможна помесячная оплата. Принимаем переводы на карту, криптовалюту, PayPal."
  },
  {
    id: "4",
    question: "Что если результат не понравится?",
    answer: "На каждом этапе согласовываем результат с вами. Дизайн утверждаем до начала разработки. Если что-то не устраивает — вносим правки. Гарантия на исправление багов — 30 дней после запуска."
  },
  {
    id: "5",
    question: "Делаете ли поддержку после запуска?",
    answer: "Да, предлагаем пакеты поддержки: исправление багов, мелкие доработки, хостинг и мониторинг. Первые 30 дней поддержки включены в стоимость проекта."
  },
];

const defaultFAQsRo: FAQItem[] = [
  {
    id: "1",
    question: "Cat costa dezvoltarea?",
    answer: "Costul depinde de complexitatea proiectului. Landing page — de la $500, Aplicatie web — de la $2000, Aplicatie mobila — de la $3000. Vom oferi o estimare exacta dupa discutarea cerintelor. Prima consultatie este gratuita."
  },
  {
    id: "2",
    question: "Care sunt termenele de dezvoltare?",
    answer: "Landing page — 1-2 saptamani. Aplicatie web de complexitate medie — 1-2 luni. Proiecte complexe — 2-4 luni. Termenele sunt fixate in contract."
  },
  {
    id: "3",
    question: "Cum se face plata?",
    answer: "Lucram cu avans de 50%. Restul de 50% — dupa livrarea proiectului. Pentru proiecte mari este posibila plata lunara. Acceptam transferuri bancare, criptomonede, PayPal."
  },
  {
    id: "4",
    question: "Ce se intampla daca rezultatul nu place?",
    answer: "La fiecare etapa coordonam rezultatul cu dvs. Design-ul este aprobat inainte de inceperea dezvoltarii. Daca ceva nu corespunde — facem modificari. Garantie pentru corectarea bug-urilor — 30 de zile dupa lansare."
  },
  {
    id: "5",
    question: "Oferiti suport dupa lansare?",
    answer: "Da, oferim pachete de suport: corectarea bug-urilor, mici imbunatatiri, hosting si monitorizare. Primele 30 de zile de suport sunt incluse in costul proiectului."
  },
];

export function FAQ({ items }: FAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const t = useTranslations("faq");
  const { locale } = useLocaleContext();

  const defaultFAQs = locale === "ro" ? defaultFAQsRo : defaultFAQsRu;
  const faqs = items && items.length > 0 ? items : defaultFAQs;

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
            <span className="text-sm text-accent font-medium">{t("subtitle")}</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-display mb-4">
            {locale === "ro" ? "Intrebari " : "Частые "}
            <span className="text-accent text-glow-magenta">
              {locale === "ro" ? "frecvente" : "вопросы"}
            </span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t("description")}
          </p>
        </motion.div>

        {/* FAQ List */}
        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={faq.id || index}
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
            {locale === "ro" ? "Nu ati gasit raspunsul? " : "Не нашли ответ? "}
            <a
              href="https://t.me/metabytemd"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              {locale === "ro" ? "Scrieti-ne pe Telegram" : "Напишите нам в Telegram"}
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
