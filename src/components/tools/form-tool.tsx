"use client";

import { useMemo, useState, type ReactNode } from "react";
import { RotateCcw } from "lucide-react";
import {
  Button,
  CopyButton,
  DownloadButton,
  Field,
  ResultCard,
  Select,
  SimpleTable,
  StatGrid,
  Switch,
  TextArea,
  TextInput,
  ToolPanel,
} from "@/components/ui";

/* ------------------------------------------------------------------ */
/* Declarative field schema                                            */
/* ------------------------------------------------------------------ */

export type FormField =
  | {
      kind: "number";
      id: string;
      label: string;
      value: string;
      placeholder?: string;
      hint?: string;
      optional?: boolean;
      min?: number;
      max?: number;
      step?: number | "any";
      unit?: string;
      span?: 1 | 2;
    }
  | {
      kind: "text";
      id: string;
      label: string;
      value: string;
      placeholder?: string;
      hint?: string;
      optional?: boolean;
      mono?: boolean;
      span?: 1 | 2;
    }
  | {
      kind: "date";
      id: string;
      label: string;
      value: string;
      hint?: string;
      placeholder?: string;
      span?: 1 | 2;
    }
  | {
      kind: "select";
      id: string;
      label: string;
      value: string;
      hint?: string;
      options: Array<{ value: string; label: string }>;
      span?: 1 | 2;
    }
  | {
      kind: "toggle";
      id: string;
      label: string;
      value: boolean;
      hint?: string;
      description?: string;
    }
  | {
      kind: "textarea";
      id: string;
      label: string;
      value: string;
      placeholder?: string;
      hint?: string;
      rows?: number;
      span?: 2;
    };

export type Values = Record<string, string>;

