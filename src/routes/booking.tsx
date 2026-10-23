import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, MessageCircle, ShieldCheck, Truck, Clock } from "lucide-react";
import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { CarImage } from "@/components/car-image";
import { useLanguage } from "@/lib/language";
import { formatEur } from "@/lib/pricing";
import { saveBookingRequest } from "@/lib/bookings";
import { carTitle, colorLabel } from "@/lib/site-data";
import { useSite } from "@/lib/use-site";

export const Route = createFileRoute("/booking")({
  validateSearch: (s: Record<string, unknown>) => ({ car: typeof s["car"] === "string" ? s["car"] : "" }),
  head: () => ({
    meta: [
      { title: "Reservierung — Luxusauto mieten in Dubai | ARDADAGCI" },
      { name: "description", content: "Fragen Sie die Verfügbarkeit Ihres Wunschfahrzeugs in Dubai an und senden Sie Ihre Reservierung per WhatsApp." },
      { property: "og:title", content: "Reservierung — ARDADAGCI Dubai" },
      { property: "og:description", content: "Fahrzeug, Zeitraum und Lieferort wählen und direkt reservieren." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BookingPage,
});

const DAY = 86_400_000;

function BookingPage() {
  const { language, t } = useLanguage();
  const search = Route.useSearch();
  const { fleet: { brands, cars, findCar }, contact } = useSite();
  const [slug, setSlug] = useState(search.car);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [url, setUrl] = useState<string | null>(null);
  const car = findCar(slug);
  const days = start && end ? Math.max(1, Math.round((Date.parse(end) - Date.parse(start)) / DAY)) : 0;
  const today = new Date().toISOString().slice(0, 10);
  const grouped = useMemo(() => brands.map((b) => ({ brand: b.id, cars: cars.filter((c) => c.brand === b.id) })), [brands, cars]);

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    const lines = [
      t("Hallo ARDADAGCI, ich möchte eine Reservierung anfragen.", "Hello ARDADAGCI, I would like to request a booking."),
      "",
      `${t("Fahrzeug", "Car")}: ${car ? `${carTitle(car)} (${colorLabel(car.color, language)}) – ${formatEur(car.price, language)}/${t("Tag", "day")}` : t("Bitte empfehlen", "Please recommend")}`,
      `${t("Zeitraum", "Dates")}: ${start} – ${end}${days ? ` (${days} ${t(days === 1 ? "Tag" : "Tage", days === 1 ? "day" : "days")})` : ""}`,
      ...(car && days ? [`${t("Geschätzt", "Estimate")}: ${formatEur(car.price * days, language)}`] : []),
      `${t("Lieferort", "Delivery")}: ${d.get("location")}`,
      `Name: ${d.get("name")}`,
      `${t("Telefon", "Phone")}: ${d.get("phone")}`,
      `${t("Nachricht", "Notes")}: ${d.get("notes") || "-"}`,
    ];
    const link = contact.whatsappUrl(lines.join("\n"));
    setUrl(link);
    window.open(link, "_blank", "noopener");
    // Bots fill the hidden "website" field – only real requests go to the admin dashboard.
    if (!d.get("website")) {
      void saveBookingRequest({
        car_slug: car?.slug ?? null,
        car_label: car ? `${carTitle(car)}${car.color ? ` (${car.color})` : ""}` : null,
        start_date: start || null,
        end_date: end || null,
        customer_name: String(d.get("name") ?? ""),
        customer_phone: String(d.get("phone") ?? ""),
        location: String(d.get("location") ?? ""),
        notes: String(d.get("notes") ?? ""),
        price_per_day_eur: car?.price ?? null,
        total_eur: car && days ? car.price * days : null,
        language,
      });
    }
  }

  return (
    <section className="site-shell booking-page">
      <div className="booking-copy">
        <p className="eyebrow">{t("Verfügbarkeit anfragen", "Check availability")}</p>
        <h1>{t("Reservieren Sie Ihr Traumauto", "Reserve your dream car")}</h1>
        <p className="section-copy">{t("Senden Sie uns Ihre Reisedaten. Wir bestätigen Fahrzeug, Preis und Lieferung persönlich über WhatsApp – meist innerhalb weniger Minuten.", "Send us your travel details. We confirm car, price and delivery personally via WhatsApp – usually within minutes.")}</p>
        <ul className="booking-points">
          <li><ShieldCheck />{t("0 € Kaution", "No deposit")}</li>
          <li><Truck />{t("Lieferung zu Hotel, Residenz oder Flughafen", "Delivery to hotel, residence or airport")}</li>
          <li><Clock />{t("Persönlicher 24/7 Service", "Personal 24/7 service")}</li>
        </ul>
        {car && (
          <Link to="/fleet/$slug" params={{ slug: car.slug }} className="booking-car">
            <CarImage photo={car.photos[0]} sizes="140px" alt={carTitle(car)} eager />
            <div><small>{car.brand}</small><strong>{car.name}</strong><span>{formatEur(car.price, language)} / {t("Tag", "day")}</span></div>
          </Link>
        )}
      </div>
      <form onSubmit={submit} className="booking-form">
        <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hp-field" />
        <div className="form-grid">
          <Field label={t("Fahrzeug", "Car")} wide>
            <select name="car" value={slug} onChange={(e) => setSlug(e.target.value)} className="form-control">
              <option value="">{t("Bitte empfehlen", "Please recommend")}</option>
              {grouped.map((g) => <optgroup key={g.brand} label={g.brand}>{g.cars.map((c) => <option key={c.slug} value={c.slug}>{c.name}{c.color ? ` – ${colorLabel(c.color, language)}` : ""} · {formatEur(c.price, language)}/{t("Tag", "day")}</option>)}</optgroup>)}
            </select>
          </Field>
          <Field label={t("Von", "From")}><input className="form-control" name="start" required type="date" min={today} value={start} onChange={(e) => setStart(e.target.value)} /></Field>
          <Field label={t("Bis", "To")}><input className="form-control" name="end" required type="date" min={start || today} value={end} onChange={(e) => setEnd(e.target.value)} /></Field>
          <Field label={t("Lieferort", "Delivery location")} wide><input className="form-control" name="location" required placeholder={t("Hotel, Residenz oder Flughafen", "Hotel, residence or airport")} /></Field>
          <Field label="Name"><input className="form-control" name="name" required autoComplete="name" placeholder={t("Vollständiger Name", "Full name")} /></Field>
          <Field label="WhatsApp"><input className="form-control" name="phone" required type="tel" autoComplete="tel" placeholder="+49 …" /></Field>
          <Field label={t("Nachricht", "Message")} wide><textarea className="form-control" name="notes" rows={4} placeholder={t("Anlass, Wünsche, Kindersitz …", "Occasion, wishes, child seat …")} /></Field>
        </div>
        {car && days > 0 && (
          <div className="estimate">
            <span>{days} × {formatEur(car.price, language)}</span>
            <strong>{formatEur(car.price * days, language)}</strong>
            <small>{t("Geschätzter Mietpreis – Wochen- und Monatsrabatte auf Anfrage", "Estimated rental – weekly and monthly discounts on request")}</small>
          </div>
        )}
        <button type="submit" className="btn btn-whatsapp btn-lg w-full"><MessageCircle />{t("Anfrage per WhatsApp senden", "Send request via WhatsApp")}</button>
        {url && <p className="booking-ready"><Check />{t("Ihre Anfrage wurde in WhatsApp geöffnet.", "Your request was opened in WhatsApp.")} <a href={url} target="_blank" rel="noreferrer">{t("Erneut öffnen", "Open again")}</a></p>}
      </form>
    </section>
  );
}

function Field({ label, wide = false, children }: { label: string; wide?: boolean; children: ReactNode }) {
  return <label className={`field ${wide ? "wide" : ""}`}><span>{label}</span>{children}</label>;
}
