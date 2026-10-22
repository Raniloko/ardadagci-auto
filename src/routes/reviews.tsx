import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Star } from "lucide-react";
import { PageIntro } from "@/components/page-intro";
import { useLanguage } from "@/lib/language";
import { reviews } from "@/lib/site-data";

export const Route = createFileRoute("/reviews")({
  head: () => ({
    meta: [
      { title: "Kundenbewertungen — ARDADAGCI Dubai" },
      { name: "description", content: "Erfahrungen unserer Kunden mit ARDADAGCI Luxus-Autovermietung in Dubai." },
      { property: "og:title", content: "Kundenbewertungen — ARDADAGCI" },
      { property: "og:description", content: "Fünf-Sterne-Fahrten in Dubai, erzählt von unseren Kunden." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  const { t } = useLanguage();
  return (
    <>
      <PageIntro eyebrow={t("Kundenstimmen", "Client notes")} title={t("Fünf-Sterne-Fahrten.", "Five-star drives.")} copy={t("Unsere liebsten Fahrten sind die, an die sich Kunden noch lange nach der Schlüsselrückgabe erinnern.", "Our favourite journeys are the ones clients remember long after the keys come back.")} />
      <section className="site-shell section">
        <div className="review-grid is-wide">
          {reviews.map((r) => (
            <figure key={r.name} className="review-card">
              <div className="stars">{Array.from({ length: 5 }).map((_, j) => <Star key={j} />)}</div>
              <blockquote>“{r.quote}”</blockquote>
              <figcaption><strong>{r.name}</strong><span>{r.location} · {r.car}</span></figcaption>
            </figure>
          ))}
        </div>
        <div className="cta-panel is-plain">
          <h2>{t("Bereit für Ihre eigene Geschichte?", "Ready to create your own story?")}</h2>
          <div className="cta-actions"><Link to="/booking" search={{ car: "" }} className="btn btn-light">{t("Fahrt buchen", "Book your drive")}<ArrowRight /></Link></div>
        </div>
      </section>
    </>
  );
}
