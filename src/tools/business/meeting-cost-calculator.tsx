"use client";

import { useMemo, useState } from "react";
import { Callout, CopyButton, Field, ResultCard, StatGrid, TextInput, ToolPanel } from "@/components/ui";
import { formatMoney, meetingCost } from "@/lib/business";

export default function MeetingCostCalculator() {
  const [attendees, setAttendees] = useState("6");
  const [rate, setRate] = useState("40");
  const [minutes, setMinutes] = useState("60");
  const [perYear, setPerYear] = useState("50");

  const result = useMemo(
    () => meetingCost({ attendees: Number(attendees), hourlyRate: Number(rate), minutes: Number(minutes), occurrencesPerYear: Number(perYear) }),
    [attendees, rate, minutes, perYear],
  );

  const text = `${attendees} people × ${minutes} minutes ≈ ${formatMoney(result.total)} per meeting${Number(perYear) > 0 ? `, ${formatMoney(result.annualised)} a year` : ""}`;

  return (
    <ToolPanel>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Attendees" htmlFor="meet-attendees">
          <TextInput id="meet-attendees" type="number" min={1} max={100} value={attendees} onChange={(event) => setAttendees(event.target.value)} className="font-mono" />
        </Field>
        <Field label="Average hourly cost" htmlFor="meet-rate" hint="Fully loaded: salary, tax and overhead.">
          <TextInput id="meet-rate" type="number" min={0} step="0.5" value={rate} onChange={(event) => setRate(event.target.value)} className="font-mono" />
        </Field>
        <Field label="Duration (minutes)" htmlFor="meet-minutes">
          <TextInput id="meet-minutes" type="number" min={0} max={480} step={5} value={minutes} onChange={(event) => setMinutes(event.target.value)} className="font-mono" />
        </Field>
        <Field label="Times per year" htmlFor="meet-year" hint="Optional — for the annual figure.">
          <TextInput id="meet-year" type="number" min={0} max={1000} value={perYear} onChange={(event) => setPerYear(event.target.value)} className="font-mono" />
        </Field>
      </div>

      <div className="mt-6">
        <ResultCard label="Cost of this meeting" value={formatMoney(result.total)} sub={`${formatMoney(result.perMinute)} per minute · ${formatMoney(result.perAttendee)} per attendee`} tone="brand" actions={<CopyButton text={text} label="Copy" />}>
          <StatGrid
            columns={3}
            items={[
              { label: "Per minute", value: formatMoney(result.perMinute) },
              { label: "Per attendee", value: formatMoney(result.perAttendee) },
              { label: "Per year", value: formatMoney(result.annualised) },
            ]}
          />
          <p className="mt-3 text-xs leading-relaxed text-[var(--text-subtle)]">
            Cutting the meeting from {minutes || 0} to {Math.max(5, Math.round((Number(minutes) || 0) * 0.75))} minutes saves{" "}
            {formatMoney(result.total * 0.25)} — usually by writing the decision down beforehand.
          </p>
        </ResultCard>
      </div>

      {result.issues.map((issue) => (
        <Callout key={issue} tone="warning">
          {issue}
        </Callout>
      ))}

      <p className="mt-4 text-xs leading-relaxed text-[var(--text-subtle)]">
        The number is an opportunity cost, not an invoice — those people were paid for the hour either way. It is useful
        as a comparison: a 45-minute meeting with six people costs more than a fortnight of a junior&apos;s work, which is
        a good argument for a written update instead.
      </p>
    </ToolPanel>
  );
}
