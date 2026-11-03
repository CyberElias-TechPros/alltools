"use client";

import { useState } from "react";
import { CopyButton, DownloadButton, EmptyState, Field, TextInput, ToolPanel } from "@/components/ui";
import { loadImageFile, canvasToBlob, drawToCanvas, type LoadedImage } from "@/lib/image";
import { buildIco, faviconHtml, type IcoSource } from "@/lib/ico";
import { downloadBlob, formatBytes } from "@/lib/utils";

const SIZES = [16, 32, 48, 64, 180, 192, 512];

export default function FaviconGenerator() {
  const [image, setImage] = useState<LoadedImage | null>(null);
  const [pad, setPad] = useState("10");
  const [background, setBackground] = useState("#ffffff");
  const [transparent, setTransparent] = useState(true);
  const [outputs, setOutputs] = useState<Array<{ size: number; blob: Blob; url: string }>>([]);
  const [ico, setIco] = useState<Blob | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate(loaded: LoadedImage, padding: number, transparentBackground: boolean, colour: string) {
    setBusy(true);
    setError(null);
    try {
      outputs.forEach((output) => URL.revokeObjectURL(output.url));
      const next: Array<{ size: number; blob: Blob; url: string }> = [];
      const icoSources: IcoSource[] = [];

      for (const size of SIZES) {
        const inner = Math.max(1, Math.round(size * (1 - (padding / 100) * 2)));
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const context = canvas.getContext("2d");
        if (!context) continue;
        if (!transparentBackground) {
          context.fillStyle = colour;
          context.fillRect(0, 0, size, size);
        }
        const scale = Math.min(inner / loaded.width, inner / loaded.height);
        const width = Math.round(loaded.width * scale);
        const height = Math.round(loaded.height * scale);
        context.imageSmoothingQuality = "high";
        context.drawImage(loaded.image, Math.round((size - width) / 2), Math.round((size - height) / 2), width, height);
        const blob = await canvasToBlob(canvas, "image/png");
        next.push({ size, blob, url: URL.createObjectURL(blob) });
        if ([16, 32, 48].includes(size)) {
          icoSources.push({ size, data: new Uint8Array(await blob.arrayBuffer()) });
        }
      }

      setOutputs(next);
      const icoBytes = buildIco(icoSources);
      const icoBuffer = new ArrayBuffer(icoBytes.byteLength);
      new Uint8Array(icoBuffer).set(icoBytes);
      setIco(new Blob([icoBuffer], { type: "image/x-icon" }));
    } catch (thrown) {
      setError(thrown instanceof Error ? thrown.message : "The favicon set could not be generated.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <ToolPanel>
      <div className="grid gap-4 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <label htmlFor="fav-file" className="btn btn-secondary inline-flex cursor-pointer">
            Choose a square image
          </label>
          <input
            id="fav-file"
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={async (event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              try {
                const loaded = await loadImageFile(file);
                setImage(loaded);
                await generate(loaded, Number(pad) || 0, transparent, background);
              } catch (thrown) {
                setError(thrown instanceof Error ? thrown.message : "That image could not be opened.");
              }
            }}
          />
          <p className="mt-2 text-xs leading-relaxed text-[var(--text-subtle)]">
            A logo on a square canvas works best. Favicons are rendered at 16 px in a browser tab, so fine
            detail disappears — bold shapes survive.
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Field label="Padding" htmlFor="fav-pad" hint="Percentage of the icon kept as margin">
              <TextInput
                id="fav-pad"
                type="number"
                min={0}
                max={40}
                step={1}
                value={pad}
                onChange={(event) => {
                  const next = event.target.value;
                  setPad(next);
                  if (image) void generate(image, Number(next) || 0, transparent, background);
                }}
              />
            </Field>
            <Field label="Background" htmlFor="fav-bg" hint="Used when transparency is off">
              <TextInput
                id="fav-bg"
                type="color"
                value={background}
                onChange={(event) => {
                  const next = event.target.value;
                  setBackground(next);
                  if (image) void generate(image, Number(pad) || 0, transparent, next);
                }}
              />
            </Field>
            <label className="flex items-center gap-2 text-sm text-[var(--text)]">
              <input
                type="checkbox"
                checked={transparent}
                onChange={(event) => {
                  const next = event.target.checked;
                  setTransparent(next);
                  if (image) void generate(image, Number(pad) || 0, next, background);
                }}
              />
              Keep transparency
            </label>
          </div>

          {error ? <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p> : null}

          {image ? (
            <div className="mt-4 flex items-end gap-4 border border-[var(--border)] bg-[var(--page-elevated)] p-4">
              {[16, 32, 48].map((size) => (
                <div key={size} className="text-center">
                  {outputs.find((output) => output.size === size) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={outputs.find((output) => output.size === size)?.url}
                      alt={`${size} pixel icon`}
                      width={size}
                      height={size}
                      className="border border-[var(--border)]"
                      style={{ width: size * 2, height: size * 2, imageRendering: "pixelated" }}
                    />
                  ) : null}
                  <p className="mt-1 font-mono text-[0.6rem] text-[var(--text-subtle)]">{size}px</p>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div>
          {outputs.length > 0 ? (
            <>
              <div className="flex flex-wrap gap-2">
                <DownloadButton content="" filename="favicon.ico" label="favicon.ico" onDownload={() => ico && downloadBlob(ico, "favicon.ico")} />
                <CopyButton text={faviconHtml()} label="Copy HTML" />
              </div>
              <ul className="mt-3 divide-y divide-[var(--border)] border border-[var(--border)]">
                {outputs.map((output) => (
                  <li key={output.size} className="flex items-center justify-between gap-3 px-3 py-2">
                    <span className="font-mono text-xs text-[var(--text)]">
                      {output.size}×{output.size} · {formatBytes(output.blob.size)}
                    </span>
                    <button
                      type="button"
                      onClick={() => downloadBlob(output.blob, output.size === 180 ? "apple-touch-icon.png" : `favicon-${output.size}x${output.size}.png`)}
                      className="font-mono text-[0.64rem] uppercase tracking-[0.1em] text-[var(--accent-text)] underline-offset-4 hover:underline"
                    >
                      Download
                    </button>
                  </li>
                ))}
                <li className="flex items-center justify-between gap-3 px-3 py-2">
                  <span className="font-mono text-xs text-[var(--text)]">favicon.ico (16, 32, 48)</span>
                  <button
                    type="button"
                    onClick={() => ico && downloadBlob(ico, "favicon.ico")}
                    className="font-mono text-[0.64rem] uppercase tracking-[0.1em] text-[var(--accent-text)] underline-offset-4 hover:underline"
                  >
                    Download
                  </button>
                </li>
              </ul>
              <pre className="mt-3 overflow-x-auto border border-[var(--border)] bg-[var(--code-bg)] p-3 font-mono text-[0.66rem] leading-relaxed text-[var(--text-muted)]">
                {faviconHtml()}
              </pre>
              <p className="mt-3 text-xs leading-relaxed text-[var(--text-subtle)]">
                Put the files in your site root. The .ico covers older browsers and Windows shortcuts; the
                PNGs cover modern tabs, bookmarks and Android; the 180 px file is the iOS home-screen icon.
                {busy ? " Regenerating…" : ""}
              </p>
            </>
          ) : (
            <EmptyState title="No icons yet" description="Choose an image to generate a full favicon set, including a multi-resolution .ico." />
          )}
        </div>
      </div>
    </ToolPanel>
  );
}
