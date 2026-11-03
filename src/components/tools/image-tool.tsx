"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Image as ImageIcon, Upload, X } from "lucide-react";
import {
  Button,
  CopyButton,
  DownloadButton,
  EmptyState,
  ResultCard,
  SimpleTable,
  StatGrid,
  ToolPanel,
} from "@/components/ui";
import { loadImageFile, type LoadedImage } from "@/lib/image";
import { downloadBlob, formatBytes } from "@/lib/utils";

export interface ImageResult {
  blob?: Blob;
  filename?: string;
  /** Preview URL — defaults to a URL created from the blob. */
  previewUrl?: string;
  stats?: Array<{ label: string; value: ReactNode; hint?: string }>;
  /** Copyable text result (base64, HTML snippet, colour list…). */
  text?: string;
  textLabel?: string;
  table?: { head: string[]; rows: ReactNode[][]; caption?: string };
  note?: ReactNode;
  error?: string;
}

/**
 * Shared workbench for the image tools.
 *
 * Handles file selection (click or drag), decoding, re-running when settings
 * change, preview, size reporting and download. Every tool supplies its own
 * settings panel and a `run` function that draws to a canvas — no image data
 * is uploaded anywhere.
 */
export function ImageTool({
  id,
  accept = "image/*",
  settings,
  run,
  runKey = "",
  autoRun = true,
  emptyHint,
}: {
  id: string;
  accept?: string;
  settings: (state: { image: LoadedImage | null }) => ReactNode;
  run: (image: LoadedImage) => Promise<ImageResult> | ImageResult;
  runKey?: string;
  autoRun?: boolean;
  emptyHint?: ReactNode;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const runRef = useRef(run);
  runRef.current = run;

  const [image, setImage] = useState<LoadedImage | null>(null);
  const [result, setResult] = useState<ImageResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const execute = useCallback(async (source: LoadedImage) => {
    setBusy(true);
    setError(null);
    try {
      const next = await runRef.current(source);
      setResult(next);
      if (next.error) setError(next.error);
    } catch (thrown) {
      setError(thrown instanceof Error ? thrown.message : "The image could not be processed.");
      setResult(null);
    } finally {
      setBusy(false);
    }
  }, []);

  async function acceptFile(file: File | undefined | null) {
    if (!file) return;
    setResult(null);
    setError(null);
    try {
      const loaded = await loadImageFile(file);
      setImage(loaded);
      await execute(loaded);
    } catch (thrown) {
      setError(thrown instanceof Error ? thrown.message : "That file could not be opened.");
      setImage(null);
    }
  }

  useEffect(() => {
    if (!image || !autoRun) return;
    void execute(image);
    // runKey carries the tool's settings; identity of `run` changes each render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [image, runKey, autoRun]);

  useEffect(() => {
    if (!result?.blob) {
      setPreviewUrl(result?.previewUrl ?? null);
      return;
    }
    const url = URL.createObjectURL(result.blob);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [result]);

  const sizeDelta =
    image && result?.blob ? Math.round(((result.blob.size - image.file.size) / image.file.size) * 1000) / 10 : null;

  return (
    <ToolPanel>
      <div className="grid gap-5 lg:grid-cols-[1fr_1.05fr]">
        <div>
          {!image ? (
            <div
              onDragOver={(event) => {
                event.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(event) => {
                event.preventDefault();
                setDragging(false);
                void acceptFile(event.dataTransfer.files?.[0]);
              }}
              className={`flex min-h-56 flex-col items-center justify-center gap-3 border border-dashed px-6 py-10 text-center transition-colors ${
                dragging ? "border-[var(--ring)] bg-[var(--surface-muted)]" : "border-[var(--border-strong)]"
              }`}
            >
              <ImageIcon className="size-8 text-[var(--text-subtle)]" aria-hidden />
              <p className="text-sm font-medium text-[var(--text)]">Drop an image here</p>
              <p className="max-w-xs text-xs leading-relaxed text-[var(--text-muted)]">
                {emptyHint ?? "PNG, JPEG, WebP, GIF or SVG. The file is read in your browser and never uploaded."}
              </p>
              <Button variant="primary" size="sm" onClick={() => inputRef.current?.click()}>
                <Upload className="size-4" aria-hidden />
                Choose a file
              </Button>
            </div>
          ) : (
            <div className="border border-[var(--border)] bg-[var(--page-elevated)] p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-mono text-xs text-[var(--text)]">{image.file.name}</p>
                  <p className="mt-0.5 text-xs text-[var(--text-subtle)]">
                    {image.width} × {image.height} px · {formatBytes(image.file.size)} · {image.type.replace("image/", "").toUpperCase()}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setImage(null);
                    setResult(null);
                    setError(null);
                    if (inputRef.current) inputRef.current.value = "";
                  }}
                  className="shrink-0 border border-[var(--border)] p-1 text-[var(--text-muted)] hover:text-[var(--text)]"
                  aria-label="Remove image"
                >
                  <X className="size-4" aria-hidden />
                </button>
              </div>
              <div className="mt-3 flex max-h-72 items-center justify-center overflow-hidden bg-[var(--surface-muted)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.image.src}
                  alt="Original"
                  className="max-h-72 w-auto max-w-full object-contain"
                />
              </div>
            </div>
          )}

          <input
            ref={inputRef}
            id={`${id}-file`}
            type="file"
            accept={accept}
            className="sr-only"
            onChange={(event) => void acceptFile(event.target.files?.[0])}
          />
          <label htmlFor={`${id}-file`} className="sr-only">
            Upload an image
          </label>

          {image ? <div className="mt-4">{settings({ image })}</div> : null}

          {!autoRun ? (
            <div className="mt-3">
              <Button variant="primary" disabled={!image || busy} onClick={() => image && void execute(image)}>
                {busy ? "Working…" : "Apply"}
              </Button>
            </div>
          ) : null}

          {error ? (
            <p role="alert" className="mt-3 border-l-2 border-red-500 pl-3 text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          ) : null}
        </div>

        <div>
          {image && result && !result.error ? (
            <>
              <div className="border border-[var(--border)] bg-[var(--page-elevated)] p-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="eyebrow">Result</span>
                  {busy ? <span className="text-xs text-[var(--text-subtle)]">working…</span> : null}
                </div>
                <div className="mt-2 flex max-h-80 items-center justify-center overflow-hidden bg-[var(--surface-muted)]">
                  {previewUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={previewUrl} alt="Processed result" className="max-h-80 w-auto max-w-full object-contain" />
                  ) : (
                    <div className="p-8 text-center text-xs text-[var(--text-subtle)]">No visual preview for this output.</div>
                  )}
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {result.blob ? (
                  <>
                    <DownloadButton
                      content=""
                      filename={result.filename ?? `result-${id}.png`}
                      label="Download"
                      onDownload={() => result.blob && downloadBlob(result.blob, result.filename ?? `result-${id}.png`)}
                    />
                    <CopyButton text={result.text ?? `${image.file.name} → ${formatBytes(result.blob.size)}`} label={result.text ? (result.textLabel ?? "Copy result") : "Copy summary"} />
                  </>
                ) : result.text ? (
                  <CopyButton text={result.text} label={result.textLabel ?? "Copy result"} />
                ) : null}
              </div>

              <div className="mt-3">
                <ResultCard
                  label="Output size"
                  value={result.blob ? formatBytes(result.blob.size) : "—"}
                  tone="neutral"
                  sub={
                    sizeDelta === null
                      ? undefined
                      : `${sizeDelta > 0 ? "+" : ""}${sizeDelta}% compared with the ${formatBytes(image.file.size)} original`
                  }
                >
                  {result.stats && result.stats.length > 0 ? (
                    <StatGrid columns={Math.min(result.stats.length, 4) as 2 | 3 | 4} items={result.stats} />
                  ) : null}
                </ResultCard>
              </div>

              {result.text ? (
                <div className="mt-3">
                  <textarea
                    readOnly
                    value={result.text}
                    aria-label={result.textLabel ?? "Text result"}
                    className="input min-h-28 font-mono text-[0.75rem]"
                  />
                </div>
              ) : null}

              {result.table ? (
                <div className="mt-3">
                  <SimpleTable head={result.table.head} rows={result.table.rows} caption={result.table.caption} />
                </div>
              ) : null}

              {result.note ? (
                <p className="mt-3 text-xs leading-relaxed text-[var(--text-subtle)]">{result.note}</p>
              ) : null}
            </>
          ) : !image ? (
            <EmptyState
              icon={<ImageIcon className="size-6" aria-hidden />}
              title="No image yet"
              description="Choose a file to see the result. Everything is processed on this device."
            />
          ) : busy ? (
            <ResultCard label="Working" value="…" tone="neutral" sub="Processing the image in your browser." />
          ) : null}
        </div>
      </div>
    </ToolPanel>
  );
}
