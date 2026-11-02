"use client";

import { useState } from "react";
import { Field, Select } from "@/components/ui";
import { PdfTool } from "@/components/tools/pdf-tool";
import { rotatePages } from "@/lib/pdf";
import { formatBytes } from "@/lib/utils";

export default function PdfRotator() {
  const [rotation, setRotation] = useState("90");

  return (
    <PdfTool
      id="pdf-rotator"
      runKey={rotation}
      settings={() => (
        <Field label="Rotate every page" htmlFor="rotate-degrees" hint="Use 180 to turn upside-down scans the right way up">
          <Select id="rotate-degrees" value={rotation} onChange={(event) => setRotation(event.target.value)}>
            <option value="90">90° clockwise</option>
            <option value="180">180°</option>
            <option value="270">90° anticlockwise</option>
          </Select>
        </Field>
      )}
      run={async ({ first }) => {
        if (!first) return { error: "Add a PDF first." };
        const bytes = await rotatePages(first.bytes, Number(rotation));
        const blob = new Blob([bytes as unknown as BlobPart], { type: "application/pdf" });
        return {
          blob,
          filename: "rotated.pdf",
          stats: [
            { label: "Rotation", value: `${rotation}°` },
            { label: "Pages", value: first.pages.toString() },
            { label: "Output size", value: formatBytes(blob.size) },
          ],
          note:
            "Rotation is stored as page metadata, so the text layer stays selectable and the file size barely changes.",
        };
      }}
    />
  );
}
