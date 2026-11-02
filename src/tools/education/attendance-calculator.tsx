"use client";

import { useMemo, useState } from "react";
import { Callout, Field, ResultCard, StatGrid, TextInput, ToolPanel } from "@/components/ui";
import { attendancePlan } from "@/lib/education";

export default function AttendanceCalculator() {
  const [attended, setAttended] = useState("18");
  const [held, setHeld] = useState("20");
  const [required, setRequired] = useState("75");
  const [remaining, setRemaining] = useState("10");

  const plan = useMemo(
    () =>
      attendancePlan({
        attended: Number(attended),
        held: Number(held),
        required: Number(required),
        remaining: Number(remaining),
      }),
    [attended, held, required, remaining],
  );

  return (
    <ToolPanel>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Classes attended" htmlFor="att-ended">
          <TextInput id="att-ended" type="number" min={0} value={attended} onChange={(event) => setAttended(event.target.value)} className="font-mono" />
        </Field>
        <Field label="Classes held so far" htmlFor="att-held">
          <TextInput id="att-held" type="number" min={0} value={held} onChange={(event) => setHeld(event.target.value)} className="font-mono" />
        </Field>
        <Field label="Required attendance %" htmlFor="att-req">
          <TextInput id="att-req" type="number" min={0} max={100} value={required} onChange={(event) => setRequired(event.target.value)} className="font-mono" />
        </Field>
        <Field label="Classes left in term" htmlFor="att-left" hint="Optional — needed for the skip forecast.">
          <TextInput id="att-left" type="number" min={0} value={remaining} onChange={(event) => setRemaining(event.target.value)} className="font-mono" />
        </Field>
      </div>

      <div className="mt-6">
        <ResultCard
          label="Current attendance"
          value={`${plan.percent.toFixed(1)}%`}
          sub={plan.met ? `Above the ${required}% requirement` : `Below the ${required}% requirement`}
          tone={plan.met ? "brand" : "neutral"}
        >
          <StatGrid
            columns={3}
            items={[
              {
                label: "Classes you can still miss",
                value: plan.canSkip === 0 ? "None" : String(plan.canSkip),
                hint: `And finish at ${required}% or better`,
              },
              {
                label: "Must attend to recover",
                value: Number.isFinite(plan.mustAttend) ? String(plan.mustAttend) : "Not possible",
                hint: "Consecutive classes from now",
              },
              { label: "Best possible final %", value: `${plan.maxFinalPercent.toFixed(1)}%` },
            ]}
          />
          <p className="mt-3 text-xs leading-relaxed text-[var(--text-subtle)]">
            {plan.met
              ? `At ${plan.percent.toFixed(1)}% you have room: missing ${plan.canSkip} of the ${remaining || 0} remaining classes keeps you at or above ${required}%.`
              : `You need to attend ${Number.isFinite(plan.mustAttend) ? `${plan.mustAttend} class${plan.mustAttend === 1 ? "" : "es"}` : "more classes than remain"} in a row to climb back above ${required}%.`}
          </p>
        </ResultCard>
      </div>

      {plan.issues.map((issue) => (
        <Callout key={issue} tone="warning">
          {issue}
        </Callout>
      ))}

      <p className="mt-4 text-xs leading-relaxed text-[var(--text-subtle)]">
        Attendance policies are rarely pure arithmetic: many institutions count a late arrival as a partial or full
        absence, and some exclude documented sick leave from the denominator. Confirm how your register is counted
        before relying on the margin.
      </p>
    </ToolPanel>
  );
}
