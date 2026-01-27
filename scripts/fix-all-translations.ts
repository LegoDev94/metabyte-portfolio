/**
 * Fix All Translations Script
 * Updates all site content translations with actual content
 *
 * Usage: npx tsx scripts/fix-all-translations.ts
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ==================== WORK PROCESS ====================

const workProcessData = [
  {
    number: "01",
    ru: { title: "Анализ", description: "Детальный анализ требований, исследование рынка и конкурентов, формирование технического задания" },
    ro: { title: "Analiză", description: "Analiza detaliată a cerințelor, cercetarea pieței și a concurenților, elaborarea specificațiilor tehnice" }
  },
  {
    number: "02",
    ru: { title: "Проектирование", description: "Разработка архитектуры, создание прототипов и дизайн-макетов, согласование с заказчиком" },
    ro: { title: "Proiectare", description: "Dezvoltarea arhitecturii, crearea prototipurilor și machetelor de design, coordonarea cu clientul" }
  },
  {
    number: "03",
    ru: { title: "Разработка", description: "Итеративная разработка функционала, code review, регулярные демонстрации прогресса" },
    ro: { title: "Dezvoltare", description: "Dezvoltare iterativă a funcționalității, code review, demonstrații regulate ale progresului" }
  },
  {
    number: "04",
    ru: { title: "Тестирование", description: "Комплексное тестирование, исправление багов, оптимизация производительности" },
    ro: { title: "Testare", description: "Testare complexă, corectarea erorilor, optimizarea performanței" }
  },
  {
    number: "05",
    ru: { title: "Запуск", description: "Деплой на продакшен, настройка мониторинга, обучение команды заказчика" },
    ro: { title: "Lansare", description: "Implementare în producție, configurarea monitorizării, instruirea echipei clientului" }
  },
  {
    number: "06",
    ru: { title: "Поддержка", description: "Техническая поддержка, обновления, мониторинг и оперативное реагирование" },
    ro: { title: "Suport", description: "Suport tehnic, actualizări, monitorizare și răspuns rapid" }
  },
];

async function fixWorkProcess() {
  console.log("\nFixing Work Process translations...");

  const steps = await prisma.workProcessStep.findMany({
    orderBy: { order: "asc" },
  });

  for (const step of steps) {
    const data = workProcessData.find(d => d.number === step.number);
    if (!data) continue;

    await prisma.workProcessStepTranslation.deleteMany({
      where: { stepId: step.id },
    });

    await prisma.workProcessStepTranslation.createMany({
      data: [
        { stepId: step.id, locale: "ru", title: data.ru.title, description: data.ru.description },
        { stepId: step.id, locale: "ro", title: data.ro.title, description: data.ro.description },
      ],
    });

    console.log(`  Updated step ${step.number}: ${data.ru.title}`);
  }
}

// ==================== SKILL CATEGORIES ====================

const skillCategoriesData = [
  { order: 0, ru: "Frontend разработка", ro: "Dezvoltare Frontend" },
  { order: 1, ru: "Backend разработка", ro: "Dezvoltare Backend" },
  { order: 2, ru: "Мобильная разработка", ro: "Dezvoltare mobilă" },
  { order: 3, ru: "DevOps & Cloud", ro: "DevOps & Cloud" },
];

async function fixSkillCategories() {
  console.log("\nFixing Skill Categories translations...");

  const categories = await prisma.skillCategory.findMany({
    orderBy: { order: "asc" },
  });

  for (let i = 0; i < categories.length && i < skillCategoriesData.length; i++) {
    const cat = categories[i];
    const data = skillCategoriesData[i];

    await prisma.skillCategoryTranslation.deleteMany({
      where: { categoryId: cat.id },
    });

    await prisma.skillCategoryTranslation.createMany({
      data: [
        { categoryId: cat.id, locale: "ru", name: data.ru },
        { categoryId: cat.id, locale: "ro", name: data.ro },
      ],
    });

    console.log(`  Updated category: ${data.ru}`);
  }
}

// ==================== PRICING PACKAGES ====================

const pricingData = [
  {
    order: 0,
    ru: {
      name: "Лендинг",
      description: "Одностраничный сайт для презентации продукта или услуги",
      features: ["Адаптивный дизайн", "SEO оптимизация", "Форма обратной связи", "Интеграция аналитики", "Хостинг на 1 год"],
      notIncluded: ["Личный кабинет", "База данных", "Интеграции с CRM"],
    },
    ro: {
      name: "Landing Page",
      description: "Site de o pagină pentru prezentarea unui produs sau serviciu",
      features: ["Design responsive", "Optimizare SEO", "Formular de contact", "Integrare analitică", "Hosting pentru 1 an"],
      notIncluded: ["Cabinet personal", "Bază de date", "Integrări CRM"],
    },
  },
  {
    order: 1,
    ru: {
      name: "Веб-приложение",
      description: "Полнофункциональное веб-приложение с личным кабинетом",
      features: ["Авторизация и регистрация", "Личный кабинет пользователя", "Админ-панель", "API интеграции", "База данных", "Мобильная адаптация"],
      notIncluded: [],
    },
    ro: {
      name: "Aplicație Web",
      description: "Aplicație web complet funcțională cu cabinet personal",
      features: ["Autentificare și înregistrare", "Cabinet personal utilizator", "Panou de administrare", "Integrări API", "Bază de date", "Adaptare mobilă"],
      notIncluded: [],
    },
  },
  {
    order: 2,
    ru: {
      name: "Enterprise",
      description: "Масштабные корпоративные решения и сложные системы",
      features: ["Микросервисная архитектура", "Высокая доступность (99.9%)", "Интеграция с корпоративными системами", "Техподдержка 24/7", "SLA гарантии", "Выделенный менеджер"],
      notIncluded: [],
    },
    ro: {
      name: "Enterprise",
      description: "Soluții corporative la scară largă și sisteme complexe",
      features: ["Arhitectură microservicii", "Disponibilitate ridicată (99.9%)", "Integrare cu sisteme corporative", "Suport tehnic 24/7", "Garanții SLA", "Manager dedicat"],
      notIncluded: [],
    },
  },
];

async function fixPricing() {
  console.log("\nFixing Pricing translations...");

  const packages = await prisma.pricingPackage.findMany({
    orderBy: { order: "asc" },
  });

  for (let i = 0; i < packages.length && i < pricingData.length; i++) {
    const pkg = packages[i];
    const data = pricingData[i];

    await prisma.pricingPackageTranslation.deleteMany({
      where: { packageId: pkg.id },
    });

    await prisma.pricingPackageTranslation.createMany({
      data: [
        { packageId: pkg.id, locale: "ru", name: data.ru.name, description: data.ru.description, features: data.ru.features, notIncluded: data.ru.notIncluded },
        { packageId: pkg.id, locale: "ro", name: data.ro.name, description: data.ro.description, features: data.ro.features, notIncluded: data.ro.notIncluded },
      ],
    });

    console.log(`  Updated package: ${data.ru.name}`);
  }
}

// ==================== TESTIMONIALS ====================

const testimonialsData = [
  {
    order: 0,
    ru: { author: "Алексей Петров", task: "Разработка CRM-системы", text: "Отличная работа! Система полностью соответствует нашим требованиям. Команда профессионалов, рекомендую!" },
    ro: { author: "Alexei Petrov", task: "Dezvoltare sistem CRM", text: "Lucru excelent! Sistemul corespunde complet cerințelor noastre. Echipă de profesioniști, recomand!" },
  },
  {
    order: 1,
    ru: { author: "Марина Сидорова", task: "Создание интернет-магазина", text: "Очень доволен результатом. Сайт работает быстро, дизайн современный. Продажи выросли на 40%!" },
    ro: { author: "Marina Sidorova", task: "Creare magazin online", text: "Foarte mulțumit de rezultat. Site-ul funcționează rapid, design modern. Vânzările au crescut cu 40%!" },
  },
  {
    order: 2,
    ru: { author: "Дмитрий Волков", task: "Интеграция платежной системы", text: "Профессиональный подход к делу. Интеграция прошла гладко, всё работает стабильно уже год." },
    ro: { author: "Dmitri Volkov", task: "Integrare sistem de plăți", text: "Abordare profesionistă. Integrarea a decurs fără probleme, totul funcționează stabil de un an." },
  },
  {
    order: 3,
    ru: { author: "Елена Козлова", task: "Разработка мобильного приложения", text: "Приложение получилось удобным и красивым. Пользователи довольны, рейтинг в App Store 4.8!" },
    ro: { author: "Elena Kozlova", task: "Dezvoltare aplicație mobilă", text: "Aplicația a ieșit comodă și frumoasă. Utilizatorii sunt mulțumiți, rating în App Store 4.8!" },
  },
  {
    order: 4,
    ru: { author: "Игорь Новиков", task: "Оптимизация производительности", text: "Время загрузки сайта сократилось в 3 раза. Отличный результат, спасибо команде!" },
    ro: { author: "Igor Novikov", task: "Optimizarea performanței", text: "Timpul de încărcare a site-ului s-a redus de 3 ori. Rezultat excelent, mulțumim echipei!" },
  },
  {
    order: 5,
    ru: { author: "Анна Белова", task: "Редизайн корпоративного сайта", text: "Новый дизайн превзошел ожидания. Современно, стильно, удобно. Конверсия выросла вдвое!" },
    ro: { author: "Anna Belova", task: "Redesign site corporativ", text: "Noul design a depășit așteptările. Modern, stilat, comod. Conversia a crescut de două ori!" },
  },
];

async function fixTestimonials() {
  console.log("\nFixing Testimonials translations...");

  const testimonials = await prisma.testimonial.findMany({
    orderBy: { order: "asc" },
  });

  for (let i = 0; i < testimonials.length && i < testimonialsData.length; i++) {
    const t = testimonials[i];
    const data = testimonialsData[i];

    await prisma.testimonialTranslation.deleteMany({
      where: { testimonialId: t.id },
    });

    await prisma.testimonialTranslation.createMany({
      data: [
        { testimonialId: t.id, locale: "ru", author: data.ru.author, task: data.ru.task, text: data.ru.text },
        { testimonialId: t.id, locale: "ro", author: data.ro.author, task: data.ro.task, text: data.ro.text },
      ],
    });

    console.log(`  Updated testimonial: ${data.ru.author}`);
  }
}

// ==================== TEAM MEMBERS ====================

const teamData = [
  {
    order: 0,
    isFounder: true,
    ru: {
      name: "Виталий Кореньков",
      role: "Full-Stack разработчик, основатель",
      description: "10+ лет опыта в разработке веб и мобильных приложений",
      bio: "Специализируюсь на создании сложных веб-приложений с высокими требованиями к производительности и масштабируемости. Работал над проектами для финтех-компаний, игровых студий и крупных ритейлеров.",
    },
    ro: {
      name: "Vitalie Corenkov",
      role: "Dezvoltator Full-Stack, fondator",
      description: "10+ ani de experiență în dezvoltarea aplicațiilor web și mobile",
      bio: "Mă specializez în crearea aplicațiilor web complexe cu cerințe ridicate de performanță și scalabilitate. Am lucrat la proiecte pentru companii fintech, studiouri de jocuri și retaileri mari.",
    },
  },
  {
    order: 1,
    isFounder: false,
    ru: {
      name: "UI/UX Дизайнер",
      role: "Дизайнер интерфейсов",
      description: "Создание современных и удобных интерфейсов",
      bio: null,
    },
    ro: {
      name: "UI/UX Designer",
      role: "Designer de interfețe",
      description: "Crearea interfețelor moderne și convenabile",
      bio: null,
    },
  },
  {
    order: 2,
    isFounder: false,
    ru: {
      name: "DevOps Инженер",
      role: "DevOps специалист",
      description: "Настройка инфраструктуры и CI/CD",
      bio: null,
    },
    ro: {
      name: "DevOps Engineer",
      role: "Specialist DevOps",
      description: "Configurarea infrastructurii și CI/CD",
      bio: null,
    },
  },
];

async function fixTeamMembers() {
  console.log("\nFixing Team Members translations...");

  const members = await prisma.teamMember.findMany({
    orderBy: { order: "asc" },
  });

  for (let i = 0; i < members.length && i < teamData.length; i++) {
    const m = members[i];
    const data = teamData[i];

    await prisma.teamMemberTranslation.deleteMany({
      where: { memberId: m.id },
    });

    await prisma.teamMemberTranslation.createMany({
      data: [
        { memberId: m.id, locale: "ru", name: data.ru.name, role: data.ru.role, description: data.ru.description, bio: data.ru.bio },
        { memberId: m.id, locale: "ro", name: data.ro.name, role: data.ro.role, description: data.ro.description, bio: data.ro.bio },
      ],
    });

    console.log(`  Updated member: ${data.ru.name}`);
  }
}

// ==================== MAIN ====================

async function main() {
  console.log("=".repeat(50));
  console.log("Fixing all translations...");
  console.log("=".repeat(50));

  try {
    await fixWorkProcess();
    await fixSkillCategories();
    await fixPricing();
    await fixTestimonials();
    await fixTeamMembers();

    console.log("\n" + "=".repeat(50));
    console.log("All translations fixed successfully!");
    console.log("=".repeat(50));

  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
