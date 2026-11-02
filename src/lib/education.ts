/**
 * Education helpers: grades, attendance, study planning, number systems,
 * algebra and citations. Everything is deterministic and runs in the browser.
 */

/* ------------------------------------------------------------------ */
/* Grades                                                              */
/* ------------------------------------------------------------------ */

const GRADE_SCALE: { min: number; letter: string; points: number }[] = [
  { min: 97, letter: "A+", points: 4 },
  { min: 93, letter: "A", points: 4 },
  { min: 90, letter: "A-", points: 3.7 },
  { min: 87, letter: "B+", points: 3.3 },
  { min: 83, letter: "B", points: 3 },
  { min: 80, letter: "B-", points: 2.7 },
  { min: 77, letter: "C+", points: 2.3 },
  { min: 73, letter: "C", points: 2 },
  { min: 70, letter: "C-", points: 1.7 },
  { min: 67, letter: "D+", points: 1.3 },
  { min: 63, letter: "D", points: 1 },
  { min: 60, letter: "D-", points: 0.7 },
  { min: 0, letter: "F", points: 0 },
];

export function letterGrade(percent: number): string {
  if (!Number.isFinite(percent)) return "—";
  return GRADE_SCALE.find((band) => percent >= band.min)?.letter ?? "F";
}

export function gradePoints(percent: number): number {
  if (!Number.isFinite(percent)) return Number.NaN;
  return GRADE_SCALE.find((band) => percent >= band.min)?.points ?? 0;
}

export interface GradeCategory {
  name: string;
  score: number;
  weight: number;
}

export interface WeightedGrade {
  percent: number;
  letter: string;
  gpa: number;
  gradedWeight: number;
  remainingWeight: number;
  issues: string[];
}

/** Weighted average over the categories that already have a score. */
export function weightedGrade(categories: GradeCategory[]): WeightedGrade {
  const issues: string[] = [];
  let weighted = 0;
  let gradedWeight = 0;
  let remainingWeight = 0;

  for (const category of categories) {
    if (!Number.isFinite(category.weight) || category.weight <= 0) continue;
    if (!Number.isFinite(category.score) || category.score < 0) {
      remainingWeight += category.weight;
      continue;
    }
    const score = Math.min(100, category.score);
    if (category.score > 100) issues.push(`${category.name} is above 100% — extra credit was capped at 100.`);
    weighted += score * category.weight;
    gradedWeight += category.weight;
  }

  const total = gradedWeight + remainingWeight;
  if (total > 100.001) issues.push(`Weights add up to ${formatSmart(total)}% instead of 100%.`);
  if (total < 99.999 && total > 0) issues.push(`Weights only add up to ${formatSmart(total)}% — the average covers that share.`);

  const percent = gradedWeight > 0 ? weighted / gradedWeight : Number.NaN;

  return {
    percent,
    letter: letterGrade(percent),
    gpa: gradePoints(percent),
    gradedWeight,
    remainingWeight,
    issues,
  };
}

/** The average needed on everything still ungraded to reach `target`. */
export function scoreNeededForTarget(categories: GradeCategory[], target: number): number | null {
  let graded = 0;
  let gradedWeight = 0;
  let remaining = 0;
  for (const category of categories) {
    if (!Number.isFinite(category.weight) || category.weight <= 0) continue;
    if (!Number.isFinite(category.score)) {
      remaining += category.weight;
      continue;
    }
    graded += Math.min(100, category.score) * category.weight;
    gradedWeight += category.weight;
  }
  if (remaining <= 0) return null;
  const needed = (target * (gradedWeight + remaining) - graded) / remaining;
  return Number.isFinite(needed) ? needed : null;
}

export interface Semester {
  name: string;
  gpa: number;
  credits: number;
}

export function calculateCgpa(semesters: Semester[]): { cgpa: number; credits: number; points: number } {
  let points = 0;
  let credits = 0;
  for (const semester of semesters) {
    if (!Number.isFinite(semester.gpa) || !Number.isFinite(semester.credits) || semester.credits <= 0) continue;
    points += semester.gpa * semester.credits;
    credits += semester.credits;
  }
  return { cgpa: credits > 0 ? points / credits : Number.NaN, credits, points };
}

export interface ExamInput {
  scored: number;
  total: number;
  pass?: number;
  target?: number;
}

