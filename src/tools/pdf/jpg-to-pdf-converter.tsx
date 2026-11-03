"use client";

import { useState } from "react";
import { Field, Select, TextInput } from "@/components/ui";
import { PdfTool } from "@/components/tools/pdf-tool";
import { imagesToPdf } from "@/lib/pdf";
import { formatBytes } from "@/lib/utils";

export default function JpgToPdfConverter() {
  const [pageSize, setPageSize] = useState("fit");
  const [margin, setMargin] = useState("24");

  return (
    <PdfTool
      id="jpg-to-pdf-converter"
      accept="image/jpeg"
      multiple
      autoRun={false}
      emptyHint="Add JPEG photos. Each becomes one page, in the order listed."
      settings={() => (
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Page size" htmlFor="j2p-size">
            <Select id="j2p-size" value={pageSize} onChange={(event) => setPageSize(event.target.value)}>
              <option value="fit">Fit the image</option>
              <option value="a4">A4</option>
              <option value="letter">US Letter</option>
            </Select>
          </Field>
          <Field label="Margin" htmlFor="j2p-margin" hint="Points (72 per inch)">
            <TextInput id="j2p-margin" type="number" min={0} max={144} step={1} value={margin} onChange={(event) => setMargin(event.target.value)} />
          </Field>
        </div>
      )}
      run={async ({ files }) => {
        if (files.length === 0) return { error: "Add at least one JPEG." };
        const bytes = await imagesToPdf(files, {
          pageSize: pageSize as "fit" | "a4" | "letter",
          margin: Math.max(0, Number(margin) || 0),
        });
        const blob = new Blob([bytes as unknown as BlobPart], { type: "application/pdf" });
        return {
          blob,
          filename: "photos.pdf",
          stats: [
            { label: "Pages", value: files.length.toString() },
            { label: "Input", value: formatBytes(files.reduce((sum, file) => sum + file.size, 0)) },
            { label: "Output", value: formatBytes(blob.size) },
          ],
          note:
            "JPEGs are embedded without re-encoding, so the image quality is unchanged. Images are scaled to fit and centred rather than cropped.",
        };
      }}
    />
  );
}
