import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { errorMessage, signOut, type AdminAuth } from "@/lib/admin-data";
import { registerAdmin, requestPasswordReset, type AuthEmailResult } from "@/lib/auth-email";
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

const EMAIL_ERRORS: Record<Extract<AuthEmailResult, { ok: false }>["error"], string> = {
  invalid: "Bitte eine gültige E-Mail und ein Passwort mit mindestens 8 Zeichen eingeben.",
  code: "Der Code ist ungültig, abgelaufen oder wurde schon benutzt.",
  exists: "Für diese E-Mail gibt es schon ein Konto – bitte unten anmelden.",
  rate: "Zu viele Versuche – bitte in 15 Minuten erneut versuchen.",
  send: "Die E-Mail konnte gerade nicht gesendet werden. Bitte später erneut versuchen.",
};

function translate(message: string) {
  if (/invalid login credentials/i.test(message)) return "E-Mail oder Passwort ist falsch.";
  if (/email not confirmed/i.test(message)) return "Bitte bestätige zuerst deine E-Mail-Adresse (Link im Postfach).";
  if (/already registered/i.test(message)) return "Für diese E-Mail gibt es schon ein Konto – bitte unten anmelden.";
  if (/password should be at least|weak password/i.test(message)) return "Das Passwort ist zu kurz oder zu schwach (mind. 8 Zeichen).";
  if (/rate limit|too many/i.test(message)) return "Zu viele Versuche – bitte kurz warten.";
  return message;
}

export function LoginScreen({ setupOpen, notice = null, onDone }: { setupOpen: boolean; notice?: string | null; onDone: () => void }) {
  const [mode, setMode] = useState<"login" | "setup" | "reset">(setupOpen ? "setup" : "login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ text: string; error?: boolean } | null>(notice ? { text: notice, error: true } : null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      if (mode === "reset") {
        const result = await requestPasswordReset({ data: { email: email.trim() } });
        if (!result.ok) throw new Error(EMAIL_ERRORS[result.error]);
        setMessage({ text: "Falls ein Konto existiert, ist ein Link zum Zurücksetzen unterwegs. Bitte schau auch im Spam-Ordner nach." });
        return;
      }
      if (mode === "setup") {
        sessionStorage.setItem("ardadagci-admin-setup-code", code);
        const result = await registerAdmin({ data: { email: email.trim(), password, code } });
        if (!result.ok && result.error !== "exists") throw new Error(EMAIL_ERRORS[result.error]);
        if (result.ok) {
          setMessage({ text: "Fast geschafft: Wir haben dir eine E-Mail geschickt. Bestätige deine Adresse über den Button darin – danach bist du direkt im Dashboard." });
          return;
        }
        // Account exists already: sign in and unlock it with the code.
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw new Error(EMAIL_ERRORS.exists);
        const { data: ok, error: claimError } = await supabase.rpc("claim_admin", { setup_code: code });
        if (claimError) throw claimError;
        if (!ok) throw new Error("Der Code ist ungültig, abgelaufen oder wurde schon benutzt.");
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
    setup: setupOpen
      ? ["Admin einrichten", "Lege dein Admin-Konto an. Du brauchst dafür den einmaligen Einrichtungscode."]
      : ["Neues Admin-Konto", "Du brauchst den Einladungscode, den du von einem Admin bekommen hast."],
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
            <Field label={setupOpen ? "Einrichtungscode" : "Einladungscode"}><input required autoCapitalize="characters" autoComplete="one-time-code" value={code} onChange={(e) => setCode(e.target.value)} placeholder="XXXX-XXXX-XXXX" /></Field>
          )}
        </div>
        <button className="adm-btn block" disabled={busy}>{busy ? "Bitte warten …" : mode === "login" ? "Anmelden" : mode === "setup" ? "Konto einrichten" : "Link senden"}</button>
        {mode === "login" && <button type="button" className="adm-link" onClick={() => setMode("reset")}>Passwort vergessen?</button>}
        {mode !== "login" && <button type="button" className="adm-link" onClick={() => setMode("login")}>Zur Anmeldung</button>}
        {mode === "login" && <button type="button" className="adm-link" onClick={() => setMode("setup")}>{setupOpen ? "Erstes Admin-Konto einrichten" : "Neues Admin-Konto mit Code"}</button>}
      </form>
    </AuthLayout>
  );
}

/** Signed in, but not (yet) an admin: unlock with the setup code (first admin) or an invite code. */
export function NotAdminScreen({ auth, onDone }: { auth: Extract<AdminAuth, { status: "not-admin" }>; onDone: () => void }) {
  const [code, setCode] = useState(() => (typeof window !== "undefined" ? sessionStorage.getItem("ardadagci-admin-setup-code") ?? "" : ""));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const autoClaimed = useRef(false);
  // Coming back from the confirmation e-mail on the same device: unlock right away with the remembered code.
  useEffect(() => {
    if (autoClaimed.current || !code) return;
    autoClaimed.current = true;
    void claim();
  }, []);
  async function claim(e?: FormEvent) {
    e?.preventDefault();
    setBusy(true);
    setError("");
    const { data, error: claimError } = await supabase.rpc("claim_admin", { setup_code: code });
    setBusy(false);
    if (claimError || !data) return setError(claimError ? errorMessage(claimError) : "Der Code ist ungültig, abgelaufen oder wurde schon benutzt.");
    sessionStorage.removeItem("ardadagci-admin-setup-code");
    onDone();
  }
  const label = auth.setupOpen ? "Einrichtungscode" : "Einladungscode";
  return (
    <AuthLayout title="Admin freischalten" sub={`Angemeldet als ${auth.session.user.email ?? ""}. Dieses Konto hat noch keine Admin-Rechte – gib deinen ${label} ein, um es freizuschalten.`}>
      <form onSubmit={claim}>
        {error && <div className="adm-note error">{error}</div>}
        <div className="adm-group"><Field label={label}><input required autoCapitalize="characters" value={code} onChange={(e) => setCode(e.target.value)} placeholder="XXXX-XXXX-XXXX" /></Field></div>
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
