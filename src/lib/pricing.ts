// Commission model with Masterkey Rent A Car (MKR):
// MKR's daily price (AED) is what ARDADAGCI pays to MKR. Customers see the MKR price plus a fixed
// AED markup that depends on the price class, and ARDADAGCI keeps the difference.
// Example: Lamborghini Revuelto MKR 8.999 AED + 1.000 AED = 9.999 AED customer price.
// All prices are stored and calculated in AED; EUR is only a display conversion.
// Markup tiers and exchange rate are edited in the admin dashboard (site_settings); these are the defaults.
export type MarkupTier = { fromAed: number; addAed: number };
export type PricingSettings = { markupTiers: MarkupTier[]; aedPerEur: number };
export type Currency = "AED" | "EUR";

export const DEFAULT_MARKUP_TIERS: MarkupTier[] = [
  { fromAed: 0, addAed: 500 },
  { fromAed: 1000, addAed: 650 },
  { fromAed: 3000, addAed: 850 },
  { fromAed: 6000, addAed: 1000 },
];

export const DEFAULT_PRICING: PricingSettings = { markupTiers: DEFAULT_MARKUP_TIERS, aedPerEur: 4.25 };

/** Markup in AED for an MKR daily price: the last tier that starts at or below it. */
export function markupAed(baseAed: number, tiers: MarkupTier[] = DEFAULT_MARKUP_TIERS) {
  const sorted = [...tiers].sort((a, b) => a.fromAed - b.fromAed);
  return sorted.filter((tier) => tier.fromAed <= baseAed).at(-1)?.addAed ?? sorted[0]?.addAed ?? 0;
}

/** Customer daily price in AED: MKR price plus the exact markup of its price class (keeps MKR's x99 style). */
export const customerPriceAed = (baseAed: number, pricing: PricingSettings = DEFAULT_PRICING) => baseAed + markupAed(baseAed, pricing.markupTiers);

/** Format an AED amount in the chosen currency (EUR is converted with the admin exchange rate). */
export function formatMoney(aed: number, currency: Currency = "AED", language: "de" | "en" = "de", aedPerEur = DEFAULT_PRICING.aedPerEur) {
  const locale = language === "de" ? "de-DE" : "en-GB";
  if (currency === "EUR") {
    return new Intl.NumberFormat(locale, { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(Math.round(aed / aedPerEur));
  }
  const amount = new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(Math.round(aed));
  return language === "de" ? `${amount} AED` : `AED ${amount}`;
}

/** Admin dashboard: AED amount (German). */
export const formatAed = (aed: number) => formatMoney(aed, "AED", "de");
