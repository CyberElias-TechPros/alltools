"use client";

import { useMemo, useState } from "react";
import { Button, Callout, CopyButton, Field, ResultCard, TextInput, ToolPanel } from "@/components/ui";
import { generateSlogans } from "@/lib/business";

export default function SloganGenerator() {
  const [brand, setBrand] = useState("North Studio");
  const [benefit, setBenefit] = useState("design that ships on time");
  const [audience, setAudience] = useState("small teams");
  const [count, setCount] = useState("6");
  const [seed, setSeed] = useState(11);

  const slogans = useMemo(
    () => generateSlogans({ brand, benefit, audience, count: Number(count) || 6, seed }),
    [brand, benefit, audience, count, seed],
  );

  return (
    <ToolPanel>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Brand name" htmlFor="slogan-brand">
          <TextInput id="slogan-brand" value={brand} onChange={(event) => setBrand(event.target.value)} />
        </Field>
        <Field label="The benefit you deliver" htmlFor="slogan-benefit" hint="A verb phrase: “invoices in 30 seconds”, not “excellence”.">
          <TextInput id="slogan-benefit" value={benefit} onChange={(event) => setBenefit(event.target.value)} />
        </Field>
        <Field label="Who it is for" htmlFor="slogan-audience" optional>
          <TextInput id="slogan-audience" value={audience} onChange={(event) => setAudience(event.target.value)} />
        </Field>
        <Field label="How many" htmlFor="slogan-count">
          <TextInput id="slogan-count" type="number" min={1} max={16} value={count} onChange={(event) => setCount(event.target.value)} className="font-mono" />
        </Field>
      </div>

      <div className="mt-4">
        <Button onClick={() => setSeed((value) => value + 1)}>Shuffle lines</Button>
      </div>

      <div className="mt-6">
        <ResultCard label="Slogan options" value={`${slogans.length} lines`} sub="Short enough to fit a sign, a bio and a business card" tone="brand" actions={<CopyButton text={slogans.join("\n")} label="Copy all" />}>
          <ul className="space-y-2">
            {slogans.map((slogan) => (
              <li key={slogan} className="flex items-baseline justify-between gap-4 border-b border-[var(--border)] py-2">
                <span className="text-sm leading-snug text-[var(--text)]">{slogan}</span>
                <span className="shrink-0 font-mono text-[0.58rem] uppercase tracking-[0.12em] text-[var(--text-subtle)]">{slogan.length}</span>
              </li>
            ))}
          </ul>
        </ResultCard>
      </div>

      <Callout tone="info" title="What makes a slogan survive">
        It should name a benefit the customer recognises, be short enough to say in one breath, and not be
        interchangeable with a competitor&apos;s. Test the top two on five real customers before printing anything.
      </Callout>

      <p className="mt-4 text-xs leading-relaxed text-[var(--text-subtle)]">
        The patterns are structural — brand plus benefit, benefit plus audience, imperative — rather than a language
        model, so the lines are predictable and you can edit them safely. A tagline also needs a trademark check if you
        plan to use it on packaging.
      </p>
    </ToolPanel>
  );
}
