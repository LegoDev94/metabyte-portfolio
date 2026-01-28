import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import OpenAI from "openai";
import { z } from "zod";

// Lazy initialization to avoid build-time errors
let openai: OpenAI | null = null;
function getOpenAI() {
  if (!openai) {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openai;
}

const generateSchema = z.object({
  type: z.enum(["page", "project", "media"]),
  field: z.enum(["title", "description", "keywords", "altText", "name"]),
  locale: z.enum(["ru", "ro", "en"]),
  context: z.object({
    pageKey: z.string().optional(),
    projectTitle: z.string().optional(),
    projectDescription: z.string().optional(),
    projectCategory: z.string().optional(),
    mediaFilename: z.string().optional(),
    mediaLinkedTo: z.string().optional().nullable(),
    currentTitle: z.string().optional(),
    currentDescription: z.string().optional(),
  }),
});

// POST - Generate SEO content with AI
export async function POST(request: NextRequest) {
  const session = await requireAdmin(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { type, field, locale, context } = generateSchema.parse(body);

    const prompt = buildPrompt(type, field, locale, context);

    const completion = await getOpenAI().chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: getSystemPrompt(locale),
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 300,
    });

    const result = completion.choices[0]?.message?.content?.trim() || "";

    // Parse keywords if that's what we requested
    let parsed: string | string[] = result;
    if (field === "keywords") {
      parsed = result
        .split(",")
        .map((k) => k.trim())
        .filter((k) => k.length > 0);
    }

    return NextResponse.json({
      success: true,
      result: parsed,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("AI SEO validation error:", error.issues);
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }

    console.error("AI SEO generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate SEO content" },
      { status: 500 }
    );
  }
}

function getSystemPrompt(locale: string): string {
  const langInstructions = {
    ru: "Отвечай на русском языке.",
    ro: "Răspunde în limba română.",
    en: "Answer in English.",
  };

  return `You are an SEO specialist for a web development portfolio called METABYTE.
${langInstructions[locale as keyof typeof langInstructions] || langInstructions.ru}

Your task is to generate SEO-optimized content. Be concise, professional, and focus on:
- Including relevant keywords naturally
- Making content compelling and click-worthy
- Following character limits strictly
- Matching the tone of a professional tech company

Only output the requested content, nothing else. No explanations, no quotes around the text.`;
}

function buildPrompt(
  type: string,
  field: string,
  locale: string,
  context: z.infer<typeof generateSchema>["context"]
): string {
  const localeNames = { ru: "Russian", ro: "Romanian", en: "English" };
  const localeName = localeNames[locale as keyof typeof localeNames] || "Russian";

  if (type === "page") {
    const pageNames: Record<string, { ru: string; ro: string; en: string }> = {
      home: { ru: "Главная страница", ro: "Pagina principală", en: "Home page" },
      about: { ru: "О нас", ro: "Despre noi", en: "About us" },
      contact: { ru: "Контакты", ro: "Contact", en: "Contact" },
      pricing: { ru: "Цены", ro: "Prețuri", en: "Pricing" },
      projects: { ru: "Проекты", ro: "Proiecte", en: "Projects" },
    };

    const pageName = pageNames[context.pageKey || "home"]?.[locale as "ru" | "ro" | "en"] || context.pageKey;

    if (field === "title") {
      return `Generate an SEO meta title for the "${pageName}" page of METABYTE web development portfolio.
Language: ${localeName}
Character limit: 60
Include: page topic + METABYTE brand
Current title (if improving): ${context.currentTitle || "none"}`;
    }

    if (field === "description") {
      return `Generate an SEO meta description for the "${pageName}" page of METABYTE web development portfolio.
Language: ${localeName}
Character limit: 160
Include: value proposition, call to action
Current description (if improving): ${context.currentDescription || "none"}`;
    }

    if (field === "keywords") {
      return `Generate 5-8 SEO keywords for the "${pageName}" page of METABYTE web development portfolio.
Language: ${localeName}
Format: comma-separated list
Focus: web development, this specific page topic`;
    }
  }

  if (type === "project") {
    if (field === "title") {
      return `Generate an SEO meta title for a project page.
Project: ${context.projectTitle || "Unknown"}
Category: ${context.projectCategory || "web development"}
Language: ${localeName}
Character limit: 60
Include: project name + METABYTE`;
    }

    if (field === "description") {
      return `Generate an SEO meta description for a project page.
Project: ${context.projectTitle || "Unknown"}
Current description: ${context.projectDescription || "none"}
Category: ${context.projectCategory || "web development"}
Language: ${localeName}
Character limit: 160`;
    }

    if (field === "keywords") {
      return `Generate 5-8 SEO keywords for a project.
Project: ${context.projectTitle || "Unknown"}
Category: ${context.projectCategory || "web development"}
Language: ${localeName}
Format: comma-separated list`;
    }
  }

  if (type === "media") {
    if (field === "altText") {
      return `Generate alt text for an image.
Filename: ${context.mediaFilename || "image.jpg"}
Used for: ${context.mediaLinkedTo || "portfolio website"}
Language: ${localeName}
Character limit: 125
Be descriptive and accessible.`;
    }

    if (field === "title") {
      return `Generate a title for an image.
Filename: ${context.mediaFilename || "image.jpg"}
Used for: ${context.mediaLinkedTo || "portfolio website"}
Language: ${localeName}
Character limit: 70`;
    }

    if (field === "name") {
      return `Generate a short, descriptive display name for an image file.
Current filename: ${context.mediaFilename || "image.jpg"}
Used for: ${context.mediaLinkedTo || "portfolio website"}
Language: ${localeName}
Character limit: 50
Make it human-readable and descriptive. No file extension needed.`;
    }

    if (field === "description") {
      return `Generate a description for an image.
Filename: ${context.mediaFilename || "image.jpg"}
Used for: ${context.mediaLinkedTo || "portfolio website"}
Language: ${localeName}
Character limit: 200`;
    }
  }

  return "Generate appropriate SEO content.";
}
