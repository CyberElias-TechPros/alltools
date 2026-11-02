/**
 * Offline currency conversion. Rates are supplied by the caller and expressed
 * as units of a currency per 1 unit of the base (US dollars by default), so
 * nothing here depends on a network feed. Pre-filled values are approximate
 * starting points the user is expected to replace with a quoted rate.
 */
export interface Currency {
  code: string;
  name: string;
  symbol: string;
}

export const CURRENCIES: Currency[] = [
  { code: "USD", name: "US dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British pound", symbol: "£" },
  { code: "NGN", name: "Nigerian naira", symbol: "₦" },
  { code: "KES", name: "Kenyan shilling", symbol: "KSh" },
  { code: "GHS", name: "Ghanaian cedi", symbol: "₵" },
  { code: "ZAR", name: "South African rand", symbol: "R" },
  { code: "INR", name: "Indian rupee", symbol: "₹" },
  { code: "JPY", name: "Japanese yen", symbol: "¥" },
  { code: "CNY", name: "Chinese yuan", symbol: "CN¥" },
  { code: "CAD", name: "Canadian dollar", symbol: "C$" },
  { code: "AUD", name: "Australian dollar", symbol: "A$" },
  { code: "CHF", name: "Swiss franc", symbol: "CHF" },
  { code: "AED", name: "UAE dirham", symbol: "AED" },
  { code: "BRL", name: "Brazilian real", symbol: "R$" },
  { code: "MXN", name: "Mexican peso", symbol: "MX$" },
];

/** Approximate units per 1 USD. Replace with a quoted rate before relying on it. */
export const SEED_RATES: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  NGN: 1500,
  KES: 129,
  GHS: 15.5,
  ZAR: 18.2,
  INR: 83.5,
  JPY: 155,
  CNY: 7.2,
  CAD: 1.36,
  AUD: 1.52,
  CHF: 0.88,
  AED: 3.67,
  BRL: 5.4,
  MXN: 17.5,
};

export type Rates = Record<string, number>;

export function getCurrency(code: string): Currency | undefined {
  return CURRENCIES.find((currency) => currency.code === code);
}

/** Units of `to` per 1 unit of `from`. Returns NaN when either rate is unusable. */
export function impliedRate(from: string, to: string, rates: Rates): number {
  const a = rates[from];
  const b = rates[to];
  if (!Number.isFinite(a) || !Number.isFinite(b) || a <= 0 || b <= 0) return Number.NaN;
  return b / a;
}

export function convertCurrency(amount: number, from: string, to: string, rates: Rates): number {
  const rate = impliedRate(from, to, rates);
  if (!Number.isFinite(rate) || !Number.isFinite(amount)) return Number.NaN;
  return amount * rate;
}

export interface ConversionRow {
  code: string;
  name: string;
  symbol: string;
  amount: number;
  rate: number;
}

/** Convert one amount into every currency that has a usable rate. */
export function convertToAll(amount: number, from: string, rates: Rates): ConversionRow[] {
  return CURRENCIES.filter((currency) => Number.isFinite(rates[currency.code]) && rates[currency.code] > 0).map((currency) => ({
    code: currency.code,
    name: currency.name,
    symbol: currency.symbol,
    amount: convertCurrency(amount, from, currency.code, rates),
    rate: impliedRate(from, currency.code, rates),
  }));
}

/**
 * Parse a pasted rate list such as "EUR 0.92" or "1 USD = 0.92 EUR" style
 * lines, returning only the entries that are usable.
 */
export function parseRates(text: string): Rates {
  const out: Rates = {};
  for (const line of text.split(/\r?\n/)) {
    const match = line.match(/([A-Za-z]{3})\s*[=:,]?\s*([0-9]+(?:\.[0-9]+)?)/) ?? line.match(/([0-9]+(?:\.[0-9]+)?)\s*([A-Za-z]{3})/);
    if (!match) continue;
    const isCodeFirst = /^[A-Za-z]{3}$/.test(match[1]);
    const code = (isCodeFirst ? match[1] : match[2]).toUpperCase();
    const value = Number(isCodeFirst ? match[2] : match[1]);
    if (Number.isFinite(value) && value > 0) out[code] = value;
  }
  return out;
}

export function formatAmount(amount: number, code: string): string {
  const currency = getCurrency(code);
  if (!Number.isFinite(amount)) return "—";
  const digits = code === "JPY" || code === "KES" || code === "NGN" ? 0 : 2;
  const formatted = amount.toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits });
  return currency ? `${currency.symbol} ${formatted}` : formatted;
}
