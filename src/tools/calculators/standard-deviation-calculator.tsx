"use client";

import { useMemo, useState } from "react";
import {
  CopyButton,
  Field,
  ResultCard,
  Segmented,
  SimpleTable,
  StatGrid,
  TextArea,
  ToolPanel,
} from "@/components/ui";
import { mean, standardDeviation, variance } from "@/lib/calc";
import { formatNumber } from "@/lib/utils";

export default function StandardDeviationCalculator() {
  const [input, setInput] = useState("72, 85, 91, 68, 85");
  const [kind, setKind] = useState<"sample" | "population">("population");

  const data = useMemo(() => {
    const values = input
      .split(/[\s,;]+/)
      .map((token) => Number(token.replace(/[^\d.-]/g, "")))
      .filter((value) => Number.isFinite(value));

    if (values.length < 2) return { values, error: "Enter at least two numbers." };
    const avg = mean(values);
    const sample = kind === "sample";
    return {
      values,
      count: values.length,
      mean: avg,
      variance: variance(values, sample),
      sd: standardDeviation(values, sample),
      squared: values.map((value) => ({ value, deviation: value - avg, squared: (value - avg) ** 2 })),
    };
  }, [input, kind]);

  const summary =
    "sd" in data
      ? `${kind} standard deviation = ${formatNumber(data.sd!, 4)} (variance ${formatNumber(data.variance!, 4)}, n=${data.count})`
      : "";

  return (
    <ToolPanel>
      <Field
        label="Your data"
        htmlFor="sd-input"
        hint="Commas, spaces or new lines. Negative numbers and decimals are supported."
      >
        <TextArea
          id="sd-input"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          className="min-h-24 font-mono text-[0.9rem]"
          spellCheck={false}
        />
      </Field>

      <div className="mt-3">
        <Segmented
          label="Data type"
          value={kind}
          onChange={setKind}
          options={[
            { value: "population", label: "Population (÷ n)" },
            { value: "sample", label: "Sample (÷ n − 1)" },
          ]}
        />
      </div>

      <div className="mt-4">
        {"error" in data ? (
          <ResultCard label="Standard deviation" value="—" tone="neutral" sub={data.error} />
        ) : (
          <ResultCard
            label={`${kind === "sample" ? "Sample" : "Population"} standard deviation`}
            value={formatNumber(data.sd!, 4)}
            sub={`Mean ${formatNumber(data.mean!, 4)} · variance ${formatNumber(data.variance!, 4)} · ${data.count} values`}
            actions={<CopyButton text={summary} />}
          >
            <StatGrid
              columns={3}
              items={[
                { label: "Mean (x̄)", value: formatNumber(data.mean!, 4) },
                { label: "Variance", value: formatNumber(data.variance!, 4) },
                { label: "n", value: formatNumber(data.count!) },
              ]}
            />
            <details className="mt-3 rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2">
              <summary className="cursor-pointer text-xs font-semibold text-[var(--text-muted)]">
                Show the step-by-step working
              </summary>
              <div className="mt-2">
                <SimpleTable
                  caption="Squared deviations"
                  head={["x", "x − x̄", "(x − x̄)²"]}
                  rows={data.squared!.map((row) => [
                    formatNumber(row.value, 4),
                    formatNumber(row.deviation, 4),
                    formatNumber(row.squared, 4),
                  ])}
                />
                <p className="mt-2 font-mono text-[0.72rem] text-[var(--text-subtle)]">
                  Σ(x − x̄)² = {formatNumber(data.squared!.reduce((sum, row) => sum + row.squared, 0), 4)} ÷{" "}
                  {kind === "sample" ? data.count! - 1 : data.count} then √
                </p>
              </div>
            </details>
          </ResultCard>
        )}
      </div>
    </ToolPanel>
  );
}
