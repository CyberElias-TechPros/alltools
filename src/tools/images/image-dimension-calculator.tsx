"use client";

import { FormTool, num, str } from "@/components/tools/form-tool";
import { gcd } from "@/lib/math";

export default function ImageDimensionCalculator() {
  return (
    <FormTool
      spec={{
        columns: 3,
        fields: [
          { kind: "number", id: "width", label: "Original width", value: "4032", unit: "px", min: 1, step: 1 },
          { kind: "number", id: "height", label: "Original height", value: "3024", unit: "px", min: 1, step: 1 },
          {
            kind: "select",
            id: "mode",
            label: "Scale by",
            value: "percent",
            options: [
              { value: "percent", label: "A percentage" },
              { value: "width", label: "A target width" },
              { value: "height", label: "A target height" },
            ],
          },
          { kind: "number", id: "percent", label: "Scale", value: "50", unit: "%", min: 1, step: 1 },
          { kind: "number", id: "target", label: "Target size", value: "1920", unit: "px", min: 1, step: 1 },
        ],
        compute: (values) => {
          const width = num(values, "width");
          const height = num(values, "height");
          if (!(width > 0) || !(height > 0)) return { error: "Enter the original dimensions." };
          const mode = str(values, "mode");
          let scale = 1;
          if (mode === "percent") {
            const percent = num(values, "percent");
            if (!(percent > 0)) return { error: "Enter a scale percentage greater than zero." };
            scale = percent / 100;
          } else if (mode === "width") {
            const target = num(values, "target");
            if (!(target > 0)) return { error: "Enter a target width." };
            scale = target / width;
          } else {
            const target = num(values, "target");
            if (!(target > 0)) return { error: "Enter a target height." };
            scale = target / height;
          }

          const newWidth = Math.max(1, Math.round(width * scale));
          const newHeight = Math.max(1, Math.round(height * scale));
          const divisor = gcd(Math.round(width), Math.round(height)) || 1;

          return {
            label: "New dimensions",
            value: `${newWidth} × ${newHeight} px`,
            sub: `${(scale * 100).toFixed(1)}% of the original, keeping the aspect ratio. ${((newWidth * newHeight) / 1_000_000).toFixed(2)} megapixels.`,
            stats: [
              { label: "Width", value: `${newWidth} px` },
              { label: "Height", value: `${newHeight} px` },
              { label: "Pixel count", value: (newWidth * newHeight).toLocaleString() },
              { label: "Aspect ratio", value: `${width / divisor}:${height / divisor}` },
              { label: "Original MP", value: ((width * height) / 1_000_000).toFixed(2) },
              { label: "New MP", value: ((newWidth * newHeight) / 1_000_000).toFixed(2) },
            ],
            table: {
              head: ["Scale", "Width", "Height", "Megapixels"],
              rows: [25, 50, 75, 100].map((percent) => {
                const w = Math.round((width * percent) / 100);
                const h = Math.round((height * percent) / 100);
                return [`${percent}%`, `${w}`, `${h}`, ((w * h) / 1_000_000).toFixed(2)];
              }),
              caption: "Common scale factors",
            },
            note:
              "Downscaling keeps quality and reduces file size. Upscaling cannot invent detail — the result is softer than a true higher-resolution original.",
          };
        },
      }}
    />
  );
}
