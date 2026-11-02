"use client";

import { PdfTool } from "@/components/tools/pdf-tool";
import { mergePdfs } from "@/lib/pdf";
import { formatBytes } from "@/lib/utils";

export default function PdfMerger() {
  return (
    <PdfTool
      id="pdf-merger"
      multiple
      autoRun={false}
      emptyHint="Add two or more PDFs. They are combined in the order shown, and nothing is uploaded."
      settings={({ files }) => (
        <p className="text-xs leading-relaxed text-[var(--text-subtle)]">
          {files.length} file{files.length === 1 ? "" : "s"} queued. Remove a file to take it out, then press
          Merge. Bookmarks and form fields are not carried across; page content, rotation and page size are.
        </p>
      )}
      run={async ({ files }) => {
        if (files.length < 2) return { error: "Add at least two PDFs to merge." };
        const bytes = await mergePdfs(files);
        const size = files.reduce((sum, file) => sum + file.size, 0);
        const blob = new Blob([bytes as unknown as BlobPart], { type: "application/pdf" });
        return {
          blob,
          filename: "merged.pdf",
          stats: [
            { label: "Files merged", value: files.length.toString() },
            { label: "Combined input", value: formatBytes(size) },
            { label: "Output size", value: formatBytes(blob.size) },
          ],
          note:
            "Merge order follows the list. Encrypted PDFs need their password removed first — this tool cannot open them.",
        };
      }}
    />
  );
}
