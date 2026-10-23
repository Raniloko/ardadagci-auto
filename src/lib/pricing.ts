// Commission model with Masterkey Rent A Car (MKR):
// MKR's daily price (AED) is what ARDADAGCI pays to MKR. ARDADAGCI shows customers the MKR
// price converted to EUR plus its own markup and keeps the difference.
// Example: MKR 400 € + 75 % markup (300 €) = 700 € customer price → 400 € to MKR, 300 € stays.
// Markup and exchange rate are edited in the admin dashboard (site_settings); these are the defaults.
export type PricingSettings = { markupPercent: number; aedPerEur: number };

export const DEFAULT_PRICING: PricingSettings = { markupPercent: 75, aedPerEur: 4.25 };

/** Customer prices are rounded up to "clean" steps in EUR: [up to price, step]. */
const ROUNDING_STEPS: [number, number][] = [[100, 5], [1000, 10], [Infinity, 50]];

export const aedToEur = (aed: number, pricing: PricingSettings = DEFAULT_PRICING) => aed / pricing.aedPerEur;

/** Customer daily price in EUR for an MKR base price in AED. */
export function customerPriceEur(baseAed: number, pricing: PricingSettings = DEFAULT_PRICING) {
  const eur = aedToEur(baseAed, pricing) * (1 + pricing.markupPercent / 100);
  const step = ROUNDING_STEPS.find(([limit]) => eur < limit)?.[1] ?? 10;
  return Math.ceil(eur / step) * step;
}

/** Pass-through fees such as extra kilometres or tolls, converted without markup. */
export const feeEur = (aed: number, pricing: PricingSettings = DEFAULT_PRICING) => Math.max(1, Math.round(aedToEur(aed, pricing)));

export function formatEur(value: number, language: "de" | "en" = "de") {
  return new Intl.NumberFormat(language === "de" ? "de-DE" : "en-GB", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value);
}
