"use client";

import { useMemo, useState } from "react";
import { Callout, Field, ResultCard, Segmented, Select, SimpleTable, StatGrid, TextInput, ToolPanel } from "@/components/ui";
import { estimateCalories, type Sex } from "@/lib/everyday";

const ACTIVITY = [
  { value: "1.2", label: "Sedentary — desk work, little walking" },
  { value: "1.375", label: "Light — exercise 1–3 days a week" },
  { value: "1.55", label: "Moderate — 3–5 days a week" },
  { value: "1.725", label: "Active — 6–7 days a week" },
  { value: "1.9", label: "Very active — physical job or twice-daily training" },
];

export default function CalorieEstimator() {
  const [sex, setSex] = useState<Sex>("female");
  const [age, setAge] = useState("30");
  const [heightCm, setHeightCm] = useState("165");
  const [weightKg, setWeightKg] = useState("60");
  const [activity, setActivity] = useState("1.55");
  const [goal, setGoal] = useState<"lose" | "maintain" | "gain">("maintain");

  const result = useMemo(
    () =>
      estimateCalories({
        sex,
        age: Number(age),
        heightCm: Number(heightCm),
        weightKg: Number(weightKg),
        activity: Number(activity),
        goal,
      }),
    [sex, age, heightCm, weightKg, activity, goal],
  );

  return (
    <ToolPanel>
      <Callout tone="warning">
        An estimate from a population equation, not a prescription. It cannot see body composition, medication, thyroid
        function or medical conditions — for anything clinical, talk to a dietitian or doctor.
      </Callout>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div className="sm:col-span-2 lg:col-span-3">
          <Segmented
            label="Sex used by the equation"
            value={sex}
            onChange={setSex}
            options={[
              { value: "female", label: "Female" },
              { value: "male", label: "Male" },
            ]}
          />
        </div>
        <Field label="Age" htmlFor="cal-age">
          <TextInput id="cal-age" type="number" min={15} max={100} value={age} onChange={(event) => setAge(event.target.value)} className="font-mono" />
        </Field>
        <Field label="Height (cm)" htmlFor="cal-height">
          <TextInput id="cal-height" type="number" min={100} max={250} value={heightCm} onChange={(event) => setHeightCm(event.target.value)} className="font-mono" />
        </Field>
        <Field label="Weight (kg)" htmlFor="cal-weight">
          <TextInput id="cal-weight" type="number" min={25} max={300} value={weightKg} onChange={(event) => setWeightKg(event.target.value)} className="font-mono" />
        </Field>
        <Field label="Activity level" htmlFor="cal-activity" className="sm:col-span-2">
          <Select id="cal-activity" value={activity} onChange={(event) => setActivity(event.target.value)}>
            {ACTIVITY.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Goal" htmlFor="cal-goal">
          <Select id="cal-goal" value={goal} onChange={(event) => setGoal(event.target.value as "lose" | "maintain" | "gain")}>
            <option value="lose">Lose weight</option>
            <option value="maintain">Maintain</option>
            <option value="gain">Gain weight</option>
          </Select>
        </Field>
      </div>

      <div className="mt-6">
        <ResultCard
          label="Daily target"
          value={`${result.target.toLocaleString("en-GB")} kcal`}
          sub={`${result.maintenance.toLocaleString("en-GB")} kcal maintains your current weight`}
          tone="brand"
        >
          <StatGrid
            columns={3}
            items={[
              { label: "Basal rate (BMR)", value: `${result.bmr.toLocaleString("en-GB")} kcal` },
              { label: "Maintenance (TDEE)", value: `${result.maintenance.toLocaleString("en-GB")} kcal` },
              { label: "Expected change", value: `${result.weeklyChangeKg > 0 ? "+" : ""}${result.weeklyChangeKg.toFixed(2)} kg / week` },
            ]}
          />
          <div className="mt-4">
            <SimpleTable
              head={["Macronutrient", "Grams", "Why"]}
              caption="A simple, protein-forward split of the target"
              rows={[
                ["Protein", `${result.protein} g`, "1.6 g per kg of body weight preserves muscle in a deficit"],
                ["Fat", `${result.fat} g`, "27% of calories, for hormones and satiety"],
                ["Carbohydrate", `${result.carbs} g`, "Everything left — the flexible part"],
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
        Mifflin–St Jeor is the equation most dietitians use: 10 × weight + 6.25 × height − 5 × age, then ±5 for men and
        −161 for women. The activity multiplier is the biggest source of error — most people overestimate it by one band,
        which is why the labels describe behaviour rather than a number. A 500 kcal deficit is used for weight loss
        because 7,700 kcal ≈ 1 kg of fat, but real-world loss is rarely linear.
      </p>
    </ToolPanel>
  );
}
