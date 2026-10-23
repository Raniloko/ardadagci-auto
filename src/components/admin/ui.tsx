import { useRouter } from "@tanstack/react-router";
import { AlertCircle, Check, ChevronLeft } from "lucide-react";
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { BookingStatus } from "@/lib/bookings";

/* Top bar with optional back button; gains a hairline once the page scrolls. */
export function TopBar({ title, back, actions }: { title?: ReactNode; back?: string; actions?: ReactNode }) {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <header className={`adm-topbar ${scrolled ? "is-scrolled" : ""}`}>
      {back ? (
        <button type="button" className="adm-back" onClick={() => (window.history.length > 1 ? router.history.back() : router.navigate({ to: back }))}>
          <ChevronLeft />Zurück
        </button>
      ) : (
        <div className="adm-brand"><img src="/ardadagci-mark.png" alt="" width={35} height={26} /><strong>ADMIN</strong></div>
      )}
      {title && <div className="adm-topbar-title">{title}</div>}
      <div className="adm-topbar-actions">{actions}</div>
    </header>
  );
}

export const LargeTitle = ({ children, sub }: { children: ReactNode; sub?: ReactNode }) => (
  <h1 className="adm-large-title">{children}{sub && <small>{sub}</small>}</h1>
);

export function Section({ title, action, foot, children }: { title?: ReactNode; action?: ReactNode; foot?: ReactNode; children: ReactNode }) {
  return (
    <section className="adm-section">
      {(title || action) && <h2 className="adm-section-title"><span>{title}</span>{action}</h2>}
      <div className="adm-group">{children}</div>
      {foot && <p className="adm-section-foot">{foot}</p>}
    </section>
  );
}

export function Switch({ checked, onChange, label, disabled = false }: { checked: boolean; onChange: (value: boolean) => void; label: string; disabled?: boolean | undefined }) {
  return (
    <label className="adm-switch">
      <input type="checkbox" role="switch" aria-label={label} checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
      <span />
    </label>
  );
}

export function SwitchRow({ title, sub, checked, onChange, disabled = false }: { title: string; sub?: string; checked: boolean; onChange: (value: boolean) => void; disabled?: boolean }) {
  return (
    <div className="adm-row">
      <div className="adm-row-main"><strong>{title}</strong>{sub && <span>{sub}</span>}</div>
      <Switch checked={checked} onChange={onChange} label={title} disabled={disabled} />
    </div>
  );
}

export function Segmented<T extends string>({ value, options, onChange }: { value: T; options: { id: T; label: string; count?: number }[]; onChange: (value: T) => void }) {
  return (
    <div className="adm-seg" role="tablist">
      {options.map((option) => (
        <button key={option.id} type="button" role="tab" aria-selected={value === option.id} className={value === option.id ? "active" : ""} onClick={() => onChange(option.id)}>
          {option.label}{option.count !== undefined && <small>{option.count}</small>}
        </button>
      ))}
    </div>
  );
}

export const Field = ({ label, children }: { label: string; children: ReactNode }) => (
  <label className="adm-field"><span>{label}</span>{children}</label>
);

export function SaveBar({ visible, saving, onSave, onDiscard, label = "Speichern" }: { visible: boolean; saving: boolean; onSave: () => void; onDiscard: () => void; label?: string }) {
  if (!visible) return null;
  return (
    <div className="adm-savebar">
      <div>
        <button type="button" className="adm-btn soft" onClick={onDiscard} disabled={saving}>Verwerfen</button>
        <button type="button" className="adm-btn" onClick={onSave} disabled={saving}>{saving ? "Speichert …" : label}</button>
      </div>
    </div>
  );
}

const STATUS_PILL: Record<BookingStatus, { label: string; tone: string }> = {
  neu: { label: "Neu", tone: "blue" },
  bestaetigt: { label: "Bestätigt", tone: "green" },
  abgeschlossen: { label: "Abgeschlossen", tone: "" },
  storniert: { label: "Storniert", tone: "red" },
};
export const StatusPill = ({ status }: { status: string }) => {
  const pill = STATUS_PILL[status as BookingStatus] ?? { label: status, tone: "" };
  return <span className={`adm-pill ${pill.tone}`}>{pill.label}</span>;
};

export const Pill = ({ tone = "", children }: { tone?: string; children: ReactNode }) => <span className={`adm-pill ${tone}`}>{children}</span>;

export const Empty = ({ icon, children }: { icon: ReactNode; children: ReactNode }) => <div className="adm-empty">{icon}<div>{children}</div></div>;

export const Spinner = () => <div className="adm-splash"><div className="adm-spinner" aria-label="Lädt" /></div>;

/* Toasts */
type Toast = { id: number; text: string; error?: boolean };
const ToastContext = createContext<(text: string, error?: boolean) => void>(() => undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<Toast | null>(null);
  const show = useCallback((text: string, error = false) => setToast({ id: Date.now(), text, error }), []);
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), toast.error ? 4200 : 2200);
    return () => clearTimeout(id);
  }, [toast]);
  return (
    <ToastContext.Provider value={show}>
      {children}
      {toast && <div key={toast.id} role="status" className={`adm-toast ${toast.error ? "error" : ""}`}>{toast.error ? <AlertCircle /> : <Check />}{toast.text}</div>}
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
