import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import OpenAI from "openai";
import { z } from "zod";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const generateSchema = z.object({
  field: z.enum(["challenge", "solution", "results"]),
  locale: z.enum(["ru", "ro"]),
  context: z.object({
    projectTitle: z.string(),
    projectDescription: z.string().optional(),
    projectCategory: z.string().optional(),
    technologies: z.array(z.string()).optional(),
    currentChallenge: z.string().optional(),
    currentSolution: z.string().optional(),
  }),
});

// POST - Generate case study content with AI
export async function POST(request: NextRequest) {
  const session = await requireAdmin(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { field, locale, context } = generateSchema.parse(body);

    const prompt = buildPrompt(field, locale, context);

    const completion = await openai.chat.completions.create({
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
      max_tokens: field === "results" ? 500 : 800,
    });

    const result = completion.choices[0]?.message?.content?.trim() || "";

    // Parse results as array if needed
    let parsed: string | string[] = result;
    if (field === "results") {
      // Parse bullet points or numbered list into array
      parsed = result
        .split(/\n/)
        .map((line) => line.replace(/^[\s•\-\d.]+/, "").trim())
        .filter((line) => line.length > 0);
    }

    return NextResponse.json({
      success: true,
      result: parsed,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }

    console.error("AI case study generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate case study content" },
      { status: 500 }
    );
  }
}

function getSystemPrompt(locale: string): string {
  const langInstructions = {
    ru: "Отвечай на русском языке.",
    ro: "Răspunde în limba română.",
  };

  return `You are a technical writer creating case studies for METABYTE, a professional web development studio.
${langInstructions[locale as keyof typeof langInstructions] || langInstructions.ru}

Your writing style should be:
- Professional but engaging
- Technical but accessible
- Focused on business value and results
- Clear and well-structured

Only output the requested content, nothing else. No explanations, no additional commentary.`;
}

function buildPrompt(
  field: string,
  locale: string,
  context: z.infer<typeof generateSchema>["context"]
): string {
  const techStack = context.technologies?.join(", ") || "modern web technologies";
  const localeName = locale === "ru" ? "Russian" : "Romanian";

  if (field === "challenge") {
    return `Write the "Challenge" section for a case study.

Project: ${context.projectTitle}
Description: ${context.projectDescription || "A web development project"}
Category: ${context.projectCategory || "web development"}
Technologies: ${techStack}
Language: ${localeName}

Describe the business problem or technical challenge the client faced. Write 2-3 paragraphs covering:
1. The initial situation and pain points
2. The specific requirements and constraints
3. Why existing solutions were inadequate

Keep it professional and focused on business value. Around 150-250 words.`;
  }

  if (field === "solution") {
    return `Write the "Solution" section for a case study.

Project: ${context.projectTitle}
Description: ${context.projectDescription || "A web development project"}
Category: ${context.projectCategory || "web development"}
Technologies: ${techStack}
Challenge: ${context.currentChallenge || "not specified"}
Language: ${localeName}

Describe how METABYTE solved the challenge. Write 2-3 paragraphs covering:
1. The approach and methodology used
2. Key technical decisions and innovations
3. How the solution addresses the original challenges

Focus on the value delivered and technical excellence. Around 150-250 words.`;
  }

  if (field === "results") {
    return `Generate a list of key results/achievements for a case study.

Project: ${context.projectTitle}
Description: ${context.projectDescription || "A web development project"}
Category: ${context.projectCategory || "web development"}
Technologies: ${techStack}
Solution: ${context.currentSolution || "not specified"}
Language: ${localeName}

Generate 4-6 concrete, measurable results. Each result should:
- Be specific and quantifiable where possible
- Highlight business impact or technical achievement
- Be concise (one sentence each)

Format: One result per line, no bullet points or numbers.`;
  }

  return "Generate appropriate case study content.";
}
