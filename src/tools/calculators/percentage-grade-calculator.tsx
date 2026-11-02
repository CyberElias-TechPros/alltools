"use client";

import { FormTool, num, str } from "@/components/tools/form-tool";
import { round } from "@/lib/utils";

const SCALE: Array<{ min: number; letter: string; gpa: number; note: string }> = [
  { min: 97, letter: "A+", gpa: 4.0, note: "exceptional" },
  { min: 93, letter: "A", gpa: 4.0, note: "excellent" },
  { min: 90, letter: "A−", gpa: 3.7, note: "excellent" },
  { min: 87, letter: "B+", gpa: 3.3, note: "very good" },
  { min: 83, letter: "B", gpa: 3.0, note: "good" },
  { min: 80, letter: "B−", gpa: 2.7, note: "good" },
  { min: 77, letter: "C+", gpa: 2.3, note: "satisfactory" },
  { min: 73, letter: "C", gpa: 2.0, note: "satisfactory" },
  { min: 70, letter: "C−", gpa: 1.7, note: "passing" },
  { min: 67, letter: "D+", gpa: 1.3, note: "weak pass" },
  { min: 63, letter: "D", gpa: 1.0, note: "weak pass" },
  { min: 60, letter: "D−", gpa: 0.7, note: "barely passing" },
  { min: 0, letter: "F", gpa: 0, note: "failing" },
];

export default function PercentageGradeCalculator() {
  return (
    <FormTool
      spec={{
        columns: 4,
        fields: [
          { kind: "number", id: "earned", label: "Marks earned", value: "84", min: 0, step: 0.5 },
          { kind: "number", id: "possible", label: "Marks possible", value: "100", min: 1, step: 0.5 },
          { kind: "number", id: "weight", label: "Weight in course", value: "35", unit: "%", min: 0, max: 100, step: 1, optional: true, hint: "Optional — to project a final grade" },
          { kind: "number", id: "currentGrade", label: "Current course grade", value: "", unit: "%", min: 0, max: 100, step: 0.1, optional: true, hint: "Everything else so far" },
        ],
        compute: (values) => {
          const earned = num(values, "earned");
          const possible = num(values, "possible");
          if (!Number.isFinite(earned) || !Number.isFinite(possible)) return { error: "Enter both marks." };
          if (possible <= 0) return { error: "Marks possible must be greater than zero." };
          if (earned < 0) return { error: "Marks earned cannot be negative." };
          const percentage = (earned / possible) * 100;
          const band = SCALE.find((entry) => percentage >= entry.min) ?? SCALE[SCALE.length - 1];

          const weight = num(values, "weight");
          const current = num(values, "currentGrade");
          const projected =
            Number.isFinite(weight) && Number.isFinite(current)
              ? current * (1 - weight / 100) + percentage * (weight / 100)
              : null;

          return {
            label: "Score",
            value: `${round(percentage, 2)}%`,
            sub: `${round(earned, 2)} out of ${round(possible, 2)} · letter grade ${band.letter} (${band.note}).`,
            stats: [
              { label: "Percentage", value: `${round(percentage, 2)}%` },
              { label: "Letter grade", value: band.letter },
              { label: "Grade points", value: band.gpa.toFixed(1) },
              { label: projected !== null ? "Projected course grade" : "Marks missed", value: projected !== null ? `${round(projected, 2)}%` : round(possible - earned, 2).toLocaleString() },
            ],
            table: {
              head: ["Grade", "Minimum %", "Grade points"],
              rows: SCALE.slice(0, 13).map((entry) => [entry.letter, `${entry.min}%`, entry.gpa.toFixed(1)]),
              caption: "Standard US letter-grade bands",
            },
            note:
              "Letter bands are conventions, not law: many schools use 90/80/70 for A/B/C and some round 89.5 up to an A. Check your syllabus for the cut-offs that apply to you.",
          };
        },
      }}
    />
  );
}
