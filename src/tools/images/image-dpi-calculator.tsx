"use client";

import { FormTool, num, str } from "@/components/tools/form-tool";

export default function ImageDpiCalculator() {
  return (
    <FormTool
      spec={{
        columns: 3,
        fields: [
          { kind: "number", id: "width", label: "Pixel width", value: "3000", min: 1, step: 1 },
          { kind: "number", id: "height", label: "Pixel height", value: "2000", min: 1, step: 1 },
          {
            kind: "select",
            id: "solve",
            label: "Find",
            value: "dpi",
            options: [
              { value: "dpi", label: "DPI for a given print size" },
              { value: "size", label: "Print size for a given DPI" },
            ],
          },
          { kind: "number", id: "inches", label: "Print width", value: "10", unit: "in", min: 0.1, step: 0.1, hint: "Used when solving for DPI" },
          { kind: "number", id: "dpi", label: "DPI", value: "300", min: 1, step: 1, hint: "Used when solving for print size" },
        ],
        compute: (values) => {
          const width = num(values, "width");
          const height = num(values, "height");
          if (!(width > 0) || !(height > 0)) return { error: "Enter pixel dimensions greater than zero." };
          const mode = str(values, "solve");
          const ratio = width / height;

          if (mode === "dpi") {
            const inches = num(values, "inches");
            if (!(inches > 0)) return { error: "Enter the intended print width in inches." };
            const dpi = width / inches;
            const printHeight = height / dpi;
            return {
              label: "Effective resolution",
              value: `${dpi.toFixed(1)} dpi`,
              sub: `Printing ${width} × ${height} px at ${inches} inches wide is ${dpi.toFixed(0)} dpi across a ${inches.toFixed(2)} × ${printHeight.toFixed(2)} inch print.`,
              stats: [
                { label: "DPI", value: dpi.toFixed(1) },
                { label: "Print size", value: `${inches.toFixed(2)} × ${printHeight.toFixed(2)} in` },
                { label: "Megapixels", value: ((width * height) / 1_000_000).toFixed(2) },
                { label: "Quality verdict", value: dpi >= 300 ? "print quality" : dpi >= 150 ? "acceptable" : "screen only" },
              ],
              note:
                "300 dpi is the usual target for offset-quality prints, 150 dpi is fine for posters viewed from a distance, and below about 100 dpi individual pixels become visible.",
            };
          }

          const dpi = num(values, "dpi");
          if (!(dpi > 0)) return { error: "Enter a DPI value greater than zero." };
          const printWidth = width / dpi;
          const printHeight = height / dpi;
          return {
            label: "Maximum print size",
            value: `${printWidth.toFixed(2)} × ${printHeight.toFixed(2)} in`,
            sub: `At ${dpi} dpi this image prints ${printWidth.toFixed(2)} × ${printHeight.toFixed(2)} inches (${(printWidth * 2.54).toFixed(1)} × ${(printHeight * 2.54).toFixed(1)} cm).`,
            stats: [
              { label: "Width", value: `${printWidth.toFixed(2)} in` },
              { label: "Height", value: `${printHeight.toFixed(2)} in` },
              { label: "Centimetres", value: `${(printWidth * 2.54).toFixed(1)} × ${(printHeight * 2.54).toFixed(1)}` },
              { label: "Aspect ratio", value: `${ratio.toFixed(2)}:1` },
            ],
            table: {
              head: ["DPI", "Print size"],
              rows: [72, 150, 300, 600].map((value) => [
                value.toString(),
                `${(width / value).toFixed(1)} × ${(height / value).toFixed(1)} in`,
              ]),
              caption: "Print size at common resolutions",
            },
            note:
              "Dots per inch only describes how densely the pixels are spread on paper. Changing the DPI number in a file's metadata does not add detail — only resampling or a larger original can.",
          };
        },
      }}
    />
  );
}
