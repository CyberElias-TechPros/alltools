"use client";

import { useEffect, useRef, useState } from "react";
import { CopyButton, EmptyState, ToolPanel } from "@/components/ui";
import { rgbToHex, rgbToHsl } from "@/lib/dev";
import { loadImageFile } from "@/lib/image";

export default function ImageColorPicker() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [colours, setColours] = useState<Array<{ hex: string; rgb: string; hsl: string }>>([]);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File | undefined | null) {
    if (!file) return;
    setError(null);
    try {
      const loaded = await loadImageFile(file);
      const canvas = canvasRef.current;
      if (!canvas) return;
      const scale = Math.min(1, 900 / Math.max(loaded.width, loaded.height));
      canvas.width = Math.round(loaded.width * scale);
      canvas.height = Math.round(loaded.height * scale);
      const context = canvas.getContext("2d");
      context?.drawImage(loaded.image, 0, 0, canvas.width, canvas.height);
    } catch (thrown) {
      setError(thrown instanceof Error ? thrown.message : "That image could not be opened.");
    }
  }

  useEffect(() => {
    return () => {
      setColours([]);
    };
  }, []);

  return (
    <ToolPanel>
      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <label htmlFor="icp-file" className="btn btn-secondary inline-flex cursor-pointer">
            Choose an image
          </label>
          <input
            id="icp-file"
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(event) => void handleFile(event.target.files?.[0])}
          />
          <p className="mt-2 text-xs text-[var(--text-subtle)]">Click anywhere on the image to sample that pixel.</p>
          <canvas
            ref={canvasRef}
            onClick={(event) => {
              const canvas = canvasRef.current;
              if (!canvas) return;
              const rect = canvas.getBoundingClientRect();
              const x = Math.floor(((event.clientX - rect.left) / rect.width) * canvas.width);
              const y = Math.floor(((event.clientY - rect.top) / rect.height) * canvas.height);
              const data = canvas.getContext("2d")?.getImageData(x, y, 1, 1).data;
              if (!data) return;
              const rgb = { r: data[0], g: data[1], b: data[2], a: data[3] };
              const hsl = rgbToHsl(rgb);
              const swatch = {
                hex: rgbToHex(rgb),
                rgb: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
                hsl: `hsl(${Math.round(hsl.h)}, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%)`,
              };
              setColours((current) => [swatch, ...current].slice(0, 8));
            }}
            className="mt-3 max-h-[26rem] w-full cursor-crosshair border border-[var(--border)] bg-[var(--surface-muted)] object-contain"
          />
          {error ? <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p> : null}
        </div>

        <div>
          <p className="eyebrow mb-2">Sampled colours</p>
          {colours.length === 0 ? (
            <EmptyState title="No colours sampled" description="Load an image, then click a pixel to read its exact colour in hex, RGB and HSL." />
          ) : (
            <ul className="divide-y divide-[var(--border)] border border-[var(--border)]">
              {colours.map((colour, index) => (
                <li key={`${colour.hex}-${index}`} className="flex items-center gap-3 px-3 py-2">
                  <span className="size-8 shrink-0 border border-[var(--border-strong)]" style={{ background: colour.hex }} />
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-sm text-[var(--text)]">{colour.hex}</p>
                    <p className="truncate font-mono text-[0.68rem] text-[var(--text-subtle)]">
                      {colour.rgb} · {colour.hsl}
                    </p>
                  </div>
                  <CopyButton text={colour.hex} size="sm" label="Copy" />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </ToolPanel>
  );
}
