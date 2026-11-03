"use client";

import { FormTool, num } from "@/components/tools/form-tool";
import { divisors, isPrime, nearbyPrimes, primeFactors } from "@/lib/math";

export default function PrimeNumberChecker() {
  return (
    <FormTool
      spec={{
        columns: 2,
        fields: [{ kind: "number", id: "n", label: "Number to test", value: "97", step: 1, min: 0 }],
        compute: (values) => {
          const raw = num(values, "n");
          if (!Number.isFinite(raw)) return { error: "Enter a whole number." };
          const n = Math.trunc(raw);
          if (n > Number.MAX_SAFE_INTEGER) return { error: "Keep the number below 9,007,199,254,740,991." };
          const prime = isPrime(n);
          const neighbours = nearbyPrimes(n, 2);
          const factors = primeFactors(n);
          const allDivisors = divisors(n);

          return {
            label: `${n.toLocaleString()} is`,
            value: prime ? "prime" : n < 2 ? "not prime" : "composite",
            sub: prime
              ? "It has no divisors other than 1 and itself."
              : n < 2
                ? "Primes start at 2; 0 and 1 are neither prime nor composite."
                : `It factors as ${factors.join(" × ")} and has ${allDivisors.length} divisors.`,
            stats: [
              { label: "Divisors", value: allDivisors.length.toLocaleString() },
              { label: "Prime factors", value: factors.length ? factors.join(" × ") : "—" },
              { label: "Next prime below", value: neighbours.below[0]?.toLocaleString() ?? "—" },
              { label: "Next prime above", value: neighbours.above[0]?.toLocaleString() ?? "—" },
            ],
            table: {
              head: ["Factorisation", "Divisors"],
              rows: [[factors.length ? factors.join(" × ") : "—", allDivisors.slice(0, 40).join(", ") + (allDivisors.length > 40 ? ", …" : "")]],
              caption: "Divisor detail",
            },
            note:
              "The check divides only by numbers up to √n, because any factor larger than that must pair with one smaller than it.",
          };
        },
        footnote:
          "Primality here is deterministic trial division, which handles everyday sizes quickly and exactly.",
      }}
    />
  );
}
