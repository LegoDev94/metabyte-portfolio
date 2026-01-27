import { cookies } from "next/headers";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ContactContent } from "@/components/contact/ContactContent";
import { getContactInfo } from "@/lib/db";
import { normalizeLocale } from "@/lib/db/utils/i18n";

export const dynamic = "force-dynamic";

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
