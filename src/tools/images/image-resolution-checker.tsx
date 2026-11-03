"use client";

import { ImageTool } from "@/components/tools/image-tool";
import { gcd } from "@/lib/math";
import { formatBytes } from "@/lib/utils";

export default function ImageResolutionChecker() {
  return (
    <ImageTool
      id="image-resolution-checker"
      settings={() => (
        <p className="text-xs leading-relaxed text-[var(--text-subtle)]">
          Resolution is read from the file itself, so no settings are needed. Add an image to see its pixel
          dimensions, aspect ratio and what print sizes it supports.
        </p>
      )}
      run={({ image, file }) => {
        const divisor = gcd(image.width, image.height) || 1;
        const megapixels = (image.width * image.height) / 1_000_000;
        const orientation =
          image.width === image.height ? "square" : image.width > image.height ? "landscape" : "portrait";
        return {
          stats: [
            { label: "Pixels", value: `${image.width} × ${image.height}` },
            { label: "Megapixels", value: megapixels.toFixed(2) },
            { label: "Aspect ratio", value: `${image.width / divisor}:${image.height / divisor}` },
            { label: "Orientation", value: orientation },
            { label: "File size", value: formatBytes(file.size) },
            { label: "Format", value: (file.type || "unknown").replace("image/", "").toUpperCase() },
            { label: "Print at 300 dpi", value: `${(image.width / 300).toFixed(1)} × ${(image.height / 300).toFixed(1)} in` },
            { label: "Print at 150 dpi", value: `${(image.width / 150).toFixed(1)} × ${(image.height / 150).toFixed(1)} in` },
          ],
          table: {
            head: ["Print size", "Required at 300 dpi", "Required at 150 dpi"],
            rows: [
              ["6 × 4 in", "1800 × 1200", "900 × 600"],
              ["10 × 8 in", "3000 × 2400", "1500 × 1200"],
              ["A4 (11.7 × 8.3 in)", "3508 × 2480", "1754 × 1240"],
              ["16 × 12 in", "4800 × 3600", "2400 × 1800"],
            ],
            caption: "Common print sizes and the pixels they need",
          },
          note: `${megapixels.toFixed(1)} megapixels is ${megapixels >= 12 ? "plenty for large prints" : megapixels >= 6 ? "fine for prints up to about A4" : "best kept to screens and small prints"}. Print resolution is judged on the long edge, so always check the ratio matches the paper.`,
        };
      }}
    />
  );
}
