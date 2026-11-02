"use client";

import { useMemo, useState } from "react";
import { ArrowUpDown } from "lucide-react";
import {
  Button,
  CopyButton,
  Field,
  Segmented,
  SimpleTable,
  TextInput,
  ToolPanel,
} from "@/components/ui";
import { convertTemperature, type TemperatureScale } from "@/lib/units";
import { formatNumber, parseNumber } from "@/lib/utils";

const SCALES: Array<{ id: TemperatureScale; label: string; short: string; limit?: number }> = [
  { id: "celsius", label: "Celsius", short: "°C", limit: -273.15 },
  { id: "fahrenheit", label: "Fahrenheit", short: "°F", limit: -459.67 },
  { id: "kelvin", label: "Kelvin", short: "K", limit: 0 },
  { id: "rankine", label: "Rankine", short: "°R", limit: 0 },
];

const REFERENCES = [
  { label: "Absolute zero", c: -273.15 },
  { label: "Water freezes", c: 0 },
  { label: "Room temperature", c: 20 },
  { label: "Body temperature", c: 37 },
  { label: "Water boils", c: 100 },
];

export default function TemperatureConverter() {
  const [value, setValue] = useState("37");
  const [scale, setScale] = useState<TemperatureScale>("celsius");

  const numeric = parseNumber(value);
  const limit = SCALES.find((item) => item.id === scale)!.limit ?? -Infinity;
  const belowAbsoluteZero = Number.isFinite(numeric) && numeric < limit;
  const results = useMemo(
    () => (Number.isFinite(numeric) && !belowAbsoluteZero ? convertTemperature(numeric, scale) : null),
    [numeric, scale, belowAbsoluteZero],
  );

  return (
    <ToolPanel>
      <div className="grid gap-3 sm:grid-cols-[1fr_1.4fr] sm:items-end">
        <Field label="Temperature" htmlFor="temp-value">
          <TextInput
            id="temp-value"
            inputMode="decimal"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            aria-invalid={belowAbsoluteZero || undefined}
          />
        </Field>
        <div>
          <span className="label">Scale</span>
          <Segmented
            label="Temperature scale"
            value={scale}
            onChange={setScale}
            options={SCALES.map((item) => ({ value: item.id, label: `${item.short} ${item.label}` }))}
          />
        </div>
      </div>

      <div className="mt-4" aria-live="polite">
        {belowAbsoluteZero ? (
          <p className="rounded-xl border border-rose-300/70 bg-rose-50 px-4 py-3 text-sm text-rose-900 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
            That value is below absolute zero, which is not physically possible. The minimum on the{" "}
            {SCALES.find((item) => item.id === scale)!.label} scale is{" "}
            {formatNumber(limit, 2)} {SCALES.find((item) => item.id === scale)!.short}.
          </p>
        ) : results ? (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {SCALES.map((item) => {
              const converted = results[item.id];
              const active = item.id === scale;
              return (
                <div
                  key={item.id}
                  className={`rounded-xl border p-3 ${
                    active
                      ? "border-brand-300 bg-brand-50/70 dark:border-brand-700 dark:bg-brand-500/10"
                      : "border-[var(--border)] bg-[var(--surface-muted)]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[0.68rem] font-bold uppercase tracking-[0.08em] text-[var(--text-subtle)]">
                      {item.label}
                    </span>
                    <CopyButton text={`${formatNumber(converted, 4)} ${item.short}`} label="" />
                  </div>
                  <p className="mt-1 font-mono text-xl font-semibold text-[var(--text)]">
                    {formatNumber(converted, 4)}{" "}
                    <span className="text-sm font-medium text-[var(--text-muted)]">{item.short}</span>
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3 text-sm text-[var(--text-muted)]">
            Enter a temperature to convert it.
          </p>
        )}
      </div>

      {results ? (
        <p className="mt-3 rounded-lg border border-[var(--border)] bg-[var(--code-bg)] px-3 py-2 font-mono text-[0.75rem] text-[var(--text-muted)]">
          {scale === "fahrenheit"
            ? `(${formatNumber(numeric, 4)} − 32) × 5/9 = ${formatNumber(results.celsius, 4)} °C`
            : scale === "kelvin"
              ? `${formatNumber(numeric, 4)} − 273.15 = ${formatNumber(results.celsius, 4)} °C`
              : scale === "rankine"
                ? `(${formatNumber(numeric, 4)} − 491.67) × 5/9 = ${formatNumber(results.celsius, 4)} °C`
                : `${formatNumber(numeric, 4)} × 9/5 + 32 = ${formatNumber(results.fahrenheit, 4)} °F`}
        </p>
      ) : null}

      <div className="mt-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-[0.72rem] font-bold uppercase tracking-[0.09em] text-[var(--text-subtle)]">
            Reference points
          </h3>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              const index = REFERENCES.findIndex((item) => item.label === "Body temperature");
              setValue(String(REFERENCES[index].c));
              setScale("celsius");
            }}
          >
            <ArrowUpDown className="size-3.5" aria-hidden /> Try body temp
          </Button>
        </div>
        <SimpleTable
          caption="Reference temperatures"
          head={["Reference", "°C", "°F", "K"]}
          rows={REFERENCES.map((item) => {
            const converted = convertTemperature(item.c, "celsius");
            return [
              item.label,
              formatNumber(item.c, 2),
              formatNumber(converted.fahrenheit, 2),
              formatNumber(converted.kelvin, 2),
            ];
          })}
        />
      </div>
    </ToolPanel>
  );
}
