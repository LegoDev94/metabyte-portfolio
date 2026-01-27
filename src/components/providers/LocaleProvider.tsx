"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useLocale } from "next-intl";
import { localeCurrency, type Locale } from "@/i18n/config";

// Type for UI strings dictionary
export type UIStringsDict = Record<string, string>;

interface CurrencyInfo {
  code: string;
  symbol: string;
  rate: number;
}

interface LocaleContextType {
  locale: Locale;
  currency: CurrencyInfo;
  setLocale: (locale: Locale) => Promise<void>;
  formatPrice: (priceInRub: number) => string;
  isLoading: boolean;
  // UI Strings from database
  uiStrings: UIStringsDict;
  uiStringsLoaded: boolean;
}

const LocaleContext = createContext<LocaleContextType | null>(null);

interface LocaleProviderProps {
  children: React.ReactNode;
  // Pre-loaded UI strings from server component
  initialUIStrings?: UIStringsDict;
}

export function LocaleProvider({ children, initialUIStrings = {} }: LocaleProviderProps) {
  const currentLocale = useLocale() as Locale;
  const [locale, setLocaleState] = useState<Locale>(currentLocale);
  const [currency, setCurrency] = useState<CurrencyInfo>(localeCurrency[currentLocale]);
  const [isLoading, setIsLoading] = useState(false);

  // UI Strings state
  const [uiStrings, setUIStrings] = useState<UIStringsDict>(initialUIStrings);
  const [uiStringsLoaded, setUIStringsLoaded] = useState(Object.keys(initialUIStrings).length > 0);

  // Sync with server locale on mount
  useEffect(() => {
    setLocaleState(currentLocale);
    setCurrency(localeCurrency[currentLocale]);
  }, [currentLocale]);

  // Load UI strings if not pre-loaded
  useEffect(() => {
    if (!uiStringsLoaded && Object.keys(uiStrings).length === 0) {
      loadUIStrings(currentLocale);
    }
  }, [currentLocale, uiStringsLoaded, uiStrings]);

  // Function to load UI strings from API
  const loadUIStrings = async (targetLocale: Locale) => {
    try {
      const response = await fetch(`/api/ui-strings?locale=${targetLocale}`);
      if (response.ok) {
        const data = await response.json();
        setUIStrings(data.strings || {});
        setUIStringsLoaded(true);
      }
    } catch (error) {
      console.error("Failed to load UI strings:", error);
      // Keep using initial strings or empty object
    }
  };

  // Function to change locale
  const setLocale = useCallback(async (newLocale: Locale) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/geo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale: newLocale }),
      });

      if (response.ok) {
        const data = await response.json();
        setLocaleState(newLocale);
        setCurrency(data.currency);
        // Load new UI strings before reload
        await loadUIStrings(newLocale);
        // Reload to apply new locale
        window.location.reload();
      }
    } catch (error) {
      console.error("Failed to change locale:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Format price based on current locale/currency
  const formatPrice = useCallback(
    (priceInRub: number) => {
      if (locale === "ro") {
        // Convert RUB to MDL
        const priceInMdl = Math.round(priceInRub * currency.rate);
        return `${priceInMdl.toLocaleString("ro-MD")} ${currency.symbol}`;
      }
      // Default: Russian rubles
      return `${priceInRub.toLocaleString("ru-RU")} ${currency.symbol}`;
    },
    [locale, currency]
  );

  return (
    <LocaleContext.Provider
      value={{
        locale,
        currency,
        setLocale,
        formatPrice,
        isLoading,
        uiStrings,
        uiStringsLoaded,
      }}
    >
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocaleContext() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useLocaleContext must be used within LocaleProvider");
  }
  return context;
}
