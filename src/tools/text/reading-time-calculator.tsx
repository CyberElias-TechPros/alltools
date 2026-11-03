"use client";

import { useMemo, useState } from "react";
import { CopyButton, Field, SimpleTable, StatGrid, TextArea, ToolPanel, TextInput } from "@/components/ui";
import { countText, timeToRead, words } from "@/lib/text";
import { formatDuration } from "@/lib/utils";

const PACES = [
  { label: "Careful study", wpm: 150 },
  { label: "Standard", wpm: 225 },
  { label: "Fast reader", wpm: 300 },
];

export default function ReadingTimeCalculator() {
  const [text, setText] = useState("");
  const [custom, setCustom] = useState("200");
  const wordCount = useMemo(() => words(text).length, [text]);
  const pace = Number(custom);
  const validPace = Number.isFinite(pace) && pace > 0;

  const rows = PACES.map((item) => [item.label, `${item.wpm} wpm`, formatDuration(timeToRead(text, item.wpm))]);
  if (validPace && !PACES.some((item) => item.wpm === pace)) {
    rows.splice(1, 0, ["Your pace", `${pace} wpm`, formatDuration(timeToRead(text, pace))]);
  }

  return (
    <ToolPanel>
      <div className="grid gap-4 lg:grid-cols-[1.35fr_1fr]">
        <div>
          <label htmlFor="rt-input" className="label">
            Your text
          </label>
          <TextArea
            id="rt-input"
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Paste the article or script…"
            className="min-h-[17rem]"
            spellCheck={false}
          />
        </div>

        <div className="flex flex-col gap-3">
          <StatGrid
            items={[
              { label: "Words", value: wordCount.toLocaleString() },
              { label: "Reading time", value: formatDuration(timeToRead(text, 225)), hint: "at 225 wpm" },
              { label: "Sentences", value: countText(text).sentences.toLocaleString() },
              { label: "Characters", value: countText(text).characters.toLocaleString() },
            ]}
          />

          <Field
            label="Custom pace"
            htmlFor="rt-wpm"
            hint="Words per minute — 150 for dense material, 300 for skimming."
          >
            <TextInput
              id="rt-wpm"
              type="number"
              min={50}
              max={800}
              value={custom}
              onChange={(event) => setCustom(event.target.value)}
              inputMode="numeric"
            />
          </Field>

          <div className="flex items-center justify-between">
            <span className="eyebrow">Time at each pace</span>
            <CopyButton
              text={`${wordCount} words — ${formatDuration(timeToRead(text, 225))} at 225 wpm`}
              size="sm"
              label="Copy"
            />
          </div>
          <SimpleTable head={["Pace", "Speed", "Time"]} rows={rows} caption="Reading time at common paces" />
        </div>
      </div>
    </ToolPanel>
  );
}
