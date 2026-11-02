/**
 * PDF reading and writing, entirely in the browser.
 *
 * Reading and rendering use pdf.js (worker-based, no network); editing uses
 * pdf-lib. Neither uploads anything, and both operate on an ArrayBuffer you
 * supply from a File.
 */

import { PDFDocument, StandardFonts, degrees, rgb } from "pdf-lib";

export interface LoadedPdf {
  file: File;
  bytes: ArrayBuffer;
  pages: number;
}

export async function readPdfFile(file: File): Promise<LoadedPdf> {
  const bytes = await file.arrayBuffer();
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  return { file, bytes, pages: doc.getPageCount() };
}

/** Load a pdf.js document, wiring the worker to a bundled asset URL. */
export async function openWithPdfJs(bytes: ArrayBuffer) {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url,
  ).toString();
  return pdfjs.getDocument({ data: new Uint8Array(bytes) }).promise;
}

export async function renderPage(
  pdf: Awaited<ReturnType<typeof openWithPdfJs>>,
  pageNumber: number,
  scale = 2,
): Promise<HTMLCanvasElement> {
  const page = await pdf.getPage(pageNumber);
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas is unavailable in this browser.");
  // pdf.js 4 types omit `canvas` although the runtime accepts it for GPU paths.
  await page.render({ canvasContext: context, viewport } as Parameters<typeof page.render>[0]).promise;
  return canvas;
}

/** Extract the text layer of every page, in order. */
export async function extractPdfText(bytes: ArrayBuffer): Promise<string[]> {
  const pdf = await openWithPdfJs(bytes);
  const pages: string[] = [];
  for (let index = 1; index <= pdf.numPages; index += 1) {
    const page = await pdf.getPage(index);
    const content = await page.getTextContent();
    const text = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    pages.push(text);
  }
  return pages;
}

export interface PdfInfo {
  pages: number;
  title: string | null;
  author: string | null;
  subject: string | null;
  creator: string | null;
  producer: string | null;
  creationDate: string | null;
  pageSizes: Array<{ width: number; height: number; label: string }>;
  encrypted: boolean;
}

export async function readPdfInfo(bytes: ArrayBuffer): Promise<PdfInfo> {
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true, updateMetadata: false });
  const pages = doc.getPages();
  return {
    pages: pages.length,
    title: doc.getTitle() ?? null,
    author: doc.getAuthor() ?? null,
    subject: doc.getSubject() ?? null,
    creator: doc.getCreator() ?? null,
    producer: doc.getProducer() ?? null,
    creationDate: doc.getCreationDate()?.toISOString() ?? null,
    pageSizes: pages.slice(0, 12).map((page, index) => {
      const { width, height } = page.getSize();
      return { width: Math.round(width), height: Math.round(height), label: `Page ${index + 1}` };
    }),
    encrypted: false,
  };
}

/* ------------------------------------------------------------------ */
/* Editing                                                             */
/* ------------------------------------------------------------------ */

export interface RangePart {
  label: string;
  from: number;
  to: number;
}

/** Parse "1-3, 5, 8-10" into page ranges, clamped to the document. */
export function parsePageRanges(input: string, pageCount: number): RangePart[] | null {
  const cleaned = input.trim();
  if (!cleaned) return null;
  const parts = cleaned.split(",").map((part) => part.trim()).filter(Boolean);
  if (parts.length === 0) return null;
  const result: RangePart[] = [];
  for (const part of parts) {
    const single = part.match(/^(\d+)$/);
    const range = part.match(/^(\d+)\s*[-–]\s*(\d+)$/);
    if (single) {
      const page = Number(single[1]);
      if (page < 1 || page > pageCount) return null;
      result.push({ label: `page ${page}`, from: page, to: page });
    } else if (range) {
      let from = Number(range[1]);
      let to = Number(range[2]);
      if (from > to) [from, to] = [to, from];
      if (from < 1 || to > pageCount) return null;
      result.push({ label: `pages ${from}–${to}`, from, to });
    } else {
      return null;
    }
  }
  return result;
}

export async function mergePdfs(files: File[]): Promise<Uint8Array> {
  const merged = await PDFDocument.create();
  for (const file of files) {
    const source = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true });
    const pages = await merged.copyPages(source, source.getPageIndices());
    pages.forEach((page) => merged.addPage(page));
  }
  return merged.save({ useObjectStreams: true });
}

export async function extractPages(
  bytes: ArrayBuffer,
  ranges: RangePart[],
): Promise<Uint8Array> {
  const source = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const output = await PDFDocument.create();
  const indices: number[] = [];
  for (const range of ranges) {
    for (let page = range.from; page <= range.to; page += 1) indices.push(page - 1);
  }
  const copied = await output.copyPages(source, [...new Set(indices)]);
  copied.forEach((page) => output.addPage(page));
  return output.save({ useObjectStreams: true });
}

