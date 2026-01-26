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
  Target,
  Zap,
  Shield,
  Clock,
  HeartHandshake,
  Rocket,
} from "lucide-react";

const founderJourney = [
  {
    year: "2012",
    title: "Первый код",
    description: "Начал изучать программирование в 12 лет. Первые игры на Pascal и Delphi.",
  },
  {
    year: "2016",
    title: "Веб-разработка",
    description: "Перешёл на веб: HTML, CSS, JavaScript. Первые заказы на фрилансе.",
  },
  {
    year: "2019",
    title: "Full-Stack",
    description: "Освоил React и Node.js. Начал работать над серьёзными коммерческими проектами.",
  },
  {
    year: "2022",
    title: "Game Dev",
    description: "Углубился в разработку браузерных игр. Babylon.js, Colyseus, мультиплеер.",
  },
  {
    year: "2025",
    title: "METABYTE",
    description: "Основал студию. Собрал команду единомышленников для масштабных проектов.",
  },
];

const team = [
  {
    name: "Владимир",
    role: "Основатель & Lead Developer",
    description: "Создатель студии METABYTE. Начал путь в программировании с 12 лет, прошёл путь от любительских игр до коммерческих проектов. За плечами — десятки проектов: от стартапов до enterprise-решений. Специализируется на архитектуре сложных систем и менторстве команды.",
    photo: "/images/team/vladimir.png",
    skills: ["Architecture", "React", "Node.js", "Leadership"],
    isFounder: true,
  },
  {
    name: "Сергей",
    role: "Full-Stack разработчик",
    description: "Архитектор игровых систем и веб-приложений. Специализируется на создании сложных мультиплеерных проектов с нуля. Превращает идеи в работающий код за рекордные сроки.",
    photo: "/images/team/zergo.png",
    skills: ["Game Dev", "React", "Node.js", "WebSocket"],
  },
  {
    name: "Юрий",
    role: "DevOps & SEO-специалист",
    description: "Мастер продвижения и инфраструктуры. Обеспечивает стабильную работу проектов и их видимость в поисковых системах. Автоматизирует всё, что можно автоматизировать.",
    photo: "/images/team/yuri.png",
    skills: ["SEO", "DevOps", "CI/CD", "Analytics"],
  },
];

const values = [
  {
    icon: Target,
    title: "Результат",
    description: "Работаем на результат, а не на часы. Цель — ваш успешный бизнес.",
    color: "#00ffff",
  },
  {
    icon: Zap,
    title: "Скорость",
    description: "Быстрый старт и предсказуемые сроки. MVP за 2-4 недели.",
    color: "#ff00ff",
  },
  {
    icon: Shield,
    title: "Качество",
    description: "Чистый код, современные технологии, тестирование.",
    color: "#00ff88",
  },
  {
    icon: Clock,
    title: "Поддержка",
    description: "Не бросаем после запуска. 30 дней поддержки в подарок.",
    color: "#ffaa00",
  },
  {
    icon: HeartHandshake,
    title: "Партнёрство",
    description: "Погружаемся в бизнес клиента. Предлагаем решения, а не просто код.",
    color: "#ff5555",
  },
  {
    icon: Users,
    title: "Команда",
    description: "Слаженная команда специалистов с разными компетенциями.",
    color: "#00ffff",
  },
];

