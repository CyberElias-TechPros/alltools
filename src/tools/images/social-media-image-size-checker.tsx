"use client";

import { ImageTool } from "@/components/tools/image-tool";
import { formatBytes } from "@/lib/utils";

const PRESETS: Array<{ platform: string; use: string; width: number; height: number; ratio: string }> = [
  { platform: "Instagram", use: "Square post", width: 1080, height: 1080, ratio: "1:1" },
  { platform: "Instagram", use: "Portrait post", width: 1080, height: 1350, ratio: "4:5" },
  { platform: "Instagram", use: "Story / Reel", width: 1080, height: 1920, ratio: "9:16" },
  { platform: "X", use: "In-stream image", width: 1600, height: 900, ratio: "16:9" },
  { platform: "LinkedIn", use: "Feed image", width: 1200, height: 627, ratio: "1.91:1" },
  { platform: "Facebook", use: "Feed image", width: 1200, height: 630, ratio: "1.91:1" },
  { platform: "YouTube", use: "Thumbnail", width: 1280, height: 720, ratio: "16:9" },
  { platform: "Pinterest", use: "Pin", width: 1000, height: 1500, ratio: "2:3" },
  { platform: "Open Graph", use: "Link preview", width: 1200, height: 630, ratio: "1.91:1" },
];

export default function SocialMediaImageSizeChecker() {
  return (
    <ImageTool
      id="social-media-image-size-checker"
      settings={({ image }) => (
        <p className="text-xs leading-relaxed text-[var(--text-subtle)]">
          Your image is {image ? `${image.width} × ${image.height}` : "not loaded"} px. The table below compares it with the sizes each
          platform recommends — exact matches matter less than the aspect ratio, which decides what gets
          cropped.
        </p>
      )}
      run={({ image, file }) => {
        const rows = PRESETS.map((preset) => {
          const exact = image.width === preset.width && image.height === preset.height;
          const targetRatio = preset.width / preset.height;
          const actualRatio = image.width / image.height;
          const ratioMatch = Math.abs(targetRatio - actualRatio) / targetRatio < 0.02;
          const enough = image.width >= preset.width && image.height >= preset.height;
          const status = exact ? "Exact match" : ratioMatch && enough ? "Ratio fits" : ratioMatch ? "Ratio fits, below size" : "Will be cropped";
          return [`${preset.platform} — ${preset.use}`, `${preset.width} × ${preset.height}`, preset.ratio, status];
        });
        return {
          stats: [
            { label: "Your image", value: `${image.width} × ${image.height}` },
            { label: "Megapixels", value: ((image.width * image.height) / 1_000_000).toFixed(2) },
            { label: "File size", value: formatBytes(file.size) },
            { label: "Format", value: (file.type || "unknown").replace("image/", "").toUpperCase() },
          ],
          table: { head: ["Platform", "Recommended", "Ratio", "Verdict"], rows, caption: "Social image presets" },
          note:
            "Platforms re-encode and crop every upload, so exporting at the recommended size in the right ratio loses the least. Images under about 1080 px wide look soft on high-density phone screens.",
        };
      }}
    />
  );
}
