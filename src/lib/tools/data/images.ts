import type { ToolDefinition } from "../types";

/**
 * docs/BLUEPRINT.md §D — image tools.
 *
 * Every one of these decodes with the browser's own image pipeline and draws to
 * a canvas. No file is uploaded, no server is involved, and the output is
 * produced by canvas.toBlob (or the File API for base64).
 */
export const imageTools: ToolDefinition[] = [
  {
    slug: "image-compressor",
    name: "Image Compressor",
    category: "images",
    tagline: "Shrink a photo with a quality slider and a maximum width, all on-device.",
    intent: "compress an image without uploading it",
    keywords: ["image compressor", "compress jpg", "reduce image size", "compress photo online"],
    status: "live",
    actions: ["download"],
    effort: "instant",
    popularity: 92,
    addedAt: "2025-11-02",
    seoTitle: "Image Compressor — Shrink Photos in Your Browser",
    seoDescription:
      "Compress JPG, PNG and WebP images without uploading them. Adjust quality and maximum width, see the size saving, and download the result instantly.",
    content: {
      intro: [
        "Every upload-heavy workflow eventually needs a smaller file: a blog header, an email attachment, a marketplace listing, a form with a 2 MB limit. This compressor does it in the page, so a private photo never leaves your device.",
        "Quality and dimensions are the only two levers that matter. Lowering quality discards detail; lowering dimensions discards pixels. The preview shows what you are about to accept.",
      ],
      howTo: [
        "Drop an image or choose a file.",
        "Set a quality value between 0.4 and 0.8 for most photographs.",
        "Cap the width at what the final placement actually needs.",
        "Check the saving and the preview, then download.",
      ],
      method: {
        title: "What compression does",
        paragraphs: [
          "JPEG and WebP are lossy: the encoder throws away detail the eye is less likely to notice, and the quality value controls how aggressively. PNG is lossless, so a PNG export is usually larger than a JPEG of the same photo.",
          "Resizing first is often more effective than compressing harder. A 4000 px photo displayed at 1200 px carries three times the pixels the screen can show.",
        ],
        formula: "saving % = (1 − new size ÷ original size) × 100",
      },
      examples: [
        { title: "A phone photo for a blog", steps: ["Set quality 0.75 and max width 1600.", "Compare with the original."], result: "often 70–85% smaller" },
        { title: "A screenshot with text", steps: ["Keep PNG lossless, reduce the width."], result: "crisp text, smaller file" },
      ],
      limitations: [
        "Output quality depends on the browser's encoder, so two browsers may produce slightly different file sizes.",
        "An already-compressed file may not get smaller; the tool tells you when that happens instead of pretending.",
        "Metadata such as EXIF and GPS is discarded, which is usually desirable but is a change.",
      ],
      faqs: [
        { q: "Is my image uploaded?", a: "No. It is decoded and re-encoded by your browser on this device." },
        { q: "Which format should I choose?", a: "WebP for the web, JPEG for maximum compatibility, PNG when you need lossless quality or transparency." },
        { q: "Why is the PNG bigger?", a: "PNG stores every pixel exactly, so photographs compress poorly. Use JPEG or WebP for photos." },
      ],
    },
  },
  {
    slug: "image-resizer",
    name: "Image Resizer",
    category: "images",
    tagline: "Resize to exact pixels with a ratio lock, crop-to-fill or letterboxing.",
    intent: "resize an image to exact dimensions",
    keywords: ["image resizer", "resize image", "change image dimensions", "resize photo"],
    status: "live",
    actions: ["download"],
    effort: "instant",
    popularity: 90,
    addedAt: "2025-11-02",
    seoTitle: "Image Resizer — Exact Pixels with Aspect Ratio Lock",
    seoDescription:
      "Resize any image to exact pixel dimensions in your browser. Lock the aspect ratio, crop to fill or fit inside, then download PNG, JPEG or WebP.",
    content: {
      intro: [
        "Platforms ask for specific pixel sizes and then crop whatever does not fit. This resizer gives you the three sensible behaviours: stretch, crop to fill, or fit inside with margins.",
        "The ratio lock keeps the image undistorted while you type a single dimension, which is what most resizing actually needs.",
      ],
      howTo: [
        "Choose an image and read its original dimensions.",
        "Type a new width — the height follows while the lock is on.",
        "Pick crop to fill for thumbnails, or fit inside to keep the whole frame.",
        "Download in PNG, JPEG or WebP.",
      ],
      method: {
        title: "Interpolation and framing",
        paragraphs: [
          "The browser redraws the image onto a canvas of the new size using high-quality smoothing. Downscaling averages neighbouring pixels; upscaling interpolates between them and cannot create detail that was never captured.",
          "Crop to fill scales until the image covers the target, then centres and trims the overflow. Fit inside scales until the whole image fits and pads the remainder with the background colour.",
        ],
        formula: "new height = original height × (new width ÷ original width)",
      },
      examples: [
        { title: "A 4032 × 3024 photo to 1200 px wide", steps: ["Enter 1200 with the lock on."], result: "1200 × 900" },
        { title: "Making a square avatar", steps: ["Target 512 × 512, crop to fill."], result: "centred square crop" },
      ],
      limitations: [
        "Upscaled images look softer than a true higher-resolution original.",
        "Animated GIFs and WebP lose their animation when drawn to a canvas.",
        "EXIF orientation is applied by the browser, so the result may be rotated compared with the raw file.",
      ],
      faqs: [
        { q: "Does resizing reduce file size?", a: "Usually yes, because there are fewer pixels to store — the effect is largest when downscaling a lot." },
        { q: "What is the difference between resize and crop?", a: "Resizing changes the pixel grid; cropping changes the framing. Crop to fill does both." },
        { q: "Can I keep transparency?", a: "Yes with PNG or WebP. JPEG has no alpha channel and fills transparent areas with the chosen background." },
      ],
    },
  },
  {
    slug: "image-cropper",
    name: "Image Cropper",
    category: "images",
    tagline: "Crop to a fixed aspect ratio with control over which part is kept.",
    intent: "crop an image to an aspect ratio",
    keywords: ["image cropper", "crop image online", "aspect ratio crop", "square crop"],
    status: "live",
    actions: ["download"],
    effort: "instant",
    popularity: 85,
    addedAt: "2025-11-02",
    seoTitle: "Image Cropper — Crop to 1:1, 4:3, 16:9 or 9:16",
    seoDescription:
      "Crop an image to a square, portrait or widescreen ratio. Choose the crop width and anchor it left, centre or right, then download the cropped file.",
    content: {
      intro: [
        "A crop is two decisions: which ratio, and which part of the frame matters. This tool separates them, so you can produce a 1:1 avatar from a wide photo without guessing coordinates.",
        "The crop is anchored rather than dragged, which is faster on a phone and easier to repeat across a set of images.",
      ],
      howTo: [
        "Choose the aspect ratio you need.",
        "Set how much of the width to keep.",
        "Anchor the crop left, centre or right, and top, middle or bottom.",
        "Download the cropped result.",
      ],
      method: {
        title: "How the crop is calculated",
        paragraphs: [
          "Crop width is a percentage of the image width. Crop height comes either from the locked ratio or, with the free option, from the same percentage.",
          "The anchor decides the offset: left keeps the leftmost pixels, centre splits the discarded margin evenly, right keeps the rightmost.",
        ],
        formula: "crop height = crop width ÷ ratio",
      },
      examples: [
        { title: "A landscape photo to a square", steps: ["Choose 1:1, crop width 80%, centre."], result: "a centred square" },
        { title: "A 16:9 video thumbnail", steps: ["Choose 16:9, anchor at the top so heads are not cut."], result: "top-aligned widescreen crop" },
      ],
      limitations: [
        "Cropping is rectangular only — no freeform paths or rotation.",
        "If the ratio needs more height than the image has, the height is clamped rather than padded.",
        "The preview shows the result, not a draggable bounding box.",
      ],
      faqs: [
        { q: "Does cropping change the file size?", a: "Yes, fewer pixels means a smaller file, usually by roughly the area removed." },
        { q: "Can I crop from the exact centre?", a: "Yes — centre and middle anchors do that." },
        { q: "What ratio should a social post be?", a: "4:5 for Instagram, 1.91:1 for link previews, 9:16 for stories and reels." },
      ],
    },
  },
  {
    slug: "image-format-converter",
    name: "Image Format Converter",
    category: "images",
    tagline: "Convert between PNG, JPEG and WebP with a live preview.",
    intent: "convert image format",
    keywords: ["image converter", "png to jpg", "convert image format", "jpeg to webp"],
    status: "live",
    actions: ["download"],
    effort: "instant",
    popularity: 88,
    addedAt: "2025-11-02",
    seoTitle: "Image Format Converter — PNG, JPEG and WebP",
    seoDescription:
      "Convert images between PNG, JPEG and WebP in your browser. Choose the output format and quality, compare file sizes and download the converted file.",
    content: {
      intro: [
        "Format conversion is usually a compatibility decision: a portal demands JPEG, a designer wants lossless PNG, a performance audit asks for WebP.",
        "This converter reads the image with the browser and re-encodes it in your chosen format, so nothing is uploaded and no software is installed.",
      ],
      howTo: [
        "Pick the output format.",
        "Add an image.",
        "Adjust quality for JPEG or WebP if the file size matters.",
        "Download the converted file.",
      ],
      method: {
        title: "What changes and what does not",
        paragraphs: [
          "Pixel dimensions, framing and colour content carry across. What changes is the encoding: PNG is lossless, JPEG is lossy, WebP can be either.",
          "Transparency survives PNG and WebP but is lost in JPEG, so the tool fills the background with a colour you choose.",
        ],
        formula: "canvas → toBlob(targetFormat, quality)",
      },
      examples: [
        { title: "A logo PNG to WebP", steps: ["Choose WebP at quality 0.9."], result: "a much smaller file with transparency intact" },
        { title: "A photo to JPEG for a form", steps: ["Choose JPEG at 0.85."], result: "compatible file, usually smaller than the PNG" },
      ],
      limitations: [
        "Animated GIF and WebP frames are flattened to the first frame.",
        "EXIF metadata, including orientation and GPS, is not carried into the new file.",
        "Converting to a lossy format cannot be undone by converting back.",
      ],
      faqs: [
        { q: "Which format is smallest?", a: "Usually WebP, then JPEG, then PNG for photographs. For flat graphics PNG can beat JPEG." },
        { q: "Can I convert HEIC?", a: "Only if your browser can decode it — Safari can; most Chromium builds cannot." },
        { q: "Is the quality lost?", a: "Only when converting to a lossy format, and only once per conversion. Repeated lossy conversions do degrade the image." },
      ],
    },
  },
  {
    slug: "jpg-to-png-converter",
    name: "JPG to PNG Converter",
    category: "images",
    tagline: "Convert a JPEG to a lossless PNG locally, with no visible quality loss.",
    intent: "convert jpg to png",
    keywords: ["jpg to png", "jpeg to png converter", "convert jpg to png", "png converter"],
    status: "live",
    actions: ["download"],
    effort: "instant",
    popularity: 83,
    addedAt: "2025-11-02",
    seoTitle: "JPG to PNG Converter — Lossless and Private",
    seoDescription:
      "Convert JPG or JPEG files to PNG in your browser. The conversion is lossless, works offline once loaded, and the file is never uploaded.",
    content: {
      intro: [
        "PNG is the format to pick when a downstream tool refuses JPEG, when you need lossless editing, or when a site requires PNG uploads for logos.",
        "Note the direction: JPEG detail was already discarded when the photo was taken, so converting to PNG preserves what is left rather than restoring anything.",
      ],
      howTo: [
        "Add one or more JPEG files.",
        "Keep the default PNG output.",
        "Download the converted file.",
        "Check the size difference — PNG files are usually larger.",
      ],
      method: {
        title: "Lossless re-encoding",
        paragraphs: [
          "The JPEG is decoded into pixels, then encoded as PNG with no further loss. The pixel values are preserved exactly, though JPEG artefacts already in the source remain.",
          "Because PNG does not throw detail away, the file grows — often two to five times — which is the trade for losslessness.",
        ],
        formula: "JPEG pixels → PNG (lossless)",
      },
      examples: [
        { title: "A logo received as JPEG", steps: ["Convert to PNG.", "Replace the original on the site."], result: "no further generation loss when edited" },
        { title: "A photo for a PNG-only portal", steps: ["Convert and upload."], result: "accepted, larger file" },
      ],
      limitations: [
        "File size usually increases significantly.",
        "JPEG artefacts cannot be removed by the conversion.",
        "EXIF metadata is dropped.",
      ],
      faqs: [
        { q: "Does JPG to PNG improve quality?", a: "No. It prevents further loss; the detail JPEG already discarded is gone." },
        { q: "Why did the file get bigger?", a: "PNG stores lossless pixel data, which is less compressible than JPEG's lossy encoding." },
        { q: "Will transparency appear?", a: "No. JPEG has no alpha channel, so the whole frame is opaque." },
      ],
    },
  },
  {
    slug: "png-to-jpg-converter",
    name: "PNG to JPG Converter",
    category: "images",
    tagline: "Convert PNG to JPEG and cut the file size, with a background colour for transparency.",
    intent: "convert png to jpg",
    keywords: ["png to jpg", "png to jpeg converter", "convert png to jpg", "reduce png size"],
    status: "live",
    actions: ["download"],
    effort: "instant",
    popularity: 84,
    addedAt: "2025-11-02",
    seoTitle: "PNG to JPG Converter — Smaller Files, Any Browser",
    seoDescription:
      "Convert PNG screenshots and photos to JPEG in your browser. Choose the quality, set a background for transparent areas, and download a much smaller file.",
    content: {
      intro: [
        "PNG screenshots and exported graphics are often several megabytes; the same image as a JPEG at sensible quality is a fraction of that. This converter makes the swap without an upload.",
        "Transparency needs a decision: JPEG has no alpha channel, so transparent pixels are filled with the background colour you choose.",
      ],
      howTo: [
        "Add a PNG, WebP or other image file.",
        "Set the JPEG quality — 0.85 is a good default.",
        "Choose a background colour if the image has transparency.",
        "Download the JPEG.",
      ],
      method: {
        title: "Flattening and encoding",
        paragraphs: [
          "The canvas is filled with the background colour first, then the image is drawn on top, which flattens any alpha into solid pixels. The result is encoded as JPEG at the chosen quality.",
          "JPEG is designed for photographs. Flat areas of colour and sharp text edges show artefacts sooner, so screenshots with text often look better left as PNG.",
        ],
        formula: "fill background → draw image → toBlob('image/jpeg', quality)",
      },
      examples: [
        { title: "A 3 MB screenshot", steps: ["Convert at quality 0.85."], result: "often under 500 KB, with slight text softening" },
        { title: "A logo with transparency", steps: ["Set a white background, convert."], result: "clean white box behind the mark" },
      ],
      limitations: [
        "Transparency is lost and replaced by the chosen colour.",
        "Text and line art may look softer than the PNG original.",
        "Each conversion to JPEG is lossy; keep the PNG source.",
      ],
      faqs: [
        { q: "What quality should I use?", a: "0.8–0.9 for photos, but keep PNG for screenshots and text-heavy graphics." },
        { q: "Why is my transparent logo now a black box?", a: "Black is the default fill in some tools. Choose a background colour that matches the page it will sit on." },
        { q: "Can I convert back to PNG later?", a: "Yes, but the JPEG compression will already be baked in." },
      ],
    },
  },
  {
    slug: "webp-converter",
    name: "WebP Converter",
    category: "images",
    tagline: "Convert any image to WebP, the format that usually wins on size.",
    intent: "convert image to webp",
    keywords: ["webp converter", "convert to webp", "webp image", "jpg to webp"],
    status: "live",
    actions: ["download"],
    effort: "instant",
    popularity: 81,
    addedAt: "2025-11-02",
    seoTitle: "WebP Converter — Convert Images to WebP Online",
    seoDescription:
      "Convert JPG, PNG and other images to WebP in the browser. Choose the quality, keep transparency and see how much smaller the file becomes.",
    content: {
      intro: [
        "WebP exists to make web images smaller. It typically beats JPEG by 25–35% at the same visual quality and supports transparency, which JPEG cannot.",
        "Browser support is now effectively universal, so the remaining reason to keep a JPEG is an older pipeline or a tool that refuses WebP.",
      ],
      howTo: [
        "Add an image.",
        "Choose a quality setting — 0.8 is a good starting point.",
        "Compare the new size with the original.",
        "Download the WebP file.",
      ],
      method: {
        title: "Lossy or lossless WebP",
        paragraphs: [
          "The browser's encoder produces lossy WebP at the quality value you choose. Transparency is preserved, so icons and logos survive the conversion.",
          "WebP also supports lossless mode, which this tool does not expose; for flat graphics PNG often competes well anyway.",
        ],
        formula: "toBlob('image/webp', quality)",
      },
      examples: [
        { title: "A 900 KB JPEG hero image", steps: ["Convert at 0.8."], result: "typically 300–500 KB with no visible difference" },
        { title: "A transparent PNG icon", steps: ["Convert at 0.9."], result: "smaller file, transparency intact" },
      ],
      limitations: [
        "Some legacy CMS uploads and email clients still reject WebP.",
        "Animated WebP is flattened to a still frame.",
        "Repeated lossy conversions compound quality loss.",
      ],
      faqs: [
        { q: "Is WebP safe for the web?", a: "Yes: all current major browsers support it, including Safari 14 and later." },
        { q: "Does WebP support transparency?", a: "Yes, unlike JPEG. That makes it a good fit for logos with transparent backgrounds." },
        { q: "Should I keep the original?", a: "Yes — keep the highest-quality source and regenerate WebP derivatives from it." },
      ],
    },
  },
  {
    slug: "image-to-base64-converter",
    name: "Image to Base64 Converter",
    category: "images",
    tagline: "Turn an image into a data URL, base64 string, CSS rule or img tag.",
    intent: "convert image to base64",
    keywords: ["image to base64", "base64 encoder image", "data url image", "base64 css"],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 79,
    addedAt: "2025-11-02",
    seoTitle: "Image to Base64 Converter — Data URL and CSS Output",
    seoDescription:
      "Encode an image as base64 for inline CSS, HTML or an API payload. Choose raw base64, a data URL, a CSS rule or an img tag, and copy the result.",
    content: {
      intro: [
        "Inline base64 removes a network request at the cost of a larger document. It is worth it for a small icon or a logo in an email template, and a bad idea for a hero image.",
        "This tool produces the four shapes people actually paste: the raw string, the data URL, a CSS background rule and an img tag.",
      ],
      howTo: [
        "Add an image file.",
        "Choose the output shape you need.",
        "Copy the generated text.",
        "Paste it into your CSS, HTML or API request.",
      ],
      method: {
        title: "The 4/3 expansion",
        paragraphs: [
          "Base64 represents every three bytes as four ASCII characters, so the encoded text is about 33% larger than the binary file. Gzip usually recovers much of that, but the payload is still larger than a separate cached file.",
          "A data URL adds a small MIME prefix: data:image/png;base64, followed by the encoded bytes.",
        ],
        formula: "base64 length ≈ file size × 1.37",
      },
      examples: [
        { title: "A 4 KB SVG icon", steps: ["Choose CSS output and paste into a stylesheet."], result: "no extra request for a tiny asset" },
        { title: "An inline email logo", steps: ["Choose data URL and paste into the img src."], result: "renders without blocking on remote images" },
      ],
      limitations: [
        "Large images produce very long strings that are hard to edit and slow to parse.",
        "Inline data cannot be cached separately from the document.",
        "Some tools and email clients truncate very long attribute values.",
      ],
      faqs: [
        { q: "Is base64 smaller than a file?", a: "No, it is about a third larger. Its benefit is fewer requests, not fewer bytes." },
        { q: "Which images suit inlining?", a: "Icons and logos under about 5 KB. Anything larger is usually better as a separate cached file." },
        { q: "Does it work for SVG?", a: "Yes, though URL-encoding the SVG markup is often smaller than base64 for text-based files." },
      ],
    },
  },
  {
    slug: "base64-to-image-converter",
    name: "Base64 to Image Converter",
    category: "images",
    tagline: "Decode a base64 string or data URL back into a viewable, downloadable image.",
    intent: "decode base64 image",
    keywords: ["base64 to image", "decode base64 image", "data url decoder", "base64 image viewer"],
    status: "live",
    actions: ["download", "copy"],
    effort: "instant",
    popularity: 74,
    addedAt: "2025-11-02",
    seoTitle: "Base64 to Image — Decode Data URLs and Strings",
    seoDescription:
      "Paste a base64 image string or data URL to preview and download the original file. The type and decoded size are detected automatically.",
    content: {
      intro: [
        "Base64 turns up in API responses, CSS files, database dumps and email templates, where it is unreadable until something decodes it. This tool decodes in the page and shows you the picture straight away.",
        "Both a full data URL and a bare base64 body are accepted, and line breaks from copy-paste are ignored.",
      ],
      howTo: [
        "Paste the base64 string or data URL.",
        "Check the detected MIME type.",
        "Preview the decoded image.",
        "Download it or copy the size details.",
      ],
      method: {
        title: "Decoding and type detection",
        paragraphs: [
          "A data URL carries its MIME type explicitly. A bare base64 string does not, so the tool assumes PNG and relies on the browser's decoder to reject anything invalid.",
          "The string is converted to bytes, wrapped in a Blob with that type, and handed to an object URL for preview and download.",
        ],
        formula: "atob(base64) → Uint8Array → Blob(type) → object URL",
      },
      examples: [
        { title: "A logo from an API response", steps: ["Paste the value of the data field.", "Download the PNG."], result: "a usable image file" },
        { title: "A screenshot from a bug report", steps: ["Paste the data URL from the ticket."], result: "the screenshot, previewed locally" },
      ],
      limitations: [
        "A bare string with no data URL prefix loses its original file type unless it really is a PNG.",
        "Very large strings can be slow to decode in the browser.",
        "The tool does not validate that the bytes are a legitimate image before attempting to decode.",
      ],
      faqs: [
        { q: "Why does my JPEG download as .png?", a: "Without a data URL prefix the type is unknown, so PNG is assumed. Rename the file or use the prefixed string." },
        { q: "Is anything uploaded?", a: "No. Decoding happens entirely in the page." },
        { q: "Can it decode other file types?", a: "Only images are previewed, though the underlying decode would work for any base64 blob." },
      ],
    },
  },
  {
    slug: "image-color-picker",
    name: "Image Color Picker",
    category: "images",
    tagline: "Click any pixel to read its exact hex, RGB and HSL values.",
    intent: "pick a colour from an image",
    keywords: ["image color picker", "eyedropper tool", "pick color from image", "hex color picker"],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 76,
    addedAt: "2025-11-02",
    seoTitle: "Image Color Picker — Eyedropper for Hex, RGB and HSL",
    seoDescription:
      "Load an image and click to sample exact pixel colours in hex, RGB and HSL. Values are copied with one click, and nothing is uploaded.",
    content: {
      intro: [
        "Matching a brand colour from a logo, or finding the hex of a sky you like, needs an eyedropper. Browser-native pickers only sample the page, so this tool reads the pixels of a file you choose.",
        "Each sample is kept in a short list with hex, RGB and HSL so you can compare tones before committing to one.",
      ],
      howTo: [
        "Choose an image.",
        "Click anywhere on it to sample that pixel.",
        "Read the hex, RGB and HSL values.",
        "Copy the format your code needs.",
      ],
      method: {
        title: "Reading pixels",
        paragraphs: [
          "The image is drawn to a canvas scaled to fit the screen, and the click coordinates are mapped back to canvas pixels. getImageData reads the exact RGBA values at that point.",
          "HSL is derived from RGB by the standard conversion, which is why the hue jumps around in near-grey areas — hue is undefined when saturation is zero.",
        ],
        formula: "hex = #RRGGBB from the sampled RGBA pixel",
      },
      examples: [
        { title: "Sampling a logo", steps: ["Click the solid part of the mark."], result: "the exact brand hex" },
        { title: "Building a palette", steps: ["Sample four areas of a photo."], result: "a starting palette for a layout" },
      ],
      limitations: [
        "Samples are affected by the display scaling of the preview, not the original full-resolution pixel grid.",
        "Anti-aliased edges and compression noise mean neighbouring pixels can differ noticeably.",
        "No colour-blindness or contrast checking is included — use the Colour Code Converter for contrast ratios.",
      ],
      faqs: [
        { q: "Why is the sampled colour slightly off?", a: "The preview is scaled to fit the screen, so a click can land between original pixels. Zoom the source image if precision matters." },
        { q: "Can I sample a webpage?", a: "Not directly — take a screenshot, then load the screenshot here." },
        { q: "What is HSL useful for?", a: "Adjusting one property at a time: hue for the colour family, saturation for intensity, lightness for tints and shades." },
      ],
    },
  },
  {
    slug: "image-resolution-checker",
    name: "Image Resolution Checker",
    category: "images",
    tagline: "Pixel dimensions, megapixels, aspect ratio and printable sizes at a glance.",
    intent: "check image resolution",
    keywords: ["image resolution checker", "check image size", "megapixels", "print size calculator"],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 73,
    addedAt: "2025-11-02",
    seoTitle: "Image Resolution Checker — Dimensions and Print Sizes",
    seoDescription:
      "Check an image's pixel dimensions, megapixels, aspect ratio and the largest print size it supports at 150 and 300 dpi, without uploading the file.",
    content: {
      intro: [
        "Resolution questions are really two questions: how many pixels does the file contain, and how large can that be printed without visible softness. This checker answers both for any image you drop in.",
        "It also shows the simplified aspect ratio, which is what decides whether a print or a social crop will need to trim the frame.",
      ],
      howTo: [
        "Add an image file.",
        "Read the pixel dimensions and megapixels.",
        "Check the aspect ratio against the target you need.",
        "Compare the print sizes at 150 and 300 dpi.",
      ],
      method: {
        title: "Pixels, megapixels and dpi",
        paragraphs: [
          "Megapixels are width × height ÷ 1,000,000. Printable size is pixels ÷ dpi, so a 3000 px wide image at 300 dpi prints 10 inches wide.",
          "The aspect ratio is reduced by dividing both dimensions by their greatest common divisor: 4032 × 3024 becomes 4:3.",
        ],
        formula: "print inches = pixels ÷ dpi",
      },
      examples: [
        { title: "A 4032 × 3024 phone photo", steps: ["Read the dimensions.", "Divide by 300."], result: "12.2 MP, prints 13.4 × 10.1 inches at 300 dpi" },
        { title: "A 1200 × 630 social image", steps: ["Check the ratio."], result: "1.9:1, matching Open Graph" },
      ],
      limitations: [
        "Only pixel dimensions are measured; optical sharpness and noise are not assessed.",
        "The dpi stored in metadata does not change the pixel count.",
        "Viewing distance changes what counts as acceptable — a billboard is printed at a low dpi.",
      ],
      faqs: [
        { q: "How many megapixels do I need for a print?", a: "About 2 MP for a 6 × 4 inch print at 300 dpi, 8 MP for A4, and 24 MP for a 16 × 12 inch print." },
        { q: "Does a higher dpi make an image sharper?", a: "No. It only changes how tightly the same pixels are packed on paper." },
        { q: "What is a good resolution for the web?", a: "1200–1600 px on the long edge covers most layouts without wasting bandwidth." },
      ],
    },
  },
  {
    slug: "image-dpi-calculator",
    name: "Image DPI Calculator",
    category: "images",
    tagline: "Convert between pixels, print size and dpi in either direction.",
    intent: "calculate image dpi for printing",
    keywords: ["dpi calculator", "ppi calculator", "print size calculator", "pixels to inches"],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 69,
    addedAt: "2025-11-02",
    seoTitle: "DPI Calculator — Pixels, Print Size and Resolution",
    seoDescription:
      "Work out the dpi of a print from its pixel dimensions and intended size, or the largest print a given dpi allows. Includes a table of common print sizes.",
    content: {
      intro: [
        "Pixels are fixed; dpi is a choice about how tightly to pack them. The same 3000 px file is 300 dpi at 10 inches wide and 150 dpi at 20 inches — one is sharp, the other is soft.",
        "This calculator solves in either direction, which covers both the \"will this print well?\" and \"what size should I export?\" questions.",
      ],
      howTo: [
        "Enter the pixel dimensions.",
        "Choose whether to solve for dpi or for print size.",
        "Enter the known value — print width, or dpi.",
        "Read the result, plus a table of sizes at common resolutions.",
      ],
      method: {
        title: "The arithmetic",
        paragraphs: [
          "Dots per inch equals pixel width divided by print width in inches. Print width equals pixel width divided by dpi. Height follows the same rule, which is why the aspect ratio is preserved automatically.",
          "300 dpi is the traditional target for offset printing; 150 dpi is acceptable for posters and large formats, and screens care about CSS pixels rather than dpi at all.",
        ],
        formula: "dpi = pixels ÷ inches   ·   inches = pixels ÷ dpi",
      },
      examples: [
        { title: "3000 × 2000 px printed 10 inches wide", steps: ["3000 ÷ 10"], result: "300 dpi — print quality", },
        { title: "The same file at 600 dpi", steps: ["3000 ÷ 600"], result: "5 × 3.3 inches" },
      ],
      limitations: [
        "Assumes the print exactly matches the image aspect ratio; a different ratio crops or pads.",
        "Does not account for printer driver resampling, which can hide low-resolution sources.",
        "Only affects output, never the file's true detail.",
      ],
      faqs: [
        { q: "What is the difference between dpi and ppi?", a: "Strictly, ppi describes image pixels per inch and dpi describes printer dots per inch. In everyday use they are used interchangeably." },
        { q: "Is 150 dpi enough?", a: "For posters and images seen from a metre away, yes. For a hand-held print, 300 dpi looks noticeably better." },
        { q: "Can I increase dpi without losing quality?", a: "Not by changing the metadata. You need a genuinely higher-resolution source or a careful upsample, which cannot invent detail." },
      ],
    },
  },
  {
    slug: "image-metadata-viewer",
    name: "Image Metadata Viewer",
    category: "images",
    tagline: "File details, camera metadata and dominant colours in one inspection.",
    intent: "view image metadata",
    keywords: ["image metadata viewer", "photo metadata", "exif viewer", "dominant colours"],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 70,
    addedAt: "2025-11-02",
    seoTitle: "Image Metadata Viewer — EXIF and Dominant Colours",
    seoDescription:
      "Inspect an image's file details, EXIF metadata and dominant colour palette in the browser. Nothing is uploaded and metadata is not retained.",
    content: {
      intro: [
        "Metadata tells you where a photo came from; dominant colours tell you how it will behave in a layout. Both are useful before publishing, and both can be read without uploading the file.",
        "This viewer combines the two and copies the metadata out as plain text for a caption, alt text or a bug report.",
      ],
      howTo: [
        "Choose an image file.",
        "Read the file details and dimensions.",
        "Check the EXIF table if the camera wrote one.",
        "Use the colour swatches to build a palette.",
      ],
      method: {
        title: "Reading and summarising",
        paragraphs: [
          "File properties come from the File object, dimensions from decoding, and EXIF from the APP1 segment of JPEGs or the eXIf chunk of PNGs. Dominant colours are found by bucketing sampled pixels into a coarse RGB grid and counting the largest buckets.",
          "The colour percentages are shares of the sampled pixels, not of the file size.",
        ],
        formula: "coarse RGB buckets → largest shares → hex",
      },
      examples: [
        { title: "A photo direct from a camera", steps: ["Load the JPEG.", "Read camera, lens and capture date."], result: "full EXIF detail" },
        { title: "An image from a social platform", steps: ["Load the downloaded file."], result: "usually no EXIF — the platform stripped it" },
      ],
      limitations: [
        "Reads only EXIF; IPTC, XMP and MakerNote blocks are not parsed.",
        "Colours are quantised to 16-level buckets, so close shades merge.",
        "GPS tags are not surfaced, deliberately, to avoid displaying a location by accident.",
      ],
      faqs: [
        { q: "Does this show where a photo was taken?", a: "No. GPS tags are deliberately not displayed or retained." },
        { q: "Why is there no metadata?", a: "Many platforms strip it on upload, and PNG files often have none to begin with." },
        { q: "Can I remove metadata before publishing?", a: "Converting the image here, or through the compressor, produces a new file without EXIF." },
      ],
    },
  },
  {
    slug: "exif-data-viewer",
    name: "EXIF Data Viewer",
    category: "images",
    tagline: "Camera, lens and exposure settings from a photo, parsed byte by byte.",
    intent: "read exif data",
    keywords: ["exif viewer", "read exif", "photo metadata", "camera settings from photo"],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 68,
    addedAt: "2025-11-02",
    seoTitle: "EXIF Viewer — Camera, Lens and Exposure Settings",
    seoDescription:
      "Read the EXIF data inside a JPEG or PNG: camera make and model, lens, shutter speed, aperture, ISO, focal length and capture date, with JSON export.",
    content: {
      intro: [
        "EXIF is how a photographer learns from an image: which lens, what shutter speed, which ISO. It is also how you can tell whether a photo came from the device it claims.",
        "This viewer parses the TIFF structure inside the file's metadata block directly, so it works offline and sends nothing anywhere.",
      ],
      howTo: [
        "Choose a JPEG or PNG file.",
        "Read the camera and exposure panels.",
        "Scroll the full tag table for anything else the camera wrote.",
        "Copy the JSON if you need the values elsewhere.",
      ],
      method: {
        title: "Inside the APP1 block",
        paragraphs: [
          "JPEG stores EXIF in an APP1 segment beginning with the characters Exif, followed by a TIFF header. The header declares byte order and points to an image file directory, which is a list of tagged values.",
          "This reader walks IFD0 and the EXIF sub-IFD, bounds-checking every offset. Values are decoded by type: ASCII strings, rationals for exposure and aperture, shorts for ISO and orientation.",
        ],
        formula: "APP1 → TIFF header → IFD0 → EXIF sub-IFD",
      },
      examples: [
        { title: "A holiday photo", steps: ["Load the JPEG."], result: "e.g. Canon EOS R6, 24-105mm, 1/250 s, ƒ/4, ISO 400" },
        { title: "A screenshot", steps: ["Load the PNG."], result: "no EXIF block, as expected" },
      ],
      limitations: [
        "MakerNote vendor blocks, XMP and IPTC are not decoded.",
        "GPS coordinates are intentionally not shown.",
        "Corrupt or truncated metadata is skipped rather than guessed at.",
      ],
      faqs: [
        { q: "Is EXIF still in my files?", a: "Only in the original. Almost every social platform and messaging app strips it on upload." },
        { q: "Can EXIF be edited or faked?", a: "Yes, easily. Treat metadata as evidence of what the file claims, not proof of provenance." },
        { q: "Why does the shutter speed say 1/250?", a: "Exposure time is stored as a rational number and formatted as a familiar fraction when it is below one second." },
      ],
    },
  },
  {
    slug: "favicon-generator",
    name: "Favicon Generator",
    category: "images",
    tagline: "A full favicon set — 16 to 512 px, plus a multi-resolution .ico — from one image.",
    intent: "generate a favicon",
    keywords: ["favicon generator", "favicon.ico", "apple touch icon", "site icon generator"],
    status: "live",
    actions: ["download"],
    effort: "quick",
    popularity: 80,
    addedAt: "2025-11-02",
    seoTitle: "Favicon Generator — ICO, PNG and Apple Touch Icons",
    seoDescription:
      "Turn a logo into a complete favicon set: 16, 32, 48, 64, 180, 192 and 512 px PNGs plus a multi-resolution favicon.ico, with the HTML to paste in.",
    content: {
      intro: [
        "A favicon is rendered at 16 px in a browser tab, which is smaller than most logos survive. Generating the whole set at once — including the .ico older systems still ask for — avoids the usual scramble later.",
        "This generator produces every size from one image, plus the HTML snippet that links them.",
      ],
      howTo: [
        "Upload a square logo or icon.",
        "Adjust padding so the mark does not touch the edges.",
        "Download favicon.ico and the PNG sizes you need.",
        "Paste the HTML snippet into your head tag.",
      ],
      method: {
        title: "How the set is built",
        paragraphs: [
          "Each size is drawn onto a square canvas with the padding you choose, then encoded as PNG. The 16, 32 and 48 px versions are packed into a single .ico file using PNG-compressed icon entries, which modern Windows and all browsers accept.",
          "The 180 px file is the iOS home-screen icon, 192 and 512 px serve Android and PWA manifests.",
        ],
        formula: "canvas → PNG per size → ICO header + entries",
      },
      examples: [
        { title: "A simple monogram", steps: ["Upload a 512 px square.", "Set padding to 10%."], result: "legible at 16 px" },
        { title: "A detailed illustration", steps: ["Upload and preview the 16 px tab icon."], result: "the detail disappears — simplify the mark" },
      ],
      limitations: [
        "No SVG output; some modern setups prefer an SVG favicon with a PNG fallback.",
        "Transparency is preserved unless you disable it, and some platforms prefer a solid background.",
        "The tool does not write a site.webmanifest file, though the snippet references one.",
      ],
      faqs: [
        { q: "Do I still need favicon.ico?", a: "For older browsers, Windows shortcuts and some feed readers, yes. It costs nothing to include." },
        { q: "What size should the source image be?", a: "At least 512 × 512, square, with a bold shape that reads at 16 px." },
        { q: "Why does my favicon look blurry?", a: "Usually because a large detailed image was scaled down by the browser. Upload a purpose-drawn simple mark instead." },
      ],
    },
  },
  {
    slug: "image-blur-tool",
    name: "Image Blur Tool",
    category: "images",
    tagline: "Apply a Gaussian-style blur to soften backgrounds or obscure detail.",
    intent: "blur an image",
    keywords: ["blur image", "blur photo online", "gaussian blur tool", "soften background"],
    status: "live",
    actions: ["download"],
    effort: "instant",
    popularity: 72,
    addedAt: "2025-11-02",
    seoTitle: "Image Blur Tool — Soften or Obscure Detail Online",
    seoDescription:
      "Blur an image by any radius in your browser. Useful for softening backgrounds and hiding incidental detail, with an honest note on what blur cannot protect.",
    content: {
      intro: [
        "A gentle blur pushes a busy background behind the subject, and a heavy blur hides detail that should not be read. Both are one slider away here.",
        "The important caveat is in the note: blur is not reliable redaction. For anything sensitive, cover the area with a solid block.",
      ],
      howTo: [
        "Load an image.",
        "Set a radius — 3 px softens, 20 px obscures.",
        "Check the preview at the size it will be viewed.",
        "Download the blurred PNG.",
      ],
      method: {
        title: "How the blur is applied",
        paragraphs: [
          "The canvas 2D context's filter property is set to blur(Npx) and the image is drawn once, which the browser implements as a separable Gaussian-style convolution.",
          "The output is a new PNG, so the original file is untouched and the blur is permanent in the download.",
        ],
        formula: "context.filter = 'blur(Npx)' → drawImage",
      },
      examples: [
        { title: "A distracting background", steps: ["Set 6 px."], result: "subject stays sharp-looking against a softer field" },
        { title: "Hiding a number plate", steps: ["Set 25 px and check closely."], result: "unreadable at normal size, but not guaranteed" },
      ],
      limitations: [
        "Blur cannot guarantee redaction; strong deconvolution techniques can sometimes recover shapes.",
        "Very large radii are slow on big images in some browsers.",
        "The blur applies to the whole frame, not a selected region.",
      ],
      faqs: [
        { q: "Is blurring safe for sensitive data?", a: "No. Use a solid rectangle when the information must not leak." },
        { q: "Can I unblur the result?", a: "Not from this file — the blur is baked in. Keep your original if you need it." },
        { q: "Why is my preview slow?", a: "Gaussian blur cost grows with pixel count and radius; resize first for very large photographs." },
      ],
    },
  },
  {
    slug: "image-pixelator",
    name: "Image Pixelator",
    category: "images",
    tagline: "Turn a photo into chunky blocks for a retro or mosaic effect.",
    intent: "pixelate an image",
    keywords: ["pixelate image", "mosaic effect", "pixel art filter", "censor image"],
    status: "live",
    actions: ["download"],
    effort: "instant",
    popularity: 67,
    addedAt: "2025-11-02",
    seoTitle: "Image Pixelator — Mosaic and Retro Block Effect",
    seoDescription:
      "Pixelate any image by choosing how many blocks span the long edge. Great for a mosaic effect or making a thumbnail unreadable at a glance.",
    content: {
      intro: [
        "Pixelation reduces an image to large colour blocks, which reads as retro, protective or deliberately crude depending on the block size.",
        "The implementation is a genuine downsample-and-upscale with smoothing disabled, not a grid drawn on top.",
      ],
      howTo: [
        "Load an image.",
        "Choose how many blocks should span the long edge.",
        "Check the preview — lower numbers give bigger blocks.",
        "Download the pixelated PNG.",
      ],
      method: {
        title: "Downscale, then upscale",
        paragraphs: [
          "The image is drawn into a tiny canvas whose dimensions are the block grid, then drawn back up to full size with image smoothing off. Each block becomes a flat average of the pixels it replaces.",
          "Block count is relative to the long edge, so the same setting looks consistent across landscape and portrait images.",
        ],
        formula: "block size ≈ long edge ÷ block count",
      },
      examples: [
        { title: "A retro avatar", steps: ["Set 32 blocks across."], result: "recognisable but chunky" },
        { title: "Obscuring a face", steps: ["Set 8 blocks across."], result: "unrecognisable at a glance, not forensic privacy" },
      ],
      limitations: [
        "Pixelation is a visual effect, not a security measure.",
        "Mosaic patterns are uniform; the tool cannot target one region.",
        "Extremely low block counts lose the subject entirely.",
      ],
      faqs: [
        { q: "Is pixelation reversible?", a: "Rarely for large blocks, more easily for small ones. Do not rely on it for sensitive data." },
        { q: "What is the difference from blur?", a: "Blur averages neighbouring pixels smoothly; pixelation replaces regions with a single flat colour." },
        { q: "Can I pixelate part of an image?", a: "Not here — the effect covers the whole frame." },
      ],
    },
  },
  {
    slug: "image-background-color-changer",
    name: "Image Background Color Changer",
    category: "images",
    tagline: "Replace or remove a flat background colour with a tolerance control.",
    intent: "change image background colour",
    keywords: ["change background colour", "replace background", "remove white background", "transparent background"],
    status: "live",
    actions: ["download"],
    effort: "quick",
    popularity: 75,
    addedAt: "2025-11-02",
    seoTitle: "Background Colour Changer — Replace or Remove",
    seoDescription:
      "Replace a flat background colour in an image, or make it transparent, with a tolerance slider. Ideal for product shots and logos on plain backgrounds.",
    content: {
      intro: [
        "Product photos and logos often arrive on a plain background that does not match the page. This tool replaces that colour, or erases it to transparency, using a tolerance that you control.",
        "It is honest about its limits: this is a colour match, not a subject cut-out. Gradient backgrounds and shadows will not be separated cleanly.",
      ],
      howTo: [
        "Load an image with a plain background.",
        "Pick the colour to target — usually the background itself.",
        "Raise the tolerance until the background is gone but the subject is intact.",
        "Choose a replacement colour, or make it transparent, then download.",
      ],
      method: {
        title: "Distance-based replacement",
        paragraphs: [
          "Every pixel is compared with the target colour in RGB space. If the straight-line distance is within the tolerance, the pixel is recoloured or made transparent.",
          "A tolerance of zero matches only the exact colour; 40–80 usually catches compression noise and subtle shadows without eating into the subject.",
        ],
        formula: "replace if √((r−r₀)² + (g−g₀)² + (b−b₀)²) ≤ tolerance × √3",
      },
      examples: [
        { title: "A white-background product photo", steps: ["Target white, tolerance 30."], result: "clean cut to transparency" },
        { title: "A logo on an off-white background", steps: ["Target the sampled off-white and increase tolerance."], result: "solid brand colour preserved" },
      ],
      limitations: [
        "No edge refinement or feathering, so anti-aliased edges may retain a halo.",
        "Multi-coloured or gradient backgrounds need a proper masking tool.",
        "Shadows cast on the background are partly solid colour and may be removed too.",
      ],
      faqs: [
        { q: "Can I remove a complicated background?", a: "Not reliably. This tool assumes a roughly uniform background colour." },
        { q: "What tolerance should I start with?", a: "20, then raise in steps of 10 while watching the subject edges." },
        { q: "Does it keep transparency?", a: "Yes, in transparent mode the output PNG has an alpha channel." },
      ],
    },
  },
  {
    slug: "image-dimension-calculator",
    name: "Image Dimension Calculator",
    category: "images",
    tagline: "Scale an image by percentage or target width and keep the ratio exact.",
    intent: "calculate new image dimensions",
    keywords: ["image dimension calculator", "aspect ratio calculator", "scale image dimensions", "resize ratio"],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 71,
    addedAt: "2025-11-02",
    seoTitle: "Image Dimension Calculator — Scale and Aspect Ratio",
    seoDescription:
      "Work out new pixel dimensions from a percentage or a target width, with the aspect ratio, megapixels and a table of common scale factors.",
    content: {
      intro: [
        "Before resizing, it helps to know what the numbers will be. This calculator takes an original size and a scale — percentage, target width or target height — and returns the exact dimensions.",
        "Nothing is uploaded because no image is needed: it is pure arithmetic, useful for planning exports and checking that a crop will fit.",
      ],
      howTo: [
        "Enter the original width and height.",
        "Choose to scale by percentage, width or height.",
        "Enter the scale value.",
        "Read the new dimensions, megapixels and aspect ratio.",
      ],
      method: {
        title: "Proportional scaling",
        paragraphs: [
          "Every dimension scales by the same factor, so the aspect ratio never changes. That is the whole point of proportional scaling and the reason images do not distort.",
          "Megapixels are width × height ÷ 1,000,000, which is why halving each dimension quarters the pixel count.",
        ],
        formula: "new width = width × scale   ·   new height = height × scale",
      },
      examples: [
        { title: "4032 × 3024 at 50%", steps: ["Halve both dimensions."], result: "2016 × 1512, a quarter of the pixels" },
        { title: "Target 1920 px wide", steps: ["1920 ÷ 4032 = 0.476."], result: "1920 × 1440" },
      ],
      limitations: [
        "Proportional scaling only; independent width and height would distort the image.",
        "Rounding can shift the ratio slightly at small sizes.",
        "It does not estimate the file size of the result.",
      ],
      faqs: [
        { q: "Why do megapixels drop so fast?", a: "Because pixels scale in two dimensions: half the width and half the height is a quarter of the pixels." },
        { q: "How do I find the aspect ratio?", a: "Divide both dimensions by their greatest common divisor, which the calculator does for you." },
        { q: "Does scaling up add detail?", a: "No, it interpolates existing pixels — the result looks softer than a true higher-resolution image." },
      ],
    },
  },
  {
    slug: "social-media-image-size-checker",
    name: "Social Media Image Size Checker",
    category: "images",
    tagline: "Compare an image with the recommended size for nine common placements.",
    intent: "check social media image sizes",
    keywords: ["social media image sizes", "instagram image size", "og image size", "image size checker"],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 77,
    addedAt: "2025-11-02",
    seoTitle: "Social Media Image Size Checker — 9 Placements",
    seoDescription:
      "Check an image against the recommended sizes for Instagram, X, LinkedIn, Facebook, YouTube, Pinterest and Open Graph, and see where it will be cropped.",
    content: {
      intro: [
        "Every platform crops to its own ratio, and the crop is often centred — so a tall image with the subject near the top loses it. Checking before publishing is cheaper than fixing afterwards.",
        "Drop an image in and the table compares it with nine common placements, flagging where the ratio matches and where it will be trimmed.",
      ],
      howTo: [
        "Load an image.",
        "Read your image's ratio and megapixels.",
        "Scan the table for placements with a matching ratio.",
        "Export at the recommended size for the platform you care about.",
      ],
      method: {
        title: "How the verdict is decided",
        paragraphs: [
          "A placement is an exact match when both dimensions equal the recommendation. It fits when the ratio is within 2% and the image is at least as large as recommended. Below that it is flagged as smaller than needed.",
          "Anything whose ratio differs by more than 2% will be cropped or letterboxed by the platform.",
        ],
        formula: "ratio match when |target − actual| ÷ target < 0.02",
      },
      examples: [
        { title: "A 1080 × 1350 portrait image", steps: ["Compare with Instagram portrait."], result: "exact match" },
        { title: "A 4000 × 3000 photo for Open Graph", steps: ["Check the ratio."], result: "4:3 versus 1.91:1 — expect a crop" },
      ],
      limitations: [
        "Recommendations change as platforms redesign; treat the table as a current guide.",
        "Only ratio and minimum size are checked, not safe areas for text or UI overlays.",
        "File size limits per platform are not evaluated.",
      ],
      faqs: [
        { q: "What size is an Open Graph image?", a: "1200 × 630 px at a 1.91:1 ratio is the widely used standard." },
        { q: "Does a larger image get downscaled well?", a: "Usually yes, if the ratio matches — platforms re-encode downloads to their own sizes." },
        { q: "Why is my Instagram story cropped?", a: "Stories are 9:16; a 4:5 image does not fill that frame, so the platform pads or trims it." },
      ],
    },
  },
];
