/**
 * Add Proper Romanian Translations
 * Updates all user flows and technical highlights with proper Romanian translations
 *
 * Usage: npx tsx scripts/add-romanian-translations.ts
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Romanian translations for each project's user flows and technical highlights
const romanianTranslations: Record<string, {
  userFlows: Array<{
    title: string;
    description: string;
    steps: Array<{ title: string; description: string }>;
  }>;
  technicalHighlights: Array<{
    title: string;
    description: string;
    tags: string[];
  }>;
}> = {
  "wasteland-arena": {
    userFlows: [
      {
        title: "Ciclul de joc",
        description: "De la lansare la victorie",
        steps: [
          { title: "Lansare in browser", description: "Ai deschis linkul — jocul s-a incarcat in 3 secunde" },
          { title: "Alegere erou", description: "8 personaje cu abilitati unice" },
          { title: "Cautare meci", description: "Matchmaking-ul uneste jucatorii dupa skill" },
          { title: "Gameplay", description: "Tragere, abilitati, munca in echipa" },
          { title: "Victorie si recompense", description: "XP, niveluri, deblocare continut nou" },
        ],
      },
      {
        title: "Sincronizare retea",
        description: "Cum se obtine multiplayer fluid",
        steps: [
          { title: "Input jucator", description: "WASD/joystick → reactie locala instantanee" },
          { title: "Client prediction", description: "Clientul prezice miscarea inainte de raspunsul serverului" },
          { title: "Trimitere la server", description: "Comanda pleaca prin WebSocket la fiecare 33ms" },
          { title: "Verificare autoritativa", description: "Serverul valideaza si actualizeaza starea" },
          { title: "Reconciliere", description: "Clientul corecteaza pozitia conform serverului" },
        ],
      },
      {
        title: "Sistem modular de eroi",
        description: "Cum adaugi un personaj nou in 30 minute",
        steps: [
          { title: "Definire in Registry", description: "Descriem stat-urile, abilitatile, vizualul" },
          { title: "Alegere model atac", description: "single, spread, burst, laser, minigun, grenade" },
          { title: "Configurare abilitati", description: "Fabrici gata: shield, heal, poison, stun..." },
          { title: "Model 3D", description: "Fisier GLB cu animatii Mixamo" },
          { title: "Build shared", description: "npm run build — eroul e in joc!" },
        ],
      },
      {
        title: "Sistem de lupta",
        description: "Cum functioneaza bataliile",
        steps: [
          { title: "Atac normal", description: "3-4 incarcari cu reincarcare, modele diferite" },
          { title: "Coliziuni", description: "Serverul verifica loviturile si damage-ul" },
          { title: "Ultimate", description: "Se acumuleaza din damage, unic pentru erou" },
          { title: "Pasive", description: "Regen HP, crit, spini, vampirism..." },
          { title: "Moarte/reinviere", description: "Respawn in 3 secunde, pierdere gemuri" },
        ],
      },
    ],
    technicalHighlights: [
      {
        title: "Client-Side Prediction",
        description: "Jucatorul vede reactie instantanee la actiunile sale, in timp ce serverul valideaza. La divergenta — corectie lina. Rezultat: gameplay responsiv chiar la 100-150ms ping.",
        tags: ["Ascundere latenta", "Gameplay fluid", "Protectie anti-cheat"],
      },
      {
        title: "Arhitectura modulara eroi",
        description: "Fiecare erou — obiect declarativ: stat-uri, model atac, abilitati din biblioteca. Adaugarea unui personaj nou dureaza 30 minute fara modificarea codului de joc.",
        tags: ["BrawlerRegistry", "AbilityLibrary", "Zero cod server"],
      },
      {
        title: "Server autoritativ",
        description: "Toata logica de joc pe server: coliziuni, damage, validare comenzi. Clientul doar randeaza si prezice. Protectie impotriva speedhack, wallhack, damage hack.",
        tags: ["Anti-cheat", "Colyseus", "Autoritate server"],
      },
      {
        title: "3D in browser fara pierderi",
        description: "Babylon.js 6 randeaza modele 3D cu animatii la 60 FPS. Optimizare automata pentru GPU-ul dispozitivului. Functioneaza pe orice browser modern.",
        tags: ["WebGL", "60 FPS", "Cross-browser"],
      },
    ],
  },

  "giftpool": {
    userFlows: [
      {
        title: "Cum castiga platforma",
        description: "Model de business de la zero la profit",
        steps: [
          { title: "Atragere", description: "Prima strangere gratuita — oamenii incearca fara risc" },
          { title: "Conversie", description: "A placut? Urmatoarele strangeri cu comision 2.5%" },
          { title: "Retentie", description: "Mai convenabil decat competitorii — revin din nou" },
          { title: "Viralitate", description: "Prietenii vad strangerea → isi creeaza propria" },
          { title: "Scalare", description: "Automatizarea permite cresterea fara angajari" },
        ],
      },
      {
        title: "Parcursul utilizatorului",
        description: "De la prima vizita la retragerea banilor",
        steps: [
          { title: "Creare in 2 min", description: "Ai ales categoria, ai scris descrierea, gata" },
          { title: "Ai distribuit linkul", description: "WhatsApp, Telegram, retele sociale — intr-un clic" },
          { title: "Prietenii au contribuit", description: "Fara inregistrare, cu orice card din lume" },
          { title: "Notificari", description: "Vede fiecare donatie in timp real" },
          { title: "A retras pe card", description: "Banii in cont in 1-2 zile lucratoare" },
        ],
      },
      {
        title: "Protectie AI impotriva fraudatorilor",
        description: "Cum inteligenta artificiala protejeaza platforma",
        steps: [
          { title: "Verificare text", description: "AI citeste descrierea strangerii in 0.5 secunde" },
          { title: "Determinare categorie", description: "Intelege automat: zi de nastere, nunta..." },
          { title: "Cautare frauda", description: "Blocheaza incercarile de inselaciune si continutul interzis" },
          { title: "Feedback", description: "Explica utilizatorului ce sa corecteze" },
          { title: "Fara moderator", description: "Economiseste 15+ ore de munca manuala pe saptamana" },
        ],
      },
      {
        title: "Formulare fiscale automate",
        description: "Generare documente pentru IRS",
        steps: [
          { title: "Colectare date", description: "Sistem aduna automat informatiile necesare" },
          { title: "Determinare tip", description: "AI selecteaza formularul corect" },
          { title: "Generare PDF", description: "Document gata de trimis la fisc" },
          { title: "Notificare", description: "Utilizatorul primeste reminder cand e termenul" },
          { title: "Arhivare", description: "Toate documentele stocate in contul personal" },
        ],
      },
      {
        title: "Asistent AI pentru crearea strangerii",
        description: "Cum AI ajuta la crearea campaniei",
        steps: [
          { title: "Alegere ocazie", description: "Zi de nastere, nunta, absolvire..." },
          { title: "Descriere initiala", description: "Scrii cateva cuvinte despre cadou" },
          { title: "AI imbunatateste", description: "Formuleaza textul sa fie captivant" },
          { title: "Sugestii imagine", description: "Recomandari pentru fotografia de coperta" },
          { title: "Publicare rapida", description: "Strangerea gata in sub 2 minute" },
        ],
      },
    ],
    technicalHighlights: [
      {
        title: "Incarcare in 0.8 secunde",
        description: "Fiecare secunda de intarziere = -7% conversie. Acest site se incarca instantaneu pe orice dispozitiv, chiar si pe internet mobil lent.",
        tags: ["Conversie +40%", "Boost SEO", "Mobile"],
      },
      {
        title: "AI in loc de moderator",
        description: "Inteligenta artificiala verifica fiecare strangere in 0.5 secunde. Blocheaza automat fraudatorii, spamul si continutul interzis — fara salariu pentru moderator.",
        tags: ["Economie 15h/sapt", "Lucru 24/7", "Fara erori"],
      },
      {
        title: "Plati din 135+ tari",
        description: "Stripe proceseaza carduri, Apple Pay, Google Pay din toata lumea. Conversia automata a valutei, protectie anti-frauda integrata.",
        tags: ["Stripe", "Valute multiple", "Anti-frauda"],
      },
      {
        title: "Protectie date GDPR",
        description: "Verificarea utilizatorilor fara stocarea documentelor. Toate datele personale criptate, dreptul la stergere implementat complet.",
        tags: ["GDPR", "Criptare", "Confidentialitate"],
      },
    ],
  },

  "mubarakway": {
    userFlows: [
      {
        title: "Citirea Coranului",
        description: "Acces la toate 6236 ayate",
        steps: [
          { title: "Alegere sura", description: "114 sure cu nume si descrieri" },
          { title: "Citire ayat", description: "Text arab + transcriptie + traducere" },
          { title: "Ascultare audio", description: "Pronuntie corecta de la qari" },
          { title: "Bookmark", description: "Salvare locul unde ai ramas" },
          { title: "Progres", description: "Statistici de citire, obiective" },
        ],
      },
      {
        title: "Tracker rugaciune",
        description: "Nu rata niciodata namaz-ul",
        steps: [
          { title: "Timp rugaciune", description: "Calcul precis pentru orice locatie" },
          { title: "Notificare", description: "Reminder inainte de fiecare namaz" },
          { title: "Marcare", description: "Confirmare ca ai facut rugaciunea" },
          { title: "Statistici", description: "Urmarire saptamanala/lunara" },
          { title: "Qibla", description: "Directia catre Mecca pe harta" },
        ],
      },
      {
        title: "Asistent AI",
        description: "Intrebari despre Islam",
        steps: [
          { title: "Intrebare", description: "Scrii sau vorbesti in orice limba" },
          { title: "Cautare context", description: "AI cauta in Coran si hadith-uri" },
          { title: "Raspuns", description: "Explicatie clara cu referinte" },
          { title: "Surse", description: "Link-uri la ayate si hadith-uri relevante" },
          { title: "Salvare", description: "Istoricul conversatiilor pentru referinta" },
        ],
      },
      {
        title: "Obiective si obiceiuri",
        description: "Crestere spirituala zilnica",
        steps: [
          { title: "Alegere obiectiv", description: "Citire Coran, dhikr, sadaqa..." },
          { title: "Setare frecventa", description: "Zilnic, saptamanal, lunar" },
          { title: "Reminder", description: "Notificari la timpul ales" },
          { title: "Completare", description: "Marcare progres si realizari" },
          { title: "Serii", description: "Gamificare pentru motivatie continua" },
        ],
      },
    ],
    technicalHighlights: [
      {
        title: "Feature-Sliced Design",
        description: "Arhitectura modulara care permite dezvoltarea paralela a functiilor. Fiecare modul independent cu propriul state, UI si logica.",
        tags: ["FSD", "Modularitate", "Scalabilitate"],
      },
      {
        title: "AI cu context Elasticsearch",
        description: "Asistentul cauta in baza de date cu Coran si hadith-uri pentru raspunsuri precise. RAG (Retrieval Augmented Generation) pentru acuratete.",
        tags: ["Elasticsearch", "RAG", "OpenAI"],
      },
      {
        title: "Sincronizare real-time",
        description: "Progresul se sincronizeaza instantaneu intre dispozitive. Supabase Realtime pentru update-uri live fara refresh.",
        tags: ["Supabase", "Realtime", "Sync"],
      },
      {
        title: "Abordare offline-first",
        description: "Aplicatia functioneaza complet fara internet. Date cache local, sincronizare la reconectare.",
        tags: ["Offline", "Cache", "PWA"],
      },
    ],
  },

  "kmo24": {
    userFlows: [
      {
        title: "Parcursul cumparatorului",
        description: "De la cautare la achizitie",
        steps: [
          { title: "Cautare", description: "Filtrare dupa categorie, pret, stare" },
          { title: "Comparare", description: "Adaugare in favorite pentru comparatie" },
          { title: "Detalii", description: "Galerie foto, specificatii tehnice" },
          { title: "Livrare", description: "Calcul automat cost pentru adresa" },
          { title: "Comanda", description: "Finalizare cu datele de contact" },
        ],
      },
      {
        title: "Sincronizare cu 1C",
        description: "Import automat din sistemul contabil",
        steps: [
          { title: "Export 1C", description: "Generare fisier cu produse" },
          { title: "Validare", description: "Verificare date complete" },
          { title: "Import", description: "Incarcare in baza de date site" },
          { title: "Deduplicare", description: "Detectare si unire duplicate" },
          { title: "Publicare", description: "Produsele apar pe site" },
        ],
      },
      {
        title: "Calcul livrare",
        description: "Cost pentru echipament mare",
        steps: [
          { title: "Dimensiuni", description: "Lungime, latime, inaltime, greutate" },
          { title: "Destinatie", description: "Adresa de livrare" },
          { title: "Transportatori", description: "Interogare API-uri pentru preturi" },
          { title: "Comparatie", description: "Afisare optiuni cu costuri" },
          { title: "Selectie", description: "Alegere varianta preferata" },
        ],
      },
      {
        title: "Oferte comerciale PDF",
        description: "Generare documente profesionale",
        steps: [
          { title: "Selectie", description: "Alegere produse pentru oferta" },
          { title: "Date client", description: "Completare informatii cumparator" },
          { title: "Personalizare", description: "Adaugare reduceri, conditii" },
          { title: "Generare", description: "PDF creat in 3 secunde" },
          { title: "Trimitere", description: "Email automat catre client" },
        ],
      },
      {
        title: "Munca administratorului",
        description: "Gestionare catalog si comenzi",
        steps: [
          { title: "Dashboard", description: "Statistici vanzari si trafic" },
          { title: "Comenzi", description: "Procesare si urmarire status" },
          { title: "Produse", description: "Editare, adaugare, stergere" },
          { title: "Preturi", description: "Actualizare masiva din Excel" },
          { title: "Rapoarte", description: "Export date pentru analiza" },
        ],
      },
    ],
    technicalHighlights: [
      {
        title: "Sincronizare 1C fara duplicare",
        description: "Algoritmul detecteaza produsele existente si le actualizeaza in loc sa creeze duplicate. Matching dupa SKU, nume si caracteristici.",
        tags: ["1C", "Deduplicare", "Import"],
      },
      {
        title: "Calcul livrare echipament mare",
        description: "Integrare cu API-uri transportatori pentru calcul precis. Considerare dimensiuni, greutate, distanta si tip transport.",
        tags: ["Logistica", "API", "Calcul"],
      },
      {
        title: "Generare PDF in 3 secunde",
        description: "Template-uri profesionale pentru oferte comerciale. Generare pe server cu date dinamice, logo si conditii personalizate.",
        tags: ["PDF", "Template", "Automatizare"],
      },
      {
        title: "SSR optimizat SEO",
        description: "Nuxt.js genereaza pagini pe server pentru indexare perfecta. Meta-taguri dinamice, schema.org pentru produse.",
        tags: ["SSR", "SEO", "Nuxt.js"],
      },
    ],
  },

  "betanalitics": {
    userFlows: [
      {
        title: "Procesul de analiza meci",
        description: "De la selectie la prognoza",
        steps: [
          { title: "Alegere meci", description: "Din 50+ ligi din toata lumea" },
          { title: "Colectare date", description: "AI cauta informatii actuale" },
          { title: "Analiza", description: "Procesare statistici si forma" },
          { title: "Prognoza", description: "Rezultat cu procent incredere" },
          { title: "Verificare", description: "Comparare cu rezultatul real" },
        ],
      },
      {
        title: "Computer Use in actiune",
        description: "Cum AI cauta date autonom",
        steps: [
          { title: "Primire sarcina", description: "AI primeste meciul de analizat" },
          { title: "Deschide browser", description: "Navigheaza la surse de date" },
          { title: "Extrage informatii", description: "Citeste statistici, accidentari, stiri" },
          { title: "Proceseaza", description: "Analizeaza si sintetizeaza datele" },
          { title: "Returneaza", description: "Rezultat structurat pentru prognoza" },
        ],
      },
      {
        title: "Sistem de calibrare",
        description: "Cum AI invata din greseli",
        steps: [
          { title: "Prognoza", description: "AI face predictia cu incredere X%" },
          { title: "Rezultat", description: "Se inregistreaza rezultatul real" },
          { title: "Comparare", description: "Analiza: a fost corect sau nu" },
          { title: "Ajustare", description: "Actualizare coeficienti model" },
          { title: "Imbunatatire", description: "Acuratete creste in timp" },
        ],
      },
      {
        title: "Sistem de abonamente",
        description: "Monetizare platforma",
        steps: [
          { title: "Inregistrare", description: "Cont gratuit cu acces limitat" },
          { title: "Trial", description: "7 zile acces complet gratuit" },
          { title: "Alegere plan", description: "Basic, Pro, Enterprise" },
          { title: "Plata", description: "Card sau crypto" },
          { title: "Acces", description: "Functii premium deblocate" },
        ],
      },
    ],
    technicalHighlights: [
      {
        title: "Claude Computer Use",
        description: "AI deschide browserul, navigheaza site-uri, extrage date — complet autonom. Gaseste informatii pe care API-urile nu le ofera.",
        tags: ["Claude", "Automatizare", "Web Scraping"],
      },
      {
        title: "Sistem calibrare acuratete",
        description: "Fiecare prognoza se verifica cu rezultatul real. Sistemul ajusteaza automat coeficientii pentru a imbunatati predictiile viitoare.",
        tags: ["ML", "Calibrare", "Feedback Loop"],
      },
      {
        title: "Pipeline analiza multi-pas",
        description: "Datele trec prin mai multe etape: colectare, validare, normalizare, analiza, prognoza. Fiecare pas verificat si logat.",
        tags: ["Pipeline", "ETL", "Procesare"],
      },
      {
        title: "20+ servicii backend",
        description: "Arhitectura microservicii pentru scalabilitate. Fiecare serviciu independent: auth, plati, analize, notificari...",
        tags: ["Microservicii", "Scalabilitate", "Node.js"],
      },
    ],
  },

  "neoproxy": {
    userFlows: [
      {
        title: "Cabinetul personal",
        description: "Gestionare proxy-uri si abonament",
        steps: [
          { title: "Dashboard", description: "Statistici utilizare si sold" },
          { title: "Proxy-uri", description: "Lista cu status si detalii" },
          { title: "Rotatie IP", description: "Schimbare manuala sau automata" },
          { title: "Monitorizare", description: "Grafice viteza si uptime" },
          { title: "Facturi", description: "Istoric plati si descarcari" },
          { title: "Suport", description: "Chat cu operatorul" },
        ],
      },
      {
        title: "Panoul de administrare",
        description: "Gestionare afacere",
        steps: [
          { title: "Clienti", description: "Lista utilizatori si abonamente" },
          { title: "Modeme", description: "Status USB si alocare" },
          { title: "Tarife", description: "Configurare planuri si preturi" },
          { title: "Finante", description: "Venituri, cheltuieli, profit" },
          { title: "Setari", description: "Configurare sistem" },
        ],
      },
      {
        title: "Monitorizare proxy",
        description: "Status in timp real",
        steps: [
          { title: "Heartbeat", description: "Ping fiecare 30 secunde" },
          { title: "Viteza", description: "Masurare bandwidth continuu" },
          { title: "Alerte", description: "Notificare la probleme" },
          { title: "Auto-recovery", description: "Restart automat modem" },
          { title: "Rapoarte", description: "Statistici uptime lunar" },
        ],
      },
    ],
    technicalHighlights: [
      {
        title: "Arhitectura Feature-Based",
        description: "Fiecare functionalitate in folder separat cu propriul state, componente si API. Dezvoltare paralela fara conflicte.",
        tags: ["Vue 3", "Feature-based", "Modular"],
      },
      {
        title: "Pinia State Management",
        description: "Store-uri pentru fiecare domeniu: auth, proxy, billing. Reactiv, type-safe, devtools integration.",
        tags: ["Pinia", "Vue", "State"],
      },
      {
        title: "Vizualizare Chart.js",
        description: "Grafice interactive pentru trafic, venituri, uptime. Actualizare in timp real, export date.",
        tags: ["Chart.js", "Grafice", "Analytics"],
      },
      {
        title: "Sistem de facturare",
        description: "Plati recurente, facturi automate, notificari expirare. Integrare Stripe pentru carduri.",
        tags: ["Billing", "Stripe", "Subscriptii"],
      },
    ],
  },

  "fancy-app": {
    userFlows: [
      {
        title: "Onboarding si inregistrare",
        description: "Primii pasi in aplicatie",
        steps: [
          { title: "Descarca", description: "Din App Store sau Google Play" },
          { title: "Inregistrare", description: "Telefon sau social login" },
          { title: "Verificare", description: "SMS cod pentru securitate" },
          { title: "Profil", description: "Foto, bio, interese" },
          { title: "Preferinte", description: "Ce cauti: relatie, prietenie..." },
        ],
      },
      {
        title: "Discovery si matching",
        description: "Gaseste persoana potrivita",
        steps: [
          { title: "Feed", description: "Profile recomandate de AI" },
          { title: "Filtre", description: "Varsta, distanta, interese" },
          { title: "Swipe", description: "Dreapta like, stanga skip" },
          { title: "Match", description: "Ambii au dat like = match!" },
          { title: "Notificare", description: "Alerta push pentru match nou" },
        ],
      },
      {
        title: "Chat in timp real",
        description: "Comunicare cu match-urile",
        steps: [
          { title: "Lista", description: "Toate conversatiile active" },
          { title: "Mesaj", description: "Text, emoji, GIF-uri" },
          { title: "Media", description: "Poze si video din galerie" },
          { title: "Typing", description: "Indicator cand scrie celalalt" },
          { title: "Read", description: "Confirmare mesaj citit" },
        ],
      },
      {
        title: "Albume private",
        description: "Partajare foto selectiva",
        steps: [
          { title: "Creare", description: "Album nou cu nume si descriere" },
          { title: "Incarcare", description: "Adaugare poze private" },
          { title: "Permisiuni", description: "Alegere cine poate vedea" },
          { title: "Cerere", description: "Altii cer acces la album" },
          { title: "Aprobare", description: "Accepti sau refuzi cererea" },
        ],
      },
      {
        title: "Abonament premium",
        description: "Functii exclusive",
        steps: [
          { title: "Comparare", description: "Vezi ce ofera fiecare plan" },
          { title: "Alegere", description: "Lunar sau anual cu discount" },
          { title: "Plata", description: "Card sau In-App Purchase" },
          { title: "Activare", description: "Acces instant la premium" },
          { title: "Beneficii", description: "Swipe nelimitat, super like, boost" },
        ],
      },
    ],
    technicalHighlights: [
      {
        title: "Riverpod State Management",
        description: "Gestionare state declarativa si reactiva. Provider-i pentru fiecare domeniu: auth, profile, chat, matches.",
        tags: ["Riverpod", "Flutter", "Reactive"],
      },
      {
        title: "Subscriptii Realtime",
        description: "Supabase Realtime pentru mesaje, match-uri, notificari. Actualizari instant fara polling.",
        tags: ["Supabase", "WebSocket", "Live"],
      },
      {
        title: "Geolocatie cu confidentialitate",
        description: "Locatia exacta nu se trimite niciodata. Server calculeaza distanta, clientul vede doar 'la 5km'.",
        tags: ["Privacy", "Geolocatie", "Securitate"],
      },
      {
        title: "Row-Level Security",
        description: "Politici PostgreSQL garanteaza ca fiecare user vede doar datele proprii. Imposibil de accesat date altora.",
        tags: ["RLS", "PostgreSQL", "Securitate"],
      },
    ],
  },
};

async function main() {
  console.log("=".repeat(60));
  console.log("Adding proper Romanian translations");
  console.log("=".repeat(60));

  for (const [slug, translations] of Object.entries(romanianTranslations)) {
    console.log(`\n${"=".repeat(40)}`);
    console.log(`Processing: ${slug}`);
    console.log("=".repeat(40));

    // Get case study from database
    const dbProject = await prisma.project.findUnique({
      where: { slug },
      include: {
        caseStudy: {
          include: {
            userFlows: {
              include: { steps: true },
              orderBy: { order: "asc" },
            },
            technicalHighlights: {
              orderBy: { order: "asc" },
            },
          },
        },
      },
    });

    if (!dbProject?.caseStudy) {
      console.log(`  No case study found`);
      continue;
    }

    const cs = dbProject.caseStudy;

    // Update User Flow Romanian translations
    if (cs.userFlows && translations.userFlows) {
      console.log(`\n  Updating ${cs.userFlows.length} user flows...`);

      for (let i = 0; i < cs.userFlows.length && i < translations.userFlows.length; i++) {
        const dbFlow = cs.userFlows[i];
        const roData = translations.userFlows[i];

        // Update RO translation for flow
        await prisma.userFlowTranslation.updateMany({
          where: { flowId: dbFlow.id, locale: "ro" },
          data: { title: roData.title, description: roData.description },
        });
        console.log(`    Flow ${i}: ${roData.title}`);

        // Update RO translations for steps
        if (dbFlow.steps && roData.steps) {
          for (let j = 0; j < dbFlow.steps.length && j < roData.steps.length; j++) {
            const dbStep = dbFlow.steps[j];
            const stepRo = roData.steps[j];

            await prisma.userFlowStepTranslation.updateMany({
              where: { stepId: dbStep.id, locale: "ro" },
              data: { title: stepRo.title, description: stepRo.description },
            });
          }
          console.log(`      Steps: ${Math.min(dbFlow.steps.length, roData.steps.length)} updated`);
        }
      }
    }

    // Update Technical Highlight Romanian translations
    if (cs.technicalHighlights && translations.technicalHighlights) {
      console.log(`\n  Updating ${cs.technicalHighlights.length} technical highlights...`);

      for (let i = 0; i < cs.technicalHighlights.length && i < translations.technicalHighlights.length; i++) {
        const dbHl = cs.technicalHighlights[i];
        const roData = translations.technicalHighlights[i];

        await prisma.technicalHighlightTranslation.updateMany({
          where: { highlightId: dbHl.id, locale: "ro" },
          data: {
            title: roData.title,
            description: roData.description,
            tags: roData.tags,
          },
        });
        console.log(`    Highlight ${i}: ${roData.title}`);
      }
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log("All Romanian translations added!");
  console.log("=".repeat(60));

  await prisma.$disconnect();
  await pool.end();
}

main().catch(console.error);
