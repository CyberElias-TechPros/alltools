/**
 * Build a multi-resolution .ico file from PNG images.
 *
 * Windows Vista and later accept PNG-compressed icon entries, which is far
 * simpler than the old BMP layout and is what modern browsers and OSes use.
 */

export interface IcoSource {
  size: number;
  data: Uint8Array;
}

export function buildIco(sources: IcoSource[]): Uint8Array {
  const entries = [...sources].sort((a, b) => a.size - b.size);
  const headerSize = 6 + entries.length * 16;
  const total = headerSize + entries.reduce((sum, entry) => sum + entry.data.length, 0);
  const bytes = new Uint8Array(total);
  const view = new DataView(bytes.buffer);

  view.setUint16(0, 0, true); // reserved
  view.setUint16(2, 1, true); // type: icon
  view.setUint16(4, entries.length, true);

  let dataOffset = headerSize;
  entries.forEach((entry, index) => {
    const offset = 6 + index * 16;
    // 256px is encoded as 0 in the single-byte width/height fields.
    bytes[offset] = entry.size >= 256 ? 0 : entry.size;
    bytes[offset + 1] = entry.size >= 256 ? 0 : entry.size;
    bytes[offset + 2] = 0; // palette colours
    bytes[offset + 3] = 0; // reserved
    view.setUint16(offset + 4, 1, true); // colour planes
    view.setUint16(offset + 6, 32, true); // bits per pixel
    view.setUint32(offset + 8, entry.data.length, true);
    view.setUint32(offset + 12, dataOffset, true);
    bytes.set(entry.data, dataOffset);
    dataOffset += entry.data.length;
  });

  return bytes;
}

/** Single-page HTML snippet that wires up a favicon set. */
export function faviconHtml(): string {
  return [
    '<link rel="icon" href="/favicon.ico" sizes="any" />',
    '<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />',
    '<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />',
    '<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />',
    '<link rel="manifest" href="/site.webmanifest" />',
  ].join("\n");
}
