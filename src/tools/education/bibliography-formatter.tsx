"use client";

import { useMemo, useState } from "react";
import { Button, Callout, CopyButton, DownloadButton, Field, ResultCard, Select, StatGrid, TextInput, ToolPanel } from "@/components/ui";
import { formatBibliography, formatCitation, type CitationStyle } from "@/lib/education";

interface Entry {
  id: number;
  authors: string;
  title: string;
  year: string;
  container: string;
}

const SEED: Entry[] = [
  { id: 1, authors: "Zoe Adams", title: "Networks of Water", year: "2019", container: "River Press" },
  { id: 2, authors: "Mark Bell", title: "Apple Orchards of Kent", year: "2020", container: "Orchard Books" },
  { id: 3, authors: "Chinua Achebe", title: "Things Fall Apart", year: "1958", container: "Heinemann" },
];

export default function BibliographyFormatter() {
  const [entries, setEntries] = useState<Entry[]>(SEED);
  const [style, setStyle] = useState<CitationStyle>("apa");
  const [sort, setSort] = useState<"author" | "title" | "year">("author");
  const [nextId, setNextId] = useState(4);

  const list = useMemo(
    () =>
      formatBibliography(
        entries.map((entry) => ({
          authors: entry.authors,
          title: entry.title,
          year: entry.year,
          container: entry.container,
        })),
        style,
        sort,
      ),
    [entries, style, sort],
  );

  const plain = list.join("\n\n");
  const update = (id: number, patch: Partial<Entry>) => setEntries((current) => current.map((entry) => (entry.id === id ? { ...entry, ...patch } : entry)));

  return (
    <ToolPanel>
      <div className="grid gap-3 sm:grid-cols-[1fr_1fr]">
        <Field label="Style" htmlFor="bib-style">
          <Select id="bib-style" value={style} onChange={(event) => setStyle(event.target.value as CitationStyle)}>
            <option value="apa">APA 7</option>
            <option value="mla">MLA 9</option>
            <option value="chicago">Chicago 17</option>
            <option value="harvard">Harvard</option>
          </Select>
        </Field>
        <Field label="Sort by" htmlFor="bib-sort">
          <Select id="bib-sort" value={sort} onChange={(event) => setSort(event.target.value as "author" | "title" | "year")}>
            <option value="author">Author surname</option>
            <option value="title">Title</option>
            <option value="year">Year</option>
          </Select>
        </Field>
      </div>

      <div className="mt-4 space-y-3">
        {entries.map((entry, index) => (
          <div key={entry.id} className="border border-[var(--border)] p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-mono text-[0.58rem] uppercase tracking-[0.14em] text-[var(--text-subtle)]">Source {index + 1}</span>
              <Button variant="ghost" size="sm" aria-label={`Remove source ${index + 1}`} onClick={() => setEntries((current) => current.filter((item) => item.id !== entry.id))}>
                Remove
              </Button>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <TextInput aria-label={`Source ${index + 1} authors`} value={entry.authors} onChange={(event) => update(entry.id, { authors: event.target.value })} placeholder="Authors" />
              <TextInput aria-label={`Source ${index + 1} title`} value={entry.title} onChange={(event) => update(entry.id, { title: event.target.value })} placeholder="Title" />
              <TextInput aria-label={`Source ${index + 1} container`} value={entry.container} onChange={(event) => update(entry.id, { container: event.target.value })} placeholder="Publisher or journal" />
              <TextInput aria-label={`Source ${index + 1} year`} value={entry.year} onChange={(event) => update(entry.id, { year: event.target.value })} placeholder="Year" className="font-mono" inputMode="numeric" />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3">
        <Button
          onClick={() => {
            setEntries((current) => [...current, { id: nextId, authors: "", title: "", year: "", container: "" }]);
            setNextId((value) => value + 1);
          }}
        >
          Add source
        </Button>
      </div>

      <div className="mt-6">
        {list.length ? (
          <ResultCard
            label="Bibliography"
            value={`${list.length} reference${list.length === 1 ? "" : "s"}`}
            sub={`Sorted by ${sort === "author" ? "author surname" : sort}`}
            tone="brand"
            actions={
              <>
                <CopyButton text={plain} label="Copy all" />
                <DownloadButton filename="bibliography.txt" content={plain} label="Download" />
              </>
            }
          >
            <StatGrid
              columns={3}
              items={[
                { label: "References", value: String(list.length) },
                { label: "Style", value: style.toUpperCase() },
                { label: "Entries without a year", value: String(entries.filter((entry) => !entry.year.trim()).length) },
              ]}
            />
            <ul className="mt-4 space-y-3">
              {formatBibliography(
                entries.map((entry) => ({ authors: entry.authors, title: entry.title, year: entry.year, container: entry.container })),
                style,
                sort,
              ).map((reference, index) => (
                <li key={`${reference}-${index}`} className="border-l-2 border-[var(--border)] pl-3 text-sm leading-relaxed text-[var(--text-muted)]">
                  {reference}
                </li>
              ))}
            </ul>
          </ResultCard>
        ) : (
          <Callout tone="info">Add a source with a title to build a reference list.</Callout>
        )}
      </div>

      <p className="mt-4 text-xs leading-relaxed text-[var(--text-subtle)]">
        Reference lists are alphabetised by the first author&apos;s surname and every entry must be cited in the text.
        Sources with no author sort under their title, which is what the major styles require. The plain-text export keeps
        each reference on one line so it survives a paste into Word or Google Docs.
      </p>
    </ToolPanel>
  );
}