export function num(values: Values, id: string, fallback = NaN): number {
  const raw = values[id];
  if (raw === undefined || raw.trim() === "") return fallback;
  const parsed = Number(raw.replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function bool(values: Values, id: string): boolean {
  return values[id] === "true";
}

export function str(values: Values, id: string): string {
  return values[id] ?? "";
}

export type FormResult = {
  /** Short label above the headline figure. */
  label?: string;
  /** Headline figure or text. */
  value?: ReactNode;
  sub?: ReactNode;
  tone?: "brand" | "neutral";
  stats?: Array<{ label: string; value: ReactNode; hint?: string }>;
  table?: { head: string[]; rows: ReactNode[][]; caption?: string };
  /** Copyable/exportable text result. */
  output?: { label: string; text: string; downloadName?: string };
  note?: ReactNode;
  extra?: ReactNode;
  error?: string;
};

export type FormSpec = {
  fields: FormField[];
  compute: (values: Values) => FormResult | null;
  columns?: 2 | 3 | 4;
  footnote?: ReactNode;
  /** Recompute only when the reader presses the button (heavier calculations). */
  manual?: boolean;
  submitLabel?: string;
};

function defaultsFor(fields: FormField[]): Values {
  const values: Values = {};
  for (const field of fields) {
    values[field.id] = field.kind === "toggle" ? String(field.value) : field.value;
  }
  return values;
}

const columnClass: Record<number, string> = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
};

/**
 * Shared shell for input → calculated result tools.
 *
 * One implementation means every calculator inherits the same focus rings,
 * mobile stacking, validation messages, copy/download behaviour and empty
 * state. Each tool supplies a field schema and a pure `compute` function that
 * runs in the browser.
 */
export function FormTool({ spec }: { spec: FormSpec }) {
  const [values, setValues] = useState<Values>(() => defaultsFor(spec.fields));
  const [submitted, setSubmitted] = useState<Values | null>(spec.manual ? null : null);
  const active = spec.manual ? submitted ?? values : values;

  const result = useMemo(() => {
    if (spec.manual && !submitted) return null;
    try {
      return spec.compute(active);
    } catch {
      return { error: "Those inputs could not be calculated. Check the numbers and try again." };
    }
  }, [spec, active, submitted]);

  function update(id: string, next: string) {
    setValues((current) => ({ ...current, [id]: next }));
  }

  const columns = spec.columns ?? 3;

  return (
    <ToolPanel>
      <form
        onSubmit={(event) => {
          event.preventDefault();
        }}
      >
        <div className={`grid gap-3 ${columnClass[columns]}`}>
          {spec.fields.map((field) => {
            const span =
              (field as { span?: 1 | 2 }).span === 2 || field.kind === "textarea"
                ? "sm:col-span-2"
                : undefined;
            if (field.kind === "toggle") {
              return (
                <div key={field.id} className="sm:col-span-1 flex items-center">
                  <div className="w-full">
                    <Switch
                      id={`${field.id}-switch`}
                      checked={bool(values, field.id)}
                      onChange={(next) => update(field.id, String(next))}
                      label={field.label}
                      description={field.hint ?? field.description}
                    />
                  </div>
                </div>
              );
            }
            if (field.kind === "select") {
              return (
                <Field
                  key={field.id}
                  label={field.label}
                  htmlFor={field.id}
                  hint={field.hint}
                  className={span}
                >
                  <Select
                    id={field.id}
                    value={values[field.id]}
                    onChange={(event) => update(field.id, event.target.value)}
                  >
                    {field.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </Field>
              );
            }
            if (field.kind === "textarea") {
              return (
                <Field
                  key={field.id}
                  label={field.label}
                  htmlFor={field.id}
                  hint={field.hint}
                  className={span}
                >
                  <TextArea
                    id={field.id}
                    value={values[field.id]}
                    placeholder={field.placeholder}
                    style={{ minHeight: `${(field.rows ?? 6) * 1.6}rem` }}
                    onChange={(event) => update(field.id, event.target.value)}
                  />
                </Field>
              );
            }
            return (
              <Field
                key={field.id}
                label={field.label}
                htmlFor={field.id}
                hint={field.hint}
                optional={"optional" in field ? field.optional : undefined}
                className={span}
              >
                <div className="relative">
                  <TextInput
                    id={field.id}
                    type={field.kind === "number" ? "number" : field.kind === "date" ? "date" : "text"}
                    inputMode={field.kind === "number" ? "decimal" : undefined}
                    step={field.kind === "number" ? field.step : undefined}
                    min={field.kind === "number" ? field.min : undefined}
                    max={field.kind === "number" ? field.max : undefined}
                    value={values[field.id]}
                    placeholder={field.placeholder}
                    className={
                      field.kind === "number" && field.unit ? "pr-12" : field.kind === "text" && field.mono ? "font-mono text-[0.85rem]" : undefined
                    }
                    onChange={(event) => update(field.id, event.target.value)}
                  />
                  {field.kind === "number" && field.unit ? (
                    <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center font-mono text-xs text-[var(--text-subtle)]">
                      {field.unit}
                    </span>
                  ) : null}
                </div>
              </Field>
            );
          })}
        </div>

        {spec.manual ? (
          <div className="mt-4 flex flex-wrap gap-2">
            <Button type="submit" variant="primary" onClick={() => setSubmitted({ ...values })}>
              {spec.submitLabel ?? "Calculate"}
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setValues(defaultsFor(spec.fields));
                setSubmitted(null);
              }}
            >
              <RotateCcw className="size-4" aria-hidden />
              Reset
            </Button>
          </div>
        ) : null}
      </form>

      <div className="mt-4">
        {result?.error ? (
          <ResultCard label="Check the inputs" value="—" tone="neutral" sub={result.error} />
        ) : result ? (
          <ResultCard
            label={result.label ?? "Result"}
            value={result.value ?? "—"}
            sub={result.sub}
            tone={result.tone ?? "brand"}
            actions={
              result.output ? (
                <>
                  <CopyButton text={result.output.text} />
                  {result.output.downloadName ? (
                    <DownloadButton
                      content={result.output.text}
                      filename={result.output.downloadName}
                      label="Download"
                    />
                  ) : null}
                </>
              ) : undefined
            }
          >
            {result.stats && result.stats.length > 0 ? (
              <StatGrid columns={Math.min(result.stats.length, 4) as 2 | 3 | 4} items={result.stats} />
            ) : null}
          </ResultCard>
        ) : (
          <ResultCard
            label={spec.manual ? "Not calculated yet" : "Result"}
            value="—"
            tone="neutral"
            sub={
              spec.manual
                ? `Fill in the fields and press ${spec.submitLabel ?? "Calculate"}.`
                : "Enter the values above to see the result."
            }
          />
        )}
      </div>

      {result?.output ? (
        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="label !mb-0">{result.output.label}</span>
          </div>
          <TextArea
            readOnly
            value={result.output.text}
            aria-label={result.output.label}
            className="min-h-32 font-mono text-[0.82rem]"
          />
        </div>
      ) : null}

      {result?.table && result.table.rows.length > 0 ? (
        <div className="mt-4">
          <SimpleTable
            head={result.table.head}
            rows={result.table.rows}
            caption={result.table.caption}
          />
        </div>
      ) : null}

      {result?.extra ? <div className="mt-4">{result.extra}</div> : null}
      {result?.note ? (
        <p className="mt-3 text-xs leading-relaxed text-[var(--text-subtle)]">{result.note}</p>
      ) : null}
      {spec.footnote ? (
        <p className="mt-3 text-xs leading-relaxed text-[var(--text-subtle)]">{spec.footnote}</p>
      ) : null}
    </ToolPanel>
  );
}
