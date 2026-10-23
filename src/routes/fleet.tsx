import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { CarCard } from "@/components/car-card";
import { useLanguage } from "@/lib/language";
import { baseFleet, carTitle } from "@/lib/site-data";
import { useSite } from "@/lib/use-site";

type Sort = "recommended" | "price-asc" | "price-desc";
type FleetSearch = { category?: string; brand?: string; q?: string; sort?: Sort };

const str = (v: unknown) => (typeof v === "string" && v ? v : undefined);
const PAGE = 24;

export const Route = createFileRoute("/fleet")({
  validateSearch: (s: Record<string, unknown>): FleetSearch => {
    const out: FleetSearch = {};
    const category = str(s["category"]), brand = str(s["brand"]), q = str(s["q"]), sort = str(s["sort"]);
    if (category) out.category = category;
    if (brand) out.brand = brand;
    if (q) out.q = q;
    if (sort === "price-asc" || sort === "price-desc") out.sort = sort;
    return out;
  },
  head: () => ({
    meta: [
      { title: "Flotte — Luxusautos mieten in Dubai | ARDADAGCI" },
      { name: "description", content: `${baseFleet.length} Luxusautos, Sportwagen, Cabrios und SUVs zur Miete in Dubai – ohne Kaution. Filtern nach Marke, Kategorie und Preis.` },
      { property: "og:title", content: "Flotte — ARDADAGCI Dubai" },
      { property: "og:description", content: "Lamborghini, Ferrari, Rolls-Royce, Mercedes G63 und mehr in Dubai mieten." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FleetPage,
});

function FleetPage() {
  const { language, t } = useLanguage();
  const { brands, cars, categories } = useSite().fleet;
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/fleet" });
  const [query, setQuery] = useState(search.q ?? "");
  const [limit, setLimit] = useState(PAGE);
  const update = (next: { [K in keyof FleetSearch]?: FleetSearch[K] | undefined }) => navigate({ search: (prev) => Object.fromEntries(Object.entries({ ...prev, ...next }).filter(([, v]) => v)) as FleetSearch, replace: true, resetScroll: false });

  useEffect(() => setQuery(search.q ?? ""), [search.q]);
  useEffect(() => {
    const id = setTimeout(() => { if ((search.q ?? "") !== query.trim()) update({ q: query.trim() || undefined }); }, 250);
    return () => clearTimeout(id);
  }, [query]);
  useEffect(() => setLimit(PAGE), [search.category, search.brand, search.q, search.sort]);

  const shown = useMemo(() => {
    const words = (search.q ?? "").toLowerCase().split(/\s+/).filter(Boolean);
    const list = cars.filter((car) => {
      if (search.category && car.category !== search.category) return false;
      if (search.brand && car.brand !== search.brand) return false;
      const text = `${carTitle(car)} ${car.title} ${car.color ?? ""} ${car.category}`.toLowerCase();
      return words.every((w) => text.includes(w));
    });
    if (search.sort === "price-asc") return [...list].sort((a, b) => a.price - b.price);
    if (search.sort === "price-desc") return [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [search, cars]);

  const activeCategory = categories.find((c) => c.id === search.category);
  const hasFilters = Boolean(search.category || search.brand || search.q);
  const heading = search.brand ? t(`${search.brand} mieten in Dubai`, `Rent ${search.brand} in Dubai`) : activeCategory ? t(`${activeCategory.de} mieten in Dubai`, `Rent ${activeCategory.en.toLowerCase()} cars in Dubai`) : t("Unsere gesamte Flotte", "Our entire fleet");

  return (
    <>
      <section className="site-shell fleet-intro">
        <p className="eyebrow">{t("Luxus-Autovermietung Dubai", "Luxury car rental Dubai")}</p>
        <h1>{heading}</h1>
        <p className="section-copy">{t("Alle Fahrzeuge ohne Kaution, mit Lieferung in ganz Dubai und persönlicher Bestätigung per WhatsApp.", "Every car with no deposit, delivery across Dubai and personal confirmation via WhatsApp.")}</p>
      </section>

      <section className="fleet-toolbar-wrap">
        <div className="site-shell fleet-toolbar">
          <div className="chip-row" role="group" aria-label={t("Kategorie", "Category")}>
            <button type="button" className={`filter-chip ${!search.category ? "active" : ""}`} onClick={() => update({ category: undefined })}>{t("Alle", "All")} <small>{cars.length}</small></button>
            {categories.map((c) => <button key={c.id} type="button" className={`filter-chip ${search.category === c.id ? "active" : ""}`} onClick={() => update({ category: search.category === c.id ? undefined : c.id })}>{c[language]} <small>{c.count}</small></button>)}
          </div>
          <div className="toolbar-controls">
            <label className="search-field"><Search /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("Marke, Modell oder Farbe", "Brand, model or colour")} aria-label={t("Flotte durchsuchen", "Search fleet")} />{query && <button type="button" onClick={() => setQuery("")} aria-label={t("Suche löschen", "Clear search")}><X /></button>}</label>
            <label className="select-field"><span className="sr-only">{t("Marke", "Brand")}</span>
              <select value={search.brand ?? ""} onChange={(e) => update({ brand: e.target.value || undefined })}>
                <option value="">{t("Alle Marken", "All brands")}</option>
                {brands.map((b) => <option key={b.id} value={b.id}>{b.id} ({b.count})</option>)}
              </select>
            </label>
            <label className="select-field"><SlidersHorizontal /><span className="sr-only">{t("Sortierung", "Sort")}</span>
              <select value={search.sort ?? "recommended"} onChange={(e) => update({ sort: e.target.value === "recommended" ? undefined : (e.target.value as Sort) })}>
                <option value="recommended">{t("Empfohlen", "Recommended")}</option>
                <option value="price-asc">{t("Preis aufsteigend", "Price: low to high")}</option>
                <option value="price-desc">{t("Preis absteigend", "Price: high to low")}</option>
              </select>
            </label>
          </div>
        </div>
      </section>

      <section className="site-shell fleet-results">
        <div className="results-meta">
          <span>{shown.length} {t("Fahrzeuge", "cars")}</span>
          {hasFilters && <button type="button" className="text-link" onClick={() => { setQuery(""); navigate({ search: {}, replace: true }); }}>{t("Filter zurücksetzen", "Reset filters")}<X /></button>}
        </div>
        {shown.length ? (
          <div className="fleet-grid">{shown.slice(0, limit).map((car, i) => <CarCard key={car.slug} car={car} eager={i < 4} />)}</div>
        ) : (
          <div className="empty-state"><p>{t("Keine Fahrzeuge für diese Auswahl gefunden.", "No cars found for this selection.")}</p><button type="button" className="btn btn-outline" onClick={() => { setQuery(""); navigate({ search: {}, replace: true }); }}>{t("Filter zurücksetzen", "Reset filters")}</button></div>
        )}
        {shown.length > limit && <div className="load-more"><button type="button" className="btn btn-outline" onClick={() => setLimit(limit + PAGE)}>{t(`Weitere Fahrzeuge laden (${shown.length - limit})`, `Load more cars (${shown.length - limit})`)}</button></div>}
      </section>
    </>
  );
}
