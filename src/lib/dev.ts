/* --------------------------------- Base64 -------------------------------- */

export function encodeBase64(text: string, urlSafe = false): string {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  let encoded = btoa(binary);
  if (urlSafe) {
    encoded = encoded.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }
  return encoded;
}

export function decodeBase64(input: string): string {
  const normalised = input
    .trim()
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .replace(/\s/g, "");
  const padded = normalised + "=".repeat((4 - (normalised.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder("utf-8", { fatal: false }).decode(bytes);
}

export function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

/* --------------------------------- HTML ---------------------------------- */

const HTML_ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

export function encodeHtmlEntities(text: string, nonAscii = false): string {
  let output = text.replace(/[&<>"']/g, (char) => HTML_ESCAPES[char]);
  if (nonAscii) {
    output = output.replace(/[^\x00-\x7F]/g, (char) => `&#${char.codePointAt(0)};`);
  }
  return output;
}

export function decodeHtmlEntities(text: string): string {
  if (typeof document !== "undefined") {
    const area = document.createElement("textarea");
    area.innerHTML = text;
    return area.value;
  }
  return text
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");
}

/* ---------------------------------- JSON --------------------------------- */

export interface JsonError {
  message: string;
  line?: number;
  column?: number;
}

export function formatJson(
  input: string,
  indent: number | "tab" = 2,
  sortKeys = false,
): { output: string; error?: JsonError; minified?: string } {
  try {
    const parsed = JSON.parse(input);
    const value = sortKeys ? sortKeysDeep(parsed) : parsed;
    const spaces = indent === "tab" ? "\t" : " ".repeat(indent);
    return {
      output: JSON.stringify(value, null, spaces),
      minified: JSON.stringify(value),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const position = /position (\d+)/.exec(message);
    let line: number | undefined;
    let column: number | undefined;
    if (position) {
      const offset = Number(position[1]);
      const before = input.slice(0, offset);
      line = before.split("\n").length;
      column = offset - before.lastIndexOf("\n");
    }
    return { output: "", error: { message, line, column } };
  }
}

function sortKeysDeep(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeysDeep);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, entry]) => [key, sortKeysDeep(entry)]),
    );
  }
  return value;
}

/* ---------------------------------- JWT ---------------------------------- */

export interface DecodedJwt {
  header?: Record<string, unknown>;
  payload?: Record<string, unknown>;
  signature?: string;
  error?: string;
  expiresAt?: Date | null;
  issuedAt?: Date | null;
  notBefore?: Date | null;
  expired?: boolean;
}

export function decodeJwt(token: string): DecodedJwt {
  const clean = token.trim().replace(/^Bearer\s+/i, "");
  const parts = clean.split(".");
  if (parts.length !== 3) {
    return { error: "A JWT must have exactly three dot-separated segments (header.payload.signature)." };
  }
  try {
    const header = JSON.parse(decodeBase64(parts[0])) as Record<string, unknown>;
    const payload = JSON.parse(decodeBase64(parts[1])) as Record<string, unknown>;
    const numeric = (value: unknown) =>
      typeof value === "number" && Number.isFinite(value) ? new Date(value * 1000) : null;
    const expiresAt = numeric(payload.exp);
    return {
      header,
      payload,
      signature: parts[2],
      expiresAt,
      issuedAt: numeric(payload.iat),
      notBefore: numeric(payload.nbf),
      expired: expiresAt ? expiresAt.getTime() < Date.now() : false,
    };
  } catch {
    return { error: "The token could not be decoded — the header or payload is not valid Base64URL JSON." };
  }
}

/* --------------------------------- colour -------------------------------- */

export interface Rgb {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface Hsl {
  h: number;
  s: number;
  l: number;
}

export function parseColor(input: string): Rgb | null {
  const value = input.trim().toLowerCase();

  const hex = /^#?([0-9a-f]{3,8})$/.exec(value);
  if (hex) {
    let raw = hex[1];
    if (raw.length === 3 || raw.length === 4) {
      raw = raw
        .split("")
        .map((char) => char + char)
        .join("");
    }
    if (raw.length === 6 || raw.length === 8) {
      return {
        r: parseInt(raw.slice(0, 2), 16),
        g: parseInt(raw.slice(2, 4), 16),
        b: parseInt(raw.slice(4, 6), 16),
        a: raw.length === 8 ? parseInt(raw.slice(6, 8), 16) / 255 : 1,
      };
    }
  }

  const rgbMatch = /^rgba?\(([^)]+)\)$/.exec(value);
  if (rgbMatch) {
    const parts = rgbMatch[1].split(/[,\s/]+/).filter(Boolean).map(Number);
    if (parts.length >= 3 && parts.slice(0, 3).every((part) => Number.isFinite(part))) {
      return {
        r: Math.min(255, Math.max(0, Math.round(parts[0]))),
        g: Math.min(255, Math.max(0, Math.round(parts[1]))),
        b: Math.min(255, Math.max(0, Math.round(parts[2]))),
        a: parts[3] !== undefined ? Math.min(1, Math.max(0, parts[3])) : 1,
      };
    }
  }

  const hslMatch = /^hsla?\(([^)]+)\)$/.exec(value);
  if (hslMatch) {
    const parts = hslMatch[1]
      .replace(/%/g, "")
      .split(/[,\s/]+/)
      .filter(Boolean)
      .map(Number);
    if (parts.length >= 3 && parts.slice(0, 3).every((part) => Number.isFinite(part))) {
      return hslToRgb({ h: parts[0], s: parts[1], l: parts[2] }, parts[3] ?? 1);
    }
  }
  return null;
}

export function rgbToHex({ r, g, b, a }: Rgb): string {
  const toHex = (value: number) => value.toString(16).padStart(2, "0");
  const base = `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  return a < 1 ? `${base}${Math.round(a * 255).toString(16).padStart(2, "0")}` : base;
}

export function rgbToHsl({ r, g, b }: Rgb): Hsl {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const delta = max - min;
  let h = 0;

  if (delta !== 0) {
    if (max === rn) h = ((gn - bn) / delta) % 6;
    else if (max === gn) h = (bn - rn) / delta + 2;
    else h = (rn - gn) / delta + 4;
    h *= 60;
    if (h < 0) h += 360;
  }

  const l = (max + min) / 2;
  const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export function hslToRgb({ h, s, l }: Hsl, a = 1): Rgb {
  const sn = s / 100;
  const ln = l / 100;
  const c = (1 - Math.abs(2 * ln - 1)) * sn;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = ln - c / 2;
  let rgb: [number, number, number];

  if (h < 60) rgb = [c, x, 0];
  else if (h < 120) rgb = [x, c, 0];
  else if (h < 180) rgb = [0, c, x];
  else if (h < 240) rgb = [0, x, c];
  else if (h < 300) rgb = [x, 0, c];
  else rgb = [c, 0, x];

  return {
    r: Math.round((rgb[0] + m) * 255),
    g: Math.round((rgb[1] + m) * 255),
    b: Math.round((rgb[2] + m) * 255),
    a,
  };
}

export function relativeLuminance({ r, g, b }: Rgb): number {
  const channel = (value: number) => {
    const srgb = value / 255;
    return srgb <= 0.03928 ? srgb / 12.92 : Math.pow((srgb + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

export function contrastRatio(a: Rgb, b: Rgb): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const lighter = Math.max(la, lb);
  const darker = Math.min(la, lb);
  return (lighter + 0.05) / (darker + 0.05);
}
