/**
 * Everyday and lifestyle helpers: health estimates, timers' arithmetic, cooking
 * scaling and household energy. Every function here is an estimate with a stated
 * model — none of them diagnose anything.
 */

/* ------------------------------------------------------------------ */
/* Energy expenditure                                                  */
/* ------------------------------------------------------------------ */

export type Sex = "male" | "female";

export interface CalorieInput {
  sex: Sex;
  age: number;
  heightCm: number;
  weightKg: number;
  activity: number;
  goal: "lose" | "maintain" | "gain";
}

export interface CalorieEstimate {
  bmr: number;
  maintenance: number;
  target: number;
  protein: number;
  fat: number;
  carbs: number;
  weeklyChangeKg: number;
  issues: string[];
}

/** Mifflin–St Jeor basal metabolic rate, then an activity multiplier. */
export function estimateCalories(input: CalorieInput): CalorieEstimate {
  const issues: string[] = [];
  if (input.age < 15 || input.age > 100) issues.push("The equation is validated for adults aged 15 to 100.");
  if (input.heightCm < 100 || input.heightCm > 250) issues.push("Check the height — values outside 100–250 cm look wrong.");
  if (input.weightKg < 25 || input.weightKg > 300) issues.push("Check the weight — values outside 25–300 kg look wrong.");

  const bmr = 10 * input.weightKg + 6.25 * input.heightCm - 5 * input.age + (input.sex === "male" ? 5 : -161);
  const maintenance = bmr * (input.activity > 0 ? input.activity : 1.2);

  const delta = input.goal === "lose" ? -500 : input.goal === "gain" ? 300 : 0;
  let target = maintenance + delta;

  // A deficit below the basal rate is not a diet, it is a plan to lose muscle.
  if (input.goal === "lose" && target < bmr) {
    target = bmr;
    issues.push("The 500 kcal deficit would fall below your basal rate, so the target is held at BMR instead.");
  }
  if (input.goal === "lose" && input.sex === "female" && target < 1200) {
    target = 1200;
    issues.push("Targets below 1200 kcal are not appropriate without medical supervision.");
  }
  if (input.goal === "lose" && input.sex === "male" && target < 1500) {
    target = 1500;
    issues.push("Targets below 1500 kcal are not appropriate without medical supervision.");
  }

  const protein = input.weightKg * 1.6;
  const fat = (target * 0.27) / 9;
  const carbs = Math.max(0, (target - protein * 4 - fat * 9) / 4);

  return {
    bmr: Math.round(bmr),
    maintenance: Math.round(maintenance),
    target: Math.round(target),
    protein: Math.round(protein),
    fat: Math.round(fat),
    carbs: Math.round(carbs),
    weeklyChangeKg: (delta * 7) / 7700,
    issues,
  };
}

/* ------------------------------------------------------------------ */
/* Hydration                                                           */
/* ------------------------------------------------------------------ */

export interface WaterInput {
  weightKg: number;
  exerciseMinutes: number;
  climate: "temperate" | "hot" | "very-hot";
}

export interface WaterEstimate {
  litres: number;
  glasses: number;
  baseLitres: number;
  exerciseLitres: number;
  climateLitres: number;
  issues: string[];
}

export function waterIntake(input: WaterInput): WaterEstimate {
  const issues: string[] = [];
  if (input.weightKg <= 0) issues.push("Enter a body weight above zero.");
  const baseLitres = (input.weightKg * 35) / 1000;
  const exerciseLitres = (Math.max(0, input.exerciseMinutes) / 30) * 0.35;
  const climateLitres = input.climate === "hot" ? 0.5 : input.climate === "very-hot" ? 0.9 : 0;
  const litres = Math.max(0, baseLitres + exerciseLitres + climateLitres);
  return {
    litres,
    glasses: Math.round((litres * 1000) / 250),
    baseLitres,
    exerciseLitres,
    climateLitres,
    issues,
  };
}

/* ------------------------------------------------------------------ */
/* Sleep                                                               */
/* ------------------------------------------------------------------ */

