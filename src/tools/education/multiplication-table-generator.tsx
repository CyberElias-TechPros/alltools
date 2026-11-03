"use client";

import { useMemo, useState } from "react";
import { CopyButton, DownloadButton, Field, ResultCard, StatGrid, TextInput, ToolPanel } from "@/components/ui";
import { multiplicationTable } from "@/lib/education";

export default function MultiplicationTableGenerator() {
  const [number, setNumber] = useState("7");
  const [upTo, setUpTo] = useState("12");
  const [highlight, setHighlight] = useState("");

  const n = Number(number);
  const rows = useMemo(() => (Number.isFinite(n) ? multiplicationTable(n, Number(upTo) || 12) : []), [n, upTo]);
  const text = rows.map((row) => `${n} × ${row.multiplier} = ${row.product}`).join("\n");
  const squares = rows.filter((row) => row.multiplier === Math.abs(n));

  return (
    <ToolPanel>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Times table for" htmlFor="mt-number">
          <TextInput id="mt-number" type="number" value={number} onChange={(event) => setNumber(event.target.value)} className="font-mono" invalid={!Number.isFinite(n)} />
        </Field>
        <Field label="Up to" htmlFor="mt-upto">
          <TextInput id="mt-upto" type="number" min={1} max={100} value={upTo} onChange={(event) => setUpTo(event.target.value)} className="font-mono" />
        </Field>
        <Field label="Highlight multiple" htmlFor="mt-highlight" hint="Optional — useful for drilling one fact.">
          <TextInput id="mt-highlight" type="number" value={highlight} onChange={(event) => setHighlight(event.target.value)} className="font-mono" />
        </Field>
      </div>

      <div className="mt-6">
        {rows.length ? (
          <ResultCard
            label={`${n} × table`}
            value={`${rows.length} facts`}
            sub={squares.length ? `Includes ${n} × ${Math.abs(n)} = ${n * Math.abs(n)}` : "Pick any multiplier to practise"}
            tone="brand"
            actions={
              <>
                <CopyButton text={text} label="Copy table" />
                <DownloadButton filename={`${n}-times-table.txt`} content={text} label="Download" />
              </>
            }
          >
            <StatGrid
              columns={3}
              items={[
                { label: "First fact", value: `${n} × 1 = ${n}` },
                { label: "Last fact", value: `${n} × ${rows.length} = ${n * rows.length}` },
                { label: "Sum of products", value: String(rows.reduce((sum, row) => sum + row.product, 0)) },
              ]}
            />
            <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-1 sm:grid-cols-3 lg:grid-cols-4">
              {rows.map((row) => {
                const isSquare = row.multiplier === Math.abs(n);
                const isHighlighted = highlight !== "" && row.multiplier === Number(highlight);
                return (
                  <div
                    key={row.multiplier}
                    className={[
                      "flex items-baseline justify-between gap-3 border-b border-[var(--border)] py-1.5 font-mono text-[0.8rem]",
                      isHighlighted ? "text-[var(--accent-text)]" : isSquare ? "text-[var(--text)]" : "text-[var(--text-muted)]",
                    ].join(" ")}
                  >
                    <span>
                      {n} × {row.multiplier}
                    </span>
                    <span className="font-semibold text-[var(--text)]">{row.product}</span>
                  </div>
                );
              })}
            </div>
          </ResultCard>
        ) : (
          <p className="text-sm text-[var(--text-subtle)]">Enter a number to generate its table.</p>
        )}
      </div>

      <p className="mt-4 text-xs leading-relaxed text-[var(--text-subtle)]">
        A table is a reference, not a learning method. Recall improves faster with retrieval practice — cover the right
        column and say the product aloud before checking.
      </p>
    </ToolPanel>
  );
}
