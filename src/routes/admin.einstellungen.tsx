import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, KeyRound, LogOut, Smartphone, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Field, LargeTitle, SaveBar, Section, TopBar, useToast } from "@/components/admin/ui";
import { supabase } from "@/integrations/supabase/client";
import { errorMessage, signOut, useAdminFleet, useAdminSettings, useSaveSettings } from "@/lib/admin-data";
import { customerPriceAed, formatAed, formatMoney, type MarkupTier } from "@/lib/pricing";
import type { SiteSettings } from "@/lib/site-config";
import { carTitle, formatPhone } from "@/lib/site-data";

export const Route = createFileRoute("/admin/einstellungen")({ component: SettingsPage });

type Draft = { tiers: { from: string; add: string }[]; rate: string; whatsapp: string; phone: string; email: string; tiktok: string };

const toDraft = (s: SiteSettings): Draft => ({
  tiers: s.markupTiers.map((tier) => ({ from: String(tier.fromAed), add: String(tier.addAed) })),
  rate: String(s.aedPerEur).replace(".", ","),
  whatsapp: formatPhone(`+${s.whatsappNumber}`),
  phone: formatPhone(s.phoneNumber),
  email: s.email,
  tiktok: s.tiktokUrl,
});
const num = (value: string) => Number(value.replace(",", "."));
const digits = (value: string) => value.replace(/[^\d]/g, "");
// Sample cars for the live price preview: entry level, mid range, supercar, top models.
const EXAMPLES = ["2023-mini-cooper-s-cabriolet", "lamborghini-urus-s", "ferrari-sf-90", "lamborghini-revuelto", "ferrari-purosangue"];

