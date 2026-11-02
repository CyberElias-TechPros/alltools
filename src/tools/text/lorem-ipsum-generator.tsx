"use client";

import { useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";
import {
  Button,
  CopyButton,
  DownloadButton,
  Field,
  Segmented,
  Switch,
  TextInput,
  ToolPanel,
} from "@/components/ui";
import { generateLorem } from "@/lib/text";

export default function LoremIpsumGenerator() {
  const [unit, setUnit] = useState<"paragraphs" | "sentences" | "words">("paragraphs");
  const [amount, setAmount] = useState("3");
  const [seed, setSeed] = useState(1);
  const [classicOpening, setClassicOpening] = useState(true);

  const count = Math.min(Math.max(Number(amount) || 1, 1), unit === "words" ? 1000 : 50);
  const output = useMemo(
    () => generateLorem(count, unit, { seed, classicOpening }),
    [count, unit, seed, classicOpening],
  );

  const words = output.trim().split(/\s+/).filter(Boolean).length;

  return (
    <ToolPanel>
      <div className="grid gap-4 sm:grid-cols-[1.4fr_1fr]">
        <div>
          <span className="label">What do you need?</span>
          <Segmented
            label="Output unit"
            value={unit}
            onChange={setUnit}
            options={[
              { value: "paragraphs", label: "Paragraphs" },
              { value: "sentences", label: "Sentences" },
              { value: "words", label: "Words" },
            ]}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Amount" htmlFor="li-amount">
            <TextInput
              id="li-amount"
              type="number"
              min={1}
              max={unit === "words" ? 1000 : 50}
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />
          </Field>
          <Field label="Seed" htmlFor="li-seed" hint="Same seed, same text">
            <TextInput
              id="li-seed"
              type="number"
              min={1}
              value={seed}
              onChange={(event) => setSeed(Number(event.target.value) || 1)}
            />
          </Field>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <Switch
          checked={classicOpening}
          onChange={setClassicOpening}
          label="Start with “Lorem ipsum dolor sit amet…”"
        />
        <Button size="sm" variant="secondary" onClick={() => setSeed((value) => value + 1)}>
          <RefreshCw className="size-3.5" aria-hidden /> Regenerate
        </Button>
      </div>

      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="label !mb-0">Placeholder text</span>
          <div className="flex gap-1.5">
            <CopyButton text={output} />
            <DownloadButton filename="lorem-ipsum.txt" content={output} />
          </div>
        </div>
        <div
          aria-live="polite"
          className="max-h-80 overflow-auto whitespace-pre-wrap break-words rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-4 text-[0.92rem] leading-relaxed text-[var(--text)]"
        >
          {output}
        </div>
        <p className="mt-1.5 text-xs text-[var(--text-subtle)]">
          {words.toLocaleString()} words · {output.length.toLocaleString()} characters
        </p>
      </div>
    </ToolPanel>
  );
}
