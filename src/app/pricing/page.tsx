import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PricingContent } from "@/components/pricing/PricingContent";
import { getPricingPlans, getAdditionalServices } from "@/lib/db";
import { normalizeLocale } from "@/lib/db/utils/i18n";
import { getPageSEOForLocale } from "@/lib/db/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const locale = normalizeLocale(cookieStore.get("locale")?.value);

  const seo = await getPageSEOForLocale("pricing", locale);

  if (!seo) {
    return {
      title: "Цены | Metabyte",
      description: "Узнайте стоимость разработки вашего проекта.",
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

export default async function PricingPage() {
  const cookieStore = await cookies();
  const locale = normalizeLocale(cookieStore.get("locale")?.value);

  const [plans, services] = await Promise.all([
    getPricingPlans(locale),
    getAdditionalServices(locale),
  ]);

  return (
    <>
      <Header />
      <main className="pt-20">
        <PricingContent plans={plans} services={services} />
      </main>
      <Footer />
    </>
  );
}
