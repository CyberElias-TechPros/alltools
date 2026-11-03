"use client";

import { useMemo, useState } from "react";
import { CopyButton, Field, TextInput, ToolPanel } from "@/components/ui";
import {
  contrastRatio,
  hslToRgb,
  parseColor,
  relativeLuminance,
  rgbToHex,
  rgbToHsl,
} from "@/lib/dev";
import { formatNumber } from "@/lib/utils";

const PRESETS = ["#4f46e5", "#0d9488", "#f59e0b", "#ef4444", "#0f172a", "#f8fafc"];

export default function ColorConverter() {
  const [value, setValue] = useState("#4f46e5");

  const data = useMemo(() => {
    const rgb = parseColor(value);
    if (!rgb) return null;
    const hsl = rgbToHsl(rgb);
    const white = { r: 255, g: 255, b: 255, a: 1 };
    const black = { r: 0, g: 0, b: 0, a: 1 };
    const luminance = relativeLuminance(rgb);
    return {
      rgb,
      hsl,
      hex: rgbToHex(rgb),
      cssRgb: `rgb(${rgb.r} ${rgb.g} ${rgb.b}${rgb.a < 1 ? ` / ${rgb.a}` : ""})`,
      cssHsl: `hsl(${hsl.h} ${hsl.s}% ${hsl.l}%${rgb.a < 1 ? ` / ${rgb.a}` : ""})`,
      onWhite: contrastRatio(rgb, white),
      onBlack: contrastRatio(rgb, black),
      luminance,
      shades: Array.from({ length: 9 }, (_, index) => {
        const lightness = 95 - index * 9;
        const shade = hslToRgb({ h: hsl.h, s: hsl.s, l: lightness });
        return { hex: rgbToHex(shade), lightness };
      }),
    };
  }, [value]);

  return (
    <ToolPanel>
      <div className="grid gap-3 sm:grid-cols-[1.2fr_1fr]">
        <Field label="Colour" htmlFor="color-input" hint="Accepts #hex, rgb() or hsl()">
          <div className="flex gap-2">
            <TextInput
              id="color-input"
              value={value}
              onChange={(event) => setValue(event.target.value)}
              className="font-mono"
              placeholder="#4f46e5"
              spellCheck={false}
            />
            <input
              type="color"
              aria-label="Pick a colour"
              value={data?.hex.slice(0, 7) ?? "#4f46e5"}
              onChange={(event) => setValue(event.target.value)}
              className="h-11 w-14 shrink-0 cursor-pointer rounded-lg border border-[var(--border-strong)] bg-[var(--surface)] p-1"
            />
          </div>
        </Field>
        <div>
          <span className="label">Presets</span>
          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                aria-label={`Use ${preset}`}
                onClick={() => setValue(preset)}
                className="size-8 rounded-lg border border-[var(--border-strong)]"
                style={{ backgroundColor: preset }}
              />
            ))}
          </div>
        </div>
      </div>

      {data ? (
        <>
          <div
            className="mt-4 flex h-24 items-center justify-center rounded-xl border border-[var(--border)]"
            style={{ backgroundColor: data.hex }}
          >
            <span
              className="rounded-md px-2 py-1 text-sm font-semibold"
              style={{
                color: data.luminance > 0.35 ? "#0b1020" : "#ffffff",
                backgroundColor: data.luminance > 0.35 ? "rgba(255,255,255,0.72)" : "rgba(0,0,0,0.28)",
              }}
            >
              {data.hex}
            </span>
          </div>

          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            {[
              { label: "HEX", value: data.hex },
              { label: "RGB", value: data.cssRgb },
              { label: "HSL", value: data.cssHsl },
            ].map((format) => (
              <div key={format.label} className="rounded-lg border border-[var(--border)] bg-[var(--code-bg)] p-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[0.68rem] font-bold uppercase tracking-[0.08em] text-[var(--text-subtle)]">
                    {format.label}
                  </span>
                  <CopyButton text={format.value} label="" />
                </div>
                <p className="mt-1 break-all font-mono text-[0.8rem] text-[var(--text)]">{format.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-[var(--border)] p-3">
              <h3 className="text-[0.68rem] font-bold uppercase tracking-[0.08em] text-[var(--text-subtle)]">
                WCAG contrast
              </h3>
              <ul className="mt-2 space-y-1.5 text-sm">
                {[
                  { label: "On white", ratio: data.onWhite },
                  { label: "On black", ratio: data.onBlack },
                ].map((entry) => (
                  <li key={entry.label} className="flex items-center justify-between gap-2">
                    <span className="text-[var(--text-muted)]">{entry.label}</span>
                    <span className="font-mono text-xs">
                      {formatNumber(entry.ratio, 2)}:1{" "}
                      <span className={entry.ratio >= 4.5 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}>
                        {entry.ratio >= 4.5 ? "AA" : entry.ratio >= 3 ? "AA large" : "fail"}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-[var(--border)] p-3">
              <h3 className="text-[0.68rem] font-bold uppercase tracking-[0.08em] text-[var(--text-subtle)]">
                Tints and shades
              </h3>
              <div className="mt-2 flex overflow-hidden rounded-md border border-[var(--border)]">
                {data.shades.map((shade) => (
                  <button
                    key={shade.hex}
                    type="button"
                    title={`${shade.hex} · L ${shade.lightness}%`}
                    onClick={() => setValue(shade.hex)}
                    className="h-8 flex-1"
                    style={{ backgroundColor: shade.hex }}
                    aria-label={`Use ${shade.hex}`}
                  />
                ))}
              </div>
              <p className="mt-1.5 text-[0.68rem] text-[var(--text-subtle)]">
                Lightness 95% → 23% · click a swatch to use it
              </p>
            </div>
          </div>
        </>
      ) : (
        <p className="mt-4 rounded-lg border border-amber-300/70 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100">
          That value is not a recognised colour. Try #4f46e5, rgb(79, 70, 229) or hsl(243, 75%, 59%).
        </p>
      )}
    </ToolPanel>
  );
}
