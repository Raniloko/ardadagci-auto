import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import aboutImage from "@/assets/hero-lamborghini-dubai.jpg";
import { PageIntro } from "@/components/page-intro";
import { useLanguage } from "@/lib/language";
import { useSite } from "@/lib/use-site";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Über Arda — ARDADAGCI Dubai" },
      { name: "description", content: "Lernen Sie Arda kennen – der persönliche Standard hinter ARDADAGCI Luxus-Autovermietung in Dubai." },
      { property: "og:title", content: "Über Arda — ARDADAGCI Dubai" },
      { property: "og:description", content: "Ein persönlicherer Standard der Luxus-Autovermietung." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  const { t } = useLanguage();
  const { fleetStats } = useSite().fleet;
  const values = [t("Kuratiert, nie überladen", "Curated, never crowded"), t("Service ohne Skript", "Service without scripts"), t("Zustand vor Kompromiss", "Condition over compromise"), t("Dubai-Know-how", "Dubai knowledge")];
  return (
    <>
      <PageIntro eyebrow={t("Unsere Geschichte", "Our story")} title={t("Gebaut auf Vertrauen.", "Built around trust.")} copy={t("Eine Boutique-Vermietung in Dubai, bei der jeder Kunde direkt mit Menschen spricht, die die Autos kennen.", "A boutique Dubai rental where every client speaks directly with people who know the cars.")} />
      <section className="site-shell section about-layout">
        <img src={aboutImage} alt={t("Lamborghini Revuelto vor der Skyline von Dubai", "Lamborghini Revuelto in front of the Dubai skyline")} width={1920} height={1200} />
        <div>
          <p className="about-quote">{t("„Wahrer Luxus ist das Wissen, dass alles erledigt ist, bevor Sie ankommen.“", "“The real luxury is knowing everything has been handled before you arrive.”")}</p>
          <div className="about-text">
            <p>{t("Nach vielen Jahren in Dubai sah Arda eine Lücke zwischen beeindruckenden Autos und wirklich beeindruckendem Service. ARDADAGCI wurde gegründet, um beides zusammenzubringen.", "After many years in Dubai, Arda saw a gap between impressive cars and genuinely impressive service. ARDADAGCI was created to bring both together.")}</p>
            <p>{t(`Gemeinsam mit unserem Flottenpartner in Dubai bieten wir heute über ${fleetStats.cars} Fahrzeuge aus ${fleetStats.brands} Marken – von Economy bis Hypercar, jedes geprüft und gepflegt.`, `Together with our fleet partner in Dubai we now offer ${fleetStats.cars}+ cars from ${fleetStats.brands} brands – from economy to hypercar, each inspected and maintained.`)}</p>
            <p>{t("Der Ansatz bleibt bewusst persönlich: direkte Kommunikation, sorgfältig vorbereitete Fahrzeuge, klare Preise und Unterstützung, wann immer sie gebraucht wird.", "The approach remains deliberately personal: direct communication, carefully prepared cars, clear pricing and support whenever it is needed.")}</p>
          </div>
          <p className="signature">Arda Dagci</p>
          <div className="value-grid">{values.map((v, i) => <div key={v}><span>0{i + 1}</span><p>{v}</p></div>)}</div>
          <Link to="/fleet" className="btn btn-light">{t("Flotte entdecken", "Explore the fleet")}<ArrowRight /></Link>
        </div>
      </section>
    </>
  );
}
