import { PrismaClient, Category, SubmissionStatus } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting database seed...");

  // ==================== PROJECT CATEGORIES ====================
  console.log("📁 Seeding project categories...");

  const categories = [
    { value: "all", label: "Все проекты", order: 0 },
    { value: "games", label: "Игры", order: 1 },
    { value: "fintech", label: "FinTech", order: 2 },
    { value: "mobile", label: "Мобильные", order: 3 },
    { value: "enterprise", label: "Enterprise", order: 4 },
    { value: "automation", label: "Автоматизация", order: 5 },
  ];

  for (const cat of categories) {
    await prisma.projectCategory.upsert({
      where: { value: cat.value },
      update: cat,
      create: cat,
    });
  }

  // ==================== TESTIMONIALS ====================
  console.log("⭐ Seeding testimonials...");

  const testimonials = [
    {
      author: "Inna N.",
      task: "Сложный телеграм бот",
      text: "Владимир проделал отличную работу по созданию Telegram-бота, который взаимодействует с нашим API. Задание было выполнено на высоком уровне, все требования были учтены, и бот работает безупречно.",
      rating: 5,
      order: 0,
    },
    {
      author: "Татьяна М.",
      task: "Доделать сайт на React",
      text: "Огромное спасибо Владимиру за проделанную работу. В процессе нам потребовалось сделать даже больше, чем мы планировали, и Владимир отлично со всем справился, сделав все очень качественно.",
      rating: 5,
      order: 1,
    },
    {
      author: "Иван И.",
      task: "Разработка сайта",
      text: "Профессионально и четко проговорили, спланировали и реализовали проект сайта. Рекомендую!",
      rating: 5,
      order: 2,
    },
    {
      author: "Елизавета",
      task: "Создать мобильное приложение",
      text: "Владимир сделал именно то, что было нужно, был внимателен к мельчайшим деталям и изменениям, которые я вносила по ходу.",
      rating: 5,
      order: 3,
    },
    {
      author: "Ростислав К.",
      task: "Разработка в Telegram",
      text: "Очень рекомендую этого человека для сотрудничества: он вежлив, доброжелателен и всегда придерживается установленных сроков.",
      rating: 5,
      order: 4,
    },
    {
      author: "Роман",
      task: "Сделать сайт рулетку кс",
      text: "Все максимально внятно, понятно, а главное быстро. Созвонились по видео, обсудили все детали и рабочие моменты, спустя пару часов приступили к работе. Рекомендую",
      rating: 5,
      order: 5,
    },
  ];

  await prisma.testimonial.deleteMany();
  await prisma.testimonial.createMany({ data: testimonials });

  // Testimonial Stats
  await prisma.testimonialStats.upsert({
    where: { id: "default" },
    update: {
      avgRating: 4.9,
      totalPositive: 28,
      totalNegative: 0,
      platform: "YouDo",
      platformUrl: "https://youdo.com/u11536152",
    },
    create: {
      id: "default",
      avgRating: 4.9,
      totalPositive: 28,
      totalNegative: 0,
      platform: "YouDo",
      platformUrl: "https://youdo.com/u11536152",
    },
  });

  // ==================== TEAM MEMBERS ====================
  console.log("👥 Seeding team members...");

  await prisma.teamMember.deleteMany();

  const founder = await prisma.teamMember.create({
    data: {
      name: "Владимир",
      role: "Full-Stack разработчик",
      description: "Full-Stack разработчик и основатель IT-студии METABYTE. Создаю веб-приложения, мобильные приложения на Flutter, браузерные мультиплеерные игры и системы с AI-интеграцией.",
      photo: "/images/team/vladimir.png",
      skills: ["React", "Next.js", "Vue", "Flutter", "Node.js", "AI API"],
      bio: "За плечами 17+ коммерческих проектов: от FinTech платформ и EdTech приложений до 3D браузерных игр с real-time мультиплеером. Работаю с React, Next.js, Vue, Flutter, Node.js и современными AI API.",
      isFounder: true,
      order: 0,
    },
  });

  await prisma.teamMember.create({
    data: {
      name: "Сергей",
      role: "Full-Stack разработчик",
      description: "Архитектор игровых систем и веб-приложений. Специализируется на создании сложных мультиплеерных проектов с нуля. Превращает идеи в работающий код.",
      photo: "/images/team/zergo.png",
      skills: ["Game Dev", "Babylon.js", "Colyseus", "WebSocket"],
      isFounder: false,
      order: 1,
    },
  });

  await prisma.teamMember.create({
    data: {
      name: "Юрий",
      role: "DevOps & SEO-специалист",
      description: "Мастер продвижения и инфраструктуры. Обеспечивает стабильную работу проектов и их видимость в поисковых системах.",
      photo: "/images/team/yuri.png",
      skills: ["SEO", "DevOps", "CI/CD", "Analytics"],
      isFounder: false,
      order: 2,
    },
  });

  // ==================== SKILL CATEGORIES ====================
  console.log("🎯 Seeding skill categories...");

  await prisma.skillCategory.deleteMany();

  const skills = [
    {
      name: "Frontend",
      icon: "Globe",
      color: "#00ffff",
      items: ["React", "Next.js", "Vue 3", "TypeScript", "Tailwind CSS"],
      order: 0,
    },
    {
      name: "Backend",
      icon: "Database",
      color: "#ff00ff",
      items: ["Node.js", "Fastify", "PostgreSQL", "MongoDB", "Supabase"],
      order: 1,
    },
    {
      name: "Game Dev",
      icon: "Gamepad2",
      color: "#00ff00",
      items: ["Babylon.js", "Colyseus", "WebSocket", "Three.js", "Multiplayer"],
      order: 2,
    },
    {
      name: "Mobile",
      icon: "Smartphone",
      color: "#ffff00",
      items: ["Flutter", "Telegram Mini Apps", "Telegram Bot API", "Firebase"],
      order: 3,
    },
  ];

  await prisma.skillCategory.createMany({ data: skills });

  // ==================== TECH STACK ====================
  console.log("🔧 Seeding tech stack...");

  await prisma.techStackItem.deleteMany();

  const techStack = [
    { name: "Next.js", icon: "Triangle", color: "#ffffff", category: "Frontend", featured: true, order: 0 },
    { name: "TypeScript", icon: "FileCode", color: "#3178c6", category: "Language", featured: true, order: 1 },
    { name: "Node.js", icon: "Hexagon", color: "#339933", category: "Backend", featured: true, order: 2 },
    { name: "Flutter", icon: "Smartphone", color: "#02569B", category: "Mobile", featured: true, order: 3 },
    { name: "PostgreSQL", icon: "Database", color: "#336791", category: "Database", featured: true, order: 4 },
    { name: "Docker", icon: "Cloud", color: "#2496ed", category: "DevOps", featured: true, order: 5 },
  ];

  await prisma.techStackItem.createMany({ data: techStack });

  // ==================== WORK PROCESS ====================
  console.log("📋 Seeding work process steps...");

  await prisma.workProcessStep.deleteMany();

  const workProcess = [
    {
      number: "01",
      title: "Бриф",
      description: "Обсуждаем задачу, требования и сроки. Бесплатная консультация.",
      icon: "MessageSquare",
      color: "#00ffff",
      order: 0,
    },
    {
      number: "02",
      title: "Анализ",
      description: "Изучаем нишу, конкурентов. Готовим ТЗ и смету.",
      icon: "Search",
      color: "#ff00ff",
      order: 1,
    },
    {
      number: "03",
      title: "Дизайн",
      description: "Создаём прототипы и UI/UX дизайн. Утверждаем с вами.",
      icon: "Palette",
      color: "#ffaa00",
      order: 2,
    },
    {
      number: "04",
      title: "Разработка",
      description: "Пишем код, интегрируем API. Еженедельные демо.",
      icon: "Code2",
      color: "#00ff00",
      order: 3,
    },
    {
      number: "05",
      title: "Тестирование",
      description: "QA тестирование, исправление багов, оптимизация.",
      icon: "TestTube2",
      color: "#ff6b6b",
      order: 4,
    },
    {
      number: "06",
      title: "Запуск",
      description: "Деплой на сервер, обучение, поддержка 30 дней.",
      icon: "Rocket",
      color: "#4ecdc4",
      order: 5,
    },
  ];

  await prisma.workProcessStep.createMany({ data: workProcess });

  // ==================== PRICING ====================
  console.log("💰 Seeding pricing packages...");

  await prisma.pricingPackage.deleteMany();

  const packages = [
    {
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
      order: 0,
    },
    {
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
      order: 1,
    },
    {
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
      order: 2,
    },
  ];

  await prisma.pricingPackage.createMany({ data: packages });

  // Additional Services
  await prisma.additionalService.deleteMany();

  const services = [
    { name: "Telegram Bot", price: "от 30 000 ₽", description: "Бот с любым функционалом", order: 0 },
    { name: "Telegram Mini App", price: "от 80 000 ₽", description: "Приложение внутри Telegram", order: 1 },
    { name: "Интеграция с 1С", price: "от 50 000 ₽", description: "Синхронизация данных с 1С", order: 2 },
    { name: "AI интеграция", price: "от 40 000 ₽", description: "ChatGPT, Claude, генерация контента", order: 3 },
    { name: "Поддержка/месяц", price: "от 10 000 ₽", description: "Хостинг, мониторинг, багфиксы", order: 4 },
    { name: "UI/UX дизайн", price: "от 30 000 ₽", description: "Дизайн с Figma файлами", order: 5 },
  ];

  await prisma.additionalService.createMany({ data: services });

  // ==================== FAQ ====================
  console.log("❓ Seeding FAQ items...");

  await prisma.faqItem.deleteMany();

  const faqs = [
    {
      question: "Сколько стоит разработка?",
      answer: "Стоимость зависит от сложности проекта. Landing page — от 50 000 ₽, веб-приложение — от 200 000 ₽, мобильное приложение — от 300 000 ₽. Точную стоимость определяем после обсуждения требований.",
      order: 0,
    },
    {
      question: "Какие сроки разработки?",
      answer: "Landing page — 1-2 недели, веб-приложение — 1-2 месяца, мобильное приложение — 2-3 месяца. Сроки могут варьироваться в зависимости от сложности функционала.",
      order: 1,
    },
    {
      question: "Как происходит оплата?",
      answer: "Работаем по предоплате 50%. Оставшиеся 50% — после завершения проекта. Для крупных проектов возможна поэтапная оплата.",
      order: 2,
    },
    {
      question: "Что если результат не понравится?",
      answer: "На каждом этапе согласовываем результат. Если что-то не устраивает — вносим правки. Количество правок не ограничено в рамках ТЗ.",
      order: 3,
    },
    {
      question: "Делаете ли поддержку после запуска?",
      answer: "Да, предоставляем 30 дней бесплатной поддержки после запуска. Далее можно заключить договор на техническую поддержку.",
      order: 4,
    },
    {
      question: "Работаете ли с иностранными клиентами?",
      answer: "Да, работаем с клиентами из любых стран. Принимаем оплату в разных валютах. Общаемся на русском и английском.",
      order: 5,
    },
    {
      question: "Какие технологии используете?",
      answer: "Frontend: React, Next.js, Vue 3, TypeScript. Backend: Node.js, Fastify, PostgreSQL. Mobile: Flutter. Игры: Babylon.js, Colyseus. Плюс AI интеграции.",
      order: 6,
    },
    {
      question: "Можно ли посмотреть код после завершения?",
      answer: "Да, весь исходный код передаётся вам после завершения проекта. Вы получаете полные права на использование кода.",
      order: 7,
    },
  ];

  await prisma.faqItem.createMany({ data: faqs });

  // ==================== CONTACT INFO ====================
  console.log("📞 Seeding contact info...");

  await prisma.contactInfo.upsert({
    where: { id: "default" },
    update: {
      email: "vm@metabyte.md",
      telegram: "https://t.me/metabytemd",
      github: "https://github.com/LegoDev94",
      youdoUrl: "https://youdo.com/u11536152",
      responseTime: "24 часа",
    },
    create: {
      id: "default",
      email: "vm@metabyte.md",
      telegram: "https://t.me/metabytemd",
      github: "https://github.com/LegoDev94",
      youdoUrl: "https://youdo.com/u11536152",
      responseTime: "24 часа",
    },
  });

  // ==================== SITE SETTINGS ====================
  console.log("⚙️ Seeding site settings...");

  await prisma.siteSettings.upsert({
    where: { id: "default" },
    update: {
      companyName: "METABYTE",
      subtitle: "Full-Stack Development Studio",
      badgeText: "Открыт для предложений",
      heroServices: ["SaaS", "FinTech", "E-commerce", "Игры", "Mobile Apps"],
      heroTechStack: ["React", "Next.js", "Flutter", "Node.js", "TypeScript"],
      projectsCount: 17,
      rating: 4.9,
      countriesCount: 5,
      founderName: "Владимир",
      founderTitle: "Full-Stack разработчик и основатель IT-студии METABYTE",
      founderBioShort: "Создаю веб-приложения, мобильные приложения на Flutter, браузерные мультиплеерные игры и системы с AI-интеграцией.",
      founderBioLong: "За плечами 17+ коммерческих проектов: от FinTech платформ и EdTech приложений до 3D браузерных игр с real-time мультиплеером. Работаю с React, Next.js, Vue, Flutter, Node.js и современными AI API.",
      founderPhoto: "/images/team/vladimir.png",
    },
    create: {
      id: "default",
      companyName: "METABYTE",
      subtitle: "Full-Stack Development Studio",
      badgeText: "Открыт для предложений",
      heroServices: ["SaaS", "FinTech", "E-commerce", "Игры", "Mobile Apps"],
      heroTechStack: ["React", "Next.js", "Flutter", "Node.js", "TypeScript"],
      projectsCount: 17,
      rating: 4.9,
      countriesCount: 5,
      founderName: "Владимир",
      founderTitle: "Full-Stack разработчик и основатель IT-студии METABYTE",
      founderBioShort: "Создаю веб-приложения, мобильные приложения на Flutter, браузерные мультиплеерные игры и системы с AI-интеграцией.",
      founderBioLong: "За плечами 17+ коммерческих проектов: от FinTech платформ и EdTech приложений до 3D браузерных игр с real-time мультиплеером. Работаю с React, Next.js, Vue, Flutter, Node.js и современными AI API.",
      founderPhoto: "/images/team/vladimir.png",
    },
  });

  console.log("✅ Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
