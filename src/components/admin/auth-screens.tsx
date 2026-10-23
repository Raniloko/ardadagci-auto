import { useState, type FormEvent, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { errorMessage, signOut, type AdminAuth } from "@/lib/admin-data";
import { Field } from "./ui";

function AuthLayout({ title, sub, children }: { title: string; sub: string; children: ReactNode }) {
  return (
    <div className="adm-auth">
      <div className="adm-auth-card">
        <div className="adm-auth-logo">
          <img src="/ardadagci-mark.png" alt="ARDADAGCI" width={52} height={38} />
          <h1>{title}</h1>
          <p>{sub}</p>
        </div>
        {children}
      </div>
    </div>
  );
}

const redirectTo = () => `${window.location.origin}/admin`;

function translate(message: string) {
  if (/invalid login credentials/i.test(message)) return "E-Mail oder Passwort ist falsch.";
  if (/email not confirmed/i.test(message)) return "Bitte bestätige zuerst deine E-Mail-Adresse (Link im Postfach).";
  if (/already registered/i.test(message)) return "Für diese E-Mail gibt es schon ein Konto – bitte unten anmelden.";
  if (/password should be at least|weak password/i.test(message)) return "Das Passwort ist zu kurz oder zu schwach (mind. 8 Zeichen).";
  if (/rate limit|too many/i.test(message)) return "Zu viele Versuche – bitte kurz warten.";
  return message;
}

export function LoginScreen({ setupOpen, onDone }: { setupOpen: boolean; onDone: () => void }) {
  const [mode, setMode] = useState<"login" | "setup" | "reset">(setupOpen ? "setup" : "login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ text: string; error?: boolean } | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      if (mode === "reset") {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: redirectTo() });
        if (error) throw error;
        setMessage({ text: "Falls ein Konto existiert, wurde ein Link zum Zurücksetzen gesendet." });
        return;
      }
      if (mode === "setup") {
        sessionStorage.setItem("ardadagci-admin-setup-code", code);
        let { data, error } = await supabase.auth.signUp({ email: email.trim(), password, options: { emailRedirectTo: redirectTo() } });
        if (error && /already registered/i.test(error.message)) ({ data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password }));
        if (error) throw error;
        if (!data.session) {
          setMessage({ text: "Fast geschafft: Bitte bestätige deine E-Mail über den Link im Postfach und melde dich danach hier mit dem gleichen Code an." });
          return;
        }
        const { data: ok, error: claimError } = await supabase.rpc("claim_admin", { setup_code: code });
        if (claimError) throw claimError;
        if (!ok) throw new Error("Der Einrichtungscode ist ungültig oder abgelaufen.");
        sessionStorage.removeItem("ardadagci-admin-setup-code");
        onDone();
        return;
      }
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) throw error;
      onDone();
    } catch (error) {
      setMessage({ text: translate(errorMessage(error)), error: true });
    } finally {
      setBusy(false);
    }
  }

  const titles = {
    login: ["Admin-Bereich", "Melde dich an, um Website, Fahrzeuge und Reservierungen zu verwalten."],
    setup: ["Admin einrichten", "Lege dein Admin-Konto an. Du brauchst dafür den einmaligen Einrichtungscode."],
    reset: ["Passwort vergessen", "Wir senden dir einen Link, mit dem du ein neues Passwort setzen kannst."],
  } as const;

  return (
    <AuthLayout title={titles[mode][0]} sub={titles[mode][1]}>
      <form onSubmit={submit}>
        {message && <div className={`adm-note ${message.error ? "error" : ""}`}>{message.text}</div>}
        <div className="adm-group">
          <Field label="E-Mail"><input type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@beispiel.de" /></Field>
          {mode !== "reset" && (
            <Field label="Passwort"><input type="password" autoComplete={mode === "setup" ? "new-password" : "current-password"} required minLength={mode === "setup" ? 8 : undefined} value={password} onChange={(e) => setPassword(e.target.value)} placeholder={mode === "setup" ? "mindestens 8 Zeichen" : "••••••••"} /></Field>
          )}
          {mode === "setup" && (
            <Field label="Einrichtungscode"><input required autoCapitalize="characters" autoComplete="one-time-code" value={code} onChange={(e) => setCode(e.target.value)} placeholder="XXXX-XXXX-XXXX" /></Field>
          )}
        </div>
        <button className="adm-btn block" disabled={busy}>{busy ? "Bitte warten …" : mode === "login" ? "Anmelden" : mode === "setup" ? "Konto einrichten" : "Link senden"}</button>
        {mode === "login" && <button type="button" className="adm-link" onClick={() => setMode("reset")}>Passwort vergessen?</button>}
        {mode !== "login" && <button type="button" className="adm-link" onClick={() => setMode("login")}>Zur Anmeldung</button>}
        {mode === "login" && setupOpen && <button type="button" className="adm-link" onClick={() => setMode("setup")}>Erstes Admin-Konto einrichten</button>}
      </form>
    </AuthLayout>
  );
}

/** Signed in, but not (yet) an admin: claim with the setup code while setup is open, otherwise no access. */
export function NotAdminScreen({ auth, onDone }: { auth: Extract<AdminAuth, { status: "not-admin" }>; onDone: () => void }) {
  const [code, setCode] = useState(() => (typeof window !== "undefined" ? sessionStorage.getItem("ardadagci-admin-setup-code") ?? "" : ""));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function claim(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const { data, error: claimError } = await supabase.rpc("claim_admin", { setup_code: code });
    setBusy(false);
    if (claimError || !data) return setError(claimError ? errorMessage(claimError) : "Der Einrichtungscode ist ungültig oder abgelaufen.");
    sessionStorage.removeItem("ardadagci-admin-setup-code");
    onDone();
  }
  if (!auth.setupOpen) {
    return (
      <AuthLayout title="Kein Zugriff" sub={`Das Konto ${auth.session.user.email ?? ""} hat keine Admin-Rechte.`}>
        <button className="adm-btn block soft" onClick={() => signOut()}>Abmelden</button>
      </AuthLayout>
    );
  }
  return (
    <AuthLayout title="Admin freischalten" sub={`Angemeldet als ${auth.session.user.email ?? ""}. Gib den Einrichtungscode ein, um dieses Konto zum Admin zu machen.`}>
      <form onSubmit={claim}>
        {error && <div className="adm-note error">{error}</div>}
        <div className="adm-group"><Field label="Einrichtungscode"><input required autoCapitalize="characters" value={code} onChange={(e) => setCode(e.target.value)} placeholder="XXXX-XXXX-XXXX" /></Field></div>
        <button className="adm-btn block" disabled={busy}>{busy ? "Bitte warten …" : "Freischalten"}</button>
        <button type="button" className="adm-link" onClick={() => signOut()}>Abmelden</button>
      </form>
    </AuthLayout>
  );
}

export function RecoveryScreen({ onDone }: { onDone: () => void }) {
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function save(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (updateError) return setError(translate(updateError.message));
    window.history.replaceState(null, "", "/admin");
    onDone();
  }
  return (
    <AuthLayout title="Neues Passwort" sub="Wähle ein neues Passwort für dein Admin-Konto.">
      <form onSubmit={save}>
        {error && <div className="adm-note error">{error}</div>}
        <div className="adm-group"><Field label="Neues Passwort"><input type="password" autoComplete="new-password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="mindestens 8 Zeichen" /></Field></div>
        <button className="adm-btn block" disabled={busy}>{busy ? "Speichert …" : "Passwort speichern"}</button>
      </form>
    </AuthLayout>
  );
}
