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
  // Project 6: 404-dispatch
  {
    slug: "404-dispatch",
    title: "404 Dispatch",
    subtitle: "Sistem CRM pentru Dispecerat",
    description:
      "Sistem CRM pentru companie de transport: gestionarea soferilor, incarcaturilor, contabilitate.",
    fullDescription: `404 Dispatch — sistem CRM B2B pentru gestionarea companiei de transport. Suporta 3 roluri de utilizatori: Admin, Dispecer, Contabil.

Functionalitatea include gestionarea soferilor (documente, fotografii prin Cloudinary), incarcaturi cu calendar, sistem contabil cu calculul procentelor si rapoarte saptamanale.

Este integrat un asistent AI bazat pe OpenAI pentru traducere si generarea raspunsurilor, export rapoarte in PDF.`,
    category: "enterprise",
    categoryLabel: "Enterprise / CRM",
    image: "/images/projects/404-dispatch.jpg",
    technologies: [
      { name: "Next.js 16", icon: "triangle", color: "#ffffff" },
      { name: "MongoDB", icon: "database", color: "#00ed64" },
      { name: "Cloudinary", icon: "cloud", color: "#3448c5" },
      { name: "OpenAI", icon: "brain", color: "#00ff00" },
      { name: "shadcn/ui", icon: "component", color: "#ffffff" },
    ],
    features: [
      {
        title: "3 roluri",
        description: "Admin, Dispecer, Contabil",
        icon: "users",
      },
      {
        title: "Gestionare incarcaturi",
        description: "Calendar si statusuri livrari",
        icon: "truck",
      },
      {
        title: "Contabilitate",
        description: "Calcul salarii si rapoarte",
        icon: "calculator",
      },
      {
        title: "Asistent AI",
        description: "Traducere si generare raspunsuri",
        icon: "brain",
      },
    ],
    links: {
      github: "https://github.com/LegoDev94/404dispatch",
    },
    metrics: [
      { label: "Roluri", value: "3", icon: "users" },
      { label: "API endpoints", value: "20+", icon: "server" },
    ],
  },
  // Project 7: exchanger-pmr
  {
    slug: "exchanger-pmr",
    title: "Exchanger PMR",
    subtitle: "Schimb valutar P2P",
    description:
      "Platforma P2P de schimb valutar ca Telegram Mini App. Tranzactii in timp real, ratinguri, recenzii.",
    fullDescription: `Exchanger PMR — platforma P2P pentru schimb valutar in regiunea PMR, realizata ca Telegram Mini App cu versiune web.

Utilizatorii pot crea oferte de schimb, cauta cu filtre dupa valute, sume si zone. Sistem de tranzactii cu ratinguri si recenzii.

Actualizari in timp real prin Socket.IO, autentificare prin Telegram Web App API.`,
    category: "fintech",
    categoryLabel: "FinTech",
    image: "/images/projects/exchanger-pmr.jpg",
    technologies: [
      { name: "Vue 3", icon: "vuejs", color: "#42b883" },
      { name: "Express", icon: "hexagon", color: "#ffffff" },
      { name: "PostgreSQL", icon: "database", color: "#336791" },
      { name: "Socket.IO", icon: "wifi", color: "#ffffff" },
      { name: "Telegraf", icon: "send", color: "#0088cc" },
    ],
    features: [
      {
        title: "Schimb P2P",
        description: "Creare si cautare oferte",
        icon: "repeat",
      },
      {
        title: "Timp real",
        description: "Socket.IO pentru actualizari instantanee",
        icon: "wifi",
      },
      {
        title: "Telegram Mini App",
        description: "Integrare cu Telegram",
        icon: "send",
      },
      {
        title: "Ratinguri",
        description: "Sistem de recenzii si reputatie",
        icon: "star",
      },
    ],
    links: {
      github: "https://github.com/LegoDev94/exchanger_pmr",
    },
  },
  // Project 8: fns-tg-scan
  {
    slug: "fns-tg-scan",
    title: "FNS TG Scan",
    subtitle: "Scanner de bonuri QR",
    description:
      "Telegram Mini App pentru scanarea bonurilor: coduri QR si recunoastere text OCR.",
    fullDescription: `FNS TG Scan — Telegram Mini App pentru scanarea si recunoasterea bonurilor. Suporta scanarea codurilor QR prin camera si recunoasterea textului OCR din fotografii.

Foloseste jsQR pentru decodarea QR si Tesseract.js pentru OCR. Datele din bonuri pot fi folosite pentru evidenta cheltuielilor.`,
    category: "automation",
    categoryLabel: "Automatizare",
    image: "/images/projects/fns-tg-scan.jpg",
    technologies: [
      { name: "Vue 3", icon: "vuejs", color: "#42b883" },
      { name: "TypeScript", icon: "file-code", color: "#3178c6" },
      { name: "Tesseract.js", icon: "scan", color: "#ffffff" },
      { name: "jsQR", icon: "qr-code", color: "#ffffff" },
      { name: "Telegram SDK", icon: "send", color: "#0088cc" },
    ],
    features: [
      {
        title: "Scanner QR",
        description: "Scanare prin camera",
        icon: "qr-code",
      },
      {
        title: "OCR",
        description: "Recunoastere text din fotografii",
        icon: "scan",
      },
      {
        title: "Telegram Mini App",
        description: "Integrare cu Telegram SDK",
        icon: "send",
      },
    ],
    links: {
      github: "https://github.com/LegoDev94/fns-tg-scan",
    },
  },
  // Project 9: kmo24
  {
    slug: "kmo24",
    title: "KMO24",
    subtitle: "Piata de echipamente pentru restaurante",
    description:
      "Magazin online de echipamente second-hand pentru cafenele si restaurante cu integrare 1C, calcul livrare si generare PDF.",
    fullDescription: `KMO24 — magazin online modern de echipamente profesionale second-hand pentru cafenele si restaurante in Krasnoyarsk. Solutie full-stack cu SSR si panou admin bogat.

Proiectul include Backend complet pe Express.js + MongoDB si Frontend pe Nuxt.js 3 cu SSR pentru optimizare SEO.

🛒 **Functionalitati cheie:**
- Integrare cu 1C:Service pentru sincronizare produse si stocuri
- Calcul livrare prin API Delovye Linii si PEK
- Generare automata PDF oferte comerciale
- Integrare cu Telegram pentru publicarea stirilor
- Sistem de recenzii cu moderare si ratinguri
- Redis caching pentru performanta ridicata
- Panou admin complet cu sistem ACL de permisiuni`,
    category: "enterprise",
    categoryLabel: "E-commerce / HoReCa",
    image: "/images/projects/kmo24.jpg",
    video: { type: "file", src: "/images/projects/kmo24.mp4" },
    featured: true,
    technologies: [
      { name: "Nuxt.js 3", icon: "triangle", color: "#00dc82" },
      { name: "Vue 3", icon: "vuejs", color: "#42b883" },
      { name: "Express.js", icon: "hexagon", color: "#ffffff" },
      { name: "MongoDB", icon: "database", color: "#00ed64" },
      { name: "Redis", icon: "database", color: "#dc382d" },
      { name: "TypeScript", icon: "file-code", color: "#3178c6" },
    ],
    features: [
      {
        title: "Integrare cu 1C",
        description: "Sincronizare automata produse si comenzi",
        icon: "refresh-cw",
      },
      {
        title: "Calcul livrare",
        description: "API Delovye Linii si PEK",
        icon: "truck",
      },
      {
        title: "Generare PDF",
        description: "Oferte comerciale",
        icon: "file-text",
      },
      {
        title: "Panou admin",
        description: "CMS complet cu ACL",
        icon: "settings",
      },
    ],
    links: {
      demo: "https://kmo24-frontend.onrender.com",
      github: "https://github.com/LegoDev94/kmo24",
    },
    metrics: [
      { label: "Produse", value: "500+", icon: "package" },
      { label: "Timp incarcare", value: "1.2 sec", icon: "zap" },
      { label: "Integratii", value: "5+", icon: "plug" },
      { label: "Termen dezvoltare", value: "2.5 luni", icon: "calendar" },
    ],
    caseStudy: {
      performance: {
        score: 92,
        accessibility: 95,
        bestPractices: 96,
        seo: 100,
        fcp: "1.0s",
        lcp: "1.2s",
        tbt: "120ms",
        cls: "0.01",
        speedIndex: "1.4s",
      },
      challenge: "Clientul avea nevoie de un magazin online modern de echipamente second-hand pentru HoReCa in Krasnoyarsk. Problema principala — gestionarea manuala a produselor in 1C si pe site separat, duplicare munca. De asemenea era necesar calculul livrarii echipamentelor voluminoase in toata Rusia.",
      solution: "Am creat un magazin online pe Nuxt.js 3 cu integrare completa 1C: produsele, stocurile si preturile se sincronizeaza automat. Am conectat API-ul a doua companii de transport pentru calculul exact al livrarii. Am adaugat generare automata PDF oferte comerciale pentru clientii angro.",
      results: [
        "Produsele se sincronizeaza cu 1C automat — 0 munca manuala",
        "Calcul livrare in toata Rusia in 2 secunde in loc de apel la manager",
        "Ofertele comerciale PDF se genereaza in 3 secunde",
        "Stirile se publica simultan pe site si in Telegram",
        "Optimizare SEO: 100 puncte Google Lighthouse",
        "Panoul admin permite gestionarea fara dezvoltator",
      ],
    },
  },
  // Project 10: betanalitics
  {
    slug: "betanalitics",
    title: "BetAnalitics",
    subtitle: "Platforma de analiza sportiva AI",
    description:
      "Platforma de analiza AI a evenimentelor sportive: Claude + Computer Use pentru cautare autonoma de date, 50+ ligi, sistem de calibrare a preciziei prognozelor.",
    fullDescription: `**Ce a primit clientul:** O platforma analitica completa pentru prognoze sportive cu AI, care cauta singura informatii actuale pe internet si invata din greseli.

**Problema:** Serviciile existente de prognoze folosesc date invechite si nu isi urmaresc precizia. Utilizatorii nu inteleg cat de mult pot avea incredere intr-un prognostic.

**Solutia:** Am creat un sistem cu doua caracteristici unice: 1) Claude Computer Use — AI deschide singur browserul si cauta coeficienti actuali, accidentari, stiri inainte de analiza. 2) Sistem de calibrare — platforma urmareste precizia prognozelor pe ligi si corecteaza increderea pe baza datelor istorice.

**Executie tehnica:**
• 4 sporturi prin API-Sports: fotbal (50+ ligi), baschet, hochei, tenis
• Claude Sonnet 4 cu fallback pe OpenAI GPT-4 pentru analiza
• Computer Use prin Puppeteer — Claude controleaza autonom browserul
• Progres analiza in timp real prin Socket.IO cu loguri detaliate
• Sistem de abonamente cu program de referral (cod "1WIN")
• Accuracy tracking: calibrare incredere pe date istorice`,
    category: "fintech",
    categoryLabel: "Sports Tech / AI",
    image: "/images/projects/betanalitics.jpg",
    video: { type: "file", src: "/images/projects/betanalitics.mp4" },
    featured: true,
    technologies: [
      { name: "Vue.js 3", icon: "vuejs", color: "#42b883" },
      { name: "Claude AI", icon: "brain", color: "#00ffff" },
      { name: "Node.js", icon: "hexagon", color: "#339933" },
      { name: "MongoDB", icon: "database", color: "#00ed64" },
      { name: "Socket.IO", icon: "wifi", color: "#ffffff" },
      { name: "Puppeteer", icon: "chrome", color: "#4285f4" },
    ],
    features: [
      {
        title: "Computer Use",
        description: "Claude cauta singur date in browser",
        icon: "monitor",
      },
      {
        title: "4 sporturi",
        description: "Fotbal 50+ ligi, baschet, hochei, tenis",
        icon: "trophy",
      },
      {
        title: "Calibrare precizie",
        description: "Sistemul invata din prognozele sale",
        icon: "target",
      },
      {
        title: "Progres timp real",
        description: "Loguri Socket.IO pentru fiecare pas al analizei",
        icon: "activity",
      },
      {
        title: "AI dublu",
        description: "Claude Sonnet 4 + OpenAI GPT-4 fallback",
        icon: "brain",
      },
      {
        title: "Abonamente",
        description: "4 tarife cu program referral",
        icon: "credit-card",
      },
    ],
    links: {
      github: "https://github.com/LegoDev94/betanalitics",
    },
    metrics: [
      { label: "Ligi", value: "50+", icon: "trophy" },
      { label: "Servicii", value: "20+", icon: "server" },
      { label: "API calls/zi", value: "75K", icon: "activity" },
      { label: "Modele MongoDB", value: "6", icon: "database" },
    ],
    caseStudy: {
      challenge: "Clientul avea nevoie de o platforma de analiza sportiva care foloseste cele mai actuale date si arata sincer precizia sa. Solutiile existente lucreaza pe statistici invechite si nu urmaresc calitatea prognozelor.",
      solution: "Am dezvoltat un sistem cu Claude Computer Use — AI deschide autonom browserul, cauta coeficienti actuali, accidentari si stiri inainte de fiecare analiza. Plus sistem unic de calibrare: platforma urmareste precizia pentru fiecare liga si corecteaza nivelul de incredere pe baza datelor istorice.",
      results: [
        "Claude Computer Use cauta automat date actuale inainte de analiza",
        "Sistemul de calibrare creste precizia prognozelor cu 15-20%",
        "50+ ligi de fotbal + baschet, hochei, tenis prin API-Sports",
        "Socket.IO timp real arata fiecare pas al analizei cu loguri",
        "AI dublu: Claude Sonnet 4 cu fallback automat pe GPT-4",
        "Sistem de abonamente pe 4 niveluri cu program referral",
      ],
    },
  },
  // Project 11: neoproxy
  {
    slug: "neoproxy",
    title: "NeoProxy",
    subtitle: "SaaS de gestionare proxy",
    description:
      "Panou SaaS de gestionare serviciu proxy: monitorizare modem-uri USB, rotatie IP, billing cu abonamente si analiza veniturilor.",
    fullDescription: `NeoProxy — platforma SaaS completa pentru gestionarea serviciului proxy bazat pe modem-uri USB. Include cont personal utilizator, panou admin si landing public.

Utilizatorii isi gestioneaza proxy-urile: vad statusul modem-urilor, controleaza traficul (download/upload), configureaza rotatia automata IP la intervale. Dashboard-ul arata statistici de utilizare bandwidth si activitate proxy.

Sistem de billing cu 3 planuri tarifare (Basic, Professional, Enterprise), atasare carduri Visa/Mastercard/PayPal, istoric plati si descarcare facturi.

Panoul admin include: gestionare utilizatori, configurare planuri tarifare, analiza veniturilor cu grafice dinamica venituri pe perioade, loguri API pentru debug integratii clienti.`,
    category: "enterprise",
    categoryLabel: "SaaS / Infrastructura",
    image: "/images/projects/neoproxy.jpg",
    video: { type: "file", src: "/images/projects/neoproxy/demo.mp4" },
    technologies: [
      { name: "Vue.js 3", icon: "vuejs", color: "#42b883" },
      { name: "Pinia", icon: "layers", color: "#ffd859" },
      { name: "Vue Router", icon: "navigation", color: "#42b883" },
      { name: "Tailwind CSS", icon: "wind", color: "#06b6d4" },
      { name: "Chart.js", icon: "bar-chart", color: "#ff6384" },
      { name: "Vite", icon: "zap", color: "#646cff" },
      { name: "Axios", icon: "wifi", color: "#5a29e4" },
      { name: "HeadlessUI", icon: "component", color: "#66e3ff" },
    ],
    features: [
      {
        title: "Modem-uri USB",
        description: "Monitorizare modem-uri LTE cu rotatie IP",
        icon: "smartphone",
      },
      {
        title: "Dashboard",
        description: "Grafice bandwidth si activitate",
        icon: "bar-chart",
      },
      {
        title: "Billing",
        description: "3 tarife, carduri, PayPal, facturi",
        icon: "credit-card",
      },
      {
        title: "Analiza venituri",
        description: "Dinamica venituri, retention rate",
        icon: "trending-up",
      },
      {
        title: "Gestionare planuri",
        description: "CRUD pentru planuri tarifare",
        icon: "settings",
      },
      {
        title: "Loguri API",
        description: "Debug integratii clienti",
        icon: "file-text",
      },
    ],
    links: {
      github: "https://github.com/LegoDev94/neoproxy",
    },
    metrics: [
      { label: "Pagini", value: "27", icon: "layout-grid" },
      { label: "Roluri", value: "3", icon: "users" },
      { label: "Componente", value: "30+", icon: "component" },
    ],
    caseStudy: {
      challenge: "Clientul avea nevoie de un panou de control pentru serviciul proxy bazat pe modem-uri USB LTE. Era necesar ciclul complet: de la monitorizarea modem-urilor si traficului pana la sistemul de billing cu abonamente si panoul admin cu analiza pentru urmarirea veniturilor business-ului.",
      solution: "Am dezvoltat SPA pe Vue 3 cu arhitectura feature-based: 3 layout-uri (public, auth, dashboard), Pinia store pentru state management, Chart.js pentru vizualizarea datelor. Am implementat sistem de roluri (user, admin, superadmin), sistem complet de billing cu atasare carduri si PayPal, analiza detaliata venituri cu export in CSV.",
      results: [
        "27 pagini aplicatie cu 3 layout-uri diferite",
        "Monitorizare timp real 8+ modem-uri USB cu afisare signal strength",
        "Sistem billing: 3 tarife, Visa/Mastercard/PayPal, istoric plati",
        "Analiza venituri cu grafice pe 7/30/90/365 zile",
        "Export date in CSV pentru contabilitate",
        "Adaptare mobila pentru toate paginile",
      ],
    },
  },
  // Project 12: fancy-app
  {
    slug: "fancy-app",
    title: "Fancy Dating",
    subtitle: "Aplicatie premium de dating",
    description:
      "Aplicatie cross-platform de dating pe Flutter cu chat timp real, sistem de matching, albume private si monetizare prin abonamente.",
    fullDescription: `**Fancy** — aplicatie premium de dating cu focus pe calitatea profilelor, securitate si monetizare. Construita pe Flutter pentru functionare pe Android, iOS si Web dintr-o singura baza de cod.

## Arhitectura proiectului

Aplicatia este construita pe **Clean Architecture** cu **structura Feature-Based** — fiecare modul functional (auth, home, chats, albums, settings) este complet izolat cu propriile straturi domain si presentation.

**State Management** este realizat prin **Riverpod** cu code generation — aceasta asigura stare type-safe fara BuildContext si actualizare automata UI la schimbarea datelor.

## Solutii tehnice cheie

**Subscriptii timp real** — Supabase Realtime channels asigura livrare instantanee mesaje, notificari despre like-uri si match-uri. RealtimeService gestioneaza subscriptiile si previne duplicarea notificarilor pentru chat-uri deschise.

**Geolocatie privacy-preserving** — distanta pana la utilizatori se calculeaza cu formula Haversine, dar pentru protejarea confidentialitatii se aplica distance fuzzing (±1 km) cu hashing consistent pentru fiecare utilizator.

**Sistem media private** — albumele suporta timed viewing (limitare timp vizualizare), one-time view (vizualizare unica) si sistem de cereri acces pentru continut privat.

## Monetizare

Sistem complet de monetizare implementat:
- **Abonamente**: Trial (7 zile), Weekly ($5), Monthly ($10), Yearly ($25)
- **Consumables**: Super Likes (1/10/50), Invisible Mode (7/30 zile)
- **Program referral**: zile premium pentru utilizatori invitati

Functii Premium: like-uri nelimitate, vezi cine ti-a dat like, filtre extinse, albume private, video in profil, mod incognito.

## Securitate

- Politici Row-Level Security (RLS) in PostgreSQL
- Utilizatorii blocati sunt exclusi din afisare la nivel de BD
- Soft deletes pentru chat-uri cu pastrarea istoricului
- Sistem verificare profile cu panou admin`,
    category: "mobile",
    categoryLabel: "Social / Dating",
    image: "/images/projects/fancy-app.png",
    technologies: [
      { name: "Flutter", icon: "smartphone", color: "#02569b" },
      { name: "Dart", icon: "code", color: "#0175c2" },
      { name: "Supabase", icon: "database", color: "#3ecf8e" },
      { name: "Firebase", icon: "flame", color: "#ffca28" },
      { name: "Riverpod", icon: "layers", color: "#00d1b2" },
      { name: "PostgreSQL", icon: "database", color: "#336791" },
      { name: "GoRouter", icon: "navigation", color: "#00b4d8" },
      { name: "IAP", icon: "credit-card", color: "#ff6b6b" },
    ],
    features: [
      {
        title: "Chat timp real",
        description: "Text, voce, media, GIF, stickere",
        icon: "message-circle",
      },
      {
        title: "Matching",
        description: "Like-uri, Super Likes, filtre",
        icon: "heart",
      },
      {
        title: "Albume private",
        description: "Timed viewing, one-time view",
        icon: "lock",
      },
      {
        title: "Abonamente",
        description: "Trial, Weekly, Monthly, Yearly",
        icon: "crown",
      },
      {
        title: "Geolocatie",
        description: "Cautare aproape cu privacy fuzzing",
        icon: "map-pin",
      },
      {
        title: "Notificari push",
        description: "FCM + Local Notifications",
        icon: "bell",
      },
    ],
    links: {
      github: "https://github.com/LegoDev94/fancy-app",
    },
    metrics: [
      { label: "Platforme", value: "3", icon: "smartphone" },
      { label: "Ecrane", value: "40+", icon: "layout" },
      { label: "Module", value: "8", icon: "package" },
      { label: "Limbi", value: "2", icon: "globe" },
    ],
    caseStudy: {
      challenge: "Crearea unei aplicatii premium de dating cu functii timp real, sistem de monetizare si protejarea confidentialitatii utilizatorilor pe trei platforme dintr-o singura baza de cod.",
      solution: "Am dezvoltat aplicatie Flutter cross-platform cu Clean Architecture, backend Supabase timp real, sistem de abonamente prin In-App Purchases si geolocatie privacy-preserving cu distance fuzzing.",
      results: [
        "3 platforme (Android, iOS, Web) din cod unic",
        "Livrare mesaje timp real < 100ms",
        "4 planuri abonament + consumables",
        "40+ ecrane cu sistem de design unitar",
      ],
    },
  },
  // Project 13: akbarov
  {
    slug: "akbarov",
    title: "Dr. Akbarov",
    subtitle: "Landing page medical",
    description:
      "Landing pentru doctor de medicina sportiva cu galerie, video si formular de cerere.",
    fullDescription: `Site-ul oficial al doctorului Rinat Fagimovich Akbarov — specialist in medicina sportiva, reabilitare si longevitate.

Site modern single-page cu animatii fluide, design adaptiv si integrare formulare de contact.

🏥 **Continut:**
- Biografie profesionala si experienta de lucru
- Directii de activitate si metode de sanatate
- Galerie imagini si prezentari video
- Informatii de contact si formular de cerere
- Adaptivitate completa pentru dispozitive mobile
- Optimizare pentru motoare de cautare`,
    category: "enterprise",
    categoryLabel: "Healthcare / Landing",
    image: "/images/projects/akbarov.jpg",
    technologies: [
      { name: "HTML5", icon: "code", color: "#e34f26" },
      { name: "CSS3", icon: "palette", color: "#1572b6" },
      { name: "JavaScript", icon: "file-code", color: "#f7df1e" },
      { name: "GitHub Pages", icon: "github", color: "#ffffff" },
    ],
    features: [
      {
        title: "Animatii",
        description: "Efecte CSS moderne",
        icon: "sparkles",
      },
      {
        title: "Galerie",
        description: "Materiale foto si video",
        icon: "image",
      },
      {
        title: "Formular cerere",
        description: "Fereastra modala de programare",
        icon: "mail",
      },
      {
        title: "SEO",
        description: "Optimizare pentru cautare",
        icon: "search",
      },
    ],
    links: {
      demo: "https://mainlego.github.io/akbarov/",
      github: "https://github.com/LegoDev94/akbarov",
    },
    metrics: [
      { label: "Sectiuni", value: "6", icon: "layout-grid" },
      { label: "Incarcare", value: "<2s", icon: "zap" },
    ],
  },
  // Project 14: fitness-tracker
  {
    slug: "fitness-tracker",
    title: "FitPulse",
    subtitle: "Antrenor fitness AI",
    description:
      "Tracker fitness cu antrenor AI: programe personalizate, urmarire progres, integrare cu dispozitive purtabile.",
    fullDescription: `FitPulse — asistent fitness inteligent cu recomandari AI-powered. Generare programe personalizate de antrenament pe baza obiectivelor si nivelului de pregatire.

Integrare cu Apple Health, Google Fit, Garmin pentru colectarea automata a datelor de activitate. Urmarire nutritie cu recunoastere produse din fotografie.

Functii sociale: provocari cu prietenii, clasamente, partajare realizari.`,
    category: "mobile",
    categoryLabel: "Health & Fitness",
    image: "/images/projects/fitness-tracker.jpg",
    technologies: [
      { name: "React Native", icon: "smartphone", color: "#61dafb" },
      { name: "OpenAI", icon: "brain", color: "#00ff00" },
      { name: "HealthKit", icon: "heart", color: "#ff2d55" },
      { name: "Firebase", icon: "flame", color: "#ffca28" },
      { name: "TensorFlow", icon: "brain", color: "#ff6f00" },
    ],
    features: [
      {
        title: "Antrenor AI",
        description: "Programe personalizate",
        icon: "brain",
      },
      {
        title: "Integratii",
        description: "Apple Health, Garmin, Fitbit",
        icon: "watch",
      },
      {
        title: "Nutritie",
        description: "Recunoastere mancare din foto",
        icon: "utensils",
      },
      {
        title: "Social",
        description: "Provocari si clasamente",
        icon: "users",
      },
    ],
    links: {
      github: "https://github.com/LegoDev94/fitpulse",
    },
    metrics: [
      { label: "Exercitii", value: "500+", icon: "dumbbell" },
      { label: "Integratii", value: "8", icon: "plug" },
    ],
  },
  // Project 15: e-learning-platform
  {
    slug: "e-learning-platform",
    title: "LearnHub",
    subtitle: "Platforma de invatare online",
    description:
      "Platforma educationala cu videocursuri, sarcini interactive si certificate.",
    fullDescription: `LearnHub — platforma LMS pentru educatie online. Creare si vanzare cursuri cu lectii video, materiale text si sarcini interactive.

Sistem de progres cu gamificare: XP, niveluri, insigne. Generare automata certificate la finalizarea cursului.

Player video incorporat cu notite si semne de carte, editor de cod pentru sarcini practice de programare.`,
    category: "enterprise",
    categoryLabel: "EdTech",
    image: "/images/projects/e-learning-platform.jpg",
    technologies: [
      { name: "Next.js 15", icon: "triangle", color: "#ffffff" },
      { name: "Prisma", icon: "database", color: "#5a67d8" },
      { name: "Stripe", icon: "credit-card", color: "#635bff" },
      { name: "Mux", icon: "video", color: "#ff2d55" },
      { name: "Monaco Editor", icon: "code", color: "#007acc" },
    ],
    features: [
      {
        title: "Videocursuri",
        description: "Streaming HLS prin Mux",
        icon: "video",
      },
      {
        title: "Editor cod",
        description: "Monaco pentru practica",
        icon: "code",
      },
      {
        title: "Certificate",
        description: "Generare automata PDF",
        icon: "award",
      },
      {
        title: "Gamificare",
        description: "XP, niveluri, insigne",
        icon: "trophy",
      },
    ],
    links: {
      demo: "https://learnhub.metabyte.dev",
      github: "https://github.com/LegoDev94/learnhub",
    },
    metrics: [
      { label: "Cursuri", value: "100+", icon: "book-open" },
      { label: "Studenti", value: "5K+", icon: "users" },
    ],
  },
  // Project 16: restaurant-pos
  {
    slug: "restaurant-pos",
    title: "QuickServe POS",
    subtitle: "Sistem de management restaurant",
    description:
      "Sistem POS pentru restaurante: comenzi, bucatarie, depozit, analiza intr-o solutie unica.",
    fullDescription: `QuickServe POS — sistem complex de gestionare restaurant. Primire comenzi prin tableta ospatar, KDS (Kitchen Display System) pentru bucatarie.

Gestionare depozit cu deducere automata ingrediente, notificari stocuri mici. Integrare cu case de marcat fiscale si acquiring.

Analiza timp real: venituri, nota medie, feluri populare, incarcare pe ore.`,
    category: "enterprise",
    categoryLabel: "HoReCa",
    image: "/images/projects/restaurant-pos.jpg",
    technologies: [
      { name: "React", icon: "atom", color: "#61dafb" },
      { name: "Node.js", icon: "hexagon", color: "#339933" },
      { name: "PostgreSQL", icon: "database", color: "#336791" },
      { name: "Socket.IO", icon: "wifi", color: "#ffffff" },
      { name: "Electron", icon: "monitor", color: "#47848f" },
    ],
    features: [
      {
        title: "Comenzi",
        description: "Tableta ospatar",
        icon: "clipboard-list",
      },
      {
        title: "KDS",
        description: "Ecran pentru bucatarie",
        icon: "chef-hat",
      },
      {
        title: "Depozit",
        description: "Deducere automata si stocuri",
        icon: "package",
      },
      {
        title: "Analiza",
        description: "Dashboard-uri in timp real",
        icon: "bar-chart",
      },
    ],
    links: {
      github: "https://github.com/LegoDev94/quickserve-pos",
    },
    metrics: [
      { label: "Localuri", value: "50+", icon: "store" },
      { label: "Comenzi/zi", value: "10K+", icon: "receipt" },
    ],
  },
  // Project 17: social-scheduler
  {
    slug: "social-scheduler",
    title: "PostFlow",
    subtitle: "Planificator social media",
    description:
      "Planificator postari pentru retele sociale cu generare continut AI si analiza.",
    fullDescription: `PostFlow — instrument de gestionare retele sociale. Planificare si autopostare in Instagram, Twitter, LinkedIn, Telegram.

Asistent AI pentru generare texte, hashtag-uri si timp optim de publicare. Calendar vizual continut cu drag-and-drop.

Analiza detaliata: acoperire, engagement, crestere urmaritori. Lucru in echipa cu roluri si aprobare postari.`,
    category: "automation",
    categoryLabel: "Marketing",
    image: "/images/projects/social-scheduler.jpg",
    technologies: [
      { name: "Next.js 15", icon: "triangle", color: "#ffffff" },
      { name: "OpenAI", icon: "brain", color: "#00ff00" },
      { name: "Bull", icon: "clock", color: "#ff6b6b" },
      { name: "Redis", icon: "database", color: "#dc382d" },
      { name: "PostgreSQL", icon: "database", color: "#336791" },
    ],
    features: [
      {
        title: "Autopostare",
        description: "5 retele sociale dintr-un loc",
        icon: "share-2",
      },
      {
        title: "Continut AI",
        description: "Generare texte si hashtag-uri",
        icon: "brain",
      },
      {
        title: "Calendar",
        description: "Planificare vizuala",
        icon: "calendar",
      },
      {
        title: "Analiza",
        description: "Statistici si rapoarte",
        icon: "bar-chart-2",
      },
    ],
    links: {
      demo: "https://postflow.metabyte.dev",
      github: "https://github.com/LegoDev94/postflow",
    },
    metrics: [
      { label: "Retele sociale", value: "5", icon: "share-2" },
      { label: "Postari/luna", value: "100K+", icon: "file-text" },
    ],
  },
];

// Re-export all projects (use this for locale-based selection)
export default projectsRo;
