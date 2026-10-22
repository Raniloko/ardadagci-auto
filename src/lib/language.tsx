import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Language = "de" | "en";

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  /** Pick the German or English variant of a text. */
  t: <T>(de: T, en: T) => T;
};

const LanguageContext = createContext<LanguageContextValue>({ language: "de", setLanguage: () => undefined, t: (de) => de });

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("de");
  useEffect(() => {
    const stored = window.localStorage.getItem("ardadagci-language");
    if (stored === "de" || stored === "en") {
      setLanguageState(stored);
      document.documentElement.lang = stored;
    }
  }, []);
  const setLanguage = (next: Language) => {
    setLanguageState(next);
    window.localStorage.setItem("ardadagci-language", next);
    document.documentElement.lang = next;
  };
  const t = <T,>(de: T, en: T) => (language === "de" ? de : en);
  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  return useContext(LanguageContext);
}
