"use client";

import { PdfTool } from "@/components/tools/pdf-tool";
import { formatBytes } from "@/lib/utils";

export default function PdfMetadataViewer() {
  return (
    <PdfTool
      id="pdf-metadata-viewer"
      settings={() => (
        <p className="text-xs leading-relaxed text-[var(--text-subtle)]">
          Document properties — title, author, producer, dates — come from the PDF information dictionary.
          Many exporters leave them blank.
        </p>
      )}
      run={async ({ first }) => {
        if (!first) return { error: "Add a PDF first." };
        const { readPdfInfo } = await import("@/lib/pdf");
        const info = await readPdfInfo(first.bytes);
        const summary = [
          `File: ${first.file.name}`,
          `Size: ${formatBytes(first.file.size)}`,
          `Pages: ${info.pages}`,
          `Title: ${info.title ?? "—"}`,
          `Author: ${info.author ?? "—"}`,
          `Subject: ${info.subject ?? "—"}`,
          `Creator: ${info.creator ?? "—"}`,
          `Producer: ${info.producer ?? "—"}`,
          `Created: ${info.creationDate ?? "—"}`,
        ].join("\n");
        return {
          text: summary,
          textLabel: "Metadata",
          stats: [
            { label: "Pages", value: info.pages.toString() },
            { label: "Title", value: info.title ?? "—" },
            { label: "Author", value: info.author ?? "—" },
            { label: "Created", value: info.creationDate ? info.creationDate.slice(0, 10) : "—" },
          ],
          table: {
            head: ["Property", "Value"],
            rows: [
              ["Title", info.title ?? "—"],
              ["Author", info.author ?? "—"],
              ["Subject", info.subject ?? "—"],
              ["Creator", info.creator ?? "—"],
              ["Producer", info.producer ?? "—"],
              ["Created", info.creationDate ?? "—"],
              ["Pages", info.pages.toString()],
              ["File size", formatBytes(first.file.size)],
            ],
            caption: "PDF properties",
          },
          note:
            "Metadata is not security: it can be edited with any PDF tool, so it identifies the software that produced a file more reliably than the person who wrote it.",
        };
      }}
    />
  );
}
