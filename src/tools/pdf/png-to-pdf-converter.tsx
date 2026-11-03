"use client";

import { useState } from "react";
import { Field, Select, TextInput } from "@/components/ui";
import { PdfTool } from "@/components/tools/pdf-tool";
import { imagesToPdf } from "@/lib/pdf";
import { formatBytes } from "@/lib/utils";

export default function PngToPdfConverter() {
  const [pageSize, setPageSize] = useState("fit");
  const [margin, setMargin] = useState("24");

  return (
    <PdfTool
      id="png-to-pdf-converter"
      accept="image/png"
      multiple
      autoRun={false}
      emptyHint="Add PNG screenshots or graphics. Each becomes one page."
      settings={() => (
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Page size" htmlFor="p2p-size">
            <Select id="p2p-size" value={pageSize} onChange={(event) => setPageSize(event.target.value)}>
              <option value="fit">Fit the image</option>
              <option value="a4">A4</option>
              <option value="letter">US Letter</option>
            </Select>
          </Field>
          <Field label="Margin" htmlFor="p2p-margin" hint="Points (72 per inch)">
            <TextInput id="p2p-margin" type="number" min={0} max={144} step={1} value={margin} onChange={(event) => setMargin(event.target.value)} />
          </Field>
        </div>
      )}
      run={async ({ files }) => {
        if (files.length === 0) return { error: "Add at least one PNG." };
        const bytes = await imagesToPdf(files, {
          pageSize: pageSize as "fit" | "a4" | "letter",
          margin: Math.max(0, Number(margin) || 0),
        });
        const blob = new Blob([bytes as unknown as BlobPart], { type: "application/pdf" });
        return {
          blob,
          filename: "images.pdf",
          stats: [
            { label: "Pages", value: files.length.toString() },
            { label: "Input", value: formatBytes(files.reduce((sum, file) => sum + file.size, 0)) },
            { label: "Output", value: formatBytes(blob.size) },
          ],
          note:
            "Transparent areas are preserved as transparency in the PDF, which most viewers render as white. Dark readers may show them differently.",
        };
      }}
    />
  );
}
