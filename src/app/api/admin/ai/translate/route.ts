import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import OpenAI from "openai";
import { z } from "zod";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const translateSchema = z.object({
  text: z.string().min(1).max(10000),
  sourceLocale: z.enum(["ru", "ro", "en", "auto"]),
  targetLocale: z.enum(["ru", "ro", "en"]),
});

// POST - Translate text between languages
export async function POST(request: NextRequest) {
  const session = await requireAdmin(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { text, sourceLocale, targetLocale } = translateSchema.parse(body);

    if (sourceLocale === targetLocale) {
      return NextResponse.json({
        success: true,
        translation: text,
        detectedLocale: sourceLocale,
      });
    }

    const localeNames: Record<string, string> = {
      ru: "Russian",
      ro: "Romanian",
      en: "English",
      auto: "auto-detect",
    };

    const prompt = sourceLocale === "auto"
      ? `Detect the language and translate the following text to ${localeNames[targetLocale]}. Only output the translation, nothing else.

Text:
${text}`
      : `Translate the following text from ${localeNames[sourceLocale]} to ${localeNames[targetLocale]}. Only output the translation, nothing else. Preserve formatting (line breaks, lists) if present.

Text:
${text}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a professional translator specializing in technical and business content for a web development company.
Translate accurately while maintaining:
- Professional tone
- Technical terminology accuracy
- Original formatting and structure
- Cultural appropriateness for the target language

Only output the translated text. No explanations, no "Here is the translation:", just the translated content.`,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 4000,
    });

    const translation = completion.choices[0]?.message?.content?.trim() || "";

    // Try to detect the source language if auto was selected
    let detectedLocale = sourceLocale;
    if (sourceLocale === "auto") {
      // Simple detection based on character sets
      const cyrillicRegex = /[\u0400-\u04FF]/;
      const romanianRegex = /[ăîâșț]/i;

      if (cyrillicRegex.test(text)) {
        detectedLocale = "ru";
      } else if (romanianRegex.test(text)) {
        detectedLocale = "ro";
      } else {
        detectedLocale = "en";
      }
    }

    return NextResponse.json({
      success: true,
      translation,
      detectedLocale,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Translation error:", error);
    return NextResponse.json(
      { error: "Failed to translate text" },
      { status: 500 }
    );
  }
}
