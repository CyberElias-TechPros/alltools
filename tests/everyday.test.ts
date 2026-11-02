import { describe, expect, it } from "vitest";
import {
  COOKING_EQUIVALENTS,
  INGREDIENT_DENSITIES,
  WORLD_CITIES,
  bodyFat,
  electricityCost,
  estimateCalories,
  formatClock,
  formatDuration,
  formatQuantity,
  fuelConsumption,
  ovulationWindow,
  paceFromDistance,
  parseClock,
  parseDuration,
  parseQuantity,
  pregnancyDueDate,
  scaleRecipe,
  sleepDuration,
  waterIntake,
  zoneTime,
} from "@/lib/everyday";

describe("calorie estimate", () => {
  const base = { sex: "female" as const, age: 30, heightCm: 165, weightKg: 60, activity: 1.55, goal: "maintain" as const };

  it("computes Mifflin–St Jeor and an activity multiplier", () => {
    const result = estimateCalories(base);
    expect(result.bmr).toBe(1320); // 600 + 1031.25 - 150 - 161
    expect(result.maintenance).toBe(Math.round(1320 * 1.55));
    expect(result.target).toBe(result.maintenance);
    expect(result.protein).toBe(96);
  });

  it("applies a 500 kcal deficit for weight loss", () => {
    const result = estimateCalories({ ...base, goal: "lose" });
    expect(result.maintenance - result.target).toBeGreaterThan(0);
    expect(result.weeklyChangeKg).toBeCloseTo(-0.4545, 3);
  });

  it("holds a deficit at the basal rate", () => {
    const result = estimateCalories({ ...base, activity: 1.2, goal: "lose", weightKg: 45 });
    expect(result.target).toBeGreaterThanOrEqual(result.bmr);
    expect(result.issues.length).toBeGreaterThan(0);
  });

  it("flags implausible inputs", () => {
    expect(estimateCalories({ ...base, age: 8 }).issues.length).toBeGreaterThan(0);
  });
});

describe("water intake", () => {
  it("scales with weight, exercise and climate", () => {
    const cool = waterIntake({ weightKg: 70, exerciseMinutes: 0, climate: "temperate" });
    const hot = waterIntake({ weightKg: 70, exerciseMinutes: 60, climate: "very-hot" });
    expect(cool.litres).toBeCloseTo(2.45, 2);
    expect(hot.litres).toBeGreaterThan(cool.litres + 1);
    expect(hot.glasses).toBeGreaterThan(10);
  });
});

describe("sleep", () => {
  it("parses and formats clock times", () => {
    expect(parseClock("23:30")).toBe(1410);
    expect(parseClock("7:00")).toBe(420);
    expect(parseClock("24:00")).toBeNull();
    expect(parseClock("noon")).toBeNull();
    expect(formatClock(1410)).toBe("23:30");
    expect(formatClock(1500)).toBe("01:00");
  });

  it("measures sleep across midnight", () => {
    const result = sleepDuration({ bedtime: "23:30", wake: "07:00", latencyMinutes: 15, targetHours: 8 });
    expect(result.inBedMinutes).toBe(450);
    expect(result.asleepMinutes).toBe(435);
    expect(result.cycles).toBe(4);
    expect(result.debtMinutes).toBe(45);
  });

  it("suggests bedtimes from wake time", () => {
    const result = sleepDuration({ bedtime: "01:00", wake: "07:00", latencyMinutes: 10, targetHours: 8 });
    expect(result.bedtimeSuggestions[0]).toBe("21:50");
    expect(result.asleepMinutes).toBe(350);
    expect(result.issues).toHaveLength(0);
  });

  it("warns about very short sleep and long latency", () => {
    const result = sleepDuration({ bedtime: "03:00", wake: "07:00", latencyMinutes: 40, targetHours: 8 });
    expect(result.asleepMinutes).toBe(200);
    expect(result.issues.length).toBe(2);
  });
});

