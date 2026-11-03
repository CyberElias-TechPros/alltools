"use client";

import { useMemo, useState } from "react";
import { Callout, CopyButton, Field, ResultCard, Segmented, SimpleTable, StatGrid, TextInput, ToolPanel } from "@/components/ui";
import { evaluatePolynomial, parsePolynomial, simplifyPolynomial, solveSystem2 } from "@/lib/education";

type Mode = "simplify" | "evaluate" | "system";

export default function AlgebraCalculator() {
  const [mode, setMode] = useState<Mode>("simplify");
  const [expression, setExpression] = useState("3x + 2x - 4 + x^2");
  const [x, setX] = useState("2");
  const [system, setSystem] = useState({ a1: "2", b1: "1", c1: "5", a2: "1", b2: "-1", c2: "1" });

  const polynomial = useMemo(() => parsePolynomial(expression), [expression]);
  const simplified = useMemo(() => simplifyPolynomial(expression), [expression]);
  const evaluated = polynomial ? evaluatePolynomial(polynomial, Number(x)) : null;
  const solved = useMemo(
    () =>
      solveSystem2({
        a1: Number(system.a1),
        b1: Number(system.b1),
        c1: Number(system.c1),
        a2: Number(system.a2),
        b2: Number(system.b2),
        c2: Number(system.c2),
      }),
    [system],
  );

  return (
    <ToolPanel>
      <Segmented
        label="What to do"
        value={mode}
        onChange={setMode}
        options={[
          { value: "simplify", label: "Simplify" },
          { value: "evaluate", label: "Evaluate at x" },
          { value: "system", label: "Solve 2×2 system" },
        ]}
      />

      {mode !== "system" ? (
        <>
          <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_8rem]">
            <Field
              label="Expression in x"
              htmlFor="alg-expr"
              hint="Terms like 3x, -x, 2x^2 and constants. Like terms are combined."
              error={polynomial === null && expression.trim() ? "Only polynomials in x are supported (no brackets, division or other variables)." : undefined}
            >
              <TextInput
                id="alg-expr"
                value={expression}
                onChange={(event) => setExpression(event.target.value)}
                className="font-mono text-base"
                spellCheck={false}
                invalid={polynomial === null && expression.trim().length > 0}
              />
            </Field>
            {mode === "evaluate" ? (
              <Field label="x =" htmlFor="alg-x">
                <TextInput id="alg-x" type="number" value={x} onChange={(event) => setX(event.target.value)} className="font-mono" />
              </Field>
            ) : null}
          </div>

          <div className="mt-6">
            {polynomial ? (
              <ResultCard
                label={mode === "simplify" ? "Simplified" : "Value"}
                value={
                  mode === "simplify"
                    ? simplified ?? "0"
                    : evaluated === null || !Number.isFinite(evaluated)
                      ? "—"
                      : String(Number(evaluated.toPrecision(10)))
                }
                sub={
                  mode === "simplify"
                    ? `a = ${polynomial.a}, b = ${polynomial.b}, c = ${polynomial.c}`
                    : `${expression.trim()} with x = ${x}`
                }
                tone="brand"
                actions={
                  mode === "simplify" && simplified ? <CopyButton text={simplified} label="Copy" /> : undefined
                }
              >
                <StatGrid
                  columns={3}
                  items={[
                    { label: "Degree", value: polynomial.a !== 0 ? "2" : polynomial.b !== 0 ? "1" : "0" },
                    { label: "x² coefficient", value: String(polynomial.a) },
                    { label: "x coefficient", value: String(polynomial.b) },
                  ]}
                />
              </ResultCard>
            ) : (
              <Callout tone="info">Enter a polynomial such as 4x^2 - 3x + 7 to see its simplified form.</Callout>
            )}
          </div>
        </>
      ) : (
        <div className="mt-4">
          <p className="text-sm text-[var(--text-muted)]">
            Two equations of the form a₁x + b₁y = c₁ and a₂x + b₂y = c₂, solved with Cramer&apos;s rule.
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {(["a1", "b1", "c1", "a2", "b2", "c2"] as const).map((key) => (
              <Field key={key} label={`${key[0].toUpperCase()}${key[1] === "1" ? "₁" : "₂"}${key[0] === "a" ? "x" : key[0] === "b" ? "y" : ""}`} htmlFor={`sys-${key}`}>
                <TextInput
                  id={`sys-${key}`}
                  type="number"
                  step="any"
                  value={system[key]}
                  onChange={(event) => setSystem((current) => ({ ...current, [key]: event.target.value }))}
                  className="font-mono"
                />
              </Field>
            ))}
          </div>

          <div className="mt-6">
            {solved ? (
              <ResultCard label="Solution" value={`x = ${Number(solved.x.toPrecision(10))}, y = ${Number(solved.y.toPrecision(10))}`} sub="The two lines cross at exactly one point" tone="brand">
                <SimpleTable
                  head={["Check", "Left side", "Right side"]}
                  caption="Substituting the answer back into both equations"
                  rows={[
                    [
                      "Equation 1",
                      String(Number(((Number(system.a1) * solved.x) + Number(system.b1) * solved.y).toPrecision(10))),
                      String(Number(Number(system.c1).toPrecision(10))),
                    ],
                    [
                      "Equation 2",
                      String(Number(((Number(system.a2) * solved.x) + Number(system.b2) * solved.y).toPrecision(10))),
                      String(Number(Number(system.c2).toPrecision(10))),
                    ],
                  ]}
                />
              </ResultCard>
            ) : (
              <Callout tone="warning">
                The determinant is zero, so the lines are parallel or identical — there is no unique solution.
              </Callout>
            )}
          </div>
        </div>
      )}

      <p className="mt-4 text-xs leading-relaxed text-[var(--text-subtle)]">
        This is a polynomial calculator, not a computer algebra system: it combines like terms, evaluates expressions and
        solves 2×2 linear systems. Brackets are not expanded and there is no factoring or symbolic manipulation — the
        page says so rather than silently giving a wrong answer.
      </p>
    </ToolPanel>
  );
}
