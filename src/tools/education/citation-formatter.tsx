"use client";

import { useMemo, useState } from "react";
import { Callout, CopyButton, Field, TextInput, ToolPanel } from "@/components/ui";
import { ModeCard, ModeHub } from "@/components/tools/mode-hub";
import { formatCitation, type CitationStyle } from "@/lib/education";

const STYLE_LABELS: { value: CitationStyle; label: string; note: string }[] = [
  { value: "apa", label: "APA 7", note: "Initials first, year in brackets." },
  { value: "mla", label: "MLA 9", note: "Full names, title in quotation marks." },
  { value: "chicago", label: "Chicago", note: "Notes-bibliography flavour." },
  { value: "harvard", label: "Harvard", note: "Author–date, common in the UK." },
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
  const [fields, setFields] = useState(EXAMPLE);
  const update = (patch: Partial<typeof EXAMPLE>) => setFields((current) => ({ ...current, ...patch }));

  const citations = useMemo(
    () =>
      STYLE_LABELS.map((style) => ({
        ...style,
        text: formatCitation(fields, style.value) || "",
      })),
    [fields],
  );

  return (
    <ToolPanel>
      <div className="grid gap-3 sm:grid-cols-2">
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

      <div className="mt-5">
        {citations.some((item) => item.text) ? (
          <ModeHub columns={2}>
            {citations.map((item) => (
              <ModeCard key={item.value} title={item.label} hint={item.note} badge="Reference">
                <p
                  aria-live="polite"
                  className="flex-1 rounded-xl border border-[var(--result-border)] bg-[var(--result-bg)] px-3.5 py-3 text-[0.92rem] leading-relaxed text-[var(--text)]"
                >
                  {item.text || <span className="text-[var(--text-subtle)]">Add a title to build this reference.</span>}
                </p>
                <div className="mt-2 flex justify-end">
                  <CopyButton text={item.text} label="Copy" />
                </div>
              </ModeCard>
            ))}
          </ModeHub>
        ) : (
          <Callout tone="info">Add at least a title to build a reference.</Callout>
        )}
      </div>

      <p className="mt-4 text-xs leading-relaxed text-[var(--text-subtle)]">
        All four styles are built at the same time, so you can compare them side by side. They differ
        in ways that matter: APA initials the given names and puts the year in brackets; MLA spells
        names out and uses quotation marks for the title; Chicago and Harvard sit between them. This
        formatter follows the common forms, but exact punctuation for unusual sources — an edited
        chapter, a translated work, a podcast episode — needs the official style manual.
      </p>
    </ToolPanel>
  );
}
