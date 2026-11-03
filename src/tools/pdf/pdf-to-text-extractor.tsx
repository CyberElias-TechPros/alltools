"use client";

import { useState } from "react";
import { Field, Switch, TextInput } from "@/components/ui";
import { PdfTool } from "@/components/tools/pdf-tool";
import { extractPdfText, parsePageRanges } from "@/lib/pdf";

export default function PdfToTextExtractor() {
  const [pages, setPages] = useState("");
  const [pageMarkers, setPageMarkers] = useState(true);

  return (
    <PdfTool
      id="pdf-to-text-extractor"
      runKey={`${pages}-${pageMarkers}`}
      settings={({ pages: count }) => (
        <div className="space-y-3">
          <Field label="Pages" htmlFor="p2t-pages" optional hint={count ? `Leave blank for all ${count} pages.` : "Leave blank for every page"}>
            <TextInput id="p2t-pages" value={pages} onChange={(event) => setPages(event.target.value)} placeholder="e.g. 1-3, 8" />
          </Field>
          <Switch id="p2t-markers" checked={pageMarkers} onChange={setPageMarkers} label="Keep page markers" description="Insert — Page 2 — between pages" />
        </div>
      )}
      run={async ({ first }) => {
        if (!first) return { error: "Add a PDF first." };
        const ranges = pages.trim() ? parsePageRanges(pages, first.pages) : [{ label: "all", from: 1, to: first.pages }];
        if (!ranges) return { error: `Page numbers must be between 1 and ${first.pages}.` };
        const all = await extractPdfText(first.bytes);
        const selected: string[] = [];
        for (const range of ranges) {
          for (let pageNumber = range.from; pageNumber <= range.to; pageNumber += 1) {
            const text = all[pageNumber - 1] ?? "";
            selected.push(pageMarkers ? `— Page ${pageNumber} —\n${text}` : text);
          }
        }
        const text = selected.join("\n\n").trim();
        if (!text) {
          return {
            stats: [{ label: "Pages read", value: String(ranges.length) }],
            note:
              "No text layer was found. The PDF is probably a scan, where the page is an image — run OCR on it first, or use the PDF to JPG converter for reference images.",
          };
        }
        return {
          text,
          textLabel: "Extracted text",
          stats: [
            { label: "Characters", value: text.length.toLocaleString() },
            { label: "Words", value: text.split(/\s+/).filter(Boolean).length.toLocaleString() },
            { label: "Pages read", value: selected.length.toString() },
          ],
          note:
            "Text comes from the PDF's text layer, so layout, columns and tables are flattened into reading order. Scanned pages contain no text layer and will come back empty.",
        };
      }}
    />
  );
}
