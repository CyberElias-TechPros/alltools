import { describe, expect, it } from "vitest";
import { SEED_RATES, convertCurrency, convertToAll, impliedRate, parseRates } from "@/lib/currency";

describe("currency conversion", () => {
  it("converts through the base rate", () => {
    expect(convertCurrency(100, "USD", "EUR", SEED_RATES)).toBeCloseTo(92, 6);
  });
  it("converts between two non-base currencies", () => {
    const eurToGbp = SEED_RATES.GBP / SEED_RATES.EUR;
    expect(convertCurrency(50, "EUR", "GBP", SEED_RATES)).toBeCloseTo(50 * eurToGbp, 6);
  });
  it("round-trips to the same value", () => {
    const there = convertCurrency(1234.56, "NGN", "JPY", SEED_RATES);
    expect(convertCurrency(there, "JPY", "NGN", SEED_RATES)).toBeCloseTo(1234.56, 6);
  });
  it("returns NaN for a missing or zero rate", () => {
    expect(Number.isNaN(impliedRate("USD", "XXX", SEED_RATES))).toBe(true);
    expect(Number.isNaN(impliedRate("USD", "EUR", { ...SEED_RATES, EUR: 0 }))).toBe(true);
  });
  it("converts to every currency with a usable rate", () => {
    const rows = convertToAll(10, "USD", SEED_RATES);
    expect(rows).toHaveLength(16);
    expect(rows.find((row) => row.code === "GBP")?.amount).toBeCloseTo(7.9, 6);
  });
  it("parses pasted rates in either order", () => {
    const parsed = parseRates("EUR 0.92\n0.79 GBP\njunk\nZAR: 18.2");
    expect(parsed).toEqual({ EUR: 0.92, GBP: 0.79, ZAR: 18.2 });
  });
});
