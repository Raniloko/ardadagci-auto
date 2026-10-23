import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { CarFront, ChevronRight, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Empty, LargeTitle, Pill, Segmented, Switch, TopBar, useToast } from "@/components/admin/ui";
import { errorMessage, useAdminFleet, useSaveOverride } from "@/lib/admin-data";
import { photoSrc } from "@/lib/images";
import { formatEur } from "@/lib/pricing";
import { carTitle, colorLabel, type Car } from "@/lib/site-data";

type Filter = "alle" | "online" | "vermietet" | "ausgeblendet" | "highlights";
const FILTERS: Filter[] = ["alle", "online", "vermietet", "ausgeblendet", "highlights"];
const PAGE = 40;

export const Route = createFileRoute("/admin/fahrzeuge/")({
  validateSearch: (s: Record<string, unknown>): { filter?: Filter } => (FILTERS.includes(s["filter"] as Filter) && s["filter"] !== "alle" ? { filter: s["filter"] as Filter } : {}),
  component: CarsPage,
});

function CarsPage() {
  const { filter = "alle" } = Route.useSearch();
  const navigate = useNavigate({ from: "/admin/fahrzeuge/" });
  const { fleet, isLoading } = useAdminFleet();
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(PAGE);
  const counts = useMemo(() => ({
    alle: fleet.all.length,
    online: fleet.all.filter((c) => !c.hidden).length,
    vermietet: fleet.all.filter((c) => !c.available).length,
    ausgeblendet: fleet.all.filter((c) => c.hidden).length,
    highlights: fleet.all.filter((c) => c.featured).length,
  }), [fleet]);
  const shown = useMemo(() => {
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    return [...fleet.all]
      .sort((a, b) => `${a.brand} ${a.name}`.localeCompare(`${b.brand} ${b.name}`) || (a.color ?? "").localeCompare(b.color ?? ""))
      .filter((car) => {
        if (filter === "online" && car.hidden) return false;
        if (filter === "vermietet" && car.available) return false;
        if (filter === "ausgeblendet" && !car.hidden) return false;
        if (filter === "highlights" && !car.featured) return false;
        const text = `${carTitle(car)} ${car.originalName} ${car.color ?? ""} ${colorLabel(car.color, "de")} ${car.slug}`.toLowerCase();
        return words.every((w) => text.includes(w));
      });
  }, [fleet, filter, query]);

  return (
    <>
      <TopBar />
      <LargeTitle sub={`${counts.online} von ${counts.alle} online`}>Fahrzeuge</LargeTitle>
      <label className="adm-search"><Search /><input value={query} onChange={(e) => { setQuery(e.target.value); setLimit(PAGE); }} placeholder="Marke, Modell, Farbe …" aria-label="Fahrzeuge suchen" /></label>
      <div style={{ overflowX: "auto", margin: "0 -16px", padding: "0 16px", scrollbarWidth: "none" }}>
        <Segmented
          value={filter}
          onChange={(value) => { setLimit(PAGE); navigate({ search: value === "alle" ? {} : { filter: value }, replace: true }); }}
          options={[
            { id: "alle", label: "Alle", count: counts.alle },
            { id: "online", label: "Online", count: counts.online },
            { id: "vermietet", label: "Vermietet", count: counts.vermietet },
            { id: "ausgeblendet", label: "Aus", count: counts.ausgeblendet },
            { id: "highlights", label: "Top", count: counts.highlights },
          ]}
        />
      </div>
      {isLoading && <div className="adm-group"><div className="adm-row"><span>Lädt …</span></div></div>}
      {!isLoading && shown.length === 0 && <Empty icon={<CarFront />}>Keine Fahrzeuge für diese Auswahl.</Empty>}
      {shown.length > 0 && <div className="adm-group">{shown.slice(0, limit).map((car) => <CarRow key={car.slug} car={car} />)}</div>}
      {shown.length > limit && <div className="adm-more"><button type="button" className="adm-btn soft sm" onClick={() => setLimit(limit + PAGE)}>{shown.length - limit} weitere anzeigen</button></div>}
    </>
  );
}

function CarRow({ car }: { car: Car }) {
  const save = useSaveOverride();
  const toast = useToast();
  const toggle = (visible: boolean) =>
    save.mutate({ slug: car.slug, patch: { hidden: !visible } }, {
      onSuccess: () => toast(visible ? `${carTitle(car)} ist wieder online` : `${carTitle(car)} ausgeblendet`),
      onError: (error) => toast(errorMessage(error), true),
    });
  return (
    <div className="adm-row has-thumb">
      <Link to="/admin/fahrzeuge/$slug" params={{ slug: car.slug }} style={{ display: "contents" }}>
        <img className={`adm-thumb ${car.hidden ? "is-dim" : ""}`} src={car.photos[0] ? photoSrc(car.photos[0]) : ""} alt="" loading="lazy" />
        <div className="adm-row-main">
          <strong>{carTitle(car)}</strong>
          <span>{colorLabel(car.color, "de")} · {formatEur(car.price)}{car.priceOverridden ? " (fix)" : ""}</span>
          <span style={{ display: "flex", gap: 4, marginTop: 3 }}>
            {car.hidden ? <Pill>Ausgeblendet</Pill> : <Pill tone="green">Online</Pill>}
            {!car.available && <Pill tone="orange">Vermietet</Pill>}
            {car.featured && <Pill tone="blue">Top</Pill>}
          </span>
        </div>
      </Link>
      <Switch checked={!car.hidden} onChange={toggle} label={`${carTitle(car)} auf der Website anzeigen`} disabled={save.isPending} />
      <Link to="/admin/fahrzeuge/$slug" params={{ slug: car.slug }} aria-label={`${carTitle(car)} bearbeiten`}><ChevronRight className="adm-chevron" /></Link>
    </div>
  );
}