describe("pregnancy dating", () => {
  it("applies Naegele's rule", () => {
    const result = pregnancyDueDate({ lmp: "2025-01-01", cycleLength: 28, today: new Date("2025-03-01T00:00:00") });
    expect(result?.dueDate.toISOString().slice(0, 10)).toBe("2025-10-08");
    expect(result?.gestationalWeeks).toBe(8);
    expect(result?.trimester).toBe(1);
  });

  it("shifts the due date for a longer cycle", () => {
    const short = pregnancyDueDate({ lmp: "2025-01-01", cycleLength: 28 });
    const long = pregnancyDueDate({ lmp: "2025-01-01", cycleLength: 35 });
    expect(long?.dueDate.getTime()).toBeGreaterThan(short!.dueDate.getTime());
  });

  it("rejects bad dates", () => {
    expect(pregnancyDueDate({ lmp: "01/01/2025", cycleLength: 28 })).toBeNull();
  });
});

describe("ovulation window", () => {
  it("places ovulation before the next period", () => {
    const result = ovulationWindow({ lmp: "2025-01-01", cycleLength: 28, lutealLength: 14 });
    expect(result?.ovulation.toISOString().slice(0, 10)).toBe("2025-01-15");
    expect(result?.fertileStart.toISOString().slice(0, 10)).toBe("2025-01-10");
    expect(result?.nextPeriods[0].toISOString().slice(0, 10)).toBe("2025-01-29");
  });

  it("warns about very long cycles", () => {
    const result = ovulationWindow({ lmp: "2025-01-01", cycleLength: 60, lutealLength: 14 });
    expect(result?.cycleLength).toBe(60);
    expect(result?.issues.length).toBeGreaterThan(0);
  });
});

describe("body fat", () => {
  it("estimates with the US Navy method", () => {
    const male = bodyFat({ sex: "male", heightCm: 180, neckCm: 38, waistCm: 85, weightKg: 80 });
    expect(male?.percent).toBeGreaterThan(8);
    expect(male?.percent).toBeLessThan(25);
    expect((male?.fatMass ?? 0) + (male?.leanMass ?? 0)).toBeCloseTo(80, 5);

    const female = bodyFat({ sex: "female", heightCm: 165, neckCm: 32, waistCm: 72, hipCm: 96, weightKg: 60 });
    expect(female?.percent).toBeGreaterThan(20);
    expect(female?.percent).toBeLessThan(40);
    expect(male?.percent).toBeCloseTo(16.1, 0);
  });

  it("requires a hip measurement for women", () => {
    expect(bodyFat({ sex: "female", heightCm: 165, neckCm: 32, waistCm: 72 })).toBeNull();
  });
});

describe("pace", () => {
  it("parses and formats durations", () => {
    expect(parseDuration("1:02:30")).toBe(3750);
    expect(parseDuration("45:30")).toBe(2730);
    expect(parseDuration("42")).toBe(2520);
    expect(formatDuration(2730)).toBe("45:30");
    expect(formatDuration(3750)).toBe("1:02:30");
  });

  it("converts a run into pace and speed", () => {
    const result = paceFromDistance(10, 3000, "km");
    expect(result.secondsPerUnit).toBe(300);
    expect(result.speedKph).toBeCloseTo(12, 5);
    expect(result.speedMph).toBeCloseTo(7.456, 2);
    expect(result.splits).toHaveLength(10);
    expect(result.splits[9].time).toBe("50:00");
  });

  it("handles a partial final unit", () => {
    const result = paceFromDistance(21.1, 7200, "km");
    expect(result.splits).toHaveLength(22);
    expect(result.splits[21].label).toContain("km to go");
  });

  it("rejects zero input", () => {
    expect(paceFromDistance(0, 0, "km").issues.length).toBeGreaterThan(0);
  });
});

