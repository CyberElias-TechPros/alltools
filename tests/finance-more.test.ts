import { describe, expect, it } from "vitest";
import {
  averageSharePrice,
  breakEven,
  freelanceRate,
  inflationAdjust,
  overtimePay,
  rentalYield,
  simpleInterest,
} from "@/lib/finance";

describe("simpleInterest", () => {
  it("applies P × r × t", () => {
    expect(simpleInterest(5000, 6, 3)).toMatchObject({ interest: 900, total: 5900 });
  });

  it("handles a zero rate", () => {
    expect(simpleInterest(1200, 0, 5)).toMatchObject({ interest: 0, total: 1200 });
  });
});

describe("breakEven", () => {
  it("rounds units up to cover fixed costs", () => {
    expect(breakEven(12000, 40, 16)?.units).toBe(500);
    expect(breakEven(12001, 40, 16)?.units).toBe(501);
  });

  it("returns null when each sale loses money", () => {
    expect(breakEven(5000, 20, 25)).toBeNull();
  });
});

describe("inflationAdjust", () => {
  it("restates an amount forward and backward", () => {
    const result = inflationAdjust(100, 3, 10);
    expect(result.future).toBe(134.39);
    expect(result.past).toBe(74.41);
  });
});

describe("rentalYield", () => {
  it("separates gross and net yield", () => {
    const result = rentalYield(300000, 1800, 4000);
    expect(result.annualRent).toBe(21600);
    expect(result.gross).toBe(7.2);
    expect(result.net).toBeCloseTo(5.867, 3);
  });
});

describe("averageSharePrice", () => {
  it("weights purchases by share count", () => {
    const result = averageSharePrice([
      { shares: 10, price: 100 },
      { shares: 30, price: 120 },
    ]);
    expect(result).toMatchObject({ shares: 40, cost: 4600, average: 115 });
  });
});

describe("overtimePay", () => {
  it("pays overtime at the multiplier", () => {
    expect(overtimePay(20, 40, 5, 1.5)).toMatchObject({ regularPay: 800, overtimePay: 150, total: 950 });
  });
});

describe("freelanceRate", () => {
  it("divides required revenue by billable hours", () => {
    const result = freelanceRate({
      targetAnnualIncome: 60000,
      billableHoursPerWeek: 20,
      weeksPerYear: 46,
      annualCosts: 6000,
      taxReservePercent: 25,
    });
    expect(result.requiredRevenue).toBe(88000);
    expect(result.billableHours).toBe(920);
    expect(result.hourlyRate).toBe(95.65);
  });
});
