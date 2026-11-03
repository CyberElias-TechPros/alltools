export type UnitFamily = "length" | "mass" | "volume" | "area" | "speed" | "time" | "data";

export interface Unit {
  id: string;
  label: string;
  symbol: string;
  /** How many base units one of this unit represents. */
  factor: number;
}

export interface UnitFamilyDefinition {
  id: UnitFamily;
  label: string;
  baseUnit: string;
  units: Unit[];
  note?: string;
}

export const unitFamilies: UnitFamilyDefinition[] = [
  {
    id: "length",
    label: "Length",
    baseUnit: "metre",
    units: [
      { id: "mm", label: "Millimetres", symbol: "mm", factor: 0.001 },
      { id: "cm", label: "Centimetres", symbol: "cm", factor: 0.01 },
      { id: "m", label: "Metres", symbol: "m", factor: 1 },
      { id: "km", label: "Kilometres", symbol: "km", factor: 1000 },
      { id: "in", label: "Inches", symbol: "in", factor: 0.0254 },
      { id: "ft", label: "Feet", symbol: "ft", factor: 0.3048 },
      { id: "yd", label: "Yards", symbol: "yd", factor: 0.9144 },
      { id: "mi", label: "Miles", symbol: "mi", factor: 1609.344 },
      { id: "nmi", label: "Nautical miles", symbol: "nmi", factor: 1852 },
    ],
    note: "1 inch = 25.4 mm exactly (1959 international yard and pound agreement).",
  },
  {
    id: "mass",
    label: "Mass",
    baseUnit: "kilogram",
    units: [
      { id: "mg", label: "Milligrams", symbol: "mg", factor: 0.000001 },
      { id: "g", label: "Grams", symbol: "g", factor: 0.001 },
      { id: "kg", label: "Kilograms", symbol: "kg", factor: 1 },
      { id: "t", label: "Metric tonnes", symbol: "t", factor: 1000 },
      { id: "oz", label: "Ounces", symbol: "oz", factor: 0.028349523125 },
      { id: "lb", label: "Pounds", symbol: "lb", factor: 0.45359237 },
      { id: "st", label: "Stone", symbol: "st", factor: 6.35029318 },
    ],
    note: "1 pound = 0.45359237 kg exactly.",
  },
  {
    id: "volume",
    label: "Volume",
    baseUnit: "litre",
    units: [
      { id: "ml", label: "Millilitres", symbol: "mL", factor: 0.001 },
      { id: "l", label: "Litres", symbol: "L", factor: 1 },
      { id: "m3", label: "Cubic metres", symbol: "m³", factor: 1000 },
      { id: "tsp", label: "Teaspoons (US)", symbol: "tsp", factor: 0.00492892159375 },
      { id: "tbsp", label: "Tablespoons (US)", symbol: "tbsp", factor: 0.01478676478125 },
      { id: "cup", label: "Cups (US)", symbol: "cup", factor: 0.2365882365 },
      { id: "floz", label: "Fluid ounces (US)", symbol: "fl oz", factor: 0.0295735295625 },
      { id: "pint", label: "Pints (US)", symbol: "pt", factor: 0.473176473 },
      { id: "quart", label: "Quarts (US)", symbol: "qt", factor: 0.946352946 },
      { id: "gal", label: "Gallons (US)", symbol: "gal", factor: 3.785411784 },
      { id: "impgal", label: "Gallons (imperial)", symbol: "imp gal", factor: 4.54609 },
    ],
    note: "US and imperial liquid measures differ: 1 US gallon = 3.785 L, 1 imperial gallon = 4.546 L.",
  },
  {
    id: "area",
    label: "Area",
    baseUnit: "square metre",
    units: [
      { id: "cm2", label: "Square centimetres", symbol: "cm²", factor: 0.0001 },
      { id: "m2", label: "Square metres", symbol: "m²", factor: 1 },
      { id: "ha", label: "Hectares", symbol: "ha", factor: 10000 },
      { id: "km2", label: "Square kilometres", symbol: "km²", factor: 1_000_000 },
      { id: "in2", label: "Square inches", symbol: "in²", factor: 0.00064516 },
      { id: "ft2", label: "Square feet", symbol: "ft²", factor: 0.09290304 },
      { id: "yd2", label: "Square yards", symbol: "yd²", factor: 0.83612736 },
      { id: "acre", label: "Acres", symbol: "ac", factor: 4046.8564224 },
      { id: "mi2", label: "Square miles", symbol: "mi²", factor: 2_589_988.110336 },
    ],
  },
  {
    id: "speed",
    label: "Speed",
    baseUnit: "metre per second",
    units: [
      { id: "mps", label: "Metres per second", symbol: "m/s", factor: 1 },
      { id: "kph", label: "Kilometres per hour", symbol: "km/h", factor: 1 / 3.6 },
      { id: "mph", label: "Miles per hour", symbol: "mph", factor: 0.44704 },
      { id: "ftps", label: "Feet per second", symbol: "ft/s", factor: 0.3048 },
      { id: "knot", label: "Knots", symbol: "kn", factor: 0.514444444 },
    ],
  },
  {
    id: "time",
    label: "Time",
    baseUnit: "second",
    units: [
      { id: "ms", label: "Milliseconds", symbol: "ms", factor: 0.001 },
      { id: "s", label: "Seconds", symbol: "s", factor: 1 },
      { id: "min", label: "Minutes", symbol: "min", factor: 60 },
      { id: "h", label: "Hours", symbol: "h", factor: 3600 },
      { id: "d", label: "Days", symbol: "d", factor: 86400 },
      { id: "wk", label: "Weeks", symbol: "wk", factor: 604800 },
      { id: "yr", label: "Years (365 days)", symbol: "yr", factor: 31_536_000 },
    ],
    note: "A year here is a 365-day calendar year; leap years add a day.",
  },
  {
    id: "data",
    label: "Data storage",
    baseUnit: "byte",
    units: [
      { id: "B", label: "Bytes", symbol: "B", factor: 1 },
      { id: "KB", label: "Kilobytes (1000 B)", symbol: "KB", factor: 1000 },
      { id: "KiB", label: "Kibibytes (1024 B)", symbol: "KiB", factor: 1024 },
      { id: "MB", label: "Megabytes (10⁶ B)", symbol: "MB", factor: 1_000_000 },
      { id: "MiB", label: "Mebibytes (2²⁰ B)", symbol: "MiB", factor: 1_048_576 },
      { id: "GB", label: "Gigabytes (10⁹ B)", symbol: "GB", factor: 1_000_000_000 },
      { id: "GiB", label: "Gibibytes (2³⁰ B)", symbol: "GiB", factor: 1_073_741_824 },
      { id: "TB", label: "Terabytes (10¹² B)", symbol: "TB", factor: 1_000_000_000_000 },
      { id: "TiB", label: "Tebibytes (2⁴⁰ B)", symbol: "TiB", factor: 1_099_511_627_776 },
    ],
    note: "Decimal (KB) and binary (KiB) units differ by about 2.4% per step.",
  },
];

