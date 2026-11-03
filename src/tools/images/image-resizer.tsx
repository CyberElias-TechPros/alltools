"use client";

import { useState } from "react";
import { Field, Select, Switch, TextInput } from "@/components/ui";
import { ImageTool } from "@/components/tools/image-tool";
import { canvasToBlob, drawToCanvas, extensionFor, withExtension } from "@/lib/image";
import { formatBytes } from "@/lib/utils";

export default function ImageResizer() {
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [keepRatio, setKeepRatio] = useState(true);
  const [fit, setFit] = useState("stretch");
  const [format, setFormat] = useState("image/png");

  return (
    <ImageTool
      id="image-resizer"
      runKey={`${width}-${height}-${keepRatio}-${fit}-${format}`}
      settings={({ image }) => (
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="New width" htmlFor="ir-width" hint={image ? `Original: ${image.width} px` : undefined}>
            <TextInput
              id="ir-width"
              type="number"
              min={1}
              value={width}
              placeholder={image ? String(image.width) : "0"}
              onChange={(event) => {
                const next = event.target.value;
                setWidth(next);
                if (keepRatio && image && Number(next) > 0) {
                  setHeight(String(Math.round((Number(next) / image.width) * image.height)));
                }
              }}
            />
          </Field>
          <Field label="New height" htmlFor="ir-height" hint={image ? `Original: ${image.height} px` : undefined}>
            <TextInput
              id="ir-height"
              type="number"
              min={1}
              value={height}
              placeholder={image ? String(image.height) : "0"}
              onChange={(event) => {
                const next = event.target.value;
                setHeight(next);
                if (keepRatio && image && Number(next) > 0) {
                  setWidth(String(Math.round((Number(next) / image.height) * image.width)));
                }
              }}
            />
          </Field>
          <div className="sm:col-span-2">
            <Switch id="ir-ratio" checked={keepRatio} onChange={setKeepRatio} label="Keep aspect ratio" description="Changing one dimension updates the other" />
          </div>
          <Field label="Fit" htmlFor="ir-fit">
            <Select id="ir-fit" value={fit} onChange={(event) => setFit(event.target.value)}>
              <option value="stretch">Stretch to exact size</option>
              <option value="cover">Crop to fill</option>
              <option value="contain">Fit inside with margins</option>
            </Select>
          </Field>
          <Field label="Output format" htmlFor="ir-format">
            <Select id="ir-format" value={format} onChange={(event) => setFormat(event.target.value)}>
              <option value="image/png">PNG</option>
              <option value="image/webp">WebP</option>
              <option value="image/jpeg">JPEG</option>
            </Select>
          </Field>
        </div>
      )}
      run={async ({ image, file }) => {
        const targetWidth = Math.max(1, Math.round(Number(width) || image.width));
        const targetHeight = Math.max(1, Math.round(Number(height) || image.height));
        const canvas = drawToCanvas(image, targetWidth, targetHeight, {
          fit: fit as "stretch" | "cover" | "contain",
          background: "#ffffff",
        });
        const blob = await canvasToBlob(canvas, format, format === "image/png" ? undefined : 0.9);
        return {
          blob,
          filename: withExtension(file.name, extensionFor(format)),
          stats: [
            { label: "New size", value: `${targetWidth} × ${targetHeight}` },
            { label: "Scale", value: `${Math.round((targetWidth / image.width) * 1000) / 10}%` },
            { label: "Megapixels", value: ((targetWidth * targetHeight) / 1_000_000).toFixed(2) },
            { label: "File size", value: formatBytes(blob.size) },
          ],
          note:
            fit === "contain"
              ? "Fit inside adds white margins so the whole image stays visible without distortion."
              : fit === "cover"
                ? "Crop to fill keeps the aspect ratio and trims the overflowing edges — useful for thumbnails and cover images."
                : "Stretching to a different aspect ratio distorts the image, so keep the ratio lock on unless you mean to squash it.",
        };
      }}
    />
  );
}
