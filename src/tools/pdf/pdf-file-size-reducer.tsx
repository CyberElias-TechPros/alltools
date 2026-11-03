"use client";

import { useState } from "react";
import { Field, Select, Switch } from "@/components/ui";
import { PdfTool } from "@/components/tools/pdf-tool";
import { openWithPdfJs, renderPage } from "@/lib/pdf";
import { formatBytes } from "@/lib/utils";

export default function PdfFileSizeReducer() {
  const [scale, setScale] = useState("1.2");
  const [quality, setQuality] = useState("0.7");
  const [grayscale, setGrayscale] = useState(false);

  return (
    <PdfTool
      id="pdf-file-size-reducer"
      runKey={`${scale}-${quality}-${grayscale}`}
      settings={() => (
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Render scale" htmlFor="psr-scale" hint="1.0 is 72 dpi; 2.0 is roughly 144 dpi">
            <Select id="psr-scale" value={scale} onChange={(event) => setScale(event.target.value)}>
              <option value="0.8">0.8 — smallest</option>
              <option value="1.2">1.2 — balanced</option>
              <option value="1.6">1.6 — sharper</option>
              <option value="2">2.0 — print-ish</option>
            </Select>
          </Field>
          <Field label="JPEG quality" htmlFor="psr-quality">
            <Select id="psr-quality" value={quality} onChange={(event) => setQuality(event.target.value)}>
              <option value="0.5">0.5 — aggressive</option>
              <option value="0.7">0.7 — balanced</option>
              <option value="0.85">0.85 — high</option>
            </Select>
          </Field>
          <div className="sm:col-span-2">
            <Switch id="psr-gray" checked={grayscale} onChange={setGrayscale} label="Grayscale" description="Roughly a third smaller again for text documents" />
          </div>
        </div>
      )}
      run={async ({ first }) => {
        if (!first) return { error: "Add a PDF first." };
        const pdf = await openWithPdfJs(first.bytes);
        const { PDFDocument } = await import("pdf-lib");
        const output = await PDFDocument.create();

        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
          const canvas = await renderPage(pdf, pageNumber, Number(scale) || 1.2);
          if (grayscale) {
            const context = canvas.getContext("2d");
            if (context) {
              const image = context.getImageData(0, 0, canvas.width, canvas.height);
              for (let index = 0; index < image.data.length; index += 4) {
                const grey = 0.299 * image.data[index] + 0.587 * image.data[index + 1] + 0.114 * image.data[index + 2];
                image.data[index] = grey;
                image.data[index + 1] = grey;
                image.data[index + 2] = grey;
              }
              context.putImageData(image, 0, 0);
            }
          }
          const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", Number(quality) || 0.7));
          if (!blob) continue;
          const jpg = await output.embedJpg(await blob.arrayBuffer());
          const page = output.addPage([canvas.width / (Number(scale) || 1.2), canvas.height / (Number(scale) || 1.2)]);
          page.drawImage(jpg, { x: 0, y: 0, width: page.getWidth(), height: page.getHeight() });
        }

        const bytes = await output.save({ useObjectStreams: true });
        const result = new Blob([bytes as unknown as BlobPart], { type: "application/pdf" });
        const saved = Math.round((1 - result.size / first.file.size) * 1000) / 10;
        return {
          blob: result,
          filename: "reduced.pdf",
          stats: [
            { label: "Original", value: formatBytes(first.file.size) },
            { label: "Reduced", value: formatBytes(result.size) },
            { label: "Saving", value: `${saved}%` },
            { label: "Pages", value: pdf.numPages.toString() },
          ],
          note:
            "This rebuilds each page as a JPEG image, so text and links are no longer selectable or searchable. That is the trade for a large size reduction — use it for scans and print-ready copies, not for documents that need to be searched.",
        };
      }}
    />
  );
}
