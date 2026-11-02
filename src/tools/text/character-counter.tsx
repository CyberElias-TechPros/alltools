"use client";

import { useMemo, useState } from "react";
import { CopyButton, StatGrid, TextArea, ToolPanel, Field, Select } from "@/components/ui";
import { countText } from "@/lib/text";

const LIMITS = [
  { id: "x", label: "X / Twitter post — 280", value: 280 },
  { id: "sms", label: "SMS segment — 160", value: 160 },
  { id: "meta-title", label: "Meta title — 60", value: 60 },
  { id: "meta-desc", label: "Meta description — 155", value: 155 },
  { id: "instagram", label: "Instagram caption — 2,200", value: 2200 },
  { id: "none", label: "No limit", value: 0 },
];

export default function CharacterCounter() {
  const [text, setText] = useState("");
  const [limitId, setLimitId] = useState("x");
  const stats = useMemo(() => countText(text), [text]);
  const limit = LIMITS.find((item) => item.id === limitId) ?? LIMITS[0];
  const remaining = limit.value ? limit.value - stats.characters : 0;
  const percent = limit.value ? Math.min(100, (stats.characters / limit.value) * 100) : 0;
  const over = limit.value > 0 && remaining < 0;

  return (
    <ToolPanel>
      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <div className="mb-2 flex items-center justify-between gap-2">
            <label htmlFor="cc-input" className="label !mb-0">
              Your text
            </label>
            <CopyButton text={text} size="sm" label="Copy input" />
          </div>
          <TextArea
            id="cc-input"
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Paste the post, description or message…"
            className="min-h-[16rem]"
            spellCheck={false}
          />
        </div>

        <div className="flex flex-col gap-3">
          <StatGrid
            items={[
              { label: "Characters", value: stats.characters.toLocaleString(), hint: "with spaces" },
              { label: "No spaces", value: stats.charactersNoSpaces.toLocaleString() },
              { label: "Words", value: stats.words.toLocaleString() },
              { label: "Lines", value: stats.lines.toLocaleString() },
            ]}
          />

          <Field label="Check against a limit" htmlFor="cc-limit">
            <Select id="cc-limit" value={limitId} onChange={(event) => setLimitId(event.target.value)}>
              {LIMITS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </Select>
          </Field>

          {limit.value ? (
            <div className="border border-[var(--border)] p-3">
              <div className="flex items-baseline justify-between">
                <span className="eyebrow">Remaining</span>
                <span
                  className={`font-mono text-lg font-semibold ${
                    over ? "text-[#b3261e] dark:text-[#ff9a8a]" : "text-[var(--text)]"
                  }`}
                >
                  {remaining >= 0 ? remaining.toLocaleString() : `−${Math.abs(remaining).toLocaleString()}`}
                </span>
              </div>
              <div className="mt-2 h-1.5 w-full bg-[var(--surface-muted)]">
                <div
                  className={`h-full ${over ? "bg-[#b3261e]" : "bg-[var(--ring)]"}`}
                  style={{ width: `${percent}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-[var(--text-muted)]" aria-live="polite">
                {over
                  ? `Over the ${limit.value.toLocaleString()} character limit by ${Math.abs(remaining).toLocaleString()}.`
                  : `Within the ${limit.value.toLocaleString()} character limit.`}
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </ToolPanel>
  );
}
