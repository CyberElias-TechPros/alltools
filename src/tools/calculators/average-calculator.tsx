"use client";

import { useMemo, useState } from "react";
import { CopyButton, Field, ResultCard, StatGrid, TextArea, ToolPanel } from "@/components/ui";
import { mean, median, mode } from "@/lib/calc";
import { formatNumber } from "@/lib/utils";

export default function AverageCalculator() {
  const [input, setInput] = useState("72, 85, 91, 68, 85");

  type AverageData =
    | { error: string; values: number[] }
    | {
        error?: undefined;
        values: number[];
        count: number;
        sum: number;
        mean: number;
        median: number;
        modes: number[];
        min: number;
        max: number;
        range: number;
      };

  const data: AverageData = useMemo(() => {
    const values = input
      .split(/[\s,;]+/)
      .map((token) => token.replace(/[^\d.-]/g, ""))
      .filter((token) => token !== "" && token !== "-" && token !== ".")
      .map(Number)
      .filter((value) => Number.isFinite(value));

    if (!values.length) return { values, error: "Enter at least one number." };
    const sorted = [...values].sort((a, b) => a - b);
    return {
      values,
      count: values.length,
      sum: values.reduce((total, value) => total + value, 0),
      mean: mean(values),
      median: median(values),
      modes: mode(values),
      min: sorted[0],
      max: sorted[sorted.length - 1],
      range: sorted[sorted.length - 1] - sorted[0],
    };
  }, [input]);

  const summary =
    data.error === undefined
      ? `n=${data.count} · mean ${formatNumber(data.mean, 4)} · median ${formatNumber(data.median, 4)} · mode ${data.modes.length ? data.modes.join(", ") : "none"} · range ${formatNumber(data.range, 4)}`
      : "";

  return (
    <ToolPanel>
      <Field
        label="Your numbers"
        htmlFor="avg-input"
        hint="Separate with commas, spaces or new lines. Currency symbols and thousand separators are ignored."
      >
        <TextArea
          id="avg-input"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="72, 85, 91, 68, 85"
          className="min-h-28 font-mono text-[0.9rem]"
          spellCheck={false}
        />
      </Field>

      <div className="mt-4">
        {"error" in data ? (
          <ResultCard label="Average" value="—" tone="neutral" sub={data.error} />
        ) : (
          <ResultCard
            label="Mean (average)"
            value={formatNumber(data.mean!, 6)}
            sub={`Median ${formatNumber(data.median!, 6)} · mode ${data.modes!.length ? data.modes!.join(", ") : "none"} · ${data.count} values`}
            actions={<CopyButton text={summary} />}
          >
            <StatGrid
              columns={4}
              items={[
                { label: "Sum", value: formatNumber(data.sum!, 6) },
                { label: "Count", value: formatNumber(data.count!) },
                { label: "Range", value: formatNumber(data.range!, 6) },
                { label: "Min → max", value: `${formatNumber(data.min!, 6)} → ${formatNumber(data.max!, 6)}` },
              ]}
            />
            {Math.abs(data.mean! - data.median!) > Math.abs(data.mean!) * 0.1 ? (
              <p className="mt-3 rounded-lg border border-amber-300/70 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100">
                The mean and median differ noticeably, which usually means the data is skewed by an
                outlier. The median may describe a typical value better.
              </p>
            ) : null}
          </ResultCard>
        )}
      </div>

      <div className="mt-3 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-3 text-xs leading-relaxed text-[var(--text-muted)]">
        <p>
          <strong className="text-[var(--text)]">Mean</strong> — the sum divided by the count: {""}
          {data.error === undefined
            ? `${formatNumber(data.sum, 4)} ÷ ${data.count} = ${formatNumber(data.mean, 4)}`
            : "—"}
        </p>
        <p className="mt-1">
          <strong className="text-[var(--text)]">Median</strong> — the middle value once sorted
          {data.error === undefined && data.count % 2 === 0 ? " (mean of the two middle values)" : ""}.
        </p>
        <p className="mt-1">
          <strong className="text-[var(--text)]">Mode</strong> — the most frequent value; a list
          with no repeats has no mode.
        </p>
      </div>
    </ToolPanel>
  );
}
