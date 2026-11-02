"use client";

import { FormTool, num, str } from "@/components/tools/form-tool";
import { atLeastOne, binomialProbability, combinations, permutations } from "@/lib/math";
import { round } from "@/lib/utils";

export default function ProbabilityCalculator() {
  return (
    <FormTool
      spec={{
        columns: 3,
        fields: [
          {
            kind: "select",
            id: "mode",
            label: "What are you working out?",
            value: "two",
            options: [
              { value: "single", label: "Chance of A or B happening" },
              { value: "two", label: "Chance of A and B both happening" },
              { value: "least", label: "Chance across repeated tries" },
              { value: "binomial", label: "Exactly k successes in n tries" },
              { value: "combinatorics", label: "Combinations and permutations" },
            ],
          },
          { kind: "number", id: "p", label: "P(A)", value: "0.5", min: 0, max: 1, step: 0.01, hint: "As a decimal: 25% is 0.25" },
          { kind: "number", id: "q", label: "P(B)", value: "0.5", min: 0, max: 1, step: 0.01, optional: true },
          { kind: "number", id: "trials", label: "Trials (n)", value: "10", min: 1, step: 1, optional: true },
          { kind: "number", id: "successes", label: "Successes (k)", value: "3", min: 0, step: 1, optional: true },
        ],
        compute: (values) => {
          const p = num(values, "p");
          const q = num(values, "q", p);
          const trials = Math.trunc(num(values, "trials", 1));
          const successes = Math.trunc(num(values, "successes", 0));
          const mode = str(values, "mode");
          if (!Number.isFinite(p) || p < 0 || p > 1) return { error: "P(A) must be between 0 and 1." };
          if (mode !== "single" && (!Number.isFinite(q) || q < 0 || q > 1)) return { error: "P(B) must be between 0 and 1." };

          if (mode === "single") {
            const value = p + q - p * q;
            return {
              label: "P(A or B)",
              value: `${round(value * 100, 4)}%`,
              sub: "Use this when either event is enough — like a die showing 2 or an even number.",
              stats: [
                { label: "P(A only)", value: `${round((p - p * q) * 100, 4)}%` },
                { label: "P(B only)", value: `${round((q - p * q) * 100, 4)}%` },
                { label: "P(neither)", value: `${round((1 - value) * 100, 4)}%` },
              ],
              note: "If the events cannot both happen (mutually exclusive), simply add P(A) + P(B) instead.",
            };
          }

          if (mode === "two") {
            const value = p * q;
            return {
              label: "P(A and B)",
              value: `${round(value * 100, 4)}%`,
              sub: "Assumes the two events are independent — one does not change the other's odds.",
              stats: [
                { label: "P(A) × P(B)", value: `${round(value * 100, 4)}%` },
                { label: "P(A or B)", value: `${round((p + q - value) * 100, 4)}%` },
                { label: "Odds", value: `${round((1 - value) / value, 3)} : 1` },
              ],
              note: "If the events are linked (drawing two cards without replacement), multiply by the changed probability instead.",
            };
          }

          if (mode === "least") {
            if (!Number.isFinite(trials) || trials < 1) return { error: "Trials must be at least 1." };
            const value = atLeastOne(p, trials);
            return {
              label: "At least one success",
              value: `${round(value * 100, 4)}%`,
              sub: `P(A) = ${round(p * 100, 2)}% repeated ${trials} times.`,
              stats: [
                { label: "At least one", value: `${round(value * 100, 4)}%` },
                { label: "None", value: `${round(Math.pow(1 - p, trials) * 100, 6)}%` },
                { label: "Expected successes", value: round(p * trials, 3).toString() },
              ],
              note: "Work out the chance of never succeeding, (1 − p)^n, then subtract it from 1.",
            };
          }

          if (mode === "binomial") {
            if (successes > trials) return { error: "Successes cannot exceed trials." };
            const value = binomialProbability(successes, trials, p);
            return {
              label: `P(exactly ${successes} of ${trials})`,
              value: `${round(value * 100, 4)}%`,
              sub: `With a ${round(p * 100, 2)}% chance each time. Expected successes: ${round(trials * p, 2)}.`,
              stats: [
                { label: "Exactly k", value: `${round(value * 100, 4)}%` },
                { label: "At least k", value: `${round(Array.from({ length: trials - successes + 1 }, (_, index) => binomialProbability(successes + index, trials, p)).reduce((sum, item) => sum + item, 0) * 100, 4)}%` },
                { label: "Ways to choose", value: combinations(trials, successes).toString() },
              ],
              note: "This is the binomial formula: C(n,k)·p^k·(1−p)^(n−k).",
            };
          }

          const n = trials;
          const k = successes;
          if (k > n) return { error: "k cannot be larger than n." };
          return {
            label: "Combinations C(n,k)",
            value: combinations(n, k).toLocaleString(),
            sub: `Order does not matter. If order matters, there are ${permutations(n, k).toLocaleString()} permutations.`,
            stats: [
              { label: "Combinations", value: combinations(n, k).toLocaleString() },
              { label: "Permutations", value: permutations(n, k).toLocaleString() },
              { label: "n!", value: "see Factorial Calculator" },
            ],
            note: "Combinations count selections; permutations count arrangements of the same selection.",
          };
        },
      }}
    />
  );
}
