"use client";

import { useMemo, useState } from "react";
import { Callout, CopyButton, Field, ResultCard, Segmented, TextArea, TextInput, ToolPanel } from "@/components/ui";
import { formatCitation, type CitationStyle } from "@/lib/education";

const STYLE_LABELS: { value: CitationStyle; label: string }[] = [
  { value: "apa", label: "APA 7" },
  { value: "mla", label: "MLA 9" },
  { value: "chicago", label: "Chicago" },
  { value: "harvard", label: "Harvard" },
];

const EXAMPLE = {
  authors: "Jane Doe and John Smith",
  title: "A History of Small Things",
  container: "",
  publisher: "Acme Press",
  year: "2021",
  pages: "",
  url: "",
  accessed: "",
};

export default function CitationFormatter() {
  const [style, setStyle] = useState<CitationStyle>("apa");
  const [fields, setFields] = useState(EXAMPLE);

  const citation = useMemo(() => formatCitation(fields, style), [fields, style]);
  const update = (patch: Partial<typeof EXAMPLE>) => setFields((current) => ({ ...current, ...patch }));

  return (
    <ToolPanel>
      <Segmented label="Style" value={style} onChange={setStyle} options={STYLE_LABELS} />

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Field label="Authors" htmlFor="cite-authors" hint="Separate with commas or “and”, e.g. Jane Doe, John Smith.">
          <TextInput id="cite-authors" value={fields.authors} onChange={(event) => update({ authors: event.target.value })} />
        </Field>
        <Field label="Title" htmlFor="cite-title">
          <TextInput id="cite-title" value={fields.title} onChange={(event) => update({ title: event.target.value })} />
        </Field>
        <Field label="Journal, site or book collection" htmlFor="cite-container" optional>
          <TextInput id="cite-container" value={fields.container} onChange={(event) => update({ container: event.target.value })} />
        </Field>
        <Field label="Publisher" htmlFor="cite-publisher" optional>
          <TextInput id="cite-publisher" value={fields.publisher} onChange={(event) => update({ publisher: event.target.value })} />
        </Field>
        <Field label="Year" htmlFor="cite-year">
          <TextInput id="cite-year" value={fields.year} onChange={(event) => update({ year: event.target.value })} className="font-mono" />
        </Field>
        <Field label="Pages" htmlFor="cite-pages" optional>
          <TextInput id="cite-pages" value={fields.pages} onChange={(event) => update({ pages: event.target.value })} placeholder="12–28" className="font-mono" />
        </Field>
        <Field label="URL" htmlFor="cite-url" optional>
          <TextInput id="cite-url" value={fields.url} onChange={(event) => update({ url: event.target.value })} className="font-mono text-[0.8rem]" spellCheck={false} />
        </Field>
        <Field label="Accessed" htmlFor="cite-accessed" optional>
          <TextInput id="cite-accessed" value={fields.accessed} onChange={(event) => update({ accessed: event.target.value })} placeholder="2 March 2025" />
        </Field>
      </div>

      <div className="mt-6">
        {citation ? (
          <ResultCard label={`${STYLE_LABELS.find((item) => item.value === style)?.label} reference`} value={<span className="text-base leading-relaxed">{citation}</span>} sub="Hanging indent is applied by your word processor" tone="brand" actions={<CopyButton text={citation} label="Copy citation" />}>
            <fieldset className="mt-2">
              <legend className="label">All four styles</legend>
              <div className="space-y-2">
                {STYLE_LABELS.map((item) => (
                  <div key={item.value} className="border-l-2 border-[var(--border)] pl-3">
                    <p className="font-mono text-[0.58rem] uppercase tracking-[0.12em] text-[var(--text-subtle)]">{item.label}</p>
                    <p className="mt-1 text-sm text-[var(--text-muted)]">{formatCitation(fields, item.value)}</p>
                  </div>
                ))}
              </div>
            </fieldset>
          </ResultCard>
        ) : (
          <Callout tone="info">Add at least a title to build a reference.</Callout>
        )}
      </div>

      <p className="mt-4 text-xs leading-relaxed text-[var(--text-subtle)]">
        Styles differ in ways that matter: APA initials the given names and puts the year in brackets; MLA spells names out
        and uses quotation marks for the title; Chicago and Harvard sit between them. This formatter follows the common
        forms, but exact punctuation for unusual sources — an edited chapter, a translated work, a podcast episode — needs
        the official style manual.
      </p>
    </ToolPanel>
  );
}
