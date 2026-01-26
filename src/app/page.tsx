import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { FeaturedProjects } from "@/components/sections/FeaturedProjects";
import { WorkProcess } from "@/components/sections/WorkProcess";
import { TechStack } from "@/components/sections/TechStack";
import { FAQ } from "@/components/sections/FAQ";
import { ContactCTA } from "@/components/sections/ContactCTA";

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <FeaturedProjects />
        <WorkProcess />
        <TechStack />
        <FAQ />
        <ContactCTA />
      </main>
      <Footer />
    </>
  );
}
