"use client";

import { motion } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Testimonials } from "@/components/sections/Testimonials";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import {
  Gamepad2,
  Send,
  Globe,
  Database,
  Smartphone,
  ArrowRight,
  Users,
} from "lucide-react";

const team = [
  {
    name: "Сергей",
    age: 31,
    role: "Программист",
    description: "Разработка игр, сайтов",
    photo: "/images/team/zergo.png",
    skills: ["Game Dev", "Web", "Full-Stack"],
  },
  {
    name: "Юрий",
    age: 30,
    role: "Маркетолог & DevOps",
    description: "SEO, DevOps, VibeCoding",
    photo: "/images/team/iurii.png",
    skills: ["SEO", "DevOps", "Marketing"],
  },
];

const skills = [
  {
    category: "Frontend",
    icon: Globe,
    color: "#00ffff",
    items: ["React", "Next.js", "Vue 3", "Nuxt.js", "TypeScript", "Tailwind CSS", "Framer Motion"],
  },
  {
    category: "Backend",
    icon: Database,
    color: "#ff00ff",
    items: ["Node.js", "Express", "Fastify", "MongoDB", "PostgreSQL", "Supabase", "Prisma"],
  },
  {
    category: "Game Dev",
    icon: Gamepad2,
    color: "#00ff00",
    items: ["Babylon.js", "Colyseus", "WebSocket", "Three.js", "Game Physics", "Multiplayer"],
  },
  {
    category: "Mobile & Apps",
    icon: Smartphone,
    color: "#ffff00",
    items: ["Flutter", "Telegram Mini Apps", "Telegram Bot API", "Riverpod", "Firebase"],
  },
];

