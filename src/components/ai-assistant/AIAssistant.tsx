"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  Minimize2,
  Maximize2,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import confetti from "canvas-confetti";
import {
  useAIEffects,
  MatrixRain,
  GlitchOverlay,
  HackTerminal,
  EmojiRain,
  ExitIntentPopup,
  ProgressCelebration,
  SpotlightEffect,
  AIBubbleComponent,
  FloatingReactionComponent,
} from "./AIEffects";
import { TicTacToe } from "./TicTacToe";
import { useLocaleContext } from "@/components/providers/LocaleProvider";

// ============================================
// TYPES
// ============================================

interface UserAction {
  type: string;
  page: string;
  element?: string;
  timestamp: number;
  scrollPosition?: number;
  timeOnPage?: number;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface FunctionCall {
  name: string;
  arguments: Record<string, unknown>;
}

interface StoredData {
  messages: Message[];
  hasSeenIntro: boolean;
  userCity?: string;
  lastVisit: number;
  clientInfo?: ClientInfo;
  hasPlayedGame?: boolean;
  wonDiscount?: boolean;
}

interface ClientInfo {
  name?: string;
  contact?: string;
  message?: string;
  collectedAt?: number;
}

// ============================================
// CONSTANTS
// ============================================

const STORAGE_KEY = "metabyte_ai_assistant";
const VISITOR_ID_KEY = "metabyte_visitor_id";
const SESSION_TOKEN_KEY = "metabyte_session_token";
const INTRO_DELAY = 2000; // Задержка перед появлением (после загрузки страницы)

// Generate a random ID
const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// ============================================
// COMPONENT
// ============================================

export function AIAssistant() {
  const router = useRouter();
  const pathname = usePathname();
  const { locale } = useLocaleContext();

  // UI State
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showIntroModal, setShowIntroModal] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Data State
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [actions, setActions] = useState<UserAction[]>([]);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [userCity, setUserCity] = useState<string | undefined>();
  const [userName, setUserName] = useState<string | undefined>(); // Имя клиента
  const [hasSeenIntro, setHasSeenIntro] = useState(true);
  const [showContactForm, setShowContactForm] = useState(false);
  const [clientInfo, setClientInfo] = useState<ClientInfo | null>(null);
  const [contactName, setContactName] = useState("");
  const [contactValue, setContactValue] = useState("");
  const [viewedProjects, setViewedProjects] = useState<Set<string>>(new Set());
  const [emojiRainEmojis, setEmojiRainEmojis] = useState<string[]>([]);
  const [showGame, setShowGame] = useState(false);
  const [hasPlayedGame, setHasPlayedGame] = useState(false);
  const [wonDiscount, setWonDiscount] = useState(false);

  // Session tracking for admin chat monitoring
  const [visitorId, setVisitorId] = useState<string | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [adminTakeover, setAdminTakeover] = useState(false);

  // AI Effects hook
  const aiEffects = useAIEffects();

  // Refs
  const [pageStartTime, setPageStartTime] = useState(Date.now());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const lastAICheckRef = useRef<number>(0);
  const actionBufferRef = useRef<UserAction[]>([]);
  const clientInfoRef = useRef<ClientInfo | null>(null);

  // ============================================
  // INITIALIZATION
  // ============================================

