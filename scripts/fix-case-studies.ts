/**
 * Fix Case Studies Script
 * 1. Add RO translation for vibe-taxi
 * 2. Add translations for vibe-taxi user flows and technical highlights
 * 3. Create case studies for 9 projects without them
 *
 * Usage: npx tsx scripts/fix-case-studies.ts
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ==================== VIBE-TAXI RO TRANSLATION ====================

async function fixVibeTaxi() {
  console.log("\n=== Fixing vibe-taxi case study ===\n");

  const cs = await prisma.caseStudy.findFirst({
    where: { project: { slug: "vibe-taxi" } },
    include: {
      userFlows: { include: { steps: true } },
      technicalHighlights: true,
    },
  });

  if (!cs) {
    console.log("vibe-taxi case study not found");
    return;
  }

  // Add RO translation for main case study
  await prisma.caseStudyTranslation.upsert({
    where: { caseStudyId_locale: { caseStudyId: cs.id, locale: "ro" } },
    create: {
      caseStudyId: cs.id,
      locale: "ro",
      challenge:
        "Clientul avea nevoie de o aplicatie mobila de taxi pentru piata locala — un analog Uber/Yandex.Taxi, dar cu autorizare prin Telegram, deoarece utilizatorii din regiune sunt obisnuiti cu messengerul. Erau necesare trei aplicatii separate: pentru pasageri, soferi si administratori.",
      solution:
        "Am dezvoltat o baza de cod unica pe Flutter cu trei entry points pentru diferite aplicatii. Supabase asigura backend-ul: PostgreSQL pentru date, Realtime pentru urmarirea soferilor, Edge Functions pentru logica de business (calculul pretului, cautarea soferilor), Storage pentru verificarea foto. Bot Telegram cu deep linking pentru autorizare fara intreruperi.",
      results: [
        "Baza de cod Flutter unica pentru 3 aplicatii — economie 40% din timpul de dezvoltare",
        "Autorizare Telegram in 2 click-uri fara introducerea telefonului si parolei",
        "Urmarire soferi in timp real pe harta cu actualizare la fiecare 2 secunde",
        "Sistem de verificare soferi cu incarcare documente si verificare admin",
        "3 tarife (Economy/Comfort/Business) cu calcul automat al costului",
        "Chat intre client si sofer in timpul calatoriei",
      ],
    },
    update: {},
  });
  console.log("  Added RO translation for vibe-taxi case study");

  // Add translations for user flows
  const userFlowsData = [
    {
      order: 0,
      ru: { title: "Заказ такси", description: "Полный процесс заказа такси" },
      ro: { title: "Comanda taxi", description: "Procesul complet de comanda taxi" },
      steps: [
        { order: 0, ru: { title: "Авторизация", description: "Вход через Telegram" }, ro: { title: "Autorizare", description: "Intrare prin Telegram" } },
        { order: 1, ru: { title: "Точка назначения", description: "Выбор адреса" }, ro: { title: "Destinatie", description: "Alegerea adresei" } },
        { order: 2, ru: { title: "Тариф", description: "Выбор класса авто" }, ro: { title: "Tarif", description: "Alegerea clasei auto" } },
        { order: 3, ru: { title: "Поиск водителя", description: "Автоматический подбор" }, ro: { title: "Cautare sofer", description: "Selectie automata" } },
        { order: 4, ru: { title: "Поездка", description: "Отслеживание на карте" }, ro: { title: "Calatorie", description: "Urmarire pe harta" } },
        { order: 5, ru: { title: "Оценка", description: "Отзыв о поездке" }, ro: { title: "Evaluare", description: "Recenzie calatorie" } },
      ],
    },
    {
      order: 1,
      ru: { title: "Регистрация водителя", description: "Верификация и подключение" },
      ro: { title: "Inregistrare sofer", description: "Verificare si conectare" },
      steps: [
        { order: 0, ru: { title: "Документы", description: "Загрузка прав и паспорта" }, ro: { title: "Documente", description: "Incarcare permis si pasaport" } },
        { order: 1, ru: { title: "Проверка", description: "Верификация админом" }, ro: { title: "Verificare", description: "Verificare de admin" } },
        { order: 2, ru: { title: "Активация", description: "Включение на линию" }, ro: { title: "Activare", description: "Pornire pe linie" } },
        { order: 3, ru: { title: "Уведомления", description: "Приём заказов" }, ro: { title: "Notificari", description: "Primire comenzi" } },
        { order: 4, ru: { title: "Навигация", description: "К клиенту" }, ro: { title: "Navigare", description: "Catre client" } },
        { order: 5, ru: { title: "Рейтинг", description: "Получение оценки" }, ro: { title: "Rating", description: "Primire evaluare" } },
      ],
    },
    {
      order: 2,
      ru: { title: "Админ-панель", description: "Управление сервисом" },
      ro: { title: "Panou admin", description: "Gestionare serviciu" },
      steps: [
        { order: 0, ru: { title: "Статистика", description: "Обзор поездок" }, ro: { title: "Statistici", description: "Privire calatorii" } },
        { order: 1, ru: { title: "Водители", description: "Верификация заявок" }, ro: { title: "Soferi", description: "Verificare cereri" } },
        { order: 2, ru: { title: "Тарифы", description: "Настройка цен" }, ro: { title: "Tarife", description: "Setare preturi" } },
        { order: 3, ru: { title: "Мониторинг", description: "Активные поездки" }, ro: { title: "Monitorizare", description: "Calatorii active" } },
        { order: 4, ru: { title: "Пользователи", description: "Управление аккаунтами" }, ro: { title: "Utilizatori", description: "Gestionare conturi" } },
      ],
    },
  ];

  for (const flowData of userFlowsData) {
    const flow = cs.userFlows.find((f) => f.order === flowData.order);
    if (!flow) continue;

    // Add flow translations
    for (const locale of ["ru", "ro"] as const) {
      await prisma.userFlowTranslation.upsert({
        where: { flowId_locale: { flowId: flow.id, locale } },
        create: { flowId: flow.id, locale, title: flowData[locale].title, description: flowData[locale].description },
        update: { title: flowData[locale].title, description: flowData[locale].description },
      });
    }

    // Add step translations
    for (const stepData of flowData.steps) {
      const step = flow.steps.find((s) => s.order === stepData.order);
      if (!step) continue;

      for (const locale of ["ru", "ro"] as const) {
        await prisma.userFlowStepTranslation.upsert({
          where: { stepId_locale: { stepId: step.id, locale } },
          create: { stepId: step.id, locale, title: stepData[locale].title, description: stepData[locale].description },
          update: { title: stepData[locale].title, description: stepData[locale].description },
        });
      }
    }
  }
  console.log("  Added translations for user flows and steps");

  // Add translations for technical highlights
  const highlightsData = [
    {
      order: 0,
      ru: { title: "Flutter Monorepo", description: "Единая кодовая база для 3 приложений с общими компонентами и бизнес-логикой", tags: ["Flutter", "Dart", "Monorepo"] },
      ro: { title: "Flutter Monorepo", description: "Baza de cod unica pentru 3 aplicatii cu componente si logica de business comune", tags: ["Flutter", "Dart", "Monorepo"] },
    },
    {
      order: 1,
      ru: { title: "Supabase Backend", description: "PostgreSQL + Realtime + Edge Functions + Storage — полный бэкенд без сервера", tags: ["Supabase", "PostgreSQL", "Serverless"] },
      ro: { title: "Supabase Backend", description: "PostgreSQL + Realtime + Edge Functions + Storage — backend complet fara server", tags: ["Supabase", "PostgreSQL", "Serverless"] },
    },
    {
      order: 2,
      ru: { title: "Telegram Auth", description: "Бесшовная авторизация через Telegram Bot с deep linking — без SMS и паролей", tags: ["Telegram", "Auth", "Deep Links"] },
      ro: { title: "Telegram Auth", description: "Autorizare fara intreruperi prin Telegram Bot cu deep linking — fara SMS si parole", tags: ["Telegram", "Auth", "Deep Links"] },
    },
    {
      order: 3,
      ru: { title: "Realtime Tracking", description: "Отслеживание водителей в реальном времени с обновлением каждые 2 секунды", tags: ["WebSocket", "Maps", "Realtime"] },
      ro: { title: "Realtime Tracking", description: "Urmarire soferi in timp real cu actualizare la fiecare 2 secunde", tags: ["WebSocket", "Maps", "Realtime"] },
    },
  ];

  for (const hlData of highlightsData) {
    const hl = cs.technicalHighlights.find((h) => h.order === hlData.order);
    if (!hl) continue;

    for (const locale of ["ru", "ro"] as const) {
      await prisma.technicalHighlightTranslation.upsert({
        where: { highlightId_locale: { highlightId: hl.id, locale } },
        create: { highlightId: hl.id, locale, title: hlData[locale].title, description: hlData[locale].description, tags: hlData[locale].tags },
        update: { title: hlData[locale].title, description: hlData[locale].description, tags: hlData[locale].tags },
      });
    }
  }
  console.log("  Added translations for technical highlights");
}

// ==================== CREATE CASE STUDIES FOR OTHER PROJECTS ====================

interface CaseStudyData {
  slug: string;
  ru: { challenge: string; solution: string; results: string[] };
  ro: { challenge: string; solution: string; results: string[] };
  userFlows: Array<{
    icon: string;
    ru: { title: string; description: string };
    ro: { title: string; description: string };
    steps: Array<{
      icon: string;
      ru: { title: string; description: string };
      ro: { title: string; description: string };
    }>;
  }>;
  technicalHighlights: Array<{
    icon: string;
    ru: { title: string; description: string; tags: string[] };
    ro: { title: string; description: string; tags: string[] };
  }>;
}

const newCaseStudies: CaseStudyData[] = [
  // MONOPOLY LUX
  {
    slug: "monopoly-lux",
    ru: {
      challenge: "Клиент хотел онлайн-версию Монополии для игры с друзьями без установки приложений. Требовались мультиплеер в реальном времени, система комнат, голосовой чат и анимации.",
      solution: "Разработал браузерную игру на React с WebSocket для синхронизации состояния между игроками. Zustand для локального стейта, Canvas для анимаций доски. Система комнат с приватными кодами для игры с друзьями.",
      results: [
        "WebSocket мультиплеер до 6 игроков в одной комнате",
        "Модульная архитектура позволяет легко добавлять новые карты и правила",
        "Система достижений и статистика игроков",
        "Адаптивный дизайн — играть можно с телефона",
        "Голосовой чат между игроками во время партии",
        "Автосохранение игры при отключении",
      ],
    },
    ro: {
      challenge: "Clientul dorea o versiune online a Monopoly pentru a juca cu prietenii fara instalare de aplicatii. Erau necesare multiplayer in timp real, sistem de camere, chat vocal si animatii.",
      solution: "Am dezvoltat un joc in browser pe React cu WebSocket pentru sincronizarea starii intre jucatori. Zustand pentru state local, Canvas pentru animatii tabla. Sistem de camere cu coduri private pentru joc cu prietenii.",
      results: [
        "WebSocket multiplayer pana la 6 jucatori intr-o camera",
        "Arhitectura modulara permite adaugarea usoara de harti si reguli noi",
        "Sistem de realizari si statistici jucatori",
        "Design responsive — se poate juca de pe telefon",
        "Chat vocal intre jucatori in timpul partidei",
        "Salvare automata joc la deconectare",
      ],
    },
    userFlows: [
      {
        icon: "play",
        ru: { title: "Создание игры", description: "Начало новой партии" },
        ro: { title: "Creare joc", description: "Incepere partida noua" },
        steps: [
          { icon: "user", ru: { title: "Вход", description: "Авторизация игрока" }, ro: { title: "Intrare", description: "Autorizare jucator" } },
          { icon: "plus", ru: { title: "Комната", description: "Создание или присоединение" }, ro: { title: "Camera", description: "Creare sau alaturare" } },
          { icon: "users", ru: { title: "Ожидание", description: "Сбор игроков" }, ro: { title: "Asteptare", description: "Adunare jucatori" } },
          { icon: "play", ru: { title: "Старт", description: "Начало игры" }, ro: { title: "Start", description: "Incepere joc" } },
        ],
      },
      {
        icon: "dice-1",
        ru: { title: "Игровой процесс", description: "Ход игрока" },
        ro: { title: "Proces de joc", description: "Tura jucatorului" },
        steps: [
          { icon: "dice-5", ru: { title: "Бросок", description: "Кубики" }, ro: { title: "Aruncare", description: "Zaruri" } },
          { icon: "map-pin", ru: { title: "Перемещение", description: "Фишка" }, ro: { title: "Deplasare", description: "Piesa" } },
          { icon: "credit-card", ru: { title: "Действие", description: "Покупка/аренда" }, ro: { title: "Actiune", description: "Cumparare/chirie" } },
          { icon: "arrow-right", ru: { title: "Передача", description: "Следующий игрок" }, ro: { title: "Transmitere", description: "Urmatorul jucator" } },
        ],
      },
    ],
    technicalHighlights: [
      {
        icon: "wifi",
        ru: { title: "WebSocket Sync", description: "Синхронизация состояния игры в реальном времени между всеми игроками", tags: ["WebSocket", "State Sync", "Multiplayer"] },
        ro: { title: "WebSocket Sync", description: "Sincronizare stare joc in timp real intre toti jucatorii", tags: ["WebSocket", "State Sync", "Multiplayer"] },
      },
      {
        icon: "box",
        ru: { title: "Zustand Store", description: "Централизованное управление состоянием с персистентностью", tags: ["Zustand", "State", "Persistence"] },
        ro: { title: "Zustand Store", description: "Gestionare centralizata a starii cu persistenta", tags: ["Zustand", "State", "Persistence"] },
      },
      {
        icon: "image",
        ru: { title: "Canvas Animation", description: "Плавные анимации доски и фишек на Canvas 2D", tags: ["Canvas", "Animation", "2D"] },
        ro: { title: "Canvas Animation", description: "Animatii fluide tabla si piese pe Canvas 2D", tags: ["Canvas", "Animation", "2D"] },
      },
    ],
  },

  // 404 DISPATCH
  {
    slug: "404-dispatch",
    ru: {
      challenge: "Транспортной компании нужна была CRM для управления водителями, грузами и бухгалтерией. Существующие решения либо слишком дорогие, либо не покрывают все потребности.",
      solution: "Создал полнофункциональную CRM на Next.js с MongoDB. Интеграция с Cloudinary для хранения документов, OpenAI для автоматической обработки накладных. Дашборды с аналитикой в реальном времени.",
      results: [
        "Управление парком из 50+ водителей в одном интерфейсе",
        "Автоматический парсинг накладных через AI — экономия 10 часов в неделю",
        "Интеграция с бухгалтерией и расчёт зарплат",
        "Мобильный интерфейс для водителей",
        "Отчёты и аналитика по рейсам",
        "История всех грузов и документов",
      ],
    },
    ro: {
      challenge: "O companie de transport avea nevoie de un CRM pentru gestionarea soferilor, incarcaturilor si contabilitatii. Solutiile existente erau fie prea scumpe, fie nu acopereau toate necesitatile.",
      solution: "Am creat un CRM complet functional pe Next.js cu MongoDB. Integrare cu Cloudinary pentru stocarea documentelor, OpenAI pentru procesarea automata a facturilor. Dashboard-uri cu analiza in timp real.",
      results: [
        "Gestionare parc de 50+ soferi intr-o singura interfata",
        "Parsare automata facturi prin AI — economie 10 ore pe saptamana",
        "Integrare cu contabilitate si calcul salarii",
        "Interfata mobila pentru soferi",
        "Rapoarte si analiza pe curse",
        "Istoric toate incarcaturile si documentele",
      ],
    },
    userFlows: [
      {
        icon: "truck",
        ru: { title: "Создание рейса", description: "Оформление груза" },
        ro: { title: "Creare cursa", description: "Inregistrare incarcare" },
        steps: [
          { icon: "file-plus", ru: { title: "Накладная", description: "Загрузка документа" }, ro: { title: "Factura", description: "Incarcare document" } },
          { icon: "cpu", ru: { title: "AI парсинг", description: "Автообработка" }, ro: { title: "AI parsare", description: "Autoprocesare" } },
          { icon: "user", ru: { title: "Водитель", description: "Назначение" }, ro: { title: "Sofer", description: "Atribuire" } },
          { icon: "navigation", ru: { title: "Отправка", description: "Старт рейса" }, ro: { title: "Expediere", description: "Start cursa" } },
        ],
      },
    ],
    technicalHighlights: [
      {
        icon: "brain",
        ru: { title: "AI Document Parsing", description: "Автоматическое извлечение данных из накладных через OpenAI Vision", tags: ["OpenAI", "OCR", "Automation"] },
        ro: { title: "AI Document Parsing", description: "Extragere automata date din facturi prin OpenAI Vision", tags: ["OpenAI", "OCR", "Automation"] },
      },
      {
        icon: "database",
        ru: { title: "MongoDB Atlas", description: "Гибкая схема для разнообразных типов документов и грузов", tags: ["MongoDB", "NoSQL", "Atlas"] },
        ro: { title: "MongoDB Atlas", description: "Schema flexibila pentru diverse tipuri de documente si incarcaturi", tags: ["MongoDB", "NoSQL", "Atlas"] },
      },
      {
        icon: "cloud",
        ru: { title: "Cloudinary CDN", description: "Хранение и оптимизация документов, автоматические превью", tags: ["Cloudinary", "CDN", "Images"] },
        ro: { title: "Cloudinary CDN", description: "Stocare si optimizare documente, preview-uri automate", tags: ["Cloudinary", "CDN", "Images"] },
      },
    ],
  },

  // EXCHANGER PMR
  {
    slug: "exchanger-pmr",
    ru: {
      challenge: "Нужна была P2P платформа обмена валют для региона с ограниченным доступом к банковским услугам. Пользователи должны находить друг друга и совершать сделки безопасно.",
      solution: "Разработал Telegram Mini App на Vue 3 с Express бэкендом. Socket.IO для real-time уведомлений о новых предложениях. Система рейтингов и отзывов для доверия между пользователями.",
      results: [
        "P2P обмен без комиссий платформы",
        "Real-time уведомления о новых предложениях",
        "Система рейтингов и отзывов",
        "Эскроу-система для безопасных сделок",
        "Поддержка 5+ валют региона",
        "Telegram-авторизация без регистрации",
      ],
    },
    ro: {
      challenge: "Era necesara o platforma P2P de schimb valutar pentru o regiune cu acces limitat la servicii bancare. Utilizatorii trebuiau sa se gaseasca si sa faca tranzactii in siguranta.",
      solution: "Am dezvoltat o Telegram Mini App pe Vue 3 cu backend Express. Socket.IO pentru notificari in timp real despre oferte noi. Sistem de ratinguri si recenzii pentru incredere intre utilizatori.",
      results: [
        "Schimb P2P fara comisioane platforma",
        "Notificari in timp real despre oferte noi",
        "Sistem de ratinguri si recenzii",
        "Sistem escrow pentru tranzactii sigure",
        "Suport 5+ valute regionale",
        "Autorizare Telegram fara inregistrare",
      ],
    },
    userFlows: [
      {
        icon: "repeat",
        ru: { title: "Обмен валюты", description: "Процесс сделки" },
        ro: { title: "Schimb valutar", description: "Proces tranzactie" },
        steps: [
          { icon: "search", ru: { title: "Поиск", description: "Найти предложение" }, ro: { title: "Cautare", description: "Gasire oferta" } },
          { icon: "message-circle", ru: { title: "Контакт", description: "Связь с продавцом" }, ro: { title: "Contact", description: "Legatura cu vanzatorul" } },
          { icon: "lock", ru: { title: "Эскроу", description: "Блокировка средств" }, ro: { title: "Escrow", description: "Blocare fonduri" } },
          { icon: "check", ru: { title: "Подтверждение", description: "Завершение сделки" }, ro: { title: "Confirmare", description: "Finalizare tranzactie" } },
        ],
      },
    ],
    technicalHighlights: [
      {
        icon: "shield",
        ru: { title: "Escrow System", description: "Безопасное хранение средств до подтверждения обеими сторонами", tags: ["Security", "Escrow", "Trust"] },
        ro: { title: "Sistem Escrow", description: "Stocare sigura fonduri pana la confirmarea ambelor parti", tags: ["Security", "Escrow", "Trust"] },
      },
      {
        icon: "zap",
        ru: { title: "Socket.IO Realtime", description: "Мгновенные уведомления о новых предложениях и сообщениях", tags: ["Socket.IO", "Realtime", "Notifications"] },
        ro: { title: "Socket.IO Realtime", description: "Notificari instantanee despre oferte si mesaje noi", tags: ["Socket.IO", "Realtime", "Notifications"] },
      },
    ],
  },

  // FNS TG SCAN
  {
    slug: "fns-tg-scan",
    ru: {
      challenge: "Пользователям нужен был удобный способ сканировать чеки и извлекать данные для учёта расходов. Существующие приложения требуют установки и работают нестабильно.",
      solution: "Создал Telegram Mini App с клиентским OCR через Tesseract.js и сканером QR-кодов jsQR. Вся обработка происходит на устройстве пользователя — быстро и приватно.",
      results: [
        "Сканирование QR-кодов чеков за 0.5 секунды",
        "OCR распознавание текста на 95%+ точность",
        "Работает офлайн после первой загрузки",
        "Экспорт данных в CSV и JSON",
        "История всех отсканированных чеков",
        "Категоризация расходов",
      ],
    },
    ro: {
      challenge: "Utilizatorii aveau nevoie de o modalitate convenabila de a scana bonuri si extrage date pentru evidenta cheltuielilor. Aplicatiile existente necesita instalare si functioneaza instabil.",
      solution: "Am creat o Telegram Mini App cu OCR pe client prin Tesseract.js si scanner QR jsQR. Toata procesarea are loc pe dispozitivul utilizatorului — rapid si privat.",
      results: [
        "Scanare coduri QR bonuri in 0.5 secunde",
        "Recunoastere text OCR cu 95%+ acuratete",
        "Functioneaza offline dupa prima incarcare",
        "Export date in CSV si JSON",
        "Istoric toate bonurile scanate",
        "Categorizare cheltuieli",
      ],
    },
    userFlows: [
      {
        icon: "scan",
        ru: { title: "Сканирование чека", description: "Процесс распознавания" },
        ro: { title: "Scanare bon", description: "Proces recunoastere" },
        steps: [
          { icon: "camera", ru: { title: "Камера", description: "Наведение на чек" }, ro: { title: "Camera", description: "Indreptare spre bon" } },
          { icon: "cpu", ru: { title: "OCR", description: "Распознавание" }, ro: { title: "OCR", description: "Recunoastere" } },
          { icon: "edit", ru: { title: "Проверка", description: "Корректировка" }, ro: { title: "Verificare", description: "Corectare" } },
          { icon: "save", ru: { title: "Сохранение", description: "В историю" }, ro: { title: "Salvare", description: "In istoric" } },
        ],
      },
    ],
    technicalHighlights: [
      {
        icon: "eye",
        ru: { title: "Tesseract.js OCR", description: "Клиентское распознавание текста без отправки на сервер", tags: ["Tesseract", "OCR", "Privacy"] },
        ro: { title: "Tesseract.js OCR", description: "Recunoastere text pe client fara trimitere pe server", tags: ["Tesseract", "OCR", "Privacy"] },
      },
      {
        icon: "qr-code",
        ru: { title: "jsQR Scanner", description: "Быстрое декодирование QR-кодов через камеру", tags: ["QR", "Camera", "Decoding"] },
        ro: { title: "jsQR Scanner", description: "Decodare rapida coduri QR prin camera", tags: ["QR", "Camera", "Decoding"] },
      },
    ],
  },

  // AKBAROV
  {
    slug: "akbarov",
    ru: {
      challenge: "Доктору спортивной медицины нужен был современный лендинг для привлечения клиентов. Важны были галерея работ, видео-отзывы и удобная форма записи.",
      solution: "Создал минималистичный лендинг на чистом HTML/CSS/JS с оптимизацией под SEO. Интеграция с Telegram Bot для получения заявок. Lazy loading для медиа-контента.",
      results: [
        "Lighthouse Performance 98/100",
        "SEO оптимизация — топ-3 в Google по ключевым запросам",
        "Галерея работ с lightbox",
        "Видео-отзывы пациентов",
        "Форма записи с отправкой в Telegram",
        "Мобильная адаптация",
      ],
    },
    ro: {
      challenge: "Un doctor de medicina sportiva avea nevoie de un landing modern pentru atragerea clientilor. Erau importante galeria lucrarilor, video-recenzii si formular de programare convenabil.",
      solution: "Am creat un landing minimalist pe HTML/CSS/JS pur cu optimizare SEO. Integrare cu Telegram Bot pentru primirea cererilor. Lazy loading pentru continut media.",
      results: [
        "Lighthouse Performance 98/100",
        "Optimizare SEO — top-3 in Google pe cuvinte cheie",
        "Galerie lucrari cu lightbox",
        "Video-recenzii pacienti",
        "Formular programare cu trimitere in Telegram",
        "Adaptare mobila",
      ],
    },
    userFlows: [
      {
        icon: "calendar",
        ru: { title: "Запись на приём", description: "Процесс записи" },
        ro: { title: "Programare vizita", description: "Proces programare" },
        steps: [
          { icon: "eye", ru: { title: "Ознакомление", description: "Просмотр услуг" }, ro: { title: "Familiarizare", description: "Vizualizare servicii" } },
          { icon: "image", ru: { title: "Галерея", description: "Работы доктора" }, ro: { title: "Galerie", description: "Lucrarile doctorului" } },
          { icon: "file-text", ru: { title: "Форма", description: "Заполнение заявки" }, ro: { title: "Formular", description: "Completare cerere" } },
          { icon: "send", ru: { title: "Отправка", description: "В Telegram" }, ro: { title: "Trimitere", description: "In Telegram" } },
        ],
      },
    ],
    technicalHighlights: [
      {
        icon: "zap",
        ru: { title: "Pure HTML/CSS/JS", description: "Максимальная производительность без фреймворков", tags: ["HTML5", "CSS3", "Vanilla JS"] },
        ro: { title: "Pure HTML/CSS/JS", description: "Performanta maxima fara framework-uri", tags: ["HTML5", "CSS3", "Vanilla JS"] },
      },
      {
        icon: "search",
        ru: { title: "SEO Optimization", description: "Семантическая разметка, мета-теги, schema.org", tags: ["SEO", "Schema.org", "Meta"] },
        ro: { title: "SEO Optimization", description: "Marcare semantica, meta-tag-uri, schema.org", tags: ["SEO", "Schema.org", "Meta"] },
      },
    ],
  },

  // FITNESS TRACKER
  {
    slug: "fitness-tracker",
    ru: {
      challenge: "Нужно было создать фитнес-приложение с AI-тренером, которое адаптирует программы под пользователя. Интеграция с носимыми устройствами и персонализация на основе данных.",
      solution: "Разработал React Native приложение с OpenAI для генерации персональных программ. Интеграция с HealthKit/Google Fit для данных с носимых устройств. TensorFlow для анализа формы упражнений через камеру.",
      results: [
        "AI генерирует персональные программы тренировок",
        "Интеграция с Apple Watch и Fitbit",
        "Отслеживание калорий, шагов, пульса",
        "Видео-гайды по упражнениям",
        "Анализ формы упражнений через камеру",
        "Социальные челленджи с друзьями",
      ],
    },
    ro: {
      challenge: "Era necesar sa se creeze o aplicatie fitness cu antrenor AI care adapteaza programele pentru utilizator. Integrare cu dispozitive purtabile si personalizare bazata pe date.",
      solution: "Am dezvoltat o aplicatie React Native cu OpenAI pentru generarea programelor personale. Integrare cu HealthKit/Google Fit pentru date de la dispozitive purtabile. TensorFlow pentru analiza formei exercitiilor prin camera.",
      results: [
        "AI genereaza programe de antrenament personale",
        "Integrare cu Apple Watch si Fitbit",
        "Urmarire calorii, pasi, puls",
        "Video-ghiduri pentru exercitii",
        "Analiza forma exercitii prin camera",
        "Provocari sociale cu prietenii",
      ],
    },
    userFlows: [
      {
        icon: "dumbbell",
        ru: { title: "Тренировка", description: "Процесс занятия" },
        ro: { title: "Antrenament", description: "Proces exercitiu" },
        steps: [
          { icon: "target", ru: { title: "Цель", description: "Выбор программы" }, ro: { title: "Obiectiv", description: "Alegere program" } },
          { icon: "play", ru: { title: "Старт", description: "Начало тренировки" }, ro: { title: "Start", description: "Incepere antrenament" } },
          { icon: "camera", ru: { title: "Анализ", description: "Проверка формы" }, ro: { title: "Analiza", description: "Verificare forma" } },
          { icon: "award", ru: { title: "Результат", description: "Статистика" }, ro: { title: "Rezultat", description: "Statistici" } },
        ],
      },
    ],
    technicalHighlights: [
      {
        icon: "brain",
        ru: { title: "OpenAI Coach", description: "AI генерирует и адаптирует программы тренировок", tags: ["OpenAI", "AI", "Personalization"] },
        ro: { title: "OpenAI Coach", description: "AI genereaza si adapteaza programe de antrenament", tags: ["OpenAI", "AI", "Personalization"] },
      },
      {
        icon: "watch",
        ru: { title: "HealthKit Integration", description: "Синхронизация с Apple Watch, Fitbit, Google Fit", tags: ["HealthKit", "Wearables", "Sync"] },
        ro: { title: "HealthKit Integration", description: "Sincronizare cu Apple Watch, Fitbit, Google Fit", tags: ["HealthKit", "Wearables", "Sync"] },
      },
      {
        icon: "video",
        ru: { title: "TensorFlow Pose", description: "Анализ формы упражнений через камеру в реальном времени", tags: ["TensorFlow", "Pose", "ML"] },
        ro: { title: "TensorFlow Pose", description: "Analiza forma exercitii prin camera in timp real", tags: ["TensorFlow", "Pose", "ML"] },
      },
    ],
  },

  // E-LEARNING PLATFORM
  {
    slug: "e-learning-platform",
    ru: {
      challenge: "Образовательной компании нужна была платформа для онлайн-курсов с видео, интерактивными заданиями и сертификатами. Важны были система оплаты и прогресс студентов.",
      solution: "Создал платформу на Next.js с Prisma ORM. Mux для стриминга видео с защитой контента. Stripe для подписок и единоразовых покупок. Monaco Editor для интерактивных заданий по программированию.",
      results: [
        "Видеоплеер с защитой от скачивания",
        "Интерактивные задания с автопроверкой",
        "Система подписок и покупки отдельных курсов",
        "Сертификаты по завершении курса",
        "Прогресс-трекинг для студентов",
        "Админ-панель для создания курсов",
      ],
    },
    ro: {
      challenge: "O companie educationala avea nevoie de o platforma pentru cursuri online cu video, sarcini interactive si certificate. Erau importante sistemul de plata si progresul studentilor.",
      solution: "Am creat o platforma pe Next.js cu Prisma ORM. Mux pentru streaming video cu protectia continutului. Stripe pentru abonamente si achizitii unice. Monaco Editor pentru sarcini interactive de programare.",
      results: [
        "Video player cu protectie impotriva descarcarii",
        "Sarcini interactive cu autoverificare",
        "Sistem abonamente si achizitii cursuri individuale",
        "Certificate la finalizarea cursului",
        "Urmarire progres pentru studenti",
        "Panou admin pentru creare cursuri",
      ],
    },
    userFlows: [
      {
        icon: "book-open",
        ru: { title: "Прохождение курса", description: "Обучение студента" },
        ro: { title: "Parcurgere curs", description: "Instruire student" },
        steps: [
          { icon: "shopping-cart", ru: { title: "Покупка", description: "Оплата курса" }, ro: { title: "Achizitie", description: "Plata curs" } },
          { icon: "play", ru: { title: "Видео", description: "Просмотр уроков" }, ro: { title: "Video", description: "Vizualizare lectii" } },
          { icon: "code", ru: { title: "Практика", description: "Выполнение заданий" }, ro: { title: "Practica", description: "Executare sarcini" } },
          { icon: "award", ru: { title: "Сертификат", description: "Получение диплома" }, ro: { title: "Certificat", description: "Primire diploma" } },
        ],
      },
    ],
    technicalHighlights: [
      {
        icon: "video",
        ru: { title: "Mux Video", description: "Адаптивный стриминг с DRM защитой контента", tags: ["Mux", "Video", "DRM"] },
        ro: { title: "Mux Video", description: "Streaming adaptiv cu protectie DRM continut", tags: ["Mux", "Video", "DRM"] },
      },
      {
        icon: "code",
        ru: { title: "Monaco Editor", description: "Встроенный редактор кода как в VS Code", tags: ["Monaco", "Code Editor", "Interactive"] },
        ro: { title: "Monaco Editor", description: "Editor de cod incorporat ca in VS Code", tags: ["Monaco", "Code Editor", "Interactive"] },
      },
      {
        icon: "credit-card",
        ru: { title: "Stripe Payments", description: "Подписки, разовые покупки, вебхуки для доступа", tags: ["Stripe", "Payments", "Subscriptions"] },
        ro: { title: "Stripe Payments", description: "Abonamente, achizitii unice, webhook-uri pentru acces", tags: ["Stripe", "Payments", "Subscriptions"] },
      },
    ],
  },

  // RESTAURANT POS
  {
    slug: "restaurant-pos",
    ru: {
      challenge: "Сети ресторанов нужна была единая POS-система: приём заказов, кухня, склад и аналитика. Работа офлайн при отсутствии интернета — критически важно.",
      solution: "Разработал Electron приложение на React с локальной PostgreSQL базой. Socket.IO для синхронизации между терминалами. Офлайн-режим с автоматической синхронизацией при восстановлении связи.",
      results: [
        "Работа офлайн с локальной базой данных",
        "Синхронизация между залом и кухней в реальном времени",
        "Управление складом и автозаказ продуктов",
        "Аналитика продаж по категориям и времени",
        "Интеграция с принтерами чеков",
        "Мультитерминальность — несколько касс",
      ],
    },
    ro: {
      challenge: "O retea de restaurante avea nevoie de un sistem POS unificat: primire comenzi, bucatarie, depozit si analiza. Functionarea offline in absenta internetului — critic important.",
      solution: "Am dezvoltat o aplicatie Electron pe React cu baza PostgreSQL locala. Socket.IO pentru sincronizare intre terminale. Mod offline cu sincronizare automata la restabilirea conexiunii.",
      results: [
        "Functionare offline cu baza de date locala",
        "Sincronizare intre sala si bucatarie in timp real",
        "Gestionare depozit si comanda automata produse",
        "Analiza vanzari pe categorii si timp",
        "Integrare cu imprimante bonuri",
        "Multi-terminal — mai multe case",
      ],
    },
    userFlows: [
      {
        icon: "utensils",
        ru: { title: "Приём заказа", description: "От клиента до кухни" },
        ro: { title: "Primire comanda", description: "De la client la bucatarie" },
        steps: [
          { icon: "list", ru: { title: "Меню", description: "Выбор блюд" }, ro: { title: "Meniu", description: "Alegere feluri" } },
          { icon: "edit", ru: { title: "Модификаторы", description: "Особые пожелания" }, ro: { title: "Modificatori", description: "Dorinte speciale" } },
          { icon: "send", ru: { title: "Отправка", description: "На кухню" }, ro: { title: "Trimitere", description: "La bucatarie" } },
          { icon: "check", ru: { title: "Готово", description: "Выдача клиенту" }, ro: { title: "Gata", description: "Livrare client" } },
        ],
      },
    ],
    technicalHighlights: [
      {
        icon: "monitor",
        ru: { title: "Electron Desktop", description: "Нативное приложение с доступом к принтерам и локальной БД", tags: ["Electron", "Desktop", "Native"] },
        ro: { title: "Electron Desktop", description: "Aplicatie nativa cu acces la imprimante si BD locala", tags: ["Electron", "Desktop", "Native"] },
      },
      {
        icon: "wifi-off",
        ru: { title: "Offline First", description: "Полная работоспособность без интернета, синхронизация позже", tags: ["Offline", "Sync", "Resilience"] },
        ro: { title: "Offline First", description: "Functionalitate completa fara internet, sincronizare ulterioara", tags: ["Offline", "Sync", "Resilience"] },
      },
      {
        icon: "printer",
        ru: { title: "Thermal Printing", description: "Интеграция с ESC/POS принтерами для чеков и заказов", tags: ["Printing", "ESC/POS", "Hardware"] },
        ro: { title: "Thermal Printing", description: "Integrare cu imprimante ESC/POS pentru bonuri si comenzi", tags: ["Printing", "ESC/POS", "Hardware"] },
      },
    ],
  },

  // SOCIAL SCHEDULER
  {
    slug: "social-scheduler",
    ru: {
      challenge: "SMM-специалистам нужен был инструмент для планирования постов в соцсетях с AI-генерацией контента. Поддержка множества аккаунтов и аналитика эффективности.",
      solution: "Создал SaaS на Next.js с Bull очередями для отложенных публикаций. OpenAI для генерации и улучшения текстов постов. Redis для кеширования и управления очередями.",
      results: [
        "AI генерация и улучшение текстов постов",
        "Планирование на неделю/месяц вперёд",
        "Поддержка Instagram, Facebook, Twitter, LinkedIn",
        "Аналитика охватов и вовлечённости",
        "Командная работа с разделением ролей",
        "Библиотека шаблонов и хештегов",
      ],
    },
    ro: {
      challenge: "Specialistii SMM aveau nevoie de un instrument pentru planificarea postarilor pe retele sociale cu generare continut AI. Suport pentru mai multe conturi si analiza eficientei.",
      solution: "Am creat un SaaS pe Next.js cu cozi Bull pentru publicari amanate. OpenAI pentru generare si imbunatatire texte postari. Redis pentru cache si gestionare cozi.",
      results: [
        "Generare si imbunatatire texte postari cu AI",
        "Planificare pe saptamana/luna inainte",
        "Suport Instagram, Facebook, Twitter, LinkedIn",
        "Analiza acoperire si engagement",
        "Lucru in echipa cu separare roluri",
        "Biblioteca sabloane si hashtag-uri",
      ],
    },
    userFlows: [
      {
        icon: "calendar",
        ru: { title: "Планирование поста", description: "Создание и расписание" },
        ro: { title: "Planificare postare", description: "Creare si programare" },
        steps: [
          { icon: "edit", ru: { title: "Контент", description: "Текст и медиа" }, ro: { title: "Continut", description: "Text si media" } },
          { icon: "wand", ru: { title: "AI", description: "Улучшение текста" }, ro: { title: "AI", description: "Imbunatatire text" } },
          { icon: "clock", ru: { title: "Время", description: "Выбор даты" }, ro: { title: "Timp", description: "Alegere data" } },
          { icon: "send", ru: { title: "Публикация", description: "Автопостинг" }, ro: { title: "Publicare", description: "Autoposting" } },
        ],
      },
    ],
    technicalHighlights: [
      {
        icon: "brain",
        ru: { title: "OpenAI Content", description: "AI генерирует, улучшает и адаптирует тексты под платформу", tags: ["OpenAI", "AI", "Content"] },
        ro: { title: "OpenAI Content", description: "AI genereaza, imbunatateste si adapteaza texte pentru platforma", tags: ["OpenAI", "AI", "Content"] },
      },
      {
        icon: "clock",
        ru: { title: "Bull Queues", description: "Надёжные отложенные публикации с retry и мониторингом", tags: ["Bull", "Queues", "Redis"] },
        ro: { title: "Bull Queues", description: "Publicari amanate fiabile cu retry si monitorizare", tags: ["Bull", "Queues", "Redis"] },
      },
      {
        icon: "bar-chart",
        ru: { title: "Analytics Dashboard", description: "Отслеживание метрик постов и сравнение эффективности", tags: ["Analytics", "Metrics", "Dashboard"] },
        ro: { title: "Analytics Dashboard", description: "Urmarire metrici postari si comparare eficienta", tags: ["Analytics", "Metrics", "Dashboard"] },
      },
    ],
  },
];

async function createCaseStudies() {
  console.log("\n=== Creating case studies for projects ===\n");

  for (const csData of newCaseStudies) {
    console.log(`\nProcessing: ${csData.slug}`);

    // Find project
    const project = await prisma.project.findUnique({
      where: { slug: csData.slug },
      include: { caseStudy: true },
    });

    if (!project) {
      console.log(`  Project not found: ${csData.slug}`);
      continue;
    }

    if (project.caseStudy) {
      console.log(`  Case study already exists for ${csData.slug}`);
      continue;
    }

    // Create case study with translations
    const caseStudy = await prisma.caseStudy.create({
      data: {
        projectId: project.id,
        translations: {
          create: [
            { locale: "ru", challenge: csData.ru.challenge, solution: csData.ru.solution, results: csData.ru.results },
            { locale: "ro", challenge: csData.ro.challenge, solution: csData.ro.solution, results: csData.ro.results },
          ],
        },
      },
    });
    console.log(`  Created case study: ${caseStudy.id}`);

    // Create user flows
    for (let i = 0; i < csData.userFlows.length; i++) {
      const flowData = csData.userFlows[i];
      const flow = await prisma.userFlow.create({
        data: {
          caseStudyId: caseStudy.id,
          icon: flowData.icon,
          order: i,
          translations: {
            create: [
              { locale: "ru", title: flowData.ru.title, description: flowData.ru.description },
              { locale: "ro", title: flowData.ro.title, description: flowData.ro.description },
            ],
          },
        },
      });

      // Create steps
      for (let j = 0; j < flowData.steps.length; j++) {
        const stepData = flowData.steps[j];
        await prisma.userFlowStep.create({
          data: {
            flowId: flow.id,
            icon: stepData.icon,
            order: j,
            translations: {
              create: [
                { locale: "ru", title: stepData.ru.title, description: stepData.ru.description },
                { locale: "ro", title: stepData.ro.title, description: stepData.ro.description },
              ],
            },
          },
        });
      }
    }
    console.log(`  Created ${csData.userFlows.length} user flows`);

    // Create technical highlights
    for (let i = 0; i < csData.technicalHighlights.length; i++) {
      const hlData = csData.technicalHighlights[i];
      await prisma.technicalHighlight.create({
        data: {
          caseStudyId: caseStudy.id,
          icon: hlData.icon,
          order: i,
          translations: {
            create: [
              { locale: "ru", title: hlData.ru.title, description: hlData.ru.description, tags: hlData.ru.tags },
              { locale: "ro", title: hlData.ro.title, description: hlData.ro.description, tags: hlData.ro.tags },
            ],
          },
        },
      });
    }
    console.log(`  Created ${csData.technicalHighlights.length} technical highlights`);
  }
}

// ==================== MAIN ====================

async function main() {
  console.log("=".repeat(60));
  console.log("Fixing Case Studies");
  console.log("=".repeat(60));

  try {
    await fixVibeTaxi();
    await createCaseStudies();

    console.log("\n" + "=".repeat(60));
    console.log("All case studies fixed/created successfully!");
    console.log("=".repeat(60));
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
