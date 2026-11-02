"use client";

import { useMemo, useState } from "react";
import { CopyButton, Field, Switch, ToolPanel } from "@/components/ui";
import { buildShadowCss, buildShadowValue, type ShadowLayer } from "@/lib/css-gen";

const INITIAL: ShadowLayer[] = [
  { x: 0, y: 1, blur: 2, spread: 0, color: "rgba(20,20,15,0.16)", inset: false },
  { x: 0, y: 8, blur: 24, spread: -4, color: "rgba(20,20,15,0.18)", inset: false },
];

export default function BoxShadowGenerator() {
  const [layers, setLayers] = useState<ShadowLayer[]>(INITIAL);
  const [radius, setRadius] = useState(2);
  const [previewBackground, setPreviewBackground] = useState("#f6f4ee");

  const shadow = useMemo(() => buildShadowValue(layers), [layers]);
  const css = useMemo(() => {
    const rules = [buildShadowCss(layers), `border-radius: ${radius}px;`].filter(Boolean);
    return rules.join("\n");
  }, [layers, radius]);

  function update(index: number, patch: Partial<ShadowLayer>) {
    setLayers((current) => current.map((layer, position) => (position === index ? { ...layer, ...patch } : layer)));
  }

  return (
    <ToolPanel>
      <div
        className="flex h-64 items-center justify-center border border-[var(--border)] sm:h-72"
        style={{ background: previewBackground }}
      >
        <div
          className="grid h-28 w-48 place-items-center bg-white"
          style={{ boxShadow: shadow || "none", borderRadius: `${radius}px` }}
        >
          <span className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-[#6b6b60]">Preview</span>
        </div>
      </div>

      <div className="mt-5 space-y-5">
        {layers.map((layer, index) => (
          <fieldset key={index} className="border border-[var(--border)] p-3">
            <legend className="px-1 font-mono text-[0.6rem] uppercase tracking-[0.12em] text-[var(--text-subtle)]">
              Layer {index + 1}
            </legend>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { key: "x" as const, label: "X offset", min: -50, max: 50 },
                { key: "y" as const, label: "Y offset", min: -50, max: 50 },
                { key: "blur" as const, label: "Blur", min: 0, max: 100 },
                { key: "spread" as const, label: "Spread", min: -50, max: 50 },
              ].map((control) => (
                <Field key={control.key} label={control.label} htmlFor={`shadow-${index}-${control.key}`}>
                  <input
                    id={`shadow-${index}-${control.key}`}
                    type="number"
                    min={control.min}
                    max={control.max}
                    value={layer[control.key]}
                    onChange={(event) => update(index, { [control.key]: Number(event.target.value) } as Partial<ShadowLayer>)}
                    className="input font-mono text-[0.8rem]"
                  />
                </Field>
              ))}
              <Field label="Colour" htmlFor={`shadow-${index}-color`}>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={layer.color.startsWith("#") && layer.color.length === 7 ? layer.color : "#14140f"}
                    onChange={(event) => update(index, { color: event.target.value })}
                    aria-label={`Layer ${index + 1} colour picker`}
                    className="h-9 w-10 shrink-0 cursor-pointer border border-[var(--border)] bg-transparent"
                  />
                  <input
                    id={`shadow-${index}-color`}
                    value={layer.color}
                    onChange={(event) => update(index, { color: event.target.value })}
                    className="input font-mono text-[0.75rem]"
                    spellCheck={false}
                  />
                </div>
              </Field>
            </div>
            <div className="mt-2 flex items-center justify-between gap-3">
              <Switch
                checked={layer.inset}
                onChange={(next) => update(index, { inset: next })}
                label="Inset shadow"
              />
              <button
                type="button"
                className="btn btn-ghost !min-h-8 !px-2.5 !py-1.5 !text-[0.6rem] !tracking-[0.1em]"
                onClick={() => setLayers((current) => current.filter((_, position) => position !== index))}
                disabled={layers.length <= 1}
              >
                Remove layer
              </button>
            </div>
          </fieldset>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-end gap-3">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() =>
            setLayers((current) =>
              current.length >= 4
                ? current
                : [...current, { x: 0, y: 4, blur: 8, spread: 0, color: "rgba(20,20,15,0.2)", inset: false }],
            )
          }
          disabled={layers.length >= 4}
        >
          Add layer
        </button>
        <Field label="Corner radius (px)" htmlFor="shadow-radius">
          <input
            id="shadow-radius"
            type="number"
            min={0}
            max={64}
            value={radius}
            onChange={(event) => setRadius(Number(event.target.value))}
            className="input w-24 font-mono text-[0.8rem]"
          />
        </Field>
        <Field label="Preview background" htmlFor="shadow-bg">
          <input
            id="shadow-bg"
            type="color"
            value={previewBackground}
            onChange={(event) => setPreviewBackground(event.target.value)}
            className="h-9 w-16 cursor-pointer border border-[var(--border)] bg-transparent"
          />
        </Field>
      </div>

      <div className="mt-5 border border-[var(--border)] bg-[var(--page-elevated)] p-3">
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="font-mono text-[0.6rem] uppercase tracking-[0.12em] text-[var(--text-subtle)]">CSS</span>
          <CopyButton text={css} label="Copy CSS" />
        </div>
        <pre className="overflow-x-auto font-mono text-[0.8rem] leading-relaxed text-[var(--text)]">{css}</pre>
      </div>
    </ToolPanel>
  );
}
