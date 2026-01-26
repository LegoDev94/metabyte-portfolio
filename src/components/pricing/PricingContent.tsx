"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Check,
  Sparkles,
  Zap,
  Rocket,
  Crown,
  ArrowRight,
  MessageCircle,
} from "lucide-react";
import Link from "next/link";
import type { PricingPlan, AdditionalService } from "@/lib/db/pricing";
import { useLocaleContext } from "@/components/providers/LocaleProvider";

// Icon mapping for dynamic icons from database
const iconMap: Record<string, React.ElementType> = {
  Zap,
  Rocket,
  Crown,
};

interface PricingContentProps {
  plans: PricingPlan[];
  services: AdditionalService[];
}

// Helper to parse price from string like "от 50 000 ₽" to number
function parsePriceValue(priceStr: string): number | null {
  const match = priceStr.match(/[\d\s]+/);
  if (match) {
    return parseInt(match[0].replace(/\s/g, ""), 10);
  }
  return null;
}

// Helper to check if price has "от" prefix
function hasFromPrefix(priceStr: string): boolean {
  return priceStr.toLowerCase().startsWith("от");
}

// Fallback data
const fallbackPlans: PricingPlan[] = [
  {
    id: "1",
    name: "Landing Page",
    price: "от 50 000 ₽",
    description: "Одностраничный сайт для продукта или услуги",
    icon: "Zap",
    color: "#00ffff",
    popular: false,
    features: [
      "Адаптивный дизайн",
      "До 5 секций",
      "Форма обратной связи",
      "SEO оптимизация",
      "Анимации и эффекты",
      "Подключение аналитики",
      "Срок: 1-2 недели",
    ],
    notIncluded: ["Админ-панель", "База данных", "Личный кабинет"],
  },
  {
    id: "2",
    name: "Web Application",
    price: "от 200 000 ₽",
    description: "Полноценное веб-приложение с бэкендом",
    icon: "Rocket",
    color: "#ff00ff",
    popular: true,
    features: [
      "Всё из Landing Page",
      "Авторизация пользователей",
      "База данных",
      "Админ-панель",
      "API интеграции",
      "Платежи (Stripe, ЮKassa)",
      "Срок: 1-2 месяца",
    ],
    notIncluded: ["Мобильное приложение"],
  },
  {
    id: "3",
    name: "Mobile App",
    price: "от 300 000 ₽",
    description: "Кросс-платформенное приложение на Flutter",
    icon: "Crown",
    color: "#ffaa00",
    popular: false,
    features: [
      "iOS + Android из одного кода",
      "Нативная производительность",
      "Push-уведомления",
      "Офлайн режим",
      "Интеграция с API",
      "Публикация в сторах",
      "Срок: 2-3 месяца",
    ],
    notIncluded: [],
  },
];

const fallbackServices: AdditionalService[] = [
  { id: "1", name: "Telegram Bot", price: "от 30 000 ₽", description: "Бот с любым функционалом" },
  { id: "2", name: "Telegram Mini App", price: "от 80 000 ₽", description: "Приложение внутри Telegram" },
  { id: "3", name: "Интеграция с 1С", price: "от 50 000 ₽", description: "Синхронизация данных с 1С" },
  { id: "4", name: "AI интеграция", price: "от 40 000 ₽", description: "ChatGPT, Claude, генерация контента" },
  { id: "5", name: "Поддержка/месяц", price: "от 10 000 ₽", description: "Хостинг, мониторинг, багфиксы" },
  { id: "6", name: "UI/UX дизайн", price: "от 30 000 ₽", description: "Дизайн с Figma файлами" },
];

