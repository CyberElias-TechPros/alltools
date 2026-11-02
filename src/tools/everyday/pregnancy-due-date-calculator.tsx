"use client";

import { useMemo, useState } from "react";
import { Callout, Field, ResultCard, SimpleTable, StatGrid, TextInput, ToolPanel } from "@/components/ui";
import { pregnancyDueDate, toDateInput } from "@/lib/everyday";

const format = (date: Date) =>
  date.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "long", year: "numeric" });

export default function PregnancyDueDateCalculator() {
  const [lmp, setLmp] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 70);
    return toDateInput(date);
  });
  const [cycleLength, setCycleLength] = useState("28");

  const result = useMemo(() => pregnancyDueDate({ lmp, cycleLength: Number(cycleLength) }), [lmp, cycleLength]);

  return (
    <ToolPanel>
      <Callout tone="warning">
        Dating from the last menstrual period is an estimate. An early ultrasound is more accurate, and a clinician&apos;s
        dating always overrides this page. Nothing here is medical advice.
      </Callout>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <Field label="First day of last period" htmlFor="preg-lmp">
          <TextInput id="preg-lmp" type="date" value={lmp} onChange={(event) => setLmp(event.target.value)} className="font-mono" />
        </Field>
        <Field label="Average cycle length (days)" htmlFor="preg-cycle" hint="28 is the textbook value; 21–35 is common.">
          <TextInput id="preg-cycle" type="number" min={20} max={45} value={cycleLength} onChange={(event) => setCycleLength(event.target.value)} className="font-mono" />
        </Field>
      </div>

      <div className="mt-6">
        {result ? (
          <ResultCard
            label="Estimated due date"
            value={format(result.dueDate)}
            sub={`${result.gestationalWeeks} weeks + ${result.gestationalRemainder} days · trimester ${result.trimester}`}
            tone="brand"
          >
            <StatGrid
              columns={3}
              items={[
                { label: "Estimated conception", value: format(result.conception) },
                { label: "Viability milestone (22 weeks)", value: format(result.viability) },
                { label: "Full term begins (37 weeks)", value: format(result.fullTerm) },
              ]}
            />
            <div className="mt-4">
              <SimpleTable
                head={["Milestone", "Date", "Weeks"]}
                caption="Standard milestones from the same dating"
                rows={[
                  ["End of first trimester", format(new Date(result.dueDate.getTime() - 280 * 86_400_000 + 98 * 86_400_000)), "14"],
                  ["Anatomy scan window opens", format(new Date(result.dueDate.getTime() - 280 * 86_400_000 + 126 * 86_400_000)), "18"],
                  ["Third trimester begins", format(new Date(result.dueDate.getTime() - 280 * 86_400_000 + 196 * 86_400_000)), "28"],
                  ["Full term", format(result.fullTerm), "37"],
                  ["Due date", format(result.dueDate), "40"],
                ]}
              />
            </div>
          </ResultCard>
        ) : (
          <Callout tone="info">Enter the date as YYYY-MM-DD to calculate a due date.</Callout>
        )}
      </div>

      {result?.issues.map((issue) => (
        <Callout key={issue} tone="warning">
          {issue}
        </Callout>
      ))}

      <p className="mt-4 text-xs leading-relaxed text-[var(--text-subtle)]">
        Naegele&apos;s rule adds 280 days to the last period, then shifts by the difference between your cycle and 28
        days. Only about 4% of babies arrive on the estimated date; the useful figure is the two-week window either side.
        Pregnancy length is counted from the last period, so &ldquo;40 weeks&rdquo; is about 38 weeks of actual gestation.
      </p>
    </ToolPanel>
  );
}
