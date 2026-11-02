"use client";

import { useMemo, useState } from "react";
import { CopyButton, Field, ResultCard, StatGrid, Switch, TextInput, ToolPanel } from "@/components/ui";
import { businessDaysBetween, daysBetween } from "@/lib/calc";
import { formatNumber, parseIsoDate } from "@/lib/utils";

export default function DaysBetweenDates() {
  const today = new Date();
  const nextMonth = new Date(today.getTime() + 30 * 86_400_000);
  const iso = (date: Date) => date.toISOString().slice(0, 10);

  const [start, setStart] = useState(iso(today));
  const [end, setEnd] = useState(iso(nextMonth));
  const [inclusive, setInclusive] = useState(false);

  const data = useMemo(() => {
    const startDate = parseIsoDate(start);
    const endDate = parseIsoDate(end);
    if (!startDate || !endDate) return { error: "Enter two valid dates." };
    const days = daysBetween(startDate, endDate, inclusive);
    const business = businessDaysBetween(startDate, endDate);
    return {
      days,
      business,
      weeks: days / 7,
      weekends: Math.max(Math.abs(days) - business, 0),
      sentence: `${Math.abs(days)} days ${startDate <= endDate ? "from" : "before"} ${startDate <= endDate ? start : end}${inclusive ? " (inclusive)" : ""}.`,
    };
  }, [start, end, inclusive]);

  return (
    <ToolPanel>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Start date" htmlFor="dbd-start">
          <TextInput
            id="dbd-start"
            type="date"
            value={start}
            onChange={(event) => setStart(event.target.value)}
          />
        </Field>
        <Field label="End date" htmlFor="dbd-end">
          <TextInput
            id="dbd-end"
            type="date"
            value={end}
            onChange={(event) => setEnd(event.target.value)}
          />
        </Field>
      </div>

      <div className="mt-2">
        <Switch
          checked={inclusive}
          onChange={setInclusive}
          label="Include the end date"
          description="Both the start and end day count toward the total"
        />
      </div>

      <div className="mt-3">
        {data && "error" in data ? (
          <ResultCard label="Days between" value="—" tone="neutral" sub={data.error} />
        ) : data ? (
          <ResultCard
            label="Days between"
            value={formatNumber(Math.abs(data.days))}
            sub={data.sentence}
            actions={<CopyButton text={data.sentence} />}
          >
            <StatGrid
              columns={3}
              items={[
                { label: "Weeks", value: formatNumber(data.weeks, 2) },
                { label: "Business days", value: formatNumber(data.business) },
                { label: "Weekend days", value: formatNumber(data.weekends) },
              ]}
            />
            <p className="mt-3 text-xs text-[var(--text-subtle)]">
              Business days exclude Saturdays and Sundays only. Public holidays are not detected —
              subtract them yourself if they matter.
            </p>
          </ResultCard>
        ) : null}
      </div>
    </ToolPanel>
  );
}
