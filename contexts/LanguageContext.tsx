"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import en from "../messages/en.json";
import es from "../messages/es.json";
import ca from "../messages/ca.json";

type Translations = {
  [key: string]: string | Translations;
};

const translations: { [key: string]: Translations } = {
  en,
  es,
  ca,
};

type LanguageContextType = {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState("en"); // Default to English

  useEffect(() => {
    // Load saved language preference from localStorage
    const savedLanguage = localStorage.getItem("preferredLanguage");
    if (savedLanguage && ["en", "es", "ca"].includes(savedLanguage)) {
      setLanguage(savedLanguage);
    }
  }, []);

  const handleSetLanguage = (lang: string) => {
    setLanguage(lang);
    // Save language preference to localStorage
    localStorage.setItem("preferredLanguage", lang);
  };

  const t = (key: string, params?: Record<string, string | number>): string => {
    const keys = key.split(".");
    let value: any = translations[language];

    for (const k of keys) {
      if (value?.[k] === undefined) {
        console.warn(
          `Translation missing for key: ${key} in language: ${language}`
        );
        return key;
      }
      value = value[k];
    }

    if (typeof value !== "string") {
      console.warn(`Translation value is not a string for key: ${key}`);
      return key;
    }

    // Replace parameters if they exist
    if (params) {
      return Object.entries(params).reduce((str, [key, val]) => {
        return str.replace(new RegExp(`{{${key}}}`, "g"), String(val));
      }, value);
    }

    return value;
  };

  return (
    <LanguageContext.Provider
      value={{ language, setLanguage: handleSetLanguage, t }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

const storeLanguagePreference = (lang: string) => {
  try {
    if (typeof window !== "undefined") {
      localStorage.setItem("language", lang.slice(0, 2)); // Only store valid language codes
    }
  } catch (e) {
    console.error("Storage failed:", e);
  }
};
