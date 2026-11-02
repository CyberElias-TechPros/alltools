import { describe, expect, it } from "vitest";
import { readExif } from "@/lib/exif";

/** Build a tiny JPEG whose only segment is an APP1 EXIF block with two tags. */
function buildJpeg(): ArrayBuffer {
  const little = true;
  const ifdEntries: Array<[number, number, number, number | string]> = [
    // Make (ASCII, 6 bytes → stored inline in the value slot)
    [0x010f, 2, 6, 0],
    // Orientation (SHORT, 1)
    [0x0112, 3, 1, 6],
  ];

  const entryCount = ifdEntries.length;
  const ifdSize = 2 + entryCount * 12 + 4;
  const asciiStart = 8 + ifdSize;
  const makeBytes = [0x43, 0x61, 0x6e, 0x6f, 0x6e, 0x00]; // "Canon\0"

  const total = 6 + asciiStart + makeBytes.length; // "Exif\0\0" + tiff
  const bytes = new Uint8Array(total + 10);
  const view = new DataView(bytes.buffer);

  // "Exif\0\0"
  [0x45, 0x78, 0x69, 0x66, 0x00, 0x00].forEach((byte, index) => bytes.set([byte], index));
  const tiff = 6;
  view.setUint16(tiff, 0x4949, false); // "II"
  view.setUint16(tiff + 2, 0x002a, little);
  view.setUint32(tiff + 4, 8, little);

  const ifd = tiff + 8;
  view.setUint16(ifd, entryCount, little);
  ifdEntries.forEach((entry, index) => {
    const offset = ifd + 2 + index * 12;
    view.setUint16(offset, entry[0], little);
    view.setUint16(offset + 2, entry[1], little);
    view.setUint32(offset + 4, entry[2], little);
    if (entry[0] === 0x0112) {
      view.setUint16(offset + 8, 6, little);
    } else {
      view.setUint32(offset + 8, asciiStart, little);
    }
  });
  bytes.set(makeBytes, tiff + asciiStart);

  // Wrap in a JPEG container with an APP1 length.
  const app1Length = 2 + total;
  const jpeg = new Uint8Array(6 + total);
  jpeg.set([0xff, 0xd8, 0xff, 0xe1], 0);
  new DataView(jpeg.buffer).setUint16(4, app1Length, false);
  jpeg.set(bytes.subarray(0, total), 6);
  return jpeg.buffer;
}

describe("readExif", () => {
  it("reads make and orientation from an APP1 segment", () => {
    const entries = readExif(buildJpeg());
    expect(entries.find((entry) => entry.name === "Camera make")?.value).toBe("Canon");
    expect(entries.find((entry) => entry.name === "Orientation")?.value).toBe("Rotated 90° clockwise");
  });

  it("returns nothing for a buffer without metadata", () => {
    const bytes = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    expect(readExif(bytes.buffer)).toEqual([]);
  });

  it("does not throw on truncated input", () => {
    expect(() => readExif(new Uint8Array([0xff, 0xd8, 0xff, 0xe1, 0x00]).buffer)).not.toThrow();
    expect(readExif(new Uint8Array([0xff, 0xd8, 0xff, 0xe1, 0x00]).buffer)).toEqual([]);
  });
});
