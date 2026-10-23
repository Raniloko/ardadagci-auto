import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, Inbox, Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Empty, LargeTitle, Segmented, StatusPill, TopBar } from "@/components/admin/ui";
import { dateDe, days, relativeTime, useBookings } from "@/lib/admin-data";
import { formatAed } from "@/lib/pricing";

type Filter = "offen" | "bestaetigt" | "archiv" | "alle";

export const Route = createFileRoute("/admin/reservierungen/")({ component: BookingsPage });

function BookingsPage() {
  const bookings = useBookings();
  const [filter, setFilter] = useState<Filter>("offen");
  const [query, setQuery] = useState("");
  const list = bookings.data ?? [];
  const counts = {
    offen: list.filter((b) => b.status === "neu").length,
    bestaetigt: list.filter((b) => b.status === "bestaetigt").length,
    archiv: list.filter((b) => b.status === "abgeschlossen" || b.status === "storniert").length,
    alle: list.length,
  };
  const shown = useMemo(() => {
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    return list.filter((b) => {
      if (filter === "offen" && b.status !== "neu") return false;
      if (filter === "bestaetigt" && b.status !== "bestaetigt") return false;
      if (filter === "archiv" && b.status !== "abgeschlossen" && b.status !== "storniert") return false;
      const text = `${b.customer_name} ${b.customer_phone} ${b.car_label ?? ""} ${b.location ?? ""}`.toLowerCase();
      return words.every((w) => text.includes(w));
    });
  }, [list, filter, query]);

  return (
    <>
      <TopBar actions={<Link to="/admin/reservierungen/$id" params={{ id: "neu" }} className="adm-icon-btn" aria-label="Neue Reservierung"><Plus /></Link>} />
      <LargeTitle sub={counts.offen ? `${counts.offen} neue Anfrage${counts.offen === 1 ? "" : "n"}` : "Alles beantwortet"}>Anfragen</LargeTitle>
      <label className="adm-search"><Search /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Name, Telefon, Fahrzeug …" aria-label="Anfragen suchen" /></label>
      <Segmented value={filter} onChange={setFilter} options={[
        { id: "offen", label: "Neu", count: counts.offen },
        { id: "bestaetigt", label: "Bestätigt", count: counts.bestaetigt },
        { id: "archiv", label: "Archiv", count: counts.archiv },
        { id: "alle", label: "Alle", count: counts.alle },
      ]} />
      {bookings.isLoading && <div className="adm-group"><div className="adm-row"><span>Lädt …</span></div></div>}
      {bookings.error && <div className="adm-note error">Anfragen konnten nicht geladen werden. Bitte neu laden.</div>}
      {!bookings.isLoading && shown.length === 0 && <Empty icon={<Inbox />}>{filter === "offen" ? "Keine neuen Anfragen." : "Keine Einträge."}</Empty>}
      {shown.length > 0 && (
        <div className="adm-group">
          {shown.map((b) => {
            const n = days(b.start_date, b.end_date);
            return (
              <Link key={b.id} to="/admin/reservierungen/$id" params={{ id: b.id }} className="adm-row">
                <div className="adm-row-main adm-booking">
                  <div className="adm-booking-top"><strong>{b.customer_name}</strong><StatusPill status={b.status} /></div>
                  <span>{b.car_label ?? "Fahrzeug offen"}</span>
                  <span>
                    {b.start_date ? `${dateDe(b.start_date)} – ${dateDe(b.end_date)}${n ? ` · ${n} ${n === 1 ? "Tag" : "Tage"}` : ""}` : "Zeitraum offen"}
                    {b.total_aed ? ` · ${formatAed(b.total_aed)}` : ""}
                  </span>
                  <span style={{ fontSize: 12.5 }}>{b.source === "admin" ? "Manuell angelegt" : "Website"} · {relativeTime(b.created_at)}</span>
                </div>
                <ChevronRight className="adm-chevron" />
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
