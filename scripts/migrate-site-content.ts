/**
 * Site Content Migration Script
 *
 * Migrates all site content with translations to the database:
 * - SiteSettings
 * - WorkProcessSteps
 * - TeamMembers
 * - Testimonials
 * - FaqItems
 * - PricingPackages
 * - SkillCategories
 * - ContactInfo
 *
 * Usage: npx tsx scripts/migrate-site-content.ts
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// Create Prisma client with pg adapter (Prisma 7 style)
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ==================== SITE SETTINGS ====================

async function migrateSiteSettings() {
  console.log("\nMigrating site settings...");

  const existingSettings = await prisma.siteSettings.findFirst();

  if (existingSettings) {
    console.log("  Site settings already exist, updating translations...");

    // Add translations if they don't exist
    const existingTrans = await prisma.siteSettingsTranslation.findMany({
      where: { settingsId: existingSettings.id },
    });

    if (existingTrans.length === 0) {
      await prisma.siteSettingsTranslation.createMany({
        data: [
          {
            settingsId: existingSettings.id,
            locale: "ru",
            companyName: "METABYTE",
            subtitle: "Full-Stack Development Studio",
            badgeText: "Открыт для предложений",
            heroServices: ["Веб-приложения", "Мобильные приложения", "API и Backend"],
            founderName: "Виталий Кореньков",
            founderTitle: "Full-Stack разработчик",
            founderBioShort: "10+ лет опыта в разработке веб и мобильных приложений. Специализация на сложных проектах с высокими требованиями к производительности.",
            founderBioLong: null,
          },
          {
            settingsId: existingSettings.id,
            locale: "ro",
            companyName: "METABYTE",
            subtitle: "Full-Stack Development Studio",
            badgeText: "Deschis pentru propuneri",
            heroServices: ["Aplicații web", "Aplicații mobile", "API și Backend"],
            founderName: "Vitalie Corenkov",
            founderTitle: "Dezvoltator Full-Stack",
            founderBioShort: "10+ ani de experiență în dezvoltarea aplicațiilor web și mobile. Specializare în proiecte complexe cu cerințe ridicate de performanță.",
            founderBioLong: null,
          },
        ],
      });
      console.log("  Created site settings translations");
    } else {
      console.log("  Translations already exist");
    }
    return;
  }

  // Create new settings
  const settings = await prisma.siteSettings.create({
    data: {
      id: "default",
      heroTechStack: ["React", "Node.js", "TypeScript", "PostgreSQL"],
      projectsCount: 17,
      rating: 4.9,
      countriesCount: 5,
      founderPhoto: "/images/team/founder.jpg",
      translations: {
        create: [
          {
            locale: "ru",
            companyName: "METABYTE",
            subtitle: "Full-Stack Development Studio",
            badgeText: "Открыт для предложений",
            heroServices: ["Веб-приложения", "Мобильные приложения", "API и Backend"],
            founderName: "Виталий Кореньков",
            founderTitle: "Full-Stack разработчик",
            founderBioShort: "10+ лет опыта в разработке веб и мобильных приложений.",
            founderBioLong: null,
          },
          {
            locale: "ro",
            companyName: "METABYTE",
            subtitle: "Full-Stack Development Studio",
            badgeText: "Deschis pentru propuneri",
            heroServices: ["Aplicații web", "Aplicații mobile", "API și Backend"],
            founderName: "Vitalie Corenkov",
            founderTitle: "Dezvoltator Full-Stack",
            founderBioShort: "10+ ani de experiență în dezvoltarea aplicațiilor web și mobile.",
            founderBioLong: null,
          },
        ],
      },
    },
  });

  console.log(`  Created site settings: ${settings.id}`);
}

// ==================== WORK PROCESS ====================

async function migrateWorkProcess() {
  console.log("\nMigrating work process steps...");

  const existingSteps = await prisma.workProcessStep.count();
  if (existingSteps > 0) {
    console.log(`  ${existingSteps} steps already exist, checking translations...`);

    // Add translations to existing steps
    const steps = await prisma.workProcessStep.findMany({
      include: { translations: true },
    });

    const stepsData = [
      { number: "01", ru: { title: "Анализ", description: "Детальный анализ требований и планирование архитектуры" }, ro: { title: "Analiză", description: "Analiza detaliată a cerințelor și planificarea arhitecturii" } },
      { number: "02", ru: { title: "Дизайн", description: "Проектирование UI/UX и создание прототипов" }, ro: { title: "Design", description: "Proiectarea UI/UX și crearea prototipurilor" } },
      { number: "03", ru: { title: "Разработка", description: "Итеративная разработка с регулярными демо" }, ro: { title: "Dezvoltare", description: "Dezvoltare iterativă cu demonstrații regulate" } },
      { number: "04", ru: { title: "Тестирование", description: "Комплексное тестирование и оптимизация" }, ro: { title: "Testare", description: "Testare complexă și optimizare" } },
      { number: "05", ru: { title: "Запуск", description: "Деплой и мониторинг в продакшене" }, ro: { title: "Lansare", description: "Implementare și monitorizare în producție" } },
    ];

    for (const step of steps) {
      if (step.translations.length === 0) {
        const data = stepsData.find(s => s.number === step.number);
        if (data) {
          await prisma.workProcessStepTranslation.createMany({
            data: [
              { stepId: step.id, locale: "ru", title: data.ru.title, description: data.ru.description },
              { stepId: step.id, locale: "ro", title: data.ro.title, description: data.ro.description },
            ],
          });
          console.log(`  Added translations for step ${step.number}`);
        }
      }
    }
    return;
  }

  const steps = [
    { number: "01", icon: "Search", color: "blue", ru: { title: "Анализ", description: "Детальный анализ требований и планирование архитектуры проекта" }, ro: { title: "Analiză", description: "Analiza detaliată a cerințelor și planificarea arhitecturii proiectului" } },
    { number: "02", icon: "Palette", color: "purple", ru: { title: "Дизайн", description: "Проектирование UI/UX и создание интерактивных прототипов" }, ro: { title: "Design", description: "Proiectarea UI/UX și crearea prototipurilor interactive" } },
    { number: "03", icon: "Code", color: "green", ru: { title: "Разработка", description: "Итеративная разработка с регулярными демо и обратной связью" }, ro: { title: "Dezvoltare", description: "Dezvoltare iterativă cu demonstrații regulate și feedback" } },
    { number: "04", icon: "TestTube", color: "orange", ru: { title: "Тестирование", description: "Комплексное тестирование и оптимизация производительности" }, ro: { title: "Testare", description: "Testare complexă și optimizarea performanței" } },
    { number: "05", icon: "Rocket", color: "red", ru: { title: "Запуск", description: "Деплой, мониторинг и поддержка в продакшене" }, ro: { title: "Lansare", description: "Implementare, monitorizare și suport în producție" } },
  ];

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    await prisma.workProcessStep.create({
      data: {
        number: step.number,
        icon: step.icon,
        color: step.color,
        order: i,
        translations: {
          create: [
            { locale: "ru", title: step.ru.title, description: step.ru.description },
            { locale: "ro", title: step.ro.title, description: step.ro.description },
          ],
        },
      },
    });
  }

  console.log(`  Created ${steps.length} work process steps with translations`);
}

// ==================== FAQ ====================

async function migrateFAQ() {
  console.log("\nMigrating FAQ items...");

  const existingFAQ = await prisma.faqItem.count();
  if (existingFAQ > 0) {
    console.log(`  ${existingFAQ} FAQ items already exist, checking translations...`);

    const faqItems = await prisma.faqItem.findMany({
      include: { translations: true },
    });

    for (const faq of faqItems) {
      if (faq.translations.length === 0) {
        // Add default translations
        await prisma.faqItemTranslation.createMany({
          data: [
            { faqItemId: faq.id, locale: "ru", question: "Вопрос", answer: "Ответ" },
            { faqItemId: faq.id, locale: "ro", question: "Întrebare", answer: "Răspuns" },
          ],
        });
        console.log(`  Added translations for FAQ ${faq.id}`);
      }
    }
    return;
  }

  const faqData = [
    {
      category: "general",
      ru: { question: "Какие технологии вы используете?", answer: "Мы работаем с современным стеком: React, Next.js, Node.js, TypeScript, PostgreSQL, и другие. Выбор технологий зависит от требований проекта." },
      ro: { question: "Ce tehnologii folosiți?", answer: "Lucrăm cu un stack modern: React, Next.js, Node.js, TypeScript, PostgreSQL și altele. Alegerea tehnologiilor depinde de cerințele proiectului." },
    },
    {
      category: "general",
      ru: { question: "Сколько стоит разработка проекта?", answer: "Стоимость зависит от сложности и объема работ. После анализа требований мы предоставляем детальную оценку. Минимальный бюджет проекта от 50,000 руб." },
      ro: { question: "Cât costă dezvoltarea unui proiect?", answer: "Costul depinde de complexitate și volumul de lucru. După analiza cerințelor, oferim o estimare detaliată. Bugetul minim al proiectului de la 15,000 lei." },
    },
    {
      category: "general",
      ru: { question: "Как долго длится разработка?", answer: "Сроки зависят от масштаба проекта. MVP можно создать за 4-8 недель, полноценный продукт — от 2-3 месяцев." },
      ro: { question: "Cât durează dezvoltarea?", answer: "Termenele depind de amploarea proiectului. MVP poate fi creat în 4-8 săptămâni, un produs complet - de la 2-3 luni." },
    },
    {
      category: "process",
      ru: { question: "Как происходит процесс работы?", answer: "Работаем по Agile методологии: планирование спринтов, ежедневные статусы, регулярные демо. Вы всегда в курсе прогресса." },
      ro: { question: "Cum funcționează procesul de lucru?", answer: "Lucrăm conform metodologiei Agile: planificarea sprinturilor, statusuri zilnice, demonstrații regulate. Sunteți mereu la curent cu progresul." },
    },
    {
      category: "support",
      ru: { question: "Предоставляете ли вы поддержку после запуска?", answer: "Да, мы предлагаем пакеты поддержки: исправление багов, обновления, мониторинг и оперативное реагирование на проблемы." },
      ro: { question: "Oferiți suport după lansare?", answer: "Da, oferim pachete de suport: corectarea erorilor, actualizări, monitorizare și răspuns rapid la probleme." },
    },
  ];

  for (let i = 0; i < faqData.length; i++) {
    const faq = faqData[i];
    await prisma.faqItem.create({
      data: {
        category: faq.category,
        order: i,
        translations: {
          create: [
            { locale: "ru", question: faq.ru.question, answer: faq.ru.answer },
            { locale: "ro", question: faq.ro.question, answer: faq.ro.answer },
          ],
        },
      },
    });
  }

  console.log(`  Created ${faqData.length} FAQ items with translations`);
}

// ==================== CONTACT INFO ====================

async function migrateContactInfo() {
  console.log("\nMigrating contact info...");

  const existingContact = await prisma.contactInfo.findFirst();

  if (existingContact) {
    console.log("  Contact info already exists, checking translations...");

    const existingTrans = await prisma.contactInfoTranslation.findMany({
      where: { contactId: existingContact.id },
    });

    if (existingTrans.length === 0) {
      await prisma.contactInfoTranslation.createMany({
        data: [
          { contactId: existingContact.id, locale: "ru", responseTime: "24 часа" },
          { contactId: existingContact.id, locale: "ro", responseTime: "24 ore" },
        ],
      });
      console.log("  Created contact info translations");
    }
    return;
  }

  await prisma.contactInfo.create({
    data: {
      id: "default",
      email: "contact@mtbyte.io",
      telegram: "@metabyte_dev",
      github: "https://github.com/metabyte",
      youdoUrl: "https://youdo.com/user/metabyte",
      translations: {
        create: [
          { locale: "ru", responseTime: "24 часа" },
          { locale: "ro", responseTime: "24 ore" },
        ],
      },
    },
  });

  console.log("  Created contact info with translations");
}

// ==================== SKILL CATEGORIES ====================

async function migrateSkillCategories() {
  console.log("\nMigrating skill categories...");

  const existingCategories = await prisma.skillCategory.count();
  if (existingCategories > 0) {
    console.log(`  ${existingCategories} skill categories already exist, checking translations...`);

    const categories = await prisma.skillCategory.findMany({
      include: { translations: true },
    });

    for (const cat of categories) {
      if (cat.translations.length === 0) {
        await prisma.skillCategoryTranslation.createMany({
          data: [
            { categoryId: cat.id, locale: "ru", name: "Категория" },
            { categoryId: cat.id, locale: "ro", name: "Categorie" },
          ],
        });
        console.log(`  Added translations for category ${cat.id}`);
      }
    }
    return;
  }

  const categories = [
    { icon: "Code", color: "blue", items: ["TypeScript", "JavaScript", "Python"], ru: "Frontend", ro: "Frontend" },
    { icon: "Server", color: "green", items: ["Node.js", "PostgreSQL", "Redis"], ru: "Backend", ro: "Backend" },
    { icon: "Smartphone", color: "purple", items: ["React Native", "Flutter", "iOS"], ru: "Мобильная разработка", ro: "Dezvoltare mobilă" },
    { icon: "Cloud", color: "orange", items: ["AWS", "Docker", "Kubernetes"], ru: "DevOps", ro: "DevOps" },
  ];

  for (let i = 0; i < categories.length; i++) {
    const cat = categories[i];
    await prisma.skillCategory.create({
      data: {
        icon: cat.icon,
        color: cat.color,
        items: cat.items,
        order: i,
        translations: {
          create: [
            { locale: "ru", name: cat.ru },
            { locale: "ro", name: cat.ro },
          ],
        },
      },
    });
  }

  console.log(`  Created ${categories.length} skill categories with translations`);
}

// ==================== PRICING ====================

async function migratePricing() {
  console.log("\nMigrating pricing packages...");

  const existingPackages = await prisma.pricingPackage.count();
  if (existingPackages > 0) {
    console.log(`  ${existingPackages} pricing packages already exist, checking translations...`);

    const packages = await prisma.pricingPackage.findMany({
      include: { translations: true },
    });

    for (const pkg of packages) {
      if (pkg.translations.length === 0) {
        await prisma.pricingPackageTranslation.createMany({
          data: [
            { packageId: pkg.id, locale: "ru", name: "Пакет", description: "Описание пакета", features: ["Функция 1"], notIncluded: [] },
            { packageId: pkg.id, locale: "ro", name: "Pachet", description: "Descrierea pachetului", features: ["Funcție 1"], notIncluded: [] },
          ],
        });
        console.log(`  Added translations for package ${pkg.id}`);
      }
    }
    return;
  }

  const packages = [
    {
      price: "от 50,000 ₽",
      icon: "Zap",
      color: "blue",
      popular: false,
      ru: { name: "Лендинг", description: "Одностраничный сайт для бизнеса", features: ["Адаптивный дизайн", "SEO оптимизация", "Форма обратной связи", "Интеграция аналитики"], notIncluded: ["Личный кабинет", "База данных"] },
      ro: { name: "Landing", description: "Site de o pagină pentru afaceri", features: ["Design responsive", "Optimizare SEO", "Formular de contact", "Integrare analitică"], notIncluded: ["Cabinet personal", "Bază de date"] },
    },
    {
      price: "от 150,000 ₽",
      icon: "Rocket",
      color: "purple",
      popular: true,
      ru: { name: "Веб-приложение", description: "Полнофункциональное веб-приложение", features: ["Авторизация пользователей", "База данных", "API интеграции", "Админ-панель", "Мобильная адаптация"], notIncluded: [] },
      ro: { name: "Aplicație web", description: "Aplicație web complet funcțională", features: ["Autentificare utilizatori", "Bază de date", "Integrări API", "Panou de administrare", "Adaptare mobilă"], notIncluded: [] },
    },
    {
      price: "по договоренности",
      icon: "Building",
      color: "green",
      popular: false,
      ru: { name: "Enterprise", description: "Масштабные корпоративные решения", features: ["Микросервисная архитектура", "Высокая доступность", "Интеграция с системами", "Техподдержка 24/7"], notIncluded: [] },
      ro: { name: "Enterprise", description: "Soluții corporative la scară largă", features: ["Arhitectură microservicii", "Disponibilitate ridicată", "Integrare cu sisteme", "Suport tehnic 24/7"], notIncluded: [] },
    },
  ];

  for (let i = 0; i < packages.length; i++) {
    const pkg = packages[i];
    await prisma.pricingPackage.create({
      data: {
        price: pkg.price,
        icon: pkg.icon,
        color: pkg.color,
        popular: pkg.popular,
        order: i,
        translations: {
          create: [
            { locale: "ru", name: pkg.ru.name, description: pkg.ru.description, features: pkg.ru.features, notIncluded: pkg.ru.notIncluded },
            { locale: "ro", name: pkg.ro.name, description: pkg.ro.description, features: pkg.ro.features, notIncluded: pkg.ro.notIncluded },
          ],
        },
      },
    });
  }

  console.log(`  Created ${packages.length} pricing packages with translations`);
}

// ==================== TESTIMONIALS ====================

async function migrateTestimonials() {
  console.log("\nMigrating testimonials...");

  const existingTestimonials = await prisma.testimonial.count();
  if (existingTestimonials > 0) {
    console.log(`  ${existingTestimonials} testimonials already exist, checking translations...`);

    const testimonials = await prisma.testimonial.findMany({
      include: { translations: true },
    });

    for (const t of testimonials) {
      if (t.translations.length === 0) {
        await prisma.testimonialTranslation.createMany({
          data: [
            { testimonialId: t.id, locale: "ru", author: "Клиент", task: "Проект", text: "Отзыв" },
            { testimonialId: t.id, locale: "ro", author: "Client", task: "Proiect", text: "Recenzie" },
          ],
        });
        console.log(`  Added translations for testimonial ${t.id}`);
      }
    }
    return;
  }

  const testimonials = [
    {
      rating: 5,
      source: "YouDo",
      ru: { author: "Алексей К.", task: "Разработка веб-приложения", text: "Отличная работа! Проект сделан качественно и в срок. Рекомендую!" },
      ro: { author: "Alexei K.", task: "Dezvoltare aplicație web", text: "Muncă excelentă! Proiectul a fost realizat calitativ și la timp. Recomand!" },
    },
    {
      rating: 5,
      source: "YouDo",
      ru: { author: "Марина С.", task: "Создание лендинга", text: "Очень доволен результатом. Быстро, качественно, с вниманием к деталям." },
      ro: { author: "Marina S.", task: "Creare landing page", text: "Foarte mulțumit de rezultat. Rapid, calitativ, cu atenție la detalii." },
    },
    {
      rating: 5,
      source: "Telegram",
      ru: { author: "Дмитрий В.", task: "Интеграция API", text: "Профессиональный подход, всё работает как часы. Спасибо!" },
      ro: { author: "Dmitri V.", task: "Integrare API", text: "Abordare profesionistă, totul funcționează perfect. Mulțumesc!" },
    },
  ];

  for (let i = 0; i < testimonials.length; i++) {
    const t = testimonials[i];
    await prisma.testimonial.create({
      data: {
        rating: t.rating,
        source: t.source,
        order: i,
        translations: {
          create: [
            { locale: "ru", author: t.ru.author, task: t.ru.task, text: t.ru.text },
            { locale: "ro", author: t.ro.author, task: t.ro.task, text: t.ro.text },
          ],
        },
      },
    });
  }

  console.log(`  Created ${testimonials.length} testimonials with translations`);
}

// ==================== TEAM MEMBERS ====================

async function migrateTeamMembers() {
  console.log("\nMigrating team members...");

  const existingMembers = await prisma.teamMember.count();
  if (existingMembers > 0) {
    console.log(`  ${existingMembers} team members already exist, checking translations...`);

    const members = await prisma.teamMember.findMany({
      include: { translations: true },
    });

    for (const m of members) {
      if (m.translations.length === 0) {
        await prisma.teamMemberTranslation.createMany({
          data: [
            { memberId: m.id, locale: "ru", name: "Участник", role: "Разработчик", description: "Описание" },
            { memberId: m.id, locale: "ro", name: "Membru", role: "Dezvoltator", description: "Descriere" },
          ],
        });
        console.log(`  Added translations for member ${m.id}`);
      }
    }
    return;
  }

  const founder = await prisma.teamMember.create({
    data: {
      photo: "/images/team/founder.jpg",
      skills: ["TypeScript", "React", "Node.js", "PostgreSQL", "AWS"],
      isFounder: true,
      order: 0,
      translations: {
        create: [
          {
            locale: "ru",
            name: "Виталий Кореньков",
            role: "Full-Stack разработчик",
            description: "Основатель студии с 10+ годами опыта в разработке веб и мобильных приложений.",
            bio: "Специализируюсь на создании сложных веб-приложений с высокими требованиями к производительности и масштабируемости.",
          },
          {
            locale: "ro",
            name: "Vitalie Corenkov",
            role: "Dezvoltator Full-Stack",
            description: "Fondatorul studioului cu 10+ ani de experiență în dezvoltarea aplicațiilor web și mobile.",
            bio: "Mă specializez în crearea aplicațiilor web complexe cu cerințe ridicate de performanță și scalabilitate.",
          },
        ],
      },
      socialLinks: {
        create: {
          github: "https://github.com/metabyte",
          telegram: "@metabyte_dev",
        },
      },
    },
  });

  console.log(`  Created founder: ${founder.id}`);
}

// ==================== TESTIMONIAL STATS ====================

async function migrateTestimonialStats() {
  console.log("\nMigrating testimonial stats...");

  const existingStats = await prisma.testimonialStats.findFirst();
  if (existingStats) {
    console.log("  Testimonial stats already exist");
    return;
  }

  await prisma.testimonialStats.create({
    data: {
      id: "default",
      avgRating: 4.9,
      totalPositive: 47,
      totalNegative: 0,
      platform: "YouDo",
      platformUrl: "https://youdo.com/user/metabyte",
    },
  });

  console.log("  Created testimonial stats");
}

// ==================== MAIN ====================

async function main() {
  console.log("=".repeat(50));
  console.log("Starting site content migration...");
  console.log("=".repeat(50));

  try {
    await migrateSiteSettings();
    await migrateWorkProcess();
    await migrateFAQ();
    await migrateContactInfo();
    await migrateSkillCategories();
    await migratePricing();
    await migrateTestimonials();
    await migrateTeamMembers();
    await migrateTestimonialStats();

    console.log("\n" + "=".repeat(50));
    console.log("Migration completed successfully!");
    console.log("=".repeat(50));

    // Print summary
    const counts = await Promise.all([
      prisma.siteSettings.count(),
      prisma.workProcessStep.count(),
      prisma.faqItem.count(),
      prisma.contactInfo.count(),
      prisma.skillCategory.count(),
      prisma.pricingPackage.count(),
      prisma.testimonial.count(),
      prisma.teamMember.count(),
    ]);

    console.log("\nSummary:");
    console.log(`  - Site Settings: ${counts[0]}`);
    console.log(`  - Work Process Steps: ${counts[1]}`);
    console.log(`  - FAQ Items: ${counts[2]}`);
    console.log(`  - Contact Info: ${counts[3]}`);
    console.log(`  - Skill Categories: ${counts[4]}`);
    console.log(`  - Pricing Packages: ${counts[5]}`);
    console.log(`  - Testimonials: ${counts[6]}`);
    console.log(`  - Team Members: ${counts[7]}`);

  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