export interface ExamResult {
  percent: number;
  letter: string;
  gpa: number;
  passed: boolean | null;
  correctForTarget: number | null;
  losingMarks: number;
  issues: string[];
}

export function examResult(input: ExamInput): ExamResult {
  const issues: string[] = [];
  if (input.total <= 0) {
    return { percent: Number.NaN, letter: "—", gpa: Number.NaN, passed: null, correctForTarget: null, losingMarks: 0, issues: ["Total marks must be greater than zero."] };
  }
  if (input.scored > input.total) issues.push("Scored marks are above the total — check the paper.");
  if (input.scored < 0) issues.push("Scored marks cannot be negative.");

  const percent = (input.scored / input.total) * 100;
  const pass = input.pass ?? 40;
  const target = input.target;

  return {
    percent,
    letter: letterGrade(percent),
    gpa: gradePoints(percent),
    passed: Number.isFinite(pass) ? percent >= pass : null,
    correctForTarget: Number.isFinite(target) ? Math.ceil(((target as number) / 100) * input.total) : null,
    losingMarks: Math.max(0, input.total - input.scored),
    issues,
  };
}

/* ------------------------------------------------------------------ */
/* Attendance                                                          */
/* ------------------------------------------------------------------ */

export interface AttendanceInput {
  attended: number;
  held: number;
  required: number;
  remaining: number;
}

export interface AttendancePlan {
  percent: number;
  met: boolean;
  canSkip: number;
  mustAttend: number;
  maxFinalPercent: number;
  issues: string[];
}

export function attendancePlan(input: AttendanceInput): AttendancePlan {
  const issues: string[] = [];
  const held = Math.max(0, input.held);
  const attended = Math.min(Math.max(0, input.attended), held);
  const remaining = Math.max(0, Math.trunc(input.remaining));
  const required = Math.min(100, Math.max(0, input.required));

  if (input.attended > input.held) issues.push("Attended classes exceed classes held — check the numbers.");

  const percent = held > 0 ? (attended / held) * 100 : 100;
  const total = held + remaining;

  // How many of the remaining classes can be missed and still end at or above `required`.
  let canSkip = 0;
  if (total > 0) {
    while (canSkip < remaining && ((attended + (remaining - canSkip - 1)) / total) * 100 >= required) canSkip += 1;
  }

  // How many consecutive remaining classes must be attended to get back above `required`.
  let mustAttend = 0;
  while (mustAttend <= remaining) {
    const future = attended + mustAttend;
    const denominator = held + mustAttend;
    if (denominator === 0 || (future / denominator) * 100 >= required) break;
    mustAttend += 1;
  }

  const maxFinalPercent = total > 0 ? ((attended + remaining) / total) * 100 : 100;

  return {
    percent,
    met: percent >= required,
    canSkip,
    mustAttend: mustAttend > remaining ? Number.POSITIVE_INFINITY : mustAttend,
    maxFinalPercent,
    issues,
  };
}

/* ------------------------------------------------------------------ */
/* Study planning                                                      */
/* ------------------------------------------------------------------ */

export interface StudySubject {
  name: string;
  confidence: number;
  weight?: number;
}

export interface StudyAllocation {
  name: string;
  confidence: number;
  hours: number;
  minutesPerDay: number;
}

export interface StudyPlan {
  daysLeft: number;
  totalHours: number;
  perDay: number;
  allocations: StudyAllocation[];
  issues: string[];
}

export function studyPlan(input: {
  examDate: string;
  hoursPerDay: number;
  subjects: StudySubject[];
  today?: Date;
}): StudyPlan {
  const issues: string[] = [];
  const today = input.today ?? new Date();
  const exam = new Date(`${input.examDate}T00:00:00`);
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const daysLeft = Number.isNaN(exam.getTime())
    ? 0
    : Math.max(0, Math.round((exam.getTime() - start.getTime()) / 86_400_000));

  if (daysLeft === 0 && input.examDate) issues.push("The exam date is today or in the past, so there are no study days left.");

  const perDay = Math.max(0, Math.min(16, input.hoursPerDay));
  const totalHours = daysLeft * perDay;

  const usable = input.subjects.filter((subject) => subject.name.trim().length > 0);
  // Lower confidence means more of the time, but no subject goes without attention.
  const weights = usable.map((subject) => {
    const confidence = Math.min(5, Math.max(1, subject.confidence));
    return (subject.weight && subject.weight > 0 ? subject.weight : 1) * (6 - confidence);
  });
  const weightSum = weights.reduce((sum, weight) => sum + weight, 0);

  const allocations: StudyAllocation[] = usable.map((subject, index) => {
    const hours = weightSum > 0 ? (totalHours * weights[index]) / weightSum : 0;
    return {
      name: subject.name,
      confidence: subject.confidence,
      hours,
      minutesPerDay: daysLeft > 0 ? (hours * 60) / daysLeft : 0,
    };
  });

  if (usable.length === 0) issues.push("Add at least one subject to get an allocation.");
  if (usable.length > 0 && totalHours < usable.length) issues.push("There are fewer study hours than subjects — each subject gets very little time.");

  return { daysLeft, totalHours, perDay, allocations, issues };
}

