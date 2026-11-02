"use client";

import { useMemo, useState } from "react";
import { Button, Callout, CopyButton, Field, ResultCard, Segmented, Switch, TextInput, ToolPanel } from "@/components/ui";
import { generateBusinessNames } from "@/lib/business";

type Style = "modern" | "classic" | "invented" | "compound";

export default function BusinessNameGenerator() {
  const [keyword, setKeyword] = useState("coffee");
  const [style, setStyle] = useState<Style>("modern");
  const [count, setCount] = useState("8");
  const [seed, setSeed] = useState(7);
  const [showTips, setShowTips] = useState(true);

  const names = useMemo(
    () => generateBusinessNames({ keyword, style, count: Number(count) || 8, seed }),
    [keyword, style, count, seed],
  );

  return (
    <ToolPanel>
      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_6rem]">
        <Field label="What the business does" htmlFor="name-keyword" hint="One or two words works best: coffee, cycling, tax advice.">
          <TextInput id="name-keyword" value={keyword} onChange={(event) => setKeyword(event.target.value)} />
        </Field>
        <div>
          <Segmented
            label="Style"
            value={style}
            onChange={setStyle}
            options={[
              { value: "modern", label: "Modern" },
              { value: "classic", label: "Classic" },
              { value: "invented", label: "Invented" },
              { value: "compound", label: "Compound" },
            ]}
          />
        </div>
        <Field label="How many" htmlFor="name-count">
          <TextInput id="name-count" type="number" min={1} max={24} value={count} onChange={(event) => setCount(event.target.value)} className="font-mono" />
        </Field>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button onClick={() => setSeed((value) => value + 1)}>Shuffle ideas</Button>
        <Switch checked={showTips} onChange={setShowTips} label="Show the checking list" description="Domain, trademark and pronunciation checks before you commit." />
      </div>

      <div className="mt-6">
        <ResultCard
          label={`${names.length} name ideas`}
          value={style}
          sub={`Built from “${keyword || "your keyword"}” — a starting point, not a cleared name`}
          tone="brand"
          actions={<CopyButton text={names.join("\n")} label="Copy all" />}
        >
          <ul className="grid gap-2 sm:grid-cols-2">
            {names.map((name) => (
              <li key={name} className="flex items-center justify-between gap-3 border border-[var(--border)] px-3 py-2">
                <span className="text-sm text-[var(--text)]">{name}</span>
                <span className="font-mono text-[0.58rem] uppercase tracking-[0.12em] text-[var(--text-subtle)]">
                  {name.replace(/\s|&|\./g, "").length} chars
                </span>
              </li>
            ))}
          </ul>
        </ResultCard>
      </div>

      {showTips && (
        <Callout tone="info" title="Before you print anything">
          <ul className="mt-1 space-y-1">
            <li>Check the domain and the matching social handles — a name you cannot get is not usable.</li>
            <li>Search the national trademark register in your country, not just a web search.</li>
            <li>Say it out loud: if you have to spell it twice on the phone, it will cost you customers.</li>
            <li>Avoid names that lock you into one product or one city unless that is the plan.</li>
          </ul>
        </Callout>
      )}

      <p className="mt-4 text-xs leading-relaxed text-[var(--text-subtle)]">
        The generator combines your keyword with a small bank of prefixes, suffixes and invented stems. It is
        deliberately not an AI writing machine: the output is transparent, repeatable and offline, and every name still
        needs a domain check, a trademark search and a human decision.
      </p>
    </ToolPanel>
  );
}
