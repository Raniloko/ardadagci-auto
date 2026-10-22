import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Fuel, Gauge, MessageCircle, Users } from "lucide-react";
import { useLanguage } from "@/lib/language";
import { CarImage } from "./car-image";
import { formatEur } from "@/lib/pricing";
import { carTitle, categoryLabel, colorLabel, whatsappUrl, type Car } from "@/lib/site-data";

export function bookingMessage(car: Car, language: "de" | "en") {
  return language === "de"
    ? `Hallo ARDADAGCI, ich interessiere mich für den ${carTitle(car)} (${colorLabel(car.color, "de")}) für ${formatEur(car.price, "de")}/Tag. Ist er verfügbar?`
    : `Hello ARDADAGCI, I'm interested in the ${carTitle(car)} (${car.color ?? "-"}) for ${formatEur(car.price, "en")}/day. Is it available?`;
}

export function CarCard({ car, eager = false }: { car: Car; eager?: boolean }) {
  const { language, t } = useLanguage();
  return (
    <article className="car-card">
      <Link to="/fleet/$slug" params={{ slug: car.slug }} className="car-card-media" aria-label={carTitle(car)}>
        <CarImage photo={car.photos[0]} sizes="(max-width: 760px) 82vw, (max-width: 1280px) 31vw, 330px" alt={`${carTitle(car)} ${colorLabel(car.color, language)}`} eager={eager} />
        <span className="car-card-badges">
          {car.deposit === "none" && <span className="chip chip-solid">{t("0 € Kaution", "No deposit")}</span>}
          <span className="chip">{categoryLabel(car.category, language)}</span>
        </span>
        <span className="car-card-open"><ArrowUpRight /></span>
      </Link>
      <div className="car-card-body">
        <div className="car-card-title">
          <p>{car.brand}{car.color ? ` · ${colorLabel(car.color, language)}` : ""}</p>
          <h3><Link to="/fleet/$slug" params={{ slug: car.slug }}>{car.name}</Link></h3>
        </div>
        <ul className="car-card-specs">
          {car.seats && <li><Users />{car.seats} {t("Sitze", "seats")}</li>}
          {car.zeroToHundred && <li><Gauge />{String(car.zeroToHundred).replace(".", language === "de" ? "," : ".")} s</li>}
          {car.engine && <li><Fuel />{car.engine.length > 12 ? car.fuel : car.engine}</li>}
        </ul>
        <div className="car-card-footer">
          <div className="price"><small>{t("ab", "from")}</small><strong>{formatEur(car.price, language)}</strong><small>/ {t("Tag", "day")}</small></div>
          <div className="car-card-actions">
            <a className="icon-btn whatsapp" href={whatsappUrl(bookingMessage(car, language))} target="_blank" rel="noreferrer" aria-label={t(`${carTitle(car)} per WhatsApp anfragen`, `Ask about ${carTitle(car)} on WhatsApp`)}><MessageCircle /></a>
            <Link to="/fleet/$slug" params={{ slug: car.slug }} className="btn btn-light btn-sm">{t("Details", "Details")}</Link>
          </div>
        </div>
      </div>
    </article>
  );
}
