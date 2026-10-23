import { createServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { DEFAULT_MARKUP_TIERS, DEFAULT_PRICING, type MarkupTier } from "./pricing";

/** Everything the admin dashboard can change on the public site. */
export type SiteSettings = {
  markupTiers: MarkupTier[];
  aedPerEur: number;
  whatsappNumber: string;
  phoneNumber: string;
  email: string;
  tiktokUrl: string;
};

export type CarOverride = {
  hidden: boolean;
  available: boolean;
  featured: boolean | null;
  /** Fixed customer price per day in AED. */
  priceAed: number | null;
  name: string | null;
  category: string | null;
  mileageLimitKm: number | null;
  descriptionDe: string | null;
  descriptionEn: string | null;
};

export type SiteConfig = { settings: SiteSettings; overrides: Record<string, CarOverride> };

export const DEFAULT_SETTINGS: SiteSettings = {
  ...DEFAULT_PRICING,
  whatsappNumber: "491726023003",
  phoneNumber: "+491726023003",
  email: "",
  tiktokUrl: "https://www.tiktok.com/@ardaadagcii",
};

export const DEFAULT_CONFIG: SiteConfig = { settings: DEFAULT_SETTINGS, overrides: {} };

/** Validates the stored markup tiers; anything unusable falls back to the defaults. */
function parseTiers(value: unknown): MarkupTier[] {
  if (!Array.isArray(value)) return DEFAULT_MARKUP_TIERS;
  const tiers = value
    .map((tier) => ({ fromAed: Number(tier?.fromAed), addAed: Number(tier?.addAed) }))
    .filter((tier) => Number.isFinite(tier.fromAed) && Number.isFinite(tier.addAed) && tier.fromAed >= 0 && tier.addAed >= 0);
  return tiers.length ? tiers.sort((a, b) => a.fromAed - b.fromAed) : DEFAULT_MARKUP_TIERS;
}

export const settingsFromRow = (row: Tables<"site_settings">): SiteSettings => ({
  markupTiers: parseTiers(row.markup_tiers),
  aedPerEur: Number(row.aed_per_eur),
  whatsappNumber: row.whatsapp_number,
  phoneNumber: row.phone_number,
  email: row.email,
  tiktokUrl: row.tiktok_url,
});

export const overrideFromRow = (row: Tables<"car_overrides">): CarOverride => ({
  hidden: row.hidden,
  available: row.available,
  featured: row.featured,
  priceAed: row.price_aed,
  name: row.name,
  category: row.category,
  mileageLimitKm: row.mileage_limit_km,
  descriptionDe: row.description_de,
  descriptionEn: row.description_en,
});

// Short cache so every page view does not hit the database; admin changes show up within seconds.
const TTL_MS = 15_000;
let cached: { at: number; value: SiteConfig } | undefined;

/** Reads settings and car overrides (public, read-only via RLS). Falls back to defaults on any error. */
export async function fetchSiteConfig(): Promise<SiteConfig> {
  if (cached && Date.now() - cached.at < TTL_MS) return cached.value;
  try {
    const [settings, overrides] = await Promise.all([
      supabase.from("site_settings").select("*").eq("id", 1).maybeSingle(),
      supabase.from("car_overrides").select("*"),
    ]);
    if (settings.error || overrides.error) throw settings.error ?? overrides.error;
    const value: SiteConfig = {
      settings: settings.data ? settingsFromRow(settings.data) : DEFAULT_SETTINGS,
      overrides: Object.fromEntries((overrides.data ?? []).map((row) => [row.slug, overrideFromRow(row)])),
    };
    cached = { at: Date.now(), value };
    return value;
  } catch (error) {
    console.error("[site-config] falling back to defaults", error);
    return cached?.value ?? DEFAULT_CONFIG;
  }
}

export const getSiteConfig = createServerFn({ method: "GET" }).handler(() => fetchSiteConfig());

let clientCache: { at: number; value: Promise<SiteConfig> } | undefined;

/** Loader helper: server-side it reads directly, in the browser it caches the request for a short time. */
export function loadSiteConfig(): Promise<SiteConfig> {
  if (typeof window === "undefined") return getSiteConfig();
  if (!clientCache || Date.now() - clientCache.at > TTL_MS) {
    clientCache = { at: Date.now(), value: getSiteConfig().catch(() => DEFAULT_CONFIG) };
  }
  return clientCache.value;
}
