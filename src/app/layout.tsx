import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Orbitron } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import "./globals.css";
import { AIAssistant } from "@/components/ai-assistant";
import { KeepAlive } from "@/components/KeepAlive";
import { LocaleProvider } from "@/components/providers/LocaleProvider";
import { PageViewTracker } from "@/components/analytics/PageViewTracker";
import { getUIStrings } from "@/lib/db/ui-strings";
import { normalizeLocale } from "@/lib/db/utils/i18n";

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  // Load UI strings from database
  const normalizedLocale = normalizeLocale(locale);
  const uiStrings = await getUIStrings(normalizedLocale);

  return (
    <html lang={locale} className="dark">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} ${orbitron.variable} antialiased min-h-screen`}
      >
        <NextIntlClientProvider messages={messages}>
          <LocaleProvider initialUIStrings={uiStrings}>
            {children}
            <AIAssistant />
            <KeepAlive />
            <PageViewTracker />
          </LocaleProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
