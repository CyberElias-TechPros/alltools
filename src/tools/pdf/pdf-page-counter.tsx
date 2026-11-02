"use client";

import { CopyButton } from "@/components/ui";
import { PdfTool } from "@/components/tools/pdf-tool";
import { formatBytes } from "@/lib/utils";

export default function PdfPageCounter() {
  return (
    <PdfTool
      id="pdf-page-counter"
      settings={() => (
        <p className="text-xs leading-relaxed text-[var(--text-subtle)]">
          Page count, file size and the size of each page are read from the document structure, which is fast
          even for long files.
        </p>
      )}
      run={async ({ first }) => {
        if (!first) return { error: "Add a PDF first." };
        const { readPdfInfo } = await import("@/lib/pdf");
        const info = await readPdfInfo(first.bytes);
        const summary = `${first.file.name}: ${info.pages} pages, ${formatBytes(first.file.size)}`;
        return {
          text: summary,
          textLabel: "Summary",
          stats: [
            { label: "Pages", value: info.pages.toString() },
            { label: "File size", value: formatBytes(first.file.size) },
            { label: "Bytes per page", value: formatBytes(Math.round(first.file.size / Math.max(info.pages, 1))) },
            ...(info.pageSizes[0]
              ? [{ label: "First page", value: `${info.pageSizes[0].width} × ${info.pageSizes[0].height} pt` }]
              : []),
          ],
          table: info.pageSizes.length
            ? {
                head: ["Page", "Width (pt)", "Height (pt)"],
                rows: info.pageSizes.map((size) => [size.label, size.width.toString(), size.height.toString()]),
                caption: "Page dimensions",
              }
            : undefined,
          note:
            "A page of A4 measures 595 × 842 points. Mixed page sizes are normal in scanned documents, where one section came from a different source.",
        };
      }}
    />
  );
}
