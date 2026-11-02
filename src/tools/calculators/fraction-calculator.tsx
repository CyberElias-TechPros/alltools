"use client";

import { FormTool, str } from "@/components/tools/form-tool";
import { fractionOperation, fractionToString, mixedNumber, parseFraction } from "@/lib/math";
import { formatNumber } from "@/lib/utils";

export default function FractionCalculator() {
  return (
    <FormTool
      spec={{
        columns: 4,
        fields: [
          { kind: "text", id: "a", label: "First fraction", value: "3/4", mono: true, hint: "e.g. 3/4 or 1.5" },
          {
            kind: "select",
            id: "op",
            label: "Operation",
            value: "add",
            options: [
              { value: "add", label: "+ add" },
              { value: "subtract", label: "− subtract" },
              { value: "multiply", label: "× multiply" },
              { value: "divide", label: "÷ divide" },
            ],
          },
          { kind: "text", id: "b", label: "Second fraction", value: "5/6", mono: true, hint: "e.g. 5/6 or 0.75" },
        ],
        compute: (values) => {
          const a = parseFraction(str(values, "a"));
          const b = parseFraction(str(values, "b"));
          if (!a) return { error: "The first value is not a fraction. Try 3/4 or 0.75." };
          if (!b) return { error: "The second value is not a fraction. Try 5/6 or 0.75." };
          const op = str(values, "op") as "add" | "subtract" | "multiply" | "divide";
          const result = fractionOperation(a, b, op);
          if (!result) return { error: "That operation is undefined — you cannot divide by zero." };
          const decimal = result.numerator / result.denominator;

          return {
            label: "Answer",
            value: fractionToString(result),
            sub: `${mixedNumber(result)} as a mixed number · ${formatNumber(decimal, 8)} as a decimal`,
            stats: [
              { label: "Fraction", value: fractionToString(result) },
              { label: "Mixed number", value: mixedNumber(result) },
              { label: "Decimal", value: formatNumber(decimal, 8) },
              { label: "Percentage", value: `${formatNumber(decimal * 100, 6)}%` },
            ],
            table: {
              head: ["Input", "Fraction", "Decimal"],
              rows: [
                ["First", fractionToString(a), formatNumber(a.numerator / a.denominator, 8)],
                ["Second", fractionToString(b), formatNumber(b.numerator / b.denominator, 8)],
                ["Result", fractionToString(result), formatNumber(decimal, 8)],
              ],
              caption: "Working values",
            },
            note:
              "Fractions are reduced to lowest terms by dividing both parts by their greatest common divisor, so 8/12 becomes 2/3.",
          };
        },
        footnote: "Decimals are converted to the simplest fraction that matches them within 1/10,000.",
      }}
    />
  );
}
