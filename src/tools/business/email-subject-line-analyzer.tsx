"use client";

import { useMemo, useState } from "react";
import { Callout, CopyButton, Field, ResultCard, SimpleTable, StatGrid, TextInput, ToolPanel } from "@/components/ui";
import { analyseSubjectLine } from "@/lib/business";

const EXAMPLES = [
  "3 ways to cut invoice time by half",
  "Your order ships Tuesday",
  "FREE CASH GUARANTEED!! ACT NOW",
  "Quick question about the proposal",
];

export default function EmailSubjectLineAnalyzer() {
  const [subject, setSubject] = useState("3 ways to cut invoice time by half");
  const [preview, setPreview] = useState("The exact workflow we use, with the numbers.");

  const result = useMemo(() => analyseSubjectLine({ subject, preview }), [subject, preview]);
  const bar = result.score;

  return (
    <ToolPanel>
      <Field label="Subject line" htmlFor="subj-input" error={result.length > 60 ? "Longer than most mobile clients display." : undefined}>
        <TextInput id="subj-input" value={subject} onChange={(event) => setSubject(event.target.value)} className="text-base" invalid={result.length > 60} />
      </Field>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {EXAMPLES.map((example) => (
          <button
            key={example}
            type="button"
            onClick={() => setSubject(example)}
            className="max-w-full truncate border border-[var(--border)] px-2.5 py-1.5 text-[0.62rem] text-[var(--text-subtle)] transition-colors hover:border-[var(--border-strong)] hover:text-[var(--text)]"
          >
            {example}
          </button>
        ))}
      </div>

      <div className="mt-3">
        <Field label="Preview text" htmlFor="subj-preview" optional hint="The grey line after the subject in most inboxes.">
          <TextInput id="subj-preview" value={preview} onChange={(event) => setPreview(event.target.value)} />
        </Field>
      </div>

      <div className="mt-6">
        <ResultCard label="Subject score" value={`${result.score} / 100`} sub={result.notes.length ? `${result.notes.length} thing${result.notes.length === 1 ? "" : "s"} to check` : "Nothing obvious to fix"} tone="brand" actions={<CopyButton text={subject} label="Copy subject" />}>
          <div className="mb-4 h-1 w-full bg-[var(--border)]">
            <div className="h-full bg-[var(--ring)]" style={{ width: `${bar}%` }} />
          </div>
          <StatGrid
            columns={3}
            items={[
              { label: "Characters", value: `${result.length} / 60` },
              { label: "Words", value: String(result.words) },
              { label: "Visible on mobile", value: `${result.mobileVisible} chars` },
            ]}
          />
          <div className="mt-4">
            <SimpleTable
              head={["Inbox view", "Rendering"]}
              caption="How it appears with a sender name and preview"
              rows={[
                ["Sender", "Your Name"],
                ["Subject", subject.slice(0, 60) || "—"],
                ["Preview", preview.slice(0, 90) || "(first line of the email)"],
              ]}
            />
          </div>
        </ResultCard>
      </div>

      {result.spamWords.length > 0 && (
        <Callout tone="warning" title="Phrases filters dislike">
          <p className="font-mono text-xs">{result.spamWords.join(" · ")}</p>
        </Callout>
      )}

      {result.notes.length > 0 && (
        <div className="mt-4 space-y-2">
          {result.notes.map((note) => (
            <Callout key={note} tone="info">
              {note}
            </Callout>
          ))}
        </div>
      )}

      <p className="mt-4 text-xs leading-relaxed text-[var(--text-subtle)]">
        The score is a heuristic built from length, specificity, caps, punctuation and a short list of spam phrases — not
        a prediction of open rate, which depends far more on who is receiving the email and whether they recognise the
        sender. Deliverability is affected by authentication, list hygiene and engagement long before a word choice.
      </p>
    </ToolPanel>
  );
}