  // Загрузка данных из localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;

    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const data: StoredData = JSON.parse(stored);
        setMessages(data.messages || []);
        setHasSeenIntro(data.hasSeenIntro || false);
        setUserCity(data.userCity);
        // Загружаем имя клиента если есть
        if (data.clientInfo?.name) {
          setUserName(data.clientInfo.name);
          setClientInfo(data.clientInfo);
          clientInfoRef.current = data.clientInfo; // Инициализируем ref сразу
        }
        // Загружаем состояние игры
        if (data.hasPlayedGame) {
          setHasPlayedGame(true);
        }
        if (data.wonDiscount) {
          setWonDiscount(true);
        }
      } catch {
        // Ignore parse errors
      }
    } else {
      setHasSeenIntro(false);
    }

    // Получаем город по IP
    fetchUserCity();

    // Initialize visitor ID (persistent)
    let storedVisitorId = localStorage.getItem(VISITOR_ID_KEY);
    if (!storedVisitorId) {
      storedVisitorId = generateId();
      localStorage.setItem(VISITOR_ID_KEY, storedVisitorId);
    }
    setVisitorId(storedVisitorId);

    // Initialize session token (new for each browser session)
    let storedSessionToken = sessionStorage.getItem(SESSION_TOKEN_KEY);
    if (!storedSessionToken) {
      storedSessionToken = generateId();
      sessionStorage.setItem(SESSION_TOKEN_KEY, storedSessionToken);
    }
    setSessionToken(storedSessionToken);

    // Отмечаем что загрузились
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Показываем intro при первом визите
  useEffect(() => {
    if (!isLoaded || hasSeenIntro) return;

    const timer = setTimeout(() => {
      setShowIntroModal(true);
      triggerIntroduction();
    }, INTRO_DELAY);

    return () => clearTimeout(timer);
  }, [isLoaded, hasSeenIntro]);

  // Синхронизируем ref с state для использования в callbacks
  useEffect(() => {
    clientInfoRef.current = clientInfo;
  }, [clientInfo]);

  // SSE connection for admin messages
  useEffect(() => {
    if (!sessionToken || typeof window === "undefined") return;

    const eventSource = new EventSource(`/api/chat/sse?sessionToken=${sessionToken}`);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "new_message" && data.data?.message) {
          const msg = data.data.message;
          // Only add messages from admin (AI messages are already added locally)
          if (msg.role === "ADMIN") {
            setMessages((prev) => [
              ...prev,
              { role: "assistant", content: `[Администратор]: ${msg.content}` },
            ]);
            setHasNewMessage(true);
          }
        } else if (data.type === "admin_joined") {
          setAdminTakeover(true);
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: locale === "ro"
                ? "Dezvoltatorul s-a alaturat conversatiei! Acum puteti vorbi direct cu el. 👨‍💻"
                : "К разговору подключился разработчик! Теперь вы общаетесь напрямую с ним. 👨‍💻",
            },
          ]);
        } else if (data.type === "admin_left") {
          setAdminTakeover(false);
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: locale === "ro"
                ? "Dezvoltatorul a plecat. Eu, asistentul AI, sunt din nou aici! 🤖"
                : "Разработчик отключился. Снова с вами я, AI-ассистент! 🤖",
            },
          ]);
        }
      } catch (error) {
        console.error("SSE message parse error:", error);
      }
    };

    eventSource.onerror = () => {
      console.log("SSE connection error, will retry...");
    };

    return () => {
      eventSource.close();
    };
  }, [sessionToken, locale]);

  // Сохранение в localStorage при изменениях
  useEffect(() => {
    if (typeof window === "undefined") return;

    const data: StoredData = {
      messages,
      hasSeenIntro,
      userCity,
      lastVisit: Date.now(),
      clientInfo: clientInfo || undefined,
      hasPlayedGame,
      wonDiscount,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [messages, hasSeenIntro, userCity, clientInfo, hasPlayedGame, wonDiscount]);

  // ============================================
  // CITY DETECTION
  // ============================================

  const fetchUserCity = async () => {
    try {
      // Используем ipapi.co (поддерживает HTTPS)
      const response = await fetch("https://ipapi.co/json/");
      if (response.ok) {
        const data = await response.json();
        if (data.city) {
          setUserCity(data.city);
        }
      }
    } catch {
      // Ignore errors - city is optional
    }
  };

  // ============================================
  // INTRODUCTION
  // ============================================

  const triggerIntroduction = async () => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actions: [],
          conversationHistory: [],
          currentPage: pathname,
          userCity,
          isFirstVisit: true,
          isIntroduction: true,
          locale,
          visitorId,
          sessionToken,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.message) {
          setMessages([{ role: "assistant", content: data.message }]);
          executeFunctionCalls(data.functionCalls);
        }
      }
    } catch (error) {
      console.error("Introduction error:", error);
      // Fallback сообщение
      setMessages([
        {
          role: "assistant",
          content: locale === "ro"
            ? `Salut${userCity ? `, vizitator din ${userCity}` : ""}! 👋 Sunt asistentul AI Metabyte. Pot povesti despre proiecte, ajuta cu navigarea sau raspunde la intrebari!`
            : `Привет${userCity ? `, гость из ${userCity}` : ""}! 👋 Я AI-помощник Metabyte. Могу рассказать о проектах, помочь с навигацией или ответить на вопросы!`,
        },
      ]);
    } finally {
      setIsLoading(false);
      setHasSeenIntro(true);
    }
  };

  const closeIntroAndOpenChat = () => {
    setShowIntroModal(false);
    setIsOpen(true);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7, x: 0.9 },
    });
  };

  // ============================================
  // SCROLL
  // ============================================

  // Надёжная прокрутка до конца с использованием requestAnimationFrame
  const scrollToBottom = useCallback((smooth = true) => {
    const doScroll = () => {
      if (messagesContainerRef.current) {
        const container = messagesContainerRef.current;
        const scrollHeight = container.scrollHeight;

        if (smooth) {
          container.scrollTo({
            top: scrollHeight,
            behavior: "smooth",
          });
        } else {
          container.scrollTop = scrollHeight;
        }
      }
    };

    // Используем requestAnimationFrame для гарантии что DOM обновился
    requestAnimationFrame(() => {
      requestAnimationFrame(doScroll);
    });
  }, []);

  // Прокрутка к последнему сообщению при изменении сообщений
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Прокрутка к последнему сообщению при открытии чата
  useEffect(() => {
    if (isOpen && !isMinimized) {
      // Серия попыток прокрутки для гарантированного результата
      scrollToBottom(false);

      // Дополнительные попытки с увеличивающейся задержкой
      const delays = [50, 100, 200, 400, 800];
      const timeouts = delays.map((delay) =>
        setTimeout(() => {
          scrollToBottom(false);
        }, delay)
      );

      return () => timeouts.forEach(clearTimeout);
    }
  }, [isOpen, isMinimized, scrollToBottom]);

  // ============================================
  // ACTION TRACKING
  // ============================================

  useEffect(() => {
    setPageStartTime(Date.now());
    trackAction("page_view", pathname);
  }, [pathname]);

  const trackAction = useCallback(
    (type: string, element?: string) => {
      const action: UserAction = {
        type,
        page: pathname,
        element,
        timestamp: Date.now(),
        scrollPosition: typeof window !== "undefined" ? window.scrollY : 0,
        timeOnPage: Date.now() - pageStartTime,
      };

      actionBufferRef.current = [...actionBufferRef.current.slice(-9), action];
      setActions(actionBufferRef.current);
    },
    [pathname, pageStartTime]
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleScroll = () => {
      trackAction("scroll");
    };

    const handleClick = (e: MouseEvent) => {
      try {
        const target = e.target as HTMLElement;
        if (!target || !target.tagName) return;

        let className = "";
        if (target.className) {
          if (typeof target.className === "string") {
            className = target.className;
          } else if ((target.className as unknown as SVGAnimatedString).baseVal !== undefined) {
            className = (target.className as unknown as SVGAnimatedString).baseVal;
          }
        }

        const firstClass = className ? className.split(" ")[0] : "";
        const elementInfo = target.tagName + (firstClass ? `.${firstClass}` : "");
        trackAction("click", elementInfo);
      } catch {
        // Ignore
      }
    };

    let scrollTimeout: NodeJS.Timeout;

    const throttledScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(handleScroll, 2000);
    };

    window.addEventListener("scroll", throttledScroll, { passive: true });
    window.addEventListener("click", handleClick);

    return () => {
      window.removeEventListener("scroll", throttledScroll);
      window.removeEventListener("click", handleClick);
      clearTimeout(scrollTimeout);
    };
  }, [trackAction]);

  // ============================================
  // PERIODIC AI CHECK - DISABLED to prevent AI talking to itself
  // ============================================

  // Removed automatic periodic AI checks that caused AI to generate
  // messages without user input, making it appear to "talk to itself"

  // ============================================
  // FUNCTION EXECUTION
  // ============================================

  const executeFunctionCalls = (functionCalls: FunctionCall[]) => {
    if (!functionCalls || functionCalls.length === 0) return;

    functionCalls.forEach((call) => {
      console.log("Executing function:", call.name, call.arguments);

      switch (call.name) {
        case "navigateTo": {
          const { path } = call.arguments as { path: string };
          console.log("Navigating to:", path);
          // НЕ закрываем чат - оставляем открытым для продолжения общения
          router.push(path);
          break;
        }

        case "scrollToSection": {
          const { sectionId } = call.arguments as { sectionId: string };
          const section =
            document.getElementById(sectionId) ||
            document.querySelector(`[data-section="${sectionId}"]`);
          if (section) {
            section.scrollIntoView({ behavior: "smooth" });
          }
          break;
        }

        case "showConfetti":
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
          });
          break;

        case "highlightElement": {
          const {
            selector,
            color = "#00ffff",
            duration = 2000,
          } = call.arguments as {
            selector: string;
            color?: string;
            duration?: number;
          };
          const element = document.querySelector(selector) as HTMLElement;
          if (element) {
            const originalBoxShadow = element.style.boxShadow;
            const originalTransition = element.style.transition;
            element.style.transition = "box-shadow 0.3s ease";
            element.style.boxShadow = `0 0 30px ${color}`;
            setTimeout(() => {
              element.style.boxShadow = originalBoxShadow;
              element.style.transition = originalTransition;
            }, duration);
          }
          break;
        }

        case "openExternalLink": {
          const { url } = call.arguments as { url: string };
          window.open(url, "_blank");
          break;
        }

        case "showNotification":
          console.log("Notification:", call.arguments);
          break;

        case "askForContact":
          // Не показываем форму если контакты уже собраны (используем ref для актуального значения)
          if (clientInfoRef.current) {
            console.log("Contact info already collected, skipping form");
            setMessages((prev) => [
              ...prev,
              {
                role: "assistant",
                content: locale === "ro"
                  ? `Avem deja datele dvs. de contact! 📋 Dezvoltatorul va contacta in curand. Daca doriti mai repede — scrieti direct pe Telegram: @metabytemd`
                  : `Ваши контакты уже у нас! 📋 Разработчик свяжется с вами в ближайшее время. Если хотите ускорить — напишите напрямую в Telegram: @metabytemd`,
              },
            ]);
          } else {
            console.log("Showing contact form");
            setShowContactForm(true);
          }
          break;

        case "collectContactInfo": {
          const { name, contact, message } = call.arguments as {
            name: string;
            contact: string;
            message?: string;
          };
          console.log("Collecting contact info:", { name, contact, message });
          const info: ClientInfo = {
            name,
            contact,
            message,
            collectedAt: Date.now(),
          };
          setClientInfo(info);
          setUserName(name); // Сохраняем имя клиента для обращения
          setShowContactForm(false);
          // Отправляем данные на сервер
          sendContactToServer(info);
          // Добавляем сообщение благодарности
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: locale === "ro"
                ? `Multumesc, ${name}! 🎉 Am transmis contactele tale (${contact}) dezvoltatorului. Te va contacta in curand! Intre timp poti vedea proiectele sau scrie direct pe Telegram: @metabytemd`
                : `Спасибо, ${name}! 🎉 Я передал ваши контакты (${contact}) разработчику. Он свяжется с вами в ближайшее время! А пока можете посмотреть проекты или написать напрямую в Telegram: @metabytemd`,
            },
          ]);
          // Показываем конфетти
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6, x: 0.9 }, // Справа внизу где чат
          });
          break;
        }

        // ============================================
        // NEW VISUAL EFFECTS FUNCTIONS
        // ============================================

        case "showMatrix": {
          const { duration = 5000 } = call.arguments as { duration?: number };
          aiEffects.showMatrix(duration);
          break;
        }

        case "showGlitch": {
          const { duration = 2000 } = call.arguments as { duration?: number };
          aiEffects.showGlitch(duration);
          break;
        }

        case "showHackTerminal": {
          const { duration = 4000 } = call.arguments as { duration?: number };
          aiEffects.showHackTerminal(duration);
          break;
        }

        case "showEmojiRain": {
          const { emojis = ["🚀", "💻", "⚡", "🎮", "💰"], duration = 3000 } = call.arguments as {
            emojis?: string[];
            duration?: number;
          };
          setEmojiRainEmojis(emojis);
          aiEffects.showEmojiRain(emojis, duration);
          break;
        }

        case "addReaction": {
          const { emoji, x, y } = call.arguments as { emoji: string; x?: number; y?: number };
          const posX = x ?? window.innerWidth / 2;
          const posY = y ?? window.innerHeight / 2;
          aiEffects.addReaction(emoji, posX, posY);
          break;
        }

        case "showSpotlight": {
          const { selector, message } = call.arguments as { selector: string; message: string };
          aiEffects.showSpotlight(selector, message);
          break;
        }

        case "showAIBubble": {
          const { message, x, y, type = "tip" } = call.arguments as {
            message: string;
            x?: number;
            y?: number;
            type?: "tip" | "comment" | "celebration";
          };
          const posX = x ?? window.innerWidth - 400;
          const posY = y ?? 100;
          aiEffects.addBubble(message, posX, posY, type);
          break;
        }

        case "startGame": {
          // Проверяем что игра еще не была сыграна
          if (!hasPlayedGame) {
            setShowGame(true);
          } else {
            setMessages((prev) => [
              ...prev,
              {
                role: "assistant",
                content: wonDiscount
                  ? (locale === "ro"
                    ? "Ai castigat deja reducerea de 10%! 🎉 Nu se poate de doua ori, smecher! 😄"
                    : "Ты уже выиграл свою скидку 10%! 🎉 Больше одного раза не получится, хитрец! 😄")
                  : (locale === "ro"
                    ? "Am mai jucat! Din pacate, nu se poate repeta. Dar poti oricum sa scrii dezvoltatorului — poate va intelegeti! 😉"
                    : "Мы уже играли! К сожалению, повторно сыграть нельзя. Но ты всё равно можешь написать разработчику — может договоритесь! 😉"),
              },
            ]);
          }
          break;
        }
      }
    });
  };

  // Парсинг текстовых команд из сообщения AI
  const parseTextCommands = (text: string): FunctionCall[] => {
    const calls: FunctionCall[] = [];

    // Ищем паттерны типа [вызвать navigateTo("/path")] или navigateTo("/path")
    const navigatePatterns = [
      /\[вызвать\s+navigateTo\s*\(\s*["']([^"']+)["']\s*\)\]/gi,
      /navigateTo\s*\(\s*["']([^"']+)["']\s*\)/gi,
      /перевожу.*?\/(\w+(?:\/\w+)*)/gi,
      /показываю.*?\/projects\/(\w+)/gi,
    ];

    for (const pattern of navigatePatterns) {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        const path = match[1].startsWith("/") ? match[1] : `/projects/${match[1]}`;
        if (!calls.some((c) => c.name === "navigateTo" && (c.arguments as { path: string }).path === path)) {
          calls.push({ name: "navigateTo", arguments: { path } });
        }
      }
    }

    // Ищем askForContact
    if (/\[вызвать\s+askForContact/i.test(text) || /askForContact/i.test(text)) {
      calls.push({ name: "askForContact", arguments: {} });
    }

    return calls;
  };

  // Отправка контактов на сервер (в Telegram)
  const sendContactToServer = async (info: ClientInfo) => {
    try {
      await fetch("/api/telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: info.name,
          email: info.contact, // используем поле email для контакта
          message: `🤖 Заявка от AI-ассистента\n\nИмя: ${info.name}\nКонтакт: ${info.contact}${info.message ? `\nСообщение: ${info.message}` : ""}\n\nГород: ${userCity || "Неизвестен"}`,
        }),
      });
      console.log("Contact sent to Telegram");
    } catch (error) {
      console.error("Failed to send contact:", error);
    }
  };

  // ============================================
  // SEND MESSAGE
  // ============================================

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: inputValue };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actions: actionBufferRef.current,
          conversationHistory: [...messages, userMessage].slice(-10),
          currentPage: pathname,
          userCity,
          userName, // Передаем имя клиента для персонализации
          hasContactInfo: !!clientInfo, // Флаг что контакты уже собраны
          clientContact: clientInfo?.contact, // Контакт клиента если есть
          hasPlayedGame, // Играл ли уже в крестики-нолики
          wonDiscount, // Выиграл ли скидку
          locale, // Язык интерфейса для ответов AI
          visitorId,
          sessionToken,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("AI Response:", data);

        // If admin has taken over, don't process AI response
        if (data.adminTakeover) {
          setAdminTakeover(true);
          // Message will come via SSE from admin
          return;
        }

        let messageText = data.message || "";

        // Парсим текстовые команды если AI написал их вместо вызова функции
        const parsedCalls = parseTextCommands(messageText);
        if (parsedCalls.length > 0) {
          // Убираем текстовые команды из сообщения
          messageText = messageText
            .replace(/\[вызвать\s+\w+\([^)]*\)\]/gi, "")
            .replace(/\[navigateTo\([^)]*\)\]/gi, "")
            .trim();
          console.log("Parsed text commands:", parsedCalls);
        }

        // Добавляем сообщение если есть
        if (messageText) {
          setMessages((prev) => [...prev, { role: "assistant", content: messageText }]);
        }

        // Объединяем функции из API и распарсенные из текста
        const allCalls = [...(data.functionCalls || []), ...parsedCalls];

        // Выполняем функции
        if (allCalls.length > 0) {
          console.log("Executing functions:", allCalls);
          executeFunctionCalls(allCalls);
        }
      }
    } catch (error) {
      console.error("Send message error:", error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: locale === "ro"
          ? "Oops, ceva nu a mers bine. Incearca din nou! 😅"
          : "Упс, что-то пошло не так. Попробуйте ещё раз! 😅" },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearHistory = () => {
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  // ============================================
  // EXIT INTENT HANDLER
  // ============================================

  const handleExitIntentContact = () => {
    aiEffects.setShowExitIntent(false);
    setIsOpen(true);
    setShowContactForm(true);
  };

  // ============================================
  // PROGRESS CELEBRATION - Track project views
  // ============================================

  useEffect(() => {
    // Отслеживаем просмотр проектов
    if (pathname.startsWith("/projects/") && pathname !== "/projects") {
      const projectSlug = pathname.split("/").pop();
      if (projectSlug && !viewedProjects.has(projectSlug)) {
        setViewedProjects((prev) => {
          const newSet = new Set(prev);
          newSet.add(projectSlug);

          // Показываем celebration на 3, 5, 7 проектах
          if ([3, 5, 7].includes(newSet.size)) {
            aiEffects.showProgressCelebration(newSet.size);
          }

          return newSet;
        });
      }
    }
  }, [pathname, viewedProjects, aiEffects]);

  // ============================================
  // INACTIVITY HINTS - Spotlight подсказки
  // ============================================

  useEffect(() => {
    if (!hasSeenIntro) return;

    let inactivityTimer: NodeJS.Timeout;
    const INACTIVITY_DELAY = 30000; // 30 секунд бездействия

    const resetTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        // Показываем подсказку только если чат закрыт
        if (!isOpen && !aiEffects.spotlightTarget && !aiEffects.showExitIntent) {
          // Разные подсказки в зависимости от страницы
          if (pathname === "/") {
            aiEffects.showSpotlight(
              "[data-section='projects'], .project-card, #projects",
              locale === "ro" ? "Vedeti proiectele noastre! E mult interesant 👀" : "Посмотрите наши проекты! Там много интересного 👀"
            );
          } else if (pathname === "/projects") {
            const cards = document.querySelectorAll(".project-card");
            if (cards.length > 0) {
              const randomCard = cards[Math.floor(Math.random() * Math.min(cards.length, 4))];
              if (randomCard) {
                aiEffects.addBubble(
                  locale === "ro" ? "Apasati pe cartonas pentru detalii! 💡" : "Нажмите на карточку чтобы узнать подробности! 💡",
                  window.innerWidth - 350,
                  200,
                  "tip"
                );
              }
            }
          } else if (pathname.startsWith("/projects/") && !clientInfo) {
            aiEffects.addBubble(
              locale === "ro" ? "Iti place proiectul? Pot organiza un apel cu dezvoltatorul! 📞" : "Нравится проект? Могу организовать созвон с разработчиком! 📞",
              window.innerWidth - 350,
              300,
              "tip"
            );
          }
        }
      }, INACTIVITY_DELAY);
    };

    // События для сброса таймера
    const events = ["mousemove", "mousedown", "keydown", "scroll", "touchstart"];
    events.forEach((event) => window.addEventListener(event, resetTimer, { passive: true }));

    resetTimer(); // Запуск таймера

    return () => {
      clearTimeout(inactivityTimer);
      events.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, [pathname, hasSeenIntro, isOpen, aiEffects, clientInfo]);

  // ============================================
  // SCROLL-TRIGGERED COMMENTS
  // ============================================

  const scrollTriggeredRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!hasSeenIntro) return;

    const handleScroll = () => {
      const scrollPercent = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;

      // Триггеры на главной странице
      if (pathname === "/" && !isOpen) {
        // 50% скролла - комментарий про проекты
        if (scrollPercent > 50 && !scrollTriggeredRef.current.has("home-50")) {
          scrollTriggeredRef.current.add("home-50");
          setTimeout(() => {
            aiEffects.addBubble(
              locale === "ro" ? "Deja la jumatate! Mai jos e formularul de contact 📬" : "Уже на полпути! Ниже есть контактная форма 📬",
              window.innerWidth - 350,
              window.innerHeight - 200,
              "comment"
            );
          }, 500);
        }

        // 90% скролла - призыв к действию
        if (scrollPercent > 90 && !scrollTriggeredRef.current.has("home-90")) {
          scrollTriggeredRef.current.add("home-90");
          setTimeout(() => {
            if (!clientInfo) {
              aiEffects.addBubble(
                locale === "ro" ? "Ai ajuns la final! Scrie — discutam proiectul tau 🚀" : "Дошли до конца! Напишите — обсудим ваш проект 🚀",
                window.innerWidth - 350,
                window.innerHeight - 250,
                "celebration"
              );
            }
          }, 500);
        }
      }

      // На странице проекта
      if (pathname.startsWith("/projects/") && pathname !== "/projects" && !isOpen) {
        if (scrollPercent > 60 && !scrollTriggeredRef.current.has(`project-60-${pathname}`)) {
          scrollTriggeredRef.current.add(`project-60-${pathname}`);
          setTimeout(() => {
            aiEffects.addReaction("👀", window.innerWidth - 100, window.innerHeight / 2);
          }, 300);
        }
      }
    };

    const throttledScroll = () => {
      requestAnimationFrame(handleScroll);
    };

    window.addEventListener("scroll", throttledScroll, { passive: true });
    return () => window.removeEventListener("scroll", throttledScroll);
  }, [pathname, hasSeenIntro, isOpen, aiEffects, clientInfo]);

  const handleProgressAskFavorite = () => {
    aiEffects.setProgressCelebration(null);
    setIsOpen(true);
    setInputValue("Мне понравился ");
  };

  // ============================================
  // TIC TAC TOE GAME
  // ============================================

  // Handler for AI moves in the game
  const handleAIMove = async (board: (string | null)[], playerSymbol: "X" | "O"): Promise<number> => {
    try {
      const response = await fetch("/api/ai-assistant/tictactoe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          board,
          playerSymbol,
          userName,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.move;
      }
    } catch (error) {
      console.error("AI move error:", error);
    }

    // Fallback: return first empty cell
    const emptyIndex = board.findIndex((cell) => cell === null);
    return emptyIndex >= 0 ? emptyIndex : 0;
  };

  // Handler for game end
  const handleGameEnd = (result: "won" | "lost" | "draw") => {
    setHasPlayedGame(true);

    if (result === "won") {
      setWonDiscount(true);
      // Добавляем сообщение о выигрыше
      setTimeout(() => {
        setShowGame(false);
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: locale === "ro"
              ? `🎉 ${userName ? `${userName}, f` : "F"}elicitari cu victoria! Ai meritat reducerea de 10%! I-am soptit deja dezvoltatorului... Cand vei discuta proiectul, spune cuvantul cod "XSIO" si reducerea e a ta! 😎`
              : `🎉 ${userName ? `${userName}, п` : "П"}оздравляю с победой! Ты заслужил скидку 10%! Я уже шепнул разработчику... Когда будешь обсуждать проект, скажи кодовое слово "КРЕСТИКИ" и скидка твоя! 😎`,
          },
        ]);
      }, 2000);
    } else if (result === "lost") {
      setTimeout(() => {
        setShowGame(false);
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: locale === "ro"
              ? `Am castigat! 😄 Dar nu te supara — scrie dezvoltatorului, poate iti da oricum reducere pentru curaj! @metabytemd`
              : `Я победил! 😄 Но не расстраивайся — напиши разработчику, может он всё равно даст скидку за смелость! @metabytemd`,
          },
        ]);
      }, 2000);
    } else {
      setTimeout(() => {
        setShowGame(false);
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: locale === "ro"
              ? `Egalitate! 🤝 Joc demn! Nu ai castigat reducerea, dar ai castigat respectul. Scrie dezvoltatorului — @metabytemd`
              : `Ничья! 🤝 Достойная игра! Скидку не выиграл, но уважение заслужил. Напиши разработчику — @metabytemd`,
          },
        ]);
      }, 2000);
    }
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <>
      {/* ========== VISUAL EFFECTS ========== */}
      <AnimatePresence>
        {aiEffects.activeEffect === "matrix" && (
          <MatrixRain onComplete={() => {}} />
        )}
        {aiEffects.activeEffect === "glitch" && (
          <GlitchOverlay onComplete={() => {}} />
        )}
        {aiEffects.activeEffect === "hack" && (
          <HackTerminal onComplete={() => {}} locale={locale} />
        )}
        {aiEffects.activeEffect === "emoji" && (
          <EmojiRain emojis={emojiRainEmojis} onComplete={() => {}} />
        )}
      </AnimatePresence>

      {/* ========== FLOATING REACTIONS ========== */}
      <AnimatePresence>
        {aiEffects.floatingReactions.map((reaction) => (
          <FloatingReactionComponent key={reaction.id} reaction={reaction} />
        ))}
      </AnimatePresence>

      {/* ========== AI BUBBLES ========== */}
      <AnimatePresence>
        {aiEffects.aiBubbles.map((bubble) => (
          <AIBubbleComponent
            key={bubble.id}
            bubble={bubble}
            onClose={() => aiEffects.removeBubble(bubble.id)}
          />
        ))}
      </AnimatePresence>

      {/* ========== SPOTLIGHT ========== */}
      <AnimatePresence>
        {aiEffects.spotlightTarget && (
          <SpotlightEffect
            target={aiEffects.spotlightTarget.element}
            message={aiEffects.spotlightTarget.message}
            onClose={() => aiEffects.setSpotlightTarget(null)}
            locale={locale}
          />
        )}
      </AnimatePresence>

      {/* ========== EXIT INTENT POPUP ========== */}
      <AnimatePresence>
        {aiEffects.showExitIntent && !clientInfo && (
          <ExitIntentPopup
            userName={userName}
            onClose={() => aiEffects.setShowExitIntent(false)}
            onContact={handleExitIntentContact}
            locale={locale}
          />
        )}
      </AnimatePresence>

      {/* ========== PROGRESS CELEBRATION ========== */}
      <AnimatePresence>
        {aiEffects.progressCelebration && (
          <ProgressCelebration
            projectsViewed={aiEffects.progressCelebration}
            onClose={() => aiEffects.setProgressCelebration(null)}
            onAskFavorite={handleProgressAskFavorite}
            locale={locale}
          />
        )}
      </AnimatePresence>

      {/* ========== TIC TAC TOE GAME MODAL ========== */}
      <AnimatePresence>
        {showGame && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setShowGame(false)}
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-md mx-4"
            >
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/30 via-accent/30 to-primary/30 rounded-3xl blur-xl" />

              <div className="relative bg-card border border-primary/30 rounded-2xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="p-4 border-b border-border/50 flex justify-between items-center bg-gradient-to-r from-primary/10 to-accent/10">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🎮</span>
                    <span className="font-bold text-foreground">{locale === "ro" ? "X si O" : "Крестики-нолики"}</span>
                  </div>
                  <button
                    onClick={() => setShowGame(false)}
                    className="p-2 hover:bg-muted rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>

                {/* Game */}
                <TicTacToe
                  onGameEnd={handleGameEnd}
                  onAIMove={handleAIMove}
                  userName={userName}
                  locale={locale}
                />

                {/* Footer hint */}
                <div className="p-3 border-t border-border/50 bg-muted/30 text-center">
                  <p className="text-xs text-muted-foreground">
                    {locale === "ro" ? "Castiga si obtine reducere 10%! 🏆" : "Выиграй и получи скидку 10%! 🏆"}
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========== CONTACT FORM MODAL ========== */}
      <AnimatePresence>
        {showContactForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setShowContactForm(false)}
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-sm mx-4 w-full"
            >
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/30 via-accent/30 to-primary/30 rounded-3xl blur-xl" />

              <div className="relative bg-card border border-primary/30 rounded-2xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="p-4 border-b border-border/50 flex justify-between items-center bg-gradient-to-r from-primary/10 to-accent/10">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">📞</span>
                    <span className="font-bold text-foreground">{locale === "ro" ? "Lasati datele de contact" : "Оставьте контакты"}</span>
                  </div>
                  <button
                    onClick={() => setShowContactForm(false)}
                    className="p-2 hover:bg-muted rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>

                {/* Form */}
                <div className="p-6 space-y-4">
                  <p className="text-sm text-muted-foreground text-center">
                    {locale === "ro"
                      ? "Lasati datele si dezvoltatorul va contacta in curand!"
                      : "Оставьте свои данные и разработчик свяжется с вами в ближайшее время!"}
                  </p>
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder={locale === "ro" ? "Numele dvs." : "Ваше имя"}
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <input
                    type="text"
                    value={contactValue}
                    onChange={(e) => setContactValue(e.target.value)}
                    placeholder={locale === "ro" ? "Telegram (@username) sau telefon" : "Telegram (@username) или телефон"}
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => {
                        if (contactName && contactValue) {
                          const info: ClientInfo = {
                            name: contactName,
                            contact: contactValue,
                            collectedAt: Date.now(),
                          };
                          setClientInfo(info);
                          clientInfoRef.current = info;
                          setUserName(contactName);
                          setShowContactForm(false);
                          sendContactToServer(info);
                          const gameOffer = !hasPlayedGame
                            ? (locale === "ro"
                              ? "\n\n🎮 Apropo, vrei sa jucam X si O? Daca castigi — iti fac reducere 10%! Scrie 'jucam' sau 'hai sa jucam'!"
                              : "\n\n🎮 Кстати, хочешь сыграть в крестики-нолики? Если выиграешь — выпрошу для тебя скидку 10%! Напиши 'играем' или 'давай сыграем'!")
                            : "";
                          setMessages((prev) => [
                            ...prev,
                            {
                              role: "assistant",
                              content: locale === "ro"
                                ? `Multumesc, ${contactName}! 🎉 Am transmis contactele dezvoltatorului. Te va contacta in curand!${gameOffer}`
                                : `Спасибо, ${contactName}! 🎉 Я передал ваши контакты разработчику. Он свяжется с вами в ближайшее время!${gameOffer}`,
                            },
                          ]);
                          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
                          setContactName("");
                          setContactValue("");
                        }
                      }}
                      disabled={!contactName || !contactValue}
                      className="flex-1 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-primary/30"
                    >
                      {locale === "ro" ? "Trimite" : "Отправить"}
                    </button>
                    <button
                      onClick={() => setShowContactForm(false)}
                      className="px-6 py-3 bg-muted text-muted-foreground rounded-xl font-medium hover:bg-muted/80 transition-colors"
                    >
                      {locale === "ro" ? "Anuleaza" : "Отмена"}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========== INTRO MODAL ========== */}
      <AnimatePresence>
        {showIntroModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={closeIntroAndOpenChat}
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ type: "spring", damping: 15, stiffness: 200 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-md mx-4"
            >
              {/* Glow effect */}
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/50 via-accent/50 to-primary/50 rounded-3xl blur-xl animate-pulse" />

              <div className="relative bg-card border border-primary/30 rounded-2xl p-6 shadow-2xl">
                {/* Avatar */}
                <motion.div
                  initial={{ y: -20 }}
                  animate={{ y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex justify-center mb-4"
                >
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/30">
                    <Sparkles className="w-10 h-10 text-primary-foreground" />
                  </div>
                </motion.div>

                {/* Content */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-center"
                >
                  <h2 className="text-2xl font-display text-foreground mb-2">
                    {userCity
                      ? (locale === "ro" ? `Salut, ${userCity}!` : `Привет, ${userCity}!`)
                      : (locale === "ro" ? "Salut!" : "Привет!")} 👋
                  </h2>

                  <div className="bg-muted rounded-xl p-4 mb-4">
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <motion.span
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ repeat: Infinity, duration: 1 }}
                          className="w-2 h-2 bg-primary rounded-full"
                        />
                        <motion.span
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                          className="w-2 h-2 bg-primary rounded-full"
                        />
                        <motion.span
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                          className="w-2 h-2 bg-primary rounded-full"
                        />
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm">
                        {messages[0]?.content ||
                          (locale === "ro"
                            ? "Sunt asistentul AI Metabyte. Iti arat proiectele, raspund la intrebari, ajut sa contactezi dezvoltatorul!"
                            : "Я AI-помощник Metabyte. Покажу проекты, отвечу на вопросы, помогу связаться с разработчиком!")}
                      </p>
                    )}
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={closeIntroAndOpenChat}
                    className="w-full py-3 px-6 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/30"
                  >
                    {locale === "ro" ? "Incepe conversatia" : "Начать общение"}
                  </motion.button>

                  <p className="text-xs text-muted-foreground mt-3">
                    {locale === "ro" ? "Apasati oriunde pentru a inchide" : "Нажмите куда угодно чтобы закрыть"}
                  </p>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========== CHAT BUTTON ========== */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: isOpen || showIntroModal ? 0 : 1 }}
        transition={{ type: "spring", delay: isLoaded ? 0 : 1 }}
        onClick={() => {
          setIsOpen(true);
          setIsMinimized(false);
          setHasNewMessage(false);
        }}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg hover:shadow-[0_0_30px_rgba(0,255,255,0.5)] transition-all duration-300"
      >
        <MessageCircle className="w-6 h-6 text-primary-foreground" />
        {hasNewMessage && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
          >
            <span className="text-[10px] text-white font-bold">!</span>
          </motion.span>
        )}
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute inset-0 rounded-full bg-primary/30 -z-10"
        />
      </motion.button>

      {/* ========== CHAT WINDOW ========== */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              height: isMinimized ? "auto" : "500px",
            }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: "spring", damping: 20 }}
            onAnimationComplete={() => {
              // Прокрутка после завершения анимации открытия
              if (!isMinimized) {
                scrollToBottom(false);
              }
            }}
            className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-primary/20 to-accent/20 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{locale === "ro" ? "Asistent AI" : "AI Ассистент"}</h3>
                  <p className="text-xs text-muted-foreground">
                    {userName ? userName : userCity ? (locale === "ro" ? `Vizitator din ${userCity}` : `Гость из ${userCity}`) : "Online"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-2 hover:bg-background/50 rounded-lg transition-colors"
                  title={isMinimized ? "Развернуть" : "Свернуть"}
                >
                  {isMinimized ? (
                    <Maximize2 className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <Minimize2 className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-background/50 rounded-lg transition-colors"
                  title="Закрыть"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* Messages */}
            {!isMinimized && (
              <>
                <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 && (
                    <div className="text-center py-8">
                      <Bot className="w-12 h-12 text-primary/50 mx-auto mb-3" />
                      <p className="text-muted-foreground text-sm">
                        {locale === "ro"
                          ? "Salut! Intreaba-ma despre proiecte sau hai sa vorbim! 😊"
                          : "Привет! Спроси меня о проектах или просто поболтаем! 😊"}
                      </p>
                    </div>
                  )}
                  {messages.map((message, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn("flex gap-3", message.role === "user" && "flex-row-reverse")}
                    >
                      <div
                        className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                          message.role === "assistant" ? "bg-primary/20" : "bg-accent/20"
                        )}
                      >
                        {message.role === "assistant" ? (
                          <Bot className="w-4 h-4 text-primary" />
                        ) : (
                          <User className="w-4 h-4 text-accent" />
                        )}
                      </div>
                      <div
                        className={cn(
                          "max-w-[75%] p-3 rounded-2xl",
                          message.role === "assistant"
                            ? "bg-muted rounded-tl-sm"
                            : "bg-primary text-primary-foreground rounded-tr-sm"
                        )}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      </div>
                    </motion.div>
                  ))}
                  {isLoading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                        <Bot className="w-4 h-4 text-primary" />
                      </div>
                      <div className="bg-muted p-3 rounded-2xl rounded-tl-sm">
                        <motion.div
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ repeat: Infinity, duration: 1.5 }}
                          className="flex gap-1"
                        >
                          <span className="w-2 h-2 bg-primary/50 rounded-full" />
                          <span className="w-2 h-2 bg-primary/50 rounded-full" />
                          <span className="w-2 h-2 bg-primary/50 rounded-full" />
                        </motion.div>
                      </div>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </div>



                {/* Input */}
                <div className="p-4 border-t border-border">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={locale === "ro" ? "Scrie un mesaj..." : "Напишите сообщение..."}
                      className="flex-1 px-4 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!inputValue.trim() || isLoading}
                      className="p-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                  {messages.length > 0 && (
                    <button
                      onClick={clearHistory}
                      className="text-xs text-muted-foreground hover:text-foreground mt-2 transition-colors"
                    >
                      {locale === "ro" ? "Sterge istoricul" : "Очистить историю"}
                    </button>
                  )}
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
