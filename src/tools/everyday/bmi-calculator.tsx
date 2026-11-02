"use client";

import { useMemo, useState } from "react";
import {
  Callout,
  CopyButton,
  Field,
  ResultCard,
  Segmented,
  StatGrid,
  TextInput,
  ToolPanel,
} from "@/components/ui";
import { bmiCategory, calculateBmi } from "@/lib/units";
import { formatNumber, parseNumber } from "@/lib/utils";

const CATEGORIES = [
  { range: "< 18.5", label: "Underweight" },
  { range: "18.5 – 24.9", label: "Healthy range" },
  { range: "25.0 – 29.9", label: "Overweight" },
  { range: "≥ 30.0", label: "Obese" },
];

export default function BmiCalculator() {
  const [units, setUnits] = useState<"metric" | "imperial">("metric");
  const [weight, setWeight] = useState("70");
  const [height, setHeight] = useState("175");
  const [feet, setFeet] = useState("5");
  const [inches, setInches] = useState("9");

  const data = useMemo(() => {
    let kg: number;
    let metres: number;

    if (units === "metric") {
      kg = parseNumber(weight);
      metres = parseNumber(height) / 100;
    } else {
      const lb = parseNumber(weight);
      kg = lb * 0.45359237;
      const totalInches = (parseNumber(feet) || 0) * 12 + (parseNumber(inches) || 0);
      metres = totalInches * 0.0254;
    }

    if (!Number.isFinite(kg) || kg <= 0 || !Number.isFinite(metres) || metres <= 0) return null;
    const bmi = calculateBmi(kg, metres);
    const healthyLow = 18.5 * metres * metres;
    const healthyHigh = 24.9 * metres * metres;
    return { bmi, kg, metres, category: bmiCategory(bmi), healthyLow, healthyHigh };
  }, [units, weight, height, feet, inches]);

  const toDisplayWeight = (kg: number) =>
    units === "metric" ? `${formatNumber(kg, 1)} kg` : `${formatNumber(kg / 0.45359237, 1)} lb`;

  return (
    <ToolPanel>
      <Segmented
        label="Units"
        value={units}
        onChange={setUnits}
        options={[
          { value: "metric", label: "Metric (kg, cm)" },
          { value: "imperial", label: "Imperial (lb, ft/in)" },
        ]}
      />

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Field label={units === "metric" ? "Weight (kg)" : "Weight (lb)"} htmlFor="bmi-weight">
          <TextInput id="bmi-weight" inputMode="decimal" value={weight} onChange={(event) => setWeight(event.target.value)} />
        </Field>
        {units === "metric" ? (
          <Field label="Height (cm)" htmlFor="bmi-height">
            <TextInput id="bmi-height" inputMode="decimal" value={height} onChange={(event) => setHeight(event.target.value)} />
          </Field>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <Field label="Height (ft)" htmlFor="bmi-feet">
              <TextInput id="bmi-feet" inputMode="numeric" value={feet} onChange={(event) => setFeet(event.target.value)} />
            </Field>
            <Field label="Height (in)" htmlFor="bmi-inches">
              <TextInput id="bmi-inches" inputMode="numeric" value={inches} onChange={(event) => setInches(event.target.value)} />
            </Field>
          </div>
        )}
      </div>

      <div className="mt-4">
        {data ? (
          <ResultCard
            label="Body mass index"
            value={formatNumber(data.bmi, 1)}
            sub={
              <span>
                <span className="font-semibold text-[var(--text)]">{data.category.label}</span> according to WHO
                categories
              </span>
            }
            actions={
              <CopyButton
                text={`BMI ${formatNumber(data.bmi, 1)} (${data.category.label}) · healthy weight range ${toDisplayWeight(data.healthyLow)} – ${toDisplayWeight(data.healthyHigh)}`}
              />
            }
          >
            <StatGrid
              columns={3}
              items={[
                { label: "Category", value: data.category.label },
                { label: "Healthy weight", value: `${toDisplayWeight(data.healthyLow)}–${toDisplayWeight(data.healthyHigh)}` },
                { label: "Height", value: `${formatNumber(data.metres, 2)} m` },
              ]}
            />
          </ResultCard>
        ) : (
          <ResultCard label="Body mass index" value="—" tone="neutral" sub="Enter a valid height and weight." />
        )}
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-4">
        {CATEGORIES.map((category) => (
          <div
            key={category.label}
            className={`rounded-lg border px-3 py-2 ${
              data?.category.label === category.label
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
          better than others. Athletes often read as overweight; pregnancy, fluid retention and
          some medical conditions make BMI unreliable. Speak to a qualified clinician about your
          health.
        </Callout>
      </div>
    </ToolPanel>
  );
}
