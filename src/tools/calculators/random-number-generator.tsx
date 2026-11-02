"use client";

import { useState } from "react";
import { Button, CopyButton, Field, ResultCard, StatGrid, Switch, TextInput, ToolPanel } from "@/components/ui";
import { randomIntegers } from "@/lib/math";

export default function RandomNumberGenerator() {
  const [min, setMin] = useState("1");
  const [max, setMax] = useState("100");
  const [count, setCount] = useState("5");
  const [unique, setUnique] = useState(true);
  const [sorted, setSorted] = useState(false);
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 1_000_000));
  const [numbers, setNumbers] = useState<number[]>([]);

  function generate(nextSeed = Math.floor(Math.random() * 1_000_000)) {
    const low = Number(min);
    const high = Number(max);
    const total = Number(count);
    if (!Number.isFinite(low) || !Number.isFinite(high)) return;
    const values = randomIntegers({
      min: low,
      max: high,
      count: Number.isFinite(total) ? total : 1,
      unique,
      seed: nextSeed,
    });
    setSeed(nextSeed);
    setNumbers(sorted ? [...values].sort((a, b) => a - b) : values);
  }

  const range = Math.abs(Math.floor(Number(max)) - Math.ceil(Number(min))) + 1;
  const impossible = unique && Number(count) > range;
  const listText = numbers.join(", ");

  return (
    <ToolPanel>
      <div className="grid gap-4 lg:grid-cols-[1fr_1.1fr]">
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Minimum" htmlFor="rng-min">
            <TextInput id="rng-min" inputMode="numeric" value={min} onChange={(event) => setMin(event.target.value)} />
          </Field>
          <Field label="Maximum" htmlFor="rng-max">
            <TextInput id="rng-max" inputMode="numeric" value={max} onChange={(event) => setMax(event.target.value)} />
          </Field>
          <Field label="How many" htmlFor="rng-count">
            <TextInput id="rng-count" inputMode="numeric" value={count} onChange={(event) => setCount(event.target.value)} />
          </Field>
          <div className="sm:col-span-3">
            <Switch id="rng-unique" checked={unique} onChange={setUnique} label="No repeats" description="Draw without replacement — like raffle tickets" />
            <Switch id="rng-sorted" checked={sorted} onChange={setSorted} label="Sort results" description="Order the numbers from lowest to highest" />
          </div>
          <div className="sm:col-span-3 flex flex-wrap items-center gap-2">
            <Button variant="primary" onClick={() => generate()} disabled={impossible}>
              Generate
            </Button>
            <CopyButton text={listText} label="Copy numbers" />
            <span className="font-mono text-xs text-[var(--text-subtle)]">seed {seed}</span>
          </div>
          {impossible ? (
            <p className="sm:col-span-3 text-xs text-red-600 dark:text-red-400">
              You cannot draw {count} unique numbers from a range of {range}. Lower the count or widen the range.
            </p>
          ) : null}
        </div>

        <div>
          {numbers.length > 0 ? (
            <ResultCard
              label="Your numbers"
              value={<span className="break-words">{listText}</span>}
              sub={`${numbers.length} value${numbers.length === 1 ? "" : "s"} between ${min} and ${max}${unique ? ", no repeats" : ""}.`}
            >
              <StatGrid
                columns={3}
                items={[
                  { label: "Smallest", value: Math.min(...numbers).toLocaleString() },
                  { label: "Largest", value: Math.max(...numbers).toLocaleString() },
                  { label: "Sum", value: numbers.reduce((sum, value) => sum + value, 0).toLocaleString() },
                ]}
              />
            </ResultCard>
          ) : (
            <ResultCard label="Your numbers" value="—" tone="neutral" sub="Set a range and press Generate." />
          )}
          <p className="mt-3 text-xs leading-relaxed text-[var(--text-subtle)]">
            Uses the browser's seeded pseudo-random generator (mulberry32) — reproducible from the shown
            seed, and fine for raffles, sampling and test data. It is not a cryptographic source; use the
            Random Token Generator when unpredictability matters.
          </p>
        </div>
      </div>
    </ToolPanel>
  );
}
