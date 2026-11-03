import { describe, expect, it } from "vitest";
import { buildIco } from "@/lib/ico";

describe("buildIco", () => {
  it("writes a valid icon header with one entry per source", () => {
    const ico = buildIco([
      { size: 16, data: new Uint8Array([1, 2, 3, 4]) },
      { size: 32, data: new Uint8Array([5, 6]) },
    ]);
    const view = new DataView(ico.buffer);
    expect(view.getUint16(0, true)).toBe(0);
    expect(view.getUint16(2, true)).toBe(1);
    expect(view.getUint16(4, true)).toBe(2);
    expect(ico[6]).toBe(16);
    expect(ico[22]).toBe(32);
    expect(view.getUint32(6 + 8, true)).toBe(4);
    expect(view.getUint32(22 + 8, true)).toBe(2);
    expect(view.getUint32(6 + 12, true)).toBe(38);
    expect(view.getUint32(22 + 12, true)).toBe(42);
    expect(ico.byteLength).toBe(44);
  });

  it("encodes 256px as zero in the size field", () => {
    const ico = buildIco([{ size: 256, data: new Uint8Array([0]) }]);
    expect(ico[6]).toBe(0);
    expect(ico[7]).toBe(0);
  });
});
