"use client";

import { useMemo, useState } from "react";
import { Field, TextInput, ToolPanel } from "@/components/ui";
import { ModeCard, ModeHub, ModeResult } from "@/components/tools/mode-hub";
import { percentChange, percentOfWhat, percentageOf } from "@/lib/calc";
import { formatNumber, parseNumber } from "@/lib/utils";

/**
 * One page, three calculators. Each card is self-contained: its own inputs, its
 * own answer, its own formula — so a visitor with "what is 20% of 250" never has
 * to find a mode switch first.
 */
export default function PercentageCalculator() {
  const [ofPercent, setOfPercent] = useState("20");
  const [ofValue, setOfValue] = useState("250");

  const [part, setPart] = useState("30");
  const [whole, setWhole] = useState("120");

  const [from, setFrom] = useState("50");
  const [to, setTo] = useState("65");

  const ofResult = useMemo(() => {
    const x = parseNumber(ofPercent);
    const y = parseNumber(ofValue);
    if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
    const value = percentageOf(x, y);
    return {
      value: formatNumber(value, 6),
      detail: `${formatNumber(x, 6)} ÷ 100 × ${formatNumber(y, 6)} = ${formatNumber(value, 6)}`,
    };
  }, [ofPercent, ofValue]);

  const shareResult = useMemo(() => {
    const x = parseNumber(part);
    const y = parseNumber(whole);
    if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
    if (y === 0) return { error: "The whole cannot be zero." };
    const value = percentOfWhat(x, y);
    return {
      value: `${formatNumber(value, 4)}%`,
      detail: `${formatNumber(x, 6)} ÷ ${formatNumber(y, 6)} × 100 = ${formatNumber(value, 4)}%`,
    };
  }, [part, whole]);

  const changeResult = useMemo(() => {
    const x = parseNumber(from);
    const y = parseNumber(to);
    if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
    if (x === 0) return { error: "The starting value cannot be zero." };
    const value = percentChange(x, y);
    return {
      value: `${value > 0 ? "+" : ""}${formatNumber(value, 4)}%`,
      detail:
        value === 0
          ? "No change between the two values."
          : `${formatNumber(y, 6)} is ${formatNumber(Math.abs(value), 4)}% ${value > 0 ? "higher" : "lower"} than ${formatNumber(x, 6)}. Formula: (${formatNumber(y, 6)} − ${formatNumber(x, 6)}) ÷ ${formatNumber(Math.abs(x), 6)} × 100`,
    };
  }, [from, to]);

  return (
    <ToolPanel>
      <ModeHub
        intro="Percentages hide three different questions. Pick the card that matches yours — every card recalculates as you type."
        columns={2}
      >
        <ModeCard title="What is X% of Y?" hint="A percentage of a number." badge="Most used">
          <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-2">
            <Field label="Percent" htmlFor="pc-of-percent">
              <TextInput
                id="pc-of-percent"
                inputMode="decimal"
                value={ofPercent}
                onChange={(event) => setOfPercent(event.target.value)}
                placeholder="20"
              />
            </Field>
            <span className="pb-3 text-sm text-[var(--text-subtle)]">of</span>
            <Field label="Value" htmlFor="pc-of-value">
              <TextInput
                id="pc-of-value"
                inputMode="decimal"
                value={ofValue}
                onChange={(event) => setOfValue(event.target.value)}
                placeholder="250"
              />
            </Field>
          </div>
          <ModeResult
            label={`${ofPercent || "0"}% of ${ofValue || "0"}`}
            value={ofResult ? ofResult.value : "—"}
            detail={ofResult?.detail ?? "Enter both values."}
          />
        </ModeCard>

        <ModeCard title="X is what percent of Y?" hint="One number as a share of another.">
          <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-2">
            <Field label="Part" htmlFor="pc-share-part">
              <TextInput
                id="pc-share-part"
                inputMode="decimal"
                value={part}
                onChange={(event) => setPart(event.target.value)}
                placeholder="30"
              />
            </Field>
            <span className="pb-3 text-sm text-[var(--text-subtle)]">of</span>
            <Field label="Whole" htmlFor="pc-share-whole">
              <TextInput
                id="pc-share-whole"
                inputMode="decimal"
                value={whole}
                onChange={(event) => setWhole(event.target.value)}
                placeholder="120"
              />
            </Field>
          </div>
          <ModeResult
            label={`${part || "0"} as a percent of ${whole || "0"}`}
            value={shareResult && "value" in shareResult ? shareResult.value! : "—"}
            detail={shareResult && "detail" in shareResult ? shareResult.detail : undefined}
            error={shareResult && "error" in shareResult ? shareResult.error : undefined}
          />
        </ModeCard>

        <ModeCard
          title="Percentage change from X to Y"
          hint="Increase or decrease between two values."
          className="lg:col-span-2"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Starting value" htmlFor="pc-change-from">
              <TextInput
                id="pc-change-from"
                inputMode="decimal"
                value={from}
                onChange={(event) => setFrom(event.target.value)}
                placeholder="50"
              />
            </Field>
            <Field label="New value" htmlFor="pc-change-to">
              <TextInput
                id="pc-change-to"
                inputMode="decimal"
                value={to}
                onChange={(event) => setTo(event.target.value)}
                placeholder="65"
              />
            </Field>
          </div>
          <ModeResult
            label={changeResult && "value" in changeResult ? `Change from ${from || "0"} to ${to || "0"}` : "Change"}
            value={changeResult && "value" in changeResult ? changeResult.value! : "—"}
            detail={changeResult && "detail" in changeResult ? changeResult.detail : undefined}
            error={changeResult && "error" in changeResult ? changeResult.error : undefined}
          />
        </ModeCard>
      </ModeHub>

      <p className="mt-4 text-xs leading-relaxed text-[var(--text-subtle)]">
        Quick checks: 10% is one tenth · 25% is a quarter · 50% is half. A 20% increase followed
        by a 20% decrease leaves you 4% below where you started, because the second change is
        taken from the larger number.
      </p>
    </ToolPanel>
  );
}
