"use client";

import { useState } from "react";
import { Field, Select, TextInput } from "@/components/ui";
import { ImageTool } from "@/components/tools/image-tool";
import { canvasToBlob, drawToCanvas, extensionFor, withExtension } from "@/lib/image";
import { formatBytes } from "@/lib/utils";

/**
 * Shared implementation for the single-target image format converters
 * (JPG → PNG, PNG → JPG, WebP converter).
 */
export function FormatConvertTool({
  id,
  target,
  accept,
  title,
}: {
  id: string;
  target: "image/png" | "image/jpeg" | "image/webp";
  accept: string;
  title: string;
}) {
  const [quality, setQuality] = useState("0.92");
  const [background, setBackground] = useState("#ffffff");

  const extension = extensionFor(target);
  const runKey = `${quality}-${background}`;

  return (
    <ImageTool
      id={id}
      accept={accept}
      runKey={runKey}
      emptyHint={`Choose a ${accept.replace("image/", "").replace(",", " or ").toUpperCase()} file. It is converted locally.`}
      settings={() => (
        <div className="grid gap-3 sm:grid-cols-2">
          {target !== "image/png" ? (
            <Field label="Quality" htmlFor={`${id}-quality`} hint="1.0 is highest quality and largest file">
              <TextInput
                id={`${id}-quality`}
                type="number"
                min={0.2}
                max={1}
                step={0.01}
                value={quality}
                onChange={(event) => setQuality(event.target.value)}
              />
            </Field>
          ) : null}
          {target === "image/jpeg" ? (
            <Field label="Background behind transparency" htmlFor={`${id}-bg`} hint="JPEG has no alpha channel, so transparent areas are filled">
              <TextInput
                id={`${id}-bg`}
                type="color"
                value={background}
                onChange={(event) => setBackground(event.target.value)}
              />
            </Field>
          ) : null}
        </div>
      )}
      run={async ({ image, file }) => {
        const parsedQuality = Math.min(Math.max(Number(quality) || 0.92, 0.2), 1);
        const canvas = drawToCanvas(image, image.width, image.height, {
          background: target === "image/jpeg" ? background : undefined,
        });
        const blob = await canvasToBlob(canvas, target, target === "image/png" ? undefined : parsedQuality);
        return {
          blob,
          filename: withExtension(file.name, extension),
          stats: [
            { label: "Format", value: extension.toUpperCase() },
            { label: "Dimensions", value: `${image.width} × ${image.height}` },
            { label: "Original", value: formatBytes(file.size) },
            { label: "New size", value: formatBytes(blob.size) },
          ],
          note:
            target === "image/png"
              ? "PNG is lossless, so the file is usually larger than a JPEG but keeps every pixel exactly and supports transparency."
              : `${extension.toUpperCase()} is a lossy format at this quality setting: smaller files, with some detail discarded. Transparency is not supported.`,
        };
      }}
    />
  );
}
