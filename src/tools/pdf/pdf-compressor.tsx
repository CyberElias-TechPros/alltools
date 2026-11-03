"use client";

import { PdfTool } from "@/components/tools/pdf-tool";
import { optimisePdf } from "@/lib/pdf";
import { formatBytes } from "@/lib/utils";

export default function PdfCompressor() {
  return (
    <PdfTool
      id="pdf-compressor"
      autoRun
      settings={() => (
        <p className="text-xs leading-relaxed text-[var(--text-subtle)]">
          Re-saves the document with compressed object streams and without orphaned objects. This helps files
          produced by older exporters; it cannot recompress already-optimised photos, and it never rasterises
          your text.
        </p>
      )}
      run={async ({ first }) => {
        if (!first) return { error: "Add a PDF first." };
        const bytes = await optimisePdf(first.bytes);
        const blob = new Blob([bytes as unknown as BlobPart], { type: "application/pdf" });
        const saved = Math.round((1 - blob.size / first.file.size) * 1000) / 10;
        return {
          blob,
          filename: "compressed.pdf",
          stats: [
            { label: "Original", value: formatBytes(first.file.size) },
            { label: "Re-saved", value: formatBytes(blob.size) },
            { label: "Change", value: `${saved > 0 ? "−" : "+"}${Math.abs(saved)}%` },
            { label: "Pages", value: first.pages.toString() },
          ],
          note:
            saved > 0
              ? "Structure compression helped. For a bigger reduction, the PDF File Size Reducer rasterises pages at a lower resolution — at the cost of selectable text."
              : "The file was already tightly packed, so there was little to gain. Most of the size is embedded images, which this operation does not touch.",
        };
      }}
    />
  );
}
