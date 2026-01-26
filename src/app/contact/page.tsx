import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ContactContent } from "@/components/contact/ContactContent";
import { getContactInfo } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const contactInfo = await getContactInfo();

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
