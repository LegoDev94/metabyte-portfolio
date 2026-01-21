import { chromium } from "playwright";
import * as path from "path";
import * as fs from "fs";

const OUTPUT_DIR = path.join(__dirname, "../public/images/projects");

// Проекты с URL для скриншотов (реальные живые проекты)
const projectsWithUrls = [
  {
    slug: "giftpool",
    url: "https://giftpool.io",
    name: "GiftPool",
  },
  {
    slug: "monopoly-lux",
    url: "https://monopoly-lux.onrender.com",
    name: "Monopoly Lux",
  },
  {
    slug: "mubarakway",
    url: "https://mubarakway-app-i36l.onrender.com",
    name: "MubarakWay",
  },
  {
    slug: "kmo24",
    url: "https://kmo24-frontend.onrender.com",
    name: "KMO24",
  },
];

// Проекты без публичных URL - создаём мокапы
const projectsWithMockups = [
  { slug: "wasteland-arena", name: "Wasteland Arena", color: "#00ffff", icon: "🎮" },
  { slug: "vibe-taxi", name: "Vibe Taxi", color: "#ffff00", icon: "🚕" },
  { slug: "404-dispatch", name: "404 Dispatch", color: "#ff6600", icon: "🚛" },
  { slug: "exchanger-pmr", name: "Exchanger PMR", color: "#00ffff", icon: "💱" },
  { slug: "fns-tg-scan", name: "FNS TG Scan", color: "#ff00ff", icon: "📱" },
  // NEW 8 PROJECTS
  { slug: "crypto-dashboard", name: "Crypto Dashboard", color: "#f7931a", icon: "📈" },
  { slug: "ai-code-reviewer", name: "AI Code Reviewer", color: "#00ff00", icon: "🤖" },
  { slug: "smart-home-hub", name: "Smart Home Hub", color: "#41bdf5", icon: "🏠" },
  { slug: "video-streaming-platform", name: "StreamVibe", color: "#ff2d55", icon: "📺" },
  { slug: "fitness-tracker", name: "FitPulse", color: "#ff2d55", icon: "💪" },
  { slug: "e-learning-platform", name: "LearnHub", color: "#6366f1", icon: "📚" },
  { slug: "restaurant-pos", name: "QuickServe POS", color: "#22c55e", icon: "🍽️" },
  { slug: "social-scheduler", name: "PostFlow", color: "#1da1f2", icon: "📱" },
];

async function generateMockupScreenshot(
  browser: any,
  project: { slug: string; name: string; color: string; icon: string }
) {
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 720 });

  // Создаём HTML для мокапа
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          width: 1280px;
          height: 720px;
          background: linear-gradient(135deg, #0a0a0f 0%, #12121a 50%, #0a0a0f 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Segoe UI', system-ui, sans-serif;
          overflow: hidden;
          position: relative;
        }
        .grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(38, 38, 48, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(38, 38, 48, 0.3) 1px, transparent 1px);
          background-size: 50px 50px;
        }
        .glow-1 {
          position: absolute;
          width: 400px;
          height: 400px;
          background: ${project.color};
          opacity: 0.15;
          border-radius: 50%;
          filter: blur(100px);
          top: -100px;
          left: -100px;
        }
        .glow-2 {
          position: absolute;
          width: 300px;
          height: 300px;
          background: #ff00ff;
          opacity: 0.1;
          border-radius: 50%;
          filter: blur(80px);
          bottom: -50px;
          right: -50px;
        }
        .content {
          position: relative;
          text-align: center;
          z-index: 1;
        }
        .icon {
          font-size: 80px;
          margin-bottom: 24px;
          filter: drop-shadow(0 0 30px ${project.color});
        }
        .title {
          font-size: 56px;
          font-weight: 700;
          color: #f2f2f2;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          margin-bottom: 16px;
          text-shadow: 0 0 40px ${project.color}40;
        }
        .subtitle {
          font-size: 20px;
          color: ${project.color};
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }
        .border-frame {
          position: absolute;
          inset: 40px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
        }
        .corner {
          position: absolute;
          width: 20px;
          height: 20px;
          border: 2px solid ${project.color};
        }
        .corner-tl { top: 30px; left: 30px; border-right: none; border-bottom: none; }
        .corner-tr { top: 30px; right: 30px; border-left: none; border-bottom: none; }
        .corner-bl { bottom: 30px; left: 30px; border-right: none; border-top: none; }
        .corner-br { bottom: 30px; right: 30px; border-left: none; border-top: none; }
      </style>
    </head>
    <body>
      <div class="grid"></div>
      <div class="glow-1"></div>
      <div class="glow-2"></div>
      <div class="border-frame"></div>
      <div class="corner corner-tl"></div>
      <div class="corner corner-tr"></div>
      <div class="corner corner-bl"></div>
      <div class="corner corner-br"></div>
      <div class="content">
        <div class="icon">${project.icon}</div>
        <h1 class="title">${project.name}</h1>
        <p class="subtitle">Portfolio Project</p>
      </div>
    </body>
    </html>
  `;

  await page.setContent(html);
  await page.screenshot({
    path: path.join(OUTPUT_DIR, `${project.slug}.jpg`),
    type: "jpeg",
    quality: 90,
  });

  await page.close();
  console.log(`✓ Created mockup for ${project.name}`);
}

async function captureWebsiteScreenshot(
  browser: any,
  project: { slug: string; url: string; name: string }
) {
  try {
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1280, height: 720 });

    await page.goto(project.url, {
      waitUntil: "networkidle",
      timeout: 30000
    });

    // Ждём загрузки
    await page.waitForTimeout(2000);

    await page.screenshot({
      path: path.join(OUTPUT_DIR, `${project.slug}.jpg`),
      type: "jpeg",
      quality: 90,
    });

    await page.close();
    console.log(`✓ Captured screenshot for ${project.name}`);
  } catch (error) {
    console.log(`✗ Failed to capture ${project.name}, creating mockup instead`);
    await generateMockupScreenshot(browser, {
      slug: project.slug,
      name: project.name,
      color: "#00ffff",
      icon: "🌐",
    });
  }
}

async function main() {
  // Создаём папку если не существует
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  console.log("Starting screenshot generation...\n");

  const browser = await chromium.launch({ headless: true });

  // Генерируем мокапы для проектов без URL
  console.log("Generating mockups for private projects:");
  for (const project of projectsWithMockups) {
    await generateMockupScreenshot(browser, project);
  }

  // Делаем скриншоты публичных сайтов
  console.log("\nCapturing screenshots from live websites:");
  for (const project of projectsWithUrls) {
    await captureWebsiteScreenshot(browser, project);
  }

  await browser.close();
  console.log("\n✅ All screenshots generated!");
}

main().catch(console.error);
