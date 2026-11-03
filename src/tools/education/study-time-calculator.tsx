"use client";

import { useMemo, useState } from "react";
import { Button, Callout, Field, ResultCard, SimpleTable, StatGrid, TextInput, ToolPanel } from "@/components/ui";
import { studyPlan } from "@/lib/education";

interface Subject {
  id: number;
  name: string;
  confidence: string;
}

const SEED: Subject[] = [
  { id: 1, name: "Mathematics", confidence: "2" },
  { id: 2, name: "Biology", confidence: "3" },
  { id: 3, name: "History", confidence: "5" },
];

export default function StudyTimeCalculator() {
  const [examDate, setExamDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 21);
    return date.toISOString().slice(0, 10);
  });
  const [hours, setHours] = useState("2");
  const [subjects, setSubjects] = useState<Subject[]>(SEED);
  const [nextId, setNextId] = useState(4);

  const plan = useMemo(
    () =>
      studyPlan({
        examDate,
        hoursPerDay: Number(hours),
        subjects: subjects.map((subject) => ({ name: subject.name, confidence: Number(subject.confidence) })),
      }),
    [examDate, hours, subjects],
  );

  return (
    <ToolPanel>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Exam date" htmlFor="study-date">
          <TextInput id="study-date" type="date" value={examDate} onChange={(event) => setExamDate(event.target.value)} className="font-mono" />
        </Field>
        <Field label="Study hours per day" htmlFor="study-hours" hint="Be honest — a plan you cannot keep is worse than none.">
          <TextInput id="study-hours" type="number" min={0} max={16} step="0.5" value={hours} onChange={(event) => setHours(event.target.value)} className="font-mono" />
        </Field>
      </div>

      <div className="mt-4 space-y-2">
        <div className="hidden grid-cols-[1fr_9rem_2rem] gap-2 sm:grid">
          <span className="label !mb-0">Subject</span>
          <span className="label !mb-0">Confidence (1–5)</span>
          <span className="sr-only">Remove</span>
        </div>
        {subjects.map((subject) => (
          <div key={subject.id} className="grid grid-cols-[1fr_5rem_2rem] gap-2 sm:grid-cols-[1fr_9rem_2rem]">
            <TextInput
              aria-label="Subject name"
              value={subject.name}
              onChange={(event) => setSubjects((current) => current.map((item) => (item.id === subject.id ? { ...item, name: event.target.value } : item)))}
              placeholder="Subject"
            />
            <TextInput
              aria-label={`${subject.name || "Subject"} confidence`}
              type="number"
              min={1}
              max={5}
              value={subject.confidence}
              onChange={(event) => setSubjects((current) => current.map((item) => (item.id === subject.id ? { ...item, confidence: event.target.value } : item)))}
            />
            <Button
              variant="ghost"
              size="sm"
              aria-label={`Remove ${subject.name || "subject"}`}
              onClick={() => setSubjects((current) => current.filter((item) => item.id !== subject.id))}
            >
              ✕
            </Button>
          </div>
        ))}
      </div>

      <div className="mt-3">
        <Button
          onClick={() => {
            setSubjects((current) => [...current, { id: nextId, name: "", confidence: "3" }]);
            setNextId((value) => value + 1);
          }}
        >
          Add subject
        </Button>
      </div>

      <div className="mt-6">
        <ResultCard
          label="Study plan"
          value={`${plan.daysLeft} day${plan.daysLeft === 1 ? "" : "s"}`}
          sub={`${plan.totalHours.toFixed(1)} hours in total at ${plan.perDay} per day`}
          tone="brand"
        >
          <StatGrid
            columns={3}
            items={[
              { label: "Days available", value: String(plan.daysLeft) },
              { label: "Total study hours", value: plan.totalHours.toFixed(1) },
              { label: "Subjects", value: String(plan.allocations.length) },
            ]}
          />
          {plan.allocations.length > 0 && (
            <div className="mt-4">
              <SimpleTable
                head={["Subject", "Confidence", "Total hours", "Per day"]}
                caption="Time weighted towards the subjects you rated lower"
                rows={plan.allocations.map((allocation) => [
                  allocation.name,
                  `${allocation.confidence}/5`,
                  allocation.hours.toFixed(1),
                  `${Math.round(allocation.minutesPerDay)} min`,
                ])}
              />
            </div>
          )}
        </ResultCard>
      </div>

      {plan.issues.map((issue) => (
        <Callout key={issue} tone="warning">
          {issue}
        </Callout>
      ))}

      <p className="mt-4 text-xs leading-relaxed text-[var(--text-subtle)]">
        The split puts more time where confidence is lower, capped so no subject disappears. Spaced repetition beats one
        long block: two 45-minute sessions on different days retain more than a single 90-minute session.
      </p>
    </ToolPanel>
  );
}
