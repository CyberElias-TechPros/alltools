"use client";

import { useMemo, useState } from "react";
import { Callout, Field, ResultCard, StatGrid, TextInput, ToolPanel } from "@/components/ui";
import { examResult } from "@/lib/education";

export default function ExamScoreCalculator() {
  const [scored, setScored] = useState("41");
  const [total, setTotal] = useState("60");
  const [pass, setPass] = useState("40");
  const [target, setTarget] = useState("70");

  const result = useMemo(
    () =>
      examResult({
        scored: Number(scored),
        total: Number(total),
        pass: Number(pass),
        target: Number(target),
      }),
    [scored, total, pass, target],
  );

  return (
    <ToolPanel>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Marks scored" htmlFor="exam-scored">
          <TextInput id="exam-scored" type="number" min={0} value={scored} onChange={(event) => setScored(event.target.value)} className="font-mono" />
        </Field>
        <Field label="Total marks" htmlFor="exam-total">
          <TextInput id="exam-total" type="number" min={1} value={total} onChange={(event) => setTotal(event.target.value)} className="font-mono" />
        </Field>
        <Field label="Pass mark %" htmlFor="exam-pass">
          <TextInput id="exam-pass" type="number" min={0} max={100} value={pass} onChange={(event) => setPass(event.target.value)} className="font-mono" />
        </Field>
        <Field label="Target %" htmlFor="exam-target">
          <TextInput id="exam-target" type="number" min={0} max={100} value={target} onChange={(event) => setTarget(event.target.value)} className="font-mono" />
        </Field>
      </div>

      <div className="mt-6">
        {Number.isFinite(result.percent) ? (
          <ResultCard
            label="Exam result"
            value={`${result.percent.toFixed(1)}%`}
            sub={`${result.letter} · ${result.passed ? "passed" : "below the pass mark"}`}
            tone={result.passed ? "brand" : "neutral"}
          >
            <StatGrid
              columns={4}
              items={[
                { label: "Grade point", value: result.gpa.toFixed(1) },
                { label: "Marks lost", value: String(result.losingMarks) },
                { label: `Needed for ${target || "—"}%`, value: result.correctForTarget === null ? "—" : `${result.correctForTarget} marks` },
                { label: "Pass mark", value: `${pass || "—"}%` },
              ]}
            />
            {result.correctForTarget !== null && Number.isFinite(Number(total)) ? (
              <p className="mt-3 text-xs leading-relaxed text-[var(--text-subtle)]">
                {result.correctForTarget <= Number(scored)
                  ? `You are ${Number(scored) - result.correctForTarget} marks above the target band.`
                  : `${result.correctForTarget - Number(scored)} more marks would have reached the ${target}% target.`}
              </p>
            ) : null}
          </ResultCard>
        ) : (
          <Callout tone="info">Enter the marks scored and the paper total.</Callout>
        )}
      </div>

      {result.issues.map((issue) => (
        <Callout key={issue} tone="warning">
          {issue}
        </Callout>
      ))}

      <p className="mt-4 text-xs leading-relaxed text-[var(--text-subtle)]">
        This is arithmetic on the numbers you type — whether the paper was marked correctly, or how your school rounds a
        boundary mark, is outside it. Where a grade sits exactly on a boundary, assume the lower band until the
        institution confirms otherwise.
      </p>
    </ToolPanel>
  );
}
