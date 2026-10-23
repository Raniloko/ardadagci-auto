import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { PageIntro } from "@/components/page-intro";
import { useLanguage } from "@/lib/language";
import { EMAIL, PHONE_DISPLAY, PHONE_NUMBER, whatsappUrl } from "@/lib/site-data";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Kontakt — ARDADAGCI Dubai" },
      { name: "description", content: "Kontaktieren Sie ARDADAGCI für Luxus-Autovermietung, Lieferung und Concierge-Service in Dubai." },
      { property: "og:title", content: "Kontakt — ARDADAGCI Dubai" },
      { property: "og:description", content: "Sprechen Sie direkt mit unserem Team in Dubai." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  const { t } = useLanguage();
  const channels = [
    { icon: MessageCircle, title: "WhatsApp", text: t("Schnellste Antwort, 24 Stunden", "Fastest response, 24 hours"), href: whatsappUrl() },
    { icon: Phone, title: t("Telefon", "Phone"), text: PHONE_DISPLAY, href: `tel:${PHONE_NUMBER}` },
    ...(EMAIL ? [{ icon: Mail, title: "E-Mail", text: EMAIL, href: `mailto:${EMAIL}` }] : []),
    { icon: MapPin, title: "Dubai", text: t("Lieferung in alle Emirate", "Delivery across the UAE") },
  ];
  return (
    <>
      <PageIntro eyebrow={t("Direkter Kontakt", "Direct contact")} title={t("Lassen Sie uns über Autos sprechen.", "Let's talk cars.")} copy={t("Schnelle Antworten, persönliche Empfehlungen und kein Callcenter. Erreichen Sie uns über den Kanal, der zu Ihnen passt.", "Fast answers, personal recommendations and no call centre. Reach us through the channel that suits you.")} />
      <section className="site-shell section">
        <div className="contact-grid">
          {channels.map((c) => {
            const body = <><c.icon /><h2>{c.title}</h2><p>{c.text}</p>{c.href && <ArrowUpRight className="contact-arrow" />}</>;
            return c.href ? <a key={c.title} href={c.href} target={c.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="contact-card">{body}</a> : <div key={c.title} className="contact-card">{body}</div>;
          })}
        </div>
        <div className="cta-panel is-plain">
          <p className="eyebrow">{t("Unsicher, welches Auto?", "Not sure what to choose?")}</p>
          <h2>{t("Nennen Sie uns den Anlass. Wir finden das Auto.", "Tell us the occasion. We'll find the car.")}</h2>
          <div className="cta-actions"><Link to="/booking" search={{ car: "" }} className="btn btn-light">{t("Anfrage starten", "Start a request")}<ArrowUpRight /></Link></div>
        </div>
      </section>
    </>
  );
}
