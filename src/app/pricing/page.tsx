import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PricingContent } from "@/components/pricing/PricingContent";
import { getPricingPlans, getAdditionalServices } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function PricingPage() {
  const [plans, services] = await Promise.all([
    getPricingPlans(),
    getAdditionalServices(),
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