export interface TimetableBlock {
  day: string;
  subject: string;
  start: string;
  end: string;
  minutes: number;
}

export function buildTimetable(input: {
  subjects: { name: string; hours: number }[];
  days: string[];
  sessionMinutes: number;
  startHour: number;
  breakMinutes?: number;
}): TimetableBlock[] {
  const subjects = input.subjects
    .filter((subject) => subject.name.trim() && subject.hours > 0)
    .map((subject) => ({ ...subject, remaining: Math.round(subject.hours * 60) }));
  if (!subjects.length || !input.days.length) return [];

  const session = Math.max(15, Math.min(240, input.sessionMinutes));
  const breakMinutes = Math.max(0, Math.min(60, input.breakMinutes ?? 10));
  const startMinutes = Math.max(0, Math.min(23, Math.floor(input.startHour))) * 60;
  const endLimit = 22 * 60;

  const blocks: TimetableBlock[] = [];
  let cursor = 0;

  for (const day of input.days) {
    let clock = startMinutes;
    while (clock + session <= endLimit) {
      const subject = subjects[cursor % subjects.length];
      if (subject.remaining <= 0) {
        // Skip finished subjects, but stop if nothing is left anywhere.
        if (subjects.every((candidate) => candidate.remaining <= 0)) return blocks;
        cursor += 1;
        continue;
      }
      const length = Math.min(session, subject.remaining);
      blocks.push({
        day,
        subject: subject.name,
        start: clockToLabel(clock),
        end: clockToLabel(clock + length),
        minutes: length,
      });
      subject.remaining -= length;
      clock += length + breakMinutes;
      cursor += 1;
    }
  }

  return blocks;
}

function clockToLabel(minutes: number): string {
  const hours = Math.floor(minutes / 60) % 24;
  const mins = minutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

/* ------------------------------------------------------------------ */
/* Flashcards and quizzes                                              */
/* ------------------------------------------------------------------ */

export interface Flashcard {
  front: string;
  back: string;
}

/** Parse a pasted list into cards. Accepts tab, pipe, " - ", ":" or Q/A pairs. */
export function parseFlashcards(text: string): { cards: Flashcard[]; skipped: string[] } {
  const cards: Flashcard[] = [];
  const skipped: string[] = [];
  const lines = text.split(/\r?\n/);

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].trim();
    if (!line) continue;

    const next = lines[index + 1]?.trim() ?? "";
    if (/^q\s*:/i.test(line) && /^a\s*:/i.test(next)) {
      cards.push({ front: line.replace(/^q\s*:\s*/i, ""), back: next.replace(/^a\s*:\s*/i, "") });
      index += 1;
      continue;
    }

    let split: [string, string] | null = null;
    for (const separator of ["\t", "|", " - ", " — ", ":", "="]) {
      const at = line.indexOf(separator);
      if (at > 0 && at < line.length - separator.length) {
        split = [line.slice(0, at).trim(), line.slice(at + separator.length).trim()];
        break;
      }
    }

    if (!split || !split[0] || !split[1]) {
      if (line) skipped.push(line);
      continue;
    }
    cards.push({ front: split[0], back: split[1] });
  }

  return { cards, skipped };
}

function mulberry32(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffle<T>(items: T[], seed = 1): T[] {
  const random = mulberry32(seed);
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1));
    [copy[index], copy[swap]] = [copy[swap], copy[index]];
  }
  return copy;
}

export function flashcardsToTsv(cards: Flashcard[]): string {
  return cards.map((card) => `${card.front}\t${card.back}`).join("\n");
}

