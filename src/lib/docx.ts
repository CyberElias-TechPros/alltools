/**
 * DOCX text extraction without a dependency.
 *
 * A .docx is a ZIP archive; the words live in word/document.xml. We read the
 * central directory, inflate the one entry we need with the platform's own
 * DecompressionStream, and turn the XML into paragraphs. Nothing is uploaded.
 */

interface ZipEntry {
  name: string;
  method: number;
  compressedSize: number;
  localHeaderOffset: number;
}

function findEocd(view: DataView): number {
  // End of central directory signature, searched backwards over the maximum
  // comment length.
  const max = Math.max(0, view.byteLength - 22 - 0xffff);
  for (let offset = view.byteLength - 22; offset >= max; offset -= 1) {
    if (view.getUint32(offset, true) === 0x06054b50) return offset;
  }
  return -1;
}

export function listZipEntries(buffer: ArrayBuffer): ZipEntry[] {
  const view = new DataView(buffer);
  const eocd = findEocd(view);
  if (eocd < 0) return [];
  const count = view.getUint16(eocd + 10, true);
  let offset = view.getUint32(eocd + 16, true);
  const entries: ZipEntry[] = [];

  for (let index = 0; index < count; index += 1) {
    if (offset + 46 > view.byteLength || view.getUint32(offset, true) !== 0x02014b50) break;
    const method = view.getUint16(offset + 10, true);
    const compressedSize = view.getUint32(offset + 20, true);
    const nameLength = view.getUint16(offset + 28, true);
    const extraLength = view.getUint16(offset + 30, true);
    const commentLength = view.getUint16(offset + 32, true);
    const localHeaderOffset = view.getUint32(offset + 42, true);
    const nameBytes = new Uint8Array(buffer, offset + 46, nameLength);
    const name = new TextDecoder().decode(nameBytes);
    entries.push({ name, method, compressedSize, localHeaderOffset });
    offset += 46 + nameLength + extraLength + commentLength;
  }
  return entries;
}

async function readEntry(buffer: ArrayBuffer, entry: ZipEntry): Promise<Uint8Array | null> {
  const view = new DataView(buffer);
  const header = entry.localHeaderOffset;
  if (header + 30 > view.byteLength || view.getUint32(header, true) !== 0x04034b50) return null;
  const nameLength = view.getUint16(header + 26, true);
  const extraLength = view.getUint16(header + 28, true);
  const start = header + 30 + nameLength + extraLength;
  const data = new Uint8Array(buffer, start, entry.compressedSize);

  if (entry.method === 0) return data;
  if (entry.method !== 8) return null;
  if (typeof DecompressionStream === "undefined") {
    throw new Error("This browser cannot decompress DOCX files. Try a current Chrome, Edge, Firefox or Safari.");
  }
  const stream = new Blob([data as unknown as BlobPart]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

function xmlToText(xml: string): string {
  const paragraphs: string[] = [];
  const blocks = xml.split(/<w:p[ >]/).slice(1);
  for (const block of blocks) {
    const body = block.split("</w:p>")[0] ?? "";
    const pieces: string[] = [];
    const pattern = /<w:t(?: [^>]*)?>([\s\S]*?)<\/w:t>|<w:tab[^>]*\/>|<w:br[^>]*\/>/g;
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(body)) !== null) {
      if (match[1] !== undefined) {
        pieces.push(
          match[1]
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&quot;/g, '"')
            .replace(/&apos;/g, "'")
            .replace(/&amp;/g, "&"),
        );
      } else if (match[0].startsWith("<w:tab")) {
        pieces.push("\t");
      } else {
        pieces.push("\n");
      }
    }
    const text = pieces.join("").trimEnd();
    paragraphs.push(text);
  }
  return paragraphs.join("\n\n").replace(/\n{3,}/g, "\n\n").trim();
}

export async function extractDocxText(buffer: ArrayBuffer): Promise<string> {
  const entries = listZipEntries(buffer);
  const document = entries.find((entry) => entry.name === "word/document.xml");
  if (!document) {
    throw new Error("This file does not look like a Word document (word/document.xml is missing).");
  }
  const bytes = await readEntry(buffer, document);
  if (!bytes) throw new Error("The document body could not be decompressed.");
  return xmlToText(new TextDecoder().decode(bytes));
}

/** Rough page/paragraph statistics used by the document word counter. */
export function documentStats(text: string): { words: number; paragraphs: number; characters: number; readingMinutes: number } {
  const words = text.split(/\s+/).filter(Boolean).length;
  const paragraphs = text.split(/\n{2,}/).filter((block) => block.trim().length > 0).length;
  return {
    words,
    paragraphs,
    characters: text.length,
    readingMinutes: Math.max(1, Math.ceil(words / 225)),
  };
}
