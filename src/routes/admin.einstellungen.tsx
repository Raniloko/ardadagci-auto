import { createFileRoute } from "@tanstack/react-router";
import { KeyRound, LogOut, Smartphone } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Field, LargeTitle, SaveBar, Section, TopBar, useToast } from "@/components/admin/ui";
import { supabase } from "@/integrations/supabase/client";
import { errorMessage, signOut, useAdminFleet, useAdminSettings, useSaveSettings } from "@/lib/admin-data";
import { aedToEur, customerPriceEur, formatEur } from "@/lib/pricing";
import type { SiteSettings } from "@/lib/site-config";
import { carTitle, formatPhone } from "@/lib/site-data";

export const Route = createFileRoute("/admin/einstellungen")({ component: SettingsPage });

type Draft = { markup: string; rate: string; whatsapp: string; phone: string; email: string; tiktok: string };

const toDraft = (s: SiteSettings): Draft => ({
  markup: String(s.markupPercent).replace(".", ","),
  rate: String(s.aedPerEur).replace(".", ","),
  whatsapp: formatPhone(`+${s.whatsappNumber}`),
  phone: formatPhone(s.phoneNumber),
  email: s.email,
  tiktok: s.tiktokUrl,
});
const num = (value: string) => Number(value.replace(",", "."));

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

  const set = (key: keyof Draft, value: string) => setDraft({ ...draft, [key]: value });
  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);
  const markup = num(draft.markup);
  const rate = num(draft.rate);
  const example = fleet.all.find((c) => c.slug === "lamborghini-urus-s") ?? fleet.all[0];
  const pricingValid = markup >= 0 && markup <= 500 && rate >= 1 && rate <= 10;

  function submit() {
    if (!draft) return;
    const whatsapp = draft.whatsapp.replace(/\D/g, "").replace(/^00/, "");
    const phone = draft.phone.replace(/[^\d+]/g, "");
    if (!pricingValid) return toast("Aufschlag (0–500 %) oder Wechselkurs (1–10) ungültig", true);
    if (!/^\d{6,15}$/.test(whatsapp)) return toast("WhatsApp-Nummer bitte mit Ländervorwahl, z. B. +49 172 …", true);
    if (!/^\+?\d{6,20}$/.test(phone)) return toast("Telefonnummer ungültig", true);
    if (draft.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(draft.email.trim())) return toast("E-Mail-Adresse ungültig", true);
    if (draft.tiktok && !/^https:\/\//.test(draft.tiktok.trim())) return toast("TikTok-Link muss mit https:// beginnen", true);
    save.mutate(
      { markupPercent: markup, aedPerEur: rate, whatsappNumber: whatsapp, phoneNumber: phone, email: draft.email.trim(), tiktokUrl: draft.tiktok.trim() },
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

      <Section title="Preise" foot={pricingValid && example ? `Beispiel ${carTitle(example)}: MKR ${example.baseDailyAed.toLocaleString("de-DE")} AED ≈ ${formatEur(Math.round(aedToEur(example.baseDailyAed, { markupPercent: markup, aedPerEur: rate })))} → Kunde ${formatEur(customerPriceEur(example.baseDailyAed, { markupPercent: markup, aedPerEur: rate }))} pro Tag. Gilt für alle Fahrzeuge ohne festen Preis.` : "Bitte gültige Werte eingeben."}>
        <Field label="Aufschlag auf den MKR-Preis"><span className="adm-field-inline"><input inputMode="decimal" value={draft.markup} onChange={(e) => set("markup", e.target.value.replace(/[^\d,.]/g, ""))} /><em>%</em></span></Field>
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
