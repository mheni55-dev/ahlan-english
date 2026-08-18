"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Language } from "@/lib/translations";

type LanguageContextType = {
  lang: Language;
  setLang: (lang: Language) => void;
};

const LanguageContext = createContext<LanguageContextType>({
  lang: "ar",
  setLang: () => {},
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>("ar");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("lang") as Language | null;
    if (stored === "en" || stored === "ar") {
      setLangState(stored);
      document.documentElement.lang = stored;
      document.documentElement.dir = stored === "en" ? "ltr" : "rtl";
    }
    setMounted(true);
  }, []);

  function setLang(newLang: Language) {
    setLangState(newLang);
    localStorage.setItem("lang", newLang);
    document.documentElement.lang = newLang;
    document.documentElement.dir = newLang === "en" ? "ltr" : "rtl";
  }

  if (!mounted) {
    return <LanguageContext.Provider value={{ lang: "ar", setLang }}>{children}</LanguageContext.Provider>;
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
