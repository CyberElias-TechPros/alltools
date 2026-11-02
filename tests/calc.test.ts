import { describe, expect, it } from "vitest";
import {
  businessDaysBetween,
  calendarAge,
  calculateGpa,
  daysBetween,
  mean,
  median,
  mode,
  percentChange,
  percentOfWhat,
  percentageOf,
  standardDeviation,
  variance,
} from "@/lib/calc";

const utc = (value: string) => new Date(`${value}T00:00:00Z`);

describe("percentage calculations", () => {
  it("calculates a percentage of a value", () => {
    expect(percentageOf(20, 250)).toBe(50);
  });

  it("expresses a part as a percentage of a whole", () => {
    expect(percentOfWhat(42, 60)).toBe(70);
  });

  it("returns NaN for a zero whole", () => {
    expect(Number.isNaN(percentOfWhat(5, 0))).toBe(true);
  });

  it("calculates percentage change including negatives", () => {
    expect(percentChange(100, 150)).toBe(50);
    expect(percentChange(150, 100)).toBeCloseTo(-33.3333, 3);
  });

  it("handles a zero baseline without producing Infinity", () => {
    expect(Number.isNaN(percentChange(0, 10))).toBe(true);
  });
});

describe("statistics", () => {
  const values = [72, 85, 91, 68, 85];

  it("calculates the mean", () => {
    expect(mean(values)).toBeCloseTo(80.2, 5);
  });

  it("calculates the median for odd and even counts", () => {
    expect(median(values)).toBe(85);
    expect(median([2, 4, 6, 8])).toBe(5);
  });

  it("finds all modes", () => {
    expect(mode(values)).toEqual([85]);
    expect(mode([1, 1, 2, 2])).toEqual([1, 2]);
  });

  it("returns an empty mode list when nothing repeats", () => {
    expect(mode([1, 2, 3])).toEqual([]);
  });

  it("computes population and sample variance", () => {
    expect(variance(values, false)).toBeCloseTo(75.76, 2);
    expect(variance(values, true)).toBeCloseTo(94.7, 2);
    expect(standardDeviation(values, false)).toBeCloseTo(8.704, 2);
  });

  it("returns NaN for a single value in sample mode", () => {
    expect(Number.isNaN(variance([5], true))).toBe(true);
  });
});

describe("calendarAge", () => {
  it("counts completed years, months and days", () => {
    const age = calendarAge(utc("1990-03-12"), utc("2025-01-01"));
    expect(age).not.toBeNull();
    expect(age!.years).toBe(34);
    expect(age!.months).toBe(9);
    expect(age!.days).toBe(20);
  });

  it("counts a birthday as reached on the day", () => {
    const age = calendarAge(utc("2000-06-15"), utc("2025-06-15"));
    expect(age!.years).toBe(25);
    expect(age!.months).toBe(0);
    expect(age!.days).toBe(0);
  });

  it("handles a leap-day birthday in a non-leap year", () => {
    const age = calendarAge(utc("2000-02-29"), utc("2025-03-01"));
    expect(age!.years).toBe(25);
  });

  it("reports the weekday of birth", () => {
    const age = calendarAge(utc("2000-01-01"), utc("2025-01-01"));
    expect(age!.bornOn).toBe("Saturday");
  });

  it("returns null when the birth date is after the comparison date", () => {
    expect(calendarAge(utc("2030-01-01"), utc("2025-01-01"))).toBeNull();
  });
});

describe("date differences", () => {
  it("counts exclusive and inclusive days", () => {
    expect(daysBetween(utc("2025-03-03"), utc("2025-03-21"))).toBe(18);
    expect(daysBetween(utc("2025-03-03"), utc("2025-03-21"), true)).toBe(19);
  });

  it("counts business days, excluding weekends", () => {
    // Mon 3 Mar 2025 -> Fri 21 Mar 2025 = 15 weekdays
    expect(businessDaysBetween(utc("2025-03-03"), utc("2025-03-21"))).toBe(15);
  });

  it("is symmetric for reversed inputs in the business-day count", () => {
    expect(businessDaysBetween(utc("2025-03-21"), utc("2025-03-03"))).toBe(15);
  });
});

describe("GPA", () => {
  it("weights courses by credit hours", () => {
    const result = calculateGpa([
      { id: "1", name: "A", credits: 3, grade: "A" },
      { id: "2", name: "B", credits: 3, grade: "B+" },
      { id: "3", name: "C", credits: 4, grade: "A-" },
      { id: "4", name: "D", credits: 2, grade: "B" },
    ]);
    expect(result.credits).toBe(12);
    expect(result.gpa).toBeCloseTo(3.5583, 3);
  });

  it("ignores zero-credit courses", () => {
    const result = calculateGpa([
      { id: "1", name: "A", credits: 3, grade: "A" },
      { id: "2", name: "B", credits: 0, grade: "F" },
    ]);
    expect(result.gpa).toBe(4);
  });

  it("returns NaN when no valid course remains", () => {
    expect(Number.isNaN(calculateGpa([]).gpa)).toBe(true);
  });
});
