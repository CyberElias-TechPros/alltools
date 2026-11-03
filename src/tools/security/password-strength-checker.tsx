"use client";

import { useMemo, useState } from "react";
import { Callout, Field, ResultCard, SimpleTable, StatGrid, TextInput, ToolPanel } from "@/components/ui";
import { analysePassword } from "@/lib/security";

const SAMPLES = ["password123", "Tr0ub4dor&3", "correct horse battery staple", "qwerty2024!"];

export default function PasswordStrengthChecker() {
  const [password, setPassword] = useState("");
  const [revealed, setRevealed] = useState(false);
  const analysis = useMemo(() => (password ? analysePassword(password) : null), [password]);

  const bar =
    analysis === null
      ? 0
      : analysis.label === "Very weak"
        ? 15
        : analysis.label === "Weak"
          ? 35
          : analysis.label === "Fair"
            ? 55
            : analysis.label === "Strong"
              ? 80
              : 100;

  return (
    <ToolPanel>
      <Field
        label="Password to check"
        htmlFor="strength-input"
        hint="Checked in this tab only — nothing is transmitted, logged or stored."
      >
        <div className="flex gap-2">
          <TextInput
            id="strength-input"
            type={revealed ? "text" : "password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="font-mono text-[0.9rem]"
            autoComplete="off"
            spellCheck={false}
            placeholder="Type or paste a password"
          />
          <button
            type="button"
            className="btn btn-secondary shrink-0"
            onClick={() => setRevealed((current) => !current)}
            aria-pressed={revealed}
          >
            {revealed ? "Hide" : "Show"}
          </button>
        </div>
      </Field>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {SAMPLES.map((sample) => (
          <button
            key={sample}
            type="button"
            className="border border-[var(--border)] px-2.5 py-1.5 font-mono text-[0.65rem] text-[var(--text-subtle)] transition-colors hover:border-[var(--border-strong)] hover:text-[var(--text)]"
            onClick={() => setPassword(sample)}
          >
            {sample}
          </button>
        ))}
      </div>

      <div className="mt-5">
        <div className="h-2 w-full bg-[var(--surface-muted)]" role="progressbar" aria-valuenow={bar} aria-valuemin={0} aria-valuemax={100} aria-label="Password strength">
          <div
            className={`h-full transition-[width] ${
              bar < 40 ? "bg-[#c0392b]" : bar < 70 ? "bg-[#c98a00]" : "bg-[var(--ring)]"
            }`}
            style={{ width: `${bar}%` }}
          />
        </div>
        {analysis ? (
          <p className="mt-2 font-mono text-[0.65rem] uppercase tracking-[0.12em] text-[var(--text-subtle)]">
            {analysis.label} · {analysis.entropyBits} bits
          </p>
        ) : (
          <p className="mt-2 text-xs text-[var(--text-subtle)]">Start typing to see the assessment.</p>
        )}
      </div>

      {analysis ? (
        <div className="mt-5">
          <ResultCard
            label="Assessment"
            value={analysis.label}
            tone="brand"
            sub={`${analysis.length} characters · ${analysis.charsetSize}-symbol alphabet · about ${analysis.crackTime} to crack offline`}
          >
            <StatGrid
              columns={3}
              items={[
                { label: "Length", value: String(analysis.length) },
                { label: "Entropy", value: `${analysis.entropyBits} bits` },
                { label: "Charset", value: String(analysis.charsetSize), hint: "Distinct symbol pool used" },
              ]}
            />

            {analysis.warnings.length ? (
              <div className="mt-4">
                <SimpleTable
                  head={["Problem", "Why it matters"]}
                  caption="Weaknesses found"
                  rows={analysis.warnings.map((warning) => ["Weakness", warning])}
                />
              </div>
            ) : (
              <p className="mt-4 text-sm text-[var(--text-subtle)]">
                No structural weaknesses detected — no repeated runs, keyboard patterns, years or common-password hits.
              </p>
            )}

            {analysis.suggestions.length ? (
              <ul className="mt-3 space-y-1 text-sm leading-relaxed text-[var(--text-subtle)]">
                {analysis.suggestions.map((suggestion) => (
                  <li key={suggestion}>{suggestion}</li>
                ))}
              </ul>
            ) : null}
          </ResultCard>
        </div>
      ) : null}

      <div className="mt-4">
        <Callout tone="warning">
          The entropy figure assumes a random password. If yours is memorable, it is guessable regardless of what the
          meter says — use the Password Generator and a manager instead.
        </Callout>
      </div>
    </ToolPanel>
  );
}
