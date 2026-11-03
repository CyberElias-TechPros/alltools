"use client";

import { useMemo, useState } from "react";
import { CopyButton, Field, Segmented, Switch, ToolPanel } from "@/components/ui";
import { buildGradientCss, buildGradientValue, type GradientStop, type GradientType } from "@/lib/css-gen";

const PRESETS: Array<{ label: string; angle: number; stops: GradientStop[] }> = [
  { label: "Sunset", angle: 135, stops: [{ color: "#ff4b00", position: 0 }, { color: "#ffb347", position: 100 }] },
  { label: "Deep sea", angle: 160, stops: [{ color: "#0f2027", position: 0 }, { color: "#2c5364", position: 100 }] },
  {
    label: "Candy",
    angle: 120,
    stops: [
      { color: "#f6d365", position: 0 },
      { color: "#fda085", position: 50 },
      { color: "#a18cd1", position: 100 },
    ],
  },
];

export default function CssGradientGenerator() {
  const [type, setType] = useState<GradientType>("linear");
  const [angle, setAngle] = useState(135);
  const [stops, setStops] = useState<GradientStop[]>(PRESETS[0].stops);
  const [repeating, setRepeating] = useState(false);

  const value = useMemo(
    () => buildGradientValue({ type, angle, stops, repeating, centreX: 50, centreY: 50 }),
    [type, angle, stops, repeating],
  );
  const css = useMemo(() => buildGradientCss({ type, angle, stops, repeating }), [type, angle, stops, repeating]);

  function updateStop(index: number, patch: Partial<GradientStop>) {
    setStops((current) => current.map((stop, position) => (position === index ? { ...stop, ...patch } : stop)));
  }

  return (
    <ToolPanel>
      <div
        className="h-56 w-full border border-[var(--border)] sm:h-72"
        style={{ backgroundImage: value || undefined }}
        role="img"
        aria-label="Gradient preview"
      />

      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_1fr]">
        <div className="space-y-4">
          <Segmented
            label="Gradient type"
            value={type}
            onChange={(next) => setType(next)}
            options={[
              { value: "linear", label: "Linear" },
              { value: "radial", label: "Radial" },
              { value: "conic", label: "Conic" },
            ]}
          />

          <Field
            label={type === "linear" ? `Angle — ${angle}°` : `Rotation — ${angle}°`}
            htmlFor="gradient-angle"
            hint="0° points up, 90° points right."
          >
            <input
              id="gradient-angle"
              type="range"
              min={0}
              max={360}
              value={angle}
              onChange={(event) => setAngle(Number(event.target.value))}
              className="w-full accent-[var(--ring)]"
            />
          </Field>

          <Switch
            checked={repeating}
            onChange={setRepeating}
            label="Repeat the gradient"
            description="Tiles the pattern instead of stretching it."
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="label !mb-0">Colour stops</span>
            <div className="flex gap-1">
              <button
                type="button"
                className="btn btn-ghost !min-h-8 !px-2.5 !py-1.5 !text-[0.6rem] !tracking-[0.1em]"
                onClick={() =>
                  setStops((current) =>
                    current.length >= 5
                      ? current
                      : [...current, { color: "#ffffff", position: 100 }].map((stop, index, list) => ({
                          ...stop,
                          position: Math.round((index / (list.length - 1)) * 100),
                        })),
                  )
                }
                disabled={stops.length >= 5}
              >
                Add stop
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {stops.map((stop, index) => (
              <div key={index} className="grid grid-cols-[3rem_1fr_4.5rem_auto] items-end gap-2">
                <input
                  type="color"
                  value={stop.color.startsWith("#") && stop.color.length === 7 ? stop.color : "#000000"}
                  onChange={(event) => updateStop(index, { color: event.target.value })}
                  aria-label={`Colour ${index + 1}`}
                  className="h-9 w-full cursor-pointer border border-[var(--border)] bg-transparent"
                />
                <Field label={`Colour ${index + 1}`} htmlFor={`stop-color-${index}`}>
                  <input
                    id={`stop-color-${index}`}
                    value={stop.color}
                    onChange={(event) => updateStop(index, { color: event.target.value })}
                    className="input font-mono text-[0.8rem]"
                    spellCheck={false}
                  />
                </Field>
                <Field label="Position" htmlFor={`stop-pos-${index}`}>
                  <input
                    id={`stop-pos-${index}`}
                    type="number"
                    min={0}
                    max={100}
                    value={stop.position}
                    onChange={(event) => updateStop(index, { position: Number(event.target.value) })}
                    className="input font-mono text-[0.8rem]"
                  />
                </Field>
                <button
                  type="button"
                  className="btn btn-ghost !min-h-9 !px-2 !text-[0.6rem]"
                  onClick={() => setStops((current) => current.filter((_, position) => position !== index))}
                  disabled={stops.length <= 2}
                  aria-label={`Remove colour ${index + 1}`}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap gap-1.5">
            {PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => {
                  setStops(preset.stops);
                  setAngle(preset.angle);
                  setType("linear");
                }}
                className="border border-[var(--border)] px-2.5 py-1.5 font-mono text-[0.6rem] uppercase tracking-[0.1em] text-[var(--text-subtle)] transition-colors hover:border-[var(--border-strong)] hover:text-[var(--text)]"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-5 border border-[var(--border)] bg-[var(--page-elevated)] p-3">
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="font-mono text-[0.6rem] uppercase tracking-[0.12em] text-[var(--text-subtle)]">CSS</span>
          <CopyButton text={css} label="Copy CSS" />
        </div>
        <pre className="overflow-x-auto font-mono text-[0.8rem] leading-relaxed text-[var(--text)]">{css}</pre>
      </div>

      <p className="mt-3 text-xs leading-relaxed text-[var(--text-subtle)]">
        The preview is a real <span className="font-mono">background-image</span>, so what you see is exactly what the
        copied rule renders. Stops are emitted in position order.
      </p>
    </ToolPanel>
  );
}