describe("cooking", () => {
  it("parses mixed and simple fractions", () => {
    expect(parseQuantity("1 1/2")).toBe(1.5);
    expect(parseQuantity("3/4")).toBe(0.75);
    expect(parseQuantity("2.5")).toBe(2.5);
    expect(parseQuantity("2")).toBe(2);
    expect(parseQuantity("abc")).toBeNull();
    expect(parseQuantity("1/0")).toBeNull();
  });

  it("formats quantities in kitchen fractions", () => {
    expect(formatQuantity(1.5)).toBe("1 1/2");
    expect(formatQuantity(0.25)).toBe("1/4");
    expect(formatQuantity(3)).toBe("3");
    expect(formatQuantity(0.1)).toBe("0.1");
    expect(formatQuantity(2.999)).toBe("3");
  });

  it("scales a recipe", () => {
    const result = scaleRecipe({
      lines: [
        { quantity: "1 1/2", unit: "cups", name: "flour" },
        { quantity: "2", unit: "", name: "eggs" },
        { quantity: "pinch", unit: "", name: "salt" },
      ],
      fromServings: 4,
      toServings: 6,
    });
    expect(result.factor).toBe(1.5);
    expect(result.lines[0].quantity).toBe("2 1/4");
    expect(result.lines[1].quantity).toBe("3");
    expect(result.lines[2].quantity).toBe("pinch");
  });

  it("warns about extreme scaling", () => {
    expect(scaleRecipe({ lines: [], fromServings: 1, toServings: 10 }).issues.length).toBeGreaterThan(0);
    expect(scaleRecipe({ lines: [], fromServings: 0, toServings: 10 }).issues.length).toBeGreaterThan(0);
  });

  it("ships reference data", () => {
    expect(COOKING_EQUIVALENTS.length).toBeGreaterThan(5);
    expect(INGREDIENT_DENSITIES.find((item) => item.id === "flour")?.gramsPerCup).toBe(125);
  });
});

describe("fuel and electricity", () => {
  it("converts fuel economy", () => {
    const result = fuelConsumption({ distanceKm: 500, litres: 40, pricePerLitre: 2 });
    expect(result.litresPer100km).toBeCloseTo(8, 5);
    expect(result.mpgUs).toBeCloseTo(29.4, 1);
    expect(result.mpgUk).toBeCloseTo(35.3, 1);
    expect(result.kmPerLitre).toBeCloseTo(12.5, 5);
    expect(result.costPer100km).toBeCloseTo(16, 5);
  });

  it("returns no cost without a price", () => {
    expect(fuelConsumption({ distanceKm: 100, litres: 5 }).costPer100km).toBeNull();
  });

  it("prices electricity use", () => {
    const result = electricityCost({ watts: 2000, hoursPerDay: 2, days: 30, ratePerKwh: 0.3, carbonGramsPerKwh: 400 });
    expect(result.kwhPerDay).toBe(4);
    expect(result.kwhTotal).toBe(120);
    expect(result.costTotal).toBeCloseTo(36, 5);
    expect(result.co2Kg).toBeCloseTo(48, 5);
  });

  it("warns about impossible hours", () => {
    expect(electricityCost({ watts: 100, hoursPerDay: 30, days: 1, ratePerKwh: 1 }).issues.length).toBeGreaterThan(0);
  });
});

describe("world clock", () => {
  it("shows a zone time and offset", () => {
    const date = new Date("2025-03-04T12:00:00Z");
    const lagos = zoneTime(date, "Africa/Lagos");
    expect(lagos.time.startsWith("13:00")).toBe(true);
    expect(lagos.offset).toBe("UTC+01:00");
    expect(zoneTime(date, "Asia/Tokyo").offset).toBe("UTC+09:00");
  });

  it("has unique city zones", () => {
    expect(new Set(WORLD_CITIES.map((city) => city.id)).size).toBe(WORLD_CITIES.length);
    expect(WORLD_CITIES.every((city) => city.zone.includes("/"))).toBe(true);
  });
});
