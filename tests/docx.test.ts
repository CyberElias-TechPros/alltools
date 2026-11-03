import { describe, expect, it } from "vitest";
import { documentStats, extractDocxText, listZipEntries } from "@/lib/docx";

const XML = `<?xml version="1.0"?><w:document><w:body>
<w:p><w:r><w:t>Hello</w:t></w:r><w:r><w:t xml:space="preserve"> world</w:t></w:r></w:p>
<w:p><w:r><w:t>Second paragraph &amp; more</w:t></w:r></w:p>
</w:body></w:document>`;

/** Build an uncompressed ZIP archive containing one entry. */
function buildStoredZip(name: string, content: string): ArrayBuffer {
  const encoder = new TextEncoder();
  const nameBytes = encoder.encode(name);
  const data = encoder.encode(content);
  const total = 30 + nameBytes.length + data.length + 46 + nameBytes.length + 22;
  const buffer = new ArrayBuffer(total);
  const view = new DataView(buffer);
  const bytes = new Uint8Array(buffer);

  view.setUint32(0, 0x04034b50, true);
  view.setUint16(4, 20, true);
  view.setUint16(8, 0, true); // stored
  view.setUint32(14, 0, true);
  view.setUint32(18, data.length, true);
  view.setUint32(22, data.length, true);
  view.setUint16(26, nameBytes.length, true);
  bytes.set(nameBytes, 30);
  bytes.set(data, 30 + nameBytes.length);

  const central = 30 + nameBytes.length + data.length;
  view.setUint32(central, 0x02014b50, true);
  view.setUint16(central + 4, 20, true);
  view.setUint16(central + 6, 20, true);
  view.setUint16(central + 10, 0, true); // stored
  view.setUint32(central + 20, data.length, true);
  view.setUint32(central + 24, data.length, true);
  view.setUint16(central + 28, nameBytes.length, true);
  view.setUint32(central + 42, 0, true);
  bytes.set(nameBytes, central + 46);

  const eocd = central + 46 + nameBytes.length;
  view.setUint32(eocd, 0x06054b50, true);
  view.setUint16(eocd + 8, 1, true);
  view.setUint16(eocd + 10, 1, true);
  view.setUint32(eocd + 12, 46 + nameBytes.length, true);
  view.setUint32(eocd + 16, central, true);

  return buffer;
}

describe("docx extraction", () => {
  it("lists entries in the archive", () => {
    const zip = buildStoredZip("word/document.xml", XML);
    const entries = listZipEntries(zip);
    expect(entries).toHaveLength(1);
    expect(entries[0].name).toBe("word/document.xml");
    expect(entries[0].method).toBe(0);
  });

  it("reads paragraphs and decodes entities", async () => {
    const zip = buildStoredZip("word/document.xml", XML);
    const text = await extractDocxText(zip);
    expect(text).toContain("Hello world");
    expect(text).toContain("Second paragraph & more");
  });

  it("reports a helpful error for a non-docx zip", async () => {
    const zip = buildStoredZip("word/styles.xml", "<xml/>");
    await expect(extractDocxText(zip)).rejects.toThrow(/not look like a Word document/);
  });

  it("counts words and paragraphs", () => {
    expect(documentStats("One two three.\n\nFour five.")).toMatchObject({ words: 5, paragraphs: 2 });
  });
});
