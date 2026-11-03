"use client";

import { useMemo, useState } from "react";
import { Callout, Field, ResultCard, Segmented, SimpleTable, StatGrid, TextInput, ToolPanel } from "@/components/ui";
import { waterIntake } from "@/lib/everyday";

export default function WaterIntakeEstimator() {
  const [weightKg, setWeightKg] = useState("70");
  const [exerciseMinutes, setExerciseMinutes] = useState("30");
  const [climate, setClimate] = useState<"temperate" | "hot" | "very-hot">("temperate");

  const result = useMemo(
    () => waterIntake({ weightKg: Number(weightKg), exerciseMinutes: Number(exerciseMinutes), climate }),
    [weightKg, exerciseMinutes, climate],
  );

  return (
    <ToolPanel>
      <Callout tone="warning">
        A rough target, not a medical instruction. Kidneys, heart and fluid-restriction conditions change everything here.
        Thirst and urine colour are better day-to-day guides than any number.
      </Callout>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <Field label="Body weight (kg)" htmlFor="water-weight">
          <TextInput id="water-weight" type="number" min={20} max={250} value={weightKg} onChange={(event) => setWeightKg(event.target.value)} className="font-mono" />
        </Field>
        <Field label="Exercise today (minutes)" htmlFor="water-exercise" hint="Moderate activity that makes you sweat.">
          <TextInput id="water-exercise" type="number" min={0} max={480} value={exerciseMinutes} onChange={(event) => setExerciseMinutes(event.target.value)} className="font-mono" />
        </Field>
        <div className="sm:col-span-2">
          <Segmented
            label="Climate"
            value={climate}
            onChange={setClimate}
            options={[
              { value: "temperate", label: "Temperate" },
              { value: "hot", label: "Hot" },
              { value: "very-hot", label: "Very hot / humid" },
            ]}
          />
        </div>
      </div>

      <div className="mt-6">
        <ResultCard label="Fluid target" value={`${result.litres.toFixed(2)} L`} sub={`About ${result.glasses} glasses of 250 ml`} tone="brand">
          <StatGrid
            columns={3}
            items={[
              { label: "Baseline (35 ml/kg)", value: `${result.baseLitres.toFixed(2)} L` },
              { label: "Exercise replacement", value: `+${result.exerciseLitres.toFixed(2)} L` },
              { label: "Climate adjustment", value: `+${result.climateLitres.toFixed(2)} L` },
            ]}
          />
          <div className="mt-4">
            <SimpleTable
              head={["Source", "Share of daily fluid"]}
              caption="Where hydration actually comes from"
              rows={[
                ["Drinks (water, tea, coffee)", "≈ 70–80%"],
                ["Food, especially fruit and vegetables", "≈ 20–30%"],
                ["Metabolic water from food breakdown", "Small but real"],
              ]}
            />
          </div>
        </ResultCard>
      </div>

      {result.issues.map((issue) => (
        <Callout key={issue} tone="warning">
          {issue}
        </Callout>
      ))}

      <p className="mt-4 text-xs leading-relaxed text-[var(--text-subtle)]">
        The 35 ml per kilogram starting point is a common clinical rule of thumb, not a peer-reviewed optimum. Caffeine
        counts towards fluid intake in normal amounts, and drinking beyond thirst does not improve performance — it can
        dilute sodium. Heat adaptation, pregnancy and breastfeeding all raise needs in ways this estimate does not model.
      </p>
    </ToolPanel>
  );
}
