"use client";

import { useState } from "react";
import { Field, Switch, TextInput } from "@/components/ui";
import { PdfTool } from "@/components/tools/pdf-tool";
import { watermarkPdf } from "@/lib/pdf";
import { formatBytes } from "@/lib/utils";

export default function PdfWatermarkTool() {
  const [text, setText] = useState("CONFIDENTIAL");
  const [opacity, setOpacity] = useState("0.18");
  const [size, setSize] = useState("60");
  const [diagonal, setDiagonal] = useState(true);

  return (
    <PdfTool
      id="pdf-watermark-tool"
      runKey={`${text}-${opacity}-${size}-${diagonal}`}
      settings={() => (
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Watermark text" htmlFor="wm-text">
            <TextInput id="wm-text" value={text} onChange={(event) => setText(event.target.value)} />
          </Field>
          <Field label="Size" htmlFor="wm-size" hint="Points, measured before rotation">
            <TextInput id="wm-size" type="number" min={12} max={160} step={2} value={size} onChange={(event) => setSize(event.target.value)} />
          </Field>
          <Field label="Opacity" htmlFor="wm-opacity" hint="Keep it low so the document stays readable">
            <TextInput id="wm-opacity" type="number" min={0.05} max={1} step={0.05} value={opacity} onChange={(event) => setOpacity(event.target.value)} />
          </Field>
          <div className="flex items-end">
            <Switch id="wm-diagonal" checked={diagonal} onChange={setDiagonal} label="Diagonal" />
          </div>
        </div>
      )}
      run={async ({ first }) => {
        if (!first) return { error: "Add a PDF first." };
        if (!text.trim()) return { error: "Enter the watermark text." };
        const bytes = await watermarkPdf(first.bytes, {
          text,
          opacity: Number(opacity) || 0.18,
          diagonal,
          fontSize: Math.min(Math.max(Number(size) || 60, 8), 200),
        });
        const blob = new Blob([bytes as unknown as BlobPart], { type: "application/pdf" });
        return {
          blob,
          filename: "watermarked.pdf",
          stats: [
            { label: "Pages stamped", value: first.pages.toString() },
            { label: "Text", value: text },
            { label: "Output size", value: formatBytes(blob.size) },
          ],
          note:
            "The watermark is drawn on every page as real text in a standard font, so it prints with the document. It is a visible marking, not encryption — anyone with a PDF editor can remove it.",
        };
      }}
    />
  );
}
