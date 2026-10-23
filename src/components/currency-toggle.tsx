import { useLanguage } from "@/lib/language";
import type { Currency } from "@/lib/pricing";

const OPTIONS: [Currency, string][] = [["AED", "AED"], ["EUR", "€"]];

/** AED / € switch; the choice is shared site-wide via the LanguageProvider. */
export function CurrencyToggle({ className = "" }: { className?: string }) {
  const { currency, setCurrency, t } = useLanguage();
  return (
    <div className={`language-toggle currency-toggle ${className}`} role="group" aria-label={t("Währung wählen", "Choose currency")}>
      {OPTIONS.map(([code, label]) => (
        <button key={code} type="button" aria-pressed={currency === code} className={currency === code ? "active" : ""} onClick={() => setCurrency(code)}>{label}</button>
      ))}
    </div>
  );
}
