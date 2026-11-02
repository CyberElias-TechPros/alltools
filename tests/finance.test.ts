import { describe, expect, it } from "vitest";
import {
  buildLoanSchedule,
  compoundInterest,
  monthlyPayment,
  priceForMargin,
  profitMetrics,
  roi,
} from "@/lib/finance";

describe("monthlyPayment", () => {
  it("matches the standard annuity formula", () => {
    expect(monthlyPayment(20000, 6, 5)).toBeCloseTo(386.656, 2);
  });

  it("divides evenly at a zero rate", () => {
    expect(monthlyPayment(1200, 0, 1)).toBe(100);
  });

  it("returns NaN for an empty loan", () => {
    expect(Number.isNaN(monthlyPayment(0, 5, 5))).toBe(true);
    expect(Number.isNaN(monthlyPayment(1000, 5, 0))).toBe(true);
  });
});

describe("buildLoanSchedule", () => {
  it("produces a full schedule that ends at zero", () => {
    const result = buildLoanSchedule({ principal: 20000, annualRate: 6, years: 5 });
    expect(result.months).toBe(60);
    expect(result.schedule).toHaveLength(60);
    expect(result.schedule.at(-1)!.balance).toBe(0);
  });

  it("reports total interest greater than zero", () => {
    const result = buildLoanSchedule({ principal: 20000, annualRate: 6, years: 5 });
    expect(result.totalInterest).toBeCloseTo(3199.58, 0);
  });

  it("shows interest falling and principal rising over time", () => {
    const result = buildLoanSchedule({ principal: 10000, annualRate: 5, years: 3 });
    expect(result.schedule[0].interest).toBeGreaterThan(result.schedule[10].interest);
    expect(result.schedule[0].principal).toBeLessThan(result.schedule[10].principal);
  });

  it("pays off sooner with extra payments", () => {
    const base = buildLoanSchedule({ principal: 20000, annualRate: 6, years: 5 });
    const extra = buildLoanSchedule({ principal: 20000, annualRate: 6, years: 5, extraMonthly: 100 });
    expect(extra.months).toBeLessThan(base.months);
    expect(extra.totalInterest).toBeLessThan(base.totalInterest);
  });

  it("handles a zero-interest loan", () => {
    const result = buildLoanSchedule({ principal: 1200, annualRate: 0, years: 1 });
    expect(result.totalInterest).toBe(0);
    expect(result.months).toBe(12);
  });
});

describe("compoundInterest", () => {
  it("grows a lump sum with monthly compounding", () => {
    const result = compoundInterest({
      principal: 5000,
      annualRate: 7,
      years: 10,
      compoundsPerYear: 12,
      contribution: 0,
      contributionFrequency: "none",
    });
    expect(result.finalBalance).toBeCloseTo(10048.31, 1);
    expect(result.totalContributed).toBe(5000);
  });

  it("adds regular contributions to the balance", () => {
    const result = compoundInterest({
      principal: 0,
      annualRate: 6,
      years: 30,
      compoundsPerYear: 12,
      contribution: 200,
      contributionFrequency: "monthly",
    });
    expect(result.totalContributed).toBe(72000);
    expect(result.finalBalance).toBeGreaterThan(190000);
  });

  it("reduces the result when a fee is applied", () => {
    const noFee = compoundInterest({
      principal: 10000,
      annualRate: 8,
      years: 20,
      compoundsPerYear: 12,
      contribution: 0,
      contributionFrequency: "none",
    });
    const withFee = compoundInterest({
      principal: 10000,
      annualRate: 8,
      years: 20,
      compoundsPerYear: 12,
      contribution: 0,
      contributionFrequency: "none",
      annualFeePercent: 1,
    });
    expect(withFee.finalBalance).toBeLessThan(noFee.finalBalance);
  });

  it("returns one row per year", () => {
    const result = compoundInterest({
      principal: 1000,
      annualRate: 5,
      years: 5,
      compoundsPerYear: 12,
      contribution: 0,
      contributionFrequency: "none",
    });
    expect(result.rows).toHaveLength(5);
  });
});

describe("roi", () => {
  it("calculates simple ROI and gain", () => {
    const result = roi(1000, 1250);
    expect(result.gain).toBe(250);
    expect(result.simple).toBeCloseTo(25, 5);
  });

  it("annualises a multi-year return", () => {
    const result = roi(1000, 1250, 48);
    expect(result.annualised).toBeCloseTo(5.737, 2);
  });

  it("handles a loss", () => {
    const result = roi(1000, 800);
    expect(result.simple).toBe(-20);
    expect(result.gain).toBe(-200);
  });
});

describe("profit metrics", () => {
  it("distinguishes margin from markup", () => {
    const result = profitMetrics(60, 90);
    expect(result.profit).toBe(30);
    expect(result.margin).toBeCloseTo(33.3333, 3);
    expect(result.markup).toBe(50);
  });

  it("solves the price for a target margin", () => {
    expect(priceForMargin(60, 40)).toBe(100);
  });

  it("rejects an impossible margin", () => {
    expect(Number.isNaN(priceForMargin(60, 100))).toBe(true);
  });
});
