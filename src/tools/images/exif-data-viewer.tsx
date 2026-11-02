"use client";

import { useState } from "react";
import { CopyButton, EmptyState, SimpleTable, ToolPanel } from "@/components/ui";
import { readExif, type ExifEntry } from "@/lib/exif";
import { formatBytes } from "@/lib/utils";

const CAMERA_TAGS = new Set([
  "Camera make",
  "Camera model",
  "Lens model",
  "Date taken",
  "Exposure time",
  "F-number",
  "ISO speed",
  "Focal length",
  "Exposure bias",
  "Flash",
  "Software",
]);

export default function ExifDataViewer() {
  const [entries, setEntries] = useState<ExifEntry[]>([]);
  const [filename, setFilename] = useState("");
  const [size, setSize] = useState(0);
  const [error, setError] = useState<string | null>(null);

  async function inspect(file: File | undefined | null) {
    if (!file) return;
    setError(null);
    try {
      const buffer = await file.arrayBuffer();
      const found = readExif(buffer);
      setEntries(found);
      setFilename(file.name);
      setSize(file.size);
      if (found.length === 0) {
        setError("No EXIF block was found in this file. It may have been stripped by the camera app or the site you downloaded it from.");
      }
    } catch (thrown) {
      setError(thrown instanceof Error ? thrown.message : "The file could not be read.");
    }
  }

  const json = JSON.stringify(Object.fromEntries(entries.map((entry) => [entry.name, entry.value])), null, 2);
  const camera = entries.filter((entry) => CAMERA_TAGS.has(entry.name));

  return (
    <ToolPanel>
      <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <label htmlFor="exif-file" className="btn btn-secondary inline-flex cursor-pointer">
            Choose a photo
          </label>
          <input
            id="exif-file"
            type="file"
            accept="image/jpeg,image/png,image/*"
            className="sr-only"
            onChange={(event) => void inspect(event.target.files?.[0])}
          />
          <p className="mt-2 text-xs leading-relaxed text-[var(--text-subtle)]">
            Reads the EXIF block embedded in JPEG and PNG files: camera, lens, exposure settings, capture date
            and any tags the maker wrote. Parsing happens locally, byte by byte, with no upload.
          </p>

          {entries.length > 0 ? (
            <div className="mt-4 space-y-3">
              <p className="font-mono text-xs text-[var(--text)]">
                {filename} · {formatBytes(size)}
              </p>
              <div className="border border-[var(--border)] bg-[var(--page-elevated)] p-3">
                <p className="eyebrow">Camera</p>
                <p className="mt-1 font-mono text-sm text-[var(--text)]">
                  {[camera.find((entry) => entry.name === "Camera make")?.value, camera.find((entry) => entry.name === "Camera model")?.value]
                    .filter(Boolean)
                    .join(" ") || "Not recorded"}
                </p>
                <p className="mt-1 text-xs text-[var(--text-subtle)]">
                  {camera.find((entry) => entry.name === "Date taken")?.value ?? "No capture date"}
                </p>
              </div>
              <div className="border border-[var(--border)] bg-[var(--page-elevated)] p-3">
                <p className="eyebrow">Exposure</p>
                <dl className="mt-1 grid grid-cols-2 gap-2 text-xs">
                  {["Exposure time", "F-number", "ISO speed", "Focal length", "Exposure bias", "Flash"].map((name) => (
                    <div key={name}>
                      <dt className="text-[var(--text-subtle)]">{name}</dt>
                      <dd className="font-mono text-[var(--text)]">{entries.find((entry) => entry.name === name)?.value ?? "—"}</dd>
                    </div>
                  ))}
                </dl>
              </div>
              <CopyButton text={json} label="Copy as JSON" />
            </div>
          ) : null}

          {error ? <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p> : null}
        </div>

        <div>
          {entries.length > 0 ? (
            <SimpleTable
              head={["Tag", "Value"]}
              rows={entries.map((entry) => [entry.name, <span key={entry.tag} className="font-mono text-xs">{entry.value}</span>])}
              caption="All EXIF tags found"
            />
          ) : (
            <EmptyState
              title="No EXIF loaded"
              description="Choose a photo straight from a camera or phone for the richest metadata. Social platforms usually strip it."
            />
          )}
        </div>
      </div>
    </ToolPanel>
  );
}
