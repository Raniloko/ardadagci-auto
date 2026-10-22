// Commission model with Masterkey Rent A Car (MKR):
// MKR's daily price (AED) is what ARDADAGCI pays to MKR. ARDADAGCI shows customers the MKR
// price converted to EUR plus its own markup and keeps the difference.
// Example: MKR 400 € + 75 % markup (300 €) = 700 € customer price → 400 € to MKR, 300 € stays.
export const PRICING = {
  /** Exchange rate used for conversion. Update when the EUR/AED rate moves. */
  aedPerEur: 4.25,
  /** ARDADAGCI markup on top of the MKR price. */
  markupPercent: 75,
  /** Customer prices are rounded up to "clean" steps in EUR: [up to price, step]. */
  roundingSteps: [[100, 5], [1000, 10], [Infinity, 50]] as [number, number][],
  /** Per-vehicle customer daily price in EUR, overriding the formula (key = vehicle slug). */
  overrides: {} as Record<string, number>,
};

export const aedToEur = (aed: number) => aed / PRICING.aedPerEur;

/** Customer daily price in EUR for an MKR base price in AED. */
export function customerPriceEur(baseAed: number, slug?: string) {
  const override = slug ? PRICING.overrides[slug] : undefined;
  if (override) return override;
  const eur = aedToEur(baseAed) * (1 + PRICING.markupPercent / 100);
  const step = PRICING.roundingSteps.find(([limit]) => eur < limit)?.[1] ?? 10;
  return Math.ceil(eur / step) * step;
}

/** Pass-through fees such as extra kilometres or tolls, converted without markup. */
export const feeEur = (aed: number) => Math.max(1, Math.round(aedToEur(aed)));

export function formatEur(value: number, language: "de" | "en" = "de") {
  return new Intl.NumberFormat(language === "de" ? "de-DE" : "en-GB", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value);
}
