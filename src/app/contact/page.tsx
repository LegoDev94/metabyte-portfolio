import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ContactContent } from "@/components/contact/ContactContent";
import { getContactInfo } from "@/lib/db";
import { normalizeLocale } from "@/lib/db/utils/i18n";
import { getPageSEOForLocale } from "@/lib/db/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const locale = normalizeLocale(cookieStore.get("locale")?.value);

  const seo = await getPageSEOForLocale("contact", locale);

  if (!seo) {
    return {
      title: "Контакты | Metabyte",
      description: "Свяжитесь с нами для обсуждения вашего проекта.",
    };
  }

  return {
    title: seo.metaTitle,
    description: seo.metaDescription,
    keywords: seo.metaKeywords,
    openGraph: {
      title: seo.metaTitle,
      description: seo.metaDescription,
      type: "website",
      locale: locale === "ru" ? "ru_RU" : "ro_RO",
      ...(seo.ogImage && { images: [seo.ogImage] }),
    },
  };
}

export default async function ContactPage() {
  const cookieStore = await cookies();
  const locale = normalizeLocale(cookieStore.get("locale")?.value);

  const contactInfo = await getContactInfo(locale);

  return (
    <>
      <Header />
      <main className="min-h-screen pt-24">
        <ContactContent contactInfo={contactInfo} />
      </main>
      <Footer />
    </>
  );
}
