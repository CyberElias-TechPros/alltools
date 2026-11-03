"use client";

import { useState } from "react";
import { Field, TextInput } from "@/components/ui";
import { ImageTool } from "@/components/tools/image-tool";
import { canvasToBlob, pixelateCanvas, withExtension } from "@/lib/image";
import { formatBytes } from "@/lib/utils";

export default function ImagePixelator() {
  const [blocks, setBlocks] = useState("24");

  return (
    <ImageTool
      id="image-pixelator"
      runKey={blocks}
      settings={() => (
        <Field label="Detail" htmlFor="ipt-blocks" hint="Blocks across the longest edge — lower is more pixelated">
          <TextInput
            id="ipt-blocks"
            type="number"
            min={2}
            max={400}
            step={1}
            value={blocks}
            onChange={(event) => setBlocks(event.target.value)}
          />
        </Field>
      )}
      run={async ({ image, file }) => {
        const value = Math.min(Math.max(Number(blocks) || 24, 2), 400);
        const canvas = pixelateCanvas(
          (() => {
            const source = document.createElement("canvas");
            source.width = image.width;
            source.height = image.height;
            source.getContext("2d")?.drawImage(image, 0, 0);
            return source;
          })(),
          value,
        );
        const blob = await canvasToBlob(canvas, "image/png");
        const blockSize = Math.max(2, Math.round(Math.max(image.width, image.height) / value));
        return {
          blob,
          filename: withExtension(file.name, "png").replace(/(\.[a-z0-9]+)$/i, "-pixelated$1"),
          stats: [
            { label: "Detail", value: `${value} blocks across` },
            { label: "Block size", value: `about ${blockSize} px` },
            { label: "Dimensions", value: `${canvas.width} × ${canvas.height}` },
            { label: "File size", value: formatBytes(blob.size) },
          ],
          note:
            "Pixelation is a visual effect, not security. Large blocks destroy recognisable details, but small blocks can sometimes be reconstructed — use a solid mask when privacy matters.",
        };
      }}
    />
  );
}
