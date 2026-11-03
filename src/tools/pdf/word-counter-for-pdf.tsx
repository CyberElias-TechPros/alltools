"use client";

import { PdfTool } from "@/components/tools/pdf-tool";
import { countText, sentenceStats, timeToRead } from "@/lib/text";
import { extractPdfText } from "@/lib/pdf";

export default function WordCounterForPdf() {
  return (
    <PdfTool
      id="word-counter-for-pdf"
      settings={() => (
        <p className="text-xs leading-relaxed text-[var(--text-subtle)]">
          Counts the words in a PDF's text layer, which is what a copy editor or a submission limit refers to.
          Scanned pages have no text layer and will count as zero.
        </p>
      )}
      run={async ({ first }) => {
        if (!first) return { error: "Add a PDF first." };
        const pages = await extractPdfText(first.bytes);
        const text = pages.join("\n\n");
        const counts = countText(text);
        const sentences = sentenceStats(text);
        const wordsPerPage = first.pages > 0 ? Math.round(counts.words / first.pages) : 0;

        if (counts.words === 0) {
          return {
            stats: [{ label: "Pages", value: first.pages.toString() }],
            note:
              "No text layer found — this looks like a scanned PDF. Its pages are images, so word counts need OCR first.",
          };
        }

        return {
          stats: [
            { label: "Words", value: counts.words.toLocaleString() },
            { label: "Characters", value: counts.characters.toLocaleString() },
            { label: "Pages", value: first.pages.toString() },
            { label: "Words per page", value: wordsPerPage.toLocaleString() },
            { label: "Sentences", value: sentences.sentences.length.toLocaleString() },
            { label: "Reading time", value: `${Math.max(1, Math.round(timeToRead(text) / 60))} min` },
          ],
          table: {
            head: ["Page", "Words"],
            rows: pages.slice(0, 40).map((page, index) => [
              `Page ${index + 1}`,
              page.split(/\s+/).filter(Boolean).length.toLocaleString(),
            ]),
            caption: "Words per page",
          },
          note:
            "Hyphenated line breaks, headers, footers and page numbers are all counted as text. For a submission limit, subtract anything the recipient excludes — usually references and appendices.",
        };
      }}
    />
  );
}
