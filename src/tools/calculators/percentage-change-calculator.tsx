"use client";

import { useMemo, useState } from "react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { CopyButton, Field, ResultCard, StatGrid, TextInput, ToolPanel } from "@/components/ui";
import { percentChange } from "@/lib/calc";
import { formatNumber, parseNumber } from "@/lib/utils";

export default function PercentageChangeCalculator() {
  const [oldValue, setOldValue] = useState("4800");
  const [newValue, setNewValue] = useState("6240");

  const data = useMemo(() => {
    const oldV = parseNumber(oldValue);
    const newV = parseNumber(newValue);
    if (!Number.isFinite(oldV) || !Number.isFinite(newV)) return null;
    const change = percentChange(oldV, newV);
    if (!Number.isFinite(change)) return { error: "The starting value must not be zero." };
    const absolute = newV - oldV;
    const multiplier = oldV !== 0 ? newV / oldV : Number.NaN;
    return { change, absolute, multiplier, oldV, newV };
  }, [oldValue, newValue]);

  return (
    <ToolPanel>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Starting value" htmlFor="pcc-old">
          <TextInput
            id="pcc-old"
            inputMode="decimal"
            value={oldValue}
            onChange={(event) => setOldValue(event.target.value)}
          />
        </Field>
        <Field label="New value" htmlFor="pcc-new">
          <TextInput
            id="pcc-new"
            inputMode="decimal"
            value={newValue}
            onChange={(event) => setNewValue(event.target.value)}
          />
        </Field>
      </div>

      <div className="mt-4">
        {data && "error" in data ? (
          <ResultCard label="Cannot calculate" value="—" tone="neutral" sub={data.error} />
        ) : data ? (
          <ResultCard
            label="Percentage change"
            value={`${data.change > 0 ? "+" : ""}${formatNumber(data.change, 4)}%`}
            sub={
              <span className="flex items-center gap-1.5">
                {data.change > 0 ? (
                  <ArrowUpRight className="size-4 text-emerald-600 dark:text-emerald-400" aria-hidden />
                ) : data.change < 0 ? (
                  <ArrowDownRight className="size-4 text-rose-600 dark:text-rose-400" aria-hidden />
                ) : (
                  <Minus className="size-4" aria-hidden />
                )}
                {data.change > 0
                  ? "Increase"
                  : data.change < 0
                    ? "Decrease"
                    : "No change"}{" "}
                from {formatNumber(data.oldV, 4)} to {formatNumber(data.newV, 4)}
              </span>
            }
            actions={
              <CopyButton
                text={`${formatNumber(data.change, 4)}% change (${data.absolute > 0 ? "+" : ""}${formatNumber(data.absolute, 4)})`}
              />
            }
          >
            <StatGrid
              columns={3}
              items={[
                { label: "Absolute change", value: `${data.absolute > 0 ? "+" : ""}${formatNumber(data.absolute, 4)}` },
                { label: "Multiplier", value: `×${formatNumber(data.multiplier, 4)}` },
                { label: "Direction", value: data.change > 0 ? "Increase" : data.change < 0 ? "Decrease" : "Flat" },
              ]}
            />
            <p className="mt-3 font-mono text-[0.78rem] text-[var(--text-muted)]">
              ({formatNumber(data.newV, 6)} − {formatNumber(data.oldV, 6)}) ÷ |{formatNumber(data.oldV, 6)}| × 100 ={" "}
              {formatNumber(data.change, 4)}%
            </p>
          </ResultCard>
        ) : (
          <ResultCard label="Percentage change" value="—" tone="neutral" sub="Enter both values." />
        )}
      </div>

      <p className="mt-3 text-xs text-[var(--text-subtle)]">
        Percentage change is asymmetric: a 50% fall needs a 100% rise to recover.
      </p>
    </ToolPanel>
  );
}
