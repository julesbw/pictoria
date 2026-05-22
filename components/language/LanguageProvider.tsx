"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { defaultLanguage, type Language } from "@/lib/localization";

const storageKey = "pictoria:language";

interface LanguageContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function isLanguage(value: string | null): value is Language {
  return value === "es" || value === "en";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(defaultLanguage);

  useEffect(() => {
    const storedLanguage = window.localStorage.getItem(storageKey);

    if (isLanguage(storedLanguage)) {
      setLanguageState(storedLanguage);
    }
  }, []);

  function setLanguage(nextLanguage: Language) {
    setLanguageState(nextLanguage);
    window.localStorage.setItem(storageKey, nextLanguage);
  }

  const value = useMemo(
    () => ({
      language,
      setLanguage,
    }),
    [language],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider.");
  }

  return context;
}
