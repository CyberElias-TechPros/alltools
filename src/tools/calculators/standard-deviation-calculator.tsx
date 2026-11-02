"use client";

import { useMemo, useState } from "react";
import { CopyButton, Field, SimpleTable, TextArea, ToolPanel } from "@/components/ui";
import { ModeCard, ModeHub, ModeResult } from "@/components/tools/mode-hub";
import { mean, standardDeviation, variance } from "@/lib/calc";
import { formatNumber } from "@/lib/utils";

type Row = { value: number; deviation: number; squared: number };
type Stats =
  | { ok: false; error: string }
  | {
      ok: true;
      count: number;
      mean: number;
      sampleSd: number;
      sampleVariance: number;
      populationSd: number;
      populationVariance: number;
      squared: Row[];
    };

export default function StandardDeviationCalculator() {
  const [input, setInput] = useState("72, 85, 91, 68, 85");

  const data = useMemo(() => {
    const values = input
      .split(/[\s,;]+/)
      .map((token) => Number(token.replace(/[^\d.-]/g, "")))
      .filter((value) => Number.isFinite(value));

    if (values.length < 2) return { ok: false, error: "Enter at least two numbers." } as Stats;
    const avg = mean(values);
    return {
      ok: true,
      count: values.length,
      mean: avg,
      sampleSd: standardDeviation(values, true),
      sampleVariance: variance(values, true),
      populationSd: standardDeviation(values, false),
      populationVariance: variance(values, false),
      squared: values.map((value) => ({ value, deviation: value - avg, squared: (value - avg) ** 2 })),
    } as Stats;
  }, [input]);

  const error = data.ok ? "" : data.error;
  const sumSquares = data.ok ? data.squared.reduce((sum, row) => sum + row.squared, 0) : 0;

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

      <div className="mt-4">
        <ModeHub columns={2}>
          <ModeCard
            title="Population"
            hint="You have every value in the group. Divides by n."
            badge="÷ n"
          >
            <ModeResult
              label="Standard deviation (σ)"
              value={data.ok ? formatNumber(data.populationSd, 4) : "—"}
              detail={
                data.ok
                  ? `Variance ${formatNumber(data.populationVariance, 4)} · mean ${formatNumber(data.mean, 4)} · n = ${data.count}`
                  : undefined
              }
              error={error || undefined}
            />
            {data.ok ? (
              <div className="mt-2">
                <CopyButton
                  text={`Population standard deviation = ${formatNumber(data.populationSd, 4)} (variance ${formatNumber(data.populationVariance, 4)}, n=${data.count})`}
                  label="Copy result"
                />
              </div>
            ) : null}
          </ModeCard>

          <ModeCard
            title="Sample"
            hint="You have a subset of a larger group. Divides by n − 1."
            badge="÷ n − 1"
          >
            <ModeResult
              label="Standard deviation (s)"
              value={data.ok ? formatNumber(data.sampleSd, 4) : "—"}
              detail={
                data.ok
                  ? `Variance ${formatNumber(data.sampleVariance, 4)} · mean ${formatNumber(data.mean, 4)} · n = ${data.count}`
                  : undefined
              }
              error={error || undefined}
            />
            {data.ok ? (
              <div className="mt-2">
                <CopyButton
                  text={`Sample standard deviation = ${formatNumber(data.sampleSd, 4)} (variance ${formatNumber(data.sampleVariance, 4)}, n=${data.count})`}
                  label="Copy result"
                />
              </div>
            ) : null}
          </ModeCard>
        </ModeHub>
      </div>

      {data.ok ? (
        <details className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)]/45 px-3 py-2">
          <summary className="cursor-pointer text-xs font-semibold text-[var(--text-muted)]">
            Show the step-by-step working
          </summary>
          <div className="mt-2">
            <SimpleTable
              caption="Squared deviations"
              head={["x", "x − x̄", "(x − x̄)²"]}
              rows={data.squared.map((row) => [
                formatNumber(row.value, 4),
                formatNumber(row.deviation, 4),
                formatNumber(row.squared, 4),
              ])}
            />
            <p className="mt-2 font-mono text-[0.72rem] text-[var(--text-subtle)]">
              Σ(x − x̄)² = {formatNumber(sumSquares, 4)} → ÷ n ({data.count}) then √ for the
              population figure, ÷ n − 1 ({data.count - 1}) then √ for the sample figure.
            </p>
          </div>
        </details>
      ) : null}

      <p className="mt-3 text-xs leading-relaxed text-[var(--text-subtle)]">
        Both answers are shown because the choice depends on your data, not on this page: use the
        population formula when your numbers are the whole group, and the sample formula when they
        estimate a larger one. The sample value is always the larger of the two.
      </p>
    </ToolPanel>
  );
}
