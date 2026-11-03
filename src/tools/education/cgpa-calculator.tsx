"use client";

import { useMemo, useState } from "react";
import { Button, Callout, CopyButton, Field, ResultCard, Select, SimpleTable, StatGrid, TextInput, ToolPanel } from "@/components/ui";
import { calculateCgpa, letterGrade } from "@/lib/education";

interface Semester {
  id: number;
  name: string;
  gpa: string;
  credits: string;
}

const SEED: Semester[] = [
  { id: 1, name: "Year 1, Semester 1", gpa: "3.4", credits: "18" },
  { id: 2, name: "Year 1, Semester 2", gpa: "3.7", credits: "18" },
  { id: 3, name: "Year 2, Semester 1", gpa: "3.9", credits: "21" },
];

export default function CgpaCalculator() {
  const [semesters, setSemesters] = useState<Semester[]>(SEED);
  const [scale, setScale] = useState("4");
  const [nextId, setNextId] = useState(4);

  const max = Number(scale);
  const rows = semesters.map((semester) => ({
    name: semester.name,
    gpa: Number(semester.gpa),
    credits: Number(semester.credits),
  }));
  const result = useMemo(() => calculateCgpa(rows), [semesters]);

  const valid = rows.filter((row) => Number.isFinite(row.gpa) && Number.isFinite(row.credits) && row.credits > 0);
  const outOfRange = valid.find((row) => row.gpa < 0 || row.gpa > max);
  const percent = Number.isFinite(result.cgpa) ? (result.cgpa / max) * 100 : Number.NaN;

  return (
    <ToolPanel>
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <Field label="GPA scale" htmlFor="cgpa-scale" className="w-40">
          <Select id="cgpa-scale" value={scale} onChange={(event) => setScale(event.target.value)}>
            <option value="4">4.0 scale</option>
            <option value="5">5.0 scale</option>
            <option value="10">10.0 scale</option>
          </Select>
        </Field>
      </div>

      <div className="space-y-2">
        <div className="hidden grid-cols-[1fr_6rem_6rem_2rem] gap-2 sm:grid">
          <span className="label !mb-0">Semester</span>
          <span className="label !mb-0">GPA</span>
          <span className="label !mb-0">Credits</span>
          <span className="sr-only">Remove</span>
        </div>
        {semesters.map((semester) => (
          <div key={semester.id} className="grid grid-cols-2 gap-2 sm:grid-cols-[1fr_6rem_6rem_2rem]">
            <TextInput
              aria-label="Semester name"
              value={semester.name}
              onChange={(event) =>
                setSemesters((current) => current.map((item) => (item.id === semester.id ? { ...item, name: event.target.value } : item)))
              }
              className="col-span-2 sm:col-span-1"
            />
            <TextInput
              aria-label={`${semester.name} GPA`}
              type="number"
              step="0.01"
              min={0}
              max={max}
              value={semester.gpa}
              onChange={(event) => setSemesters((current) => current.map((item) => (item.id === semester.id ? { ...item, gpa: event.target.value } : item)))}
            />
            <TextInput
              aria-label={`${semester.name} credits`}
              type="number"
              min={0}
              value={semester.credits}
              onChange={(event) => setSemesters((current) => current.map((item) => (item.id === semester.id ? { ...item, credits: event.target.value } : item)))}
            />
            <Button
              variant="ghost"
              size="sm"
              aria-label={`Remove ${semester.name}`}
              onClick={() => setSemesters((current) => current.filter((item) => item.id !== semester.id))}
            >
              ✕
            </Button>
          </div>
        ))}
      </div>

      <div className="mt-3">
        <Button
          onClick={() => {
            setSemesters((current) => [...current, { id: nextId, name: `Semester ${current.length + 1}`, gpa: "", credits: "" }]);
            setNextId((value) => value + 1);
          }}
        >
          Add semester
        </Button>
      </div>

      <div className="mt-6">
        {Number.isFinite(result.cgpa) ? (
          <ResultCard
            label="Cumulative GPA"
            value={result.cgpa.toFixed(2)}
            sub={`${result.credits} credits completed · ${percent.toFixed(0)}% of the ${scale}.0 scale`}
            tone="brand"
            actions={<CopyButton text={result.cgpa.toFixed(2)} label="Copy CGPA" />}
          >
            <StatGrid
              columns={3}
              items={[
                { label: "Grade points earned", value: result.points.toFixed(1) },
                { label: "Credits counted", value: String(result.credits) },
                { label: "Equivalent letter", value: letterGrade(percent) },
              ]}
            />
            <div className="mt-4">
              <SimpleTable
                head={["Semester", "GPA", "Credits", "Points"]}
                caption="Credit-weighted contribution"
                rows={valid.map((row) => [
                  semesters.find((semester) => semester.name === row.name)?.name ?? "—",
                  row.gpa.toFixed(2),
                  String(row.credits),
                  (row.gpa * row.credits).toFixed(1),
                ])}
              />
            </div>
          </ResultCard>
        ) : (
          <Callout tone="info">Add a semester with a GPA and credit load to calculate the cumulative average.</Callout>
        )}
      </div>

      {outOfRange ? (
        <Callout tone="warning">
          {outOfRange.name} has a GPA of {outOfRange.gpa}, outside the 0–{max} scale. Check the value and the scale
          setting.
        </Callout>
      ) : null}

      <p className="mt-4 text-xs leading-relaxed text-[var(--text-subtle)]">
        CGPA is credit-weighted: a semester with more credits moves the average more. If your institution weights
        semesters by credit hours that differ from what you enter here, use the official transcript credits rather than
        course counts.
      </p>
    </ToolPanel>
  );
}
