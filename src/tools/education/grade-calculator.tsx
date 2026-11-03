"use client";

import { useMemo, useState } from "react";
import { Button, Callout, Field, ResultCard, StatGrid, TextInput, ToolPanel } from "@/components/ui";
import { scoreNeededForTarget, weightedGrade } from "@/lib/education";

interface Row {
  id: number;
  name: string;
  score: string;
  weight: string;
}

const SEED: Row[] = [
  { id: 1, name: "Homework", score: "92", weight: "20" },
  { id: 2, name: "Quizzes", score: "85", weight: "20" },
  { id: 3, name: "Midterm", score: "78", weight: "25" },
  { id: 4, name: "Final exam", score: "", weight: "35" },
];

export default function GradeCalculator() {
  const [rows, setRows] = useState<Row[]>(SEED);
  const [target, setTarget] = useState("90");
  const [nextId, setNextId] = useState(5);

  const categories = rows.map((row) => ({
    name: row.name || "Untitled",
    score: row.score.trim() === "" ? Number.NaN : Number(row.score),
    weight: Number(row.weight),
  }));

  const grade = useMemo(() => weightedGrade(categories), [rows]);
  const needed = useMemo(() => scoreNeededForTarget(categories, Number(target)), [rows, target]);

  const update = (id: number, patch: Partial<Row>) =>
    setRows((current) => current.map((row) => (row.id === id ? { ...row, ...patch } : row)));

  return (
    <ToolPanel>
      <div className="space-y-2">
        <div className="hidden grid-cols-[1fr_5rem_5rem_2rem] gap-2 sm:grid">
          <span className="label !mb-0">Category</span>
          <span className="label !mb-0">Score %</span>
          <span className="label !mb-0">Weight %</span>
          <span className="sr-only">Remove</span>
        </div>
        {rows.map((row) => (
          <div key={row.id} className="grid grid-cols-2 gap-2 sm:grid-cols-[1fr_5rem_5rem_2rem]">
            <TextInput
              aria-label="Category name"
              value={row.name}
              onChange={(event) => update(row.id, { name: event.target.value })}
              placeholder="Category"
              className="col-span-2 sm:col-span-1"
            />
            <TextInput
              aria-label={`${row.name || "Category"} score`}
              type="number"
              min={0}
              max={100}
              inputMode="decimal"
              value={row.score}
              onChange={(event) => update(row.id, { score: event.target.value })}
              placeholder="—"
            />
            <TextInput
              aria-label={`${row.name || "Category"} weight`}
              type="number"
              min={0}
              max={100}
              inputMode="decimal"
              value={row.weight}
              onChange={(event) => update(row.id, { weight: event.target.value })}
              invalid={!Number.isFinite(Number(row.weight))}
            />
            <Button
              variant="ghost"
              size="sm"
              aria-label={`Remove ${row.name || "row"}`}
              onClick={() => setRows((current) => current.filter((candidate) => candidate.id !== row.id))}
            >
              ✕
            </Button>
          </div>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-end gap-3">
        <Button
          onClick={() => {
            setRows((current) => [...current, { id: nextId, name: "", score: "", weight: "" }]);
            setNextId((value) => value + 1);
          }}
        >
          Add category
        </Button>
        <Field label="Target grade %" htmlFor="grade-target" className="w-32">
          <TextInput
            id="grade-target"
            type="number"
            min={0}
            max={100}
            value={target}
            onChange={(event) => setTarget(event.target.value)}
            className="font-mono"
          />
        </Field>
      </div>

      <div className="mt-6">
        {Number.isFinite(grade.percent) ? (
          <ResultCard
            label="Current grade"
            value={`${grade.percent.toFixed(1)}%`}
            sub={`${grade.letter} · ${grade.gpa.toFixed(1)} grade points`}
            tone="brand"
          >
            <StatGrid
              columns={3}
              items={[
                { label: "Graded weight", value: `${grade.gradedWeight}%` },
                { label: "Still to come", value: `${grade.remainingWeight}%` },
                {
                  label: `Needed for ${target || "—"}%`,
                  value:
                    grade.remainingWeight === 0
                      ? "Nothing left"
                      : needed === null || !Number.isFinite(needed)
                        ? "—"
                        : needed > 100
                          ? "Out of reach"
                          : `${Math.max(0, needed).toFixed(1)}%`,
                  hint: grade.remainingWeight === 0 ? "Every category already has a score" : "Average across the ungraded work",
                },
              ]}
            />
            {needed !== null && Number.isFinite(needed) && needed <= 0 && grade.remainingWeight > 0 ? (
              <p className="mt-3 text-xs text-[var(--text-subtle)]">
                The target is already secured even with zero on the remaining work.
              </p>
            ) : null}
          </ResultCard>
        ) : (
          <Callout tone="info">Enter at least one score to see the current grade.</Callout>
        )}
      </div>

      {grade.issues.length > 0 && (
        <div className="mt-4 space-y-2">
          {grade.issues.map((issue) => (
            <Callout key={issue} tone="warning">
              {issue}
            </Callout>
          ))}
        </div>
      )}

      <p className="mt-4 text-xs leading-relaxed text-[var(--text-subtle)]">
        A blank score means the work has not been marked yet — it counts as remaining weight rather than zero. Letter
        grades use the common US bands (93 = A, 90 = A−, 87 = B+ …); your school may cut them differently, so check the
        syllabus.
      </p>
    </ToolPanel>
  );
}
