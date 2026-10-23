import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Currency } from "./pricing";

export type Language = "de" | "en";

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  /** Pick the German or English variant of a text. */
  t: <T>(de: T, en: T) => T;
  /** Display currency for prices (AED by default, EUR converted). */
  currency: Currency;
  setCurrency: (currency: Currency) => void;
};

const LanguageContext = createContext<LanguageContextValue>({
  language: "de",
  setLanguage: () => undefined,
  t: (de) => de,
  currency: "AED",
  setCurrency: () => undefined,
});

const read = (key: string) => {
  try { return window.localStorage.getItem(key); } catch { return null; }
};
const write = (key: string, value: string) => {
  try { window.localStorage.setItem(key, value); } catch { /* storage blocked */ }
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("de");
  const [currency, setCurrencyState] = useState<Currency>("AED");
  useEffect(() => {
    const stored = read("ardadagci-language");
    if (stored === "de" || stored === "en") {
      setLanguageState(stored);
      document.documentElement.lang = stored;
    }
    const storedCurrency = read("ardadagci-currency");
    if (storedCurrency === "AED" || storedCurrency === "EUR") setCurrencyState(storedCurrency);
  }, []);
  const setLanguage = (next: Language) => {
    setLanguageState(next);
    write("ardadagci-language", next);
    document.documentElement.lang = next;
  };
  const setCurrency = (next: Currency) => {
    setCurrencyState(next);
    write("ardadagci-currency", next);
  };
  const t = <T,>(de: T, en: T) => (language === "de" ? de : en);
  return <LanguageContext.Provider value={{ language, setLanguage, t, currency, setCurrency }}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  return useContext(LanguageContext);
}
