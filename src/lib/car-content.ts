import { createServerFn } from "@tanstack/react-start";
import { customerPriceEur, feeEur, formatEur, type PricingSettings } from "./pricing";
import { fetchSiteConfig } from "./site-config";
import { buildFleet, type Car } from "./site-data";

export type DescriptionBlock = { t: "h" | "p" | "li"; x: string };
/** `de`: German description; `blocks`/`faqs`: the car's own MKR text (English). Admin texts replace both. */
export type CarContent = { de: string[]; blocks: DescriptionBlock[]; faqs: { q: string; a: string }[] };

/** Convert MKR `{{aed:N}}` price tokens into ARDADAGCI customer prices `{{eur:N}}`. */
function toCustomerPrices(text: string, car: Car, pricing: PricingSettings) {
  return text.replace(/\{\{aed:(\d+)\}\}/g, (_, raw: string) => {
    const aed = Number(raw);
    if (aed < 99) return `{{eur:${feeEur(aed, pricing)}}}`;
    const ratio = aed / car.baseDailyAed;
    return `{{eur:${ratio >= 0.5 && ratio <= 2 ? car.price : customerPriceEur(aed, pricing)}}}`;
  });
}

const paragraphs = (text: string) => text.split(/\n\s*\n/).map((part) => part.trim()).filter(Boolean);

// Long MKR descriptions stay on the server; each detail page only receives its own text.
export const getCarContent = createServerFn({ method: "GET" })
  .validator((slug: string) => slug)
  .handler(async ({ data }): Promise<CarContent> => {
    const config = await fetchSiteConfig();
    const car = buildFleet(config).findCar(data);
    const { default: all } = await import("./mkr-descriptions.json");
    const { default: german } = await import("./car-descriptions-de.json");
    const content = (all as Record<string, Omit<CarContent, "de">>)[data];
    if (!car || !content) return { de: [], blocks: [], faqs: [] };
    return {
      de: paragraphs(car.descriptionDe ?? (german as Record<string, string>)[car.title] ?? ""),
      blocks: car.descriptionEn
        ? paragraphs(car.descriptionEn).map((x) => ({ t: "p" as const, x }))
        : content.blocks.map((b) => ({ ...b, x: toCustomerPrices(b.x, car, config.settings) })),
      faqs: content.faqs.map((f) => ({ q: toCustomerPrices(f.q, car, config.settings), a: toCustomerPrices(f.a, car, config.settings) })),
    };
  });

/** Format `{{eur:N}}` price tokens for the active language. */
export const renderPrices = (text: string, language: "de" | "en") => text.replace(/\{\{eur:(\d+)\}\}/g, (_, raw: string) => formatEur(Number(raw), language));
