"use client";

import { useState } from "react";
import { Field, Select, TextInput } from "@/components/ui";
import { ImageTool } from "@/components/tools/image-tool";
import { canvasToBlob, createCanvas, extensionFor, withExtension } from "@/lib/image";
import { formatBytes } from "@/lib/utils";

const ASPECTS: Record<string, number | null> = {
  free: null,
  "1:1": 1,
  "4:3": 4 / 3,
  "3:2": 3 / 2,
  "16:9": 16 / 9,
  "9:16": 9 / 16,
};

export default function ImageCropper() {
  const [aspect, setAspect] = useState("1:1");
  const [widthPercent, setWidthPercent] = useState("80");
  const [horizontal, setHorizontal] = useState("center");
  const [vertical, setVertical] = useState("middle");
  const [format, setFormat] = useState("image/png");

  return (
    <ImageTool
      id="image-cropper"
      runKey={`${aspect}-${widthPercent}-${horizontal}-${vertical}-${format}`}
      settings={() => (
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Aspect ratio" htmlFor="icrop-aspect">
            <Select id="icrop-aspect" value={aspect} onChange={(event) => setAspect(event.target.value)}>
              {Object.keys(ASPECTS).map((key) => (
                <option key={key} value={key}>
                  {key === "free" ? "Free height" : key}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Crop width" htmlFor="icrop-width" hint="Percentage of the image width to keep">
            <TextInput
              id="icrop-width"
              type="number"
              min={10}
              max={100}
              step={5}
              value={widthPercent}
              onChange={(event) => setWidthPercent(event.target.value)}
            />
          </Field>
          <Field label="Horizontal position" htmlFor="icrop-h">
            <Select id="icrop-h" value={horizontal} onChange={(event) => setHorizontal(event.target.value)}>
              <option value="left">Left</option>
              <option value="center">Centre</option>
              <option value="right">Right</option>
            </Select>
          </Field>
          <Field label="Vertical position" htmlFor="icrop-v">
            <Select id="icrop-v" value={vertical} onChange={(event) => setVertical(event.target.value)}>
              <option value="top">Top</option>
              <option value="middle">Middle</option>
              <option value="bottom">Bottom</option>
            </Select>
          </Field>
          <Field label="Output format" htmlFor="icrop-format">
            <Select id="icrop-format" value={format} onChange={(event) => setFormat(event.target.value)}>
              <option value="image/png">PNG</option>
              <option value="image/jpeg">JPEG</option>
              <option value="image/webp">WebP</option>
            </Select>
          </Field>
        </div>
      )}
      run={async ({ image, file }) => {
        const percent = Math.min(Math.max(Number(widthPercent) || 80, 10), 100);
        const cropWidth = Math.round((image.width * percent) / 100);
        const ratio = ASPECTS[aspect];
        const cropHeight = Math.min(
          image.height,
          Math.max(1, Math.round(ratio ? cropWidth / ratio : (image.height * percent) / 100)),
        );
        const x =
          horizontal === "left" ? 0 : horizontal === "right" ? image.width - cropWidth : Math.round((image.width - cropWidth) / 2);
        const y =
          vertical === "top" ? 0 : vertical === "bottom" ? image.height - cropHeight : Math.round((image.height - cropHeight) / 2);

        const canvas = createCanvas(cropWidth, cropHeight);
        const context = canvas.getContext("2d");
        if (!context) return { error: "Canvas is unavailable in this browser." };
        if (format === "image/jpeg") {
          context.fillStyle = "#ffffff";
          context.fillRect(0, 0, cropWidth, cropHeight);
        }
        context.drawImage(image, x, y, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);
        const blob = await canvasToBlob(canvas, format, format === "image/png" ? undefined : 0.92);

        return {
          blob,
          filename: withExtension(file.name, extensionFor(format)),
          stats: [
            { label: "Crop size", value: `${cropWidth} × ${cropHeight}` },
            { label: "Offset", value: `${x}, ${y}` },
            { label: "Ratio kept", value: aspect === "free" ? "no" : aspect },
            { label: "File size", value: formatBytes(blob.size) },
          ],
          note:
            "The crop is applied from the top-left edge of the chosen region. If the requested ratio is taller than the image, the height is clamped to the image rather than padded.",
        };
      }}
    />
  );
}
