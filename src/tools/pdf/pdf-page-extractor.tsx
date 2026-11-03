"use client";

import { useState } from "react";
import { Field, TextInput } from "@/components/ui";
import { PdfTool } from "@/components/tools/pdf-tool";
import { extractPages, parsePageRanges } from "@/lib/pdf";
import { formatBytes } from "@/lib/utils";

export default function PdfPageExtractor() {
  const [pages, setPages] = useState("1-3");

  return (
    <PdfTool
      id="pdf-page-extractor"
      runKey={pages}
      settings={({ pages: count }) => (
        <Field
          label="Pages to keep"
          htmlFor="extract-pages"
          hint={count ? `This document has ${count} pages. Use ranges like 1-3, 7.` : undefined}
        >
          <TextInput id="extract-pages" value={pages} onChange={(event) => setPages(event.target.value)} />
        </Field>
      )}
      run={async ({ first }) => {
        if (!first) return { error: "Add a PDF first." };
        const parsed = parsePageRanges(pages, first.pages);
        if (!parsed) return { error: "Those page numbers are outside the document or malformed." };
        const bytes = await extractPages(first.bytes, parsed);
        const blob = new Blob([bytes as unknown as BlobPart], { type: "application/pdf" });
        const count = parsed.reduce((sum, part) => sum + (part.to - part.from + 1), 0);
        return {
          blob,
          filename: "extracted.pdf",
          stats: [
            { label: "Pages kept", value: count.toString() },
            { label: "Original pages", value: first.pages.toString() },
            { label: "Output size", value: formatBytes(blob.size) },
          ],
          note:
            "Extraction copies the selected pages into a new document. The original file on your device is untouched.",
        };
      }}
    />
  );
}
