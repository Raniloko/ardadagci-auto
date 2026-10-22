import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Play } from "lucide-react";
import { PageIntro } from "@/components/page-intro";
import { useLanguage } from "@/lib/language";
import { carTitle, featuredCars } from "@/lib/site-data";

export const Route = createFileRoute("/tiktok")({
  head: () => ({
    meta: [
      { title: "TikTok Showcase — ARDADAGCI Dubai" },
      { name: "description", content: "Luxusauto-Walkarounds, Fahrten durch Dubai und neue Flottenzugänge von ARDADAGCI." },
      { property: "og:title", content: "TikTok Showcase — ARDADAGCI" },
      { property: "og:description", content: "Dubai vom Fahrersitz aus." },
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
      <PageIntro eyebrow="@ardadagci" title={t("Die Flotte in Bewegung.", "See the fleet in motion.")} copy={t("Walkarounds, Kaltstarts, Liefertage und ein genauer Blick auf Dubais aufregendste Autos.", "Walkarounds, cold starts, delivery days and a closer look at Dubai's most exciting cars.")} />
      <section className="site-shell section">
        <div className="social-grid">
          {featuredCars.slice(0, 8).map((car, i) => (
            <Link key={car.slug} to="/fleet/$slug" params={{ slug: car.slug }} className={`social-tile ${i === 0 ? "is-large" : ""}`}>
              <img src={car.images[1] ?? car.image} alt={carTitle(car)} loading="lazy" />
              <span className="social-overlay"><Play /><strong>{carTitle(car)}</strong></span>
            </Link>
          ))}
        </div>
        <a href="https://www.tiktok.com/" target="_blank" rel="noreferrer" className="text-link social-follow">{t("@ardadagci folgen", "Follow @ardadagci")}<ArrowUpRight /></a>
      </section>
    </>
  );
}
