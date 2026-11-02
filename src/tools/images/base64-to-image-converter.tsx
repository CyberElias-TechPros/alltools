"use client";

import { useMemo, useState } from "react";
import { CopyButton, DownloadButton, EmptyState, Field, TextArea, ToolPanel } from "@/components/ui";
import { downloadBlob, formatBytes } from "@/lib/utils";

function parseInput(raw: string): { mime: string; base64: string } | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const dataUrl = trimmed.match(/^data:(image\/[a-z+.-]+);base64,(.+)$/is);
  if (dataUrl) return { mime: dataUrl[1].toLowerCase(), base64: dataUrl[2].replace(/\s/g, "") };
  const bare = trimmed.replace(/\s/g, "");
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(bare)) return null;
  return { mime: "image/png", base64: bare };
}

function base64ToBlob(base64: string, mime: string): Blob {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return new Blob([bytes], { type: mime });
}

export default function Base64ToImageConverter() {
  const [input, setInput] = useState("");
  const parsed = useMemo(() => parseInput(input), [input]);

  const decoded = useMemo(() => {
    if (!parsed) return null;
    try {
      const blob = base64ToBlob(parsed.base64, parsed.mime);
      return { blob, url: URL.createObjectURL(blob) };
    } catch {
      return null;
    }
  }, [parsed]);

  return (
    <ToolPanel>
      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <label htmlFor="b64i-input" className="label">
            Base64 or data URL
          </label>
          <TextArea
            id="b64i-input"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="data:image/png;base64,iVBORw0KGgo…"
            className="min-h-52 font-mono text-[0.72rem]"
            spellCheck={false}
          />
          <p className="mt-2 text-xs text-[var(--text-subtle)]">
            Paste a full data URL or just the base64 body. Whitespace and line breaks are ignored.
          </p>
        </div>

        <div>
          {parsed && decoded ? (
            <>
              <div className="flex max-h-72 items-center justify-center overflow-hidden border border-[var(--border)] bg-[var(--surface-muted)] p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={decoded.url} alt="Decoded from base64" className="max-h-64 w-auto max-w-full object-contain" />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <DownloadButton
                  content=""
                  filename={`decoded.${parsed.mime.split("/")[1] === "jpeg" ? "jpg" : parsed.mime.split("/")[1]}`}
                  label="Download image"
                  onDownload={() => downloadBlob(decoded.blob, `decoded.${parsed.mime.split("/")[1] === "jpeg" ? "jpg" : parsed.mime.split("/")[1]}`)}
                />
                <CopyButton text={`${parsed.mime} · ${formatBytes(decoded.blob.size)}`} label="Copy details" />
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <dt className="eyebrow">Detected type</dt>
                  <dd className="font-mono text-xs text-[var(--text)]">{parsed.mime}</dd>
                </div>
                <div>
                  <dt className="eyebrow">Decoded size</dt>
                  <dd className="font-mono text-xs text-[var(--text)]">{formatBytes(decoded.blob.size)}</dd>
                </div>
                <div>
                  <dt className="eyebrow">Base64 length</dt>
                  <dd className="font-mono text-xs text-[var(--text)]">{parsed.base64.length.toLocaleString()}</dd>
                </div>
                <div>
                  <dt className="eyebrow">Encoding overhead</dt>
                  <dd className="font-mono text-xs text-[var(--text)]">
                    {Math.round((parsed.base64.length / Math.max(decoded.blob.size, 1) - 1) * 100)}%
                  </dd>
                </div>
              </dl>
            </>
          ) : (
            <EmptyState
              title="Nothing decoded yet"
              description="Paste a base64 image string and the preview will appear here, with a download button."
            />
          )}
        </div>
      </div>
    </ToolPanel>
  );
}
