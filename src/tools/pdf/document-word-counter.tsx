"use client";

import { useState } from "react";
import { CopyButton, EmptyState, ResultCard, SimpleTable, StatGrid, TextArea, ToolPanel } from "@/components/ui";
import { extractDocxText, documentStats } from "@/lib/docx";
import { countText, sentenceStats } from "@/lib/text";
import { extractPdfText } from "@/lib/pdf";
import { formatBytes } from "@/lib/utils";

type Source = { name: string; words: number; paragraphs: number; characters: number; pages?: number };

export default function DocumentWordCounter() {
  const [sources, setSources] = useState<Source[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pasted, setPasted] = useState("");
  const [busy, setBusy] = useState(false);

  async function addFiles(list: FileList | null) {
    if (!list) return;
    setBusy(true);
    setError(null);
    const added: Source[] = [];
    for (const file of Array.from(list)) {
      try {
        let text = "";
        let pages: number | undefined;
        if (/\.pdf$/i.test(file.name) || file.type === "application/pdf") {
          const pagesText = await extractPdfText(await file.arrayBuffer());
          text = pagesText.join("\n\n");
          pages = pagesText.length;
        } else if (/\.docx$/i.test(file.name)) {
          text = await extractDocxText(await file.arrayBuffer());
        } else {
          text = await file.text();
        }
        const stats = documentStats(text);
        added.push({ name: `${file.name} (${formatBytes(file.size)})`, words: stats.words, paragraphs: stats.paragraphs, characters: stats.characters, pages });
      } catch (thrown) {
        setError(thrown instanceof Error ? thrown.message : `Could not read ${file.name}.`);
      }
    }
    setSources((current) => [...current, ...added]);
    setBusy(false);
  }

  const totalWords = sources.reduce((sum, source) => sum + source.words, 0) + countText(pasted).words;
  const totalCharacters = sources.reduce((sum, source) => sum + source.characters, 0) + pasted.length;

  return (
    <ToolPanel>
      <div className="grid gap-4 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <label htmlFor="dwc-file" className="btn btn-secondary inline-flex cursor-pointer">
            Add documents
          </label>
          <input
            id="dwc-file"
            type="file"
            multiple
            accept=".pdf,.docx,.txt,.md,.csv"
            className="sr-only"
            onChange={(event) => void addFiles(event.target.files)}
          />
          <p className="mt-2 text-xs leading-relaxed text-[var(--text-subtle)]">
            PDF, DOCX, TXT, MD and CSV. Each file is parsed in the browser — nothing is uploaded, and scanned
            PDFs without a text layer count as zero.
          </p>

          <label htmlFor="dwc-paste" className="label mt-4">
            Or paste text
          </label>
          <TextArea
            id="dwc-paste"
            value={pasted}
            onChange={(event) => setPasted(event.target.value)}
            placeholder="Paste a chapter, a brief or a submission…"
            className="min-h-40"
          />

          {sources.length > 0 ? (
            <ul className="mt-3 divide-y divide-[var(--border)] border border-[var(--border)]">
              {sources.map((source, index) => (
                <li key={`${source.name}-${index}`} className="flex items-center justify-between gap-3 px-3 py-2">
                  <span className="min-w-0 truncate font-mono text-xs text-[var(--text)]">{source.name}</span>
                  <span className="shrink-0 font-mono text-[0.66rem] text-[var(--text-subtle)]">
                    {source.words.toLocaleString()} words
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
          {error ? <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p> : null}
          {busy ? <p className="mt-2 text-xs text-[var(--text-subtle)]">Reading…</p> : null}
        </div>

        <div>
          {totalWords > 0 ? (
            <>
              <ResultCard
                label="Total words"
                value={totalWords.toLocaleString()}
                sub={`${totalCharacters.toLocaleString()} characters across ${sources.length + (pasted.trim() ? 1 : 0)} source${sources.length + (pasted.trim() ? 1 : 0) === 1 ? "" : "s"}.`}
                actions={<CopyButton text={`${totalWords} words`} label="Copy count" />}
              >
                <StatGrid
                  columns={4}
                  items={[
                    { label: "Words", value: totalWords.toLocaleString() },
                    { label: "Characters", value: totalCharacters.toLocaleString() },
                    { label: "Paragraphs", value: sources.reduce((sum, source) => sum + source.paragraphs, 0).toString() },
                    { label: "Sentences", value: sentenceStats(pasted).sentences.length.toString() },
                  ]}
                />
              </ResultCard>

              <div className="mt-3">
                <SimpleTable
                  head={["Source", "Words", "Characters", "Pages"]}
                  rows={[
                    ...sources.map((source) => [
                      source.name,
                      source.words.toLocaleString(),
                      source.characters.toLocaleString(),
                      source.pages ? source.pages.toString() : "—",
                    ]),
                    ...(pasted.trim()
                      ? [["Pasted text", countText(pasted).words.toLocaleString(), pasted.length.toLocaleString(), "—"]]
                      : []),
                  ]}
                  caption="Per-document counts"
                />
              </div>
              <p className="mt-3 text-xs leading-relaxed text-[var(--text-subtle)]">
                Word counts differ between tools because they split on different characters. This one counts
                runs of non-space characters, so “state-of-the-art” counts as one word.
              </p>
            </>
          ) : (
            <EmptyState title="No documents yet" description="Add a file or paste text to see per-document and combined word counts." />
          )}
        </div>
      </div>
    </ToolPanel>
  );
}
