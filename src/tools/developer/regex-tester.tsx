"use client";

import { useMemo, useState } from "react";
import { CopyButton, EmptyState, Field, SimpleTable, StatGrid, TextArea, TextInput, ToolPanel } from "@/components/ui";
import { collectMatches, highlightMatches, REGEX_PRESETS } from "@/lib/regex";
import { cn } from "@/lib/utils";

const SAMPLE_TEXT = `Contact ada@example.com or grace@navy.mil before 2025-11-04.
Backup: alan@bletchley.uk — phone +44 20 7946 0958.`;

export default function RegexTester() {
  const [pattern, setPattern] = useState("[\\w.+-]+@[\\w-]+\\.[a-z]{2,}");
  const [flags, setFlags] = useState("gi");
  const [text, setText] = useState(SAMPLE_TEXT);

  const result = useMemo(
    () => (pattern ? collectMatches(pattern, flags, text) : { matches: [] }),
    [pattern, flags, text],
  );

  const segments = useMemo(
    () => highlightMatches(text, result.matches),
    [text, result.matches],
  );

  const toggleFlag = (flag: string) => {
    setFlags((current) =>
      current.includes(flag) ? current.replace(flag, "") : `${current}${flag}`,
    );
  };

  return (
    <ToolPanel>
      <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
        <Field label="Pattern" htmlFor="regex-pattern" hint="Written without the surrounding slashes.">
          <TextInput
            id="regex-pattern"
            value={pattern}
            onChange={(event) => setPattern(event.target.value)}
            placeholder="\\d{4}-\\d{2}-\\d{2}"
            spellCheck={false}
            className="font-mono text-[0.85rem]"
            invalid={Boolean(result.error)}
          />
        </Field>
        <div>
          <span className="label">Flags</span>
          <div className="flex flex-wrap gap-1.5">
            {[
              { flag: "g", label: "global" },
              { flag: "i", label: "ignore case" },
              { flag: "m", label: "multiline" },
              { flag: "s", label: "dotall" },
              { flag: "u", label: "unicode" },
            ].map((item) => (
              <button
                key={item.flag}
                type="button"
                onClick={() => toggleFlag(item.flag)}
                aria-pressed={flags.includes(item.flag)}
                title={item.label}
                className={cn(
                  "border px-2.5 py-1.5 font-mono text-[0.7rem] transition-colors",
                  flags.includes(item.flag)
                    ? "border-[var(--ring)] bg-[var(--surface-muted)] text-[var(--text)]"
                    : "border-[var(--border)] text-[var(--text-subtle)] hover:border-[var(--border-strong)]",
                )}
              >
                {item.flag}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4">
        <span className="label">Presets</span>
        <div className="flex flex-wrap gap-1.5">
          {REGEX_PRESETS.slice(0, 6).map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => {
                setPattern(preset.pattern);
                setFlags(preset.flags);
              }}
              className="border border-[var(--border)] px-2.5 py-1.5 font-mono text-[0.6rem] uppercase tracking-[0.1em] text-[var(--text-subtle)] transition-colors hover:border-[var(--border-strong)] hover:text-[var(--text)]"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <label htmlFor="regex-text" className="label">
          Test text
        </label>
        <TextArea
          id="regex-text"
          value={text}
          onChange={(event) => setText(event.target.value)}
          rows={6}
          spellCheck={false}
          className="font-mono text-[0.84rem]"
        />
      </div>

      {result.error ? (
        <div role="alert" className="mt-4 border border-[#c0392b] bg-[var(--surface-muted)] p-3 font-mono text-[0.8rem] text-[#8d2f22] dark:text-[#ff9a8a]">
          {result.error}
        </div>
      ) : null}

      {!result.error ? (
        <>
          <div className="mt-4">
            <StatGrid
              columns={3}
              items={[
                { label: "Matches", value: result.matches.length.toLocaleString() },
                {
                  label: "Captured groups",
                  value: String(result.matches.reduce((total, match) => total + match.groups.length, 0)),
                },
                { label: "Pattern", value: `/${pattern || ""}/${flags}` },
              ]}
            />
          </div>

          <div className="mt-4 border border-[var(--border)] bg-[var(--page-elevated)] p-3">
            <p className="mb-2 font-mono text-[0.6rem] uppercase tracking-[0.12em] text-[var(--text-subtle)]">
              Highlighted text
            </p>
            <p className="whitespace-pre-wrap break-words font-mono text-[0.82rem] leading-relaxed text-[var(--text)]">
              {segments.length === 0
                ? text
                : segments.map((segment, index) =>
                    segment.matched ? (
                      <mark
                        key={index}
                        className="bg-[var(--ring)]/25 px-0.5 text-[var(--text)]"
                        title={`Match ${segment.group + 1}`}
                      >
                        {segment.text}
                      </mark>
                    ) : (
                      <span key={index}>{segment.text}</span>
                    ),
                  )}
            </p>
          </div>

          <div className="mt-4">
            {result.matches.length === 0 ? (
              <EmptyState title="No matches">
                The pattern is valid but does not match this text. Check anchors and character classes.
              </EmptyState>
            ) : (
              <SimpleTable
                head={["#", "Index", "Match", "Groups"]}
                caption="Matches found in the test text"
                rows={result.matches.slice(0, 100).map((match, index) => [
                  String(index + 1),
                  `${match.index}–${match.index + Math.max(match.length, 1) - 1}`,
                  match.value === "" ? <span className="text-[var(--text-subtle)]">(empty)</span> : match.value,
                  match.groups.length
                    ? match.groups.map((group, groupIndex) => `${groupIndex + 1}: ${group ?? "—"}`).join(", ")
                    : "—",
                ])}
              />
            )}
            {result.matches.length > 100 ? (
              <p className="mt-2 text-xs text-[var(--text-subtle)]">
                Showing the first 100 of {result.matches.length} matches.
              </p>
            ) : null}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <CopyButton text={`/${pattern}/${flags}`} label="Copy pattern" />
            <CopyButton text={result.matches.map((match) => match.value).join("\n")} label="Copy matches" />
            <span className="font-mono text-[0.6rem] uppercase tracking-[0.1em] text-[var(--text-subtle)]">
              Runs with the browser&apos;s own regex engine
            </span>
          </div>
        </>
      ) : null}
    </ToolPanel>
  );
}
