import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Session } from "@supabase/supabase-js";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import type { Booking } from "./bookings";
import { DEFAULT_SETTINGS, overrideFromRow, settingsFromRow, type CarOverride, type SiteSettings } from "./site-config";
import { buildFleet } from "./site-data";

/* ---------- Auth ---------- */

export type AdminAuth =
  | { status: "loading" }
  | { status: "signed-out"; setupOpen: boolean; recovery: false }
  | { status: "recovery"; session: Session }
  | { status: "not-admin"; session: Session; setupOpen: boolean }
  | { status: "admin"; session: Session };

// Set when a password reset link was opened; survives effect re-runs until the new password is saved.
let recoveryPending = false;

/** Session + admin check. Every write is additionally enforced by Row Level Security in the database. */
export function useAdminAuth() {
  const [auth, setAuth] = useState<AdminAuth>({ status: "loading" });
  const [linkError, setLinkError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);
  useEffect(() => {
    let alive = true;
    if (typeof window !== "undefined" && window.location.hash.includes("type=recovery")) recoveryPending = true;
    async function evaluate(session: Session | null) {
      if (!alive) return;
      if (!session) {
        const { data } = await supabase.rpc("admin_setup_open");
        if (alive) setAuth({ status: "signed-out", setupOpen: Boolean(data), recovery: false });
        return;
      }
      if (recoveryPending) {
        setAuth({ status: "recovery", session });
        return;
      }
      const [{ data: isAdmin }, { data: setupOpen }] = await Promise.all([supabase.rpc("is_admin"), supabase.rpc("admin_setup_open")]);
      if (!alive) return;
      setAuth(isAdmin ? { status: "admin", session } : { status: "not-admin", session, setupOpen: Boolean(setupOpen) });
    }
    // Links from our Resend e-mails: /admin?token_hash=…&type=signup|magiclink|recovery
    async function start() {
      const params = new URLSearchParams(window.location.search);
      const tokenHash = params.get("token_hash");
      const type = params.get("type");
      if (tokenHash && (type === "signup" || type === "magiclink" || type === "recovery")) {
        window.history.replaceState(null, "", "/admin");
        if (type === "recovery") recoveryPending = true;
        const { data, error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
        if (!alive) return;
        if (error || !data.session) {
          recoveryPending = false;
          setLinkError("Der Link ist abgelaufen oder wurde schon benutzt. Bitte fordere einen neuen an.");
        } else {
          return evaluate(data.session);
        }
      }
      const { data } = await supabase.auth.getSession();
      return evaluate(data.session);
    }
    void start();
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") recoveryPending = true;
      if (event === "USER_UPDATED") recoveryPending = false;
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "PASSWORD_RECOVERY" || event === "USER_UPDATED") void evaluate(session);
    });
    return () => {
      alive = false;
      listener.subscription.unsubscribe();
    };
  }, [version]);
  return { auth, linkError, refresh: () => setVersion((v) => v + 1) };
}

export const signOut = () => supabase.auth.signOut();

/* ---------- Queries ---------- */

const keys = { overrides: ["admin", "overrides"], settings: ["admin", "settings"], bookings: ["admin", "bookings"], admins: ["admin", "admins"] } as const;

export function useAdminOverrides() {
  return useQuery({
    queryKey: keys.overrides,
    queryFn: async () => {
      const { data, error } = await supabase.from("car_overrides").select("*");
      if (error) throw error;
      return Object.fromEntries(data.map((row) => [row.slug, overrideFromRow(row)])) as Record<string, CarOverride>;
    },
  });
}

export function useAdminSettings() {
  return useQuery({
    queryKey: keys.settings,
    queryFn: async () => {
      const { data, error } = await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle();
      if (error) throw error;
      return data ? settingsFromRow(data) : DEFAULT_SETTINGS;
    },
  });
}

/** All cars (including hidden ones) with the current admin changes applied. */
export function useAdminFleet() {
  const overrides = useAdminOverrides();
  const settings = useAdminSettings();
  const fleet = useMemo(
    () => buildFleet({ settings: settings.data ?? DEFAULT_SETTINGS, overrides: overrides.data ?? {} }),
    [overrides.data, settings.data],
  );
  return { fleet, overrides: overrides.data ?? {}, settings: settings.data ?? DEFAULT_SETTINGS, isLoading: overrides.isLoading || settings.isLoading, error: overrides.error ?? settings.error };
}

export function useBookings() {
  return useQuery({
    queryKey: keys.bookings,
    queryFn: async () => {
      const { data, error } = await supabase.from("bookings").select("*").order("created_at", { ascending: false }).limit(500);
      if (error) throw error;
      return data as Booking[];
    },
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  });
}

