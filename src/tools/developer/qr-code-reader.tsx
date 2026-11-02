"use client";

import { useRef, useState } from "react";
import jsQR from "jsqr";
import { Upload } from "lucide-react";
import { Button, Callout, CopyButton, EmptyState, ResultCard, ToolPanel } from "@/components/ui";

interface Decoded {
  text: string;
  version: number;
  name: string;
  width: number;
  height: number;
}

export default function QrCodeReader() {
  const [decoded, setDecoded] = useState<Decoded | null>(null);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState("");
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setError("Choose an image file — PNG, JPG, WebP or GIF.");
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setError("That image is larger than 20 MB. Try a smaller screenshot.");
      return;
    }

    setBusy(true);
    setError("");
    setDecoded(null);
    const url = URL.createObjectURL(file);
    setPreview(url);

    try {
      const bitmap = await createImageBitmap(file);
      const canvas = document.createElement("canvas");
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      if (!context) throw new Error("Canvas is unavailable in this browser.");
      context.drawImage(bitmap, 0, 0);
      const image = context.getImageData(0, 0, canvas.width, canvas.height);
      const result = jsQR(image.data, image.width, image.height, { inversionAttempts: "attemptBoth" });
      if (!result) {
        setError(
          "No QR code found. Make sure the whole code is visible, in focus, and has a light border around it.",
        );
      } else {
        setDecoded({
          text: result.data,
          version: result.version,
          name: result.chunks[0]?.type ?? "unknown",
          width: canvas.width,
          height: canvas.height,
        });
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not read that image.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <ToolPanel>
      <div
        className="border border-dashed border-[var(--border-strong)] bg-[var(--surface)] p-8 text-center"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          const file = event.dataTransfer.files?.[0];
          if (file) void handleFile(file);
        }}
      >
        <Upload className="mx-auto size-6 text-[var(--text-subtle)]" aria-hidden />
        <p className="mt-3 text-sm font-medium text-[var(--text)]">Drop a QR code image, or choose a file</p>
        <p className="mt-1 text-xs text-[var(--text-subtle)]">PNG, JPG, WebP or GIF up to 20 MB. Nothing is uploaded.</p>
        <div className="mt-4 flex justify-center">
          <Button variant="primary" onClick={() => inputRef.current?.click()} disabled={busy}>
            {busy ? "Reading…" : "Choose image"}
          </Button>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void handleFile(file);
            event.target.value = "";
          }}
        />
      </div>

      {error ? (
        <div className="mt-4">
          <Callout tone="warning">{error}</Callout>
        </div>
      ) : null}

      <div className="mt-5 grid gap-5 lg:grid-cols-[16rem_1fr]">
        <div>
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview}
              alt="Uploaded QR code"
              className="w-full border border-[var(--border)] bg-[var(--page-elevated)] object-contain"
            />
          ) : (
            <EmptyState title="No image yet">Your QR code will appear here.</EmptyState>
          )}
        </div>
        <div>
          {decoded ? (
            <ResultCard
              label="Decoded content"
              value={`${decoded.text.length.toLocaleString()} characters`}
              tone="brand"
              sub={`QR version ${decoded.version} · ${decoded.width} × ${decoded.height} px · ${decoded.name} mode`}
            >
              <pre className="max-h-72 overflow-auto whitespace-pre-wrap break-words border border-[var(--border)] bg-[var(--surface)] p-3 font-mono text-[0.82rem] leading-relaxed text-[var(--text)]">
                {decoded.text}
              </pre>
              <div className="mt-3 flex flex-wrap gap-2">
                <CopyButton text={decoded.text} label="Copy content" />
                {/^https?:\/\//i.test(decoded.text) ? (
                  <a
                    href={decoded.text}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="btn btn-secondary"
                  >
                    Open link
                  </a>
                ) : null}
              </div>
              <p className="mt-3 text-xs leading-relaxed text-[var(--text-subtle)]">
                Decoding runs in this tab with jsQR. A QR code is just data — treat unexpected links with the same
                caution you would apply to an emailed link.
              </p>
            </ResultCard>
          ) : (
            <EmptyState title="Nothing decoded yet">
              Load a screenshot or photo of a QR code to read its contents.
            </EmptyState>
          )}
        </div>
      </div>
    </ToolPanel>
  );
}
