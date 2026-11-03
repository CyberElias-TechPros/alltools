"use client";

import { useMemo, useState } from "react";
import { Callout, Field, ResultCard, SimpleTable, StatGrid, TextInput, ToolPanel } from "@/components/ui";
import { ovulationWindow, toDateInput } from "@/lib/everyday";

const format = (date: Date) => date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

export default function OvulationDateEstimator() {
  const [lmp, setLmp] = useState(() => toDateInput(new Date()));
  const [cycleLength, setCycleLength] = useState("28");
  const [luteal, setLuteal] = useState("14");

  const result = useMemo(
    () => ovulationWindow({ lmp, cycleLength: Number(cycleLength), lutealLength: Number(luteal) }),
    [lmp, cycleLength, luteal],
  );

  return (
    <ToolPanel>
      <Callout tone="warning">
        Calendar estimates assume a regular cycle and are not contraception. They are also not a fertility test — if you
        are trying to conceive or avoid pregnancy, speak to a clinician.
      </Callout>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <Field label="First day of last period" htmlFor="ov-lmp">
          <TextInput id="ov-lmp" type="date" value={lmp} onChange={(event) => setLmp(event.target.value)} className="font-mono" />
        </Field>
        <Field label="Cycle length (days)" htmlFor="ov-cycle">
          <TextInput id="ov-cycle" type="number" min={21} max={45} value={cycleLength} onChange={(event) => setCycleLength(event.target.value)} className="font-mono" />
        </Field>
        <Field label="Luteal phase (days)" htmlFor="ov-luteal" hint="14 is typical and varies less than the follicular phase.">
          <TextInput id="ov-luteal" type="number" min={9} max={20} value={luteal} onChange={(event) => setLuteal(event.target.value)} className="font-mono" />
        </Field>
      </div>

      <div className="mt-6">
        {result ? (
          <ResultCard
            label="Estimated ovulation"
            value={format(result.ovulation)}
            sub={`Fertile window ${format(result.fertileStart)} – ${format(result.fertileEnd)}`}
            tone="brand"
          >
            <StatGrid
              columns={3}
              items={[
                { label: "Ovulation", value: format(result.ovulation) },
                { label: "Fertile window", value: `${format(result.fertileStart)} → ${format(result.fertileEnd)}`, hint: "Sperm survive up to five days; the egg about one" },
                { label: "Cycle length used", value: `${result.cycleLength} days` },
              ]}
            />
            <div className="mt-4">
              <SimpleTable
                head={["Next periods", "Date"]}
                caption="Projected from the same cycle length"
                rows={result.nextPeriods.map((date, index) => [`Period ${index + 1}`, format(date)])}
              />
            </div>
          </ResultCard>
        ) : (
          <Callout tone="info">Enter the first day of your last period to estimate the window.</Callout>
        )}
      </div>

      {result?.issues.map((issue) => (
        <Callout key={issue} tone="warning">
          {issue}
        </Callout>
      ))}

      <p className="mt-4 text-xs leading-relaxed text-[var(--text-subtle)]">
        Ovulation is estimated backwards from the next period, because the luteal phase is more stable than the
        follicular one: ovulation ≈ cycle length − 14 days. That is why a long cycle shifts ovulation later while the
        period stays 14 days behind it. Stress, illness and travel move the date, and ovulation tracking with tests or
        temperature is far more reliable than a calendar.
      </p>
    </ToolPanel>
  );
}
