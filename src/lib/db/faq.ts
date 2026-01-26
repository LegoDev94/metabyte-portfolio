import { prisma } from "@/lib/prisma";

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

// Fetch all FAQ items
export async function getFAQItems(): Promise<FAQItem[]> {
  const dbFAQ = await prisma.faqItem.findMany({
    orderBy: { order: "asc" },
  });

  return dbFAQ.map((f) => ({
    id: f.id,
    question: f.question,
    answer: f.answer,
    category: f.category || "general",
  }));
}

// Fetch FAQ items by category
export async function getFAQByCategory(category: string): Promise<FAQItem[]> {
  const dbFAQ = await prisma.faqItem.findMany({
    where: { category },
    orderBy: { order: "asc" },
  });

  return dbFAQ.map((f) => ({
    id: f.id,
    question: f.question,
    answer: f.answer,
    category: f.category || "general",
  }));
}

// Get FAQ categories
export async function getFAQCategories(): Promise<string[]> {
  const categories = await prisma.faqItem.findMany({
    distinct: ["category"],
    select: { category: true },
    orderBy: { order: "asc" },
  });

  return categories
    .map((c) => c.category)
    .filter((c): c is string => c !== null);
}
