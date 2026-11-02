"use client";

import { useState } from "react";
import { Field, TextInput } from "@/components/ui";
import { PdfTool } from "@/components/tools/pdf-tool";
import { openWithPdfJs, parsePageRanges, renderPage } from "@/lib/pdf";
import { formatBytes } from "@/lib/utils";

export default function PdfToJpgConverter() {
  const [pages, setPages] = useState("1-3");
  const [scale, setScale] = useState("2");
  const [quality, setQuality] = useState("0.9");

  return (
    <PdfTool
      id="pdf-to-jpg-converter"
      runKey={`${pages}-${scale}-${quality}`}
      settings={({ pages: count }) => (
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Pages" htmlFor="p2j-pages" hint={count ? `${count} available` : undefined}>
            <TextInput id="p2j-pages" value={pages} onChange={(event) => setPages(event.target.value)} />
          </Field>
          <Field label="Resolution" htmlFor="p2j-scale" hint="2 ≈ 144 dpi">
            <TextInput id="p2j-scale" type="number" min={0.5} max={4} step={0.5} value={scale} onChange={(event) => setScale(event.target.value)} />
          </Field>
          <Field label="JPEG quality" htmlFor="p2j-quality">
            <TextInput id="p2j-quality" type="number" min={0.3} max={1} step={0.05} value={quality} onChange={(event) => setQuality(event.target.value)} />
          </Field>
        </div>
      )}
      run={async ({ first }) => {
        if (!first) return { error: "Add a PDF first." };
        const parsed = parsePageRanges(pages, first.pages);
        if (!parsed) return { error: `Use page numbers between 1 and ${first.pages}.` };
        const pdf = await openWithPdfJs(first.bytes);
        const files: Array<{ name: string; blob: Blob }> = [];
        for (const part of parsed) {
          for (let pageNumber = part.from; pageNumber <= part.to; pageNumber += 1) {
            const canvas = await renderPage(pdf, pageNumber, Number(scale) || 2);
            const blob = await new Promise<Blob | null>((resolve) =>
              canvas.toBlob(resolve, "image/jpeg", Math.min(Math.max(Number(quality) || 0.9, 0.3), 1)),
            );
            if (blob) files.push({ name: `page-${pageNumber}.jpg`, blob });
          }
        }
        if (files.length === 0) return { error: "No pages could be rendered." };
        return {
          files,
          stats: [
            { label: "Images", value: files.length.toString() },
            { label: "Total size", value: formatBytes(files.reduce((sum, file) => sum + file.blob.size, 0)) },
            { label: "Source pages", value: first.pages.toString() },
          ],
          note:
            "Pages are rendered by pdf.js at your chosen scale, so 2× gives roughly 144 dpi — enough for slides and previews, not for print. Each page downloads separately.",
        };
      }}
    />
  );
}