const experiences = [
  {
    period: "Март 2025 — настоящее время",
    title: "CEO & Founder — SRL MTBYTE (METABYTE)",
    company: "Молдова, IDNO: 1025602002114",
    description:
      "Основал собственную IT-студию. Разработка коммерческих проектов: веб-приложения, мобильные приложения, браузерные игры, системы автоматизации. Полный цикл от проектирования до деплоя.",
    highlights: ["17+ проектов", "Flutter", "Next.js", "AI интеграции"],
  },
  {
    period: "2025 — настоящее время",
    title: "Самозанятый разработчик",
    company: "Россия",
    description:
      "Параллельная деятельность как ИП. Разработка на заказ для российских клиентов: CRM-системы, интернет-магазины, Telegram боты и Mini Apps.",
    highlights: ["B2B решения", "E-commerce", "Telegram"],
  },
  {
    period: "2024 — 2025",
    title: "Full-Stack Developer (Freelance)",
    description:
      "Создание браузерных мультиплеерных игр, FinTech платформ и EdTech решений. Работа с React, Node.js, WebSocket, интеграция AI (OpenAI, Claude).",
    highlights: ["Wasteland Arena", "GiftPool", "MubarakWay"],
  },
];

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen pt-24">
        {/* Hero */}
        <section className="py-16 relative">
          <div className="absolute inset-0 cyber-grid opacity-20" />
          <div className="container mx-auto px-4 lg:px-8 relative">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                  Обо мне
                </span>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-display tracking-wide mb-6">
                  <span className="text-foreground">Привет. Я </span>
                  <span className="text-primary text-glow-cyan">Владимир</span>
                </h1>
                <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                  Full-Stack разработчик и основатель IT-студии METABYTE.
                  Создаю веб-приложения, мобильные приложения на Flutter,
                  браузерные мультиплеерные игры и системы с AI-интеграцией.
                </p>
                <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                  За плечами 17+ коммерческих проектов: от FinTech платформ и
                  EdTech приложений до 3D браузерных игр с real-time мультиплеером.
                  Работаю с React, Next.js, Vue, Flutter, Node.js и современными AI API.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button
                    asChild
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <Link href="/projects">
                      Смотреть проекты
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/contact">Связаться</Link>
                  </Button>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="relative"
              >
                {/* Photo */}
                <div className="relative aspect-square max-w-md mx-auto">
                  <div className="absolute inset-0 rounded-3xl overflow-hidden border border-border">
                    <Image
                      src="/images/geo.png"
                      alt="Владимир - Full-Stack разработчик"
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>
                  {/* Decorative */}
                  <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/20 rounded-full blur-2xl" />
                  <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-accent/20 rounded-full blur-2xl" />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Skills */}
        <section className="py-16 border-t border-border bg-card/30">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-display tracking-wide">
                <span className="text-foreground">Мои </span>
                <span className="text-accent text-glow-magenta">навыки</span>
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {skills.map((skill, index) => (
                <motion.div
                  key={skill.category}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all duration-300"
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                    style={{ backgroundColor: `${skill.color}15` }}
                  >
                    <skill.icon
                      className="w-6 h-6"
                      style={{ color: skill.color }}
                    />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">
                    {skill.category}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {skill.items.map((item) => (
                      <span
                        key={item}
                        className="px-2 py-1 text-xs rounded-md bg-secondary text-muted-foreground"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Experience */}
        <section className="py-16">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-display tracking-wide">
                <span className="text-foreground">Мой </span>
                <span className="text-primary text-glow-cyan">опыт</span>
              </h2>
            </motion.div>

            <div className="max-w-3xl mx-auto">
              {experiences.map((exp, index) => (
                <motion.div
                  key={exp.period}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="relative pl-8 pb-12 last:pb-0"
                >
                  {/* Timeline Line */}
                  {index !== experiences.length - 1 && (
                    <div className="absolute left-[11px] top-6 bottom-0 w-0.5 bg-border" />
                  )}

                  {/* Timeline Dot */}
                  <div className="absolute left-0 top-1.5 w-6 h-6 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  </div>

                  {/* Content */}
                  <div className="p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-colors">
                    <span className="text-sm text-primary font-mono">
                      {exp.period}
                    </span>
                    <h3 className="text-xl font-semibold text-foreground mt-2">
                      {exp.title}
                    </h3>
                    {exp.company && (
                      <p className="text-sm text-muted-foreground/70 mt-1">
                        {exp.company}
                      </p>
                    )}
                    <p className="text-muted-foreground mt-3">{exp.description}</p>
                    {exp.highlights && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {exp.highlights.map((highlight) => (
                          <span
                            key={highlight}
                            className="px-2 py-1 text-xs rounded-md bg-primary/10 text-primary border border-primary/20"
                          >
                            {highlight}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="py-16 border-t border-border bg-card/30">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-12"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-4">
                <Users className="w-4 h-4 text-accent" />
                <span className="text-sm font-medium text-accent">Команда</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-display tracking-wide">
                <span className="text-foreground">Наша </span>
                <span className="text-accent text-glow-magenta">команда</span>
              </h2>
              <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
                Профессионалы, которые создают качественные продукты
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
              {team.map((member, index) => (
                <motion.div
                  key={member.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="relative group"
                >
                  <div className="p-6 rounded-2xl bg-card border border-border hover:border-accent/30 transition-all duration-300">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-accent/30">
                        <Image
                          src={member.photo}
                          alt={member.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-foreground">
                          {member.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {member.age} лет
                        </p>
                        <p className="text-accent font-medium">
                          {member.role}
                        </p>
                      </div>
                    </div>
                    <p className="text-muted-foreground mb-4">
                      {member.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {member.skills.map((skill) => (
                        <span
                          key={skill}
                          className="px-2 py-1 text-xs rounded-md bg-accent/10 text-accent border border-accent/20"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <Testimonials />

        {/* CTA */}
        <section className="py-16 border-t border-border bg-card/30">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center max-w-2xl mx-auto"
            >
              <h2 className="text-3xl font-display tracking-wide mb-4">
                <span className="text-foreground">Готов к </span>
                <span className="gradient-text">сотрудничеству</span>
              </h2>
              <p className="text-muted-foreground mb-8">
                Ищу интересные проекты и новые возможности. Если у вас есть
                предложение — давайте обсудим!
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button
                  asChild
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <a
                    href="https://t.me/metabytemd"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Написать в Telegram
                  </a>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/contact">Форма связи</Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
