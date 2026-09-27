import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Language = "de" | "en";

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
};

const LanguageContext = createContext<LanguageContextValue>({ language: "de", setLanguage: () => undefined });

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("de");
  useEffect(() => {
    const stored = window.localStorage.getItem("ardadagci-language");
    if (stored === "de" || stored === "en") setLanguageState(stored);
  }, []);
  const setLanguage = (next: Language) => {
    setLanguageState(next);
    window.localStorage.setItem("ardadagci-language", next);
    document.documentElement.lang = next;
  };
  return <LanguageContext.Provider value={{ language, setLanguage }}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  return useContext(LanguageContext);
}