export function parseClock(input: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(input.trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  return hours * 60 + minutes;
}

export function formatClock(minutes: number): string {
  const wrapped = ((minutes % 1440) + 1440) % 1440;
  return `${String(Math.floor(wrapped / 60)).padStart(2, "0")}:${String(wrapped % 60).padStart(2, "0")}`;
}

export interface SleepResult {
  inBedMinutes: number;
  asleepMinutes: number;
  cycles: number;
  debtMinutes: number;
  bedtimeSuggestions: string[];
  issues: string[];
}

/** Sleep duration from clock times, plus the bedtimes for 4–6 complete cycles. */
export function sleepDuration(input: {
  bedtime: string;
  wake: string;
  latencyMinutes: number;
  targetHours: number;
}): SleepResult {
  const bed = parseClock(input.bedtime);
  const wake = parseClock(input.wake);
  const issues: string[] = [];

  if (bed === null || wake === null) {
    return { inBedMinutes: 0, asleepMinutes: 0, cycles: 0, debtMinutes: 0, bedtimeSuggestions: [], issues: ["Enter both times as HH:MM."] };
  }

  const inBedMinutes = wake >= bed ? wake - bed : 1440 - bed + wake;
  const latency = Math.max(0, Math.min(120, input.latencyMinutes));
  const asleepMinutes = Math.max(0, inBedMinutes - latency);
  const cycles = Math.floor(asleepMinutes / 90);

  const targetMinutes = Math.max(0, input.targetHours) * 60;
  const debtMinutes = targetMinutes - asleepMinutes;

  const wakeExact = wake;
  const bedtimeSuggestions = [6, 5, 4].map((cycleCount) => formatClock(wakeExact - cycleCount * 90 - latency));

  if (asleepMinutes < 300) issues.push("Under five hours of sleep is associated with clear cognitive impairment.");
  if (latency > 30) issues.push("A latency above 30 minutes usually means the bedtime is earlier than your body is ready for.");

  return { inBedMinutes, asleepMinutes, cycles, debtMinutes, bedtimeSuggestions, issues };
}

/* ------------------------------------------------------------------ */
/* Pregnancy and cycle dating                                          */
/* ------------------------------------------------------------------ */

export function addDays(date: Date, days: number): Date {
  const copy = new Date(date.getTime());
  copy.setDate(copy.getDate() + days);
  return copy;
}

export function toDateInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseDateInput(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value.trim())) return null;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export interface PregnancyResult {
  dueDate: Date;
  gestationalDays: number;
  gestationalWeeks: number;
  gestationalRemainder: number;
  trimester: 1 | 2 | 3;
  conception: Date;
  viability: Date;
  fullTerm: Date;
  percentComplete: number;
  issues: string[];
}

/** Naegele's rule adjusted for cycle length, with the usual milestones. */
export function pregnancyDueDate(input: { lmp: string; cycleLength: number; today?: Date }): PregnancyResult | null {
  const lmp = parseDateInput(input.lmp);
  if (!lmp) return null;

  const today = input.today ?? new Date();
  const adjust = Math.min(14, Math.max(0, (input.cycleLength || 28) - 28));
  const dueDate = addDays(lmp, 280 + adjust);
  const gestationalDays = Math.max(0, Math.round((today.getTime() - lmp.getTime()) / 86_400_000));
  const gestationalWeeks = Math.floor(gestationalDays / 7);

  const issues: string[] = [];
  if (gestationalDays > 300) issues.push("That is more than 42 weeks — check the last menstrual period date.");
  if (lmp.getTime() > today.getTime()) issues.push("The last menstrual period is in the future.");

  return {
    dueDate,
    gestationalDays,
    gestationalWeeks,
    gestationalRemainder: gestationalDays % 7,
    trimester: gestationalWeeks < 14 ? 1 : gestationalWeeks < 28 ? 2 : 3,
    conception: addDays(lmp, 14 + adjust),
    viability: addDays(lmp, 154),
    fullTerm: addDays(lmp, 259),
    percentComplete: Math.min(100, Math.max(0, (gestationalDays / 280) * 100)),
    issues,
  };
}

export interface CycleResult {
  ovulation: Date;
  fertileStart: Date;
  fertileEnd: Date;
  nextPeriods: Date[];
  cycleLength: number;
  issues: string[];
}