export function PricingContent({ plans, services }: PricingContentProps) {
  const t = useTranslations("pricing");
  const { locale, formatPrice } = useLocaleContext();

  // Use fallback data if database is empty
  const packages = plans.length > 0 ? plans : fallbackPlans;
  const additionalServices = services.length > 0 ? services : fallbackServices;

  // Format price with currency conversion
  const displayPrice = (priceStr: string) => {
    const value = parsePriceValue(priceStr);
    const hasFrom = hasFromPrefix(priceStr);
    const prefix = hasFrom ? (locale === "ro" ? "de la " : "от ") : "";

    if (value) {
      return prefix + formatPrice(value);
    }
    return priceStr;
  };

  return (
    <>
      {/* Hero */}
      <section className="py-16 relative overflow-hidden">
        <div className="absolute inset-0 cyber-grid opacity-20" />
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/20 rounded-full blur-[128px]" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-accent/20 rounded-full blur-[128px]" />

        <div className="container mx-auto px-4 lg:px-8 relative text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm text-primary font-medium">
              {locale === "ro" ? "Preturi transparente" : "Прозрачные цены"}
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-5xl font-display mb-4"
          >
            {locale === "ro" ? "Costul " : "Стоимость "}
            <span className="text-primary text-glow-cyan">
              {locale === "ro" ? "serviciilor" : "услуг"}
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-muted-foreground max-w-2xl mx-auto"
          >
            {locale === "ro"
              ? "Preturi fixe pentru proiecte standard. Pentru sarcini complexe - evaluare individuala dupa consultatie."
              : "Фиксированные цены на типовые проекты. Для сложных задач — индивидуальная оценка после консультации."}
          </motion.p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-12 relative">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {packages.map((pkg, index) => {
              const IconComponent = iconMap[pkg.icon] || Zap;
              return (
                <motion.div
                  key={pkg.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`relative rounded-2xl border ${
                    pkg.popular
                      ? "border-primary bg-primary/5"
                      : "border-border bg-card"
                  } p-6 flex flex-col`}
                >
                  {pkg.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                      {t("popular")}
                    </div>
                  )}

                  {/* Icon */}
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                    style={{ backgroundColor: pkg.color + "20" }}
                  >
                    <IconComponent className="w-6 h-6" style={{ color: pkg.color }} />
                  </div>

                  {/* Header */}
                  <h3 className="text-xl font-semibold mb-1">{pkg.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {pkg.description}
                  </p>

                  {/* Price */}
                  <div className="mb-6">
                    <span className="text-3xl font-bold">{displayPrice(pkg.price)}</span>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-6 flex-grow">
                    {pkg.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                    {pkg.notIncluded.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-2 text-sm text-muted-foreground"
                      >
                        <span className="w-4 h-4 flex items-center justify-center mt-0.5 flex-shrink-0">
                          —
                        </span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <Button
                    asChild
                    className={
                      pkg.popular
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    }
                  >
                    <Link href="/contact">
                      {t("contact")}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Additional Services */}
      <section className="py-16 relative">
        <div className="absolute inset-0 cyber-grid opacity-10" />

        <div className="container mx-auto px-4 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-display mb-4">
              {locale === "ro" ? "Servicii " : "Дополнительные "}
              <span className="text-accent text-glow-magenta">
                {locale === "ro" ? "aditionale" : "услуги"}
              </span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {locale === "ro"
                ? "Pot fi comandate separat sau adaugate la proiectul principal"
                : "Можно заказать отдельно или добавить к основному проекту"}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {additionalServices.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="p-4 rounded-xl border border-border bg-card hover:border-primary/30 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium">{service.name}</h3>
                  <span className="text-primary font-semibold text-sm">
                    {displayPrice(service.price)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {service.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10" />

        <div className="container mx-auto px-4 lg:px-8 relative text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl md:text-3xl font-display mb-4">
              {locale === "ro"
                ? "Nu ati gasit optiunea potrivita?"
                : "Не нашли подходящий вариант?"}
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              {locale === "ro"
                ? "Descrieti sarcina dvs. - vom pregati o oferta individuala cu un pret si termene exacte."
                : "Опишите вашу задачу — подготовим индивидуальное предложение с точной ценой и сроками."}
            </p>
            <Button
              asChild
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <a
                href="https://t.me/metabytemd"
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                {locale === "ro" ? "Consultatie gratuita" : "Бесплатная консультация"}
              </a>
            </Button>
          </motion.div>
        </div>
      </section>
    </>
  );
}
