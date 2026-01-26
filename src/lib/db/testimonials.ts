import { prisma } from "@/lib/prisma";

export interface Testimonial {
  id: string;
  author: string;
  task: string;
  text: string;
  rating: number;
  source: string | null;
}

export interface TestimonialStats {
  avgRating: number;
  totalPositive: number;
  totalNegative: number;
  platform: string;
  platformUrl: string | null;
}

// Fetch all testimonials
export async function getTestimonials(): Promise<Testimonial[]> {
  const dbTestimonials = await prisma.testimonial.findMany({
    orderBy: { order: "asc" },
  });

  return dbTestimonials.map((t) => ({
    id: t.id,
    author: t.author,
    task: t.task,
    text: t.text,
    rating: t.rating,
    source: t.source,
  }));
}

// Fetch limited testimonials for display
export async function getFeaturedTestimonials(limit: number = 6): Promise<Testimonial[]> {
  const dbTestimonials = await prisma.testimonial.findMany({
    orderBy: { order: "asc" },
    take: limit,
  });

  return dbTestimonials.map((t) => ({
    id: t.id,
    author: t.author,
    task: t.task,
    text: t.text,
    rating: t.rating,
    source: t.source,
  }));
}

// Get testimonials stats
export async function getTestimonialStats(): Promise<TestimonialStats | null> {
  const stats = await prisma.testimonialStats.findFirst();

  if (!stats) return null;

  return {
    avgRating: stats.avgRating,
    totalPositive: stats.totalPositive,
    totalNegative: stats.totalNegative,
    platform: stats.platform,
    platformUrl: stats.platformUrl,
  };
}

// Get testimonials count
export async function getTestimonialsCount(): Promise<number> {
  return prisma.testimonial.count();
}
