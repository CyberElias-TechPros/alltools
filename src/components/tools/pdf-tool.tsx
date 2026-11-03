"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { FileText, X } from "lucide-react";
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
import { readPdfFile, type LoadedPdf } from "@/lib/pdf";
import { downloadBlob, formatBytes } from "@/lib/utils";

export interface PdfResult {
  blob?: Blob;
  filename?: string;
  files?: Array<{ name: string; blob: Blob }>;
  stats?: Array<{ label: string; value: ReactNode; hint?: string }>;
  table?: { head: string[]; rows: ReactNode[][]; caption?: string };
  text?: string;
  textLabel?: string;
  note?: ReactNode;
  error?: string;
}

export interface PdfRunContext {
  files: File[];
  first: LoadedPdf | null;
  pages: number;
}

/**
 * Shared workbench for document tools.
 *
 * Handles selecting one or more PDFs, reporting page counts, re-running when
 * options change, and presenting downloads. All parsing and writing happens in
 * the browser through pdf-lib; nothing is uploaded.
 */
export function PdfTool({
  id,
  multiple = false,
  accept = "application/pdf",
  settings,
  run,
  runKey = "",
  autoRun = true,
  emptyHint,
}: {
  id: string;
  multiple?: boolean;
  accept?: string;
  settings: (context: PdfRunContext) => ReactNode;
  run: (context: PdfRunContext) => Promise<PdfResult>;
  runKey?: string;
  autoRun?: boolean;
  emptyHint?: ReactNode;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const runRef = useRef(run);
  runRef.current = run;

  const [files, setFiles] = useState<File[]>([]);
  const [first, setFirst] = useState<LoadedPdf | null>(null);
  const [result, setResult] = useState<PdfResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const current: PdfRunContext = { files, first, pages: first?.pages ?? 0 };

  async function acceptFiles(list: FileList | null) {
    if (!list || list.length === 0) return;
    const incoming = Array.from(list);
    const next = multiple ? [...files, ...incoming] : incoming.slice(0, 1);
    setFiles(next);
    setResult(null);
    setError(null);
    try {
      const loaded = await readPdfFile(next[0]);
      setFirst(loaded);
    } catch (thrown) {
      setFirst(null);
      setError(
        thrown instanceof Error
          ? `That file could not be read as a PDF: ${thrown.message}`
          : "That file could not be read as a PDF.",
      );
    }
  }

  const execute = useCallback(async (context: PdfRunContext) => {
    setBusy(true);
    setError(null);
    try {
      const next = await runRef.current(context);
      setResult(next);
      if (next.error) setError(next.error);
    } catch (thrown) {
      const message = thrown instanceof Error ? thrown.message : "The document could not be processed.";
      setError(message.includes("encrypted") ? "This PDF is password protected. Remove the password first, then try again." : message);
      setResult(null);
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    if (!first || !autoRun) return;
    void execute({ files, first, pages: first.pages });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [first, runKey, autoRun]);

  useEffect(() => {
    if (!result?.blob) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(result.blob);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [result]);

  return (
    <ToolPanel>
      <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
        <div>
          <div
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDragging(false);
              void acceptFiles(event.dataTransfer.files);
            }}
            className={`flex flex-col items-center justify-center gap-2 border border-dashed px-5 py-8 text-center transition-colors ${
              dragging ? "border-[var(--ring)] bg-[var(--surface-muted)]" : "border-[var(--border-strong)]"
            }`}
          >
            <FileText className="size-7 text-[var(--text-subtle)]" aria-hidden />
            <p className="text-sm font-medium text-[var(--text)]">
              {multiple ? "Drop PDFs here, in order" : "Drop a PDF here"}
            </p>
            <p className="max-w-xs text-xs leading-relaxed text-[var(--text-muted)]">
              {emptyHint ?? "Files are read on this device and never uploaded."}
            </p>
            <Button variant="primary" size="sm" onClick={() => inputRef.current?.click()}>
              Choose {multiple ? "files" : "a file"}
            </Button>
          </div>
          <input
            ref={inputRef}
            id={`${id}-file`}
            type="file"
            accept={accept}
            multiple={multiple}
            className="sr-only"
            onChange={(event) => void acceptFiles(event.target.files)}
          />
          <label htmlFor={`${id}-file`} className="sr-only">
            Choose a file
          </label>

          {files.length > 0 ? (
            <ul className="mt-3 divide-y divide-[var(--border)] border border-[var(--border)]">
              {files.map((file, index) => (
                <li key={`${file.name}-${index}`} className="flex items-center justify-between gap-3 px-3 py-2">
                  <span className="min-w-0 truncate font-mono text-xs text-[var(--text)]">
                    {index + 1}. {file.name}
                  </span>
                  <span className="shrink-0 font-mono text-[0.64rem] text-[var(--text-subtle)]">
                    {formatBytes(file.size)}
                  </span>
                  <button
                    type="button"
                    aria-label={`Remove ${file.name}`}
                    onClick={() => {
                      const next = files.filter((_, position) => position !== index);
                      setFiles(next);
                      setFirst(null);
                      setResult(null);
                      if (next[0]) void readPdfFile(next[0]).then(setFirst).catch(() => setFirst(null));
                      if (inputRef.current) inputRef.current.value = "";
                    }}
                    className="shrink-0 border border-[var(--border)] p-1 text-[var(--text-muted)] hover:text-[var(--text)]"
                  >
                    <X className="size-3.5" aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
          ) : null}

          {first ? (
            <p className="mt-2 text-xs text-[var(--text-subtle)]">
              {first.pages} page{first.pages === 1 ? "" : "s"} in the first document.
            </p>
          ) : null}

          {files.length > 0 ? <div className="mt-4">{settings(current)}</div> : null}

          {!autoRun ? (
            <div className="mt-3">
              <Button
                variant="primary"
                disabled={!first || busy}
                onClick={() => void execute(current)}
              >
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
          {result && !result.error ? (
            <>
              <ResultCard
                label="Output"
                value={result.blob ? formatBytes(result.blob.size) : `${result.files?.length ?? 0} file(s)`}
                tone="neutral"
                sub={result.filename ?? (result.files ? "Ready to download each part." : undefined)}
                actions={
                  result.blob ? (
                    <DownloadButton
                      content=""
                      filename={result.filename ?? "document.pdf"}
                      label="Download"
                      onDownload={() => result.blob && downloadBlob(result.blob, result.filename ?? "document.pdf")}
                    />
                  ) : undefined
                }
              >
                {result.stats && result.stats.length > 0 ? (
                  <StatGrid columns={Math.min(result.stats.length, 4) as 2 | 3 | 4} items={result.stats} />
                ) : null}
              </ResultCard>

              {previewUrl ? (
                <div className="mt-3 border border-[var(--border)]">
                  <iframe title="PDF preview" src={previewUrl} className="h-64 w-full bg-[var(--surface-muted)]" />
                </div>
              ) : null}

              {result.files && result.files.length > 0 ? (
                <ul className="mt-3 divide-y divide-[var(--border)] border border-[var(--border)]">
                  {result.files.map((file) => (
                    <li key={file.name} className="flex items-center justify-between gap-3 px-3 py-2">
                      <span className="truncate font-mono text-xs text-[var(--text)]">{file.name}</span>
                      <span className="flex shrink-0 items-center gap-2">
                        <span className="font-mono text-[0.62rem] text-[var(--text-subtle)]">{formatBytes(file.blob.size)}</span>
                        <button
                          type="button"
                          onClick={() => downloadBlob(file.blob, file.name)}
                          className="font-mono text-[0.62rem] uppercase tracking-[0.1em] text-[var(--accent-text)] underline-offset-4 hover:underline"
                        >
                          Save
                        </button>
                      </span>
                    </li>
                  ))}
                </ul>
              ) : null}

              {result.table ? (
                <div className="mt-3">
                  <SimpleTable head={result.table.head} rows={result.table.rows} caption={result.table.caption} />
                </div>
              ) : null}

              {result.text ? (
                <div className="mt-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="label !mb-0">{result.textLabel ?? "Extracted text"}</span>
                    <CopyButton text={result.text} size="sm" />
                  </div>
                  <textarea readOnly value={result.text} aria-label={result.textLabel ?? "Extracted text"} className="input min-h-40 font-mono text-[0.75rem]" />
                </div>
              ) : null}

              {result.note ? <p className="mt-3 text-xs leading-relaxed text-[var(--text-subtle)]">{result.note}</p> : null}
            </>
          ) : files.length === 0 ? (
            <EmptyState
              icon={<FileText className="size-6" aria-hidden />}
              title="No document yet"
              description="Add a PDF to see the result. The file never leaves this device."
            />
          ) : busy ? (
            <ResultCard label="Working" value="…" tone="neutral" sub="Processing the document in your browser." />
          ) : null}
        </div>
      </div>
    </ToolPanel>
  );
}
