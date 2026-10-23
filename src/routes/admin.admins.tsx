import { createFileRoute } from "@tanstack/react-router";
import { Copy, MessageCircle, Trash2, UserPlus } from "lucide-react";
import { useState } from "react";
import { Empty, LargeTitle, Pill, Section, TopBar, useToast } from "@/components/admin/ui";
import { dateDe, errorMessage, useAdmins, useCreateInvite, useRemoveAdmin, useRevokeInvite } from "@/lib/admin-data";

export const Route = createFileRoute("/admin/admins")({ component: AdminsPage });

const day = (iso: string) => dateDe(iso.slice(0, 10));

function AdminsPage() {
  const toast = useToast();
  const query = useAdmins();
  const createInvite = useCreateInvite();
  const revokeInvite = useRevokeInvite();
  const removeAdmin = useRemoveAdmin();
  const [code, setCode] = useState<string | null>(null);
  const admins = query.data?.admins ?? [];
  const invites = query.data?.invites ?? [];
  const inviteText = code ? `Du bist als Admin für ARDADAGCI eingeladen. Öffne https://www.ardadagci.com/admin → „Neues Admin-Konto mit Code“ und gib diesen Einladungscode ein: ${code} (7 Tage gültig, nur einmal nutzbar).` : "";

  function invite() {
    createInvite.mutate(undefined, {
      onSuccess: (value) => setCode(value),
      onError: (error) => toast(errorMessage(error), true),
    });
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(inviteText);
      toast("Einladung kopiert");
    } catch {
      toast("Kopieren nicht möglich – bitte Code abschreiben", true);
    }
  }

  function remove(userId: string, email: string) {
    if (!window.confirm(`${email} die Admin-Rechte entziehen?`)) return;
    removeAdmin.mutate(userId, { onSuccess: () => toast("Admin entfernt"), onError: (error) => toast(errorMessage(error), true) });
  }

  function revoke(id: string) {
    if (!window.confirm("Diese Einladung widerrufen? Der Code funktioniert dann nicht mehr.")) return;
    revokeInvite.mutate(id, { onSuccess: () => toast("Einladung widerrufen"), onError: (error) => toast(errorMessage(error), true) });
  }

  return (
    <>
      <TopBar back="/admin/einstellungen" title="Admins" />
      <LargeTitle sub="Wer das Dashboard verwalten darf">Admins</LargeTitle>

      <Section title="Admin-Konten" foot="Entfernen nimmt nur die Admin-Rechte weg – das Konto selbst bleibt bestehen.">
        {query.isLoading && <div className="adm-row"><div className="adm-row-main"><span>Lädt …</span></div></div>}
        {query.error && <div className="adm-row"><div className="adm-row-main"><span>{errorMessage(query.error)}</span></div></div>}
        {admins.map((admin) => (
          <div key={admin.user_id} className="adm-row">
            <div className="adm-row-main"><strong>{admin.email}</strong><span>Admin seit {day(admin.created_at)}</span></div>
            {admin.is_me ? <Pill tone="blue">Du</Pill> : (
              <button type="button" className="adm-icon-btn" aria-label={`${admin.email} entfernen`} onClick={() => remove(admin.user_id, admin.email)} disabled={removeAdmin.isPending}><Trash2 /></button>
            )}
          </div>
        ))}
      </Section>

      {code && (
        <div className="adm-note">
          <strong>Einladungscode – nur jetzt sichtbar</strong>
          <div className="adm-code">{code}</div>
          Die eingeladene Person öffnet <b>www.ardadagci.com/admin</b>, tippt auf „Neues Admin-Konto mit Code“ und gibt E-Mail, Passwort und diesen Code ein. Gültig 7 Tage, nur einmal nutzbar.
          <div className="adm-actions" style={{ marginTop: 12, marginBottom: 0 }}>
            <button type="button" className="adm-action" onClick={copy}><Copy />Kopieren</button>
            <a className="adm-action wa" href={`https://wa.me/?text=${encodeURIComponent(inviteText)}`} target="_blank" rel="noreferrer"><MessageCircle />WhatsApp</a>
          </div>
        </div>
      )}

      <Section title="Einladungen" foot="Offene Codes verfallen nach 7 Tagen automatisch.">
        <button type="button" className="adm-row" onClick={invite} disabled={createInvite.isPending}>
          <span className="adm-row-icon" style={{ background: "var(--a-green)" }}><UserPlus /></span>
          <div className="adm-row-main"><strong style={{ color: "var(--a-blue)" }}>{createInvite.isPending ? "Erstellt …" : "Admin einladen"}</strong><span>Erstellt einen einmaligen Einladungscode</span></div>
        </button>
        {!query.isLoading && invites.length === 0 && <Empty icon={<UserPlus />}>Keine offenen Einladungen.</Empty>}
        {invites.map((invite) => (
          <div key={invite.id} className="adm-row">
            <div className="adm-row-main"><strong>Offene Einladung</strong><span>Gültig bis {day(invite.expires_at)}</span></div>
            <button type="button" className="adm-link" onClick={() => revoke(invite.id)} disabled={revokeInvite.isPending}>Widerrufen</button>
          </div>
        ))}
      </Section>
    </>
  );
}
