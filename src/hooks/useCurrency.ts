"use client";

import { useState, useEffect, useCallback } from "react";

export function useCurrency() {
  const [currencyCode, setCurrencyCode] = useState<string>("DZD");

  useEffect(() => {
    const stored = localStorage.getItem("currency");
    if (stored) setCurrencyCode(stored);

    function handler(e: Event) {
      const detail = (e as CustomEvent).detail;
      if (detail?.code) setCurrencyCode(detail.code);
    }

    window.addEventListener("currency-change", handler);
    return () => window.removeEventListener("currency-change", handler);
  }, []);

  return currencyCode;
}
