"use client";

import { useMemo, useState } from "react";
import { CopyButton, EmptyState, ResultCard, StatGrid, TextArea, ToolPanel } from "@/components/ui";
import { clusterKeywords } from "@/lib/seo-tools";

const SAMPLE = `unit converter
unit converter length
unit converter mass
convert kg to lbs
convert miles to km
json formatter
json validator
json minifier`;

export default function KeywordClusteringTool() {
  const [input, setInput] = useState("");
  const result = useMemo(() => clusterKeywords(input), [input]);
  const total = result.clusters.reduce((sum, cluster) => sum + cluster.keywords.length, 0) + result.ungrouped.length;

  return (
    <ToolPanel>
      <label htmlFor="cluster-input" className="label">
        Keywords, one per line
      </label>
      <TextArea
        id="cluster-input"
        value={input}
        onChange={(event) => setInput(event.target.value)}
        rows={12}
        spellCheck={false}
        className="font-mono text-[0.8rem]"
        placeholder={"unit converter\nconvert kg to lbs\njson formatter"}
      />

      <div className="mt-5">
        {!input.trim() ? (
          <EmptyState title="No keywords yet">Paste a list to group the ones that share a subject.</EmptyState>
        ) : (
          <ResultCard
            label="Clusters"
            value={`${result.clusters.length} group(s)`}
            tone="brand"
            sub={`${total} keyword(s) · grouped by shared significant words`}
          >
            <StatGrid
              columns={3}
              items={[
                { label: "Keywords", value: String(total) },
                { label: "Clusters", value: String(result.clusters.length) },
                { label: "Ungrouped", value: String(result.ungrouped.length) },
              ]}
            />

            <div className="mt-4 space-y-3">
              {result.clusters.map((cluster) => (
                <div key={cluster.label} className="border border-[var(--border)] bg-[var(--surface)] p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-mono text-[0.62rem] uppercase tracking-[0.12em] text-[var(--accent-text)]">
                      {cluster.label}
                    </p>
                    <span className="font-mono text-[0.6rem] text-[var(--text-subtle)]">
                      {cluster.keywords.length} keyword(s)
                    </span>
                  </div>
                  <ul className="mt-2 flex flex-wrap gap-1.5">
                    {cluster.keywords.map((keyword) => (
                      <li key={keyword} className="border border-[var(--border)] px-2 py-1 font-mono text-[0.72rem]">
                        {keyword}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {result.ungrouped.length ? (
              <div className="mt-4">
                <p className="label">Ungrouped</p>
                <ul className="flex flex-wrap gap-1.5">
                  {result.ungrouped.map((keyword) => (
                    <li key={keyword} className="border border-dashed border-[var(--border-strong)] px-2 py-1 font-mono text-[0.72rem] text-[var(--text-subtle)]">
                      {keyword}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="mt-4">
              <CopyButton
                text={result.clusters
                  .map((cluster) => `${cluster.label}: ${cluster.keywords.join(", ")}`)
                  .join("\n")}
                label="Copy clusters"
              />
            </div>
          </ResultCard>
        )}
      </div>

      <p className="mt-5 text-xs leading-relaxed text-[var(--text-subtle)]">
        Clustering here is lexical: keywords that share a significant word land together, and stop words are ignored. It
        is fast and predictable, but it does not know synonyms — group “price” and “cost” by hand.
      </p>
    </ToolPanel>
  );
}
