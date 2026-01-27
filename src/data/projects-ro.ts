// Romanian translations for project data
import type { Project } from "./projects";

export const projectsRo: Project[] = [
  {
    slug: "wasteland-arena",
    title: "Wasteland Arena",
    subtitle: "Joc 3D Multiplayer in Browser",
    description:
      "Joc 3D in browser in stil Brawl Stars cu multiplayer in timp real. 8 eroi unici, 3 moduri de joc.",
    fullDescription: `**Ce a primit clientul:** Un joc complet 3D arena in browser in stil Brawl Stars cu multiplayer, gata pentru monetizare prin achizitii in joc.

**Problema:** Jocurile mobile Brawl Stars ocupa nisa jocurilor arena casual, dar nu exista un analog in browser cu grafica 3D si lansare instantanee fara instalare.

**Solutia:** Am creat un joc 3D complet in browser pe Babylon.js cu server autoritativ pe Colyseus. 8 eroi unici, 3 moduri de joc, sistem de progresie.

**Executie tehnica:**
• Arhitectura Monorepo (client/server/shared) cu tipizare completa
• Sistem modular de eroi — un personaj nou se adauga in 30 de minute
• Client-side prediction pentru raspuns instantaneu la ping de 100ms
• Modele 3D cu animatii Mixamo si incarcare automata
• Adaptare mobila cu joystick-uri virtuale
• Autentificare JWT + MongoDB pentru progresia jucatorilor`,
    category: "games",
    categoryLabel: "Game Development",
    image: "/images/projects/wasteland-arena.jpg",
    video: {
      type: "vimeo" as const,
      id: "1156641673",
    },
    featured: true,
    technologies: [
      { name: "Babylon.js 6", icon: "box", color: "#00ffff" },
      { name: "Colyseus", icon: "wifi", color: "#ff00ff" },
      { name: "React 18", icon: "atom", color: "#61dafb" },
      { name: "TypeScript", icon: "file-code", color: "#3178c6" },
      { name: "Node.js", icon: "hexagon", color: "#339933" },
      { name: "MongoDB", icon: "database", color: "#00ed64" },
    ],
    features: [
      {
        title: "8 eroi unici",
        description: "Tank-uri, lunetisti, asasini, suporteri — fiecare cu abilitati unice",
        icon: "users",
      },
      {
        title: "Multiplayer in timp real",
        description: "Server autoritativ Colyseus cu client-side prediction",
        icon: "wifi",
      },
      {
        title: "Grafica 3D in browser",
        description: "Babylon.js 6 cu animatii Mixamo si 60 FPS",
        icon: "box",
      },
      {
        title: "3 moduri de joc",
        description: "Gem Grab, Free-For-All, Team Deathmatch",
        icon: "gamepad-2",
      },
      {
        title: "Adaptare mobila",
        description: "Joystick-uri virtuale pentru control tactil",
        icon: "smartphone",
      },
      {
        title: "Sistem de progresie",
        description: "Autentificare JWT, niveluri, statistici in MongoDB",
        icon: "trophy",
      },
    ],
    links: {
      github: "https://github.com/LegoDev94/wastelandarena",
    },
    metrics: [
      { label: "Eroi", value: "8", icon: "users" },
      { label: "Moduri de joc", value: "3", icon: "gamepad-2" },
      { label: "Linii de cod", value: "15K+", icon: "code" },
      { label: "Modele 3D", value: "4", icon: "box" },
    ],
    caseStudy: {
      challenge: "Clientul dorea o alternativa in browser la Brawl Stars — un joc arena dinamic cu grafica 3D care functioneaza fara instalare. Cerinte principale: lansare instantanee in browser, multiplayer fara intarzieri, eroi unici cu stiluri diferite de joc.",
      solution: "Am dezvoltat un pipeline complet de joc: Babylon.js pentru randare 3D in browser, Colyseus pentru server autoritativ cu protectie anti-cheat, sistem modular de eroi pentru adaugare rapida de continut. Am implementat client-side prediction pentru gameplay fluid chiar si la ping de 100ms.",
      results: [
        "Jocul porneste in 3 secunde in orice browser fara instalare",
        "8 eroi unici cu mecanici si stiluri de joc diferite",
        "Client-side prediction asigura responsivitate la ping pana la 150ms",
        "Un erou nou se adauga in 30 de minute datorita arhitecturii modulare",
        "Versiunea mobila cu joystick-uri virtuale functioneaza pe orice telefon",
        "Monorepo cu tipuri partajate elimina desincronizarea client-server",
      ],
      userFlows: [
        {
          id: "game-loop",
          title: "Ciclul de joc",
          description: "De la lansare la victorie",
          icon: "gamepad-2",
          steps: [
            { title: "Lansare in browser", description: "Ai deschis linkul — jocul s-a incarcat in 3 secunde", icon: "globe" },
            { title: "Alegerea eroului", description: "8 personaje cu abilitati unice", icon: "users" },
            { title: "Cautare meci", description: "Matchmaking uneste jucatorii dupa skill", icon: "search" },
            { title: "Gameplay", description: "Tragere, abilitati, munca in echipa", icon: "crosshair" },
            { title: "Victorie si recompense", description: "XP, niveluri, deblocarea continutului nou", icon: "trophy" },
          ],
        },
        {
          id: "network-sync",
          title: "Sincronizare retea",
          description: "Cum se obtine multiplayer fluid",
          icon: "wifi",
          steps: [
            { title: "Input jucator", description: "WASD/joystick → reactie locala instantanee", icon: "keyboard" },
            { title: "Client prediction", description: "Clientul prezice miscarea pana la raspunsul serverului", icon: "zap" },
            { title: "Trimitere la server", description: "Comanda pleaca prin WebSocket la fiecare 33ms", icon: "send" },
            { title: "Verificare autoritativa", description: "Serverul valideaza si actualizeaza starea", icon: "shield-check" },
            { title: "Reconciliere", description: "Clientul corecteaza pozitia dupa server", icon: "refresh-cw" },
          ],
        },
      ],
      technicalHighlights: [
        {
          title: "Client-Side Prediction",
          description: "Jucatorul vede reactie instantanee la actiunile sale, in timp ce serverul valideaza. La divergente — corectie lina. Rezultat: gameplay responsiv chiar si la ping de 100-150ms.",
          icon: "zap",
          tags: ["Ascundere latenta", "Gameplay fluid", "Protectie anti-cheat"],
        },
        {
          title: "Arhitectura modulara eroi",
          description: "Fiecare erou este un obiect declarativ: statistici, model de atac, abilitati din biblioteca. Adaugarea unui personaj nou dureaza 30 de minute fara modificarea codului jocului.",
          icon: "boxes",
          tags: ["BrawlerRegistry", "AbilityLibrary", "Zero cod server"],
        },
        {
          title: "Server autoritativ",
          description: "Toata logica jocului pe server: coliziuni, damage, validare comenzi. Clientul doar randeaza si prezice. Protectie impotriva speedhack, wallhack, damage hack.",
          icon: "shield-check",
          tags: ["Anti-cheat", "Colyseus", "Autoritate server"],
        },
        {
          title: "3D in browser fara pierderi",
          description: "Babylon.js 6 randeaza modele 3D cu animatii la 60 FPS. Optimizare automata pentru GPU-ul dispozitivului. Functioneaza in orice browser modern.",
          icon: "monitor",
          tags: ["WebGL", "60 FPS", "Cross-browser"],
        },
      ],
      architecture: {
        description: "Monorepo cu trei pachete: client (randare), server (logica), shared (tipuri). Tipizare completa elimina desincronizarea.",
        layers: [
          {
            name: "Client (Babylon.js + React)",
            components: ["GameScene", "InputManager", "NetworkManager", "AnimationManager", "EffectsSystem"],
            color: "#61dafb",
          },
          {
            name: "WebSocket (Colyseus)",
            components: ["Room State Sync", "Input Commands", "Game Events", "Matchmaking"],
            color: "#ff00ff",
          },
          {
            name: "Server (Node.js + Colyseus)",
            components: ["GameRoom", "GameLogic", "CollisionDetection", "BrawlerRegistry", "AbilitySystem"],
            color: "#339933",
          },
          {
            name: "Database (MongoDB)",
            components: ["Players", "Statistics", "Leaderboards", "Sessions"],
            color: "#00ed64",
          },
        ],
      },
      integrations: [
        {
          name: "Babylon.js 6",
          logo: "box",
          description: "Motor 3D pentru browser: modele, animatii, particule, iluminare",
          color: "#00ffff",
        },
        {
          name: "Colyseus",
          logo: "wifi",
          description: "Server de joc autoritativ cu state sync si matchmaking",
          color: "#ff00ff",
        },
        {
          name: "Mixamo",
          logo: "user",
          description: "Biblioteca de animatii pentru personaje 3D (idle, run, attack, death)",
          color: "#ff6b00",
        },
        {
          name: "MongoDB",
          logo: "database",
          description: "Stocare profile jucatori, statistici, clasamente",
          color: "#00ed64",
        },
        {
          name: "JWT Auth",
          logo: "lock",
          description: "Autentificare securizata cu token-uri pe 7 zile",
          color: "#f7df1e",
        },
        {
          name: "NippleJS",
          logo: "smartphone",
          description: "Joystick-uri virtuale pentru dispozitive mobile",
          color: "#42b883",
        },
      ],
      gallery: [
        { src: "/3dmodels/wasteland-arena/lilit/lilit.glb", alt: "Lilit 3D Model", caption: "Lilit — lunetist fantoma" },
        { src: "/3dmodels/wasteland-arena/hero_1/hero.glb", alt: "Wasteland Sniper 3D Model", caption: "Wasteland Sniper — tragar din pustiu" },
      ],
    },
  },
  {
    slug: "giftpool",
    title: "GiftPool",
    subtitle: "Platforma de cadouri colective",
    description:
      "Afacere gata de lansare: platforma de strangere de bani pentru cadouri cu primire plati, plati instantanee si protectie AI impotriva fraudatorilor.",
    fullDescription: `**Ce a primit clientul:** O afacere SaaS complet gata de lansare pentru piata americana — o platforma unde oamenii strang bani pentru cadouri comune in loc sa daruiasca separat.

**Problema pietei:** GoFundMe percepe 2.9% + comisioane, Kickstarter nu e potrivit pentru cadouri, PayPal are retragere complicata. Nu exista o solutie convenabila special pentru cadouri.

**Solutia:** Platforma de nisa cu 0% comision pentru prima strangere (pentru atragerea utilizatorilor), plati instantanee pe card si protectie automata impotriva fraudei.

**Rezultat de afaceri:**
• Site-ul se incarca in 0.8 secunde — utilizatorii nu pleaca
• Conversie in inregistrare +40% datorita 0% pentru prima strangere
• Moderarea automata economiseste 15+ ore de munca moderator pe saptamana
• Platile sosesc in 1-2 zile in loc de 7-14 la competitori

**Ce am facut:**
• Am dezvoltat platforma de la zero in 3 luni
• Am integrat primirea platilor din 135+ tari
• Am configurat AI pentru verificarea automata a continutului
• Am facut verificarea utilizatorilor fara stocarea documentelor (important pentru GDPR)
• Am optimizat viteza la 98 puncte Google Lighthouse`,
    category: "fintech",
    categoryLabel: "FinTech / SaaS",
    image: "/images/projects/giftpool.jpg",
    video: { type: "file", src: "/images/projects/giftpool.mp4" },
    featured: true,
    technologies: [
      { name: "React 19", icon: "atom", color: "#61dafb" },
      { name: "Node.js", icon: "hexagon", color: "#339933" },
      { name: "MongoDB", icon: "database", color: "#00ed64" },
      { name: "Stripe", icon: "credit-card", color: "#635bff" },
      { name: "OpenAI", icon: "brain", color: "#10a37f" },
      { name: "TypeScript", icon: "file-code", color: "#3178c6" },
    ],
    features: [
      {
        title: "Primire plati",
        description: "Carduri, Apple Pay, Google Pay din 135+ tari",
        icon: "credit-card",
      },
      {
        title: "Plati instantanee",
        description: "Banii pe card in 1-2 zile, nu 7-14 ca la competitori",
        icon: "zap",
      },
      {
        title: "Asistent AI",
        description: "AI ajuta la crearea strangerilor si completeaza automat datele",
        icon: "sparkles",
      },
      {
        title: "Formulare fiscale",
        description: "Generare automata Form 709, 1099-K si Gift Letters pentru IRS",
        icon: "file-text",
      },
      {
        title: "Protectie AI",
        description: "Blocare automata a fraudatorilor si spamului",
        icon: "shield-check",
      },
      {
        title: "Autentificare sociala",
        description: "Intrare prin Google, Discord, WhatsApp intr-un clic",
        icon: "users",
      },
    ],
    links: {
      demo: "https://giftpool.io",
      github: "https://github.com/LegoDev94/giftpool",
    },
    metrics: [
      { label: "Scor Google", value: "98/100", icon: "gauge" },
      { label: "Timp incarcare", value: "0.8 sec", icon: "zap" },
      { label: "Tari pentru plata", value: "135+", icon: "globe" },
      { label: "Termen dezvoltare", value: "3 luni", icon: "calendar" },
    ],
    caseStudy: {
      performance: {
        score: 98,
        accessibility: 94,
        bestPractices: 100,
        seo: 100,
        fcp: "0.8s",
        lcp: "0.8s",
        tbt: "80ms",
        cls: "0.001",
        speedIndex: "1.1s",
      },
      challenge: "Clientul dorea sa lanseze o afacere in SUA, dar solutiile existente nu erau potrivite: GoFundMe percepe comisioane mari, PayPal are retragere complicata, nu exista functii specializate pentru cadouri precum documente automate pentru fisc.",
      solution: "Am creat o platforma de nisa special pentru cadouri: interfata simpla, 0% pentru prima strangere pentru atragerea utilizatorilor, plati instantanee si moderare AI care blocheaza singura fraudatorii fara interventie umana.",
      results: [
        "Site-ul se incarca in 0.8 secunde — mai rapid decat 95% din competitori",
        "0% comision pentru prima strangere a crescut conversia cu 40%",
        "Moderarea AI economiseste 15+ ore de munca pe saptamana",
        "Plati in 1-2 zile in loc de 7-14 la competitori",
        "Gata de lansare in 135+ tari fara modificari",
      ],
      userFlows: [
        {
          id: "business-model",
          title: "Cum castiga platforma",
          description: "Model de afaceri de la zero la profit",
          icon: "trending-up",
          steps: [
            { title: "Atragere", description: "Prima strangere gratuita — oamenii incearca fara risc", icon: "gift" },
            { title: "Conversie", description: "A placut? Urmatoarele strangeri cu comision 2.5%", icon: "percent" },
            { title: "Retentie", description: "Mai convenabil decat competitorii — revin din nou", icon: "repeat" },
            { title: "Viralitate", description: "Prietenii vad strangerea → isi creeaza propria", icon: "users" },
            { title: "Scalare", description: "Automatizarea permite cresterea fara angajari", icon: "rocket" },
          ],
        },
        {
          id: "user-journey",
          title: "Parcursul utilizatorului",
          description: "De la prima vizita la retragerea banilor",
          icon: "map",
          steps: [
            { title: "Creare in 2 min", description: "Ai ales categoria, ai scris descrierea, gata", icon: "edit" },
            { title: "Ai distribuit linkul", description: "WhatsApp, Telegram, retele sociale — intr-un clic", icon: "share-2" },
            { title: "Prietenii au contribuit", description: "Fara inregistrare, cu orice card din lume", icon: "credit-card" },
            { title: "Notificari", description: "Vede fiecare donatie in timp real", icon: "bell" },
            { title: "A retras pe card", description: "Banii in cont in 1-2 zile lucratoare", icon: "wallet" },
          ],
        },
        {
          id: "ai-protection",
          title: "Protectie AI impotriva fraudatorilor",
          description: "Cum inteligenta artificiala protejeaza platforma",
          icon: "shield",
          steps: [
            { title: "Verificare text", description: "AI citeste descrierea strangerii in 0.5 secunde", icon: "scan" },
            { title: "Determinare categorie", description: "Intelege automat: zi de nastere, nunta...", icon: "tag" },
            { title: "Cautare frauda", description: "Blocheaza incercarile de inselaciune si continutul interzis", icon: "alert-triangle" },
            { title: "Feedback", description: "Explica utilizatorului ce sa corecteze", icon: "message-circle" },
            { title: "Fara moderator", description: "Economiseste 15+ ore de munca manuala pe saptamana", icon: "clock" },
          ],
        },
      ],
      technicalHighlights: [
        {
          title: "Incarcare in 0.8 secunde",
          description: "Fiecare secunda de intarziere = -7% conversie. Acest site se incarca instantaneu pe orice dispozitiv, chiar si pe internet mobil lent.",
          icon: "zap",
          tags: ["Conversie +40%", "Boost SEO", "Mobile"],
        },
        {
          title: "AI in loc de moderator",
          description: "Inteligenta artificiala verifica fiecare strangere in 0.5 secunde. Blocheaza automat fraudatorii, spamul si continutul interzis — fara salariu pentru moderator.",
          icon: "brain",
          tags: ["Economie 15h/sapt", "Lucru 24/7", "Fara erori"],
        },
        {
          title: "Plati din 135+ tari",
          description: "Accepta orice carduri din lume, Apple Pay, Google Pay. Banii se retrag pe card in 1-2 zile — mai rapid decat PayPal sau GoFundMe.",
          icon: "globe",
          tags: ["Visa/MC/Amex", "Apple Pay", "Retragere rapida"],
        },
        {
          title: "Protectie date GDPR",
          description: "Legile europene cer sa nu stochezi documente utilizatori. Am facut un sistem care verifica identitatea, dar nu salveaza pasapoarte — legal curat.",
          icon: "shield",
          tags: ["GDPR ready", "Fara riscuri", "Protectie juridica"],
        },
      ],
      integrations: [
        {
          name: "Stripe",
          logo: "credit-card",
          description: "Primire plati din 135+ tari, plati instantanee",
          color: "#635bff",
        },
        {
          name: "OpenAI",
          logo: "brain",
          description: "Asistent AI pentru crearea strangerilor si moderare continut",
          color: "#10a37f",
        },
        {
          name: "Google OAuth",
          logo: "chrome",
          description: "Autentificare prin cont Google intr-un clic",
          color: "#4285f4",
        },
        {
          name: "Discord",
          logo: "message-circle",
          description: "Intrare prin Discord pentru gameri si comunitati",
          color: "#5865f2",
        },
        {
          name: "WhatsApp",
          logo: "phone",
          description: "Autentificare prin numar de telefon via WhatsApp",
          color: "#25d366",
        },
        {
          name: "Sumsub",
          logo: "shield-check",
          description: "Verificare KYC fara stocarea documentelor (GDPR)",
          color: "#00d4aa",
        },
        {
          name: "SendGrid",
          logo: "mail",
          description: "Notificari email si trimiterea formularelor fiscale",
          color: "#1a82e2",
        },
        {
          name: "IRS Forms",
          logo: "file-text",
          description: "Generare automata Form 709, 1099-K si Gift Letters",
          color: "#ff6b35",
        },
      ],
    },
  },
  {
    slug: "monopoly-lux",
    title: "Monopoly LUX",
    subtitle: "Monopoly multiplayer in browser",
    description:
      "Joc de societate clasic in browser cu multiplayer in timp real, animatii 3D ale tablei si chat vocal.",
    fullDescription: `**Ce a primit clientul:** Versiune online completa a Monopoly clasic cu multiplayer, pentru a juca cu prietenii de oriunde din lume.

**Solutia:** Dezvoltarea jocului in browser cu React si WebSocket pentru sincronizare in timp real. Animatii fluide, interfata intuitiva, chat vocal integrat.`,
    category: "games",
    categoryLabel: "Game Development",
    image: "/images/projects/monopoly.jpg",
    featured: false,
    technologies: [
      { name: "React 18", icon: "atom", color: "#61dafb" },
      { name: "Zustand", icon: "database", color: "#ff9900" },
      { name: "WebSocket", icon: "wifi", color: "#00ff00" },
      { name: "TypeScript", icon: "file-code", color: "#3178c6" },
    ],
    features: [
      {
        title: "Multiplayer in timp real",
        description: "Sincronizare perfecta intre jucatori",
        icon: "users",
      },
      {
        title: "Chat vocal",
        description: "Vorbeste cu prietenii in timpul jocului",
        icon: "mic",
      },
      {
        title: "Animatii 3D",
        description: "Tabla si pionii animati frumos",
        icon: "box",
      },
    ],
    links: {},
    metrics: [
      { label: "Jucatori simultan", value: "8", icon: "users" },
      { label: "Timp partida", value: "30-60min", icon: "clock" },
    ],
  },
  {
    slug: "mubarakway",
    title: "MubarakWay",
    subtitle: "Telegram Mini App pentru educatie islamica",
    description:
      "Mini aplicatie Telegram pentru invatarea rugaciunilor si traditiilor islamice cu gamificare si continut audio.",
    fullDescription: `**Ce a primit clientul:** O mini aplicatie in Telegram pentru invatarea rugaciunilor si traditiilor islamice, cu interfata gamificata care motiveaza utilizatorii sa invete zilnic.

**Solutia:** Am dezvoltat o Mini App Telegram completa cu React, integrare audio pentru pronuntie, sistem de progresie cu realizari si notificari pentru rugaciuni.`,
    category: "mobile",
    categoryLabel: "Telegram Mini App",
    image: "/images/projects/mubarakway.jpg",
    featured: true,
    technologies: [
      { name: "React 18", icon: "atom", color: "#61dafb" },
      { name: "Telegram API", icon: "send", color: "#0088cc" },
      { name: "Node.js", icon: "hexagon", color: "#339933" },
      { name: "MongoDB", icon: "database", color: "#00ed64" },
    ],
    features: [
      {
        title: "Continut audio",
        description: "Pronuntie corecta pentru fiecare rugaciune",
        icon: "volume-2",
      },
      {
        title: "Gamificare",
        description: "Realizari, niveluri si statistici",
        icon: "trophy",
      },
      {
        title: "Notificari",
        description: "Memento-uri pentru timpurile de rugaciune",
        icon: "bell",
      },
      {
        title: "Offline",
        description: "Functioneaza si fara internet",
        icon: "wifi-off",
      },
    ],
    links: {
      telegram: "https://t.me/mubarakway_bot",
    },
    metrics: [
      { label: "Utilizatori activi", value: "5K+", icon: "users" },
      { label: "Lectii", value: "50+", icon: "book" },
      { label: "Rating", value: "4.9", icon: "star" },
    ],
    caseStudy: {
      challenge: "Clientul dorea o aplicatie care sa ajute musulmanii sa invete rugaciunile in mod corect, cu pronuntie audio si motivare prin gamificare.",
      solution: "Am creat o Telegram Mini App cu lectii audio, sistem de progresie cu realizari si memento-uri pentru timpurile de rugaciune. Aplicatia functioneaza si offline.",
      results: [
        "5000+ utilizatori activi in primele 3 luni",
        "Rating 4.9 din 5 de la utilizatori",
        "50+ lectii de rugaciuni cu audio",
        "Functioneaza offline pentru accesibilitate maxima",
      ],
    },
  },
  {
    slug: "vibe-taxi",
    title: "Vibe Taxi",
    subtitle: "Serviciu de taxi pentru Moldova",
    description:
      "Platforma completa de taxi cu aplicatie sofer, panou de dispecerizare si sistem de comenzi automate.",
    fullDescription: `**Ce a primit clientul:** Un serviciu complet de taxi pentru piata moldoveneasca: aplicatie mobila pentru soferi, panou web pentru dispeceri, sistem automat de distribuire comenzi.

**Solutia:** Am dezvoltat o platforma cu Next.js pentru web, aplicatie React Native pentru soferi, backend Fastify cu baza de date PostgreSQL.`,
    category: "enterprise",
    categoryLabel: "Enterprise",
    image: "/images/projects/vibe-taxi.jpg",
    featured: false,
    technologies: [
      { name: "Next.js", icon: "triangle", color: "#000000" },
      { name: "Fastify", icon: "zap", color: "#000000" },
      { name: "PostgreSQL", icon: "database", color: "#336791" },
      { name: "React Native", icon: "smartphone", color: "#61dafb" },
    ],
    features: [
      {
        title: "Aplicatie sofer",
        description: "Primire comenzi, navigatie, statistici",
        icon: "smartphone",
      },
      {
        title: "Panou dispecer",
        description: "Gestionare comenzi si soferi in timp real",
        icon: "monitor",
      },
      {
        title: "GPS tracking",
        description: "Localizare soferi in timp real",
        icon: "map-pin",
      },
      {
        title: "Plati integrate",
        description: "Card si numerar",
        icon: "credit-card",
      },
    ],
    links: {},
    metrics: [
      { label: "Curse/zi", value: "500+", icon: "car" },
      { label: "Soferi", value: "50+", icon: "users" },
      { label: "Timp raspuns", value: "<3 min", icon: "clock" },
    ],
  },
];

// Re-export all projects (use this for locale-based selection)
export default projectsRo;
