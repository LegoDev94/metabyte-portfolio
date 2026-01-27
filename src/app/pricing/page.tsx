import { cookies } from "next/headers";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PricingContent } from "@/components/pricing/PricingContent";
import { getPricingPlans, getAdditionalServices } from "@/lib/db";
import { normalizeLocale } from "@/lib/db/utils/i18n";

export const dynamic = "force-dynamic";

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