export function ovulationWindow(input: { lmp: string; cycleLength: number; lutealLength: number }): CycleResult | null {
  const lmp = parseDateInput(input.lmp);
  if (!lmp) return null;

  const cycleLength = Math.min(60, Math.max(20, input.cycleLength || 28));
  const luteal = Math.min(20, Math.max(9, input.lutealLength || 14));
  const issues: string[] = [];
  if (input.cycleLength < 21 || input.cycleLength > 45) {
    issues.push("Cycles outside 21–45 days are harder to predict this way; a clinician can investigate the cause.");
  }

  const ovulation = addDays(lmp, cycleLength - luteal);
  return {
    ovulation,
    fertileStart: addDays(ovulation, -5),
    fertileEnd: addDays(ovulation, 1),
    nextPeriods: [1, 2, 3].map((index) => addDays(lmp, cycleLength * index)),
    cycleLength,
    issues,
  };
}

/* ------------------------------------------------------------------ */
/* Body composition                                                    */
/* ------------------------------------------------------------------ */

const CM_PER_INCH = 2.54;

export interface BodyFatResult {
  percent: number;
  category: string;
  fatMass: number;
  leanMass: number;
  issues: string[];
}

/** US Navy circumference method. Measurements are centimetres, converted to inches. */
export function bodyFat(input: {
  sex: Sex;
  heightCm: number;
  neckCm: number;
  waistCm: number;
  hipCm?: number;
  weightKg?: number;
}): BodyFatResult | null {
  const issues: string[] = [];
  const height = input.heightCm / CM_PER_INCH;
  const neck = input.neckCm / CM_PER_INCH;
  const waist = input.waistCm / CM_PER_INCH;

  if (!(height > 0) || !(neck > 0) || !(waist > 0)) return null;
  if (input.sex === "female" && !(Number(input.hipCm) > 0)) {
    issues.push("The female equation needs a hip measurement.");
    return null;
  }

  let percent: number;
  if (input.sex === "male") {
    const inner = waist - neck;
    if (inner <= 0) {
      issues.push("Waist must be larger than neck for the equation to work.");
      return null;
    }
    // US Navy circumference equation: 86.010·log₁₀(waist − neck) − 70.041·log₁₀(height) + 36.76
    percent = 86.01 * Math.log10(inner) - 70.041 * Math.log10(height) + 36.76;
  } else {
    const inner = waist + (input.hipCm as number) / CM_PER_INCH - neck;
    if (inner <= 0) {
      issues.push("Waist plus hip must be larger than the neck measurement.");
      return null;
    }
    // 163.205·log₁₀(waist + hip − neck) − 97.684·log₁₀(height) − 78.387
    percent = 163.205 * Math.log10(inner) - 97.684 * Math.log10(height) - 78.387;
  }

  percent = Math.max(0, Math.min(70, percent));

  const bands =
    input.sex === "male"
      ? [
          [5, "Essential fat"],
          [13, "Athletic"],
          [17, "Fitness"],
          [24, "Average"],
          [100, "Above average"],
        ]
      : [
          [13, "Essential fat"],
          [20, "Athletic"],
          [24, "Fitness"],
          [31, "Average"],
          [100, "Above average"],
        ];

  const category = bands.find(([limit]) => percent <= (limit as number))?.[1] as string;
  const weight = Number(input.weightKg) || 0;

  return {
    percent,
    category,
    fatMass: (weight * percent) / 100,
    leanMass: weight - (weight * percent) / 100,
    issues,
  };
}

/* ------------------------------------------------------------------ */
/* Pace and speed                                                      */
/* ------------------------------------------------------------------ */

export function parseDuration(input: string): number | null {
  const text = input.trim();
  if (!text) return null;
  const parts = text.split(":").map((part) => Number(part));
  if (parts.some((part) => !Number.isFinite(part) || part < 0)) return null;
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 1) return parts[0] * 60;
  return null;
}

