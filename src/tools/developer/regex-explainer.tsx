"use client";

import { useMemo, useState } from "react";
import { CopyButton, Field, ResultCard, TextInput, ToolPanel } from "@/components/ui";
import { explainRegex, REGEX_CHEATSHEET } from "@/lib/regex";

const SAMPLES = [
  { label: "Email", pattern: "[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}", flags: "i" },
  { label: "ISO date", pattern: "(?<year>\\d{4})-(?<month>\\d{2})-(?<day>\\d{2})", flags: "" },
  { label: "Price", pattern: "\\$\\d{1,3}(?:,\\d{3})*(?:\\.\\d{2})?", flags: "" },
  { label: "Password rule", pattern: "^(?=.*[A-Z])(?=.*\\d).{8,}$", flags: "" },
];

export default function RegexExplainer() {
  const [pattern, setPattern] = useState(SAMPLES[0].pattern);
  const [flags, setFlags] = useState(SAMPLES[0].flags);
  const explanation = useMemo(() => explainRegex(pattern, flags), [pattern, flags]);

  return (
    <ToolPanel>
      <div className="grid gap-4 sm:grid-cols-[1fr_8rem]">
        <Field label="Pattern" htmlFor="explain-pattern" hint="Paste the expression without its slashes.">
          <TextInput
            id="explain-pattern"
            value={pattern}
            onChange={(event) => setPattern(event.target.value)}
            placeholder="\\d{3}-\\d{4}"
            spellCheck={false}
            className="font-mono text-[0.85rem]"
            invalid={!explanation.valid}
          />
        </Field>
        <Field label="Flags" htmlFor="explain-flags">
          <TextInput
            id="explain-flags"
            value={flags}
            onChange={(event) => setFlags(event.target.value.replace(/[^dgimsuvy]/g, ""))}
            placeholder="gim"
            spellCheck={false}
            className="font-mono text-[0.85rem]"
          />
        </Field>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {SAMPLES.map((sample) => (
          <button
            key={sample.label}
            type="button"
            onClick={() => {
              setPattern(sample.pattern);
              setFlags(sample.flags);
            }}
            className="border border-[var(--border)] px-2.5 py-1.5 font-mono text-[0.6rem] uppercase tracking-[0.1em] text-[var(--text-subtle)] transition-colors hover:border-[var(--border-strong)] hover:text-[var(--text)]"
          >
            {sample.label}
          </button>
        ))}
      </div>

      <div className="mt-5">
        {explanation.error ? (
          <div role="alert" className="border border-[#c0392b] bg-[var(--surface-muted)] p-3 font-mono text-[0.8rem] text-[#8d2f22] dark:text-[#ff9a8a]">
            {explanation.error}
          </div>
        ) : (
          <ResultCard
            label="Reading order"
            value={`${explanation.parts.length} part(s)`}
            tone="brand"
            sub={`/${pattern}/${flags}`}
          >
            <ol className="divide-y divide-[var(--border)] border-y border-[var(--border)]">
              {explanation.parts.map((part, index) => (
                <li
                  key={`${index}-${part.token}`}
                  className="grid gap-1 py-2 sm:grid-cols-[9rem_1fr] sm:gap-4"
                  style={{ paddingLeft: `${part.depth * 0.9}rem` }}
                >
                  <code className="font-mono text-[0.82rem] text-[var(--accent-text)]">{part.token}</code>
                  <div>
                    <p className="text-sm font-medium leading-snug text-[var(--text)]">{part.label}</p>
                    {part.detail ? (
                      <p className="mt-0.5 text-xs leading-relaxed text-[var(--text-subtle)]">{part.detail}</p>
                    ) : null}
                  </div>
                </li>
              ))}
            </ol>
            <div className="mt-4">
              <CopyButton text={`/${pattern}/${flags}`} label="Copy pattern" />
            </div>
          </ResultCard>
        )}
      </div>

      <div className="mt-6">
        <p className="label">Cheat sheet</p>
        <dl className="grid gap-px overflow-hidden border border-[var(--border)] bg-[var(--border)] sm:grid-cols-2 lg:grid-cols-3">
          {REGEX_CHEATSHEET.map((item) => (
            <div key={item.token} className="bg-[var(--surface)] px-3 py-2">
              <dt className="font-mono text-[0.8rem] text-[var(--accent-text)]">{item.token}</dt>
              <dd className="mt-0.5 text-xs leading-relaxed text-[var(--text-subtle)]">{item.meaning}</dd>
            </div>
          ))}
        </dl>
      </div>
    </ToolPanel>
  );
}
