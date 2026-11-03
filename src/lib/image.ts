/**
 * Canvas helpers shared by the image tools.
 *
 * All decoding happens through the browser's own decoders (createImageBitmap /
 * Image), drawing happens on a canvas, and export uses canvas.toBlob, so an
 * image never leaves the device.
 */

export interface LoadedImage {
  file: File;
  image: HTMLImageElement;
  width: number;
  height: number;
  type: string;
}

export function loadImageFile(file: File): Promise<LoadedImage> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("That file is not an image. Choose a PNG, JPEG, WebP, GIF or SVG file."));
      return;
    }
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ file, image, width: image.naturalWidth, height: image.naturalHeight, type: file.type });
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("The image could not be decoded. The file may be damaged or in an unsupported format."));
    };
    image.src = url;
  });
}

export function createCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width));
  canvas.height = Math.max(1, Math.round(height));
  return canvas;
}

export function drawToCanvas(
  image: HTMLImageElement,
  width: number,
  height: number,
  options: { fit?: "stretch" | "cover" | "contain"; background?: string } = {},
): HTMLCanvasElement {
  const { fit = "stretch", background } = options;
  const canvas = createCanvas(width, height);
  const context = canvas.getContext("2d");
  if (!context) return canvas;
  if (background) {
    context.fillStyle = background;
    context.fillRect(0, 0, canvas.width, canvas.height);
  }
  context.imageSmoothingQuality = "high";
  if (fit === "stretch") {
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
  } else {
    const scale = fit === "cover" ? Math.max(width / image.naturalWidth, height / image.naturalHeight) : Math.min(width / image.naturalWidth, height / image.naturalHeight);
    const drawWidth = image.naturalWidth * scale;
    const drawHeight = image.naturalHeight * scale;
    context.drawImage(image, (width - drawWidth) / 2, (height - drawHeight) / 2, drawWidth, drawHeight);
  }
  return canvas;
}

export function canvasToBlob(
  canvas: HTMLCanvasElement,
  type = "image/png",
  quality?: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("The browser could not encode the result in that format."));
      },
      type,
      quality,
    );
  });
}

export function extensionFor(type: string): string {
  if (type === "image/jpeg") return "jpg";
  if (type === "image/webp") return "webp";
  if (type === "image/png") return "png";
  if (type === "image/svg+xml") return "svg";
  if (type === "image/gif") return "gif";
  if (type === "image/avif") return "avif";
  return "png";
}

/** Replace the extension of a filename: photo.png + jpg → photo.jpg */
export function withExtension(filename: string, extension: string): string {
  const base = filename.replace(/\.[a-z0-9]+$/i, "");
  return `${base}.${extension}`;
}

/** Dominant colours by bucketing pixels into a coarse RGB grid. */
export function dominantColours(
  canvas: HTMLCanvasElement,
  count = 6,
): Array<{ hex: string; share: number }> {
  const context = canvas.getContext("2d");
  if (!context) return [];
  const { width, height } = canvas;
  const data = context.getImageData(0, 0, width, height).data;
  const buckets = new Map<string, { r: number; g: number; b: number; n: number }>();
  const step = Math.max(1, Math.floor(Math.sqrt((width * height) / 20000)));
  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const index = (y * width + x) * 4;
      if (data[index + 3] < 8) continue;
      const r = Math.round(data[index] / 16) * 16;
      const g = Math.round(data[index + 1] / 16) * 16;
      const b = Math.round(data[index + 2] / 16) * 16;
      const key = `${r},${g},${b}`;
      const bucket = buckets.get(key) ?? { r: 0, g: 0, b: 0, n: 0 };
      bucket.r += data[index];
      bucket.g += data[index + 1];
      bucket.b += data[index + 2];
      bucket.n += 1;
      buckets.set(key, bucket);
    }
  }
  const total = [...buckets.values()].reduce((sum, bucket) => sum + bucket.n, 0) || 1;
  return [...buckets.values()]
    .sort((a, b) => b.n - a.n)
    .slice(0, count)
    .map((bucket) => ({
      hex: `#${[bucket.r / bucket.n, bucket.g / bucket.n, bucket.b / bucket.n]
        .map((value) => Math.round(value).toString(16).padStart(2, "0"))
        .join("")}`,
      share: bucket.n / total,
    }));
}

/** Reduce a canvas to a grid of colour averages — the pixelation effect. */
export function pixelateCanvas(source: HTMLCanvasElement, blocks: number): HTMLCanvasElement {
  const blockSize = Math.max(2, Math.round(Math.max(source.width, source.height) / Math.max(blocks, 2)));
  const small = createCanvas(Math.max(1, Math.floor(source.width / blockSize)), Math.max(1, Math.floor(source.height / blockSize)));
  const smallContext = small.getContext("2d");
  if (!smallContext) return source;
  smallContext.drawImage(source, 0, 0, small.width, small.height);
  const output = createCanvas(source.width, source.height);
  const outputContext = output.getContext("2d");
  if (!outputContext) return source;
  outputContext.imageSmoothingEnabled = false;
  outputContext.drawImage(small, 0, 0, output.width, output.height);
  return output;
}
