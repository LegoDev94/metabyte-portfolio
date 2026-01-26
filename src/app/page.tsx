import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { FeaturedProjects } from "@/components/sections/FeaturedProjects";
import { WorkProcess } from "@/components/sections/WorkProcess";
import { TechStack } from "@/components/sections/TechStack";
import { FAQ } from "@/components/sections/FAQ";
import { ContactCTA } from "@/components/sections/ContactCTA";
import { getFeaturedProjects, getFAQItems } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [featuredProjects, faqItems] = await Promise.all([
    getFeaturedProjects(),
    getFAQItems(),
  ]);

  return (
    <>
      <Header />
      <main>
        <Hero />
        <FeaturedProjects projects={featuredProjects} />
        <WorkProcess />
        <TechStack />
        <FAQ items={faqItems} />
        <ContactCTA />
      </main>
      <Footer />
    </>
  );
}
