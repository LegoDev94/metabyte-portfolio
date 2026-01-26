"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useLocale } from "next-intl";
import { localeCurrency, type Locale } from "@/i18n/config";

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
}

const LocaleContext = createContext<LocaleContextType | null>(null);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const currentLocale = useLocale() as Locale;
  const [locale, setLocaleState] = useState<Locale>(currentLocale);
  const [currency, setCurrency] = useState<CurrencyInfo>(localeCurrency[currentLocale]);
  const [isLoading, setIsLoading] = useState(false);

  // Sync with server locale on mount
  useEffect(() => {
    setLocaleState(currentLocale);
    setCurrency(localeCurrency[currentLocale]);
  }, [currentLocale]);

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