const skills = [
  {
    category: "Frontend",
    icon: Globe,
    color: "#00ffff",
    items: ["React", "Next.js", "Vue 3", "Nuxt.js", "TypeScript", "Tailwind CSS"],
  },
  {
    category: "Backend",
    icon: Database,
    color: "#ff00ff",
    items: ["Node.js", "Express", "Fastify", "MongoDB", "PostgreSQL", "Supabase"],
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
        {/* Hero */}
        <section className="py-16 relative">
          <div className="absolute inset-0 cyber-grid opacity-20" />
          <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/20 rounded-full blur-[128px]" />
          <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-accent/20 rounded-full blur-[128px]" />

          <div className="container mx-auto px-4 lg:px-8 relative">
            <div className="max-w-4xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                  О студии
                </span>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-display tracking-wide mb-6">
                  <span className="text-primary text-glow-cyan">METABYTE</span>
                  <span className="text-foreground"> — студия разработки</span>
                </h1>
                <p className="text-xl text-muted-foreground mb-8 leading-relaxed max-w-3xl mx-auto">
                  Создаём веб-приложения, мобильные приложения, браузерные игры
                  и системы автоматизации. От идеи до запуска — полный цикл разработки.
                </p>

                {/* Stats */}
                <div className="flex flex-wrap justify-center gap-8 md:gap-12 mb-10">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary">17+</div>
                    <div className="text-sm text-muted-foreground">проектов</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary">4.9</div>
                    <div className="text-sm text-muted-foreground">рейтинг</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary">5+</div>
                    <div className="text-sm text-muted-foreground">стран</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary">2025</div>
                    <div className="text-sm text-muted-foreground">год основания</div>
                  </div>
                </div>

                <div className="flex flex-wrap justify-center gap-4">
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
                    <Link href="/pricing">Узнать цены</Link>
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-16 border-t border-border">
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
                <span className="text-accent text-glow-magenta">ценности</span>
              </h2>
              <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
                Принципы, которыми мы руководствуемся в работе
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {values.map((value, index) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all duration-300"
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                    style={{ backgroundColor: `${value.color}15` }}
                  >
                    <value.icon
                      className="w-6 h-6"
                      style={{ color: value.color }}
                    />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {value.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {value.description}
                  </p>
                </motion.div>
              ))}
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
                <span className="text-foreground">Наш </span>
                <span className="text-primary text-glow-cyan">стек</span>
              </h2>
              <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
                Технологии, которые мы используем для создания продуктов
              </p>
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

        {/* Founder Journey */}
        <section className="py-16 border-t border-border">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-12"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
                <Rocket className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">История</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-display tracking-wide">
                <span className="text-foreground">Путь </span>
                <span className="text-primary text-glow-cyan">основателя</span>
              </h2>
              <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
                От первых строк кода до создания студии
              </p>
            </motion.div>

            <div className="max-w-3xl mx-auto">
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary via-accent to-primary" />

                {founderJourney.map((item, index) => (
                  <motion.div
                    key={item.year}
                    initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className={`relative flex items-center gap-6 mb-8 ${
                      index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                    }`}
                  >
                    {/* Year badge */}
                    <div className="absolute left-0 md:left-1/2 md:-translate-x-1/2 w-8 h-8 rounded-full bg-primary flex items-center justify-center z-10">
                      <div className="w-3 h-3 rounded-full bg-background" />
                    </div>

                    {/* Content */}
                    <div className={`ml-12 md:ml-0 md:w-1/2 ${index % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:pl-12 md:text-left'}`}>
                      <div className="p-5 rounded-xl bg-card border border-border hover:border-primary/30 transition-all duration-300">
                        <span className="text-primary font-bold text-lg">{item.year}</span>
                        <h3 className="text-foreground font-semibold mt-1">{item.title}</h3>
                        <p className="text-muted-foreground text-sm mt-2">{item.description}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
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

            <div className="max-w-5xl mx-auto space-y-16">
              {team.map((member, index) => (
                <motion.div
                  key={member.name}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                  className="relative group"
                >
                  {index > 0 && (
                    <div className="absolute left-1/2 -top-8 w-px h-8 bg-gradient-to-b from-transparent via-accent/50 to-accent/30" />
                  )}

                  <div className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-8 p-8 rounded-3xl bg-card border border-border hover:border-accent/50 transition-all duration-500 hover:shadow-xl hover:shadow-accent/10`}>
                    <div className="relative w-48 h-48 md:w-56 md:h-56 flex-shrink-0">
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary via-accent to-primary opacity-30 blur-xl group-hover:opacity-50 transition-opacity duration-500" />
                      <div className="absolute inset-2 rounded-2xl overflow-hidden border-2 border-accent/60 shadow-[0_0_30px_rgba(255,0,255,0.3)]">
                        <Image
                          src={member.photo}
                          alt={member.name}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 shadow-[inset_0_0_40px_rgba(0,255,255,0.25),inset_0_0_80px_rgba(255,0,255,0.15)]" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                      </div>
                      <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-primary rounded-tl-lg" />
                      <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-accent rounded-tr-lg" />
                      <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-accent rounded-bl-lg" />
                      <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-primary rounded-br-lg" />
                    </div>

                    <div className={`flex-1 ${index % 2 === 0 ? 'text-left md:text-left' : 'text-left md:text-right'}`}>
                      <h3 className="text-3xl font-bold text-foreground mb-2">
                        {member.name}
                      </h3>
                      <p className="text-accent font-semibold text-xl mb-4">
                        {member.role}
                      </p>

                      <p className="text-muted-foreground mb-6 leading-relaxed text-lg">
                        {member.description}
                      </p>

                      <div className={`flex flex-wrap gap-2 ${index % 2 === 0 ? 'justify-start md:justify-start' : 'justify-start md:justify-end'}`}>
                        {member.skills.map((skill) => (
                          <span
                            key={skill}
                            className="px-4 py-2 text-sm rounded-xl bg-accent/10 text-accent border border-accent/30 hover:bg-accent/20 hover:border-accent/50 transition-all duration-300"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {index < team.length - 1 && (
                    <div className="absolute left-1/2 -bottom-8 w-px h-8 bg-gradient-to-b from-accent/30 via-accent/50 to-transparent" />
                  )}
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
