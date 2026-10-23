import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, BadgeCheck, Car as CarIcon, Clock, CreditCard, MapPin, MessageCircle, Search, ShieldCheck, Sparkles, Star, Tag, Truck } from "lucide-react";
import { useState, type FormEvent } from "react";
import { CarCard } from "@/components/car-card";
import { CarImage } from "@/components/car-image";
import { Rail } from "@/components/car-rail";
import { BrandMarquee, CategoryTiles } from "@/components/discovery-filters";
import { FaqList } from "@/components/faq-list";
import { SectionHeading } from "@/components/section-heading";
import { useLanguage } from "@/lib/language";
import { photoSrc } from "@/lib/images";
import { mkrHero } from "@/lib/mkr-assets";
import { formatEur } from "@/lib/pricing";
import { brandStories, documents, faqGroups, features, locations, steps } from "@/lib/site-content";
import { baseFleet, carTitle, reviews } from "@/lib/site-data";
import { useSite } from "@/lib/use-site";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ARDADAGCI — Luxusauto mieten in Dubai ohne Kaution" },
      { name: "description", content: `Über ${baseFleet.length} Luxus-, Sport- und SUV-Mietwagen in Dubai ohne Kaution. Lamborghini, Ferrari, Rolls-Royce & mehr – mit Lieferung und Buchung per WhatsApp.` },
      { property: "og:title", content: "ARDADAGCI — Luxusauto mieten in Dubai" },
      { property: "og:description", content: "Lamborghini, Ferrari, Rolls-Royce und mehr in Dubai mieten – ohne Kaution, mit Lieferung." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});

const featureIcons = { shield: ShieldCheck, clock: Clock, car: CarIcon, sparkles: Sparkles, card: CreditCard, tag: Tag, truck: Truck, star: BadgeCheck };

