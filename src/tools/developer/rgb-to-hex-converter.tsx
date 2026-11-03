"use client";

import { useMemo, useState } from "react";
import { CopyButton, Field, ResultCard, TextInput, ToolPanel } from "@/components/ui";
import { hexToRgb, parseColour, rgbToHexValue, rgbToHslString } from "@/lib/css-gen";

const clamp = (value: string) => Math.max(0, Math.min(255, Number(value) || 0));

export default function RgbToHexConverter() {
  const [red, setRed] = useState("51");
  const [green, setGreen] = useState("102");
  const [blue, setBlue] = useState("204");
  const [alpha, setAlpha] = useState("1");
  const [paste, setPaste] = useState("");

  const rgb = { r: clamp(red), g: clamp(green), b: clamp(blue) };
  const alphaValue = Math.max(0, Math.min(1, Number(alpha) || 0));
  const hex = rgbToHexValue(rgb.r, rgb.g, rgb.b, alphaValue);
  const hsl = rgbToHslString(rgb.r, rgb.g, rgb.b);
  const css = alphaValue >= 1
    ? `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`
    : `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alphaValue})`;

  const parsed = useMemo(() => (paste.trim() ? parseColour(paste) : null), [paste]);

  function applyPasted() {
    const value = parseColour(paste.trim());
    if (!value) return;
    setRed(String(value.rgb.r));
    setGreen(String(value.rgb.g));
    setBlue(String(value.rgb.b));
    setAlpha(String(value.rgb.a ?? 1));
  }

  return (
    <ToolPanel>
      <div className="grid gap-5 lg:grid-cols-[1fr_14rem]">
        <div className="grid gap-4 sm:grid-cols-4">
          {[
            { id: "r", label: "Red", value: red, set: setRed, max: 255 },
            { id: "g", label: "Green", value: green, set: setGreen, max: 255 },
            { id: "b", label: "Blue", value: blue, set: setBlue, max: 255 },
            { id: "a", label: "Alpha", value: alpha, set: setAlpha, max: 1 },
          ].map((channel) => (
            <Field key={channel.id} label={channel.label} htmlFor={`rgb-${channel.id}`}>
              <TextInput
                id={`rgb-${channel.id}`}
                type="number"
                min={0}
                max={channel.max}
                step={channel.id === "a" ? 0.05 : 1}
                value={channel.value}
                onChange={(event) => channel.set(event.target.value)}
                className="font-mono"
              />
            </Field>
          ))}
          <div className="sm:col-span-4">
            <Field label="RGBA sliders" htmlFor="rgb-sliders">
              <div className="grid gap-2">
                {[
                  { id: "r", label: "R", value: rgb.r, set: setRed },
                  { id: "g", label: "G", value: rgb.g, set: setGreen },
                  { id: "b", label: "B", value: rgb.b, set: setBlue },
                ].map((channel) => (
                  <label key={channel.id} className="flex items-center gap-3">
                    <span className="w-4 font-mono text-[0.65rem] text-[var(--text-subtle)]">{channel.label}</span>
                    <input
                      type="range"
                      min={0}
                      max={255}
                      value={channel.value}
                      onChange={(event) => channel.set(event.target.value)}
                      className="w-full accent-[var(--ring)]"
                    />
                    <span className="w-8 text-right font-mono text-[0.7rem] text-[var(--text-subtle)]">{channel.value}</span>
                  </label>
                ))}
              </div>
            </Field>
          </div>
        </div>

        <div
          className="min-h-32 border border-[var(--border)]"
          style={{ background: css }}
          aria-label={`Colour preview ${css}`}
        />
      </div>

      <div className="mt-5">
        <ResultCard label="Hex value" value={hex.toUpperCase()} tone="brand" sub={css}>
          <div className="space-y-2">
            {[
              { label: "HEX", value: hex },
              { label: "HEX (6 digits)", value: hexToRgb(hex) ? rgbToHexValue(rgb.r, rgb.g, rgb.b) : hex },
              { label: "rgb()", value: css },
              { label: "hsl()", value: hsl },
            ].map((row) => (
              <div
                key={row.label}
                className="flex flex-wrap items-center justify-between gap-2 border border-[var(--border)] bg-[var(--surface)] px-3 py-2"
              >
                <span className="font-mono text-[0.6rem] uppercase tracking-[0.12em] text-[var(--text-subtle)]">
                  {row.label}
                </span>
                <code className="font-mono text-[0.85rem] text-[var(--text)]">{row.value}</code>
                <CopyButton text={row.value} size="sm" label="Copy" />
              </div>
            ))}
          </div>
        </ResultCard>
      </div>

      <div className="mt-5 grid gap-3 border-t border-[var(--border)] pt-4 sm:grid-cols-[1fr_auto] sm:items-end">
        <Field
          label="Or paste any colour"
          htmlFor="rgb-paste"
          hint="Accepts rgb(), hsl(), hex and common CSS colour names."
        >
          <TextInput
            id="rgb-paste"
            value={paste}
            onChange={(event) => setPaste(event.target.value)}
            placeholder="rgb(51 102 204) or rebeccapurple"
            className="font-mono"
            invalid={Boolean(paste.trim()) && !parsed}
          />
        </Field>
        <button type="button" className="btn btn-secondary" onClick={applyPasted} disabled={!parsed}>
          Load channels
        </button>
      </div>
    </ToolPanel>
  );
}
