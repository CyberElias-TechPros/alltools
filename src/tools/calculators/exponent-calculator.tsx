"use client";

import { FormTool, num } from "@/components/tools/form-tool";
import { formatNumber, toScientific } from "@/lib/math";

export default function ExponentCalculator() {
  return (
    <FormTool
      spec={{
        columns: 2,
        fields: [
          { kind: "number", id: "base", label: "Base", value: "2", step: "any" },
          { kind: "number", id: "exponent", label: "Exponent", value: "10", step: "any", hint: "Negative and fractional exponents are supported" },
        ],
        compute: (values) => {
          const base = num(values, "base");
          const exponent = num(values, "exponent");
          if (!Number.isFinite(base)) return { error: "Enter a numeric base." };
          if (!Number.isFinite(exponent)) return { error: "Enter a numeric exponent." };
          if (base === 0 && exponent < 0) return { error: "0 to a negative power is undefined." };

          const result = Math.pow(base, exponent);
          if (!Number.isFinite(result)) return { error: "The result is too large to represent accurately." };
          const scientific = toScientific(result, 6);

          return {
            label: "Result",
            value: formatNumber(result, 6),
            sub: `${base}^${exponent}${Number.isInteger(exponent) && Math.abs(exponent) <= 20 ? ` means ${Array.from({ length: Math.abs(exponent) }, () => formatNumber(base)).join(" × ") || "1"}` : ""}`,
            stats: [
              { label: "Scientific", value: scientific ? scientific.text : "not applicable" },
              { label: "Square root of result", value: result >= 0 ? formatNumber(Math.sqrt(result), 6) : "undefined" },
              { label: "Reciprocal", value: result === 0 ? "undefined" : formatNumber(1 / result, 8) },
              { label: "Log₁₀", value: result > 0 ? formatNumber(Math.log10(result), 6) : "undefined" },
            ],
            table: {
              head: ["Exponent", "Value"],
              rows: [-2, -1, 0, 1, 2, 3].map((power) => [
                power.toString(),
                formatNumber(Math.pow(base, power), 8),
              ]),
              caption: "Powers of the base",
            },
            note:
              "A negative exponent gives the reciprocal (2⁻³ = 1/8) and a fractional exponent gives a root (9^0.5 = 3).",
          };
        },
      }}
    />
  );
}
