"use client";

import { useMemo, useState } from "react";
import { Callout, CopyButton, DownloadButton, Field, ResultCard, TextArea, TextInput, ToolPanel } from "@/components/ui";
import { proposalTemplate } from "@/lib/business";

export default function ProposalTemplateGenerator() {
  const [fields, setFields] = useState({
    client: "Acme Ltd",
    project: "Website rebuild",
    problem: "The current site takes 6 seconds to load and loses mobile visitors before the pricing page.",
    approach: "Rebuild on a static stack, move content into a structured model and cut third-party scripts to two.",
    deliverables: "12 pages, a content model, redirect map, analytics setup and a 30-minute handover call.",
    timeline: "Discovery in week 1, build in weeks 2–4, review in week 5, launch in week 6.",
    price: "5000 fixed, 50% on signature and 50% on launch. Hosting and domain are separate.",
    validity: "30 days",
  });

  const proposal = useMemo(() => proposalTemplate(fields), [fields]);
  const update = (patch: Partial<typeof fields>) => setFields((current) => ({ ...current, ...patch }));
  const bracketed = (proposal.match(/\[[^\]]+\]/g) ?? []).length;

  return (
    <ToolPanel>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Client" htmlFor="prop-client">
          <TextInput id="prop-client" value={fields.client} onChange={(event) => update({ client: event.target.value })} />
        </Field>
        <Field label="Project" htmlFor="prop-project">
          <TextInput id="prop-project" value={fields.project} onChange={(event) => update({ project: event.target.value })} />
        </Field>
        <Field label="The problem" htmlFor="prop-problem" className="sm:col-span-2" hint="In the client's words, with a number attached if possible.">
          <TextArea id="prop-problem" value={fields.problem} onChange={(event) => update({ problem: event.target.value })} rows={2} />
        </Field>
        <Field label="Approach" htmlFor="prop-approach" className="sm:col-span-2">
          <TextArea id="prop-approach" value={fields.approach} onChange={(event) => update({ approach: event.target.value })} rows={2} />
        </Field>
        <Field label="Deliverables" htmlFor="prop-deliverables">
          <TextArea id="prop-deliverables" value={fields.deliverables} onChange={(event) => update({ deliverables: event.target.value })} rows={2} />
        </Field>
        <Field label="Timeline" htmlFor="prop-timeline">
          <TextArea id="prop-timeline" value={fields.timeline} onChange={(event) => update({ timeline: event.target.value })} rows={2} />
        </Field>
        <Field label="Price and payment" htmlFor="prop-price">
          <TextArea id="prop-price" value={fields.price} onChange={(event) => update({ price: event.target.value })} rows={2} />
        </Field>
        <Field label="Valid for" htmlFor="prop-validity">
          <TextInput id="prop-validity" value={fields.validity} onChange={(event) => update({ validity: event.target.value })} />
        </Field>
      </div>

      <div className="mt-6">
        <ResultCard
          label="Proposal"
          value={<span className="font-mono text-[0.8rem]">{bracketed === 0 ? "Complete" : `${bracketed} placeholder${bracketed === 1 ? "" : "s"} left`}</span>}
          sub="Markdown — paste into Notion, Docs or a PDF export"
          tone="brand"
          actions={
            <>
              <CopyButton text={proposal} label="Copy" />
              <DownloadButton filename="proposal.md" content={proposal} mime="text/markdown" label="Download" />
            </>
          }
        >
          <pre className="max-h-96 overflow-auto border border-[var(--border)] bg-[var(--surface-muted)] p-4 font-mono text-[0.74rem] leading-relaxed whitespace-pre-wrap">{proposal}</pre>
        </ResultCard>
      </div>

      {bracketed > 0 && (
        <Callout tone="warning">
          Bracketed placeholders remain. A proposal sent with &ldquo;[Price]&rdquo; in it reads as carelessness, so fill
          every one or delete the sentence.
        </Callout>
      )}

      <p className="mt-4 text-xs leading-relaxed text-[var(--text-subtle)]">
        The structure is the argument: problem, approach, deliverables, timeline, price. Put the price after the value and
        before the terms. Anything that is not included should be named explicitly, because &ldquo;I assumed that was
        extra&rdquo; is the most expensive sentence in a project.
      </p>
    </ToolPanel>
  );
}
