"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Send,
  Mail,
  Github,
  CheckCircle,
  AlertCircle,
  Loader2,
  Star,
} from "lucide-react";

interface FormState {
  status: "idle" | "loading" | "success" | "error";
  message?: string;
}

export default function ContactPage() {
  const [formState, setFormState] = useState<FormState>({ status: "idle" });
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormState({ status: "loading" });

    try {
      const response = await fetch("/api/telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setFormState({
          status: "success",
          message: "Сообщение отправлено! Я отвечу в ближайшее время.",
        });
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        throw new Error("Failed to send");
      }
    } catch (error) {
      setFormState({
        status: "error",
        message: "Ошибка отправки. Попробуйте написать напрямую в Telegram.",
      });
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <>
      <Header />
      <main className="min-h-screen pt-24">
        {/* Hero */}
        <section className="py-16 relative">
          <div className="absolute inset-0 cyber-grid opacity-20" />
          <div className="container mx-auto px-4 lg:px-8 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center max-w-3xl mx-auto"
            >
              <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                Контакты
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display tracking-wide mb-6">
                <span className="text-foreground">Давайте </span>
                <span className="text-primary text-glow-cyan">поговорим</span>
              </h1>
              <p className="text-lg text-muted-foreground">
                Есть вопросы или предложение? Напишите мне, и я отвечу в
                ближайшее время.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-16">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
              {/* Form */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label
                        htmlFor="name"
                        className="text-sm font-medium text-foreground"
                      >
                        Имя
                      </label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="Ваше имя"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="bg-card border-border focus:border-primary focus:ring-primary/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <label
                        htmlFor="email"
                        className="text-sm font-medium text-foreground"
                      >
                        Email
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="email@example.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="bg-card border-border focus:border-primary focus:ring-primary/20"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="subject"
                      className="text-sm font-medium text-foreground"
                    >
                      Тема
                    </label>
                    <Input
                      id="subject"
                      name="subject"
                      placeholder="Тема сообщения"
                      value={formData.subject}
                      onChange={handleInputChange}
                      className="bg-card border-border focus:border-primary focus:ring-primary/20"
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="message"
                      className="text-sm font-medium text-foreground"
                    >
                      Сообщение
                    </label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="Расскажите о вашем проекте или вопросе..."
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={6}
                      className="bg-card border-border focus:border-primary focus:ring-primary/20 resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={formState.status === "loading"}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-[0_0_30px_rgba(0,255,255,0.3)] transition-all duration-300"
                  >
                    {formState.status === "loading" ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Отправка...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Отправить сообщение
                      </>
                    )}
                  </Button>

                  <AnimatePresence>
                    {formState.status === "success" && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-2 p-4 rounded-lg bg-green-500/10 text-green-400 border border-green-500/20"
                      >
                        <CheckCircle className="w-5 h-5" />
                        {formState.message}
                      </motion.div>
                    )}
                    {formState.status === "error" && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-2 p-4 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20"
                      >
                        <AlertCircle className="w-5 h-5" />
                        {formState.message}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </form>
              </motion.div>

              {/* Contact Info */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="space-y-8"
              >
                <div>
                  <h2 className="text-2xl font-display tracking-wide mb-4">
                    <span className="text-foreground">Или напишите </span>
                    <span className="text-accent">напрямую</span>
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    Предпочитаете мессенджеры? Напишите мне в Telegram — я отвечу
                    в течение 24 часов.
                  </p>

                  <Button
                    asChild
                    className="w-full bg-[#0088cc] hover:bg-[#0077b5] text-white hover:shadow-[0_0_30px_rgba(0,136,204,0.4)] transition-all duration-300"
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
                </div>

                <div className="pt-8 border-t border-border">
                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    Также доступен
                  </h3>
                  <div className="space-y-4">
                    <a
                      href="https://github.com/Metabyte-Corp"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-4 rounded-lg bg-card border border-border hover:border-primary/30 transition-colors group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                        <Github className="w-5 h-5 text-foreground" />
                      </div>
                      <div>
                        <div className="font-medium text-foreground group-hover:text-primary transition-colors">
                          GitHub
                        </div>
                        <div className="text-sm text-muted-foreground">
                          @Metabyte-Corp
                        </div>
                      </div>
                    </a>

                    <a
                      href="mailto:contact@metabyte.dev"
                      className="flex items-center gap-3 p-4 rounded-lg bg-card border border-border hover:border-primary/30 transition-colors group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                        <Mail className="w-5 h-5 text-foreground" />
                      </div>
                      <div>
                        <div className="font-medium text-foreground group-hover:text-primary transition-colors">
                          Email
                        </div>
                        <div className="text-sm text-muted-foreground">
                          contact@metabyte.dev
                        </div>
                      </div>
                    </a>

                    <a
                      href="https://youdo.com/u11536152"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-4 rounded-lg bg-card border border-border hover:border-primary/30 transition-colors group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                        <Star className="w-5 h-5 text-yellow-500" />
                      </div>
                      <div>
                        <div className="font-medium text-foreground group-hover:text-primary transition-colors flex items-center gap-2">
                          YouDo
                          <span className="text-xs text-yellow-500">4.9 ★</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          27 положительных отзывов
                        </div>
                      </div>
                    </a>
                  </div>
                </div>

                {/* Quick Info */}
                <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border border-border">
                  <h3 className="text-lg font-semibold text-foreground mb-3">
                    Время ответа
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Обычно отвечаю в течение <span className="text-primary">24 часов</span>.
                    Для срочных вопросов лучше писать в Telegram.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