export function flashcardsToCsv(cards: Flashcard[]): string {
  const quote = (value: string) => `"${value.replace(/"/g, '""')}"`;
  return ["front,back", ...cards.map((card) => `${quote(card.front)},${quote(card.back)}`)].join("\n");
}

export interface QuizQuestion {
  prompt: string;
  options: string[];
  answer: number;
}

/** Build a multiple-choice quiz from cards, using other answers as distractors. */
export function buildQuiz(cards: Flashcard[], options: { count?: number; choices?: number; seed?: number } = {}): QuizQuestion[] {
  const choices = Math.max(2, Math.min(6, options.choices ?? 4));
  if (cards.length < 2) return [];

  const pool = cards.filter((card) => card.back.trim());
  const chosen = shuffle(pool, options.seed ?? 1).slice(0, Math.max(1, options.count ?? 10));

  return chosen.map((card, index) => {
    const distractors = shuffle(
      pool.filter((candidate) => candidate.back !== card.back).map((candidate) => candidate.back),
      (options.seed ?? 1) + index + 1,
    ).slice(0, choices - 1);
    const all = shuffle([card.back, ...distractors], (options.seed ?? 1) + index * 7 + 3);
    return {
      prompt: card.front,
      options: all,
      answer: all.indexOf(card.back),
    };
  });
}

/* ------------------------------------------------------------------ */
/* Number systems                                                      */
/* ------------------------------------------------------------------ */

export function multiplicationTable(n: number, upTo = 12): { multiplier: number; product: number }[] {
  const limit = Math.max(1, Math.min(100, Math.trunc(upTo)));
  return Array.from({ length: limit }, (_, index) => ({ multiplier: index + 1, product: index + 1 === 0 ? 0 : n * (index + 1) }));
}

const ROMAN_VALUES: [number, string][] = [
  [1000, "M"],
  [900, "CM"],
  [500, "D"],
  [400, "CD"],
  [100, "C"],
  [90, "XC"],
  [50, "L"],
  [40, "XL"],
  [10, "X"],
  [9, "IX"],
  [5, "V"],
  [4, "IV"],
  [1, "I"],
];

export function toRoman(value: number): string | null {
  if (!Number.isInteger(value) || value < 1 || value > 3999) return null;
  let remaining = value;
  let output = "";
  for (const [amount, numeral] of ROMAN_VALUES) {
    while (remaining >= amount) {
      output += numeral;
      remaining -= amount;
    }
  }
  return output;
}

export function fromRoman(input: string): number | null {
  const text = input.trim().toUpperCase();
  if (!text || !/^[IVXLCDM]+$/.test(text)) return null;

  const values: Record<string, number> = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
  let total = 0;
  for (let index = 0; index < text.length; index += 1) {
    const current = values[text[index]];
    const next = values[text[index + 1]] ?? 0;
    total += current < next ? -current : current;
  }

  // Round-tripping rejects non-canonical forms such as IIII or VX.
  return toRoman(total) === text ? total : null;
}

const ONES = [
  "zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten",
  "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen",
];
const TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
const SCALES = ["", "thousand", "million", "billion", "trillion", "quadrillion"];

function underThousand(value: number, useAnd: boolean): string {
  const parts: string[] = [];
  const hundreds = Math.floor(value / 100);
  const rest = value % 100;
  if (hundreds) parts.push(`${ONES[hundreds]} hundred`);
  if (rest) {
    if (hundreds && useAnd) parts.push("and");
    if (rest < 20) parts.push(ONES[rest]);
    else {
      const tens = Math.floor(rest / 10);
      const ones = rest % 10;
      parts.push(ones ? `${TENS[tens]}-${ONES[ones]}` : TENS[tens]);
    }
  }
  return parts.join(" ");
}

