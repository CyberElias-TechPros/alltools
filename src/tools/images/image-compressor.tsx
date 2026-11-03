"use client";

import { useState } from "react";
import { Field, Select, TextInput } from "@/components/ui";
import { ImageTool } from "@/components/tools/image-tool";
import { canvasToBlob, drawToCanvas, extensionFor, withExtension } from "@/lib/image";
import { clamp, formatBytes } from "@/lib/utils";

export default function ImageCompressor() {
  const [quality, setQuality] = useState("0.75");
  const [maxWidth, setMaxWidth] = useState("1600");
  const [format, setFormat] = useState("image/webp");

  return (
    <ImageTool
      id="image-compressor"
      runKey={`${quality}-${maxWidth}-${format}`}
      settings={() => (
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Quality" htmlFor="ic-quality" hint="0.4–0.8 is usually indistinguishable">
            <TextInput
              id="ic-quality"
              type="number"
              min={0.1}
              max={1}
              step={0.05}
              value={quality}
              onChange={(event) => setQuality(event.target.value)}
            />
          </Field>
          <Field label="Max width" htmlFor="ic-width" hint="Larger images are scaled down">
            <TextInput
              id="ic-width"
              type="number"
              min={64}
              step={10}
              value={maxWidth}
              onChange={(event) => setMaxWidth(event.target.value)}
            />
          </Field>
          <Field label="Output format" htmlFor="ic-format">
            <Select id="ic-format" value={format} onChange={(event) => setFormat(event.target.value)}>
              <option value="image/webp">WebP (smallest)</option>
              <option value="image/jpeg">JPEG</option>
              <option value="image/png">PNG (lossless)</option>
            </Select>
          </Field>
        </div>
      )}
      run={async ({ image, file }) => {
        const q = clamp(Number(quality) || 0.75, 0.1, 1);
        const targetWidth = Math.max(64, Number(maxWidth) || image.width);
        const scale = Math.min(1, targetWidth / image.width);
        const width = Math.round(image.width * scale);
        const height = Math.round(image.height * scale);
        const canvas = drawToCanvas(image, width, height, {
          background: format === "image/jpeg" ? "#ffffff" : undefined,
        });
        const blob = await canvasToBlob(canvas, format, format === "image/png" ? undefined : q);
        const saved = file.size > 0 ? Math.round((1 - blob.size / file.size) * 1000) / 10 : 0;
        const stats = [
          { label: "Original", value: formatBytes(file.size) },
          { label: "New", value: formatBytes(blob.size) },
          { label: "Dimensions", value: `${width} × ${height}` },
          { label: "Quality", value: format === "image/png" ? "lossless" : q.toFixed(2) },
        ];
        if (blob.size >= file.size) {
          return {
            blob,
            filename: withExtension(file.name, extensionFor(format)),
            stats,
            note:
              "The new file is not smaller than the original — it was probably already compressed, or it is a PNG saved as a PNG. Try WebP, a lower quality value, or a smaller max width.",
          };
        }
        return {
          blob,
          filename: withExtension(file.name, extensionFor(format)),
          stats: [...stats.slice(0, 2), { label: "Saving", value: `${saved}%` }, stats[3]],
          note:
            "Compression trades detail for size. Check the preview at full size before publishing: faces, text and fine gradients are the first things to show artefacts.",
        };
      }}
    />
  );
}
