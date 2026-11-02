"use client";

import { useMemo, useState } from "react";
import { CopyButton, Field, SimpleTable, StatGrid, TextArea, ToolPanel, TextInput } from "@/components/ui";
import { timeToSpeak, words } from "@/lib/text";
import { formatDuration } from "@/lib/utils";

const PACES = [
  { label: "Deliberate", wpm: 100 },
  { label: "Presentation", wpm: 120 },
  { label: "Conversational", wpm: 140 },
  { label: "Fast", wpm: 165 },
];

export default function SpeakingTimeCalculator() {
  const [text, setText] = useState("");
  const [minutes, setMinutes] = useState("5");
  const [pace, setPace] = useState("130");
  const wordCount = useMemo(() => words(text).length, [text]);
  const paceValue = Number(pace) || 130;
  const targetMinutes = Number(minutes);
  const budget = Number.isFinite(targetMinutes) && targetMinutes > 0 ? Math.round(targetMinutes * paceValue) : 0;

  return (
    <ToolPanel>
      <div className="grid gap-4 lg:grid-cols-[1.35fr_1fr]">
        <div>
          <label htmlFor="st-input" className="label">
            Your script
          </label>
          <TextArea
            id="st-input"
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Paste the speech or presentation script…"
            className="min-h-[17rem]"
            spellCheck={false}
          />
        </div>

        <div className="flex flex-col gap-3">
          <StatGrid
            items={[
              { label: "Words", value: wordCount.toLocaleString() },
              { label: "Speaking time", value: formatDuration(timeToSpeak(text, paceValue)), hint: `at ${paceValue} wpm` },
              { label: "Slides at 90s", value: Math.max(1, Math.round(timeToSpeak(text, paceValue) / 90)).toString() },
              { label: "Characters", value: text.length.toLocaleString() },
            ]}
          />

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Pace (wpm)" htmlFor="st-pace" hint="130 is a natural conversational rate.">
              <TextInput
                id="st-pace"
                type="number"
                min={60}
                max={260}
                value={pace}
                onChange={(event) => setPace(event.target.value)}
                inputMode="numeric"
              />
            </Field>
            <Field label="Target slot (min)" htmlFor="st-minutes" hint="How long you have on stage.">
              <TextInput
                id="st-minutes"
                type="number"
                min={1}
                max={180}
                value={minutes}
                onChange={(event) => setMinutes(event.target.value)}
                inputMode="numeric"
              />
            </Field>
          </div>

          <div className="flex items-center justify-between">
            <span className="eyebrow">Budget and paces</span>
            <CopyButton
              text={`${wordCount} words ≈ ${formatDuration(timeToSpeak(text, paceValue))} at ${paceValue} wpm; ${budget} words fit ${targetMinutes} minutes`}
              size="sm"
              label="Copy"
            />
          </div>
          <SimpleTable
            head={["Pace", "wpm", "Time"]}
            rows={PACES.map((item) => [item.label, String(item.wpm), formatDuration(timeToSpeak(text, item.wpm))])}
            caption="Speaking time at common paces"
          />
          <p className="border border-[var(--border)] bg-[var(--surface-muted)] p-3 text-sm text-[var(--text-muted)]">
            For a {Number.isFinite(targetMinutes) ? targetMinutes : 0}-minute slot at {paceValue} wpm, aim for{" "}
            <strong className="text-[var(--text)]">{budget.toLocaleString()} words</strong>.
          </p>
        </div>
      </div>
    </ToolPanel>
  );
}
