"use client";

import { FormTool, num } from "@/components/tools/form-tool";
import { simplifyRadical } from "@/lib/math";
import { formatNumber } from "@/lib/utils";

function radicalText(n: number): string {
  const simplified = simplifyRadical(n);
  if (!simplified) return "—";
  if (simplified.inside === 1) return simplified.outside.toString();
  return `${simplified.outside}√${simplified.inside}`;
}

export default function SquareRootCalculator() {
  return (
    <FormTool
      spec={{
        columns: 2,
        fields: [{ kind: "number", id: "n", label: "Number", value: "72", step: "any", min: 0 }],
        compute: (values) => {
          const n = num(values, "n");
          if (!Number.isFinite(n)) return { error: "Enter a number." };
          if (n < 0) return { error: "Real square roots exist only for numbers of zero or more. √(−n) is imaginary." };

          const root = Math.sqrt(n);
          const exact = Number.isInteger(root);
          const cube = Math.cbrt(n);
          const fourth = Math.pow(n, 0.25);

          return {
            label: "Square root",
            value: formatNumber(root, 10),
            sub: exact
              ? `${n} is a perfect square — the root is exactly ${root}.`
              : `${n} is not a perfect square; √${n} is irrational and continues forever.`,
            stats: [
              { label: "Exact form", value: radicalText(n) },
              { label: "Rounded (3 dp)", value: root.toFixed(3) },
              { label: "Cube root", value: formatNumber(cube, 8) },
              { label: "Fourth root", value: formatNumber(fourth, 8) },
              { label: "Squared back", value: formatNumber(root * root, 8) },
              { label: "Nearest integer", value: Math.round(root).toString() },
            ],
            table: {
              head: ["Power", "Value"],
              rows: [
                ["n²", formatNumber(n * n, 6)],
                ["√n", formatNumber(root, 10)],
                ["n ÷ √n", root === 0 ? "undefined" : formatNumber(n / root, 8)],
                ["1 ÷ √n", root === 0 ? "undefined" : formatNumber(1 / root, 8)],
              ],
              caption: "Related values",
            },
            note:
              "The exact form pulls perfect-square factors out of the radical: √72 = 6√2, and 6√2 ≈ 8.485.",
          };
        },
      }}
    />
  );
}
