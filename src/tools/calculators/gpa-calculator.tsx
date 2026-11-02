"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import {
  Button,
  CopyButton,
  Field,
  ResultCard,
  Select,
  StatGrid,
  TextInput,
  ToolPanel,
} from "@/components/ui";
import { GRADE_POINTS, calculateGpa, type Course } from "@/lib/calc";
import { formatNumber } from "@/lib/utils";

const GRADES = Object.keys(GRADE_POINTS);

let nextId = 5;

export default function GpaCalculator() {
  const [courses, setCourses] = useState<Course[]>([
    { id: "1", name: "Course 1", credits: 3, grade: "A" },
    { id: "2", name: "Course 2", credits: 3, grade: "B+" },
    { id: "3", name: "Course 3", credits: 4, grade: "A-" },
    { id: "4", name: "Course 4", credits: 2, grade: "B" },
  ]);

  const result = useMemo(() => calculateGpa(courses), [courses]);

  function update(id: string, patch: Partial<Course>) {
    setCourses((current) => current.map((course) => (course.id === id ? { ...course, ...patch } : course)));
  }

  function addCourse() {
    nextId += 1;
    setCourses((current) => [
      ...current,
      { id: String(nextId), name: `Course ${current.length + 1}`, credits: 3, grade: "A" },
    ]);
  }

  const summary = Number.isFinite(result.gpa)
    ? `GPA ${result.gpa.toFixed(2)} over ${result.credits} credits (${result.points.toFixed(2)} grade points)`
    : "Add at least one course with credits.";

  return (
    <ToolPanel>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[34rem] border-collapse text-sm">
          <caption className="sr-only">Courses and grades</caption>
          <thead>
            <tr>
              {["Course", "Credits", "Grade", ""].map((head) => (
                <th
                  key={head}
                  scope="col"
                  className="border-b border-[var(--border)] pb-2 text-left text-[0.7rem] font-semibold uppercase tracking-[0.07em] text-[var(--text-subtle)]"
                >
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {courses.map((course) => (
              <tr key={course.id}>
                <td className="py-1.5 pr-2">
                  <label htmlFor={`gpa-name-${course.id}`} className="sr-only">
                    Course name
                  </label>
                  <TextInput
                    id={`gpa-name-${course.id}`}
                    value={course.name}
                    onChange={(event) => update(course.id, { name: event.target.value })}
                    className="!min-h-9 !py-1 !text-[0.85rem]"
                  />
                </td>
                <td className="py-1.5 pr-2">
                  <label htmlFor={`gpa-credits-${course.id}`} className="sr-only">
                    Credits
                  </label>
                  <TextInput
                    id={`gpa-credits-${course.id}`}
                    type="number"
                    min={0}
                    step={0.5}
                    value={course.credits}
                    onChange={(event) => update(course.id, { credits: Number(event.target.value) })}
                    className="!min-h-9 !w-20 !py-1 !text-[0.85rem]"
                  />
                </td>
                <td className="py-1.5 pr-2">
                  <label htmlFor={`gpa-grade-${course.id}`} className="sr-only">
                    Grade
                  </label>
                  <Select
                    id={`gpa-grade-${course.id}`}
                    value={course.grade}
                    onChange={(event) => update(course.id, { grade: event.target.value })}
                    className="!min-h-9 !w-24 !py-1 !text-[0.85rem]"
                  >
                    {GRADES.map((grade) => (
                      <option key={grade} value={grade}>
                        {grade} ({GRADE_POINTS[grade].toFixed(1)})
                      </option>
                    ))}
                  </Select>
                </td>
                <td className="py-1.5">
                  <button
                    type="button"
                    aria-label={`Remove ${course.name}`}
                    onClick={() => setCourses((current) => current.filter((item) => item.id !== course.id))}
                    className="rounded p-1.5 text-[var(--text-subtle)] hover:text-rose-600"
                  >
                    <Trash2 className="size-4" aria-hidden />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <Button size="sm" variant="secondary" onClick={addCourse}>
          <Plus className="size-3.5" aria-hidden /> Add course
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setCourses([])}>
          Clear all
        </Button>
      </div>

      <div className="mt-4">
        {Number.isFinite(result.gpa) ? (
          <ResultCard
            label="Weighted GPA (4.0 scale)"
            value={result.gpa.toFixed(2)}
            sub={`${result.credits} credit hours · ${formatNumber(result.points, 2)} grade points`}
            actions={<CopyButton text={summary} />}
          >
            <StatGrid
              columns={3}
              items={[
                { label: "Credits", value: formatNumber(result.credits) },
                { label: "Grade points", value: formatNumber(result.points, 2) },
                { label: "Courses counted", value: formatNumber(courses.filter((course) => course.credits > 0).length) },
              ]}
            />
          </ResultCard>
        ) : (
          <ResultCard label="Weighted GPA (4.0 scale)" value="—" tone="neutral" sub="Add a course with credits greater than zero." />
        )}
      </div>

      <p className="mt-3 text-xs text-[var(--text-subtle)]">
        Courses with zero credits are excluded because they cannot affect a weighted average.
        Grade scales vary between institutions — some award A+ = 4.3 or weight honours courses
        differently.
      </p>
    </ToolPanel>
  );
}
