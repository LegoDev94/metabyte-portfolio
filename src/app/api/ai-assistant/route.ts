import { NextRequest, NextResponse } from "next/server";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

// Функция отправки уведомления в Telegram
async function sendTelegramNotification(text: string) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.log("Telegram not configured, skipping notification");
    return;
  }

  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text,
        parse_mode: "HTML",
      }),
    });
  } catch (error) {
    console.error("Failed to send Telegram notification:", error);
  }
}

interface UserAction {
  type: string;
  page: string;
  element?: string;
  timestamp: number;
  scrollPosition?: number;
  timeOnPage?: number;
}

interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

// API функции которые AI может вызывать для эффектов на сайте
const availableFunctions = {
  navigateTo: {
    name: "navigateTo",
    description: "Перейти на другую страницу сайта. ИСПОЛЬЗУЙ АКТИВНО когда клиент хочет посмотреть проект!",
    parameters: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "Путь страницы: /, /projects, /about, /contact, /projects/kmo24 (интернет-магазин), /projects/giftpool, /projects/wasteland-arena, /projects/monopoly-lux, /projects/mubarakway, /projects/betanalitics, /projects/vibe-taxi, /projects/404-dispatch, /projects/exchanger-pmr, /projects/fns-tg-scan, /projects/neoproxy, /projects/fancy-app, /projects/akbarov, /projects/fitness-tracker, /projects/e-learning-platform, /projects/restaurant-pos, /projects/social-scheduler",
        },
      },
      required: ["path"],
    },
  },
  scrollToSection: {
    name: "scrollToSection",
    description: "Прокрутить к секции на текущей странице",
    parameters: {
      type: "object",
      properties: {
        sectionId: {
          type: "string",
          description: "ID секции: hero, projects, tech-stack, contact-form, features, case-study",
        },
      },
      required: ["sectionId"],
    },
  },
  highlightElement: {
    name: "highlightElement",
    description: "Подсветить элемент на странице для привлечения внимания",
    parameters: {
      type: "object",
      properties: {
        selector: { type: "string", description: "CSS селектор элемента" },
        color: { type: "string", description: "Цвет подсветки (hex или название)", default: "#00ffff" },
        duration: { type: "number", description: "Длительность в мс", default: 2000 },
      },
      required: ["selector"],
    },
  },
  showConfetti: {
    name: "showConfetti",
    description: "Показать конфетти для празднования или привлечения внимания",
    parameters: {
      type: "object",
      properties: {
        duration: { type: "number", description: "Длительность в мс" },
      },
    },
  },
  showNotification: {
    name: "showNotification",
    description: "Показать всплывающее уведомление пользователю",
    parameters: {
      type: "object",
      properties: {
        title: { type: "string", description: "Заголовок уведомления" },
        message: { type: "string", description: "Текст уведомления" },
        type: { type: "string", enum: ["info", "success", "warning"], description: "Тип уведомления" },
      },
      required: ["message"],
    },
  },
  openExternalLink: {
    name: "openExternalLink",
    description: "Открыть внешнюю ссылку в новой вкладке",
    parameters: {
      type: "object",
      properties: {
        url: { type: "string", description: "URL для открытия" },
      },
      required: ["url"],
    },
  },
  collectContactInfo: {
    name: "collectContactInfo",
    description: "Собрать контактные данные клиента когда он хочет связаться с разработчиком. ВЫЗЫВАЙ когда клиент предоставляет имя, телефон или telegram.",
    parameters: {
      type: "object",
      properties: {
        name: { type: "string", description: "Имя клиента" },
        contact: { type: "string", description: "Telegram (@username) или номер телефона" },
        message: { type: "string", description: "Сообщение или описание проекта (опционально)" },
      },
      required: ["name", "contact"],
    },
  },
  askForContact: {
    name: "askForContact",
    description: "Показать форму для ввода контактов клиента. ВЫЗЫВАЙ когда клиент говорит что хочет связаться, заказать проект, обсудить работу.",
    parameters: {
      type: "object",
      properties: {
        reason: { type: "string", description: "Причина запроса контактов" },
      },
    },
  },

  // ============================================
  // VISUAL EFFECTS FUNCTIONS (для шуток и вау-эффектов)
  // ============================================

  showMatrix: {
    name: "showMatrix",
    description: "Показать эффект 'Матрицы' — падающие зелёные символы. Используй для шуток про хакеров, программирование, или просто чтобы удивить!",
    parameters: {
      type: "object",
      properties: {
        duration: { type: "number", description: "Длительность в мс (по умолчанию 5000)" },
      },
    },
  },
  showGlitch: {
    name: "showGlitch",
    description: "Показать глитч-эффект — помехи на экране как в киберпанке. Используй для драматичности или шуток про баги!",
    parameters: {
      type: "object",
      properties: {
        duration: { type: "number", description: "Длительность в мс (по умолчанию 2000)" },
      },
    },
  },
  showHackTerminal: {
    name: "showHackTerminal",
    description: "Показать фейковый терминал 'взлома' — для шуток про хакеров. В конце появится 'Шучу!'",
    parameters: {
      type: "object",
      properties: {
        duration: { type: "number", description: "Длительность в мс (по умолчанию 4000)" },
      },
    },
  },
  showEmojiRain: {
    name: "showEmojiRain",
    description: "Показать дождь из эмодзи! Используй для празднования или просто для веселья.",
    parameters: {
      type: "object",
      properties: {
        emojis: {
          type: "array",
          items: { type: "string" },
          description: "Массив эмодзи для дождя, например ['🚀', '💻', '⚡']",
        },
        duration: { type: "number", description: "Длительность в мс (по умолчанию 3000)" },
      },
    },
  },
  addReaction: {
    name: "addReaction",
    description: "Добавить всплывающую реакцию-эмодзи на экран",
    parameters: {
      type: "object",
      properties: {
        emoji: { type: "string", description: "Эмодзи для реакции" },
        x: { type: "number", description: "X координата (опционально)" },
        y: { type: "number", description: "Y координата (опционально)" },
      },
      required: ["emoji"],
    },
  },
  showSpotlight: {
    name: "showSpotlight",
    description: "Подсветить элемент прожектором с подсказкой. Используй чтобы обратить внимание на важный элемент!",
    parameters: {
      type: "object",
      properties: {
        selector: { type: "string", description: "CSS селектор элемента для подсветки" },
        message: { type: "string", description: "Сообщение-подсказка рядом с элементом" },
      },
      required: ["selector", "message"],
    },
  },
  showAIBubble: {
    name: "showAIBubble",
    description: "Показать всплывающее сообщение от AI в произвольном месте экрана",
    parameters: {
      type: "object",
      properties: {
        message: { type: "string", description: "Текст сообщения" },
        x: { type: "number", description: "X координата (опционально)" },
        y: { type: "number", description: "Y координата (опционально)" },
        type: { type: "string", enum: ["tip", "comment", "celebration"], description: "Тип сообщения" },
      },
      required: ["message"],
    },
  },
  startGame: {
    name: "startGame",
    description: "Запустить игру в крестики-нолики с клиентом. ВЫЗЫВАЙ когда клиент говорит 'давай играть', 'сыграем', 'хочу сыграть', 'играем' и т.д. Если клиент выиграет — получит скидку 10%!",
    parameters: {
      type: "object",
      properties: {},
    },
  },
};

