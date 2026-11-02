import { describe, expect, it } from "vitest";
import {
  bmiCategory,
  calculateBmi,
  convertTemperature,
  convertUnit,
  getUnitFamily,
} from "@/lib/units";

describe("unit conversion", () => {
  const length = getUnitFamily("length");
  const mass = getUnitFamily("mass");
  const data = getUnitFamily("data");

  const unit = (familyId: "length" | "mass" | "data", id: string) =>
    getUnitFamily(familyId).units.find((candidate) => candidate.id === id)!;

  it("converts inches to centimetres exactly", () => {
    const result = convertUnit(1, unit("length", "in"), unit("length", "cm"));
    expect(result.result).toBeCloseTo(2.54, 10);
  });

  it("round-trips a conversion", () => {
    const forward = convertUnit(42, unit("length", "km"), unit("length", "mi")).result;
    const back = convertUnit(forward, unit("length", "mi"), unit("length", "km")).result;
    expect(back).toBeCloseTo(42, 10);
  });

  it("converts pounds to kilograms", () => {
    const result = convertUnit(176.37, unit("mass", "lb"), unit("mass", "kg"));
    expect(result.result).toBeCloseTo(80, 1);
  });

  it("distinguishes decimal and binary data units", () => {
    expect(convertUnit(1, unit("data", "GB"), unit("data", "GiB")).result).toBeCloseTo(0.9313, 3);
  });

  it("includes an expression showing the factors", () => {
    const result = convertUnit(1, length.units[4], length.units[2]);
    expect(result.expression).toContain("×");
  });

  it("exposes a base unit for every family", () => {
    expect(length.baseUnit).toBe("metre");
    expect(mass.baseUnit).toBe("kilogram");
    expect(data.baseUnit).toBe("byte");
  });
});

describe("temperature conversion", () => {
  it("converts Celsius to Fahrenheit", () => {
    const result = convertTemperature(37, "celsius");
    expect(result.fahrenheit).toBeCloseTo(98.6, 6);
    expect(result.kelvin).toBeCloseTo(310.15, 6);
  });

  it("converts Fahrenheit to Celsius", () => {
    expect(convertTemperature(32, "fahrenheit").celsius).toBeCloseTo(0, 6);
    expect(convertTemperature(-40, "fahrenheit").celsius).toBeCloseTo(-40, 6);
  });

  it("converts Kelvin to Celsius", () => {
    expect(convertTemperature(273.15, "kelvin").celsius).toBeCloseTo(0, 6);
  });

  it("round-trips through Rankine", () => {
    const rankine = convertTemperature(100, "celsius").rankine;
    expect(convertTemperature(rankine, "rankine").celsius).toBeCloseTo(100, 6);
  });
});

describe("BMI", () => {
  it("calculates BMI from metric values", () => {
    expect(calculateBmi(70, 1.75)).toBeCloseTo(22.857, 3);
  });

  it("categorises results using WHO cut-offs", () => {
    expect(bmiCategory(17).label).toBe("Underweight");
    expect(bmiCategory(22).label).toBe("Healthy range");
    expect(bmiCategory(27).label).toBe("Overweight");
    expect(bmiCategory(32).label).toBe("Obese");
    expect(bmiCategory(24.9).label).toBe("Healthy range");
    expect(bmiCategory(25).label).toBe("Overweight");
  });

  it("returns NaN for invalid input", () => {
    expect(Number.isNaN(calculateBmi(0, 1.75))).toBe(true);
    expect(Number.isNaN(calculateBmi(70, 0))).toBe(true);
  });
});
