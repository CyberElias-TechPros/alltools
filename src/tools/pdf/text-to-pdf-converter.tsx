"use client";

import { useState } from "react";
import { Button, CopyButton, DownloadButton, Field, ResultCard, Select, StatGrid, TextArea, TextInput, ToolPanel } from "@/components/ui";
import { textToPdf } from "@/lib/pdf";
import { downloadBlob, formatBytes } from "@/lib/utils";

export default function TextToPdfConverter() {
  const [text, setText] = useState("");
  const [title, setTitle] = useState("");
  const [fontSize, setFontSize] = useState("11");
  const [margin, setMargin] = useState("56");
  const [pageSize, setPageSize] = useState("a4");
  const [blob, setBlob] = useState<Blob | null>(null);
  const [pages, setPages] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function build() {
    if (!text.trim()) {
      setError("Add some text first.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const bytes = await textToPdf(text, {
        fontSize: Math.min(Math.max(Number(fontSize) || 11, 6), 28),
        margin: Math.min(Math.max(Number(margin) || 56, 12), 144),
        pageSize: pageSize as "a4" | "letter",
        title: title || undefined,
      });
      const next = new Blob([bytes as unknown as BlobPart], { type: "application/pdf" });
      const { PDFDocument } = await import("pdf-lib");
      const doc = await PDFDocument.load(bytes);
      setPages(doc.getPageCount());
      setBlob(next);
    } catch (thrown) {
      setError(thrown instanceof Error ? thrown.message : "The PDF could not be created.");
    } finally {
      setBusy(false);
    }
  }

  const words = text.split(/\s+/).filter(Boolean).length;

  return (
    <ToolPanel>
      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <label htmlFor="ttp-text" className="label">
            Your text
          </label>
          <TextArea
            id="ttp-text"
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Paste notes, a letter, a report or an essay…"
            className="min-h-64"
            spellCheck={false}
          />
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <Field label="Document title" htmlFor="ttp-title" optional>
              <TextInput id="ttp-title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Untitled" />
            </Field>
            <Field label="Page size" htmlFor="ttp-size">
              <Select id="ttp-size" value={pageSize} onChange={(event) => setPageSize(event.target.value)}>
                <option value="a4">A4</option>
                <option value="letter">US Letter</option>
              </Select>
            </Field>
            <Field label="Font size" htmlFor="ttp-font">
              <TextInput id="ttp-font" type="number" min={6} max={28} step={1} value={fontSize} onChange={(event) => setFontSize(event.target.value)} />
            </Field>
            <Field label="Margin" htmlFor="ttp-margin" hint="Points — 72 per inch">
              <TextInput id="ttp-margin" type="number" min={12} max={144} step={4} value={margin} onChange={(event) => setMargin(event.target.value)} />
            </Field>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button variant="primary" onClick={() => void build()}>
              {busy ? "Building…" : "Create PDF"}
            </Button>
            <DownloadButton
              content=""
              filename={`${(title || "document").replace(/[^a-z0-9-]+/gi, "-").toLowerCase()}.pdf`}
              label="Download PDF"
              onDownload={() => blob && downloadBlob(blob, `${(title || "document").replace(/[^a-z0-9-]+/gi, "-").toLowerCase()}.pdf`)}
            />
          </div>
          {error ? <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p> : null}
        </div>

        <div>
          <ResultCard
            label="Document"
            value={blob ? formatBytes(blob.size) : "—"}
            tone="neutral"
            sub={blob ? `${pages} page${pages === 1 ? "" : "s"} · Helvetica ${fontSize}pt · ${pageSize === "a4" ? "A4" : "US Letter"}` : "Fill in the text and press Create PDF."}
            actions={blob ? <CopyButton text={`${title || "Document"}: ${pages} pages, ${formatBytes(blob.size)}`} label="Copy summary" /> : undefined}
          >
            <StatGrid
              columns={3}
              items={[
                { label: "Words", value: words.toLocaleString() },
                { label: "Characters", value: text.length.toLocaleString() },
                { label: "Pages", value: pages || "—" },
              ]}
            />
          </ResultCard>
          <p className="mt-3 text-xs leading-relaxed text-[var(--text-subtle)]">
            Text is wrapped to the page width and paginated in the browser with pdf-lib. Headings, bold and
            images are not interpreted — this is a clean plain-text document, which is what most “make this
            a PDF” requests need.
          </p>
        </div>
      </div>
    </ToolPanel>
  );
}
