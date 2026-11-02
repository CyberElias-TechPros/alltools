"use client";

import { useState } from "react";
import { Field, TextInput } from "@/components/ui";
import { ImageTool } from "@/components/tools/image-tool";
import { canvasToBlob, createCanvas, withExtension } from "@/lib/image";
import { formatBytes } from "@/lib/utils";

export default function ImageBlurTool() {
  const [radius, setRadius] = useState("8");

  return (
    <ImageTool
      id="image-blur-tool"
      runKey={radius}
      settings={() => (
        <Field label="Blur radius" htmlFor="ibt-radius" hint="In pixels — 3 is a slight softness, 20+ hides details">
          <TextInput
            id="ibt-radius"
            type="number"
            min={0}
            max={100}
            step={1}
            value={radius}
            onChange={(event) => setRadius(event.target.value)}
          />
        </Field>
      )}
      run={async ({ image, file }) => {
        const value = Math.min(Math.max(Number(radius) || 0, 0), 100);
        const canvas = createCanvas(image.width, image.height);
        const context = canvas.getContext("2d");
        if (!context) return { error: "Canvas is unavailable in this browser." };
        context.filter = `blur(${value}px)`;
        context.drawImage(image, 0, 0);
        const blob = await canvasToBlob(canvas, "image/png");
        return {
          blob,
          filename: withExtension(file.name, "png").replace(/(\.[a-z0-9]+)$/i, `-blur${value}$1`),
          stats: [
            { label: "Blur radius", value: `${value}px` },
            { label: "Dimensions", value: `${image.width} × ${image.height}` },
            { label: "File size", value: formatBytes(blob.size) },
          ],
          note:
            "Blurring pixels is not redaction. If you need to hide a face, number plate or name for good, cover the area with a solid block — a strong blur can sometimes be reversed with modern tooling.",
        };
      }}
    />
  );
}
