"use client";

import { FormTool, str } from "@/components/tools/form-tool";
import { divisors, gcdAll, lcmAll, parseNumberList, primeFactors } from "@/lib/math";

export default function GcdCalculator() {
  return (
    <FormTool
      spec={{
        columns: 2,
        fields: [
          {
            kind: "textarea",
            id: "numbers",
            label: "Numbers",
            value: "84, 126, 210",
            rows: 4,
            placeholder: "Separate with commas, spaces or lines",
            hint: "Two or more whole numbers",
          },
        ],
        compute: (values) => {
          const numbers = parseNumberList(str(values, "numbers"));
          if (numbers.length < 2) return { error: "Enter at least two whole numbers." };
          if (numbers.some((value) => !Number.isInteger(value))) return { error: "Use whole numbers only." };
          if (numbers.some((value) => value === 0)) return { error: "The GCD of zero is not useful here — leave zeros out." };

          const gcdValue = Math.abs(gcdAll(numbers));
          const shared = divisors(gcdValue);
          const coprime = gcdValue === 1;

          return {
            label: "Greatest common divisor",
            value: gcdValue.toLocaleString(),
            sub: coprime
              ? "These numbers share no factor above 1 — they are coprime."
              : `Every number divides by ${gcdValue.toLocaleString()}. The least common multiple is ${lcmAll(numbers.map(Math.abs)).toLocaleString()}.`,
            stats: [
              { label: "GCD", value: gcdValue.toLocaleString() },
              { label: "LCM", value: lcmAll(numbers.map(Math.abs)).toLocaleString() },
              { label: "Shared factors", value: shared.length.toString() },
              { label: "Coprime", value: coprime ? "yes" : "no" },
            ],
            table: {
              head: ["Number", "Prime factors", "Divided by GCD"],
              rows: numbers.map((value) => [
                value.toLocaleString(),
                primeFactors(value).join(" × ") || "—",
                (value / (gcdValue || 1)).toLocaleString(),
              ]),
              caption: "Factor breakdown",
            },
            note:
              "Euclid's algorithm repeats \"remainder of a ÷ b\" until the remainder is zero; the last non-zero remainder is the GCD.",
          };
        },
      }}
    />
  );
}
