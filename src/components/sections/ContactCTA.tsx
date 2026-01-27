"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Send, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocaleContext } from "@/components/providers/LocaleProvider";

export function ContactCTA() {
  const { locale } = useLocaleContext();

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5" />

      {/* Decorative Elements */}
      <div className="absolute top-1/2 left-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px] -translate-y-1/2" />
      <div className="absolute top-1/2 right-0 w-64 h-64 bg-accent/10 rounded-full blur-[100px] -translate-y-1/2" />

      <div className="container mx-auto px-4 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto text-center"
        >
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-8">
            <Send className="w-8 h-8 text-primary" />
          </div>

          {/* Heading */}
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display tracking-wide mb-6">
            <span className="text-foreground">
              {locale === "ro" ? "Aveti un proiect? " : "Есть проект? "}
            </span>
            <span className="gradient-text">
              {locale === "ro" ? "Hai sa discutam!" : "Давайте обсудим!"}
            </span>
          </h2>

          {/* Description */}
          <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
            {locale === "ro"
              ? "Sunt deschis pentru oportunitati noi si proiecte interesante. Scrieti-mi si vom discuta cum pot ajuta."
              : "Открыт для новых возможностей и интересных проектов. Напишите мне, и мы обсудим, как я могу помочь."}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              asChild
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-[0_0_30px_rgba(0,255,255,0.4)] transition-all duration-300 px-8"
            >
              <a
                href="https://t.me/metabytemd"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Send className="w-4 h-4 mr-2" />
                {locale === "ro" ? "Scrie pe Telegram" : "Написать в Telegram"}
              </a>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-border hover:border-primary hover:text-primary group px-8"
            >
              <Link href="/contact">
                {locale === "ro" ? "Formular de contact" : "Форма связи"}
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
