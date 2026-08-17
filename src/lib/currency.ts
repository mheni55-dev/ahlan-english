// Exchange rates from DZD (base)
const rates: Record<string, number> = {
  DZD: 1,
  USD: 0.0074,
  EUR: 0.0068,
  GBP: 0.0058,
  SAR: 0.028,
  AED: 0.027,
  EGP: 0.36,
  MAD: 0.074,
  TND: 0.023,
  LYD: 0.036,
};

export function convertPrice(priceDZD: number, toCurrency: string): number {
  const rate = rates[toCurrency] ?? 1;
  return Math.round(priceDZD * rate);
}

export function getCurrencySymbol(code: string): string {
  const symbols: Record<string, string> = {
    DZD: "دج",
    USD: "$",
    EUR: "€",
    GBP: "£",
    SAR: "ر.س",
    AED: "د.إ",
    EGP: "ج.م",
    MAD: "د.م",
    TND: "د.ت",
    LYD: "ل.د",
  };
  return symbols[code] ?? code;
}

export function formatPrice(priceDZD: number, currencyCode: string): string {
  const converted = convertPrice(priceDZD, currencyCode);
  const symbol = getCurrencySymbol(currencyCode);
  return `${converted.toLocaleString()} ${symbol}`;
}
