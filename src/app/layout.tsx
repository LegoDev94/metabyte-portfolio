import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Orbitron } from "next/font/google";
import "./globals.css";
import { AIAssistant } from "@/components/ai-assistant";
import { KeepAlive } from "@/components/KeepAlive";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin", "cyrillic"],
});

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Metabyte | Full-Stack Developer",
  description:
    "Портфолио Full-Stack разработчика. Создаю современные веб-приложения, игры и Telegram Mini Apps.",
  keywords: [
    "Full-Stack Developer",
    "React",
    "Next.js",
    "TypeScript",
    "Node.js",
    "Портфолио",
  ],
  authors: [{ name: "Metabyte" }],
  openGraph: {
    title: "Metabyte | Full-Stack Developer",
    description:
      "Портфолио Full-Stack разработчика. Создаю современные веб-приложения, игры и Telegram Mini Apps.",
    type: "website",
    locale: "ru_RU",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className="dark">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} ${orbitron.variable} antialiased min-h-screen`}
      >
        {children}
        <AIAssistant />
        <KeepAlive />
      </body>
    </html>
  );
}