function HomePage() {
  const { language, t } = useLanguage();
  const { fleet: { brands, cars, categories, featuredCars }, contact } = useSite();
  const [faqGroup, setFaqGroup] = useState(0);
  return (
    <div className="home">
      <Hero />

      <section className="site-shell section brand-section" aria-label={t("Marken", "Brands")}>
        <SectionHeading eyebrow={t(`${brands.length} Marken`, `${brands.length} brands`)} title={t("Nach Marke entdecken", "Browse by brand")} />
        <BrandMarquee />
      </section>

      <section className="site-shell section">
        <SectionHeading eyebrow={t("Kategorien", "Categories")} title={t("Finden Sie Ihren Fahrzeugtyp", "Find your type of car")} action={<Link to="/fleet" className="text-link">{t("Gesamte Flotte", "Entire fleet")}<ArrowRight /></Link>} />
        <CategoryTiles />
      </section>

      <section className="section highlight-section">
        <div className="site-shell">
          <SectionHeading eyebrow={t("Highlights", "Highlights")} title={t("Die begehrtesten Fahrzeuge", "The most wanted cars")} copy={t("Hypercars, Supersportwagen und Luxus-SUVs – sofort verfügbar, ohne Kaution und direkt zu Ihnen geliefert.", "Hypercars, supercars and luxury SUVs – available now, with no deposit and delivered to you.")} />
          <Rail>{featuredCars.map((car, i) => <CarCard key={car.slug} car={car} eager={i < 3} />)}</Rail>
        </div>
      </section>

      {categories.map((category) => (
        <section key={category.id} className="site-shell section category-row">
          <SectionHeading
            eyebrow={`${category.count} ${t("Fahrzeuge", "cars")} · ${t("ab", "from")} ${formatEur(category.fromPrice, language)}`}
            title={t(`${category.de} mieten in Dubai`, `Rent ${category.en.toLowerCase()} cars in Dubai`)}
            action={<Link to="/fleet" search={{ category: category.id }} className="text-link">{t("Alle ansehen", "View all")}<ArrowRight /></Link>}
          />
          <Rail>{cars.filter((car) => car.category === category.id).slice(0, 10).map((car) => <CarCard key={car.slug} car={car} />)}</Rail>
        </section>
      ))}

      <section className="section why-section">
        <div className="site-shell">
          <SectionHeading align="center" eyebrow={t("Warum ARDADAGCI", "Why ARDADAGCI")} title={t("Luxus ohne Kompromisse", "Luxury without compromise")} copy={t("Alles, was Ihre Miete in Dubai unkompliziert macht – von der Anfrage bis zur Rückgabe.", "Everything that makes renting in Dubai effortless – from request to return.")} />
          <div className="feature-grid">
            {features.map((f) => {
              const Icon = featureIcons[f.icon];
              return <div key={f.title.en} className="feature-card"><Icon /><h3>{f.title[language]}</h3><p>{f.text[language]}</p></div>;
            })}
          </div>
        </div>
      </section>

      <section className="site-shell section">
        <SectionHeading eyebrow={t("Marken im Fokus", "Brands in focus")} title={t("Ikonen, die Dubai prägen", "Icons that define Dubai")} />
        <div className="story-list">
          {brandStories.map((story, i) => {
            const car = cars.find((c) => c.brand === story.brand);
            return (
              <article key={story.brand} className={`story ${i % 2 ? "is-reversed" : ""}`}>
                {car && <Link to="/fleet" search={{ brand: story.brand }} className="story-media"><CarImage photo={car.photos[0]} sizes="(max-width: 1100px) 100vw, 55vw" alt={carTitle(car)} /></Link>}
                <div className="story-copy">
                  <p className="eyebrow">{cars.filter((c) => c.brand === story.brand).length} {t("Fahrzeuge", "cars")}</p>
                  <h3>{story.title[language]}</h3>
                  <p>{story.text[language]}</p>
                  <Link to="/fleet" search={{ brand: story.brand }} className="btn btn-outline">{t(`${story.brand}-Flotte ansehen`, `View ${story.brand} fleet`)}<ArrowRight /></Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="site-shell section">
        <SectionHeading eyebrow={t("Preise", "Prices")} title={t("Tagespreise im Überblick", "Daily rates at a glance")} copy={t("Alle Preise pro Tag in Euro inklusive MwSt. – keine versteckten Gebühren bei der Übergabe.", "All prices per day in euros including VAT – no hidden fees at handover.")} />
        <div className="price-columns">
          {(["Sports", "Luxury", "SUV"] as const).map((id) => {
            const category = categories.find((c) => c.id === id)!;
            return (
              <div key={id} className="price-column">
                <h3>{category[language]}</h3>
                <ul>
                  {cars.filter((c, i, all) => c.category === id && all.findIndex((o) => carTitle(o) === carTitle(c)) === i).slice(0, 5).map((car) => (
                    <li key={car.slug}><Link to="/fleet/$slug" params={{ slug: car.slug }}><span>{carTitle(car)}</span><strong>{formatEur(car.price, language)}<small>/{t("Tag", "day")}</small></strong></Link></li>
                  ))}
                </ul>
                <Link to="/fleet" search={{ category: id }} className="text-link">{t("Alle Preise", "All prices")}<ArrowRight /></Link>
              </div>
            );
          })}
        </div>
      </section>

      <section className="site-shell section">
        <div className="steps-panel">
          <SectionHeading eyebrow={t("So funktioniert's", "How it works")} title={t("In vier Schritten ans Steuer", "Behind the wheel in four steps")} />
          <ol className="steps">
            {steps.map((step, i) => <li key={step.title.en}><span>0{i + 1}</span><h3>{step.title[language]}</h3><p>{step.text[language]}</p></li>)}
          </ol>
          <div className="steps-actions">
            <Link to="/booking" search={{ car: "" }} className="btn btn-light">{t("Jetzt Buchung starten", "Start booking now")}<ArrowRight /></Link>
            <a href={contact.whatsappUrl()} target="_blank" rel="noreferrer" className="btn btn-whatsapp"><MessageCircle />WhatsApp</a>
          </div>
        </div>
      </section>

      <section className="site-shell section two-col">
        <div>
          <SectionHeading eyebrow={t("Dokumente", "Documents")} title={t("Was Sie zur Miete benötigen", "What you need to rent")} />
          <div className="doc-grid">
            {[documents.tourists, documents.residents].map((group) => (
              <div key={group.title.en} className="doc-card"><h3>{group.title[language]}</h3><ul>{group.items.map((item) => <li key={item.en}><BadgeCheck />{item[language]}</li>)}</ul></div>
            ))}
          </div>
        </div>
        <div>
          <SectionHeading eyebrow={t("Lieferung", "Delivery")} title={t("Wir liefern in alle Emirate", "We deliver across the UAE")} />
          <div className="location-cloud">{locations.map((l) => <span key={l}><MapPin />{l}</span>)}</div>
        </div>
      </section>

      <section className="site-shell section">
        <SectionHeading eyebrow={t("Kundenstimmen", "Testimonials")} title={t("Was unsere Kunden sagen", "What our clients say")} action={<Link to="/reviews" className="text-link">{t("Alle Bewertungen", "All reviews")}<ArrowRight /></Link>} />
        <div className="review-grid">
          {reviews.slice(0, 3).map((r) => (
            <figure key={r.name} className="review-card">
              <div className="stars">{Array.from({ length: 5 }).map((_, j) => <Star key={j} />)}</div>
              <blockquote>“{r.quote}”</blockquote>
              <figcaption><strong>{r.name}</strong><span>{r.location} · {r.car}</span></figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="site-shell section faq-section">
        <SectionHeading eyebrow="FAQ" title={t("Häufige Fragen", "Frequently asked questions")} />
        <div className="faq-layout">
          <div className="faq-tabs" role="tablist">
            {faqGroups.map((group, i) => <button key={group.title.en} type="button" role="tab" aria-selected={faqGroup === i} className={faqGroup === i ? "active" : ""} onClick={() => setFaqGroup(i)}>{group.title[language]}</button>)}
          </div>
          <FaqList items={faqGroups[faqGroup]!.items.map((item) => ({ q: item.q[language], a: item.a[language] }))} />
        </div>
      </section>

      <section className="site-shell section">
        <div className="cta-panel" style={{ backgroundImage: `linear-gradient(90deg, rgb(0 0 0 / .92) 30%, rgb(0 0 0 / .35)), url(${featuredCars[0]?.photos[1] ? photoSrc(featuredCars[0].photos[1]) : mkrHero.src})` }}>
          <p className="eyebrow">{t("Persönlicher Service", "Personal service")}</p>
          <h2>{t("Ihr Traumauto. In Dubai. Heute noch.", "Your dream car. In Dubai. Today.")}</h2>
          <p>{t("Schreiben Sie uns Ihr Wunschfahrzeug und Ihre Reisedaten – wir bestätigen Verfügbarkeit und Preis innerhalb weniger Minuten.", "Send us your dream car and travel dates – we confirm availability and price within minutes.")}</p>
          <div className="cta-actions">
            <a href={contact.whatsappUrl()} target="_blank" rel="noreferrer" className="btn btn-whatsapp"><MessageCircle />{t("Per WhatsApp anfragen", "Ask on WhatsApp")}</a>
            <Link to="/fleet" className="btn btn-outline">{t("Flotte ansehen", "View fleet")}<ArrowRight /></Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function Hero() {
  const { language, t } = useLanguage();
  const { brands, categories, fleetStats } = useSite().fleet;
  const navigate = useNavigate();
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [query, setQuery] = useState("");
  function submit(e: FormEvent) {
    e.preventDefault();
    navigate({ to: "/fleet", search: { ...(category ? { category } : {}), ...(brand ? { brand } : {}), ...(query.trim() ? { q: query.trim() } : {}) } });
  }
  return (
    <section className="hero">
      <img className="hero-image" src={mkrHero.src} srcSet={`${mkrHero.small} 960w, ${mkrHero.src} 1920w`} sizes="100vw" width={1920} height={1088} alt="" fetchPriority="high" decoding="async" />
      <div className="hero-scrim" />
      <div className="site-shell hero-inner">
        <p className="eyebrow hero-eyebrow">{t("Luxus-Autovermietung in Dubai", "Luxury car rental in Dubai")}</p>
        <h1>{t(<>Dubais exklusivste<br />Autos. <em>Ohne Kaution.</em></>, <>Dubai's most exclusive<br />cars. <em>No deposit.</em></>)}</h1>
        <p className="hero-copy">{t(`Über ${fleetStats.cars} Fahrzeuge von Lamborghini bis Rolls-Royce – geliefert zu Ihrem Hotel, gebucht in Minuten per WhatsApp.`, `${fleetStats.cars}+ cars from Lamborghini to Rolls-Royce – delivered to your hotel, booked in minutes via WhatsApp.`)}</p>
        <form className="hero-search" onSubmit={submit}>
          <label><span>{t("Kategorie", "Category")}</span>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">{t("Alle Kategorien", "All categories")}</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c[language]}</option>)}
            </select>
          </label>
          <label><span>{t("Marke", "Brand")}</span>
            <select value={brand} onChange={(e) => setBrand(e.target.value)}>
              <option value="">{t("Alle Marken", "All brands")}</option>
              {brands.map((b) => <option key={b.id} value={b.id}>{b.id}</option>)}
            </select>
          </label>
          <label><span>{t("Modell", "Model")}</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("z. B. Urus, G63, SF90", "e.g. Urus, G63, SF90")} /></label>
          <button type="submit" className="btn btn-light"><Search />{t("Fahrzeuge finden", "Find cars")}</button>
        </form>
        <ul className="hero-trust">
          <li><ShieldCheck />{t("0 € Kaution", "No deposit")}</li>
          <li><Truck />{t("Lieferung in ganz Dubai", "Delivery across Dubai")}</li>
          <li><Clock />{t("24/7 erreichbar", "Available 24/7")}</li>
          <li><CarIcon />{fleetStats.cars} {t("Fahrzeuge", "cars")} · {t("ab", "from")} {formatEur(fleetStats.fromPrice, language)}</li>
        </ul>
      </div>
    </section>
  );
}
