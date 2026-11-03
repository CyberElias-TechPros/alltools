"use client";

import { useState } from "react";
import { Field, TextInput } from "@/components/ui";
import { PdfTool } from "@/components/tools/pdf-tool";
import { reorderPages } from "@/lib/pdf";
import { formatBytes } from "@/lib/utils";

export default function PdfPageReorderTool() {
  const [order, setOrder] = useState("3, 1, 2");

  return (
    <PdfTool
      id="pdf-page-reorder-tool"
      runKey={order}
      settings={({ pages }) => (
        <Field
          label="New page order"
          htmlFor="reorder-pages"
          hint={pages ? `List page numbers separated by commas. Omit pages to delete them. ${pages} page(s) available.` : undefined}
        >
          <TextInput id="reorder-pages" value={order} onChange={(event) => setOrder(event.target.value)} />
        </Field>
      )}
      run={async ({ first }) => {
        if (!first) return { error: "Add a PDF first." };
        const numbers = order
          .split(/[,\s]+/)
          .filter(Boolean)
          .map(Number);
        if (numbers.length === 0) return { error: "Enter at least one page number." };
        if (numbers.some((page) => !Number.isInteger(page) || page < 1 || page > first.pages)) {
          return { error: `Page numbers must be between 1 and ${first.pages}.` };
        }
        const bytes = await reorderPages(first.bytes, numbers);
        const blob = new Blob([bytes as unknown as BlobPart], { type: "application/pdf" });
        return {
          blob,
          filename: "reordered.pdf",
          stats: [
            { label: "Pages kept", value: numbers.length.toString() },
            { label: "Original", value: first.pages.toString() },
            { label: "Output size", value: formatBytes(blob.size) },
          ],
          note:
            "Listing a page twice duplicates it; leaving one out removes it. That makes this a quick way to drop a cover page and move an appendix to the front.",
        };
      }}
    />
  );
}
