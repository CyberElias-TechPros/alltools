"use client";

import { useMemo, useState } from "react";
import { CopyButton, Field, ResultCard, Segmented, TextInput, ToolPanel } from "@/components/ui";
import { percentChange, percentOfWhat, percentageOf } from "@/lib/calc";
import { formatNumber, parseNumber, round } from "@/lib/utils";

type Mode = "of" | "is-what-percent" | "change";

export default function PercentageCalculator() {
  const [mode, setMode] = useState<Mode>("of");
  const [a, setA] = useState("20");
  const [b, setB] = useState("250");

  const result = useMemo(() => {
    const x = parseNumber(a);
    const y = parseNumber(b);
    if (!Number.isFinite(x) || !Number.isFinite(y)) return null;

    if (mode === "of") {
      const value = percentageOf(x, y);
      return {
        label: `${formatNumber(x, 4)}% of ${formatNumber(y, 6)}`,
        value: formatNumber(value, 6),
        sentence: `${formatNumber(x, 4)}% of ${formatNumber(y, 6)} is ${formatNumber(value, 6)}.`,
        working: `${formatNumber(x, 6)} ÷ 100 × ${formatNumber(y, 6)} = ${formatNumber(value, 6)}`,
      };
    }
    if (mode === "is-what-percent") {
      const value = percentOfWhat(x, y);
      if (!Number.isFinite(value)) return { error: "The whole cannot be zero." };
      return {
        label: `${formatNumber(x, 6)} as a percent of ${formatNumber(y, 6)}`,
        value: `${formatNumber(value, 4)}%`,
        sentence: `${formatNumber(x, 6)} is ${formatNumber(value, 4)}% of ${formatNumber(y, 6)}.`,
        working: `${formatNumber(x, 6)} ÷ ${formatNumber(y, 6)} × 100 = ${formatNumber(value, 4)}%`,
      };
    }
    const value = percentChange(x, y);
    if (!Number.isFinite(value)) return { error: "The starting value cannot be zero." };
    return {
      label: `Change from ${formatNumber(x, 6)} to ${formatNumber(y, 6)}`,
      value: `${value > 0 ? "+" : ""}${formatNumber(value, 4)}%`,
      sentence:
        value === 0
          ? "There is no change between the two values."
          : `${formatNumber(y, 6)} is ${formatNumber(Math.abs(value), 4)}% ${value > 0 ? "higher" : "lower"} than ${formatNumber(x, 6)}.`,
      working: `(${formatNumber(y, 6)} − ${formatNumber(x, 6)}) ÷ ${formatNumber(Math.abs(x), 6)} × 100 = ${formatNumber(value, 4)}%`,
    };
  }, [mode, a, b]);

  const labels =
    mode === "of"
      ? { a: "Percentage (%)", b: "Of value" }
      : mode === "is-what-percent"
        ? { a: "Part", b: "Whole" }
        : { a: "Starting value", b: "New value" };

  return (
    <ToolPanel>
      <Segmented
        label="Calculation type"
        value={mode}
        onChange={setMode}
        options={[
          { value: "of", label: "X% of Y" },
          { value: "is-what-percent", label: "X is what % of Y" },
          { value: "change", label: "Percent change" },
        ]}
      />

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Field label={labels.a} htmlFor="pc-a">
          <TextInput
            id="pc-a"
            inputMode="decimal"
            value={a}
            onChange={(event) => setA(event.target.value)}
            placeholder="20"
          />
        </Field>
        <Field label={labels.b} htmlFor="pc-b">
          <TextInput
            id="pc-b"
            inputMode="decimal"
            value={b}
            onChange={(event) => setB(event.target.value)}
            placeholder="250"
          />
        </Field>
      </div>

      <div className="mt-4">
        {"error" in (result ?? {}) && result && "error" in result ? (
          <ResultCard label="Cannot calculate" value="—" tone="neutral">
            <p className="text-sm text-[var(--text-muted)]">{result.error}</p>
          </ResultCard>
        ) : result ? (
          <ResultCard
            label={result.label!}
            value={result.value!}
            actions={<CopyButton text={`${result.value} — ${result.sentence}`} label="Copy" />}
            sub={result.sentence}
          >
            <p className="rounded-lg bg-[var(--surface)]/70 px-3 py-2 font-mono text-[0.78rem] text-[var(--text-muted)]">
              {result.working}
            </p>
          </ResultCard>
        ) : (
          <ResultCard label="Result" value="—" tone="neutral" sub="Enter both values to calculate." />
        )}
      </div>

      <p className="mt-3 text-xs text-[var(--text-subtle)]">
        Quick checks: {formatNumber(round(10, 2))}% is one tenth · 25% is a quarter · 50% is half.
        A 20% increase followed by a 20% decrease leaves you 4% below where you started.
      </p>
    </ToolPanel>
  );
}
