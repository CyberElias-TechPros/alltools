"use client";

import { FormTool, str } from "@/components/tools/form-tool";
import { gcdAll, lcmAll, parseNumberList, primeFactors } from "@/lib/math";

export default function LcmCalculator() {
  return (
    <FormTool
      spec={{
        columns: 2,
        fields: [
          {
            kind: "textarea",
            id: "numbers",
            label: "Numbers",
            value: "12, 18, 30",
            rows: 4,
            placeholder: "Separate with commas, spaces or lines",
            hint: "Two or more whole numbers",
          },
        ],
        compute: (values) => {
          const numbers = parseNumberList(str(values, "numbers"));
          if (numbers.length < 2) return { error: "Enter at least two whole numbers." };
          if (numbers.some((value) => !Number.isInteger(value) || value <= 0)) {
            return { error: "Use positive whole numbers only." };
          }
          if (numbers.some((value) => value > 1e9)) return { error: "Keep each number below one billion." };

          const lcmValue = lcmAll(numbers);
          const gcdValue = gcdAll(numbers);
          if (!Number.isFinite(lcmValue)) return { error: "The least common multiple is too large to display." };

          return {
            label: "Least common multiple",
            value: lcmValue.toLocaleString(),
            sub: `${numbers.join(", ")} all divide evenly into ${lcmValue.toLocaleString()}. The greatest common divisor is ${gcdValue.toLocaleString()}.`,
            stats: [
              { label: "LCM", value: lcmValue.toLocaleString() },
              { label: "GCD", value: gcdValue.toLocaleString() },
              { label: "Numbers", value: numbers.length.toString() },
              { label: "LCM ÷ GCD", value: (lcmValue / (gcdValue || 1)).toLocaleString() },
            ],
            table: {
              head: ["Number", "Prime factors", "LCM ÷ number"],
              rows: numbers.map((value) => [
                value.toLocaleString(),
                primeFactors(value).join(" × ") || "—",
                Math.round(lcmValue / value).toLocaleString(),
              ]),
              caption: "Prime factorisation",
            },
            note:
              "The LCM is built from the highest power of every prime that appears in any of the numbers. For 12 = 2²·3 and 18 = 2·3², that is 2²·3² = 36.",
          };
        },
        footnote:
          "LCM is what you need for adding fractions with different denominators; GCD is what you need to simplify them.",
      }}
    />
  );
}