export function getUnitFamily(id: UnitFamily): UnitFamilyDefinition {
  const family = unitFamilies.find((candidate) => candidate.id === id);
  if (!family) throw new Error(`Unknown unit family: ${id}`);
  return family;
}

export function convertUnit(
  value: number,
  from: Unit,
  to: Unit,
): { result: number; expression: string } {
  const inBase = value * from.factor;
  const result = inBase / to.factor;
  return {
    result,
    expression: `${value} ${from.symbol} × ${from.factor} ÷ ${to.factor} = ${result} ${to.symbol}`,
  };
}

/* ------------------------------- temperature ------------------------------ */

export type TemperatureScale = "celsius" | "fahrenheit" | "kelvin" | "rankine";

export function convertTemperature(value: number, from: TemperatureScale): Record<TemperatureScale, number> {
  let celsius: number;
  switch (from) {
    case "fahrenheit":
      celsius = ((value - 32) * 5) / 9;
      break;
    case "kelvin":
      celsius = value - 273.15;
      break;
    case "rankine":
      celsius = ((value - 491.67) * 5) / 9;
      break;
    default:
      celsius = value;
  }
  return {
    celsius,
    fahrenheit: (celsius * 9) / 5 + 32,
    kelvin: celsius + 273.15,
    rankine: ((celsius + 273.15) * 9) / 5,
  };
}

/* ----------------------------------- BMI ---------------------------------- */

export function calculateBmi(kg: number, metres: number): number {
  if (!(kg > 0) || !(metres > 0)) return Number.NaN;
  return kg / (metres * metres);
}

export function bmiCategory(bmi: number): { label: string; tone: string } {
  if (!Number.isFinite(bmi)) return { label: "—", tone: "neutral" };
  if (bmi < 18.5) return { label: "Underweight", tone: "sky" };
  if (bmi < 25) return { label: "Healthy range", tone: "emerald" };
  if (bmi < 30) return { label: "Overweight", tone: "amber" };
  return { label: "Obese", tone: "rose" };
}