export function numberToWords(value: number, options: { and?: boolean; decimals?: boolean } = {}): string {
  if (!Number.isFinite(value)) return "—";
  const useAnd = options.and ?? true;
  const negative = value < 0;
  const absolute = Math.abs(value);

  if (absolute >= 1e18) return "That number is too large for this converter.";

  const whole = Math.floor(absolute);
  const fraction = Math.round((absolute - whole) * 1e6) / 1e6;

  const groups: number[] = [];
  let remaining = whole;
  do {
    groups.push(remaining % 1000);
    remaining = Math.floor(remaining / 1000);
  } while (remaining > 0);

  const words: string[] = [];
  for (let index = groups.length - 1; index >= 0; index -= 1) {
    if (groups[index] === 0) continue;
    const chunk = underThousand(groups[index], useAnd);
    words.push(index === 0 ? chunk : `${chunk} ${SCALES[index]}`);
  }

  let output = words.join(" ") || "zero";

  if (fraction > 0 && options.decimals !== false) {
    const digits = String(fraction)
      .replace(/^0\./, "")
      .replace(/0+$/, "")
      .split("")
      .map((digit) => ONES[Number(digit)])
      .join(" ");
    output += ` point ${digits}`;
  }

  return negative ? `minus ${output}` : output;
}

/** Parse an English number phrase such as "four thousand and twenty-one". */
export function wordsToNumber(input: string): number | null {
  const cleaned = input
    .toLowerCase()
    .replace(/[-,]/g, " ")
    .replace(/\band\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!cleaned) return null;

  let negative = false;
  let text = cleaned;
  if (text.startsWith("minus ") || text.startsWith("negative ")) {
    negative = true;
    text = text.replace(/^(minus|negative) /, "");
  }

  const [wholePart, decimalPart] = text.split(" point ");

  const parseWhole = (phrase: string): number | null => {
    if (!phrase) return null;
    const words = phrase.split(" ");
    let total = 0;
    let current = 0;
    let matched = false;

    for (const word of words) {
      const onesIndex = ONES.indexOf(word);
      const tensIndex = TENS.indexOf(word);

      if (word === "hundred") {
        current = (current || 1) * 100;
        matched = true;
      } else if (onesIndex >= 0) {
        current += onesIndex;
        matched = true;
      } else if (tensIndex > 0) {
        current += tensIndex * 10;
        matched = true;
      } else {
        const scale = SCALES.indexOf(word);
        if (scale > 0) {
          total += (current || 1) * Math.pow(1000, scale);
          current = 0;
          matched = true;
        } else {
          return null;
        }
      }
    }

    return matched ? total + current : null;
  };

  const whole = parseWhole(wholePart);
  if (whole === null) return null;

  let value = whole;
  if (decimalPart) {
    const digits = decimalPart.split(" ").map((word) => ONES.indexOf(word));
    if (digits.some((digit) => digit < 0 || digit > 9)) return null;
    value += Number(`0.${digits.join("")}`);
  }

  return negative ? -value : value;
}

/* ------------------------------------------------------------------ */
/* Scientific notation                                                 */
/* ------------------------------------------------------------------ */

export interface ScientificForms {
  value: number;
  scientific: string;
  engineering: string;
  eNotation: string;
  decimal: string;
  coefficient: number;
  exponent: number;
  significantFigures: number;
}

