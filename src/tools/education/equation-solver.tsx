"use client";

import { useMemo, useState } from "react";
import { Callout, CopyButton, Field, ResultCard, SimpleTable, StatGrid, TextInput, ToolPanel } from "@/components/ui";
import { formatNumber, solveEquation } from "@/lib/education";

const EXAMPLES = ["3x + 5 = 20", "x^2 - 5x + 6 = 0", "2x - 4 = 2x + 1", "x^2 + 1 = 0", "4(x) = 2x + 10"];

export default function EquationSolver() {
  const [input, setInput] = useState("x^2 - 5x + 6 = 0");
  const solution = useMemo(() => solveEquation(input), [input]);

  const rootRows = solution?.roots.length
    ? solution.roots.map((root, index) => [
        solution.roots.length === 1 ? "x" : `x${index + 1}`,
        formatNumber(root),
        `${root.toFixed(6).replace(/0+$/, "").replace(/\.$/, "")}`,
      ])
    : [];

  return (
    <ToolPanel>
      <Field
        label="Equation"
        htmlFor="eq-input"
        hint="One variable, one equals sign. Supports linear and quadratic equations such as 3x + 5 = 20 or x^2 - 5x + 6 = 0."
        error={solution === null && input.trim() ? "Could not read that equation. Use x, numbers, + − and ^2, with a single = sign." : undefined}
      >
        <TextInput
          id="eq-input"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          className="font-mono text-base"
          spellCheck={false}
          invalid={solution === null && input.trim().length > 0}
        />
      </Field>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {EXAMPLES.map((example) => (
          <button
            key={example}
            type="button"
            onClick={() => setInput(example)}
            className="border border-[var(--border)] px-2.5 py-1.5 font-mono text-[0.62rem] text-[var(--text-subtle)] transition-colors hover:border-[var(--border-strong)] hover:text-[var(--text)]"
          >
            {example}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {solution ? (
          <ResultCard
            label={solution.kind === "quadratic" ? "Quadratic solution" : solution.kind === "linear" ? "Linear solution" : "No single solution"}
            value={
              solution.kind === "identity"
                ? "All x"
                : solution.kind === "contradiction"
                  ? "No solution"
                  : solution.roots.length === 0
                    ? "No real roots"
                    : solution.roots.map((root) => `x = ${formatNumber(root)}`).join("  ·  ")
            }
            sub={
              solution.discriminant !== undefined
                ? `Discriminant ${formatNumber(solution.discriminant)} · ${solution.roots.length === 2 ? "two real roots" : solution.roots.length === 1 ? "one repeated root" : "complex roots"}`
                : "Rearranged to a single unknown"
            }
            tone="brand"
            actions={solution.roots.length ? <CopyButton text={solution.roots.map((root) => formatNumber(root)).join(", ")} label="Copy roots" /> : undefined}
          >
            <StatGrid
              columns={3}
              items={[
                { label: "Type", value: solution.kind },
                { label: "Real roots", value: String(solution.roots.length) },
                {
                  label: "Vertex",
                  value: solution.vertex ? `(${formatNumber(Number(solution.vertex.x.toFixed(4)))}, ${formatNumber(Number(solution.vertex.y.toFixed(4)))})` : "Not a parabola",
                },
              ]}
            />

            {rootRows.length > 0 && (
              <div className="mt-4">
                <SimpleTable head={["Root", "Rounded", "Six decimals"]} rows={rootRows} caption="Exact and rounded forms" />
              </div>
            )}

            <ol className="mt-4 space-y-1.5 text-sm text-[var(--text-muted)]">
              {solution.steps.map((step, index) => (
                <li key={step} className="flex gap-2">
                  <span className="font-mono text-[0.62rem] text-[var(--text-subtle)]">{String(index + 1).padStart(2, "0")}</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </ResultCard>
        ) : (
          <Callout tone="info">Type an equation with a single equals sign to solve it.</Callout>
        )}
      </div>

      {solution?.issues.map((issue) => (
        <Callout key={issue} tone="warning">
          {issue}
        </Callout>
      ))}

      <p className="mt-4 text-xs leading-relaxed text-[var(--text-subtle)]">
        Both sides are moved to the left and matched to the form ax² + bx + c = 0. Linear equations are solved directly;
        quadratics use the discriminant. Irrational roots are shown as decimals, so 2.236… is √5 rather than an exact
        surd — the steps make the derivation visible rather than hiding it.
      </p>
    </ToolPanel>
  );
}
