import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Calculator, MessageCircle, Phone, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Field, LargeTitle, SaveBar, Section, Segmented, TopBar, useToast } from "@/components/admin/ui";
import { customerWhatsapp, dateDe, days, errorMessage, relativeTime, useAdminFleet, useBookings, useDeleteBooking, useSaveBooking } from "@/lib/admin-data";
import { BOOKING_STATUS, type BookingStatus } from "@/lib/bookings";
import { aedToEur, formatEur } from "@/lib/pricing";
import { carTitle } from "@/lib/site-data";

export const Route = createFileRoute("/admin/reservierungen/$id")({ component: BookingDetail });

type Draft = {
  status: BookingStatus;
  car_slug: string;
  customer_name: string;
  customer_phone: string;
  start_date: string;
  end_date: string;
  location: string;
  price_per_day_eur: string;
  total_eur: string;
  notes: string;
  admin_notes: string;
};

const EMPTY: Draft = { status: "bestaetigt", car_slug: "", customer_name: "", customer_phone: "", start_date: "", end_date: "", location: "", price_per_day_eur: "", total_eur: "", notes: "", admin_notes: "" };

function BookingDetail() {
  const { id } = Route.useParams();
  const isNew = id === "neu";
  const navigate = useNavigate();
  const toast = useToast();
  const bookings = useBookings();
  const { fleet, settings } = useAdminFleet();
  const saveBooking = useSaveBooking();
  const deleteBooking = useDeleteBooking();
  const booking = bookings.data?.find((b) => b.id === id);
  const saved = useMemo<Draft | null>(() => {
    if (isNew) return EMPTY;
    if (!booking) return null;
    return {
      status: booking.status as BookingStatus,
      car_slug: booking.car_slug ?? "",
      customer_name: booking.customer_name,
      customer_phone: booking.customer_phone,
      start_date: booking.start_date ?? "",
      end_date: booking.end_date ?? "",
      location: booking.location ?? "",
      price_per_day_eur: booking.price_per_day_eur ? String(booking.price_per_day_eur) : "",
      total_eur: booking.total_eur ? String(booking.total_eur) : "",
      notes: booking.notes ?? "",
      admin_notes: booking.admin_notes ?? "",
    };
  }, [isNew, booking]);
  const [draft, setDraft] = useState<Draft | null>(saved);
  useEffect(() => setDraft(saved), [saved]);

  if (!draft || !saved) return <><TopBar back="/admin/reservierungen" /><p style={{ color: "var(--a-sub)" }}>{bookings.isLoading ? "Lädt …" : "Anfrage nicht gefunden."}</p></>;

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft({ ...draft, [key]: value });
  const car = fleet.all.find((c) => c.slug === draft.car_slug);
  const rentalDays = days(draft.start_date || null, draft.end_date || null);
  const total = Number(draft.total_eur) || 0;
  const mkrCost = car && rentalDays ? Math.round(aedToEur(car.baseDailyAed, settings)) * rentalDays : 0;
  const dirty = isNew ? Boolean(draft.customer_name || draft.customer_phone) : JSON.stringify(draft) !== JSON.stringify(saved);
  const datesInvalid = Boolean(draft.start_date && draft.end_date && draft.end_date < draft.start_date);

  function pickCar(slug: string) {
    const picked = fleet.all.find((c) => c.slug === slug);
    const perDay = picked ? String(picked.price) : draft!.price_per_day_eur;
    setDraft({ ...draft!, car_slug: slug, price_per_day_eur: perDay, total_eur: picked && rentalDays ? String(picked.price * rentalDays) : draft!.total_eur });
  }

  function recalc() {
    const perDay = Number(draft!.price_per_day_eur);
    if (!perDay || !rentalDays) return toast("Bitte Zeitraum und Preis pro Tag angeben", true);
    set("total_eur", String(perDay * rentalDays));
  }

  function submit() {
    if (!draft) return;
    if (!draft.customer_name.trim() || !draft.customer_phone.trim()) return toast("Name und Telefon sind Pflichtfelder", true);
    if (datesInvalid) return toast("Das Enddatum liegt vor dem Startdatum", true);
    const values = {
      status: draft.status,
      car_slug: draft.car_slug || null,
      car_label: car ? `${carTitle(car)}${car.color ? ` (${car.color})` : ""}` : booking?.car_label ?? null,
      customer_name: draft.customer_name.trim(),
      customer_phone: draft.customer_phone.trim(),
      start_date: draft.start_date || null,
      end_date: draft.end_date || null,
      location: draft.location.trim() || null,
      price_per_day_eur: draft.price_per_day_eur ? Number(draft.price_per_day_eur) : null,
      total_eur: draft.total_eur ? Number(draft.total_eur) : null,
      notes: draft.notes.trim() || null,
      admin_notes: draft.admin_notes.trim() || null,
    };
    saveBooking.mutate({ id: isNew ? null : id, values }, {
      onSuccess: (newId) => {
        toast(isNew ? "Reservierung angelegt" : "Gespeichert");
        if (isNew) navigate({ to: "/admin/reservierungen/$id", params: { id: newId }, replace: true });
      },
      onError: (error) => toast(errorMessage(error), true),
    });
  }

  function remove() {
    if (!window.confirm("Diese Anfrage endgültig löschen?")) return;
    deleteBooking.mutate(id, {
      onSuccess: () => { toast("Gelöscht"); navigate({ to: "/admin/reservierungen" }); },
      onError: (error) => toast(errorMessage(error), true),
    });
  }

  const greeting = `Hallo ${draft.customer_name.split(" ")[0] ?? ""}, hier ist ARDADAGCI${car ? ` zu Ihrer Anfrage für den ${carTitle(car)}` : ""}${draft.start_date ? ` (${dateDe(draft.start_date)} – ${dateDe(draft.end_date || null)})` : ""}.`;

  return (
    <>
      <TopBar back="/admin/reservierungen" title={isNew ? "Neue Reservierung" : draft.customer_name} />
      <LargeTitle sub={booking ? `${booking.source === "admin" ? "Manuell angelegt" : "Über die Website"} · ${relativeTime(booking.created_at)}` : "Telefonische oder persönliche Buchung erfassen"}>
        {isNew ? "Neue Reservierung" : draft.customer_name}
      </LargeTitle>

      {!isNew && (
        <div className="adm-actions">
          <a className="adm-action" href={`tel:${draft.customer_phone.replace(/[^\d+]/g, "")}`}><Phone />Anrufen</a>
          <a className="adm-action wa" href={customerWhatsapp(draft.customer_phone, greeting)} target="_blank" rel="noreferrer"><MessageCircle />WhatsApp</a>
        </div>
      )}

      <Section title="Status">
        <div style={{ padding: "12px 12px 0" }}>
          <Segmented value={draft.status} onChange={(v) => set("status", v)} options={BOOKING_STATUS.map((s) => ({ id: s.id, label: s.id === "abgeschlossen" ? "Erledigt" : s.label }))} />
        </div>
      </Section>

      <Section title="Kunde">
        <Field label="Name"><input value={draft.customer_name} onChange={(e) => set("customer_name", e.target.value)} maxLength={120} autoComplete="off" /></Field>
        <Field label="Telefon / WhatsApp"><input type="tel" value={draft.customer_phone} onChange={(e) => set("customer_phone", e.target.value)} maxLength={40} /></Field>
        <Field label="Lieferort"><input value={draft.location} onChange={(e) => set("location", e.target.value)} maxLength={200} placeholder="Hotel, Residenz, Flughafen" /></Field>
      </Section>

      <Section title="Fahrzeug & Zeitraum" foot={datesInvalid ? "Das Enddatum liegt vor dem Startdatum." : rentalDays ? `${rentalDays} ${rentalDays === 1 ? "Tag" : "Tage"}` : undefined}>
        <Field label="Fahrzeug">
          <select value={draft.car_slug} onChange={(e) => pickCar(e.target.value)}>
            <option value="">{booking?.car_label && !booking.car_slug ? booking.car_label : "Noch offen"}</option>
            {[...fleet.all].sort((a, b) => carTitle(a).localeCompare(carTitle(b))).map((c) => (
              <option key={c.slug} value={c.slug}>{carTitle(c)}{c.color ? ` – ${c.color}` : ""}{c.hidden ? " (ausgeblendet)" : ""}</option>
            ))}
          </select>
        </Field>
        <Field label="Von"><input type="date" value={draft.start_date} onChange={(e) => set("start_date", e.target.value)} /></Field>
        <Field label="Bis"><input type="date" value={draft.end_date} min={draft.start_date || undefined} onChange={(e) => set("end_date", e.target.value)} /></Field>
      </Section>

      <Section title="Preis" action={<button type="button" onClick={recalc}><Calculator style={{ width: 15, height: 15, verticalAlign: "-2px" }} /> Neu berechnen</button>}>
        <Field label="Preis pro Tag"><span className="adm-field-inline"><input inputMode="numeric" value={draft.price_per_day_eur} onChange={(e) => set("price_per_day_eur", e.target.value.replace(/[^\d]/g, ""))} placeholder={car ? String(car.price) : "0"} /><em>€</em></span></Field>
        <Field label="Gesamtpreis"><span className="adm-field-inline"><input inputMode="numeric" value={draft.total_eur} onChange={(e) => set("total_eur", e.target.value.replace(/[^\d]/g, ""))} placeholder="0" /><em>€</em></span></Field>
        {total > 0 && mkrCost > 0 && (
          <dl className="adm-kv">
            <dt>Kunde zahlt</dt><dd>{formatEur(total)}</dd>
            <dt>An MKR ({rentalDays} × {formatEur(Math.round(aedToEur(car!.baseDailyAed, settings)))})</dt><dd>− {formatEur(mkrCost)}</dd>
            <dt className="total">Deine Provision</dt><dd className="total" style={{ color: total - mkrCost > 0 ? "var(--a-green)" : "var(--a-red)" }}>{formatEur(total - mkrCost)}</dd>
          </dl>
        )}
      </Section>

      <Section title="Notizen">
        <Field label="Nachricht des Kunden"><textarea value={draft.notes} onChange={(e) => set("notes", e.target.value)} maxLength={2000} rows={3} placeholder="–" style={{ minHeight: 80 }} /></Field>
        <Field label="Interne Notiz (nur für dich)"><textarea value={draft.admin_notes} onChange={(e) => set("admin_notes", e.target.value)} maxLength={4000} rows={3} placeholder="z. B. Anzahlung erhalten, Übergabe 10 Uhr" style={{ minHeight: 80 }} /></Field>
      </Section>

      {!isNew && <button type="button" className="adm-btn danger block" onClick={remove} disabled={deleteBooking.isPending} style={{ marginBottom: 26 }}><Trash2 />Anfrage löschen</button>}

      <SaveBar visible={dirty} saving={saveBooking.isPending} onSave={submit} onDiscard={() => (isNew ? navigate({ to: "/admin/reservierungen" }) : setDraft(saved))} label={isNew ? "Anlegen" : "Speichern"} />
    </>
  );
}
