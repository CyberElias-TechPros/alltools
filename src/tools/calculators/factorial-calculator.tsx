"use client";

import { FormTool, num } from "@/components/tools/form-tool";
import { factorial } from "@/lib/math";

export default function FactorialCalculator() {
  return (
    <FormTool
      spec={{
        columns: 2,
        fields: [{ kind: "number", id: "n", label: "n", value: "20", step: 1, min: 0, max: 5000 }],
        compute: (values) => {
          const n = Math.trunc(num(values, "n"));
          if (!Number.isFinite(n) || n < 0) return { error: "Factorial is defined for whole numbers of zero or more." };
          if (n > 5000) return { error: "Keep n at 5000 or below — the result has more than 16,000 digits." };

          let exact: bigint;
          try {
            exact = factorial(n);
          } catch {
            return { error: "That value is out of range." };
          }
          const digits = exact.toString();
          const text = digits.length > 1200 ? `${digits.slice(0, 600)}…${digits.slice(-300)}` : digits;
          const trailingZeros = digits.length - digits.replace(/0+$/, "").length;
          const log10 = n <= 1 ? 0 : Math.log10(digits.length ? Number(digits.slice(0, 15)) : 1) + (digits.length - 15);

          return {
            label: `${n}!`,
            value: digits.length > 60 ? `${digits.slice(0, 20)}… (${digits.length} digits)` : digits,
            sub: `${n} × ${n - 1} × … × 2 × 1. Calculated exactly with whole-number arithmetic, so no rounding error creeps in.`,
            stats: [
              { label: "Digits", value: digits.length.toLocaleString() },
              { label: "Trailing zeros", value: trailingZeros.toLocaleString() },
              { label: "Magnitude", value: `10^${Math.floor(log10)}` },
              { label: "n − 1 factorial", value: n === 0 ? "not defined" : n === 1 ? "1" : `${digits.length > 12 ? "…" : ""}${(exact / BigInt(n)).toString().slice(0, 24)}` },
            ],
            output: digits.length > 1200 ? { label: "Exact value (truncated)", text, downloadName: `factorial-${n}.txt` } : { label: "Exact value", text: digits, downloadName: `factorial-${n}.txt` },
            note:
              "Trailing zeros come from factors of 10, i.e. pairs of 2s and 5s: there are always more 2s, so the count of 5s decides.",
          };
        },
      }}
    />
  );
}
