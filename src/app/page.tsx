import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { FeaturedProjects } from "@/components/sections/FeaturedProjects";
import { WorkProcess } from "@/components/sections/WorkProcess";
import { TechStack } from "@/components/sections/TechStack";
import { FAQ } from "@/components/sections/FAQ";
import { ContactCTA } from "@/components/sections/ContactCTA";
import {
  getFeaturedProjects,
  getFAQItems,
  getSiteSettings,
  getTechStack,
  getWorkProcessSteps,
} from "@/lib/db";
import { normalizeLocale } from "@/lib/db/utils/i18n";
import { getLocalizedFeaturedProjects } from "@/lib/utils/get-locale-projects";
import { getPageSEOForLocale } from "@/lib/db/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const locale = normalizeLocale(cookieStore.get("locale")?.value);

  const seo = await getPageSEOForLocale("home", locale);

  if (!seo) {
    return {
      title: "Metabyte | Full-Stack Developer",
      description: "Портфолио Full-Stack разработчика. Создаю современные веб-приложения, игры и Telegram Mini Apps.",
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

export default async function HomePage() {
  const cookieStore = await cookies();
  const locale = normalizeLocale(cookieStore.get("locale")?.value);

  const [dbFeaturedProjects, faqItems, siteSettings, techStack, workProcessSteps] = await Promise.all([
    getFeaturedProjects(locale),
    getFAQItems(locale),
    getSiteSettings(locale),
    getTechStack(),
    getWorkProcessSteps(locale),
  ]);

  // Use localized projects from static data if DB is empty
  const featuredProjects = dbFeaturedProjects.length > 0
    ? dbFeaturedProjects
    : getLocalizedFeaturedProjects(locale);

  return (
    <>
      <Header />
      <main>
        <Hero settings={siteSettings} />
        <FeaturedProjects projects={featuredProjects} />
        <WorkProcess steps={workProcessSteps} />
        <TechStack items={techStack} />
        <FAQ items={faqItems} />
        <ContactCTA />
      </main>
      <Footer />
    </>
  );
}