/** Parse "1.5e-7", "0.000042", "6.02 × 10^23" or "6.02 x 10^23". */
export function parseNumberInput(input: string): number | null {
  const text = input.trim().replace(/,/g, "");
  if (!text) return null;
  const cleaned = text
    .replace(/[×xX*]\s*10\s*\^?\s*/g, "e")
    .replace(/\s+/g, "")
    .replace(/·/g, "");
  if (!/^-?(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?$/i.test(cleaned)) return null;
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : null;
}

export function scientificForms(value: number, digits = 8): ScientificForms | null {
  if (!Number.isFinite(value)) return null;
  if (value === 0) {
    return {
      value,
      scientific: "0 × 10⁰",
      engineering: "0 × 10⁰",
      eNotation: "0e+0",
      decimal: "0",
      coefficient: 0,
      exponent: 0,
      significantFigures: 1,
    };
  }

  const exponent = Math.floor(Math.log10(Math.abs(value)));
  const coefficient = Number((value / Math.pow(10, exponent)).toPrecision(digits));
  const engineeringExponent = Math.floor(exponent / 3) * 3;
  const engineeringCoefficient = Number((value / Math.pow(10, engineeringExponent)).toPrecision(digits));

  return {
    value,
    scientific: `${trimZeros(coefficient)} × 10${superscript(exponent)}`,
    engineering: `${trimZeros(engineeringCoefficient)} × 10${superscript(engineeringExponent)}`,
    eNotation: `${trimZeros(coefficient)}e${exponent >= 0 ? "+" : ""}${exponent}`,
    decimal: trimZeros(Number(value.toPrecision(12))),
    coefficient,
    exponent,
    significantFigures: String(Math.abs(coefficient)).replace(".", "").replace(/^-/, "").length,
  };
}

export function superscript(value: number): string {
  const map: Record<string, string> = { "-": "⁻", "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹" };
  return String(value)
    .split("")
    .map((character) => map[character] ?? character)
    .join("");
}

function trimZeros(value: number): string {
  return String(value);
}

function formatSmart(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

/* ------------------------------------------------------------------ */
/* Algebra                                                             */
/* ------------------------------------------------------------------ */

export interface Polynomial {
  a: number;
  b: number;
  c: number;
}

/** Parse a polynomial such as "3x^2 - 5x + 6", "-x + 4" or "2x²". */
export function parsePolynomial(input: string): Polynomial | null {
  const text = input
    .replace(/²/g, "^2")
    .replace(/³/g, "^3")
    .replace(/−/g, "-")
    .replace(/\s+/g, "")
    .toLowerCase();
  if (!text) return null;

  const normalised = text.replace(/-/g, "+-");
  const terms = normalised.split("+").filter(Boolean);

  let a = 0;
  let b = 0;
  let c = 0;

  for (const term of terms) {
    if (/^-?\d*\.?\d*x\^2$/.test(term)) {
      a += parseCoefficient(term.replace("x^2", ""));
    } else if (/^-?\d*\.?\d*x\^3$/.test(term)) {
      return null;
    } else if (/^-?\d*\.?\d*x$/.test(term)) {
      b += parseCoefficient(term.replace("x", ""));
    } else if (/^-?\d*\.?\d+$/.test(term)) {
      c += Number(term);
    } else {
      return null;
    }
  }

  if (![a, b, c].every(Number.isFinite)) return null;
  return { a, b, c };
}

function parseCoefficient(text: string): number {
  if (text === "" || text === "+") return 1;
  if (text === "-") return -1;
  return Number(text);
}

export interface EquationSolution {
  kind: "linear" | "quadratic" | "identity" | "contradiction";
  roots: number[];
  discriminant?: number;
  vertex?: { x: number; y: number };
  steps: string[];
  issues: string[];
}

/** Solve "ax + b = cx + d" or "ax² + bx + c = 0" by moving everything left. */
export function solveEquation(input: string): EquationSolution | null {
  const sides = input.split("=");
  if (sides.length !== 2) return null;

  const left = parsePolynomial(sides[0]);
  const right = parsePolynomial(sides[1]);
  if (!left || !right) return null;

  const a = left.a - right.a;
  const b = left.b - right.b;
  const c = left.c - right.c;
  const steps: string[] = [];
  const issues: string[] = [];

  if (a === 0 && b === 0) {
    return c === 0
      ? { kind: "identity", roots: [], steps: ["Both sides are identical, so every value of x satisfies the equation."], issues }
      : { kind: "contradiction", roots: [], steps: ["The variable cancels and the constants disagree, so there is no solution."], issues };
  }

  if (a === 0) {
    const root = -c / b;
    steps.push(`Move everything to one side: ${formatTerm(b, "x")} ${formatSigned(c)} = 0.`);
    steps.push(`Solve for x: x = ${formatNumber(root)}.`);
    return { kind: "linear", roots: [root], steps, issues };
  }

  const discriminant = b * b - 4 * a * c;
  steps.push(`Write in standard form: ${formatQuadratic(a, b, c)} = 0.`);
  steps.push(`Discriminant: b² − 4ac = ${formatNumber(discriminant)}.`);

  const axis = -b / (2 * a);
  const vertexY = a * axis * axis + b * axis + c;

  if (discriminant > 0) {
    const root = Math.sqrt(discriminant);
    const r1 = (-b + root) / (2 * a);
    const r2 = (-b - root) / (2 * a);
    steps.push(`Positive discriminant: two real roots, x = (−b ± √D) / 2a.`);
    return {
      kind: "quadratic",
      roots: [Math.min(r1, r2), Math.max(r1, r2)],
      discriminant,
      vertex: { x: axis, y: vertexY },
      steps,
      issues,
    };
  }

  if (discriminant === 0) {
    steps.push("Zero discriminant: one repeated real root.");
    return { kind: "quadratic", roots: [axis], discriminant, vertex: { x: axis, y: vertexY }, steps, issues };
  }

  steps.push("Negative discriminant: the roots are complex, so there are no real solutions.");
  issues.push("This equation has no real roots. The vertex below is the closest the curve gets to the x-axis.");
  return { kind: "quadratic", roots: [], discriminant, vertex: { x: axis, y: vertexY }, steps, issues };
}

/** Combine like terms of a polynomial written as a sum. */
export function simplifyPolynomial(input: string): string | null {
  const polynomial = parsePolynomial(input);
  if (!polynomial) return null;
  const parts = [formatTerm(polynomial.a, "x²"), formatTerm(polynomial.b, "x"), formatConstant(polynomial.c)].filter(Boolean);
  return parts.length ? parts.join(" + ").replace(/\+ -/g, "− ") : "0";
}

export function evaluatePolynomial(polynomial: Polynomial, x: number): number {
  return polynomial.a * x * x + polynomial.b * x + polynomial.c;
}

/** Solve a 2×2 linear system with Cramer's rule: a₁x + b₁y = c₁. */
export function solveSystem2(input: { a1: number; b1: number; c1: number; a2: number; b2: number; c2: number }): { x: number; y: number } | null {
  const determinant = input.a1 * input.b2 - input.a2 * input.b1;
  if (Math.abs(determinant) < 1e-12) return null;
  return {
    x: (input.c1 * input.b2 - input.c2 * input.b1) / determinant,
    y: (input.a1 * input.c2 - input.a2 * input.c1) / determinant,
  };
}

function formatQuadratic(a: number, b: number, c: number): string {
  return [formatTerm(a, "x²"), formatTerm(b, "x"), formatConstant(c)].filter(Boolean).join(" + ").replace(/\+ -/g, "− ");
}

function formatTerm(coefficient: number, variable: string): string {
  if (coefficient === 0) return "";
  if (coefficient === 1) return variable;
  if (coefficient === -1) return `-${variable}`;
  return `${formatNumber(coefficient)}${variable}`;
}

function formatConstant(value: number): string {
  return value === 0 ? "" : formatNumber(value);
}

function formatSigned(value: number): string {
  return value === 0 ? "" : value > 0 ? `+ ${formatNumber(value)}` : `− ${formatNumber(Math.abs(value))}`;
}

export function formatNumber(value: number): string {
  if (!Number.isFinite(value)) return "—";
  const rounded = Number(value.toPrecision(10));
  return String(rounded);
}

/* ------------------------------------------------------------------ */
/* Citations                                                           */
/* ------------------------------------------------------------------ */

export type CitationStyle = "apa" | "mla" | "chicago" | "harvard";

export interface CitationInput {
  authors: string;
  title: string;
  container?: string;
  publisher?: string;
  year?: string;
  pages?: string;
  url?: string;
  accessed?: string;
}

interface Author {
  first: string;
  last: string;
}

/** "Jane Doe, John Smith" or "Doe, Jane; Smith, John" → structured authors. */
export function parseAuthors(input: string): Author[] {
  return input
    .split(/;|\band\b|&/)
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .flatMap((chunk) => chunk.split(/,(?=\s*[A-Z][a-z]+)/))
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk) => {
      if (chunk.includes(",")) {
        const [last, ...rest] = chunk.split(",");
        return { last: last.trim(), first: rest.join(" ").trim() };
      }
      const parts = chunk.split(/\s+/);
      const last = parts.pop() ?? chunk;
      return { first: parts.join(" "), last };
    });
}

