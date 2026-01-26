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

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const [founder, team, testimonials, testimonialStats, skillCategories] = await Promise.all([
    getFounder(),
    getTeamMembers(),
    getTestimonials(),
    getTestimonialStats(),
    getSkillCategories(),
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
