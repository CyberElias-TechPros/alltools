/**
 * Minimal EXIF reader for JPEG and PNG files.
 *
 * Reads the common capture tags by walking the TIFF IFD in the APP1 segment.
 * Pure and defensive: every offset is bounds-checked, because metadata comes
 * from files the visitor did not necessarily create.
 */

export interface ExifEntry {
  tag: number;
  name: string;
  value: string;
}

const TAGS: Record<number, string> = {
  0x010e: "Image description",
  0x010f: "Camera make",
  0x0110: "Camera model",
  0x0112: "Orientation",
  0x011a: "X resolution",
  0x011b: "Y resolution",
  0x0128: "Resolution unit",
  0x0131: "Software",
  0x0132: "Date modified",
  0x013b: "Artist",
  0x8298: "Copyright",
  0x829a: "Exposure time",
  0x829d: "F-number",
  0x8822: "Exposure programme",
  0x8827: "ISO speed",
  0x9003: "Date taken",
  0x9201: "Shutter speed",
  0x9202: "Aperture",
  0x9204: "Exposure bias",
  0x9207: "Metering mode",
  0x9209: "Flash",
  0x920a: "Focal length",
  0x9286: "User comment",
  0xa002: "Pixel width",
  0xa003: "Pixel height",
  0xa434: "Lens model",
};

const ORIENTATION: Record<number, string> = {
  1: "Normal",
  2: "Mirrored horizontally",
  3: "Rotated 180°",
  4: "Mirrored vertically",
  5: "Mirrored and rotated 90°",
  6: "Rotated 90° clockwise",
  7: "Mirrored and rotated 270°",
  8: "Rotated 270° clockwise",
};

const FLASH: Record<number, string> = {
  0: "No flash",
  1: "Flash fired",
  9: "Flash fired (auto)",
  16: "Flash off (auto)",
  24: "Flash off (auto, no return light)",
};

function decodeAscii(view: DataView, offset: number, count: number): string {
  let out = "";
  for (let i = 0; i < count; i += 1) {
    if (offset + i >= view.byteLength) break;
    const code = view.getUint8(offset + i);
    if (code === 0) break;
    out += String.fromCharCode(code);
  }
  return out.trim();
}

function formatRational(value: number, tag: number): string {
  if (tag === 0x829a) {
    // Exposure time: 1/125 s
    if (value > 0 && value < 1) return `1/${Math.round(1 / value)} s`;
    return `${value} s`;
  }
  if (tag === 0x920a) return `${value.toFixed(1)} mm`;
  if (tag === 0x9204) return `${value > 0 ? "+" : ""}${value.toFixed(2)} EV`;
  return String(Math.round(value * 1000) / 1000);
}

function readTag(
  view: DataView,
  tag: number,
  type: number,
  count: number,
  valueOffset: number,
  little: boolean,
  base: number,
): string | null {
  const typeSize: Record<number, number> = { 1: 1, 2: 1, 3: 2, 4: 4, 5: 8, 7: 1, 9: 4, 10: 8 };
  const size = (typeSize[type] ?? 1) * count;
  // Offsets inside an IFD entry are relative to the start of the TIFF header.
  const offset = size <= 4 ? valueOffset : base + view.getUint32(valueOffset, little);
  if (offset + size > view.byteLength) return null;

  if (type === 2) {
    const text = decodeAscii(view, offset, count);
    return text.length > 0 ? text : null;
  }
  if (tag === 0x0112) {
    const value = view.getUint16(offset, little);
    return ORIENTATION[value] ?? `Orientation ${value}`;
  }
  if (tag === 0x9209) {
    const value = view.getUint16(offset, little);
    return FLASH[value] ?? `Flash code ${value}`;
  }
  if (type === 5 || type === 10) {
    const numerator = view.getUint32(offset, little);
    const denominator = view.getUint32(offset + 4, little) || 1;
    const value = numerator / denominator;
    if (tag === 0x829d) return `ƒ/${value.toFixed(1)}`;
    if (tag === 0x011a || tag === 0x011b) return `${Math.round(value)} dpi`;
    return formatRational(value, tag);
  }
  if (type === 3) return String(view.getUint16(offset, little));
  if (type === 4 || type === 9) return String(view.getUint32(offset, little));
  if (tag === 0x9286) {
    return decodeAscii(view, offset + 8, Math.max(count - 8, 0));
  }
  const bytes: string[] = [];
  for (let i = 0; i < Math.min(size, 32); i += 1) {
    bytes.push(view.getUint8(offset + i).toString(16).padStart(2, "0"));
  }
  return bytes.join(" ");
}

