import { describe, expect, it } from "vitest";
import { PDFDocument } from "pdf-lib";
import { extractPages, mergePdfs, parsePageRanges, textToPdf, imagesToPdf } from "@/lib/pdf";

async function makePdf(pageCount: number): Promise<File> {
  const doc = await PDFDocument.create();
  for (let index = 0; index < pageCount; index += 1) doc.addPage([300, 400]);
  const saved = await doc.save();
  const bytes = new ArrayBuffer(saved.byteLength);
  new Uint8Array(bytes).set(saved);
  return new File([bytes], `sample-${pageCount}.pdf`, { type: "application/pdf" });
}

describe("parsePageRanges", () => {
  it("parses singles and ranges", () => {
    expect(parsePageRanges("1-3, 5", 10)).toEqual([
      { label: "pages 1–3", from: 1, to: 3 },
      { label: "page 5", from: 5, to: 5 },
    ]);
  });

  it("rejects out-of-bounds or malformed input", () => {
    expect(parsePageRanges("0-2", 10)).toBeNull();
    expect(parsePageRanges("8-12", 10)).toBeNull();
    expect(parsePageRanges("abc", 10)).toBeNull();
    expect(parsePageRanges("", 10)).toBeNull();
  });

  it("swaps reversed ranges", () => {
    expect(parsePageRanges("5-3", 10)).toEqual([{ label: "pages 3–5", from: 3, to: 5 }]);
  });
});

describe("pdf operations", () => {
  it("merges two documents", async () => {
    const bytes = await mergePdfs([await makePdf(2), await makePdf(3)]);
    const merged = await PDFDocument.load(bytes);
    expect(merged.getPageCount()).toBe(5);
  });

  it("extracts selected pages", async () => {
    const source = await makePdf(6);
    const bytes = await extractPages(await source.arrayBuffer(), parsePageRanges("2-3, 6", 6) ?? []);
    const result = await PDFDocument.load(bytes);
    expect(result.getPageCount()).toBe(3);
  });

  it("builds a text PDF with multiple pages", async () => {
    const long = Array.from({ length: 120 }, (_, index) => `Line ${index + 1} of the document.`).join("\n");
    const bytes = await textToPdf(long, { fontSize: 12, margin: 56, pageSize: "a4", title: "Test" });
    const doc = await PDFDocument.load(bytes);
    expect(doc.getPageCount()).toBeGreaterThan(1);
    expect(doc.getTitle()).toBe("Test");
  });

  it("refuses images it cannot embed", async () => {
    const fake = new File([new Uint8Array([1, 2, 3])], "x.jpg", { type: "image/jpeg" });
    await expect(imagesToPdf([fake], { pageSize: "fit", margin: 0 })).rejects.toBeTruthy();
  });
});