function initials(first: string): string {
  return first
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => `${part[0].toUpperCase()}.`)
    .join(" ");
}

function apaAuthors(authors: Author[]): string {
  if (!authors.length) return "";
  const formatted = authors.map((author) => `${author.last}, ${initials(author.first)}`.trim().replace(/,$/, ""));
  if (formatted.length === 1) return formatted[0];
  if (formatted.length === 2) return `${formatted[0]}, & ${formatted[1]}`;
  return `${formatted.slice(0, -1).join(", ")}, & ${formatted[formatted.length - 1]}`;
}

function mlaAuthors(authors: Author[]): string {
  if (!authors.length) return "";
  if (authors.length === 1) return `${authors[0].last}, ${authors[0].first}`.replace(/,$/, "");
  if (authors.length === 2) return `${authors[0].last}, ${authors[0].first}, and ${authors[1].first} ${authors[1].last}`;
  return `${authors[0].last}, ${authors[0].first}, et al`;
}

function chicagoAuthors(authors: Author[]): string {
  if (!authors.length) return "";
  if (authors.length === 1) return `${authors[0].last}, ${authors[0].first}`.replace(/,$/, "");
  if (authors.length === 2) return `${authors[0].last}, ${authors[0].first}, and ${authors[1].first} ${authors[1].last}`;
  return `${authors[0].last}, ${authors[0].first}, et al.`;
}

