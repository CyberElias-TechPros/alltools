"use client";

import { useMemo, useState } from "react";
import { Callout, CopyButton, Field, TextInput, ToolPanel } from "@/components/ui";
import { ModeCard, ModeHub, ModeResult } from "@/components/tools/mode-hub";
import { bmiCategory, calculateBmi } from "@/lib/units";
import { formatNumber, parseNumber } from "@/lib/utils";

const CATEGORIES = [
  { range: "< 18.5", label: "Underweight" },
  { range: "18.5 – 24.9", label: "Healthy range" },
  { range: "25.0 – 29.9", label: "Overweight" },
  { range: "≥ 30.0", label: "Obese" },
];

function evaluate(kg: number, metres: number) {
  if (!Number.isFinite(kg) || kg <= 0 || !Number.isFinite(metres) || metres <= 0) return null;
  const bmi = calculateBmi(kg, metres);
  return {
    bmi,
    category: bmiCategory(bmi),
    healthyLow: 18.5 * metres * metres,
    healthyHigh: 24.9 * metres * metres,
    metres,
  };
}

export default function BmiCalculator() {
  const [weight, setWeight] = useState("70");
  const [height, setHeight] = useState("175");
  const [pounds, setPounds] = useState("154");
  const [feet, setFeet] = useState("5");
  const [inches, setInches] = useState("9");

  const metric = useMemo(() => evaluate(parseNumber(weight), parseNumber(height) / 100), [weight, height]);

  const imperial = useMemo(() => {
    const kg = parseNumber(pounds) * 0.45359237;
    const totalInches = (parseNumber(feet) || 0) * 12 + (parseNumber(inches) || 0);
    return evaluate(kg, totalInches * 0.0254);
  }, [pounds, feet, inches]);

  const active = metric ?? imperial;
  const copyMetric = metric
    ? `BMI ${formatNumber(metric.bmi, 1)} (${metric.category.label}) · healthy weight ${formatNumber(metric.healthyLow, 1)}–${formatNumber(metric.healthyHigh, 1)} kg`
    : "";
  const copyImperial = imperial
    ? `BMI ${formatNumber(imperial.bmi, 1)} (${imperial.category.label}) · healthy weight ${formatNumber(imperial.healthyLow / 0.45359237, 1)}–${formatNumber(imperial.healthyHigh / 0.45359237, 1)} lb`
    : "";

  return (
    <ToolPanel>
      <ModeHub columns={2}>
        <ModeCard title="Metric" hint="Kilograms and centimetres." badge="kg · cm">
          <div className="grid grid-cols-2 gap-2">
            <Field label="Weight (kg)" htmlFor="bmi-weight">
              <TextInput
                id="bmi-weight"
                inputMode="decimal"
                value={weight}
                onChange={(event) => setWeight(event.target.value)}
              />
            </Field>
            <Field label="Height (cm)" htmlFor="bmi-height">
              <TextInput
                id="bmi-height"
                inputMode="decimal"
                value={height}
                onChange={(event) => setHeight(event.target.value)}
              />
            </Field>
          </div>
          <ModeResult
            label="Body mass index"
            value={metric ? formatNumber(metric.bmi, 1) : "—"}
            detail={
              metric
                ? `${metric.category.label} · healthy weight ${formatNumber(metric.healthyLow, 1)}–${formatNumber(metric.healthyHigh, 1)} kg`
                : undefined
            }
            error={metric ? undefined : "Enter a valid height and weight."}
          />
          {metric ? (
            <div className="mt-2">
              <CopyButton text={copyMetric} label="Copy result" />
            </div>
          ) : null}
        </ModeCard>

        <ModeCard title="Imperial" hint="Pounds, feet and inches." badge="lb · ft/in">
          <div className="grid grid-cols-3 gap-2">
            <Field label="Weight (lb)" htmlFor="bmi-pounds">
              <TextInput
                id="bmi-pounds"
                inputMode="decimal"
                value={pounds}
                onChange={(event) => setPounds(event.target.value)}
              />
            </Field>
            <Field label="Height (ft)" htmlFor="bmi-feet">
              <TextInput
                id="bmi-feet"
                inputMode="numeric"
                value={feet}
                onChange={(event) => setFeet(event.target.value)}
              />
            </Field>
            <Field label="Height (in)" htmlFor="bmi-inches">
              <TextInput
                id="bmi-inches"
                inputMode="numeric"
                value={inches}
                onChange={(event) => setInches(event.target.value)}
              />
            </Field>
          </div>
          <ModeResult
            label="Body mass index"
            value={imperial ? formatNumber(imperial.bmi, 1) : "—"}
            detail={
              imperial
                ? `${imperial.category.label} · healthy weight ${formatNumber(imperial.healthyLow / 0.45359237, 1)}–${formatNumber(imperial.healthyHigh / 0.45359237, 1)} lb`
                : undefined
            }
            error={imperial ? undefined : "Enter a valid height and weight."}
          />
          {imperial ? (
            <div className="mt-2">
              <CopyButton text={copyImperial} label="Copy result" />
            </div>
          ) : null}
        </ModeCard>
      </ModeHub>

      <div className="mt-4 grid gap-2 sm:grid-cols-4">
        {CATEGORIES.map((category) => (
          <div
            key={category.label}
            className={`rounded-lg border px-3 py-2 ${
              active?.category.label === category.label
                ? "border-brand-400 bg-brand-50 dark:border-brand-500/50 dark:bg-brand-500/10"
                : "border-[var(--border)] bg-[var(--surface-muted)]"
            }`}
          >
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.06em] text-[var(--text-subtle)]">
              {category.range}
            </p>
            <p className="text-sm text-[var(--text)]">{category.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <Callout tone="warning" title="BMI is a screening tool, not a diagnosis">
          It cannot distinguish muscle from fat, and the standard cut-offs fit some populations
          better than others. Athletes often read as overweight; pregnancy, fluid retention and some
          medical conditions make BMI unreliable. Speak to a qualified clinician about your health.
        </Callout>
      </div>
    </ToolPanel>
  );
}
