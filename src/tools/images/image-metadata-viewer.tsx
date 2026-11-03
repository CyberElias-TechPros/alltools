"use client";

import { useState } from "react";
import { CopyButton, EmptyState, SimpleTable, StatGrid, ToolPanel } from "@/components/ui";
import { dominantColours, loadImageFile, type LoadedImage } from "@/lib/image";
import { readExif, type ExifEntry } from "@/lib/exif";
import { formatBytes } from "@/lib/utils";

export default function ImageMetadataViewer() {
  const [image, setImage] = useState<LoadedImage | null>(null);
  const [exif, setExif] = useState<ExifEntry[]>([]);
  const [colours, setColours] = useState<Array<{ hex: string; share: number }>>([]);
  const [error, setError] = useState<string | null>(null);

  async function inspect(file: File | undefined | null) {
    if (!file) return;
    setError(null);
    try {
      const loaded = await loadImageFile(file);
      setImage(loaded);
      const buffer = await file.arrayBuffer();
      setExif(readExif(buffer));
      const canvas = document.createElement("canvas");
      canvas.width = loaded.width;
      canvas.height = loaded.height;
      canvas.getContext("2d")?.drawImage(loaded.image, 0, 0);
      setColours(dominantColours(canvas, 6));
    } catch (thrown) {
      setError(thrown instanceof Error ? thrown.message : "That file could not be read.");
      setImage(null);
    }
  }

  const summary = image
    ? [
        `File: ${image.file.name}`,
        `Type: ${image.file.type || "unknown"}`,
        `Size: ${formatBytes(image.file.size)}`,
        `Dimensions: ${image.width} × ${image.height}`,
        ...exif.map((entry) => `${entry.name}: ${entry.value}`),
      ].join("\n")
    : "";

  return (
    <ToolPanel>
      <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <label htmlFor="imv-file" className="btn btn-secondary inline-flex cursor-pointer">
            Choose an image
          </label>
          <input
            id="imv-file"
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(event) => void inspect(event.target.files?.[0])}
          />
          <p className="mt-2 text-xs leading-relaxed text-[var(--text-subtle)]">
            File details, EXIF capture data and the dominant colours are read on this device. The file is not
            uploaded, and the metadata is not kept after you close the page.
          </p>
          {error ? <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p> : null}

          {image ? (
            <div className="mt-4 flex items-center justify-center border border-[var(--border)] bg-[var(--page-elevated)] p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image.image.src} alt="Inspected" className="max-h-64 w-auto max-w-full object-contain" />
            </div>
          ) : null}

          {colours.length > 0 ? (
            <div className="mt-4">
              <p className="eyebrow mb-2">Dominant colours</p>
              <div className="flex flex-wrap gap-2">
                {colours.map((colour) => (
                  <div key={colour.hex} className="flex items-center gap-2 border border-[var(--border)] px-2 py-1">
                    <span className="size-5 border border-[var(--border-strong)]" style={{ background: colour.hex }} />
                    <span className="font-mono text-[0.68rem] text-[var(--text)]">{colour.hex}</span>
                    <span className="font-mono text-[0.6rem] text-[var(--text-subtle)]">
                      {(colour.share * 100).toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div>
          {image ? (
            <>
              <StatGrid
                columns={3}
                items={[
                  { label: "Dimensions", value: `${image.width} × ${image.height}` },
                  { label: "File size", value: formatBytes(image.file.size) },
                  { label: "Format", value: (image.file.type || "unknown").replace("image/", "").toUpperCase() },
                  { label: "Megapixels", value: ((image.width * image.height) / 1_000_000).toFixed(2) },
                  { label: "EXIF tags", value: exif.length.toString() },
                  { label: "Colours found", value: colours.length.toString() },
                ]}
              />
              <div className="mt-4">
                {exif.length > 0 ? (
                  <SimpleTable
                    head={["Tag", "Value"]}
                    rows={exif.map((entry) => [entry.name, <span key={entry.tag} className="font-mono text-xs">{entry.value}</span>])}
                    caption="EXIF metadata"
                  />
                ) : (
                  <div className="border border-dashed border-[var(--border-strong)] p-4 text-sm text-[var(--text-muted)]">
                    No EXIF data found. Many sites strip metadata when you download an image, and PNG or
                    optimised files often have none. GPS coordinates would appear here if present — this
                    tool never displays or stores them beyond this page.
                  </div>
                )}
              </div>
              <div className="mt-3">
                <CopyButton text={summary} label="Copy metadata" />
              </div>
            </>
          ) : (
            <EmptyState title="No image inspected" description="Choose a file to see its dimensions, metadata and dominant colours." />
          )}
        </div>
      </div>
    </ToolPanel>
  );
}
