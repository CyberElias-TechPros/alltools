"use client";

import { PdfTool } from "@/components/tools/pdf-tool";
import { extractDocxText } from "@/lib/docx";
import { textToPdf } from "@/lib/pdf";
import { formatBytes } from "@/lib/utils";

export default function DocxToPdfConverter() {
  return (
    <PdfTool
      id="docx-to-pdf-converter"
      accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      multiple={false}
      emptyHint="Choose a .docx file. Paragraph text is extracted in the browser and set as a clean PDF."
      settings={() => (
        <p className="text-xs leading-relaxed text-[var(--text-subtle)]">
          This conversion keeps the words and paragraph breaks. Bold, tables, images and page layout are not
          carried across, because a faithful DOCX renderer would be a word processor — for design-critical
          documents, export from Word or LibreOffice instead.
        </p>
      )}
      run={async ({ files }) => {
        const file = files[0];
        if (!file) return { error: "Choose a .docx file." };
        const text = await extractDocxText(await file.arrayBuffer());
        if (!text.trim()) return { error: "No text was found in that document." };
        const bytes = await textToPdf(text, { fontSize: 11, margin: 56, pageSize: "a4", title: file.name.replace(/\.docx$/i, "") });
        const blob = new Blob([bytes as unknown as BlobPart], { type: "application/pdf" });
        return {
          blob,
          filename: file.name.replace(/\.docx$/i, ".pdf"),
          stats: [
            { label: "Words", value: text.split(/\s+/).filter(Boolean).length.toLocaleString() },
            { label: "Input", value: formatBytes(file.size) },
            { label: "Output", value: formatBytes(blob.size) },
          ],
          note:
            "Only the text content is converted, so check page breaks and any figures afterwards. The original .docx stays untouched on your device.",
        };
      }}
    />
  );
}