/** Extract named EXIF values from a JPEG or PNG buffer. */
export function readExif(buffer: ArrayBuffer): ExifEntry[] {
  const view = new DataView(buffer);
  if (view.byteLength < 16) return [];

  let tiffStart = -1;

  // JPEG: walk the marker segments looking for APP1 with an Exif header.
  if (view.getUint16(0, false) === 0xffd8) {
    let offset = 2;
    while (offset + 4 < view.byteLength) {
      const marker = view.getUint16(offset, false);
      if ((marker & 0xff00) !== 0xff00) break;
      const length = view.getUint16(offset + 2, false);
      if (marker === 0xffe1) {
        const start = offset + 4;
        const header = decodeAscii(view, start, 4);
        if (header === "Exif") {
          tiffStart = start + 6;
          break;
        }
      }
      if (length < 2) break;
      offset += 2 + length;
    }
  } else if (view.getUint32(0, false) === 0x89504e47) {
    // PNG: look for an eXIf chunk.
    let offset = 8;
    while (offset + 8 <= view.byteLength) {
      const length = view.getUint32(offset, false);
      const type = decodeAscii(view, offset + 4, 4);
      if (type === "eXIf") {
        tiffStart = offset + 8;
        break;
      }
      offset += 12 + length;
      if (offset > view.byteLength) break;
    }
  }

  if (tiffStart < 0 || tiffStart + 8 > view.byteLength) return [];

  const order = view.getUint16(tiffStart, false);
  const little = order === 0x4949;
  if (!little && order !== 0x4d4d) return [];
  if (view.getUint16(tiffStart + 2, little) !== 0x002a) return [];

  const ifdOffset = tiffStart + view.getUint32(tiffStart + 4, little);
  if (ifdOffset + 2 > view.byteLength) return [];
  const count = view.getUint16(ifdOffset, little);
  const entries: ExifEntry[] = [];

  for (let index = 0; index < count; index += 1) {
    const entryOffset = ifdOffset + 2 + index * 12;
    if (entryOffset + 12 > view.byteLength) break;
    const tag = view.getUint16(entryOffset, little);
    const type = view.getUint16(entryOffset + 2, little);
    const components = view.getUint32(entryOffset + 4, little);
    const valueOffset = entryOffset + 8;
    const name = TAGS[tag];
    if (!name) continue;
    const value = readTag(view, tag, type, components, valueOffset, little, tiffStart);
    if (value) entries.push({ tag, name, value });
  }

  // EXIF sub-IFD (0x8769) holds the capture settings on most cameras.
  for (let index = 0; index < count; index += 1) {
    const entryOffset = ifdOffset + 2 + index * 12;
    if (entryOffset + 12 > view.byteLength) break;
    const tag = view.getUint16(entryOffset, little);
    if (tag !== 0x8769) continue;
    const subOffset = tiffStart + view.getUint32(entryOffset + 8, little);
    if (subOffset + 2 > view.byteLength) break;
    const subCount = view.getUint16(subOffset, little);
    for (let sub = 0; sub < subCount; sub += 1) {
      const offset = subOffset + 2 + sub * 12;
      if (offset + 12 > view.byteLength) break;
      const subTag = view.getUint16(offset, little);
      const subName = TAGS[subTag];
      if (!subName) continue;
      const value = readTag(
        view,
        subTag,
        view.getUint16(offset + 2, little),
        view.getUint32(offset + 4, little),
        offset + 8,
        little,
        tiffStart,
      );
      if (value && !entries.some((entry) => entry.tag === subTag)) {
        entries.push({ tag: subTag, name: subName, value });
      }
    }
  }

  return entries;
}
