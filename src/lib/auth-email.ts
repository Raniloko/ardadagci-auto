import { createServerFn } from "@tanstack/react-start";

// Admin account e-mails go through Resend with our own design instead of the default auth mails.
// The links carry a one-time token hash that the dashboard verifies (see useAdminAuth).

const isEmail = (value: unknown): value is string => typeof value === "string" && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value.trim()) && value.length <= 254;

export type AuthEmailResult = { ok: true } | { ok: false; error: "invalid" | "code" | "exists" | "rate" | "send" };

/** Creates an (unconfirmed) admin account and mails the confirmation link. Requires a valid setup/invite code. */
export const registerAdmin = createServerFn({ method: "POST" })
  .validator((data: { email: string; password: string; code: string }) => data)
  .handler(async ({ data }): Promise<AuthEmailResult> => {
    if (!isEmail(data.email) || typeof data.password !== "string" || data.password.length < 8 || data.password.length > 72 || typeof data.code !== "string") return { ok: false, error: "invalid" };
    const mail = await import("./auth-email.server");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const email = data.email.trim().toLowerCase();
    if (!(await mail.isAdminCodeValid(data.code))) return { ok: false, error: "code" };
    if (!(await mail.allowEmail("signup", email))) return { ok: false, error: "rate" };
    let { data: link, error } = await supabaseAdmin.auth.admin.generateLink({ type: "signup", email, password: data.password });
    let type = "signup";
    if (error && /already (been )?registered|already exists/i.test(error.message)) {
      // An earlier, never confirmed attempt: set the new password and send a fresh confirmation link.
      const { data: users } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
      const existing = users?.users.find((u) => u.email?.toLowerCase() === email);
      if (!existing || existing.email_confirmed_at) return { ok: false, error: "exists" };
      await supabaseAdmin.auth.admin.updateUserById(existing.id, { password: data.password });
      ({ data: link, error } = await supabaseAdmin.auth.admin.generateLink({ type: "magiclink", email }));
      type = "magiclink";
    }
    if (error || !link?.properties) {
      console.error("[auth-email] signup link", error?.message);
      return { ok: false, error: "invalid" };
    }
    const origin = mail.siteOrigin();
    const url = `${origin}/admin?token_hash=${encodeURIComponent(link.properties.hashed_token)}&type=${type}`;
    try {
      await mail.sendEmail(email, mail.signupEmail(url, origin));
    } catch {
      return { ok: false, error: "send" };
    }
    return { ok: true };
  });

/** Mails a password reset link. Always answers ok for unknown addresses (no account probing). */
export const requestPasswordReset = createServerFn({ method: "POST" })
  .validator((data: { email: string }) => data)
  .handler(async ({ data }): Promise<AuthEmailResult> => {
    if (!isEmail(data.email)) return { ok: false, error: "invalid" };
    const mail = await import("./auth-email.server");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const email = data.email.trim().toLowerCase();
    if (!(await mail.allowEmail("recovery", email))) return { ok: false, error: "rate" };
    const { data: link, error } = await supabaseAdmin.auth.admin.generateLink({ type: "recovery", email });
    if (error) return { ok: true };
    const origin = mail.siteOrigin();
    const url = `${origin}/admin?token_hash=${encodeURIComponent(link.properties.hashed_token)}&type=recovery`;
    try {
      await mail.sendEmail(email, mail.recoveryEmail(url, origin));
    } catch {
      return { ok: false, error: "send" };
    }
    return { ok: true };
  });

/** Admin settings: sends a test mail to the signed-in admin and reports the sender or the Resend error. */
export const sendTestEmail = createServerFn({ method: "POST" })
  .validator((data: { accessToken: string }) => data)
  .handler(async ({ data }): Promise<{ ok: true; to: string; from: string } | { ok: false; message: string }> => {
    const mail = await import("./auth-email.server");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: user } = await supabaseAdmin.auth.getUser(data.accessToken);
    const email = user.user?.email;
    if (!user.user || !email) return { ok: false, message: "Nicht angemeldet." };
    const { data: admin } = await supabaseAdmin.from("admin_users").select("user_id").eq("user_id", user.user.id).maybeSingle();
    if (!admin) return { ok: false, message: "Keine Admin-Rechte." };
    if (!(await mail.allowEmail("test", email))) return { ok: false, message: "Zu viele Test-E-Mails – bitte 15 Minuten warten." };
    try {
      const { from } = await mail.sendEmail(email, mail.testEmail(mail.siteOrigin()));
      return { ok: true, to: email, from };
    } catch (error) {
      return { ok: false, message: error instanceof Error ? error.message : String(error) };
    }
  });
