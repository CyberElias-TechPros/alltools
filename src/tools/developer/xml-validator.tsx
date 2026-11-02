"use client";

import { useMemo, useState } from "react";
import { CopyButton, EmptyState, ResultCard, StatGrid, TextArea, ToolPanel } from "@/components/ui";
import { validateXml } from "@/lib/xml";

const VALID = `<?xml version="1.0" encoding="UTF-8"?>
<catalog>
  <book id="b-1" inStock="true">
    <title>Dune</title>
    <author>Frank Herbert</author>
  </book>
</catalog>`;

const BROKEN = `<catalog>
  <book id=b-1>
    <title>Dune</title>
  <book>
</catalog>`;

export default function XmlValidator() {
  const [input, setInput] = useState("");
  const report = useMemo(() => (input.trim() ? validateXml(input) : null), [input]);

  return (
    <ToolPanel>
      <div className="mb-2 flex items-center justify-between">
        <label htmlFor="xml-validate-input" className="label !mb-0">
          XML document
        </label>
        <div className="flex gap-1">
          <button
            type="button"
            className="btn btn-ghost !min-h-8 !px-2.5 !py-1.5 !text-[0.6rem] !tracking-[0.1em]"
            onClick={() => setInput(VALID)}
          >
            Valid sample
          </button>
          <button
            type="button"
            className="btn btn-ghost !min-h-8 !px-2.5 !py-1.5 !text-[0.6rem] !tracking-[0.1em]"
            onClick={() => setInput(BROKEN)}
          >
            Broken sample
          </button>
        </div>
      </div>
      <TextArea
        id="xml-validate-input"
        value={input}
        onChange={(event) => setInput(event.target.value)}
        placeholder='<?xml version="1.0"?><root><item id="1"/></root>'
        rows={14}
        spellCheck={false}
        className="min-h-[16rem] font-mono text-[0.84rem]"
      />

      <div className="mt-5">
        {!report ? (
          <EmptyState title="Waiting for a document">
            Paste XML to check whether tags are balanced, attributes are quoted and there is exactly one root element.
          </EmptyState>
        ) : report.valid && report.stats ? (
          <ResultCard label="Result" value="Well formed" tone="brand" sub="Tags balance and every attribute is quoted.">
            <StatGrid
              columns={4}
              items={[
                { label: "Root element", value: report.stats.root },
                { label: "Elements", value: report.stats.elements.toLocaleString() },
                { label: "Attributes", value: report.stats.attributes.toLocaleString() },
                { label: "Max depth", value: String(report.stats.maxDepth) },
                { label: "Comments", value: String(report.stats.comments) },
                { label: "CDATA sections", value: String(report.stats.cdata) },
              ]}
            />
          </ResultCard>
        ) : (
          <ResultCard label="Result" value="Not well formed" tone="neutral" sub={report.issue?.message}>
            <p className="text-sm leading-relaxed text-[var(--text-subtle)]">
              Line {report.issue?.line}, column {report.issue?.column}. Well-formedness is about syntax only — a document
              can be well formed and still break your schema.
            </p>
            <div className="mt-3">
              <CopyButton text={report.issue?.message ?? ""} label="Copy error" />
            </div>
            <ul className="mt-4 space-y-1.5 text-sm leading-relaxed text-[var(--text-subtle)]">
              <li>Every element must be closed, and closing tags must match the opening tag exactly.</li>
              <li>Attribute values must be wrapped in single or double quotes.</li>
              <li>Only one root element is allowed, with no text before or after it.</li>
              <li>A raw “&lt;” in text or an attribute must be written as <span className="font-mono">&amp;lt;</span>.</li>
            </ul>
          </ResultCard>
        )}
      </div>
    </ToolPanel>
  );
}
