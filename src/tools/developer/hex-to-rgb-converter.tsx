"use client";

import { useMemo, useState } from "react";
import { CopyButton, EmptyState, Field, ResultCard, StatGrid, TextInput, ToolPanel } from "@/components/ui";
import { contrastRatio } from "@/lib/dev";
import { parseColour } from "@/lib/css-gen";

export default function HexToRgbConverter() {
  const [hex, setHex] = useState("#3366cc");
  const colour = useMemo(() => parseColour(hex), [hex]);
  const onWhite = colour ? contrastRatio(colour.rgb, { r: 255, g: 255, b: 255, a: 1 }) : null;
  const onBlack = colour ? contrastRatio(colour.rgb, { r: 0, g: 0, b: 0, a: 1 }) : null;

  return (
    <ToolPanel>
      <div className="grid gap-5 lg:grid-cols-[1fr_16rem]">
        <div>
          <Field label="HEX colour" htmlFor="hex-input" hint="3, 4, 6 or 8 digits, with or without the #.">
            <TextInput
              id="hex-input"
              value={hex}
              onChange={(event) => setHex(event.target.value)}
              placeholder="#3366cc"
              spellCheck={false}
              className="font-mono text-[0.9rem]"
              invalid={!colour && hex.trim().length > 0}
            />
          </Field>

          <div className="mt-4 flex flex-wrap gap-2">
            {["#ff4b00", "#14140f", "#f6f4ee", "#0ea5e9", "#16a34a", "#7c3aed"].map((swatch) => (
              <button
                key={swatch}
                type="button"
                onClick={() => setHex(swatch)}
                aria-label={`Use ${swatch}`}
                className="size-8 border border-[var(--border-strong)]"
                style={{ background: swatch }}
              />
            ))}
          </div>
        </div>

        <div
          className="flex min-h-32 items-end justify-between border border-[var(--border)] p-3"
          style={{ background: colour ? colour.rgbString : "transparent" }}
        >
          <span className="font-mono text-[0.6rem] uppercase tracking-[0.12em] text-white mix-blend-difference">
            {colour ? colour.hex : "Preview"}
          </span>
        </div>
      </div>

      <div className="mt-5">
        {!colour ? (
          <EmptyState title="Not a colour yet">
            Enter a hex value such as <span className="font-mono">#3366cc</span> or <span className="font-mono">abc</span>.
          </EmptyState>
        ) : (
          <ResultCard
            label="Conversions"
            value={colour.hex.toUpperCase()}
            tone="brand"
            sub="Same colour in every common CSS notation."
          >
            <div className="space-y-2">
              {[
                { label: "rgb()", value: colour.rgbString },
                { label: "hsl()", value: colour.hslString },
                { label: "HEX", value: colour.hex },
                { label: "HEX with alpha", value: colour.hex8 },
                {
                  label: "R, G, B channels",
                  value: `${colour.rgb.r}, ${colour.rgb.g}, ${colour.rgb.b}`,
                },
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

            <StatGrid
              columns={3}
              items={[
                { label: "On white", value: `${onWhite?.toFixed(2)}:1`, hint: "WCAG AA needs 4.5:1 for body text" },
                { label: "On black", value: `${onBlack?.toFixed(2)}:1` },
                { label: "Hue", value: `${Math.round(colour.hsl.h)}°` },
              ]}
            />
          </ResultCard>
        )}
      </div>
    </ToolPanel>
  );
}