export async function reorderPages(bytes: ArrayBuffer, order: number[]): Promise<Uint8Array> {
  const source = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const output = await PDFDocument.create();
  const copied = await output.copyPages(source, order.map((page) => page - 1));
  copied.forEach((page) => output.addPage(page));
  return output.save({ useObjectStreams: true });
}

export async function rotatePages(
  bytes: ArrayBuffer,
  rotation: number,
  pages: "all" | number[] = "all",
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const targets = pages === "all" ? doc.getPages() : pages.map((number) => doc.getPage(number - 1));
  for (const page of targets) {
    page.setRotation(degrees((page.getRotation().angle + rotation) % 360));
  }
  return doc.save({ useObjectStreams: true });
}

export async function imagesToPdf(
  files: File[],
  options: { pageSize: "fit" | "a4" | "letter"; margin: number },
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  for (const file of files) {
    const bytes = await file.arrayBuffer();
    const image = file.type === "image/png"
      ? await doc.embedPng(bytes)
      : await doc.embedJpg(bytes);
    const preset =
      options.pageSize === "a4"
        ? ([595.28, 841.89] as const)
        : options.pageSize === "letter"
          ? ([612, 792] as const)
          : null;
    const pageWidth = preset ? preset[0] : image.width + options.margin * 2;
    const pageHeight = preset ? preset[1] : image.height + options.margin * 2;
    const page = doc.addPage([pageWidth, pageHeight]);
    const available = { width: pageWidth - options.margin * 2, height: pageHeight - options.margin * 2 };
    const scale = Math.min(available.width / image.width, available.height / image.height, 1);
    page.drawImage(image, {
      x: (pageWidth - image.width * scale) / 2,
      y: (pageHeight - image.height * scale) / 2,
      width: image.width * scale,
      height: image.height * scale,
    });
  }
  return doc.save({ useObjectStreams: true });
}

export async function textToPdf(
  text: string,
  options: { fontSize: number; margin: number; pageSize: "a4" | "letter"; title?: string },
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  if (options.title) doc.setTitle(options.title);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const size = options.fontSize;
  const lineHeight = size * 1.45;
  const lineWidthFactor = font.widthOfTextAtSize("n", size);
  const pageWidth = options.pageSize === "a4" ? 595.28 : 612;
  const pageHeight = options.pageSize === "a4" ? 841.89 : 792;
  const maxWidth = pageWidth - options.margin * 2;
  const maxChars = Math.max(20, Math.floor(maxWidth / lineWidthFactor));

  const lines: string[] = [];
  for (const paragraph of text.replace(/\r\n/g, "\n").split("\n")) {
    if (!paragraph.trim()) {
      lines.push("");
      continue;
    }
    let current = "";
    for (const word of paragraph.split(/\s+/)) {
      if ((current + " " + word).trim().length > maxChars) {
        lines.push(current.trim());
        current = word;
      } else {
        current += ` ${word}`;
      }
    }
    if (current.trim()) lines.push(current.trim());
  }

  let page = doc.addPage([pageWidth, pageHeight]);
  let y = pageHeight - options.margin;
  for (const line of lines) {
    if (y < options.margin + size) {
      page = doc.addPage([pageWidth, pageHeight]);
      y = pageHeight - options.margin;
    }
    if (line) {
      page.drawText(line, { x: options.margin, y, size, font, color: rgb(0.08, 0.08, 0.06) });
    }
    y -= lineHeight;
  }
  return doc.save({ useObjectStreams: true });
}

export async function watermarkPdf(
  bytes: ArrayBuffer,
  options: { text: string; opacity: number; diagonal: boolean; fontSize: number },
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const font = await doc.embedFont(StandardFonts.HelveticaBold);
  for (const page of doc.getPages()) {
    const { width, height } = page.getSize();
    const textWidth = font.widthOfTextAtSize(options.text, options.fontSize);
    page.drawText(options.text, {
      x: Math.max(10, width / 2 - textWidth / (options.diagonal ? 2.6 : 2)),
      y: height / 2,
      size: options.fontSize,
      font,
      color: rgb(0.55, 0.55, 0.55),
      opacity: Math.min(Math.max(options.opacity, 0.05), 1),
      rotate: degrees(options.diagonal ? 35 : 0),
    });
  }
  return doc.save({ useObjectStreams: true });
}

/** Re-save with object streams — the honest extent of "compression" here. */
export async function optimisePdf(bytes: ArrayBuffer): Promise<Uint8Array> {
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  return doc.save({ useObjectStreams: true, addDefaultPage: false });
}
