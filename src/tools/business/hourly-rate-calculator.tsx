"use client";

import { useMemo, useState } from "react";
import { Callout, CopyButton, Field, ResultCard, SimpleTable, StatGrid, TextInput, ToolPanel } from "@/components/ui";
import { formatMoney, hourlyRate } from "@/lib/business";

export default function HourlyRateCalculator() {
  const [income, setIncome] = useState("60000");
  const [hoursPerWeek, setHoursPerWeek] = useState("25");
  const [weeks, setWeeks] = useState("46");
  const [overheads, setOverheads] = useState("10000");
  const [margin, setMargin] = useState("20");

  const result = useMemo(
    () => hourlyRate({ targetIncome: Number(income), billableHoursPerWeek: Number(hoursPerWeek), weeksPerYear: Number(weeks), overheads: Number(overheads), profitMargin: Number(margin) }),
    [income, hoursPerWeek, weeks, overheads, margin],
  );

  const text = `Rate: ${formatMoney(result.rate)} per hour · ${formatMoney(result.dayRate)} per day`;

  return (
    <ToolPanel>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="Income you want to take" htmlFor="rate-income" hint="Before personal tax.">
          <TextInput id="rate-income" type="number" min={0} step="1000" value={income} onChange={(event) => setIncome(event.target.value)} className="font-mono" />
        </Field>
        <Field label="Billable hours per week" htmlFor="rate-hours">
          <TextInput id="rate-hours" type="number" min={1} max={60} value={hoursPerWeek} onChange={(event) => setHoursPerWeek(event.target.value)} className="font-mono" />
        </Field>
        <Field label="Weeks worked per year" htmlFor="rate-weeks">
          <TextInput id="rate-weeks" type="number" min={1} max={52} value={weeks} onChange={(event) => setWeeks(event.target.value)} className="font-mono" />
        </Field>
        <Field label="Business overheads per year" htmlFor="rate-overheads" hint="Software, insurance, accounting, hardware.">
          <TextInput id="rate-overheads" type="number" min={0} step="500" value={overheads} onChange={(event) => setOverheads(event.target.value)} className="font-mono" />
        </Field>
        <Field label="Profit margin %" htmlFor="rate-margin" hint="A buffer for slow months and reinvestment.">
          <TextInput id="rate-margin" type="number" min={0} max={80} value={margin} onChange={(event) => setMargin(event.target.value)} className="font-mono" />
        </Field>
      </div>

      <div className="mt-6">
        <ResultCard
          label="Minimum hourly rate"
          value={formatMoney(result.rate)}
          sub={`${formatMoney(result.dayRate)} per day · ${result.billableHours.toFixed(0)} billable hours a year`}
          tone="brand"
          actions={<CopyButton text={text} label="Copy" />}
        >
          <StatGrid
            columns={3}
            items={[
              { label: "Revenue needed", value: formatMoney(result.revenueNeeded) },
              { label: "Billable hours", value: result.billableHours.toFixed(0) },
              { label: "Revenue per week", value: formatMoney(result.revenueNeeded / Math.max(1, Number(weeks) || 46)) },
            ]}
          />
          <div className="mt-4">
            <SimpleTable
              head={["Weekly pattern", "Hours", "Weekly revenue"]}
              caption="At this rate, what different weeks look like"
              rows={[
                ["Three billable days", "24", formatMoney(result.rate * 24)],
                ["Four billable days", "32", formatMoney(result.rate * 32)],
                ["Five billable days", "40", formatMoney(result.rate * 40)],
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
        The mistake freelancers make is dividing income by 40 hours a week. Nobody bills 40 hours: proposals, invoicing,
        learning and holidays are unpaid, which is why 20–25 billable hours is a realistic planning figure. The margin is
        not greed — it is the only money that covers a quiet month without borrowing.
      </p>
    </ToolPanel>
  );
}