function harvardAuthors(authors: Author[]): string {
  if (!authors.length) return "";
  const formatted = authors.map((author) => `${author.last}, ${initials(author.first)}`.trim().replace(/,$/, ""));
  if (formatted.length === 1) return formatted[0];
  if (formatted.length === 2) return `${formatted[0]} and ${formatted[1]}`;
  return `${formatted.slice(0, -1).join(", ")} and ${formatted[formatted.length - 1]}`;
}

export function formatCitation(input: CitationInput, style: CitationStyle): string {
  const authors = parseAuthors(input.authors);
  const title = input.title.trim();
  const container = input.container?.trim();
  const publisher = input.publisher?.trim();
  const year = input.year?.trim();
  const pages = input.pages?.trim();
  const url = input.url?.trim();
  const accessed = input.accessed?.trim();

  if (!title) return "";

  if (style === "mla") {
    const authorText = mlaAuthors(authors);
    const pieces = [authorText ? `${authorText}.` : "", `“${title}.”`];
    if (container) pieces.push(`${container},`);
    if (publisher) pieces.push(`${publisher},`);
    if (year) pieces.push(`${year}.`);
    if (pages) pieces.push(`pp. ${pages}.`);
    if (url) pieces.push(`${url}.`);
    if (accessed) pieces.push(`Accessed ${accessed}.`);
    return tidy(pieces.join(" "));
  }

  if (style === "chicago") {
    const authorText = chicagoAuthors(authors);
    const pieces = [authorText ? `${authorText}.` : "", `“${title}.”`];
    if (container) pieces.push(`${container}`);
    if (year) pieces.push(`(${year})`);
    if (pages) pieces.push(`: ${pages}`);
    if (publisher) pieces.push(`${publisher}.`);
    if (url) pieces.push(`${url}.`);
    return tidy(pieces.join(" "));
  }

  if (style === "harvard") {
    const pieces = [harvardAuthors(authors)];
    if (year) pieces.push(`(${year})`);
    pieces.push(`${title}.`);
    if (container) pieces.push(`${container},`);
    if (pages) pieces.push(`pp. ${pages}.`);
    if (publisher) pieces.push(`${publisher}.`);
    if (url) pieces.push(`Available at: ${url}`);
    if (accessed) pieces.push(`(Accessed: ${accessed}).`);
    return tidy(pieces.join(" "));
  }

  // APA 7
  const pieces = [apaAuthors(authors)];
  if (year) pieces.push(`(${year}).`);
  pieces.push(`${title}.`);
  if (container) pieces.push(`${container},`);
  if (pages) pieces.push(`${pages}.`);
  if (publisher && publisher !== container) pieces.push(`${publisher}.`);
  if (url) pieces.push(url);
  return tidy(pieces.join(" ").replace(/,\./g, "."));
}

export function formatBibliography(
  entries: CitationInput[],
  style: CitationStyle,
  sort: "author" | "title" | "year" = "author",
): string[] {
  const formatted = entries
    .map((entry) => ({ text: formatCitation(entry, style), entry }))
    .filter((item) => item.text);

  return formatted
    .sort((a, b) => {
      if (sort === "title") return a.entry.title.localeCompare(b.entry.title);
      if (sort === "year") return Number(a.entry.year ?? 0) - Number(b.entry.year ?? 0);
      const authorA = parseAuthors(a.entry.authors)[0]?.last ?? "";
      const authorB = parseAuthors(b.entry.authors)[0]?.last ?? "";
      return authorA.localeCompare(authorB) || a.text.localeCompare(b.text);
    })
    .map((item) => item.text);
}

function tidy(text: string): string {
  return text.replace(/\s+/g, " ").replace(/\s+([.,;])/g, "$1").replace(/\.\.+/g, ".").trim();
}