/** Admin accounts and open invites (via security-definer functions, admins only). */
export function useAdmins() {
  return useQuery({
    queryKey: keys.admins,
    queryFn: async () => {
      const [admins, invites] = await Promise.all([supabase.rpc("list_admins"), supabase.rpc("list_admin_invites")]);
      if (admins.error) throw admins.error;
      if (invites.error) throw invites.error;
      return { admins: admins.data, invites: invites.data };
    },
  });
}

/* ---------- Mutations ---------- */

/** Creates a one-time invite and returns the plain code (it cannot be shown again). */
export function useCreateInvite() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc("create_admin_invite");
      if (error) throw error;
      return data;
    },
    onSuccess: () => client.invalidateQueries({ queryKey: keys.admins }),
  });
}

export function useRevokeInvite() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.rpc("revoke_admin_invite", { invite_id: id });
      if (error) throw error;
    },
    onSuccess: () => client.invalidateQueries({ queryKey: keys.admins }),
  });
}

export function useRemoveAdmin() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase.rpc("remove_admin", { target: userId });
      if (error) throw error;
    },
    onSuccess: () => client.invalidateQueries({ queryKey: keys.admins }),
  });
}

export type OverridePatch = Partial<Omit<TablesInsert<"car_overrides">, "slug" | "updated_at">>;

export function useSaveOverride() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async ({ slug, patch }: { slug: string; patch: OverridePatch }) => {
      const { error } = await supabase.from("car_overrides").upsert({ slug, ...patch }, { onConflict: "slug" });
      if (error) throw error;
    },
    onSuccess: () => client.invalidateQueries({ queryKey: keys.overrides }),
  });
}

export function useResetOverride() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (slug: string) => {
      const { error } = await supabase.from("car_overrides").delete().eq("slug", slug);
      if (error) throw error;
    },
    onSuccess: () => client.invalidateQueries({ queryKey: keys.overrides }),
  });
}

export function useSaveSettings() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (settings: SiteSettings) => {
      const { error } = await supabase
        .from("site_settings")
        .update({
          markup_tiers: settings.markupTiers,
          aed_per_eur: settings.aedPerEur,
          whatsapp_number: settings.whatsappNumber,
          phone_number: settings.phoneNumber,
          email: settings.email,
          tiktok_url: settings.tiktokUrl,
        })
        .eq("id", 1)
        .select("id")
        .single();
      if (error) throw error;
    },
    onSuccess: () => client.invalidateQueries({ queryKey: keys.settings }),
  });
}

export function useSaveBooking() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, values }: { id: string | null; values: TablesUpdate<"bookings"> }) => {
      if (id) {
        const { error } = await supabase.from("bookings").update(values).eq("id", id).select("id").single();
        if (error) throw error;
        return id;
      }
      const { data, error } = await supabase
        .from("bookings")
        .insert({ ...(values as TablesInsert<"bookings">), source: "admin" })
        .select("id")
        .single();
      if (error) throw error;
      return data.id;
    },
    onSuccess: () => client.invalidateQueries({ queryKey: keys.bookings }),
  });
}

export function useDeleteBooking() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("bookings").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => client.invalidateQueries({ queryKey: keys.bookings }),
  });
}

/* ---------- Helpers ---------- */

export const dateDe = (value: string | null) => (value ? new Date(`${value}T00:00:00`).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" }) : "–");

export const days = (start: string | null, end: string | null) =>
  start && end ? Math.max(1, Math.round((Date.parse(end) - Date.parse(start)) / 86_400_000)) : 0;

export function relativeTime(iso: string) {
  const minutes = Math.round((Date.now() - Date.parse(iso)) / 60_000);
  if (minutes < 1) return "gerade eben";
  if (minutes < 60) return `vor ${minutes} Min.`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `vor ${hours} Std.`;
  const d = Math.round(hours / 24);
  return d === 1 ? "gestern" : `vor ${d} Tagen`;
}

/** WhatsApp link to a customer (any phone format → digits). */
export const customerWhatsapp = (phone: string, text = "") => `https://wa.me/${phone.replace(/\D/g, "").replace(/^00/, "")}${text ? `?text=${encodeURIComponent(text)}` : ""}`;

export const errorMessage = (error: unknown) => {
  const message = error instanceof Error ? error.message : typeof error === "object" && error && "message" in error ? String((error as { message: unknown }).message) : String(error);
  if (/row-level security|permission denied|JWT|PGRST116/i.test(message)) return "Keine Berechtigung – bitte neu anmelden.";
  if (/violates check constraint/i.test(message)) return "Ungültiger Wert – bitte Eingaben prüfen.";
  return message || "Unbekannter Fehler";
};