// System prompt generator based on locale
function getSystemPrompt(locale: string = "ru"): string {
  const isRo = locale === "ro";

  return `${isRo ? "Esti asistentul AI al studioului METABYTE. Ajuti vizitatorii sa afle despre proiecte si servicii." : "Ты — ИИ-ассистент студии METABYTE. Помогаешь посетителям узнать о проектах и услугах."}

═══════════════════════════════════════════════════════
📋 ПОЛНАЯ ИНФОРМАЦИЯ О СТУДИИ И УСЛУГАХ
═══════════════════════════════════════════════════════

👤 О СТУДИИ METABYTE:
- Название: METABYTE — Full-Stack Development Studio
- Специализация: Разработка веб-приложений, SaaS платформ, мобильных приложений, игр
- Направления: FinTech, E-commerce, Enterprise CRM, Telegram Mini Apps, Game Dev
- Telegram: @metabytemd
- GitHub: https://github.com/LegoDev94

═══════════════════════════════════════════════════════
🗺️ СТРУКТУРА САЙТА (можешь перенаправлять клиента):
═══════════════════════════════════════════════════════

1. ГЛАВНАЯ (/)
   - Hero секция с приветствием
   - Избранные проекты
   - Стек технологий
   - Призыв к действию (контакт)
   Секции: #hero, #projects, #tech-stack, #contact-cta

2. ПРОЕКТЫ (/projects)
   - Каталог всех проектов с фильтрацией
   - Категории: Игры, FinTech, Мобильные, Enterprise, E-commerce, Автоматизация

3. О СЕБЕ (/about)
   - Информация о разработчике
   - Навыки и опыт
   - История

4. КОНТАКТЫ (/contact)
   - Форма обратной связи (отправляет в Telegram)
   - Прямая ссылка на Telegram
   Секции: #contact-form

═══════════════════════════════════════════════════════
🎮 ВСЕ ПРОЕКТЫ (17 штук):
═══════════════════════════════════════════════════════

### FEATURED (избранные):

1. 🛒 KMO24 (/projects/kmo24) — ⭐ FEATURED, ИНТЕРНЕТ-МАГАЗИН
   Категория: E-commerce / HoReCa
   Описание: Интернет-магазин б/у оборудования для кафе и ресторанов
   Фишки:
   - Интеграция с 1С для синхронизации товаров
   - Расчет доставки через API Деловых Линий и ПЭК
   - Автогенерация PDF коммерческих предложений
   - Полноценная админ-панель с ACL
   - Redis кэширование
   Стек: Nuxt.js 3, Vue 3, Express.js, MongoDB, Redis
   Demo: https://kmo24-frontend.onrender.com

2. 💰 GIFTPOOL (/projects/giftpool) — ⭐ FEATURED
   Категория: FinTech / SaaS
   Описание: Платформа для сбора денег на подарки
   Фишки:
   - Платежи из 135+ стран (Stripe)
   - AI-модерация контента (OpenAI)
   - Автогенерация налоговых форм (Form 709, 1099-K, Gift Letters)
   - Авторизация через Google, Discord, WhatsApp
   - AI-помощник для создания сборов
   Стек: React 19, Node.js, MongoDB, Stripe, OpenAI
   Demo: https://giftpool.io

3. 🎮 WASTELAND ARENA (/projects/wasteland-arena) — ⭐ FEATURED
   Категория: Game Dev
   Описание: Браузерная 3D PvP арена
   Фишки:
   - 3D графика на Babylon.js
   - Мультиплеер на Colyseus (до 20 игроков)
   - 8 уникальных героев
   Стек: Babylon.js, Colyseus, React, TypeScript

4. 🎲 MONOPOLY LUX (/projects/monopoly-lux) — ⭐ FEATURED
   Категория: Game Dev
   Описание: Онлайн мультиплеер Монополия
   Фишки:
   - WebSocket для реального времени
   - 3 варианта игры, 4 режима
   Стек: React, Zustand, WebSocket

5. 📱 MUBARAKWAY (/projects/mubarakway) — ⭐ FEATURED
   Категория: EdTech / Mobile
   Описание: Исламская образовательная платформа (Telegram Mini App)
   Фишки:
   - Чтение Корана с аудио
   - AI-ассистент для вопросов
   - Трекер намаза
   Стек: React, Telegram Mini App, OpenAI

6. 📊 BETANALITICS (/projects/betanalitics) — ⭐ FEATURED
   Категория: Sports Tech
   Описание: AI платформа для анализа спортивных событий
   Фишки:
   - Прогнозы через OpenAI GPT
   - 4 вида спорта
   - Система подписок
   Стек: Vue.js 3, Node.js, MongoDB, OpenAI

### ДРУГИЕ ПРОЕКТЫ:

7. 🚕 VIBE TAXI (/projects/vibe-taxi)
   Категория: Transport
   Описание: Full-stack такси приложение (monorepo)
   Стек: Next.js, Fastify, Prisma, PostgreSQL, Turborepo

8. 📦 404 DISPATCH (/projects/404-dispatch)
   Категория: CRM / Enterprise
   Описание: CRM система для логистики
   Стек: Next.js, MongoDB, OpenAI

9. 💱 EXCHANGER PMR (/projects/exchanger-pmr)
   Категория: FinTech
   Описание: P2P обменник валют (Telegram Mini App)
   Стек: Vue 3, Socket.io, PostgreSQL

10. 📄 FNS TG SCAN (/projects/fns-tg-scan)
    Категория: Automation
    Описание: Сканер чеков с QR и OCR
    Стек: Vue 3, Tesseract.js, Telegram Bot API

11. 🔧 NEOPROXY (/projects/neoproxy)
    Категория: SaaS
    Описание: Панель управления прокси-сервисом
    Стек: Vue.js 3, Pinia, Chart.js

12. 💕 FANCY DATING (/projects/fancy-app)
    Категория: Social / Dating
    Описание: Премиум приложение знакомств
    Стек: Flutter, Dart, Supabase, Firebase

13. 🏥 DR. AKBAROV (/projects/akbarov)
    Категория: Healthcare / Landing
    Описание: Лендинг для доктора спортивной медицины
    Demo: https://mainlego.github.io/akbarov/
    Стек: HTML5, CSS3, JavaScript

14. 💪 FITPULSE (/projects/fitness-tracker)
    Категория: Health & Fitness
    Описание: Фитнес-трекер с AI-тренером
    Стек: React Native, OpenAI, HealthKit, Firebase

15. 📚 LEARNHUB (/projects/e-learning-platform)
    Категория: EdTech
    Описание: Образовательная LMS платформа
    Стек: Next.js 15, Prisma, Stripe, Mux

16. 🍽️ QUICKSERVE POS (/projects/restaurant-pos)
    Категория: HoReCa
    Описание: POS-система для ресторанов
    Стек: React, Node.js, PostgreSQL, Electron

17. 📱 POSTFLOW (/projects/social-scheduler)
    Категория: Marketing
    Описание: Планировщик постов для соцсетей с AI
    Стек: Next.js 15, OpenAI, Redis, Bull

═══════════════════════════════════════════════════════
🛠️ ДОСТУПНЫЕ ФУНКЦИИ (ВЫЗЫВАЙ ИХ!):
═══════════════════════════════════════════════════════

⚠️ У тебя есть РЕАЛЬНЫЕ функции которые ты ДОЛЖЕН вызывать через tool_calls!
Когда клиент хочет увидеть проект — НЕ ПИШИ про функцию, а ВЫЗОВИ её!

📍 НАВИГАЦИЯ:
1. navigateTo — ПЕРЕЙТИ НА СТРАНИЦУ (используй активно!)
   - navigateTo("/projects/kmo24") — интернет-магазин
   - navigateTo("/projects/giftpool") — платёжная платформа
   - navigateTo("/projects") — все проекты
   - navigateTo("/contact") — контакты

2. scrollToSection — прокрутить к секции
   scrollToSection("projects"), scrollToSection("contact-form")

3. highlightElement — подсветить элемент
4. showConfetti — показать конфетти
5. openExternalLink — открыть внешнюю ссылку

🎬 ВИЗУАЛЬНЫЕ ЭФФЕКТЫ (для вау-эффекта и шуток!):
6. showMatrix — эффект "Матрицы" с падающими символами
   Используй для шуток про хакеров/программистов!

7. showGlitch — глитч-эффект, помехи на экране
   Используй для киберпанк-драматичности!

8. showHackTerminal — фейковый терминал "взлома"
   ОТЛИЧНАЯ шутка! Показывает "взлом" и потом "Шучу!" 😄

9. showEmojiRain — дождь из эмодзи
   showEmojiRain(["🚀", "💻", "⚡"]) — для празднования!

10. addReaction — всплывающая реакция-эмодзи
    addReaction("🔥") — для выражения эмоций

11. showSpotlight — подсветить элемент прожектором
    showSpotlight(".project-card", "Обрати внимание!")

12. showAIBubble — показать всплывающую подсказку AI

💡 СОВЕТЫ ПО ИСПОЛЬЗОВАНИЮ ЭФФЕКТОВ:
- Используй showMatrix когда клиент говорит про код/хакеров/программирование
- showHackTerminal отлично работает как шутка после фразы "я хакер" или подобных
- showEmojiRain хорош когда клиент радуется или нашёл крутой проект
- showGlitch можно использовать когда клиент говорит про баги/ошибки
- Не переусердствуй с эффектами — используй их уместно!

═══════════════════════════════════════════════════════
💡 ${isRo ? "REGULI DE COMPORTAMENT" : "ПРАВИЛА ПОВЕДЕНИЯ"}:
═══════════════════════════════════════════════════════

1. ${isRo ? "IMPORTANT: Comunica DOAR in limba ROMANA!" : "IMPORTANT: Общайся ТОЛЬКО на РУССКОМ языке!"}
2. ${isRo ? "Fii prietenos si profesionist" : "Будь дружелюбным и профессиональным"}
3. ${isRo ? "Poti folosi emoji moderat" : "Можешь использовать эмодзи умеренно"}
4. ${isRo ? "Scopul tau — sa ajuti clientul si sa-l indemni sa contacteze" : "Твоя цель — помочь клиенту и подтолкнуть к контакту"}
5. ${isRo ? "Daca intreaba despre magazin online — arata KMO24" : "Если спрашивают про интернет-магазин — покажи KMO24"}
6. ${isRo ? "Propune activ sa arati proiecte" : "Активно предлагай показать проекты"}
7. ${isRo ? "Fii SCURT — maximum 1-3 propozitii" : "Будь КРАТКИМ — 1-3 предложения максимум"}
8. ${isRo ? "Daca stii orasul clientului — mentioneaza-l" : "Если знаешь город клиента — упомяни его"}

═══════════════════════════════════════════════════════
🎮 ИГРА В КРЕСТИКИ-НОЛИКИ:
═══════════════════════════════════════════════════════

У тебя есть секретное оружие — игра в крестики-нолики!

КОГДА ПРЕДЛАГАТЬ ИГРУ:
1. ПОСЛЕ того как клиент оставил контакты — предложи сыграть за скидку 10%
2. Когда клиент скучает или долго ничего не делает
3. Когда клиент говорит "давай играть", "сыграем", "хочу сыграть"

КАК ЭТО РАБОТАЕТ:
- Вызови startGame() чтобы запустить игру
- Если клиент ВЫИГРАЕТ — он получит скидку 10% (кодовое слово "КРЕСТИКИ")
- Играть можно только ОДИН РАЗ!

Примеры:
- После сбора контактов: "Кстати, хочешь сыграть в крестики-нолики? Если выиграешь — скидка 10%! 🎮"
- Клиент: "Давай играть" → startGame()
- Клиент: "Хочу скидку" → "Сыграй в крестики-нолики и выиграй её!"

═══════════════════════════════════════════════════════
📞 СБОР КОНТАКТОВ КЛИЕНТА:
═══════════════════════════════════════════════════════

⚠️ ВАЖНО: Если в контексте написано "КОНТАКТЫ УЖЕ СОБРАНЫ" — НЕ СПРАШИВАЙ контакты!
Вместо этого скажи: "Ваши контакты уже переданы разработчику, он скоро свяжется!
Если хотите ускорить — напишите напрямую в Telegram: @metabytemd"

Когда клиент хочет связаться/заказать/обсудить И контакты ЕЩЁ НЕ собраны:
1. СНАЧАЛА спроси имя и контакт (telegram или телефон)
2. Вызови askForContact чтобы показать форму
3. Когда клиент даёт данные — вызови collectContactInfo

Примеры:
- Клиент: "Хочу заказать сайт" (контакты НЕ собраны) → "Отлично! Как вас зовут и как с вами связаться?" + askForContact
- Клиент: "Хочу заказать сайт" (контакты УЖЕ собраны) → "Ваши контакты уже у разработчика! Напишите напрямую: @metabytemd"
- Клиент: "Меня зовут Иван, telegram @ivan" → collectContactInfo(name: "Иван", contact: "@ivan")
`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      actions,
      conversationHistory,
      currentPage,
      userCity,
      userName,
      isFirstVisit,
      isIntroduction,
      hasContactInfo,
      clientContact,
      hasPlayedGame,
      wonDiscount,
      locale,
    } = body as {
      actions: UserAction[];
      conversationHistory: Message[];
      currentPage: string;
      userCity?: string;
      userName?: string;
      locale?: string;
      isFirstVisit?: boolean;
      isIntroduction?: boolean;
      hasContactInfo?: boolean;
      clientContact?: string;
      hasPlayedGame?: boolean;
      wonDiscount?: boolean;
    };

    // Уведомление о новом посетителе
    if (isIntroduction && isFirstVisit) {
      await sendTelegramNotification(
        `<b>🆕 Новый посетитель на сайте!</b>\n\n` +
        `📍 Страница: ${currentPage}\n` +
        `🌆 Город: ${userCity || "Не определён"}\n` +
        `⏰ ${new Date().toLocaleString("ru-RU", { timeZone: "Europe/Moscow" })}`
      );
    }

    // Уведомление о новом сообщении от пользователя
    const lastUserMessage = conversationHistory.filter(m => m.role === "user").pop();
    if (lastUserMessage && conversationHistory.length <= 2) {
      // Первое сообщение от пользователя - начало диалога
      await sendTelegramNotification(
        `<b>💬 Началась переписка с AI!</b>\n\n` +
        `👤 Клиент: ${userName || "Аноним"}\n` +
        `🌆 Город: ${userCity || "Не определён"}\n` +
        `📍 Страница: ${currentPage}\n` +
        `💭 Сообщение: ${lastUserMessage.content.slice(0, 200)}${lastUserMessage.content.length > 200 ? "..." : ""}\n\n` +
        `⏰ ${new Date().toLocaleString("ru-RU", { timeZone: "Europe/Moscow" })}`
      );
    }

    // Формируем контекст
    let contextInfo = `\n\n═══ ТЕКУЩИЙ КОНТЕКСТ ═══\n`;
    contextInfo += `📍 Страница: ${currentPage}\n`;

    if (userName) {
      contextInfo += `👤 Имя клиента: ${userName} — ОБРАЩАЙСЯ К НЕМУ ПО ИМЕНИ!\n`;
    }

    if (hasContactInfo) {
      contextInfo += `✅ КОНТАКТЫ УЖЕ СОБРАНЫ! Контакт клиента: ${clientContact}\n`;
      contextInfo += `⚠️ НЕ СПРАШИВАЙ контакты повторно! Скажи что данные уже переданы разработчику.\n`;
      contextInfo += `💡 Можешь предложить написать напрямую в Telegram: @metabytemd\n`;

      // Информация об игре
      if (hasPlayedGame) {
        if (wonDiscount) {
          contextInfo += `🎮 Клиент УЖЕ ИГРАЛ и ВЫИГРАЛ скидку 10%! Кодовое слово "КРЕСТИКИ".\n`;
        } else {
          contextInfo += `🎮 Клиент УЖЕ ИГРАЛ, но не выиграл. Повторно играть нельзя.\n`;
        }
      } else {
        contextInfo += `🎮 Клиент ЕЩЁ НЕ ИГРАЛ! Предложи сыграть в крестики-нолики за скидку 10%!\n`;
      }
    }

    if (userCity) {
      contextInfo += `🌆 Город клиента: ${userCity}\n`;
    }

    if (isFirstVisit) {
      contextInfo += `🆕 Это ПЕРВЫЙ визит клиента на сайт!\n`;
    }

    if (isIntroduction) {
      contextInfo += `\n🎭 ЗАДАЧА: Это момент знакомства! Эффектно представься и расскажи кратко что ты умеешь (помогать с проектами, навигацией, отвечать на вопросы). Упомяни город если знаешь. Будь дружелюбным!\n`;
    }

    if (actions.length > 0) {
      contextInfo += `\n📊 ДЕЙСТВИЯ ПОЛЬЗОВАТЕЛЯ:\n`;
      actions.slice(-5).forEach((a) => {
        contextInfo += `- ${a.type} на "${a.page}"`;
        if (a.element) contextInfo += ` (${a.element})`;
        if (a.timeOnPage) contextInfo += ` [на странице ${Math.round(a.timeOnPage / 1000)} сек]`;
        contextInfo += `\n`;
      });
    }

    const messages: Message[] = [
      { role: "system", content: getSystemPrompt(locale) + contextInfo },
      ...conversationHistory,
    ];

    // Если это Introduction - AI представляется
    if (isIntroduction && conversationHistory.length === 0) {
      messages.push({
        role: "user",
        content: locale === "ro"
          ? "Prezinta-te ca asistent AI al studioului METABYTE. Povesteste pe scurt ce face studioul si ofera ajutor. Fara mentionarea numelor dezvoltatorilor. Fii prietenos si scurt."
          : "Представься как ИИ-ассистент студии METABYTE. Кратко расскажи чем занимается студия и предложи помощь. Без упоминания имён разработчиков. Будь дружелюбным и кратким.",
      });
    }

    // Если последнее сообщение не от пользователя и это не introduction - не отвечаем
    if (
      !isIntroduction &&
      conversationHistory.length > 0 &&
      conversationHistory[conversationHistory.length - 1]?.role !== "user"
    ) {
      return NextResponse.json({ message: "", functionCalls: [] });
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages,
        tools: Object.values(availableFunctions).map((fn) => ({
          type: "function",
          function: fn,
        })),
        tool_choice: "auto",
        max_tokens: 400,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("OpenAI API error:", error);
      return NextResponse.json({ error: "Failed to get AI response" }, { status: 500 });
    }

    const data = await response.json();
    const assistantMessage = data.choices[0].message;

    // Обработка вызовов функций
    let functionCalls: Array<{ name: string; arguments: Record<string, unknown> }> = [];
    if (assistantMessage.tool_calls) {
      functionCalls = assistantMessage.tool_calls.map(
        (call: { function: { name: string; arguments: string } }) => ({
          name: call.function.name,
          arguments: JSON.parse(call.function.arguments),
        })
      );

      // Фильтруем askForContact если контакты уже собраны
      if (hasContactInfo) {
        functionCalls = functionCalls.filter(call => call.name !== "askForContact" && call.name !== "collectContactInfo");
      }

      // Уведомления о важных действиях
      for (const call of functionCalls) {
        if (call.name === "collectContactInfo") {
          const args = call.arguments as { name: string; contact: string; message?: string };
          await sendTelegramNotification(
            `<b>🎯 AI собрал контакты!</b>\n\n` +
            `👤 Имя: ${args.name}\n` +
            `📱 Контакт: ${args.contact}\n` +
            `${args.message ? `💬 Сообщение: ${args.message}\n` : ""}` +
            `🌆 Город: ${userCity || "Не определён"}\n` +
            `📍 Страница: ${currentPage}\n\n` +
            `⏰ ${new Date().toLocaleString("ru-RU", { timeZone: "Europe/Moscow" })}`
          );
        }

        if (call.name === "askForContact") {
          await sendTelegramNotification(
            `<b>📋 AI запросил контакты у клиента</b>\n\n` +
            `👤 Клиент: ${userName || "Аноним"}\n` +
            `🌆 Город: ${userCity || "Не определён"}\n` +
            `📍 Страница: ${currentPage}\n\n` +
            `⏰ ${new Date().toLocaleString("ru-RU", { timeZone: "Europe/Moscow" })}`
          );
        }

        if (call.name === "startGame") {
          await sendTelegramNotification(
            `<b>🎮 Клиент начал игру в крестики-нолики!</b>\n\n` +
            `👤 Клиент: ${userName || "Аноним"}\n` +
            `🌆 Город: ${userCity || "Не определён"}\n` +
            `🎁 Ставка: скидка 10%\n\n` +
            `⏰ ${new Date().toLocaleString("ru-RU", { timeZone: "Europe/Moscow" })}`
          );
        }

        if (call.name === "navigateTo") {
          const args = call.arguments as { path: string };
          // Уведомляем только о переходах на страницы проектов
          if (args.path.startsWith("/projects/")) {
            await sendTelegramNotification(
              `<b>👀 Клиент смотрит проект</b>\n\n` +
              `👤 Клиент: ${userName || "Аноним"}\n` +
              `📂 Проект: ${args.path.replace("/projects/", "")}\n` +
              `🌆 Город: ${userCity || "Не определён"}\n\n` +
              `⏰ ${new Date().toLocaleString("ru-RU", { timeZone: "Europe/Moscow" })}`
            );
          }
        }
      }
    }

    return NextResponse.json({
      message: assistantMessage.content || "",
      functionCalls,
    });
  } catch (error) {
    console.error("AI Assistant error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
