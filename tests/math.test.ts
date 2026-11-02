import { describe, expect, it } from "vitest";
import {
  combinations,
  determinant,
  divisors,
  evaluateExpression,
  factorial,
  fractionOperation,
  gcdAll,
  invert,
  isPrime,
  lcmAll,
  matrixMultiply,
  mixedNumber,
  nearbyPrimes,
  parseDuration,
  permutations,
  primeFactors,
  randomIntegers,
  simplifyRadical,
  toScientific,
  durationBetween,
  formatNumber,
} from "@/lib/math";

describe("integers", () => {
  it("computes gcd and lcm of lists", () => {
    expect(gcdAll([24, 36, 60])).toBe(12);
    expect(lcmAll([4, 6, 10])).toBe(60);
  });

  it("detects primes and factors", () => {
    expect(isPrime(2)).toBe(true);
    expect(isPrime(97)).toBe(true);
    expect(isPrime(91)).toBe(false);
    expect(primeFactors(360)).toEqual([2, 2, 2, 3, 3, 5]);
    expect(divisors(12)).toEqual([1, 2, 3, 4, 6, 12]);
  });

  it("finds nearby primes", () => {
    expect(nearbyPrimes(20, 2)).toEqual({ below: [19, 17], above: [23, 29] });
  });

  it("simplifies radicals", () => {
    expect(simplifyRadical(72)).toEqual({ outside: 6, inside: 2 });
    expect(simplifyRadical(9)).toEqual({ outside: 3, inside: 1 });
  });

  it("computes exact factorials and coefficients", () => {
    expect(factorial(0)).toBe(1n);
    expect(factorial(20)).toBe(2432902008176640000n);
    expect(combinations(49, 6)).toBe(13983816n);
    expect(permutations(10, 3)).toBe(720n);
  });
});

describe("fractions", () => {
  it("adds and simplifies", () => {
    expect(fractionOperation({ numerator: 1, denominator: 3 }, { numerator: 1, denominator: 6 }, "add")).toEqual({
      numerator: 1,
      denominator: 2,
    });
  });

  it("formats improper fractions as mixed numbers", () => {
    expect(mixedNumber({ numerator: 7, denominator: 2 })).toBe("3 1/2");
  });

  it("refuses division by zero", () => {
    expect(fractionOperation({ numerator: 1, denominator: 2 }, { numerator: 0, denominator: 5 }, "divide")).toBeNull();
  });
});

describe("matrices", () => {
  const a = [
    [1, 2],
    [3, 4],
  ];
  const b = [
    [5, 6],
    [7, 8],
  ];

  it("multiplies and inverts 2×2 matrices", () => {
    expect(matrixMultiply(a, b)).toEqual([
      [19, 22],
      [43, 50],
    ]);
    expect(determinant(a)).toBe(-2);
    expect(invert(a)).toEqual([
      [-2, 1],
      [1.5, -0.5],
    ]);
  });

  it("returns null for singular matrices", () => {
    expect(invert([[1, 2], [2, 4]])).toBeNull();
  });
});

describe("randomIntegers", () => {
  it("is reproducible and respects bounds", () => {
    const first = randomIntegers({ min: 1, max: 10, count: 5, seed: 3 });
    expect(randomIntegers({ min: 1, max: 10, count: 5, seed: 3 })).toEqual(first);
    expect(first.every((value) => value >= 1 && value <= 10)).toBe(true);
  });

  it("returns unique values when asked", () => {
    const values = randomIntegers({ min: 1, max: 5, count: 5, unique: true, seed: 9 });
    expect(new Set(values).size).toBe(5);
    expect(randomIntegers({ min: 1, max: 3, count: 5, unique: true })).toEqual([]);
  });
});

describe("evaluateExpression", () => {
  it("respects operator precedence and brackets", () => {
    expect(evaluateExpression("2+3*4")).toBe(14);
    expect(evaluateExpression("(2+3)*4")).toBe(20);
    expect(evaluateExpression("2^3^2")).toBe(512);
  });

  it("handles unary minus and functions", () => {
    expect(evaluateExpression("-5+2")).toBe(-3);
    expect(evaluateExpression("sqrt(16)+abs(-3)")).toBe(7);
    expect(evaluateExpression("log(1000)")).toBe(3);
    expect(evaluateExpression("sin(90)", { degrees: true })).toBeCloseTo(1, 10);
  });

  it("understands constants and scientific notation", () => {
    expect(evaluateExpression("pi")).toBeCloseTo(Math.PI, 10);
    expect(evaluateExpression("1.5e3/3")).toBe(500);
  });

  it("rejects unknown names and division by zero", () => {
    expect(() => evaluateExpression("alert(1)")).toThrow(/Unknown name/);
    expect(() => evaluateExpression("1/0")).toThrow(/Division by zero/);
    expect(() => evaluateExpression("(1+2")).toThrow(/Mismatched/);
  });
});

describe("formatting and time", () => {
  it("formats numbers without float noise", () => {
    expect(formatNumber(0.1 + 0.2)).toBe("0.3");
    expect(formatNumber(1000)).toBe("1000");
  });

  it("converts to scientific notation", () => {
    expect(toScientific(4500)).toEqual({ coefficient: 4.5, exponent: 3, text: "4.5 × 10^3" });
  });

  it("measures durations across midnight", () => {
    const duration = durationBetween({ hours: 22, minutes: 30 }, { hours: 1, minutes: 15 });
    expect(duration).toMatchObject({ hours: 2, minutes: 45, totalMinutes: 165 });
  });

  it("parses duration input", () => {
    expect(parseDuration("1:30")).toEqual({ hours: 1, minutes: 30 });
    expect(parseDuration("1h45m")).toEqual({ hours: 1, minutes: 45 });
    expect(parseDuration("2.5")).toEqual({ hours: 2, minutes: 30 });
  });
});
