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
    role: "Full-Stack разработчик",
    description: "Архитектор игровых систем и веб-приложений. Специализируется на создании сложных мультиплеерных проектов с нуля. Превращает идеи в работающий код.",
    photo: "/images/team/zergo.png",
    skills: ["Game Dev", "Babylon.js", "Colyseus", "WebSocket"],
  },
  {
    name: "Юрий",
    role: "DevOps & SEO-специалист",
    description: "Мастер продвижения и инфраструктуры. Обеспечивает стабильную работу проектов и их видимость в поисковых системах.",
    photo: "/images/team/yuri.png",
    skills: ["SEO", "DevOps", "CI/CD", "Analytics"],
  },
];

const skills = [
  {
    category: "Frontend",
    icon: Globe,
    color: "#00ffff",
    items: ["React", "Next.js", "Vue 3", "TypeScript", "Tailwind CSS"],
  },
  {
    category: "Backend",
    icon: Database,
    color: "#ff00ff",
    items: ["Node.js", "Fastify", "PostgreSQL", "MongoDB", "Supabase"],
  },
  {
    category: "Game Dev",
    icon: Gamepad2,
    color: "#00ff00",
    items: ["Babylon.js", "Colyseus", "WebSocket", "Three.js", "Multiplayer"],
  },
  {
    category: "Mobile",
    icon: Smartphone,
    color: "#ffff00",
    items: ["Flutter", "Telegram Mini Apps", "Telegram Bot API", "Firebase"],
  },
];

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen pt-24">
        {/* Founder Hero */}
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
                  Основатель
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
                      src="/images/team/vladimir.png"
                      alt="Владимир - Full-Stack разработчик"
                      fill
                      sizes="(max-width: 768px) 100vw, 448px"
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
                <span className="text-foreground">Наши </span>
                <span className="text-accent text-glow-magenta">компетенции</span>
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

        {/* Team */}
        <section className="py-16 border-t border-border">
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

            <div className="max-w-5xl mx-auto space-y-12">
              {team.map((member, index) => (
                <motion.div
                  key={member.name}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                  className="relative group"
                >
                  <div className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-8 p-8 rounded-3xl bg-card border border-border hover:border-accent/50 transition-all duration-500 hover:shadow-xl hover:shadow-accent/10`}>
                    {/* Photo */}
                    <div className="relative w-40 h-40 md:w-48 md:h-48 flex-shrink-0">
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary via-accent to-primary opacity-30 blur-xl group-hover:opacity-50 transition-opacity duration-500" />
                      <div className="absolute inset-2 rounded-2xl overflow-hidden border-2 border-accent/60 shadow-[0_0_30px_rgba(255,0,255,0.3)]">
                        <Image
                          src={member.photo}
                          alt={member.name}
                          fill
                          sizes="(max-width: 768px) 160px, 192px"
                          className="object-cover"
                        />
                        <div className="absolute inset-0 shadow-[inset_0_0_40px_rgba(0,255,255,0.25),inset_0_0_80px_rgba(255,0,255,0.15)]" />
                      </div>
                      <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-primary rounded-tl-lg" />
                      <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-accent rounded-tr-lg" />
                      <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-accent rounded-bl-lg" />
                      <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-primary rounded-br-lg" />
                    </div>

                    {/* Info */}
                    <div className={`flex-1 ${index % 2 === 0 ? 'text-left md:text-left' : 'text-left md:text-right'}`}>
                      <h3 className="text-2xl font-bold text-foreground mb-1">
                        {member.name}
                      </h3>
                      <p className="text-accent font-semibold text-lg mb-3">
                        {member.role}
                      </p>
                      <p className="text-muted-foreground mb-5 leading-relaxed">
                        {member.description}
                      </p>
                      <div className={`flex flex-wrap gap-2 ${index % 2 === 0 ? 'justify-start md:justify-start' : 'justify-start md:justify-end'}`}>
                        {member.skills.map((skill) => (
                          <span
                            key={skill}
                            className="px-3 py-1.5 text-sm rounded-lg bg-accent/10 text-accent border border-accent/30"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
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
                <span className="text-foreground">Готовы </span>
                <span className="gradient-text">начать проект?</span>
              </h2>
              <p className="text-muted-foreground mb-8">
                Обсудим вашу задачу и предложим оптимальное решение.
                Первая консультация бесплатно.
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