export function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "—";
  const total = Math.round(seconds);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  if (hours > 0) return `${hours}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  return `${minutes}:${String(secs).padStart(2, "0")}`;
}

export interface PaceResult {
  secondsPerUnit: number;
  speedKph: number;
  speedMph: number;
  splits: { label: string; time: string }[];
  issues: string[];
}

/** Pace from a distance (kilometres) and a duration (seconds). */
export function paceFromDistance(distanceKm: number, seconds: number, unit: "km" | "mi"): PaceResult {
  const issues: string[] = [];
  if (!(distanceKm > 0) || !(seconds > 0)) {
    return { secondsPerUnit: Number.NaN, speedKph: Number.NaN, speedMph: Number.NaN, splits: [], issues: ["Enter a distance and a time above zero."] };
  }

  const unitKm = unit === "km" ? 1 : 1.609344;
  const secondsPerUnit = seconds / (distanceKm / unitKm);
  const speedKph = (distanceKm / seconds) * 3600;

  const splits: { label: string; time: string }[] = [];
  const fullUnits = Math.floor(distanceKm / unitKm);
  for (let index = 1; index <= Math.min(fullUnits, 42); index += 1) {
    splits.push({ label: `${unit === "km" ? "Km" : "Mile"} ${index}`, time: formatDuration(secondsPerUnit * index) });
  }
  const remainderKm = distanceKm - fullUnits * unitKm;
  if (remainderKm > 0.01) {
    const fraction = remainderKm / unitKm;
    splits.push({
      label: `${remainderKm.toFixed(2)} km to go`,
      time: formatDuration(secondsPerUnit * fraction),
    });
  }

  return { secondsPerUnit, speedKph, speedMph: speedKph / 1.609344, splits, issues };
}

/* ------------------------------------------------------------------ */
/* Cooking                                                             */
/* ------------------------------------------------------------------ */

/** Parse "1 1/2", "3/4", "1.5" or "2" into a number. */
export function parseQuantity(input: string): number | null {
  const text = input.trim();
  if (!text) return null;
  const mixed = /^(\d+)\s+(\d+)\/(\d+)$/.exec(text);
  if (mixed) {
    const whole = Number(mixed[1]);
    const numerator = Number(mixed[2]);
    const denominator = Number(mixed[3]);
    if (denominator === 0) return null;
    return whole + numerator / denominator;
  }
  const fraction = /^(\d+)\/(\d+)$/.exec(text);
  if (fraction) {
    const denominator = Number(fraction[2]);
    if (denominator === 0) return null;
    return Number(fraction[1]) / denominator;
  }
  const value = Number(text);
  return Number.isFinite(value) ? value : null;
}

/** Render a quantity back as a kitchen-friendly string, preferring eighths. */
export function formatQuantity(value: number): string {
  if (!Number.isFinite(value)) return "—";
  if (value === 0) return "0";
  const whole = Math.floor(value + 1e-9);
  const remainder = value - whole;
  const eighths = Math.round(remainder * 8);

  // Only claim a fraction when the value really is close to it: 0.1 is not 1/8.
  if (Math.abs(remainder * 8 - eighths) > 0.15) {
    return String(Number(value.toFixed(value < 1 ? 2 : 2)));
  }
  const table: Record<number, string> = { 1: "1/8", 2: "1/4", 3: "3/8", 4: "1/2", 5: "5/8", 6: "3/4", 7: "7/8" };

  if (eighths === 8) return String(whole + 1);
  if (eighths === 0) return String(whole);
  const fraction = table[eighths];
  if (!fraction) return String(Number(value.toFixed(value < 1 ? 2 : 1)));
  return whole === 0 ? fraction : `${whole} ${fraction}`;
}

export interface RecipeLine {
  quantity: string;
  unit: string;
  name: string;
}

export interface ScaledRecipe {
  factor: number;
  lines: { quantity: string; original: string; unit: string; name: string }[];
  issues: string[];
}

export function scaleRecipe(input: { lines: RecipeLine[]; fromServings: number; toServings: number }): ScaledRecipe {
  const issues: string[] = [];
  const from = Number(input.fromServings);
  const to = Number(input.toServings);
  if (!(from > 0) || !(to > 0)) {
    return { factor: Number.NaN, lines: [], issues: ["Both serving counts must be above zero."] };
  }
  const factor = to / from;

  const lines = input.lines
    .filter((line) => line.name.trim() || line.quantity.trim())
    .map((line) => {
      const quantity = parseQuantity(line.quantity);
      return {
        quantity: quantity === null ? line.quantity : formatQuantity(quantity * factor),
        original: line.quantity,
        unit: line.unit,
        name: line.name,
      };
    });

  if (factor > 4) issues.push("Scaling above 4× changes more than quantities: pan size, cooking time and evaporation all shift.");
  if (factor < 0.25) issues.push("Below a quarter batch, small quantities round badly and seasoning should be adjusted by taste.");

  return { factor, lines, issues };
}

export const COOKING_EQUIVALENTS: { from: string; to: string; note: string }[] = [
  { from: "1 tablespoon", to: "3 teaspoons", note: "US and metric tablespoons are both 3 tsp" },
  { from: "1 fluid ounce", to: "2 tablespoons", note: "US fluid ounce" },
  { from: "1 cup", to: "16 tablespoons", note: "236.6 ml in the US, 250 ml in metric recipes" },
  { from: "1 US cup", to: "236.59 ml", note: "The US customary cup" },
  { from: "1 metric cup", to: "250 ml", note: "Common in Australian and UK recipes" },
  { from: "1 stick of butter", to: "113 g (8 tbsp)", note: "US sticks are quarter-pound" },
  { from: "1 US gallon", to: "3.785 litres", note: "An imperial gallon is 4.546 litres" },
  { from: "1 ounce (weight)", to: "28.35 g", note: "Not the same as a fluid ounce" },
  { from: "1 pound", to: "453.6 g", note: "Avoirdupois pound" },
  { from: "1 dessertspoon", to: "2 teaspoons", note: "Australian standard, 10 ml" },
];

/** Approximate grams per US cup for ingredients whose density actually matters. */
export const INGREDIENT_DENSITIES: { id: string; label: string; gramsPerCup: number }[] = [
  { id: "water", label: "Water or milk", gramsPerCup: 236 },
  { id: "flour", label: "All-purpose flour", gramsPerCup: 125 },
  { id: "bread-flour", label: "Bread flour", gramsPerCup: 127 },
  { id: "sugar", label: "Granulated sugar", gramsPerCup: 200 },
  { id: "brown-sugar", label: "Brown sugar (packed)", gramsPerCup: 220 },
  { id: "butter", label: "Butter", gramsPerCup: 227 },
  { id: "cocoa", label: "Cocoa powder", gramsPerCup: 85 },
  { id: "rice", label: "Uncooked rice", gramsPerCup: 185 },
  { id: "oats", label: "Rolled oats", gramsPerCup: 90 },
  { id: "honey", label: "Honey", gramsPerCup: 340 },
];

/* ------------------------------------------------------------------ */
/* Fuel and electricity                                                */
/* ------------------------------------------------------------------ */

export interface FuelResult {
  litresPer100km: number;
  mpgUs: number;
  mpgUk: number;
  kmPerLitre: number;
  costPer100km: number | null;
  issues: string[];
}

export function fuelConsumption(input: { distanceKm: number; litres: number; pricePerLitre?: number }): FuelResult {
  const issues: string[] = [];
  const { distanceKm, litres } = input;

  if (!(distanceKm > 0) || !(litres > 0)) {
    return { litresPer100km: Number.NaN, mpgUs: Number.NaN, mpgUk: Number.NaN, kmPerLitre: Number.NaN, costPer100km: null, issues: ["Enter a distance and a fuel volume above zero."] };
  }

  const litresPer100km = (litres / distanceKm) * 100;
  const price = Number(input.pricePerLitre);

  if (litresPer100km > 30) issues.push("Above 30 L/100 km is unusually high for a road car — check whether the distance is in kilometres.");

  return {
    litresPer100km,
    mpgUs: litresPer100km > 0 ? 235.215 / litresPer100km : Number.NaN,
    mpgUk: litresPer100km > 0 ? 282.481 / litresPer100km : Number.NaN,
    kmPerLitre: distanceKm / litres,
    costPer100km: Number.isFinite(price) && price > 0 ? litresPer100km * price : null,
    issues,
  };
}

export interface ElectricityResult {
  kwhPerDay: number;
  kwhTotal: number;
  costPerDay: number;
  costTotal: number;
  co2Kg: number;
  issues: string[];
}

/** Appliance energy use: watts × hours × days, priced at the tariff you enter. */
export function electricityCost(input: { watts: number; hoursPerDay: number; days: number; ratePerKwh: number; carbonGramsPerKwh?: number }): ElectricityResult {
  const issues: string[] = [];
  if (!(input.watts >= 0) || !(input.hoursPerDay >= 0) || !(input.days >= 0)) {
    return { kwhPerDay: 0, kwhTotal: 0, costPerDay: 0, costTotal: 0, co2Kg: 0, issues: ["Enter values above zero."] };
  }

  const kwhPerDay = (input.watts * input.hoursPerDay) / 1000;
  const kwhTotal = kwhPerDay * input.days;
  const rate = Math.max(0, input.ratePerKwh);
  const carbon = Math.max(0, input.carbonGramsPerKwh ?? 0) / 1000;

  if (input.hoursPerDay > 24) issues.push("An appliance cannot run more than 24 hours a day.");
  if (input.watts > 5000) issues.push("Above 5 kW is unusual for a domestic plug load — check the label.");

  return {
    kwhPerDay,
    kwhTotal,
    costPerDay: kwhPerDay * rate,
    costTotal: kwhTotal * rate,
    co2Kg: kwhTotal * carbon,
    issues,
  };
}

/* ------------------------------------------------------------------ */
/* World clock                                                         */
/* ------------------------------------------------------------------ */

export const WORLD_CITIES: { id: string; city: string; country: string; zone: string }[] = [
  { id: "lagos", city: "Lagos", country: "Nigeria", zone: "Africa/Lagos" },
  { id: "london", city: "London", country: "United Kingdom", zone: "Europe/London" },
  { id: "berlin", city: "Berlin", country: "Germany", zone: "Europe/Berlin" },
  { id: "cairo", city: "Cairo", country: "Egypt", zone: "Africa/Cairo" },
  { id: "dubai", city: "Dubai", country: "UAE", zone: "Asia/Dubai" },
  { id: "mumbai", city: "Mumbai", country: "India", zone: "Asia/Kolkata" },
  { id: "singapore", city: "Singapore", country: "Singapore", zone: "Asia/Singapore" },
  { id: "shanghai", city: "Shanghai", country: "China", zone: "Asia/Shanghai" },
  { id: "tokyo", city: "Tokyo", country: "Japan", zone: "Asia/Tokyo" },
  { id: "sydney", city: "Sydney", country: "Australia", zone: "Australia/Sydney" },
  { id: "auckland", city: "Auckland", country: "New Zealand", zone: "Pacific/Auckland" },
  { id: "new-york", city: "New York", country: "United States", zone: "America/New_York" },
  { id: "chicago", city: "Chicago", country: "United States", zone: "America/Chicago" },
  { id: "los-angeles", city: "Los Angeles", country: "United States", zone: "America/Los_Angeles" },
  { id: "sao-paulo", city: "São Paulo", country: "Brazil", zone: "America/Sao_Paulo" },
];

/** Offset of a zone against UTC at a given instant, in minutes. */
export function zoneOffsetMinutes(date: Date, zone: string): number {
  const formatter = new Intl.DateTimeFormat("en-US", { timeZone: zone, hour12: false, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
  const parts = formatter.formatToParts(date);
  const get = (type: string) => Number(parts.find((part) => part.type === type)?.value ?? 0);
  const asUtc = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour") % 24, get("minute"));
  return Math.round((asUtc - Math.floor(date.getTime() / 60000) * 60000) / 60000);
}

/** "2025-03-04T14:05" style local clock time in a zone. */
export function zoneTime(date: Date, zone: string): { time: string; day: string; offset: string } {
  const time = new Intl.DateTimeFormat("en-GB", { timeZone: zone, hour: "2-digit", minute: "2-digit", hour12: false, timeZoneName: "short" }).format(date);
  const day = new Intl.DateTimeFormat("en-GB", { timeZone: zone, weekday: "short", day: "2-digit", month: "short" }).format(date);
  const offset = zoneOffsetMinutes(date, zone);
  const sign = offset >= 0 ? "+" : "−";
  const absolute = Math.abs(offset);
  return {
    time,
    day,
    offset: `UTC${sign}${String(Math.floor(absolute / 60)).padStart(2, "0")}:${String(absolute % 60).padStart(2, "0")}`,
  };
}
