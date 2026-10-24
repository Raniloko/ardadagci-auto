// Server only: branded auth e-mails sent through Resend (via the Lovable connector gateway).
// Supabase only generates the one-time links (admin generateLink never sends mail itself).
import { getRequest } from "@tanstack/react-start/server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/resend";
const DEFAULT_ORIGIN = "https://www.ardadagci.com";
const BRAND_DOMAIN = "ardadagci.com";
// Links in e-mails may only point to our own sites (never to whatever Host header a request carries).
const ALLOWED_ORIGINS = [
  "https://www.ardadagci.com",
  "https://ardadagci.com",
  "https://ardadagci-auto.lovable.app",
  "https://id-preview--ca8b8316-3279-4d2b-a8dc-cccf53400218.lovable.app",
];

export type EmailKind = "signup" | "recovery" | "test";

export function siteOrigin() {
  const request = getRequest();
  const origin = request?.headers.get("origin") ?? (request ? new URL(request.url).origin : "");
  if (ALLOWED_ORIGINS.includes(origin) || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return origin;
  return DEFAULT_ORIGIN;
}

export async function sha256(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

/** Same normalisation as public.normalize_admin_code(): upper case, letters and digits only. */
export const hashAdminCode = (code: string) => sha256(code.toUpperCase().replace(/[^A-Z0-9]/g, ""));

/** True if the code would be accepted by claim_admin (checked without using it up). */
export async function isAdminCodeValid(code: string) {
  const hash = await hashAdminCode(code);
  const now = new Date().toISOString();
  const { count: admins } = await supabaseAdmin.from("admin_users").select("user_id", { count: "exact", head: true });
  if (!admins) {
    const { data } = await supabaseAdmin.from("admin_setup").select("id").eq("code_sha256", hash).gt("expires_at", now).maybeSingle();
    return Boolean(data);
  }
  const { data } = await supabaseAdmin.from("admin_invites").select("id").eq("code_sha256", hash).is("used_at", null).gt("expires_at", now).maybeSingle();
  return Boolean(data);
}

/** At most 3 mails per address per 15 minutes and 40 per hour overall. Returns false when the limit is hit. */
export async function allowEmail(kind: EmailKind, email: string) {
  const emailHash = await sha256(email.trim().toLowerCase());
  const since15 = new Date(Date.now() - 15 * 60_000).toISOString();
  const since60 = new Date(Date.now() - 60 * 60_000).toISOString();
  const [perAddress, overall] = await Promise.all([
    supabaseAdmin.from("auth_email_log").select("id", { count: "exact", head: true }).eq("email_sha256", emailHash).gt("created_at", since15),
    supabaseAdmin.from("auth_email_log").select("id", { count: "exact", head: true }).gt("created_at", since60),
  ]);
  if ((perAddress.count ?? 0) >= 3 || (overall.count ?? 0) >= 40) return false;
  await supabaseAdmin.from("auth_email_log").insert({ kind, email_sha256: emailHash });
  return true;
}

/* ---------- Resend ---------- */

function resendHeaders() {
  const lovableKey = process.env["LOVABLE_API_KEY"];
  const resendKey = process.env["RESEND_API_KEY"];
  if (!lovableKey || !resendKey) {
    throw new Error(`E-Mail-Versand nicht eingerichtet (fehlt: ${[!lovableKey && "LOVABLE_API_KEY", !resendKey && "RESEND_API_KEY"].filter(Boolean).join(", ")}).`);
  }
  return { "Content-Type": "application/json", Authorization: `Bearer ${lovableKey}`, "X-Connection-Api-Key": resendKey };
}

let senderCache: { at: number; from: string } | undefined;

/** Sender on a verified Resend domain (prefers ardadagci.com); falls back to Resend's test sender. */
async function sender() {
  if (senderCache && Date.now() - senderCache.at < 10 * 60_000) return senderCache.from;
  let domain: string | undefined;
  try {
    const response = await fetch(`${GATEWAY_URL}/domains`, { headers: resendHeaders() });
    if (response.ok) {
      const body = (await response.json()) as { data?: { name: string; status: string }[] };
      const verified = (body.data ?? []).filter((d) => d.status === "verified").map((d) => d.name);
      domain = verified.find((d) => d === BRAND_DOMAIN || d.endsWith(`.${BRAND_DOMAIN}`)) ?? verified[0];
    } else {
      // Sending-only API keys cannot list domains: assume the brand domain is verified.
      domain = BRAND_DOMAIN;
    }
  } catch {
    domain = BRAND_DOMAIN;
  }
  const from = domain ? `ARDADAGCI <noreply@${domain}>` : "ARDADAGCI <onboarding@resend.dev>";
  senderCache = { at: Date.now(), from };
  return from;
}

export async function sendEmail(to: string, mail: { subject: string; html: string; text: string }) {
  const from = await sender();
  const response = await fetch(`${GATEWAY_URL}/emails`, {
    method: "POST",
    headers: resendHeaders(),
    body: JSON.stringify({ from, to: [to], reply_to: `info@${BRAND_DOMAIN}`, ...mail }),
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    console.error("[auth-email] Resend error", response.status, detail);
    throw new Error(`Resend ${response.status}: ${detail.slice(0, 300)}`);
  }
  return { from };
}

/* ---------- Template ---------- */

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

type Template = { preheader: string; title: string; intro: string; button: string; url: string; note: string; subject: string };

function render({ preheader, title, intro, button, url, note, subject }: Template, origin: string) {
  const link = escapeHtml(url);
  const logo = `${DEFAULT_ORIGIN}/ardadagci-mark.png`;
  const html = `<!doctype html>
<html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>${escapeHtml(subject)}</title></head>
<body style="margin:0;padding:0;background:#f2f2ef;-webkit-text-size-adjust:100%;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f2f2ef;padding:32px 12px;">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:18px;overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#111111;">
<tr><td style="background:#070707;padding:28px 36px;">
<table role="presentation" cellpadding="0" cellspacing="0"><tr>
<td style="vertical-align:middle;padding-right:14px;"><img src="${logo}" width="54" height="40" alt="" style="display:block;border:0;"></td>
<td style="vertical-align:middle;"><div style="color:#ffffff;font-size:20px;font-weight:700;letter-spacing:6px;">ARDADAGCI</div><div style="color:#a9a9a4;font-size:10px;letter-spacing:4px;margin-top:4px;">DUBAI CAR RENTAL</div></td>
</tr></table>
</td></tr>
<tr><td style="padding:40px 36px 8px;">
<h1 style="margin:0 0 16px;font-size:26px;line-height:1.25;font-weight:700;color:#111111;">${escapeHtml(title)}</h1>
<p style="margin:0 0 28px;font-size:16px;line-height:1.6;color:#3d3d3a;">${escapeHtml(intro)}</p>
<table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="border-radius:999px;background:#111111;">
<a href="${link}" target="_blank" style="display:inline-block;padding:15px 34px;font-size:16px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:999px;">${escapeHtml(button)}</a>
</td></tr></table>
<p style="margin:28px 0 0;font-size:13px;line-height:1.6;color:#6b6b66;">Falls der Button nicht funktioniert, kopiere diesen Link in deinen Browser:<br><a href="${link}" style="color:#111111;word-break:break-all;">${link}</a></p>
</td></tr>
<tr><td style="padding:28px 36px 36px;">
<div style="padding:16px 18px;background:#f6f6f3;border-radius:12px;font-size:13px;line-height:1.6;color:#55554f;">${escapeHtml(note)}</div>
</td></tr>
<tr><td style="padding:22px 36px;border-top:1px solid #ececea;font-size:12px;line-height:1.6;color:#8a8a84;">
ARDADAGCI · Luxus-Autovermietung in Dubai<br><a href="${DEFAULT_ORIGIN}" style="color:#8a8a84;">www.ardadagci.com</a>
</td></tr>
</table>
</td></tr></table>
</body></html>`;
  const text = `${title}\n\n${intro}\n\n${button}: ${url}\n\n${note}\n\n— ARDADAGCI · ${origin.replace(/^https?:\/\//, "")}`;
  return { subject, html, text };
}

export const signupEmail = (url: string, origin: string) =>
  render({
    subject: "Bitte bestätige dein ARDADAGCI Admin-Konto",
    preheader: "Ein Klick, und dein Admin-Konto ist bereit.",
    title: "Willkommen bei ARDADAGCI",
    intro: "Dein Admin-Konto für das ARDADAGCI Dashboard wurde angelegt. Bitte bestätige deine E-Mail-Adresse, um die Einrichtung abzuschließen.",
    button: "E-Mail bestätigen",
    url,
    note: "Der Link ist aus Sicherheitsgründen nur kurze Zeit gültig und kann nur einmal verwendet werden. Wenn du kein Konto angelegt hast, kannst du diese E-Mail ignorieren.",
  }, origin);

export const recoveryEmail = (url: string, origin: string) =>
  render({
    subject: "Dein ARDADAGCI Passwort zurücksetzen",
    preheader: "Lege mit diesem Link ein neues Passwort fest.",
    title: "Passwort zurücksetzen",
    intro: "Wir haben eine Anfrage erhalten, das Passwort für dein ARDADAGCI Admin-Konto zurückzusetzen. Über den Button legst du ein neues Passwort fest.",
    button: "Neues Passwort festlegen",
    url,
    note: "Der Link ist nur kurze Zeit gültig und kann nur einmal verwendet werden. Wenn du das nicht angefordert hast, ignoriere diese E-Mail – dein Passwort bleibt unverändert.",
  }, origin);

export const testEmail = (origin: string) =>
  render({
    subject: "Test: E-Mail-Versand ARDADAGCI",
    preheader: "Der E-Mail-Versand über Resend funktioniert.",
    title: "E-Mail-Versand funktioniert",
    intro: "Diese Test-E-Mail wurde über Resend verschickt. So sehen künftig die Bestätigungs- und Passwort-E-Mails des Admin-Dashboards aus.",
    button: "Zum Dashboard",
    url: `${origin}/admin`,
    note: "Diese Nachricht wurde im Admin-Dashboard unter Einstellungen ausgelöst.",
  }, origin);
