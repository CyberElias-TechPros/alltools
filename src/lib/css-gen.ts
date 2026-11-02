/**
 * CSS value builders for the design-tool pages: gradients, box shadows and
 * colour conversions. All output is plain CSS text the visitor can paste.
 */

import { parseColor, rgbToHex, rgbToHsl, type Rgb } from "./dev";

/* ------------------------------------------------------------------ */
/* Gradients                                                           */
/* ------------------------------------------------------------------ */

export interface GradientStop {
  color: string;
  position: number;
}

export type GradientType = "linear" | "radial" | "conic";

export interface GradientOptions {
  type: GradientType;
  angle: number;
  stops: GradientStop[];
  /** 0–100, used to place radial and conic centres. */
  centreX?: number;
  centreY?: number;
  /** Repeating variants tile the gradient. */
  repeating?: boolean;
}

function stopText(stop: GradientStop): string {
  return `${stop.color.trim()} ${Math.round(stop.position * 10) / 10}%`;
}

export function buildGradientValue(options: GradientOptions): string {
  const stops = [...options.stops].sort((a, b) => a.position - b.position);
  if (stops.length < 2) return "";
  const body = stops.map(stopText).join(", ");
  const prefix = options.repeating ? "repeating-" : "";
  const centreX = options.centreX ?? 50;
  const centreY = options.centreY ?? 50;

  if (options.type === "radial") {
    return `${prefix}radial-gradient(circle at ${centreX}% ${centreY}%, ${body})`;
  }
  if (options.type === "conic") {
    return `${prefix}conic-gradient(from ${Math.round(options.angle)}deg at ${centreX}% ${centreY}%, ${body})`;
  }
  return `${prefix}linear-gradient(${Math.round(options.angle)}deg, ${body})`;
}

export function buildGradientCss(options: GradientOptions): string {
  const value = buildGradientValue(options);
  if (!value) return "";
  return `background: ${value};`;
}

/* ------------------------------------------------------------------ */
/* Box shadows                                                         */
/* ------------------------------------------------------------------ */

export interface ShadowLayer {
  x: number;
  y: number;
  blur: number;
  spread: number;
  color: string;
  inset: boolean;
}

export function buildShadowValue(layers: ShadowLayer[]): string {
  const parts = layers
    .filter((layer) => layer.x !== 0 || layer.y !== 0 || layer.blur !== 0 || layer.spread !== 0)
    .map(
      (layer) =>
        `${layer.inset ? "inset " : ""}${Math.round(layer.x)}px ${Math.round(layer.y)}px ${Math.round(
          layer.blur,
        )}px ${Math.round(layer.spread)}px ${layer.color.trim()}`,
    );
  return parts.join(", ");
}

export function buildShadowCss(layers: ShadowLayer[]): string {
  const value = buildShadowValue(layers);
  return value ? `box-shadow: ${value};` : "";
}

/* ------------------------------------------------------------------ */
/* Colour conversion                                                   */
/* ------------------------------------------------------------------ */

export interface ParsedColour {
  hex: string;
  hex8: string;
  rgb: Rgb;
  rgbString: string;
  hslString: string;
  hsl: { h: number; s: number; l: number };
}

const clamp255 = (value: number) => Math.max(0, Math.min(255, Math.round(value)));

export function parseColour(input: string): ParsedColour | null {
  const rgb = parseColor(input.trim());
  if (!rgb) return null;
  const hex = rgbToHex({ ...rgb, a: 1 });
  const alpha = rgb.a === undefined ? 1 : Math.max(0, Math.min(1, rgb.a));
  const hex8 = `${hex}${Math.round(alpha * 255)
    .toString(16)
    .padStart(2, "0")}`;
  const hsl = rgbToHsl(rgb);
  return {
    hex,
    hex8,
    rgb,
    rgbString:
      alpha >= 1
        ? `rgb(${clamp255(rgb.r)}, ${clamp255(rgb.g)}, ${clamp255(rgb.b)})`
        : `rgba(${clamp255(rgb.r)}, ${clamp255(rgb.g)}, ${clamp255(rgb.b)}, ${Number(alpha.toFixed(3))})`,
    hslString: `hsl(${Math.round(hsl.h)} ${Math.round(hsl.s)}% ${Math.round(hsl.l)}%)`,
    hsl,
  };
}

/** Accepts `#abc`, `abc`, `#aabbcc`, `#aabbccdd`. */
export function normaliseHex(input: string): string | null {
  const raw = input.trim().replace(/^#/, "");
  if (!/^([0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(raw)) return null;
  const full =
    raw.length <= 4
      ? [...raw].map((char) => char + char).join("")
      : raw;
  return `#${full.toLowerCase()}`;
}

export function hexToRgb(hex: string): { r: number; g: number; b: number; a: number } | null {
  const normalised = normaliseHex(hex);
  if (!normalised) return null;
  const raw = normalised.slice(1);
  return {
    r: parseInt(raw.slice(0, 2), 16),
    g: parseInt(raw.slice(2, 4), 16),
    b: parseInt(raw.slice(4, 6), 16),
    a: raw.length === 8 ? parseInt(raw.slice(6, 8), 16) / 255 : 1,
  };
}

export function rgbToHexValue(r: number, g: number, b: number, a = 1): string {
  const base = `#${[r, g, b]
    .map((channel) => clamp255(channel).toString(16).padStart(2, "0"))
    .join("")}`;
  if (a >= 1) return base;
  return `${base}${Math.round(Math.max(0, Math.min(1, a)) * 255)
    .toString(16)
    .padStart(2, "0")}`;
}

export function rgbToHslString(r: number, g: number, b: number): string {
  const hsl = rgbToHsl({ r, g, b, a: 1 });
  return `hsl(${Math.round(hsl.h)} ${Math.round(hsl.s)}% ${Math.round(hsl.l)}%)`;
}
