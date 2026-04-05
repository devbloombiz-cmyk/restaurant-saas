const CURRENCY_LOCALE_MAP: Record<string, string> = {
  INR: "en-IN",
  GBP: "en-GB",
  USD: "en-US",
  EUR: "de-DE"
};

export function getActiveCurrency(): string {
  return localStorage.getItem("currency") ?? "INR";
}

export function formatCurrency(value: number, currencyCode?: string): string {
  const currency = (currencyCode ?? getActiveCurrency() ?? "INR").toUpperCase();
  const locale = CURRENCY_LOCALE_MAP[currency] ?? "en-IN";
  const normalized = Number.isFinite(value) ? value : 0;

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(normalized);
}
