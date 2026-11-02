"use client";

import { useState } from "react";
import { Field, TextInput } from "@/components/ui";
import { PdfTool } from "@/components/tools/pdf-tool";
import { extractPages, parsePageRanges } from "@/lib/pdf";
import { formatBytes } from "@/lib/utils";

export default function PdfSplitter() {
  const [ranges, setRanges] = useState("1-2, 3-4");

  return (
    <PdfTool
      id="pdf-splitter"
      runKey={ranges}
      settings={({ pages }) => (
        <Field
          label="Split into these parts"
          htmlFor="split-ranges"
          hint={pages ? `Document has ${pages} page${pages === 1 ? "" : "s"}. Each comma-separated group becomes its own file.` : undefined}
        >
          <TextInput id="split-ranges" value={ranges} onChange={(event) => setRanges(event.target.value)} />
        </Field>
      )}
      run={async ({ first }) => {
        if (!first) return { error: "Add a PDF to split." };
        const parsed = parsePageRanges(ranges, first.pages);
        if (!parsed) return { error: "Use page numbers or ranges within the document, for example 1-3, 5." };
        const files: Array<{ name: string; blob: Blob }> = [];
        for (const part of parsed) {
          const bytes = await extractPages(first.bytes, [part]);
          const blob = new Blob([bytes as unknown as BlobPart], { type: "application/pdf" });
          files.push({ name: `split-${part.from}-${part.to}.pdf`, blob });
        }
        return {
          files,
          stats: [
            { label: "Parts", value: files.length.toString() },
            { label: "Source pages", value: first.pages.toString() },
            { label: "Largest part", value: formatBytes(Math.max(...files.map((file) => file.blob.size))) },
          ],
          note:
            "Each part is a standalone PDF with only its pages. Overlapping ranges repeat pages across files, which is often what you want when separate reviewers need shared pages.",
        };
      }}
    />
  );
}
