import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { BadgeCheck, CalendarCheck, Car as CarIcon, ChevronLeft, ChevronRight, CircleGauge, Cog, CreditCard, DoorOpen, Expand, Fuel, Gauge, Luggage, MessageCircle, Palette, Phone, Route as RouteIcon, ShieldCheck, Users, X } from "lucide-react";
import { useEffect, useState } from "react";
import { bookingMessage, CarCard } from "@/components/car-card";
import { Rail } from "@/components/car-rail";
import { CarImage } from "@/components/car-image";
import { FaqList } from "@/components/faq-list";
import { getCarContent, renderPrices } from "@/lib/car-content";
import { useLanguage } from "@/lib/language";
import { feeEur, formatEur } from "@/lib/pricing";
import { deliveryFees, documents, rentalTerms } from "@/lib/site-content";
import { carSummary, carTitle, cars, categoryLabel, colorLabel, findCar, PHONE_NUMBER, whatsappUrl, type Car } from "@/lib/site-data";

export const Route = createFileRoute("/fleet_/$slug")({
  loader: async ({ params }) => {
    const car = findCar(params.slug);
    if (!car) throw notFound();
    const content = await getCarContent({ data: car.slug });
    return { car, content };
  },
  head: ({ loaderData }) => {
    const car = loaderData?.car;
    const title = car ? `${carTitle(car)} mieten in Dubai ab ${formatEur(car.price)}/Tag — ARDADAGCI` : "Fahrzeug nicht verfügbar — ARDADAGCI";
    const description = car ? carSummary(car, "de") : "Entdecken Sie die ARDADAGCI Flotte.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        ...(car ? [{ property: "og:image", content: car.image }] : []),
        { property: "og:type", content: "product" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: CarPage,
});

function CarPage() {
  const { language, t } = useLanguage();
  const { car, content } = Route.useLoaderData();
  const similar = cars.filter((c) => c.slug !== car.slug && (c.category === car.category || c.brand === car.brand)).slice(0, 10);
  const specs: [typeof Gauge, string, string | number | null][] = [
    [CircleGauge, t("Motor", "Engine"), car.engine],
    [Gauge, "0–100 km/h", car.zeroToHundred ? `${String(car.zeroToHundred).replace(".", language === "de" ? "," : ".")} s` : null],
    [Cog, t("Getriebe", "Transmission"), car.transmission ? t("Automatik", "Automatic") : null],
    [RouteIcon, t("Antrieb", "Drive"), car.drive],
    [Fuel, t("Kraftstoff", "Fuel"), car.fuel ? t({ Petrol: "Benzin", Diesel: "Diesel", Electric: "Elektro" }[car.fuel] ?? car.fuel, car.fuel) : null],
    [Users, t("Sitze", "Seats"), car.seats],
    [DoorOpen, t("Türen", "Doors"), car.doors],
    [Luggage, t("Gepäck", "Luggage"), car.luggage ? t(`${car.luggage} Koffer`, `${car.luggage} bags`) : null],
    [Palette, t("Farbe", "Colour"), colorLabel(car.color, language)],
    [CarIcon, t("Kategorie", "Category"), categoryLabel(car.category, language)],
  ];
  const facts = [
    { icon: ShieldCheck, label: t("Kaution", "Deposit"), value: car.deposit === "none" ? t("Keine Kaution", "No deposit") : `AED ${car.deposit}` },
    { icon: RouteIcon, label: t("Inklusive", "Included"), value: `${car.mileageLimitKm ?? 250} km / ${t("Tag", "day")}` },
    { icon: Gauge, label: t("Zusatz-km", "Extra km"), value: car.extraKmEur ? `${formatEur(car.extraKmEur, language)} / km` : "–" },
    { icon: CreditCard, label: t("Zahlung", "Payment"), value: t("Karte, Bar, Krypto", "Card, cash, crypto") },
  ];

  return (
    <>
      <section className="site-shell vehicle-page">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link to="/">{t("Start", "Home")}</Link><span>/</span>
          <Link to="/fleet">{t("Flotte", "Fleet")}</Link><span>/</span>
          <Link to="/fleet" search={{ brand: car.brand }}>{car.brand}</Link><span>/</span>
          <span aria-current="page">{car.name}</span>
        </nav>
        <div className="vehicle-layout">
          <Gallery car={car} />
          <aside className="booking-panel">
            <p className="eyebrow">{car.brand} · {categoryLabel(car.category, language)}</p>
            <h1>{car.name}</h1>
            <div className="vehicle-tags">
              {car.color && <span className="chip">{colorLabel(car.color, language)}</span>}
              {car.deposit === "none" && <span className="chip chip-solid">{t("0 € Kaution", "No deposit")}</span>}
              <span className="chip">{t("Sofort anfragbar", "Request instantly")}</span>
            </div>
            <div className="price-box">
              <div><small>{t("Tagespreis", "Daily rate")}</small><strong>{formatEur(car.price, language)}</strong><small>{t("inkl. MwSt.", "incl. VAT")}</small></div>
              <div><small>{t("Wöchentlich", "Weekly")}</small><b>{t("Auf Anfrage", "On request")}</b></div>
              <div><small>{t("Monatlich", "Monthly")}</small><b>{t("Auf Anfrage", "On request")}</b></div>
            </div>
            <ul className="fact-list">{facts.map((f) => <li key={f.label}><f.icon /><span>{f.label}</span><strong>{f.value}</strong></li>)}</ul>
            <div className="panel-actions">
              <a className="btn btn-whatsapp btn-lg" href={whatsappUrl(bookingMessage(car, language))} target="_blank" rel="noreferrer"><MessageCircle />{t("Per WhatsApp buchen", "Book via WhatsApp")}</a>
              <div className="panel-actions-row">
                <Link to="/booking" search={{ car: car.slug }} className="btn btn-light"><CalendarCheck />{t("Anfrage senden", "Send request")}</Link>
                <a href={`tel:${PHONE_NUMBER}`} className="btn btn-outline"><Phone />{t("Anrufen", "Call")}</a>
              </div>
            </div>
          </aside>
        </div>

        <div className="spec-grid">{specs.filter(([, , v]) => v !== null && v !== undefined && v !== "–").map(([Icon, label, value]) => <div key={label}><Icon /><span>{label}</span><strong>{value}</strong></div>)}</div>

        <div className="vehicle-content">
          <article className="vehicle-description">
            <h2>{t(`${carTitle(car)} mieten in Dubai`, `Rent ${carTitle(car)} in Dubai`)}</h2>
            <p className="lead">{carSummary(car, language)}</p>
            {content.blocks.length > 0 && (
              <div className="prose" lang="en">
                {language === "de" && <p className="prose-note">{t("Original-Fahrzeugbeschreibung (Englisch):", "")}</p>}
                <Blocks blocks={content.blocks} />
              </div>
            )}
            {content.faqs.length > 0 && (
              <div className="vehicle-faq" lang="en">
                <h2>{t(`Häufige Fragen zum ${carTitle(car)}`, `${carTitle(car)} – FAQ`)}</h2>
                <FaqList items={content.faqs.map((f) => ({ q: renderPrices(f.q, language), a: renderPrices(f.a, language) }))} />
              </div>
            )}
          </article>
          <aside className="vehicle-sidebar">
            <div className="info-card">
              <h3>{t("Benötigte Dokumente", "Documents required")}</h3>
              {[documents.tourists, documents.residents].map((group) => (
                <div key={group.title.en}><h4>{group.title[language]}</h4><ul>{group.items.map((item) => <li key={item.en}><BadgeCheck />{item[language]}</li>)}</ul></div>
              ))}
            </div>
            <div className="info-card">
              <h3>{t("Mietbedingungen", "Rental terms")}</h3>
              <dl>{rentalTerms.map((term) => <div key={term.label.en}><dt>{term.label[language]}</dt><dd>{term.value[language]}</dd></div>)}</dl>
            </div>
            <div className="info-card">
              <h3>{t("Lieferung & Abholung", "Delivery & pick-up")}</h3>
              <dl>{deliveryFees.map((fee) => <div key={fee.label.en}><dt>{fee.label[language]}</dt><dd>{formatEur(feeEur(fee.aed), language)}</dd></div>)}</dl>
            </div>
          </aside>
        </div>
      </section>

      {similar.length > 0 && (
        <section className="site-shell section related-cars">
          <div className="section-heading"><div><p className="eyebrow">{t("Das könnte Ihnen gefallen", "You may also like")}</p><h2>{t("Ähnliche Fahrzeuge", "Similar cars")}</h2></div></div>
          <Rail>{similar.map((c) => <CarCard key={c.slug} car={c} />)}</Rail>
        </section>
      )}
    </>
  );
}

function Blocks({ blocks }: { blocks: { t: string; x: string }[] }) {
  const { language } = useLanguage();
  const out: React.ReactNode[] = [];
  let list: string[] = [];
  const flush = (key: number) => {
    if (list.length) out.push(<ul key={`ul-${key}`}>{list.map((li, i) => <li key={i}>{li}</li>)}</ul>);
    list = [];
  };
  blocks.forEach((block, i) => {
    const text = renderPrices(block.x, language);
    if (block.t === "li") { list.push(text); return; }
    flush(i);
    out.push(block.t === "h" ? <h3 key={i}>{text}</h3> : <p key={i}>{text}</p>);
  });
  flush(blocks.length);
  return <>{out}</>;
}

function Gallery({ car }: { car: Car }) {
  const { language, t } = useLanguage();
  const [index, setIndex] = useState(0);
  const [zoom, setZoom] = useState(false);
  const count = car.images.length;
  const go = (dir: number) => setIndex((i) => (i + dir + count) % count);
  useEffect(() => setIndex(0), [car.slug]);
  useEffect(() => {
    if (!zoom) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setZoom(false); if (e.key === "ArrowRight") go(1); if (e.key === "ArrowLeft") go(-1); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [zoom, count]);
  const alt = `${carTitle(car)} ${colorLabel(car.color, language)} – ${t("Bild", "image")} ${index + 1}`;
  return (
    <div className="gallery">
      <div className="gallery-main">
        <CarImage key={index} photo={car.photos[index]} sizes="(max-width: 1100px) 100vw, 60vw" alt={alt} eager={index === 0} />
        {count > 1 && <>
          <button type="button" className="gallery-nav prev" onClick={() => go(-1)} aria-label={t("Vorheriges Bild", "Previous image")}><ChevronLeft /></button>
          <button type="button" className="gallery-nav next" onClick={() => go(1)} aria-label={t("Nächstes Bild", "Next image")}><ChevronRight /></button>
        </>}
        <button type="button" className="gallery-zoom" onClick={() => setZoom(true)} aria-label={t("Vollbild", "Full screen")}><Expand /></button>
        <span className="gallery-count">{index + 1} / {count}</span>
      </div>
      {count > 1 && <div className="gallery-thumbs">{car.images.map((src, i) => <button key={src} type="button" className={i === index ? "active" : ""} onClick={() => setIndex(i)} aria-label={`${t("Bild", "Image")} ${i + 1}`}><CarImage photo={car.photos[i]} sizes="112px" alt="" /></button>)}</div>}
      {zoom && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label={carTitle(car)} onClick={() => setZoom(false)}>
          <img src={car.images[index]} alt={alt} onClick={(e) => e.stopPropagation()} />
          <button type="button" className="lightbox-close icon-btn" onClick={() => setZoom(false)} aria-label={t("Schließen", "Close")}><X /></button>
          {count > 1 && <>
            <button type="button" className="gallery-nav prev" onClick={(e) => { e.stopPropagation(); go(-1); }} aria-label={t("Vorheriges Bild", "Previous image")}><ChevronLeft /></button>
            <button type="button" className="gallery-nav next" onClick={(e) => { e.stopPropagation(); go(1); }} aria-label={t("Nächstes Bild", "Next image")}><ChevronRight /></button>
          </>}
        </div>
      )}
    </div>
  );
}
