import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ExternalLink, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Field, LargeTitle, SaveBar, Section, Segmented, SwitchRow, TopBar, useToast } from "@/components/admin/ui";
import germanDescriptions from "@/lib/car-descriptions-de.json";
import { errorMessage, useAdminFleet, useResetOverride, useSaveOverride, type OverridePatch } from "@/lib/admin-data";
import { photoSrc } from "@/lib/images";
import { categoryTiles } from "@/lib/mkr-assets";
import { formatAed, formatMoney, markupAed } from "@/lib/pricing";
import { baseFleet, carTitle, colorLabel, DEFAULT_FEATURED } from "@/lib/site-data";

export const Route = createFileRoute("/admin/fahrzeuge/$slug")({ component: CarEditor });

type Draft = {
  visible: boolean;
  available: boolean;
  featured: boolean;
  priceMode: "auto" | "fixed";
  price: string;
  name: string;
  category: string;
  km: string;
  de: string;
  en: string;
};

function CarEditor() {
  const { slug } = Route.useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { fleet, overrides, settings, isLoading } = useAdminFleet();
  const save = useSaveOverride();
  const reset = useResetOverride();
  const car = fleet.all.find((c) => c.slug === slug);
  const base = baseFleet.find((c) => c.slug === slug);
  const override = overrides[slug];
  const defaultDe = base ? (germanDescriptions as Record<string, string>)[base.title] ?? "" : "";
  const saved = useMemo<Draft | null>(() => car && base ? {
    visible: !car.hidden,
    available: car.available,
    featured: car.featured,
    priceMode: override?.priceAed ? "fixed" : "auto",
    price: String(override?.priceAed ?? car.formulaPrice),
    name: car.name,
    category: car.category,
    km: String(car.mileageLimitKm ?? ""),
    de: override?.descriptionDe ?? defaultDe,
    en: override?.descriptionEn ?? "",
  } : null, [car, base, override, defaultDe]);
  const [draft, setDraft] = useState<Draft | null>(saved);
  const [photo, setPhoto] = useState(0);
  useEffect(() => setDraft(saved), [saved]);

  if (isLoading || !draft || !saved) return <><TopBar back="/admin/fahrzeuge" /><p style={{ color: "var(--a-sub)" }}>{isLoading ? "Lädt …" : "Fahrzeug nicht gefunden."}</p></>;
  if (!car || !base) return null;

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft({ ...draft, [key]: value });
  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);
  const mkr = base.baseDailyAed;
  const eur = (aed: number) => formatMoney(aed, "EUR", "de", settings.aedPerEur);
  const customerPrice = draft.priceMode === "fixed" ? Number(draft.price) || 0 : car.formulaPrice;
  const priceInvalid = draft.priceMode === "fixed" && !(Number(draft.price) >= 1);

  function submit() {
    if (!draft || !base) return;
    if (priceInvalid) return toast("Bitte einen gültigen Preis eingeben", true);
    const km = draft.km.trim() === "" ? null : Math.round(Number(draft.km));
    const patch: OverridePatch = {
      hidden: !draft.visible,
      available: draft.available,
      featured: draft.featured === DEFAULT_FEATURED.includes(base.slug) ? null : draft.featured,
      price_aed: draft.priceMode === "fixed" ? Math.round(Number(draft.price)) : null,
      name: draft.name.trim() && draft.name.trim() !== base.name ? draft.name.trim() : null,
      category: draft.category !== base.category ? draft.category : null,
      mileage_limit_km: km !== null && Number.isFinite(km) && km !== base.mileageLimitKm ? km : null,
      description_de: draft.de.trim() && draft.de.trim() !== defaultDe.trim() ? draft.de.trim() : null,
      description_en: draft.en.trim() || null,
    };
    save.mutate({ slug: base.slug, patch }, {
      onSuccess: () => toast("Gespeichert – auf der Website in ca. 30 Sekunden sichtbar"),
      onError: (error) => toast(errorMessage(error), true),
    });
  }

  function resetAll() {
    if (!window.confirm(`Alle Änderungen an ${carTitle(car!)} zurücksetzen? Es gelten dann wieder die MKR-Originaldaten.`)) return;
    reset.mutate(slug, {
      onSuccess: () => toast("Auf Original zurückgesetzt"),
      onError: (error) => toast(errorMessage(error), true),
    });
  }

  return (
    <>
      <TopBar back="/admin/fahrzeuge" title={carTitle(car)} actions={<a className="adm-icon-btn" href={`/fleet/${car.slug}`} target="_blank" rel="noreferrer" aria-label="Auf der Website ansehen"><ExternalLink /></a>} />
      <div className="adm-hero">
        <img src={car.photos[photo] ? photoSrc(car.photos[photo]) : ""} alt={carTitle(car)} />
        <div className="adm-hero-strip">
          {car.photos.map((p, i) => <button key={p.src} type="button" className={i === photo ? "active" : ""} onClick={() => setPhoto(i)} aria-label={`Bild ${i + 1}`}><img src={p.sm} alt="" loading="lazy" /></button>)}
        </div>
      </div>
      <LargeTitle sub={`${colorLabel(car.color, "de")} · ${car.photos.length} Bilder`}>{carTitle(car)}</LargeTitle>

      <Section title="Sichtbarkeit">
        <SwitchRow title="Auf der Website anzeigen" sub={draft.visible ? "Kunden sehen dieses Fahrzeug" : "Ausgeblendet – nicht buchbar"} checked={draft.visible} onChange={(v) => set("visible", v)} />
        <SwitchRow title="Verfügbar" sub={draft.available ? "Sofort anfragbar" : "Zeigt „Derzeit vermietet“"} checked={draft.available} onChange={(v) => set("available", v)} />
        <SwitchRow title="Highlight auf der Startseite" sub="Erscheint bei „Die begehrtesten Fahrzeuge“" checked={draft.featured} onChange={(v) => set("featured", v)} />
      </Section>

      <Section title="Preis pro Tag" foot={`Automatisch = MKR-Preis ${formatAed(mkr)} + ${formatAed(markupAed(mkr, settings.markupTiers))} Aufschlag (Preisklassen unter Einstellungen). Kunden können auf der Website auf Euro umschalten: ${eur(customerPrice)}.`}>
        <div style={{ padding: "12px 16px 0" }}>
          <Segmented value={draft.priceMode} onChange={(v) => set("priceMode", v)} options={[{ id: "auto", label: `Automatisch (${formatAed(car.formulaPrice)})` }, { id: "fixed", label: "Fester Preis" }]} />
        </div>
        {draft.priceMode === "fixed" && (
          <Field label="Kundenpreis pro Tag">
            <span className="adm-field-inline"><input inputMode="numeric" value={draft.price} onChange={(e) => set("price", e.target.value.replace(/[^\d]/g, ""))} aria-invalid={priceInvalid} /><em>AED</em></span>
          </Field>
        )}
        <dl className="adm-kv">
          <dt>Kunde zahlt</dt><dd>{formatAed(customerPrice)}</dd>
          <dt>An MKR</dt><dd>− {formatAed(mkr)}</dd>
          <dt className="total">Deine Provision pro Tag</dt><dd className="total" style={{ color: customerPrice - mkr > 0 ? "var(--a-green)" : "var(--a-red)" }}>{formatAed(customerPrice - mkr)}</dd>
          <dt>In Euro (ca.)</dt><dd>{eur(customerPrice - mkr)}</dd>
        </dl>
      </Section>

      <Section title="Details">
        <Field label="Name auf der Website"><input value={draft.name} onChange={(e) => set("name", e.target.value)} placeholder={base.name} maxLength={80} /></Field>
        <Field label="Kategorie">
          <select value={draft.category} onChange={(e) => set("category", e.target.value)}>
            {categoryTiles.map((c) => <option key={c.id} value={c.id}>{c.de}</option>)}
          </select>
        </Field>
        <Field label="Inklusive Kilometer pro Tag"><span className="adm-field-inline"><input inputMode="numeric" value={draft.km} onChange={(e) => set("km", e.target.value.replace(/[^\d]/g, ""))} placeholder={String(base.mileageLimitKm ?? 250)} /><em>km</em></span></Field>
      </Section>

      <Section title="Beschreibung Deutsch" foot="Absätze mit einer Leerzeile trennen." action={draft.de.trim() !== defaultDe.trim() ? <button type="button" onClick={() => set("de", defaultDe)}>Standardtext</button> : undefined}>
        <Field label="Text auf der deutschen Fahrzeugseite"><textarea value={draft.de} onChange={(e) => set("de", e.target.value)} maxLength={8000} rows={10} /></Field>
      </Section>

      <Section title="Beschreibung Englisch" foot="Leer lassen = ausführlicher Originaltext von MKR.">
        <Field label="Text auf der englischen Fahrzeugseite"><textarea value={draft.en} onChange={(e) => set("en", e.target.value)} maxLength={8000} rows={6} placeholder="MKR-Originalbeschreibung wird verwendet" /></Field>
      </Section>

      <Section title="Original">
        <a className="adm-row" href={base.source} target="_blank" rel="noreferrer"><div className="adm-row-main"><strong>MKR-Fahrzeugseite öffnen</strong><span>{base.source.replace("https://", "")}</span></div><ExternalLink className="adm-chevron" /></a>
        <Link className="adm-row" to="/fleet/$slug" params={{ slug: car.slug }} target="_blank"><div className="adm-row-main"><strong>Auf ardadagci.com ansehen</strong><span>/fleet/{car.slug}</span></div><ExternalLink className="adm-chevron" /></Link>
      </Section>

      {override && <button type="button" className="adm-btn danger block" onClick={resetAll} disabled={reset.isPending} style={{ marginBottom: 26 }}><RotateCcw />Alle Änderungen zurücksetzen</button>}
      <button type="button" className="adm-link" style={{ display: "block", margin: "0 auto 20px" }} onClick={() => navigate({ to: "/admin/fahrzeuge" })}>Zur Fahrzeugliste</button>

      <SaveBar visible={dirty} saving={save.isPending} onSave={submit} onDiscard={() => setDraft(saved)} />
    </>
  );
}
