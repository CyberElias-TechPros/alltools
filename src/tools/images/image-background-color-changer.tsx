"use client";

import { useState } from "react";
import { Field, Select, TextInput } from "@/components/ui";
import { ImageTool } from "@/components/tools/image-tool";
import { canvasToBlob, createCanvas, withExtension } from "@/lib/image";
import { formatBytes } from "@/lib/utils";

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  const value = clean.length === 3 ? clean.split("").map((char) => char + char).join("") : clean;
  const number = Number.parseInt(value, 16);
  return [(number >> 16) & 255, (number >> 8) & 255, number & 255];
}

export default function ImageBackgroundColorChanger() {
  const [source, setSource] = useState("#ffffff");
  const [replacement, setReplacement] = useState("#0b0b09");
  const [tolerance, setTolerance] = useState("40");
  const [mode, setMode] = useState("replace");

  return (
    <ImageTool
      id="image-background-color-changer"
      runKey={`${source}-${replacement}-${tolerance}-${mode}`}
      settings={() => (
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Colour to target" htmlFor="ibg-source" hint="Usually the background you want gone">
            <TextInput id="ibg-source" type="color" value={source} onChange={(event) => setSource(event.target.value)} />
          </Field>
          <Field label="Replace with" htmlFor="ibg-replacement">
            <TextInput id="ibg-replacement" type="color" value={replacement} onChange={(event) => setReplacement(event.target.value)} />
          </Field>
          <Field label="Tolerance" htmlFor="ibg-tolerance" hint="0 replaces only the exact colour; higher values also catch near matches and shadows">
            <TextInput
              id="ibg-tolerance"
              type="number"
              min={0}
              max={255}
              step={1}
              value={tolerance}
              onChange={(event) => setTolerance(event.target.value)}
            />
          </Field>
          <Field label="Mode" htmlFor="ibg-mode">
            <Select id="ibg-mode" value={mode} onChange={(event) => setMode(event.target.value)}>
              <option value="replace">Replace with a colour</option>
              <option value="transparent">Make transparent</option>
            </Select>
          </Field>
        </div>
      )}
      run={async ({ image, file }) => {
        const canvas = createCanvas(image.width, image.height);
        const context = canvas.getContext("2d");
        if (!context) return { error: "Canvas is unavailable in this browser." };
        context.drawImage(image, 0, 0);
        const data = context.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = data.data;
        const [tr, tg, tb] = hexToRgb(source);
        const [rr, rg, rb] = hexToRgb(replacement);
        const limit = Math.min(Math.max(Number(tolerance) || 0, 0), 255) * Math.sqrt(3);
        let changed = 0;

        for (let index = 0; index < pixels.length; index += 4) {
          const distance = Math.sqrt(
            (pixels[index] - tr) ** 2 + (pixels[index + 1] - tg) ** 2 + (pixels[index + 2] - tb) ** 2,
          );
          if (distance <= limit) {
            if (mode === "transparent") {
              pixels[index + 3] = 0;
            } else {
              pixels[index] = rr;
              pixels[index + 1] = rg;
              pixels[index + 2] = rb;
              pixels[index + 3] = 255;
            }
            changed += 1;
          }
        }

        context.putImageData(data, 0, 0);
        const blob = await canvasToBlob(canvas, "image/png");
        const share = (changed / (pixels.length / 4)) * 100;
        return {
          blob,
          filename: withExtension(file.name, "png").replace(/(\.[a-z0-9]+)$/i, "-background$1"),
          stats: [
            { label: "Pixels changed", value: `${share.toFixed(1)}%` },
            { label: "Tolerance", value: `${tolerance}` },
            { label: "Mode", value: mode === "transparent" ? "transparent" : "recolour" },
            { label: "File size", value: formatBytes(blob.size) },
          ],
          note:
            "This is a flat colour replacement, not a subject cut-out. It works well on product shots with a plain background and poorly on photographs with gradients or shadows — raise the tolerance in small steps and check the preview.",
        };
      }}
    />
  );
}
