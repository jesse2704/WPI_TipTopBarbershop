import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Language = "nl" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  txt: (dutch: string, english: string) => string;
}

const STORAGE_KEY = "tiptop_language";

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

function getInitialLanguage(): Language {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "nl" || stored === "en") {
      return stored;
    }
  } catch {
    // Ignore storage errors and use Dutch default.
  }

  return "nl";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);

  useEffect(() => {
    document.documentElement.lang = language;
    try {
      localStorage.setItem(STORAGE_KEY, language);
    } catch {
      // Ignore storage errors.
    }
  }, [language]);

  const value = useMemo<LanguageContextType>(() => {
    return {
      language,
      setLanguage: setLanguageState,
      txt: (dutch: string, english: string) => (language === "nl" ? dutch : english),
    };
  }, [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }

  return context;
}
