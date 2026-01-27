/**
 * Fix FAQ Translations Script
 * Updates FAQ items with actual content
 *
 * Usage: npx tsx scripts/fix-faq-translations.ts
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const faqData = [
  {
    order: 0,
    category: "general",
    ru: {
      question: "Какие технологии вы используете?",
      answer: "Мы работаем с современным стеком: React, Next.js, Node.js, TypeScript, PostgreSQL, и другие. Выбор технологий зависит от требований проекта."
    },
    ro: {
      question: "Ce tehnologii folosiți?",
      answer: "Lucrăm cu un stack modern: React, Next.js, Node.js, TypeScript, PostgreSQL și altele. Alegerea tehnologiilor depinde de cerințele proiectului."
    },
  },
  {
    order: 1,
    category: "general",
    ru: {
      question: "Сколько стоит разработка проекта?",
      answer: "Стоимость зависит от сложности и объема работ. После анализа требований мы предоставляем детальную оценку. Минимальный бюджет проекта от 50,000 руб."
    },
    ro: {
      question: "Cât costă dezvoltarea unui proiect?",
      answer: "Costul depinde de complexitate și volumul de lucru. După analiza cerințelor, oferim o estimare detaliată. Bugetul minim al proiectului de la 15,000 lei."
    },
  },
  {
    order: 2,
    category: "general",
    ru: {
      question: "Как долго длится разработка?",
      answer: "Сроки зависят от масштаба проекта. MVP можно создать за 4-8 недель, полноценный продукт — от 2-3 месяцев."
    },
    ro: {
      question: "Cât durează dezvoltarea?",
      answer: "Termenele depind de amploarea proiectului. MVP poate fi creat în 4-8 săptămâni, un produs complet - de la 2-3 luni."
    },
  },
  {
    order: 3,
    category: "process",
    ru: {
      question: "Как происходит процесс работы?",
      answer: "Работаем по Agile методологии: планирование спринтов, ежедневные статусы, регулярные демо. Вы всегда в курсе прогресса."
    },
    ro: {
      question: "Cum funcționează procesul de lucru?",
      answer: "Lucrăm conform metodologiei Agile: planificarea sprinturilor, statusuri zilnice, demonstrații regulate. Sunteți mereu la curent cu progresul."
    },
  },
  {
    order: 4,
    category: "support",
    ru: {
      question: "Предоставляете ли вы поддержку после запуска?",
      answer: "Да, мы предлагаем пакеты поддержки: исправление багов, обновления, мониторинг и оперативное реагирование на проблемы."
    },
    ro: {
      question: "Oferiți suport după lansare?",
      answer: "Da, oferim pachete de suport: corectarea erorilor, actualizări, monitorizare și răspuns rapid la probleme."
    },
  },
  {
    order: 5,
    category: "general",
    ru: {
      question: "Работаете ли вы с клиентами из других стран?",
      answer: "Да, мы работаем с клиентами из России, Молдовы, и других стран. Общение возможно на русском, румынском и английском языках."
    },
    ro: {
      question: "Lucrați cu clienți din alte țări?",
      answer: "Da, lucrăm cu clienți din Rusia, Moldova și alte țări. Comunicarea este posibilă în limba rusă, română și engleză."
    },
  },
  {
    order: 6,
    category: "payment",
    ru: {
      question: "Какие способы оплаты вы принимаете?",
      answer: "Принимаем оплату банковским переводом, картой, криптовалютой. Для крупных проектов возможна поэтапная оплата."
    },
    ro: {
      question: "Ce metode de plată acceptați?",
      answer: "Acceptăm plata prin transfer bancar, card, criptomonede. Pentru proiecte mari este posibilă plata în etape."
    },
  },
  {
    order: 7,
    category: "general",
    ru: {
      question: "Можно ли внести изменения в проект после начала работы?",
      answer: "Да, мы работаем гибко и можем адаптировать требования. Существенные изменения могут повлиять на сроки и бюджет."
    },
    ro: {
      question: "Pot fi făcute modificări în proiect după începerea lucrului?",
      answer: "Da, lucrăm flexibil și putem adapta cerințele. Modificările semnificative pot afecta termenele și bugetul."
    },
  },
];

async function main() {
  console.log("Fixing FAQ translations...\n");

  // Get existing FAQ items ordered by order field
  const existingFAQs = await prisma.faqItem.findMany({
    orderBy: { order: "asc" },
    include: { translations: true },
  });

  console.log(`Found ${existingFAQs.length} existing FAQ items`);

  // Update each FAQ item with real translations
  for (let i = 0; i < existingFAQs.length && i < faqData.length; i++) {
    const faq = existingFAQs[i];
    const data = faqData[i];

    // Delete existing translations
    await prisma.faqItemTranslation.deleteMany({
      where: { faqItemId: faq.id },
    });

    // Create new translations with real content
    await prisma.faqItemTranslation.createMany({
      data: [
        { faqItemId: faq.id, locale: "ru", question: data.ru.question, answer: data.ru.answer },
        { faqItemId: faq.id, locale: "ro", question: data.ro.question, answer: data.ro.answer },
      ],
    });

    // Update category
    await prisma.faqItem.update({
      where: { id: faq.id },
      data: { category: data.category, order: data.order },
    });

    console.log(`  Updated FAQ ${i + 1}: ${data.ru.question.substring(0, 40)}...`);
  }

  // If we have more faqData than existing items, create new ones
  if (faqData.length > existingFAQs.length) {
    for (let i = existingFAQs.length; i < faqData.length; i++) {
      const data = faqData[i];
      await prisma.faqItem.create({
        data: {
          category: data.category,
          order: data.order,
          translations: {
            create: [
              { locale: "ru", question: data.ru.question, answer: data.ru.answer },
              { locale: "ro", question: data.ro.question, answer: data.ro.answer },
            ],
          },
        },
      });
      console.log(`  Created FAQ ${i + 1}: ${data.ru.question.substring(0, 40)}...`);
    }
  }

  console.log("\nFAQ translations fixed successfully!");

  // Show summary
  const count = await prisma.faqItem.count();
  const transCount = await prisma.faqItemTranslation.count();
  console.log(`\nSummary: ${count} FAQ items with ${transCount} translations`);

  await prisma.$disconnect();
  await pool.end();
}

main().catch(console.error);
