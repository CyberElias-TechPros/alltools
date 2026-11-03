import { round } from "./utils";

/* ------------------------------- percentages ------------------------------ */

export type PercentageMode = "of" | "is-what-percent" | "change" | "increase" | "decrease";

export function percentageOf(percent: number, value: number): number {
  return round((percent / 100) * value, 6);
}

export function percentOfWhat(part: number, whole: number): number {
  if (whole === 0) return Number.NaN;
  return round((part / whole) * 100, 6);
}

export function percentChange(oldValue: number, newValue: number): number {
  if (oldValue === 0) return Number.NaN;
  return round(((newValue - oldValue) / Math.abs(oldValue)) * 100, 6);
}

/* ------------------------------- statistics ------------------------------ */

export function mean(values: number[]): number {
  if (!values.length) return Number.NaN;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function median(values: number[]): number {
  if (!values.length) return Number.NaN;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[middle - 1] + sorted[middle]) / 2 : sorted[middle];
}

export function mode(values: number[]): number[] {
  if (!values.length) return [];
  const counts = new Map<number, number>();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  const max = Math.max(...counts.values());
  if (max === 1) return [];
  return [...counts.entries()]
    .filter(([, count]) => count === max)
    .map(([value]) => value)
    .sort((a, b) => a - b);
}

export function variance(values: number[], sample = false): number {
  if (values.length < (sample ? 2 : 1)) return Number.NaN;
  const avg = mean(values);
  const sumSquares = values.reduce((sum, value) => sum + (value - avg) ** 2, 0);
  return sumSquares / (values.length - (sample ? 1 : 0));
}

export function standardDeviation(values: number[], sample = false): number {
  return Math.sqrt(variance(values, sample));
}

/* ---------------------------------- dates -------------------------------- */

const MS_PER_DAY = 86_400_000;

export interface CalendarAge {
  years: number;
  months: number;
  days: number;
  totalDays: number;
  totalMonths: number;
  totalHours: number;
  nextBirthday: string | null;
  daysToNextBirthday: number | null;
  bornOn: string | null;
}

export function calendarAge(birth: Date, at: Date): CalendarAge | null {
  if (birth.getTime() > at.getTime()) return null;

  let years = at.getUTCFullYear() - birth.getUTCFullYear();
  let months = at.getUTCMonth() - birth.getUTCMonth();
  let days = at.getUTCDate() - birth.getUTCDate();

  if (days < 0) {
    months -= 1;
    const previousMonth = new Date(Date.UTC(at.getUTCFullYear(), at.getUTCMonth(), 0));
    days += previousMonth.getUTCDate();
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  const totalDays = Math.floor((at.getTime() - birth.getTime()) / MS_PER_DAY);

  // Next birthday, handling 29 February in non-leap years.
  let nextYear = at.getUTCFullYear();
  const isLeap = (year: number) => (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  const birthdayMonth = birth.getUTCMonth();
  let birthdayDay = birth.getUTCDate();
  if (birthdayMonth === 1 && birthdayDay === 29 && !isLeap(nextYear)) birthdayDay = 1;

  let next = new Date(Date.UTC(nextYear, birthdayMonth, birthdayDay));
  if (next.getTime() < at.getTime()) {
    nextYear += 1;
    const day = birthdayMonth === 1 && birth.getUTCDate() === 29 && !isLeap(nextYear) ? 1 : birth.getUTCDate();
    next = new Date(Date.UTC(nextYear, birthdayMonth, day));
  }

  const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  return {
    years,
    months,
    days,
    totalDays,
    totalMonths: years * 12 + months,
    totalHours: totalDays * 24,
    nextBirthday: next.toISOString().slice(0, 10),
    daysToNextBirthday: Math.round((next.getTime() - at.getTime()) / MS_PER_DAY),
    bornOn: weekdays[birth.getUTCDay()] ?? null,
  };
}

export function daysBetween(start: Date, end: Date, inclusive = false): number {
  const diff = Math.round((end.getTime() - start.getTime()) / MS_PER_DAY);
  return inclusive ? diff + 1 : diff;
}

export function businessDaysBetween(start: Date, end: Date): number {
  const from = start.getTime() <= end.getTime() ? start : end;
  const to = start.getTime() <= end.getTime() ? end : start;
  let count = 0;
  const cursor = new Date(from.getTime());
  // Inclusive of both endpoints: a Mon–Fri project week counts as five days.
  while (cursor.getTime() <= to.getTime()) {
    const day = cursor.getUTCDay();
    if (day !== 0 && day !== 6) count++;
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return count;
}

/* ---------------------------------- grades -------------------------------- */

export const GRADE_POINTS: Record<string, number> = {
  "A+": 4.0, A: 4.0, "A-": 3.7,
  "B+": 3.3, B: 3.0, "B-": 2.7,
  "C+": 2.3, C: 2.0, "C-": 1.7,
  "D+": 1.3, D: 1.0, "D-": 0.7,
  F: 0,
};

export interface Course {
  id: string;
  name: string;
  credits: number;
  grade: string;
}

export function calculateGpa(courses: Course[]): { gpa: number; credits: number; points: number } {
  let points = 0;
  let credits = 0;
  for (const course of courses) {
    const gradePoint = GRADE_POINTS[course.grade];
    if (gradePoint === undefined || !Number.isFinite(course.credits) || course.credits <= 0) continue;
    points += gradePoint * course.credits;
    credits += course.credits;
  }
  return { gpa: credits > 0 ? points / credits : Number.NaN, credits, points };
}
