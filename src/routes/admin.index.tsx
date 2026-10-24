import { createFileRoute, Link } from "@tanstack/react-router";
import { Banknote, CalendarCheck, CarFront, ChevronRight, EyeOff, Inbox, Plus, TrendingUp } from "lucide-react";
import { useInstall } from "@/components/admin/install-prompt";
import { Empty, LargeTitle, Section, StatusPill, TopBar } from "@/components/admin/ui";
import { dateDe, days, relativeTime, useAdminFleet, useBookings } from "@/lib/admin-data";
import { formatAed, formatMoney } from "@/lib/pricing";

export const Route = createFileRoute("/admin/")({ component: Overview });

function Overview() {
  const bookings = useBookings();
  const { fleet, settings } = useAdminFleet();
  const list = bookings.data ?? [];
  const open = list.filter((b) => b.status === "neu");
  const confirmed = list.filter((b) => b.status === "bestaetigt" || b.status === "abgeschlossen");
  const revenue = confirmed.reduce((sum, b) => sum + (b.total_aed ?? 0), 0);
  const commission = confirmed.reduce((sum, b) => {
    const car = fleet.all.find((c) => c.slug === b.car_slug);
    const rentalDays = days(b.start_date, b.end_date);
    if (!car || !b.total_aed || !rentalDays) return sum;
    return sum + b.total_aed - car.baseDailyAed * rentalDays;
  }, 0);
  const hidden = fleet.all.filter((c) => c.hidden).length;
  const rented = fleet.all.filter((c) => !c.available && !c.hidden).length;
  const hour = new Date().getHours();
  return (
    <>
      <TopBar actions={<Link to="/admin/reservierungen/$id" params={{ id: "neu" }} className="adm-icon-btn" aria-label="Neue Reservierung"><Plus /></Link>} />
      <LargeTitle sub={new Date().toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long" })}>{hour < 11 ? "Guten Morgen" : hour < 18 ? "Guten Tag" : "Guten Abend"}</LargeTitle>
      <InstallHint />
      <div className="adm-stats">
        <Stat icon={<Inbox />} label="Neue Anfragen" value={String(open.length)} hint={open.length ? "warten auf Antwort" : "alles beantwortet"} to="/admin/reservierungen" />
        <Stat icon={<CalendarCheck />} label="Bestätigt" value={String(confirmed.length)} hint="Buchungen gesamt" to="/admin/reservierungen" />
        <Stat icon={<Banknote />} label="Umsatz" value={formatAed(revenue)} hint={`≈ ${formatMoney(revenue, "EUR", "de", settings.aedPerEur)} · bestätigt`} />
        <Stat icon={<TrendingUp />} label="Provision" value={formatAed(commission)} hint={`≈ ${formatMoney(commission, "EUR", "de", settings.aedPerEur)} · nach MKR-Kosten`} />
      </div>

      <Section title="Fahrzeuge" action={<Link to="/admin/fahrzeuge">Alle</Link>}>
        <Link to="/admin/fahrzeuge" search={{ filter: "online" }} className="adm-row"><span className="adm-row-icon" style={{ background: "var(--a-green)" }}><CarFront /></span><div className="adm-row-main"><strong>Online</strong></div><span className="adm-row-value">{fleet.cars.length}</span><ChevronRight className="adm-chevron" /></Link>
        <Link to="/admin/fahrzeuge" search={{ filter: "vermietet" }} className="adm-row"><span className="adm-row-icon" style={{ background: "var(--a-orange)" }}><CalendarCheck /></span><div className="adm-row-main"><strong>Derzeit vermietet</strong></div><span className="adm-row-value">{rented}</span><ChevronRight className="adm-chevron" /></Link>
        <Link to="/admin/fahrzeuge" search={{ filter: "ausgeblendet" }} className="adm-row"><span className="adm-row-icon" style={{ background: "var(--a-faint)" }}><EyeOff /></span><div className="adm-row-main"><strong>Ausgeblendet</strong></div><span className="adm-row-value">{hidden}</span><ChevronRight className="adm-chevron" /></Link>
      </Section>

      <Section title="Letzte Anfragen" action={<Link to="/admin/reservierungen">Alle</Link>}>
        {bookings.isLoading && <div className="adm-row"><div className="adm-row-main"><span>Lädt …</span></div></div>}
        {!bookings.isLoading && list.length === 0 && <Empty icon={<Inbox />}>Noch keine Anfragen. Neue Buchungsanfragen von der Website erscheinen hier automatisch.</Empty>}
        {list.slice(0, 5).map((b) => (
          <Link key={b.id} to="/admin/reservierungen/$id" params={{ id: b.id }} className="adm-row">
            <div className="adm-row-main">
              <strong>{b.customer_name}</strong>
              <span>{b.car_label ?? "Fahrzeug offen"} · {b.start_date ? `${dateDe(b.start_date)} – ${dateDe(b.end_date)}` : relativeTime(b.created_at)}</span>
            </div>
            <StatusPill status={b.status} />
            <ChevronRight className="adm-chevron" />
          </Link>
        ))}
      </Section>
    </>
  );
}

function Stat({ icon, label, value, hint, to }: { icon: React.ReactNode; label: string; value: string; hint: string; to?: "/admin/reservierungen" }) {
  const body = <><div className="adm-stat-top">{label}{icon}</div><strong>{value}</strong><span>{hint}</span></>;
  return to ? <Link to={to} className="adm-stat">{body}</Link> : <div className="adm-stat">{body}</div>;
}

/** Shown in the browser until the dashboard is installed on the home screen. */
function InstallHint() {
  const { mode, installed, open } = useInstall();
  if (installed || mode === "none") return null;
  return (
    <button type="button" className="adm-install-card" onClick={open}>
      <img src="/admin-icon-192.png" alt="" width={44} height={44} />
      <span><strong>Als App installieren</strong><small>Mit eigenem Symbol auf dem Startbildschirm</small></span>
      <em>{mode === "prompt" ? "Installieren" : "Anleitung"}</em>
    </button>
  );
}
