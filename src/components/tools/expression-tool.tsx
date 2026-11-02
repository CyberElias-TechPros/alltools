"use client";

import { useState } from "react";
import { CopyButton, StatGrid, Switch, TextInput, ToolPanel } from "@/components/ui";
import { evaluateExpression, formatNumber } from "@/lib/math";

const BASIC_KEYS = ["7", "8", "9", "÷", "4", "5", "6", "×", "1", "2", "3", "−", "0", ".", "( )", "+"];
const SCIENTIFIC_KEYS = ["sin(", "cos(", "tan(", "log(", "ln(", "sqrt(", "cbrt(", "abs(", "pi", "e", "^", "C"];

/**
 * Shared keypad + expression input used by the basic and scientific
 * calculators. The expression is parsed by our own shunting-yard evaluator, so
 * nothing is executed with `eval()` and the tool works offline.
 */
export function ExpressionTool({
  id,
  scientific = false,
  degreesDefault = false,
}: {
  id: string;
  scientific?: boolean;
  degreesDefault?: boolean;
}) {
  const [expression, setExpression] = useState("");
  const [degrees, setDegrees] = useState(degreesDefault);
  const [history, setHistory] = useState<Array<{ expression: string; result: string }>>([]);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function compute(next = expression) {
    if (!next.trim()) {
      setError(null);
      setResult(null);
      return;
    }
    try {
      const value = evaluateExpression(next, { degrees });
      const text = formatNumber(value);
      setResult(text);
      setError(null);
      setHistory((current) => [{ expression: next, result: text }, ...current].slice(0, 8));
    } catch (thrown) {
      setResult(null);
      setError(thrown instanceof Error ? thrown.message : "That expression could not be read.");
    }
  }

  function append(token: string) {
    if (token === "C") {
      setExpression("");
      setResult(null);
      setError(null);
      return;
    }
    if (token === "( )") {
      const opens = (expression.match(/\(/g) ?? []).length;
      const closes = (expression.match(/\)/g) ?? []).length;
      const token2 = opens > closes ? ")" : "(";
      setExpression((current) => current + token2);
      return;
    }
    setExpression((current) => current + token);
  }

  const copyText = result ? `${expression} = ${result}` : "";

  return (
    <ToolPanel>
      <div className="grid gap-4 lg:grid-cols-[1.15fr_1fr]">
        <div>
          <label htmlFor={`${id}-expression`} className="label">
            Expression
          </label>
          <TextInput
            id={`${id}-expression`}
            value={expression}
            placeholder={scientific ? "e.g. 2*sin(45)+sqrt(9)" : "e.g. (1250-980)*1.2"}
            autoComplete="off"
            spellCheck={false}
            className="font-mono text-base"
            onChange={(event) => setExpression(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                compute();
              }
            }}
          />

          <div className="mt-3 grid grid-cols-4 gap-2">
            {BASIC_KEYS.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => append(key.replace("×", "*").replace("÷", "/").replace("−", "-"))}
                className="border border-[var(--border)] bg-[var(--page-elevated)] py-2.5 font-mono text-sm text-[var(--text)] transition-colors hover:border-[var(--border-strong)] hover:bg-[var(--surface-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
              >
                {key}
              </button>
            ))}
          </div>

          {scientific ? (
            <div className="mt-2 grid grid-cols-4 gap-2">
              {SCIENTIFIC_KEYS.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => append(key)}
                  className="border border-[var(--border)] bg-[var(--surface-muted)] py-2 font-mono text-[0.78rem] text-[var(--text-muted)] transition-colors hover:border-[var(--border-strong)] hover:text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                >
                  {key}
                </button>
              ))}
            </div>
          ) : null}

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => compute()}
              className="btn btn-primary"
            >
              =
            </button>
            <button
              type="button"
              onClick={() => setExpression((current) => current.slice(0, -1))}
              className="btn btn-secondary"
            >
              Backspace
            </button>
            <button
              type="button"
              onClick={() => {
                setExpression("");
                setResult(null);
                setError(null);
              }}
              className="btn btn-ghost"
            >
              Clear
            </button>
            {scientific ? (
              <Switch
                id={`${id}-degrees`}
                checked={degrees}
                onChange={(next) => {
                  setDegrees(next);
                  if (expression.trim()) {
                    try {
                      setResult(formatNumber(evaluateExpression(expression, { degrees: next })));
                      setError(null);
                    } catch {
                      /* keep the previous result until the next evaluation */
                    }
                  }
                }}
                label="Degrees"
              />
            ) : null}
          </div>
        </div>

        <div>
          <div className="border border-[var(--border)] bg-[var(--page-elevated)] p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="eyebrow">Result</p>
                <p
                  aria-live="polite"
                  className="mt-1 break-all font-mono text-3xl font-semibold tracking-tight text-[var(--text)]"
                >
                  {result ?? "—"}
                </p>
              </div>
              {result ? <CopyButton text={copyText} /> : null}
            </div>
            {error ? (
              <p role="alert" className="mt-3 text-sm text-red-600 dark:text-red-400">
                {error}
              </p>
            ) : (
              <p className="mt-3 text-xs leading-relaxed text-[var(--text-subtle)]">
                Press Enter to evaluate. Supports + − × ÷, powers with ^, brackets, percentages with %, and
                {scientific ? " sin/cos/tan, log/ln, sqrt, pi and e." : " parentheses."}
              </p>
            )}
          </div>

          {history.length > 0 ? (
            <div className="mt-3">
              <p className="eyebrow mb-2">History</p>
              <ul className="divide-y divide-[var(--border)] border border-[var(--border)]">
                {history.map((entry, index) => (
                  <li key={`${entry.expression}-${index}`} className="flex items-center justify-between gap-3 px-3 py-2">
                    <button
                      type="button"
                      onClick={() => setExpression(entry.expression)}
                      className="truncate text-left font-mono text-xs text-[var(--text-muted)] hover:text-[var(--text)]"
                    >
                      {entry.expression}
                    </button>
                    <span className="shrink-0 font-mono text-xs font-semibold text-[var(--text)]">
                      {entry.result}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {scientific ? (
            <div className="mt-3">
              <StatGrid
                columns={2}
                items={[
                  { label: "Constants", value: "π, e, τ" },
                  { label: "Angle unit", value: degrees ? "Degrees" : "Radians" },
                ]}
              />
            </div>
          ) : null}
        </div>
      </div>
    </ToolPanel>
  );
}