function SettingsPage() {
  const toast = useToast();
  const settings = useAdminSettings();
  const { fleet } = useAdminFleet();
  const save = useSaveSettings();
  const saved = useMemo(() => (settings.data ? toDraft(settings.data) : null), [settings.data]);
  const [draft, setDraft] = useState<Draft | null>(saved);
  const [email, setEmail] = useState("");
  useEffect(() => setDraft(saved), [saved]);
  useEffect(() => { supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? "")); }, []);
  if (!draft || !saved) return <><TopBar /><LargeTitle>Einstellungen</LargeTitle><p style={{ color: "var(--a-sub)" }}>Lädt …</p></>;

  const set = (key: Exclude<keyof Draft, "tiers">, value: string) => setDraft({ ...draft, [key]: value });
  const setTier = (index: number, key: "from" | "add", value: string) => setDraft({ ...draft, tiers: draft.tiers.map((tier, i) => (i === index ? { ...tier, [key]: digits(value) } : tier)) });
  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);
  const rate = num(draft.rate);
  const tiers: MarkupTier[] = draft.tiers.map((tier, i) => ({ fromAed: i === 0 ? 0 : Number(tier.from), addAed: Number(tier.add) }));
  const tiersValid = draft.tiers.every((tier, i) => tier.add !== "" && (i === 0 || tier.from !== "")) && tiers.every((tier, i) => tier.addAed <= 5000 && (i === 0 || tier.fromAed > tiers[i - 1]!.fromAed));
  const pricingValid = tiersValid && rate >= 1 && rate <= 10;
  const pricing = { markupTiers: tiers, aedPerEur: rate };
  const examples = EXAMPLES.map((slug) => fleet.all.find((c) => c.slug === slug)).filter((c) => c !== undefined);

  function submit() {
    if (!draft) return;
    const whatsapp = draft.whatsapp.replace(/\D/g, "").replace(/^00/, "");
    const phone = draft.phone.replace(/[^\d+]/g, "");
    if (!tiersValid) return toast("Preisklassen prüfen: Startpreise müssen aufsteigen, Aufschlag max. 5.000 AED", true);
    if (!(rate >= 1 && rate <= 10)) return toast("Wechselkurs ungültig (1–10 AED pro €)", true);
    if (!/^\d{6,15}$/.test(whatsapp)) return toast("WhatsApp-Nummer bitte mit Ländervorwahl, z. B. +49 172 …", true);
    if (!/^\+?\d{6,20}$/.test(phone)) return toast("Telefonnummer ungültig", true);
    if (draft.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(draft.email.trim())) return toast("E-Mail-Adresse ungültig", true);
    if (draft.tiktok && !/^https:\/\//.test(draft.tiktok.trim())) return toast("TikTok-Link muss mit https:// beginnen", true);
    save.mutate(
      { markupTiers: tiers, aedPerEur: rate, whatsappNumber: whatsapp, phoneNumber: phone, email: draft.email.trim(), tiktokUrl: draft.tiktok.trim() },
      { onSuccess: () => toast("Gespeichert – auf der Website in ca. 30 Sekunden sichtbar"), onError: (error) => toast(errorMessage(error), true) },
    );
  }

  async function changePassword() {
    const password = window.prompt("Neues Passwort (mindestens 8 Zeichen):");
    if (!password) return;
    if (password.length < 8) return toast("Mindestens 8 Zeichen", true);
    const { error } = await supabase.auth.updateUser({ password });
    toast(error ? errorMessage(error) : "Passwort geändert", Boolean(error));
  }

  return (
    <>
      <TopBar />
      <LargeTitle>Einstellungen</LargeTitle>

      <Section title="Aufschlag je Preisklasse" foot="Kundenpreis = MKR-Tagespreis + Aufschlag der passenden Klasse. Gilt für alle Fahrzeuge ohne festen Preis.">
        {draft.tiers.map((tier, i) => {
          const next = draft.tiers[i + 1];
          const range = next ? `${formatAed(i === 0 ? 0 : Number(tier.from))} – ${formatAed(Math.max(0, Number(next.from) - 1))}` : `ab ${formatAed(Number(tier.from))}`;
          return (
            <Field key={i} label={`MKR-Preis ${range}`}>
              <span className="adm-field-inline adm-tier">
                <em>ab</em><input inputMode="numeric" aria-label="Ab MKR-Preis" value={i === 0 ? "0" : tier.from} disabled={i === 0} onChange={(e) => setTier(i, "from", e.target.value)} />
                <em>AED&nbsp;→&nbsp;+</em><input inputMode="numeric" aria-label="Aufschlag" value={tier.add} onChange={(e) => setTier(i, "add", e.target.value)} /><em>AED</em>
              </span>
            </Field>
          );
        })}
      </Section>

      <Section title="Vorschau" foot="So sehen Kunden die Tagespreise (Standard: AED, umschaltbar auf Euro).">
        {pricingValid ? (
          <dl className="adm-kv">
            {examples.map((car) => {
              const price = customerPriceAed(car.baseDailyAed, pricing);
              return [
                <dt key={`${car.slug}-t`}>{carTitle(car)}<br /><small>MKR {formatAed(car.baseDailyAed)} · +{formatAed(price - car.baseDailyAed)}</small></dt>,
                <dd key={`${car.slug}-d`}>{formatAed(price)}<br /><small style={{ color: "var(--a-sub)", fontWeight: 400 }}>≈ {formatMoney(price, "EUR", "de", rate)}</small></dd>,
              ];
            })}
          </dl>
        ) : <p className="adm-section-foot" style={{ padding: "12px 16px" }}>Bitte gültige Werte eingeben.</p>}
      </Section>

      <Section title="Euro-Umrechnung" foot="Nur für die Euro-Anzeige auf der Website. Gebucht und abgerechnet wird in AED.">
        <Field label="Wechselkurs (AED pro 1 €)"><span className="adm-field-inline"><input inputMode="decimal" value={draft.rate} onChange={(e) => set("rate", e.target.value.replace(/[^\d,.]/g, ""))} /><em>AED</em></span></Field>
      </Section>

      <Section title="Kontakt auf der Website">
        <Field label="WhatsApp-Nummer (Buchungen)"><input type="tel" value={draft.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} placeholder="+49 172 6023003" /></Field>
        <Field label="Telefon (Anrufen-Buttons)"><input type="tel" value={draft.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+49 172 6023003" /></Field>
        <Field label="E-Mail (leer = ausgeblendet)"><input type="email" value={draft.email} onChange={(e) => set("email", e.target.value)} placeholder="hello@ardadagci.com" /></Field>
        <Field label="TikTok-Profil (leer = ausgeblendet)"><input type="url" value={draft.tiktok} onChange={(e) => set("tiktok", e.target.value)} placeholder="https://www.tiktok.com/@…" /></Field>
      </Section>

      <Section title="Konto">
        <div className="adm-row"><div className="adm-row-main"><strong>Angemeldet als</strong><span>{email || "–"}</span></div></div>
        <Link to="/admin/admins" className="adm-row"><span className="adm-row-icon" style={{ background: "var(--a-green)" }}><Users /></span><div className="adm-row-main"><strong>Admins verwalten</strong><span>Weitere Admins einladen oder entfernen</span></div><ChevronRight className="adm-chevron" /></Link>
        <button type="button" className="adm-row" onClick={changePassword}><span className="adm-row-icon"><KeyRound /></span><div className="adm-row-main"><strong>Passwort ändern</strong></div></button>
        <button type="button" className="adm-row" onClick={() => signOut()}><span className="adm-row-icon" style={{ background: "var(--a-red)" }}><LogOut /></span><div className="adm-row-main"><strong style={{ color: "var(--a-red)" }}>Abmelden</strong></div></button>
      </Section>

      <Section title="App auf dem Handy" foot="Das Dashboard startet danach wie eine App – ohne App Store, mit eigenem Symbol.">
        <div className="adm-row"><span className="adm-row-icon"><Smartphone /></span><div className="adm-row-main"><strong>iPhone (Safari)</strong><span style={{ whiteSpace: "normal" }}>„Teilen“ → „Zum Home-Bildschirm“</span></div></div>
        <div className="adm-row"><span className="adm-row-icon" style={{ background: "var(--a-green)" }}><Smartphone /></span><div className="adm-row-main"><strong>Android (Chrome)</strong><span style={{ whiteSpace: "normal" }}>Menü ⋮ → „App installieren“</span></div></div>
      </Section>

      <SaveBar visible={dirty} saving={save.isPending} onSave={submit} onDiscard={() => setDraft(saved)} />
    </>
  );
}
