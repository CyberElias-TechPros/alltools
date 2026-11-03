"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import QRCode from "qrcode";
import { CopyButton, DownloadButton, Field, Select, TextArea, TextInput, ToolPanel } from "@/components/ui";
import { useToast } from "@/components/ui";

const ERRORS = ["L", "M", "Q", "H"] as const;

export default function QrCodeGenerator() {
  const [text, setText] = useState("https://example.com");
  const [size, setSize] = useState(320);
  const [margin, setMargin] = useState(2);
  const [level, setLevel] = useState<(typeof ERRORS)[number]>("M");
  const [dark, setDark] = useState("#14140f");
  const [light, setLight] = useState("#ffffff");
  const [error, setError] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const toast = useToast();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (!text.trim()) {
      const context = canvas.getContext("2d");
      context?.clearRect(0, 0, canvas.width, canvas.height);
      setError("");
      return;
    }
    let cancelled = false;
    QRCode.toCanvas(canvas, text, {
      width: size,
      margin,
      errorCorrectionLevel: level,
      color: { dark, light },
    })
      .then(() => {
        if (!cancelled) setError("");
      })
      .catch((reason: unknown) => {
        if (cancelled) return;
        setError(reason instanceof Error ? reason.message : "That content is too long for a QR code.");
      });
    return () => {
      cancelled = true;
    };
  }, [text, size, margin, level, dark, light]);

  const capacity = useMemo(() => {
    // Byte-mode capacity, rough and deliberately conservative.
    const table: Record<(typeof ERRORS)[number], number> = { L: 2953, M: 2331, Q: 1663, H: 1273 };
    return table[level];
  }, [level]);

  function download() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = "qr-code.png";
    link.click();
    toast("QR code downloaded as PNG");
  }

  return (
    <ToolPanel>
      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div>
          <Field
            label="Content to encode"
            htmlFor="qr-text"
            hint="A URL, plain text, Wi-Fi credentials, an email address — anything up to the capacity limit."
          >
            <TextArea
              id="qr-text"
              value={text}
              onChange={(event) => setText(event.target.value)}
              rows={5}
              className="font-mono text-[0.84rem]"
              placeholder="https://example.com"
            />
          </Field>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Size (pixels)" htmlFor="qr-size">
              <Select id="qr-size" value={String(size)} onChange={(event) => setSize(Number(event.target.value))}>
                {[160, 240, 320, 480, 640, 1024].map((option) => (
                  <option key={option} value={option}>
                    {option} × {option}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Error correction" htmlFor="qr-level" hint="Higher survives more damage but holds less data.">
              <Select
                id="qr-level"
                value={level}
                onChange={(event) => setLevel(event.target.value as (typeof ERRORS)[number])}
              >
                <option value="L">L — 7% recoverable</option>
                <option value="M">M — 15% recoverable</option>
                <option value="Q">Q — 25% recoverable</option>
                <option value="H">H — 30% recoverable</option>
              </Select>
            </Field>
            <Field label="Quiet zone (modules)" htmlFor="qr-margin" hint="Keep at least 2 so scanners can lock on.">
              <TextInput
                id="qr-margin"
                type="number"
                min={0}
                max={16}
                value={margin}
                onChange={(event) => setMargin(Math.max(0, Math.min(16, Number(event.target.value) || 0)))}
                className="font-mono"
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Dark" htmlFor="qr-dark">
                <input
                  id="qr-dark"
                  type="color"
                  value={dark}
                  onChange={(event) => setDark(event.target.value)}
                  className="h-9 w-full cursor-pointer border border-[var(--border)] bg-transparent"
                />
              </Field>
              <Field label="Light" htmlFor="qr-light">
                <input
                  id="qr-light"
                  type="color"
                  value={light}
                  onChange={(event) => setLight(event.target.value)}
                  className="h-9 w-full cursor-pointer border border-[var(--border)] bg-transparent"
                />
              </Field>
            </div>
          </div>

          <p className="mt-3 font-mono text-[0.6rem] uppercase tracking-[0.12em] text-[var(--text-subtle)]">
            {text.length.toLocaleString()} / ~{capacity.toLocaleString()} characters at level {level}
          </p>
        </div>

        <div>
          <div className="border border-[var(--border)] bg-[var(--page-elevated)] p-3">
            <canvas ref={canvasRef} className="mx-auto h-auto w-full max-w-[20rem]" aria-label="Generated QR code" />
          </div>
          {error ? (
            <p role="alert" className="mt-2 text-xs leading-relaxed text-[#8d2f22] dark:text-[#ff9a8a]">
              {error}
            </p>
          ) : (
            <p className="mt-2 text-xs leading-relaxed text-[var(--text-subtle)]">
              Rendered locally on a canvas — the content is never uploaded.
            </p>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            <DownloadButton filename="qr-code.png" content="" onDownload={download} label="Download PNG" />
            <CopyButton text={text} label="Copy content" />
          </div>
        </div>
      </div>
    </ToolPanel>
  );
}
