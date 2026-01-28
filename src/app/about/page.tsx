import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AboutContent } from "@/components/about/AboutContent";
import {
  getTeamMembers,
  getFounder,
  getTestimonials,
  getTestimonialStats,
  getSkillCategories,
} from "@/lib/db";
import { normalizeLocale } from "@/lib/db/utils/i18n";
import { getPageSEOForLocale } from "@/lib/db/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const locale = normalizeLocale(cookieStore.get("locale")?.value);

  const seo = await getPageSEOForLocale("about", locale);

  if (!seo) {
    return {
      title: "О нас | Metabyte",
      description: "Узнайте больше о команде Metabyte и нашем опыте в веб-разработке.",
    };
  }

  return {
    title: seo.metaTitle,
    description: seo.metaDescription,
    keywords: seo.metaKeywords,
    openGraph: {
      title: seo.metaTitle,
      description: seo.metaDescription,
      type: "website",
      locale: locale === "ru" ? "ru_RU" : "ro_RO",
      ...(seo.ogImage && { images: [seo.ogImage] }),
    },
  };
}

export default async function AboutPage() {
  const cookieStore = await cookies();
  const locale = normalizeLocale(cookieStore.get("locale")?.value);

  const [founder, team, testimonials, testimonialStats, skillCategories] = await Promise.all([
    getFounder(locale),
    getTeamMembers(locale),
    getTestimonials(locale),
    getTestimonialStats(),
    getSkillCategories(locale),
  ]);

  return (
    <>
      <Header />
      <main className="min-h-screen pt-24">
        <AboutContent
          founder={founder}
          team={team}
          testimonials={testimonials}
          testimonialStats={testimonialStats}
          skillCategories={skillCategories}
        />
      </main>
      <Footer />
    </>
  );
}
