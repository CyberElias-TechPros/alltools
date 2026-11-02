"use client";

import { FormTool, num, str } from "@/components/tools/form-tool";
import { gcd } from "@/lib/math";
import { round } from "@/lib/utils";

function parseRatio(input: string): number[] | null {
  const parts = input
    .split(/[:/,x×\s]+/i)
    .map((part) => part.trim())
    .filter(Boolean)
    .map(Number);
  if (parts.length < 2 || parts.some((value) => !Number.isFinite(value))) return null;
  return parts;
}

export default function RatioCalculator() {
  return (
    <FormTool
      spec={{
        columns: 3,
        fields: [
          { kind: "text", id: "ratio", label: "Ratio", value: "16:9", hint: "Use two or more parts, separated by : or /" },
          { kind: "number", id: "known", label: "Known value", value: "1920", min: 0, step: "any" },
          {
            kind: "select",
            id: "solve",
            label: "This value belongs to part",
            value: "1",
            options: [
              { value: "1", label: "First part" },
              { value: "2", label: "Second part" },
              { value: "3", label: "Third part (if any)" },
            ],
          },
        ],
        compute: (values) => {
          const ratio = parseRatio(str(values, "ratio"));
          const known = num(values, "known");
          const solveIndex = Number(str(values, "solve")) - 1;
          if (!ratio) return { error: "Write the ratio as two or more numbers, for example 16:9 or 2:3:5." };
          if (ratio.some((value) => value <= 0)) return { error: "Every part of the ratio must be greater than zero." };
          if (!Number.isFinite(known) || known <= 0) return { error: "Enter a known value greater than zero." };
          if (solveIndex >= ratio.length) return { error: "That part does not exist in this ratio." };

          const divisor = ratio.reduce((acc, value, index) => (index === 0 ? Math.trunc(value) : gcd(acc, Math.trunc(value))), 0) || 1;
          const simplified = ratio.map((value) => value / divisor);
          const unit = known / ratio[solveIndex];
          const scaled = ratio.map((value) => unit * value);
          const total = scaled.reduce((sum, value) => sum + value, 0);

          return {
            label: "Scaled values",
            value: scaled.map((value) => round(value, 4)).join(" : "),
            sub: `Each part is worth ${round(unit, 4)}. The total of all parts is ${round(total, 4)}.`,
            stats: [
              { label: "Simplified ratio", value: simplified.join(" : ") },
              { label: "One part equals", value: round(unit, 4).toLocaleString() },
              { label: "Total", value: round(total, 4).toLocaleString() },
              { label: "Parts", value: ratio.length.toString() },
            ],
            table: {
              head: ["Part", "Ratio", "Scaled value", "Share of total"],
              rows: ratio.map((value, index) => [
                `Part ${index + 1}`,
                value.toString(),
                round(scaled[index], 4).toLocaleString(),
                `${round((value / ratio.reduce((sum, item) => sum + item, 0)) * 100, 2)}%`,
              ]),
              caption: "Ratio breakdown",
            },
            note:
              "Scaling a ratio keeps the proportions fixed: divide by the part you know, then multiply the same unit by every part.",
          };
        },
        footnote:
          "Common use: resizing a 16:9 video from a known width, splitting a bill by weights, or scaling a recipe.",
      }}
    />
  );
}
