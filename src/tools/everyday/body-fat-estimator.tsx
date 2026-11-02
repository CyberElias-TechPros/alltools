"use client";

import { useMemo, useState } from "react";
import { Callout, Field, ResultCard, Segmented, SimpleTable, StatGrid, TextInput, ToolPanel } from "@/components/ui";
import { bodyFat, type Sex } from "@/lib/everyday";

export default function BodyFatEstimator() {
  const [sex, setSex] = useState<Sex>("male");
  const [heightCm, setHeightCm] = useState("178");
  const [neckCm, setNeckCm] = useState("38");
  const [waistCm, setWaistCm] = useState("84");
  const [hipCm, setHipCm] = useState("98");
  const [weightKg, setWeightKg] = useState("78");

  const result = useMemo(
    () => bodyFat({ sex, heightCm: Number(heightCm), neckCm: Number(neckCm), waistCm: Number(waistCm), hipCm: Number(hipCm), weightKg: Number(weightKg) }),
    [sex, heightCm, neckCm, waistCm, hipCm, weightKg],
  );

  return (
    <ToolPanel>
      <Callout tone="warning">
        A tape-measure estimate with a ±3–5 percentage-point error, not a DEXA scan. Body fat is one number among many;
        it says nothing about health on its own.
      </Callout>

      <div className="mt-5">
        <Segmented
          label="Equation"
          value={sex}
          onChange={setSex}
          options={[
            { value: "male", label: "Male" },
            { value: "female", label: "Female" },
          ]}
        />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="Height (cm)" htmlFor="bf-height">
          <TextInput id="bf-height" type="number" min={120} max={230} value={heightCm} onChange={(event) => setHeightCm(event.target.value)} className="font-mono" />
        </Field>
        <Field label="Neck circumference (cm)" htmlFor="bf-neck" hint="Below the larynx, tape level.">
          <TextInput id="bf-neck" type="number" min={20} max={60} value={neckCm} onChange={(event) => setNeckCm(event.target.value)} className="font-mono" />
        </Field>
        <Field label="Waist (cm)" htmlFor="bf-waist" hint="At the navel for men; narrowest point for women.">
          <TextInput id="bf-waist" type="number" min={40} max={200} value={waistCm} onChange={(event) => setWaistCm(event.target.value)} className="font-mono" />
        </Field>
        {sex === "female" ? (
          <Field label="Hip circumference (cm)" htmlFor="bf-hip" hint="Widest point.">
            <TextInput id="bf-hip" type="number" min={60} max={200} value={hipCm} onChange={(event) => setHipCm(event.target.value)} className="font-mono" />
          </Field>
        ) : null}
        <Field label="Weight (kg)" htmlFor="bf-weight" hint="Optional, for fat and lean mass.">
          <TextInput id="bf-weight" type="number" min={30} max={300} value={weightKg} onChange={(event) => setWeightKg(event.target.value)} className="font-mono" />
        </Field>
      </div>

      <div className="mt-6">
        {result ? (
          <ResultCard label="Estimated body fat" value={`${result.percent.toFixed(1)}%`} sub={`${result.category} range for ${sex === "male" ? "men" : "women"}`} tone="brand">
            <StatGrid
              columns={3}
              items={[
                { label: "Fat mass", value: `${result.fatMass.toFixed(1)} kg` },
                { label: "Lean mass", value: `${result.leanMass.toFixed(1)} kg` },
                { label: "Measurement", value: "Tape, US Navy equation" },
              ]}
            />
            <div className="mt-4">
              <SimpleTable
                head={["Range", "Category"]}
                caption={`Reference bands for ${sex === "male" ? "men" : "women"}`}
                rows={
                  sex === "male"
                    ? [["2–5%", "Essential fat"], ["6–13%", "Athletic"], ["14–17%", "Fitness"], ["18–24%", "Average"], ["25%+", "Above average"]]
                    : [["10–13%", "Essential fat"], ["14–20%", "Athletic"], ["21–24%", "Fitness"], ["25–31%", "Average"], ["32%+", "Above average"]]
                }
              />
            </div>
          </ResultCard>
        ) : (
          <Callout tone="info">Enter your measurements to estimate body fat. The female equation also needs a hip measurement.</Callout>
        )}
      </div>

      {result?.issues.map((issue) => (
        <Callout key={issue} tone="warning">
          {issue}
        </Callout>
      ))}

      <p className="mt-4 text-xs leading-relaxed text-[var(--text-subtle)]">
        The US Navy method regresses body density on circumference ratios: for men 86.010·log₁₀(waist − neck) −
        70.041·log₁₀(height) + 36.76, and a related equation using hip for women. It is accurate to a few points on
        average and less so at the extremes, and it assumes a typical fat distribution. Measuring at the same landmarks,
        at the same time of day, matters more than the absolute number.
      </p>
    </ToolPanel>
  );
}
