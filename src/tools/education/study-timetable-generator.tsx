"use client";

import { useMemo, useState } from "react";
import { Button, Callout, CopyButton, DownloadButton, Field, ResultCard, Select, SimpleTable, StatGrid, TextInput, ToolPanel } from "@/components/ui";
import { buildTimetable } from "@/lib/education";

interface Subject {
  id: number;
  name: string;
  hours: string;
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const asTsv = (head: string[], rows: string[][]) =>
  [head.join("\t"), ...rows.map((row) => row.join("\t"))].join("\n");

const SEED: Subject[] = [
  { id: 1, name: "Mathematics", hours: "4" },
  { id: 2, name: "Biology", hours: "3" },
  { id: 3, name: "History", hours: "2" },
];

export default function StudyTimetableGenerator() {
  const [subjects, setSubjects] = useState<Subject[]>(SEED);
  const [dayCount, setDayCount] = useState("5");
  const [session, setSession] = useState("60");
  const [startHour, setStartHour] = useState("17");
  const [nextId, setNextId] = useState(4);

  const days = DAYS.slice(0, Math.max(1, Math.min(7, Number(dayCount) || 5)));
  const blocks = useMemo(
    () =>
      buildTimetable({
        subjects: subjects.map((subject) => ({ name: subject.name, hours: Number(subject.hours) })),
        days,
        sessionMinutes: Number(session),
        startHour: Number(startHour),
      }),
    [subjects, dayCount, session, startHour],
  );

  const totalMinutes = blocks.reduce((sum, block) => sum + block.minutes, 0);
  const plan = blocks.length
    ? blocks
        .map((block) => ({ day: block.day, time: `${block.start}–${block.end}`, subject: block.subject, minutes: block.minutes }))
        .map((row) => [row.day, row.time, row.subject, `${row.minutes} min`])
    : [];

  return (
    <ToolPanel>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Study days per week" htmlFor="tt-days">
          <Select id="tt-days" value={dayCount} onChange={(event) => setDayCount(event.target.value)}>
            {[3, 4, 5, 6, 7].map((count) => (
              <option key={count} value={count}>
                {count} days
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Session length" htmlFor="tt-session">
          <Select id="tt-session" value={session} onChange={(event) => setSession(event.target.value)}>
            {[30, 45, 60, 90].map((minutes) => (
              <option key={minutes} value={minutes}>
                {minutes} minutes
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Start time" htmlFor="tt-start">
          <Select id="tt-start" value={startHour} onChange={(event) => setStartHour(event.target.value)}>
            {Array.from({ length: 13 }, (_, index) => index + 8).map((hour) => (
              <option key={hour} value={hour}>
                {String(hour).padStart(2, "0")}:00
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="mt-4 space-y-2">
        <div className="hidden grid-cols-[1fr_7rem_2rem] gap-2 sm:grid">
          <span className="label !mb-0">Subject</span>
          <span className="label !mb-0">Hours / week</span>
          <span className="sr-only">Remove</span>
        </div>
        {subjects.map((subject) => (
          <div key={subject.id} className="grid grid-cols-[1fr_5rem_2rem] gap-2 sm:grid-cols-[1fr_7rem_2rem]">
            <TextInput
              aria-label="Subject name"
              value={subject.name}
              onChange={(event) => setSubjects((current) => current.map((item) => (item.id === subject.id ? { ...item, name: event.target.value } : item)))}
              placeholder="Subject"
            />
            <TextInput
              aria-label={`${subject.name || "Subject"} hours`}
              type="number"
              min={0}
              step="0.5"
              value={subject.hours}
              onChange={(event) => setSubjects((current) => current.map((item) => (item.id === subject.id ? { ...item, hours: event.target.value } : item)))}
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
            setSubjects((current) => [...current, { id: nextId, name: "", hours: "1" }]);
            setNextId((value) => value + 1);
          }}
        >
          Add subject
        </Button>
      </div>

      <div className="mt-6">
        {blocks.length ? (
          <ResultCard
            label="Weekly timetable"
            value={`${blocks.length} sessions`}
            sub={`${(totalMinutes / 60).toFixed(1)} hours scheduled across ${days.length} days`}
            tone="brand"
            actions={
              <>
                <CopyButton text={asTsv(["Day", "Time", "Subject", "Length"], plan)} label="Copy" />
                <DownloadButton filename="study-timetable.tsv" content={asTsv(["Day", "Time", "Subject", "Length"], plan)} label="Download" />
              </>
            }
          >
            <StatGrid
              columns={3}
              items={[
                { label: "Sessions", value: String(blocks.length) },
                { label: "Hours", value: (totalMinutes / 60).toFixed(1) },
                { label: "Per study day", value: `${Math.round(totalMinutes / days.length)} min` },
              ]}
            />
            <div className="mt-4">
              <SimpleTable head={["Day", "Time", "Subject", "Length"]} rows={plan} caption="Paste straight into a spreadsheet" />
            </div>
          </ResultCard>
        ) : (
          <Callout tone="info">Add a subject with hours to generate a timetable.</Callout>
        )}
      </div>

      <p className="mt-4 text-xs leading-relaxed text-[var(--text-subtle)]">
        Sessions rotate through subjects so nothing is studied for hours on end, with a short break between blocks. The
        schedule stops at 22:00 — a plan that runs past midnight is one you will abandon.
      </p>
    </ToolPanel>
  );
}
