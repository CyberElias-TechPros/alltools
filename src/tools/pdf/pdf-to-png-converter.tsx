"use client";

import { useState } from "react";
import { Field, Switch, TextInput } from "@/components/ui";
import { PdfTool } from "@/components/tools/pdf-tool";
import { openWithPdfJs, parsePageRanges, renderPage } from "@/lib/pdf";
import { formatBytes } from "@/lib/utils";

export default function PdfToPngConverter() {
  const [pages, setPages] = useState("1");
  const [scale, setScale] = useState("2");
  const [transparent, setTransparent] = useState(false);

  return (
    <PdfTool
      id="pdf-to-png-converter"
      runKey={`${pages}-${scale}-${transparent}`}
      settings={({ pages: count }) => (
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Pages" htmlFor="p2n-pages" hint={count ? `${count} available` : undefined}>
            <TextInput id="p2n-pages" value={pages} onChange={(event) => setPages(event.target.value)} />
          </Field>
          <Field label="Resolution" htmlFor="p2n-scale" hint="Higher values give larger, sharper PNGs">
            <TextInput id="p2n-scale" type="number" min={0.5} max={5} step={0.5} value={scale} onChange={(event) => setScale(event.target.value)} />
          </Field>
          <div className="sm:col-span-2">
            <Switch id="p2n-alpha" checked={transparent} onChange={setTransparent} label="Transparent background" description="Keeps the page background transparent where the PDF has no fill" />
          </div>
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
            if (!transparent) {
              const context = canvas.getContext("2d");
              if (context) {
                context.globalCompositeOperation = "destination-over";
                context.fillStyle = "#ffffff";
                context.fillRect(0, 0, canvas.width, canvas.height);
                context.globalCompositeOperation = "source-over";
              }
            }
            const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
            if (blob) files.push({ name: `page-${pageNumber}.png`, blob });
          }
        }
        if (files.length === 0) return { error: "No pages could be rendered." };
        return {
          files,
          stats: [
            { label: "Images", value: files.length.toString() },
            { label: "Total size", value: formatBytes(files.reduce((sum, file) => sum + file.blob.size, 0)) },
            { label: "Format", value: "PNG (lossless)" },
          ],
          note:
            "PNG keeps every rendered pixel, so text stays crisp — ideal for screenshots and slides. The files are much larger than JPEG equivalents.",
        };
      }}
    />
  );
}
