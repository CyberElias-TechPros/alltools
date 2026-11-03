import type { ToolDefinition } from "../types";

/**
 * docs/BLUEPRINT.md §E — PDF and document tools.
 *
 * Built on pdf-lib (editing) and pdf.js (rendering and text extraction), both
 * running in the page. The password tool is deliberately still planned: proper
 * AES encryption needs a dedicated crypto library and careful testing, and a
 * half-working lock on a confidential document is worse than none.
 */
export const pdfTools: ToolDefinition[] = [
  {
    slug: "pdf-merger",
    name: "PDF Merger",
    category: "pdf",
    tagline: "Combine several PDFs into one file, in the order you choose.",
    intent: "merge pdf files",
    keywords: ["pdf merger", "combine pdf", "join pdf files", "merge pdf online"],
    status: "live",
    actions: ["download"],
    effort: "instant",
    popularity: 94,
    addedAt: "2025-11-02",
    seoTitle: "PDF Merger — Combine PDF Files in Your Browser",
    seoDescription:
      "Merge two or more PDFs into a single document without uploading them. Pages keep their content, rotation and size, and the order follows your file list.",
    content: {
      intro: [
        "Merging is the most common PDF task and the one with the worst privacy record: most online mergers upload your documents to a server and keep them for an hour.",
        "This one assembles the file in your browser with pdf-lib. Add the PDFs, check the order, press Merge and download.",
      ],
      howTo: [
        "Add two or more PDF files.",
        "Check the order in the list — that is the page order.",
        "Remove any file you did not mean to add.",
        "Press Merge and download the combined document.",
      ],
      method: {
        title: "Copying pages between documents",
        paragraphs: [
          "Each source document is parsed, then its pages are copied into a new document. Copying rewrites the page objects and their resources, so the result is a genuinely independent file rather than a wrapper around several PDFs.",
          "Content, rotation and page size are preserved. Bookmarks, form fields, annotations and digital signatures are not carried across.",
        ],
        formula: "new document → copy pages from each source → save",
      },
      examples: [
        { title: "Joining a signed contract and its appendix", steps: ["Add both files.", "Merge."], result: "one 12-page document" },
        { title: "Combining monthly invoices", steps: ["Add twelve PDFs in date order.", "Merge and archive."], result: "a single year-end file" },
      ],
      limitations: [
        "Encrypted PDFs must be unlocked first — this tool cannot decrypt them.",
        "Interactive form fields and bookmarks are dropped.",
        "Very large files are limited by the memory of your browser tab, not by a server quota.",
      ],
      faqs: [
        { q: "Are my files uploaded?", a: "No. They are read with the File API and processed in the page." },
        { q: "Can I reorder pages after merging?", a: "Yes — use the PDF Page Reorder tool on the merged file." },
        { q: "Why is the merged file larger than the sum of parts?", a: "Shared resources such as fonts are duplicated per source. Re-saving with the PDF Compressor can reclaim some of that." },
      ],
    },
  },
  {
    slug: "pdf-splitter",
    name: "PDF Splitter",
    category: "pdf",
    tagline: "Split one PDF into several files by page ranges, downloaded separately.",
    intent: "split a pdf into multiple files",
    keywords: ["pdf splitter", "split pdf", "separate pdf pages", "extract pdf pages"],
    status: "live",
    actions: ["download"],
    effort: "quick",
    popularity: 90,
    addedAt: "2025-11-02",
    seoTitle: "PDF Splitter — Divide a PDF by Page Ranges",
    seoDescription:
      "Split a PDF into separate files by typing page ranges such as 1-3, 4-6. Each part downloads independently, and the document never leaves your device.",
    content: {
      intro: [
        "A 40-page scan often needs to become six smaller files for six people. Typing the ranges is faster than dragging page thumbnails, and it is exact.",
        "Each group you list becomes its own PDF. Nothing is uploaded, so confidential material stays on the machine it started on.",
      ],
      howTo: [
        "Add the PDF you want to split.",
        "Type groups separated by commas: 1-3, 4-6, 7.",
        "Check how many parts the tool will produce.",
        "Download each part from the list.",
      ],
      method: {
        title: "From ranges to files",
        paragraphs: [
          "Each comma-separated group is parsed into a page range, validated against the document length, then extracted into a new PDF. Ranges that overlap repeat pages rather than failing.",
          "A reversed range is corrected rather than rejected — 5-3 becomes 3-5, which is what the person typing it meant.",
        ],
        formula: "for each range → extract pages → save",
      },
      examples: [
        { title: "A 12-page report into chapters", steps: ["Enter 1-2, 3-8, 9-12."], result: "three files" },
        { title: "One page out of a contract", steps: ["Enter 7."], result: "a single-page PDF" },
      ],
      limitations: [
        "Files download one at a time; there is no zip bundle.",
        "Bookmarks are not preserved per part.",
        "Page numbers must exist in the source document.",
      ],
      faqs: [
        { q: "Can I split every page into its own file?", a: "Yes — list each page individually, or use the PDF Page Extractor repeatedly." },
        { q: "Does splitting reduce quality?", a: "No. Pages are copied, not re-rendered, so text and images are untouched." },
        { q: "What if my ranges overlap?", a: "Shared pages appear in both files, which is intentional." },
      ],
    },
  },
  {
    slug: "pdf-compressor",
    name: "PDF Compressor",
    category: "pdf",
    tagline: "Re-save a PDF with compressed object streams and remove orphaned data.",
    intent: "compress a pdf",
    keywords: ["pdf compressor", "reduce pdf size", "compress pdf online", "optimise pdf"],
    status: "live",
    actions: ["download"],
    effort: "instant",
    popularity: 88,
    addedAt: "2025-11-02",
    seoTitle: "PDF Compressor — Re-save and Optimise PDF Files",
    seoDescription:
      "Shrink a PDF by re-saving it with compressed object streams. Honest about the limits: text and images are never rasterised, so quality is untouched.",
    content: {
      intro: [
        "\"Compress PDF\" usually hides a decision: throw away image quality, or restructure the file. This tool does the second, which is lossless and safe, and it tells you when there was nothing to gain.",
        "If the file is still too big, the PDF File Size Reducer rebuilds pages as images — smaller, but no longer searchable.",
      ],
      howTo: [
        "Add the PDF.",
        "Read the original and re-saved sizes.",
        "Download if the size dropped.",
        "Try the reducer when the structure was already tight.",
      ],
      method: {
        title: "What structure compression does",
        paragraphs: [
          "PDF saves objects uncompressed unless asked otherwise. Object streams group and deflate them, and dropping orphaned objects removes leftovers from earlier edits.",
          "Embedded images are the bulk of most PDFs and are left untouched here, so a photo-heavy brochure will barely change.",
        ],
        formula: "save({ useObjectStreams: true })",
      },
      examples: [
        { title: "An old Word export", steps: ["Add the PDF and compare sizes."], result: "often 10–30% smaller" },
        { title: "A scanned report", steps: ["Compress, then check the note."], result: "little change — images dominate" },
      ],
      limitations: [
        "Cannot recompress embedded JPEG or JPX images.",
        "Does not subset fonts or drop optional content.",
        "Encrypted files must be unlocked first.",
      ],
      faqs: [
        { q: "Is anything lost?", a: "No visible content. The operation restructures how objects are stored." },
        { q: "Why did my file get bigger?", a: "Occasionally the rewritten structure is larger; the tool reports the real number so you can keep the original." },
        { q: "How do I make a big reduction?", a: "Use the PDF File Size Reducer, which rasterises pages at a chosen resolution." },
      ],
    },
  },
  {
    slug: "pdf-page-extractor",
    name: "PDF Page Extractor",
    category: "pdf",
    tagline: "Pull selected pages out of a PDF into a new document.",
    intent: "extract pages from a pdf",
    keywords: ["extract pdf pages", "pdf page extractor", "save pages from pdf", "pull pages out of pdf"],
    status: "live",
    actions: ["download"],
    effort: "instant",
    popularity: 84,
    addedAt: "2025-11-02",
    seoTitle: "PDF Page Extractor — Save Selected Pages",
    seoDescription:
      "Extract a page or a range from any PDF into a new file. Type ranges such as 1-3, 7 and download only those pages, without uploading the document.",
    content: {
      intro: [
        "Sharing three pages of a ninety-page report is easier than asking someone to scroll. Extraction copies just those pages into a fresh PDF.",
        "The original file on your device is never modified, so it is safe to keep the source and send the extract.",
      ],
      howTo: [
        "Add the PDF.",
        "Type the pages to keep, for example 2-4, 9.",
        "Check the page count in the result.",
        "Download the new document.",
      ],
      method: {
        title: "Copied, not re-rendered",
        paragraphs: [
          "Selected pages are copied into a new PDF document, keeping vector text, images and links. Nothing is flattened, so text stays selectable.",
          "Ranges are validated against the document: a page number that does not exist is rejected rather than silently ignored.",
        ],
        formula: "extract(ranges) → new PDF with only those pages",
      },
      examples: [
        { title: "Sending an appendix", steps: ["Enter 41-52."], result: "a 12-page extract" },
        { title: "A single signed page", steps: ["Enter 8."], result: "one page, signatures intact" },
      ],
      limitations: [
        "Form fields on extracted pages lose their interactivity.",
        "Cross-page links to pages that were not extracted break.",
        "Bookmarks are not carried over.",
      ],
      faqs: [
        { q: "Does this delete pages from the original?", a: "No — it creates a new file. Use the Page Reorder tool if you want to produce a version with pages removed." },
        { q: "Can I extract non-consecutive pages?", a: "Yes, list them: 1, 4, 7-9." },
        { q: "Will the extract keep the page size?", a: "Yes, each page keeps its own dimensions, even if the source mixes sizes." },
      ],
    },
  },
  {
    slug: "pdf-page-reorder-tool",
    name: "PDF Page Reorder Tool",
    category: "pdf",
    tagline: "Type the new page order to reorder, duplicate or drop pages.",
    intent: "reorder pdf pages",
    keywords: ["reorder pdf pages", "rearrange pdf", "move pdf pages", "delete pdf pages"],
    status: "live",
    actions: ["download"],
    effort: "instant",
    popularity: 78,
    addedAt: "2025-11-02",
    seoTitle: "PDF Page Reorder Tool — Rearrange or Remove Pages",
    seoDescription:
      "Rearrange PDF pages by typing the new order, such as 3, 1, 2. Duplicate a page by listing it twice, or delete one by leaving it out, then download the result.",
    content: {
      intro: [
        "Scanned documents often arrive backwards, with cover sheets in the middle or an appendix first. Instead of dragging thumbnails, type the order you want.",
        "Because the order is explicit, leaving a page out deletes it and repeating a page duplicates it — two jobs in one control.",
      ],
      howTo: [
        "Add the PDF and note the page count.",
        "Type the page numbers in the order you want.",
        "Repeat a number to duplicate a page.",
        "Download the reordered document.",
      ],
      method: {
        title: "Reading the order list",
        paragraphs: [
          "Each number in the list becomes the next page of the output, copied from that page of the source. This makes the operation easy to reason about: the output length equals the number of items you typed.",
          "Numbers outside 1 to the page count are rejected, so a typo cannot silently drop content.",
        ],
        formula: "output pages = [source[order[0]], source[order[1]], …]",
      },
      examples: [
        { title: "Moving a cover to the front", steps: ["Pages 12, 1-11 → type 12, 1, 2, 3 …"], result: "cover first" },
        { title: "Removing a blank page", steps: ["Leave page 5 out of the list."], result: "an 11-page document" },
      ],
      limitations: [
        "Manual typing for long documents is tedious; use ranges elsewhere to split instead.",
        "Bookmarks and links that point to moved pages are not updated.",
        "Rotation is preserved per page.",
      ],
      faqs: [
        { q: "Can I rotate and reorder at once?", a: "Do one operation, then the other — both tools accept the output of the previous step." },
        { q: "Does duplication increase the file size?", a: "Yes, although shared resources are often stored once." },
        { q: "What happens to annotations?", a: "They travel with their page, since the whole page object is copied." },
      ],
    },
  },
  {
    slug: "pdf-rotator",
    name: "PDF Rotator",
    category: "pdf",
    tagline: "Fix sideways or upside-down pages by rotating the whole document.",
    intent: "rotate pdf pages",
    keywords: ["rotate pdf", "turn pdf pages", "pdf rotator", "fix sideways pdf"],
    status: "live",
    actions: ["download"],
    effort: "instant",
    popularity: 82,
    addedAt: "2025-11-02",
    seoTitle: "PDF Rotator — Turn Pages 90°, 180° or 270°",
    seoDescription:
      "Rotate every page in a PDF by 90, 180 or 270 degrees to fix sideways scans. Text stays selectable because rotation is stored as page metadata.",
    content: {
      intro: [
        "A scanner set to the wrong feeder produces a document that is sideways on every page. Rotating the PDF fixes it for every viewer at once, without re-rendering anything.",
        "Because rotation is a page attribute, the text layer, links and image quality are untouched.",
      ],
      howTo: [
        "Add the PDF.",
        "Choose 90°, 180° or 270°.",
        "Check the rotation in the result summary.",
        "Download the corrected file.",
      ],
      method: {
        title: "Rotation is metadata",
        paragraphs: [
          "Each page carries a rotation angle that viewers apply when drawing. Adding 90 degrees replaces that angle, so the file needs no new image data and barely changes in size.",
          "Angles are kept within 0–359 by taking the remainder, so repeated rotations behave as expected.",
        ],
        formula: "newAngle = (currentAngle + rotation) mod 360",
      },
      examples: [
        { title: "A sideways scan", steps: ["Rotate 90° clockwise."], result: "upright pages, same file size" },
        { title: "An upside-down fax", steps: ["Rotate 180°."], result: "readable in every viewer" },
      ],
      limitations: [
        "Applies to every page, not a selection.",
        "Some scanners set a rotation that the PDF already compensates for, so check before applying.",
        "Rotating an already-correct page makes it wrong — the operation is not clever about content.",
      ],
      faqs: [
        { q: "Does rotating reduce quality?", a: "No. It changes an attribute, not the pixels." },
        { q: "Why do some pages look right and others not?", a: "Scanned batches often mix orientations; rotate the affected file separately." },
        { q: "Can I rotate a single page?", a: "Not with this tool — extract that page, rotate it, then merge it back." },
      ],
    },
  },
  {
    slug: "pdf-to-jpg-converter",
    name: "PDF to JPG Converter",
    category: "pdf",
    tagline: "Render PDF pages as JPEG images at the resolution you choose.",
    intent: "convert pdf to jpg",
    keywords: ["pdf to jpg", "pdf to image", "convert pdf pages to images", "pdf to jpeg"],
    status: "live",
    actions: ["download"],
    effort: "quick",
    popularity: 86,
    addedAt: "2025-11-02",
    seoTitle: "PDF to JPG Converter — Pages as JPEG Images",
    seoDescription:
      "Convert PDF pages to JPEG images in the browser. Choose the pages, resolution and quality, then download each rendered page — nothing is uploaded.",
    content: {
      intro: [
        "Sometimes a PDF needs to become an image: for a slide, a chat message, a design mock-up or a form that only accepts pictures.",
        "Pages are rendered by pdf.js at a scale you control, then encoded as JPEG. One download per page, named by page number.",
      ],
      howTo: [
        "Add a PDF.",
        "Choose the pages to render.",
        "Set the resolution — 2× is roughly 144 dpi.",
        "Download each page from the list.",
      ],
      method: {
        title: "Rendering and encoding",
        paragraphs: [
          "pdf.js draws each page onto a canvas at the requested scale, then canvas.toBlob encodes it as JPEG at your quality setting. 1× corresponds to 72 dpi, so 2× doubles both dimensions.",
          "Higher scales give sharper text but grow the file quadratically: 3× is nine times the pixels of 1×.",
        ],
        formula: "dpi ≈ 72 × scale",
      },
      examples: [
        { title: "A page for a slide deck", steps: ["Scale 2, quality 0.9."], result: "crisp on a projector" },
        { title: "A thumbnail preview", steps: ["Scale 0.8, quality 0.7."], result: "small and fast" },
      ],
      limitations: [
        "Text becomes pixels, so it is no longer selectable or searchable.",
        "Each page downloads separately; there is no zip archive.",
        "JPEG has no transparency; use the PNG converter if you need an alpha background.",
      ],
      faqs: [
        { q: "What resolution should I use?", a: "2× for screens, 3× for print, 1× for thumbnails." },
        { q: "Can I convert all pages at once?", a: "Yes — leave the page field as a full range; each page is offered as a separate download." },
        { q: "Why does my image look soft?", a: "Increase the scale. Text rendered at 1× is only 72 dpi." },
      ],
    },
  },
  {
    slug: "jpg-to-pdf-converter",
    name: "JPG to PDF Converter",
    category: "pdf",
    tagline: "Turn JPEG photos into a PDF, one page per image.",
    intent: "convert jpg to pdf",
    keywords: ["jpg to pdf", "jpeg to pdf", "image to pdf", "photos to pdf"],
    status: "live",
    actions: ["download"],
    effort: "instant",
    popularity: 89,
    addedAt: "2025-11-02",
    seoTitle: "JPG to PDF Converter — Photos to One PDF",
    seoDescription:
      "Combine JPEG photos into a single PDF in your browser. Each image becomes a page, with a choice of fitted, A4 or Letter page sizes and a margin.",
    content: {
      intro: [
        "Receipts, ID photos and scanned pages usually arrive as JPEGs and need to be sent as one document. This converter places each image on its own page, in the order you list them.",
        "JPEGs are embedded without re-encoding, so there is no quality loss — the PDF simply wraps the original image stream.",
      ],
      howTo: [
        "Add the photos in the order you want.",
        "Choose a page size or let each page fit its image.",
        "Set a margin if you want white space.",
        "Press Convert and download the PDF.",
      ],
      method: {
        title: "Embedding rather than re-encoding",
        paragraphs: [
          "pdf-lib embeds the JPEG bytes directly. Because JPEG is already a compressed format that PDF understands, no pixels are recomputed and the file size barely grows beyond the images themselves.",
          "With the fit option, the page takes the image's aspect ratio plus margins. A4 and Letter scale the image down to fit, centred, never cropping.",
        ],
        formula: "page size = image size + 2 × margin (fit mode)",
      },
      examples: [
        { title: "Five receipt photos", steps: ["Add all five, fit page size, margin 16."], result: "one five-page PDF" },
        { title: "Photos for a print shop", steps: ["A4 pages, margin 24."], result: "consistent page size" },
      ],
      limitations: [
        "Only JPEG images can be embedded without re-encoding; use the PNG converter for PNGs.",
        "Images are not auto-rotated beyond their EXIF orientation.",
        "No OCR — the result is still images.",
      ],
      faqs: [
        { q: "Does the image quality change?", a: "No. JPEG data is embedded as-is." },
        { q: "Can I add text captions?", a: "Not with this tool; use the Text to PDF converter and merge afterwards." },
        { q: "Why is one page a different size?", a: "In fit mode each page matches its image. Choose A4 or Letter for uniform pages." },
      ],
    },
  },
  {
    slug: "pdf-to-png-converter",
    name: "PDF to PNG Converter",
    category: "pdf",
    tagline: "Render PDF pages as lossless PNG images, with optional transparency.",
    intent: "convert pdf to png",
    keywords: ["pdf to png", "pdf to image", "convert pdf to png", "pdf page image"],
    status: "live",
    actions: ["download"],
    effort: "quick",
    popularity: 80,
    addedAt: "2025-11-02",
    seoTitle: "PDF to PNG Converter — Lossless Page Images",
    seoDescription:
      "Convert PDF pages to lossless PNG images at up to 5× scale. Keep a transparent background if you need it, and download each page separately.",
    content: {
      intro: [
        "PNG is the right choice when the page has fine text, line art or transparency. JPEG would smear the edges; PNG keeps them exact.",
        "Pages are rendered at the scale you choose, so the same tool covers a quick thumbnail or a high-resolution reference image.",
      ],
      howTo: [
        "Add a PDF.",
        "Choose the pages and a scale.",
        "Turn on transparency if you need an alpha background.",
        "Download the rendered pages.",
      ],
      method: {
        title: "Lossless rendering",
        paragraphs: [
          "Each page is drawn to a canvas by pdf.js and exported with canvas.toBlob as PNG, which stores every pixel exactly. A white backing is painted underneath first unless transparency is enabled.",
          "Because PNG is lossless, the files are several times larger than JPEG equivalents — the trade for crisp text.",
        ],
        formula: "scale × 72 dpi = effective resolution",
      },
      examples: [
        { title: "A diagram for a slide", steps: ["Scale 3, transparent background."], result: "crisp edges on any background" },
        { title: "Archiving page previews", steps: ["Scale 1.5, white background."], result: "readable thumbnails" },
      ],
      limitations: [
        "Large scales can exhaust memory on long documents.",
        "No OCR; the output is pixels only.",
        "One download per page.",
      ],
      faqs: [
        { q: "Why are PNGs so much bigger?", a: "Lossless compression cannot discard detail, so text-heavy pages produce large files." },
        { q: "What does transparency do?", a: "It leaves unpainted areas transparent instead of white, useful when placing a page over a coloured background." },
        { q: "Can I get vector output?", a: "No — rendering turns vectors into pixels. Use the page extractor to keep the original vectors." },
      ],
    },
  },
  {
    slug: "png-to-pdf-converter",
    name: "PNG to PDF Converter",
    category: "pdf",
    tagline: "Wrap PNG screenshots and graphics into a paginated PDF.",
    intent: "convert png to pdf",
    keywords: ["png to pdf", "image to pdf", "screenshot to pdf", "convert png to pdf"],
    status: "live",
    actions: ["download"],
    effort: "instant",
    popularity: 79,
    addedAt: "2025-11-02",
    seoTitle: "PNG to PDF Converter — Screenshots to PDF",
    seoDescription:
      "Combine PNG images into a single PDF. Each image becomes a page, transparency is preserved, and you can choose fitted, A4 or Letter pages.",
    content: {
      intro: [
        "Screenshots arrive as PNG and are awkward to share individually. Wrapping them into one PDF gives a document that opens the same way everywhere.",
        "PNG images are embedded as PNG, so crisp text and flat colours survive without JPEG artefacts.",
      ],
      howTo: [
        "Add the PNG files in order.",
        "Choose a page size, or fit each page to its image.",
        "Set a margin for breathing room.",
        "Convert and download.",
      ],
      method: {
        title: "Embedding PNG streams",
        paragraphs: [
          "pdf-lib embeds PNG data as Flate-compressed image objects with an alpha channel, so transparency survives into the PDF. No re-encoding takes place.",
          "In fit mode the page adopts the image dimensions plus margins; in A4 or Letter mode the image is scaled down and centred.",
        ],
        formula: "embedPng → drawImage → save",
      },
      examples: [
        { title: "Five UI screenshots", steps: ["Fit page mode, margin 12."], result: "one five-page PDF" },
        { title: "A transparent logo", steps: ["Fit page, margin 0."], result: "the logo floats on the page" },
      ],
      limitations: [
        "Transparent areas may render white in some viewers.",
        "Large PNGs produce large PDFs — convert to JPEG first if size matters.",
        "No text layer or OCR.",
      ],
      faqs: [
        { q: "Does PNG compression survive?", a: "The pixel data is preserved exactly; the PDF re-compresses it losslessly with Flate." },
        { q: "Can I mix PNG and JPEG?", a: "Add each type with its own converter, then merge the two PDFs." },
        { q: "Why is the PDF larger than the PNGs combined?", a: "PDF image objects add a small overhead per image, and some PNGs are stored with filters PDF does not share." },
      ],
    },
  },
  {
    slug: "pdf-metadata-viewer",
    name: "PDF Metadata Viewer",
    category: "pdf",
    tagline: "Read the title, author, producer, dates and page sizes of a PDF.",
    intent: "view pdf metadata",
    keywords: ["pdf metadata viewer", "pdf properties", "pdf author", "pdf info"],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 68,
    addedAt: "2025-11-02",
    seoTitle: "PDF Metadata Viewer — Title, Author and Producer",
    seoDescription:
      "Inspect the document properties inside a PDF: title, author, subject, creator, producer, creation date and page sizes, without uploading the file.",
    content: {
      intro: [
        "PDF metadata tells you what software produced a document and, sometimes, who wrote it. It is also a frequent source of accidental information leaks when files are published.",
        "This viewer reads the information dictionary and reports page sizes, so it doubles as a quick structural check.",
      ],
      howTo: [
        "Add a PDF.",
        "Read the property table.",
        "Check the creation date and producer for provenance.",
        "Copy the metadata as text if you need it in a report.",
      ],
      method: {
        title: "The information dictionary",
        paragraphs: [
          "Every PDF can carry a small dictionary of document properties: title, author, subject, keywords, creator, producer and two dates. This tool reads those fields and the page media boxes.",
          "Empty fields are normal. Many generators write only the producer string, and privacy tools deliberately clear the rest.",
        ],
        formula: "doc.getTitle() · getAuthor() · getProducer() · getCreationDate()",
      },
      examples: [
        { title: "A file from a design tool", steps: ["Inspect the producer."], result: "shows the export software and version" },
        { title: "A privacy-conscious export", steps: ["Check the author field."], result: "blank, as intended" },
      ],
      limitations: [
        "XMP metadata is not displayed, only the classic info dictionary.",
        "Values are shown as stored; some tools write unusual date formats.",
        "Reading metadata does not remove it — use a re-save or the metadata editor for that.",
      ],
      faqs: [
        { q: "Can metadata identify me?", a: "Sometimes. Author, company and original filename can all appear, which is why publishing tools often strip them." },
        { q: "Why is the title empty?", a: "Many exporters never set it, or the document was produced by a scanner that writes only a producer." },
        { q: "Is metadata editable?", a: "Yes, with any PDF editor. Treat it as a hint about provenance, not proof." },
      ],
    },
  },
  {
    slug: "pdf-page-counter",
    name: "PDF Page Counter",
    category: "pdf",
    tagline: "Count pages, measure file size and read each page's dimensions.",
    intent: "count pdf pages",
    keywords: ["pdf page counter", "how many pages in pdf", "pdf page count", "count pdf pages"],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 75,
    addedAt: "2025-11-02",
    seoTitle: "PDF Page Counter — Pages and Page Sizes",
    seoDescription:
      "Count the pages in a PDF, see the file size and bytes per page, and read the dimensions of the first pages. Fast, local and works on long documents.",
    content: {
      intro: [
        "Print quotas, upload limits and per-page pricing all start with the same question: how many pages is this?",
        "This counter reads the document structure directly, so it is accurate even for files with hundreds of pages, and it reports page dimensions too.",
      ],
      howTo: [
        "Add a PDF.",
        "Read the page count.",
        "Check the page dimensions if the document mixes sizes.",
        "Copy the summary for an email or a form.",
      ],
      method: {
        title: "Counting from the structure",
        paragraphs: [
          "The page tree in a PDF lists every page object. Counting its leaves gives the page total without rendering anything, which is why it is fast.",
          "Page dimensions come from each page's media box, measured in points: A4 is 595 × 842, US Letter is 612 × 792.",
        ],
        formula: "pages = number of leaves in the page tree",
      },
      examples: [
        { title: "A 240-page book proof", steps: ["Add the file."], result: "240 pages, 118 bytes per page is not unusual for text-only files" },
        { title: "A mixed scan", steps: ["Check the dimensions table."], result: "some pages Letter, some A4" },
      ],
      limitations: [
        "Encrypted documents must be unlocked first.",
        "Page count does not indicate content — blank pages count too.",
        "Only the first twelve page dimensions are listed.",
      ],
      faqs: [
        { q: "Does it work on huge PDFs?", a: "Yes, up to the memory your browser can hold for the file." },
        { q: "Why are two pages different sizes?", a: "Scanners and merged documents often mix A4 and Letter pages." },
        { q: "Can I count pages of several PDFs at once?", a: "Not here — use the Document Word Counter for a per-file summary, or add them one by one." },
      ],
    },
  },
  {
    slug: "pdf-to-text-extractor",
    name: "PDF to Text Extractor",
    category: "pdf",
    tagline: "Pull the text layer out of a PDF, page by page, ready to copy.",
    intent: "extract text from pdf",
    keywords: ["pdf to text", "extract text from pdf", "copy text from pdf", "pdf text converter"],
    status: "live",
    actions: ["copy"],
    effort: "quick",
    popularity: 85,
    addedAt: "2025-11-02",
    seoTitle: "PDF to Text Extractor — Copy the Text Layer",
    seoDescription:
      "Extract selectable text from a PDF in the browser, page by page. Copy the result or save it, with page markers to keep the structure clear.",
    content: {
      intro: [
        "Copying from a PDF by hand breaks lines and mangles spacing. Extracting the text layer gives you clean text with page markers so you can still find your place.",
        "It works only where the PDF has text: a scan is an image, and no amount of extraction will produce words from it.",
      ],
      howTo: [
        "Add a PDF.",
        "Optionally limit the pages.",
        "Keep page markers on to preserve structure.",
        "Copy the extracted text.",
      ],
      method: {
        title: "Reading the text layer",
        paragraphs: [
          "pdf.js exposes each page's text items with their positions. They are joined in reading order, which works well for single-column documents and poorly for multi-column layouts and tables.",
          "Page markers are inserted deliberately, because a single long block of text loses the structure that helped you navigate the document.",
        ],
        formula: "getTextContent() → items[].str → join",
      },
      examples: [
        { title: "An article for notes", steps: ["Extract, copy into a note."], result: "clean paragraphs, page markers" },
        { title: "A two-column academic PDF", steps: ["Extract and check the flow."], result: "lines may interleave — fix by extracting per page" },
      ],
      limitations: [
        "Scanned PDFs return nothing without OCR.",
        "Multi-column and table layouts lose their structure.",
        "Ligatures and unusual encodings can produce odd characters.",
      ],
      faqs: [
        { q: "Why is my text empty?", a: "The page has no text layer — it is an image. Run OCR first." },
        { q: "Does formatting survive?", a: "No. Bold, italics and tables are flattened; you get the words in order." },
        { q: "Can I convert to Word instead?", a: "Not directly. Copy the text into a document and apply styles there." },
      ],
    },
  },
  {
    slug: "text-to-pdf-converter",
    name: "Text to PDF Converter",
    category: "pdf",
    tagline: "Typeset plain text into a clean, paginated PDF with Helvetica.",
    intent: "convert text to pdf",
    keywords: ["text to pdf", "txt to pdf", "plain text to pdf", "write pdf online"],
    status: "live",
    actions: ["download"],
    effort: "instant",
    popularity: 77,
    addedAt: "2025-11-02",
    seoTitle: "Text to PDF Converter — Clean Paginated Document",
    seoDescription:
      "Turn notes, letters or essays into a paginated PDF with Helvetica, A4 or Letter pages and adjustable margins. Everything is generated in the browser.",
    content: {
      intro: [
        "Sometimes you need a PDF and you have text: a delivery note, a plain-language report, a manuscript draft. This tool typesets it with sensible line breaks and pagination.",
        "It deliberately does not try to be a word processor. Paragraph text, a title and page setup — nothing that would tempt you into expecting fonts, columns or images.",
      ],
      howTo: [
        "Paste the text.",
        "Add a title for the document properties.",
        "Choose A4 or Letter, a font size and a margin.",
        "Create the PDF and download it.",
      ],
      method: {
        title: "Wrapping and pagination",
        paragraphs: [
          "Each paragraph is wrapped to the width available at the chosen font size, using Helvetica's real metrics rather than a character count, so lines fill the page evenly.",
          "When the cursor reaches the bottom margin a new page is created, which is why the page count grows predictably with length.",
        ],
        formula: "lines per page ≈ (page height − 2 × margin) ÷ (font size × 1.45)",
      },
      examples: [
        { title: "A 900-word letter", steps: ["A4, 11pt, 56pt margin."], result: "two pages" },
        { title: "A long manuscript", steps: ["Paste 20,000 words, create."], result: "around 40 pages" },
      ],
      limitations: [
        "One font, no bold or italics.",
        "Images and tables are not supported.",
        "Non-Latin scripts need an embedded font, which this build does not include — accents in Latin-1 work, other scripts may not render.",
      ],
      faqs: [
        { q: "Can I control page breaks?", a: "No. Pagination follows the text flow; add blank lines to push content down." },
        { q: "Which fonts are used?", a: "Helvetica, a standard PDF font, so the file opens identically everywhere without embedding." },
        { q: "Why do accented characters fail?", a: "Standard fonts support Latin-1. Emoji and non-Latin scripts need a custom embedded font." },
      ],
    },
  },
  {
    slug: "pdf-watermark-tool",
    name: "PDF Watermark Tool",
    category: "pdf",
    tagline: "Stamp a text watermark across every page with adjustable opacity.",
    intent: "add a watermark to pdf",
    keywords: ["pdf watermark", "watermark pdf online", "add watermark to pdf", "draft stamp"],
    status: "live",
    actions: ["download"],
    effort: "instant",
    popularity: 76,
    addedAt: "2025-11-02",
    seoTitle: "PDF Watermark Tool — Diagonal DRAFT or CONFIDENTIAL",
    seoDescription:
      "Add a text watermark to every page of a PDF: choose the wording, size and opacity, and place it diagonally or horizontally. No upload, no account.",
    content: {
      intro: [
        "A watermark is a visible claim: draft, confidential, sample, unpaid. It should be obvious enough to work and light enough to read through.",
        "This tool draws real text on every page, so it survives printing and viewing in any reader.",
      ],
      howTo: [
        "Add the PDF.",
        "Type the watermark text.",
        "Set a low opacity — 0.15 to 0.25 is usually right.",
        "Choose diagonal or horizontal, then download.",
      ],
      method: {
        title: "Drawn on the page",
        paragraphs: [
          "The watermark is real text in Helvetica Bold, drawn over each page's content with the opacity you set and rotated 35 degrees when diagonal.",
          "Because it is text rather than an overlay layer, it prints everywhere and scales with the page, but it can also be removed by anyone with a PDF editor.",
        ],
        formula: "drawText(text, { opacity, rotate: 35° }) on every page",
      },
      examples: [
        { title: "A proposal marked DRAFT", steps: ["Text DRAFT, opacity 0.18, diagonal."], result: "clearly provisional, still readable" },
        { title: "A sample chapter", steps: ["Text SAMPLE, opacity 0.12."], result: "subtle but present on every page" },
      ],
      limitations: [
        "Text watermarks are removable — they deter casual sharing, not determined copying.",
        "Only standard-font Latin text is supported.",
        "The position is fixed at the centre of each page.",
      ],
      faqs: [
        { q: "Is a watermark secure?", a: "No. It is visible marking, not protection. Use password protection or redaction when secrecy matters." },
        { q: "Can I watermark one page?", a: "Not here — extract the page, watermark it, then merge it back." },
        { q: "Will it cover the text?", a: "At low opacity it sits behind the eye's attention while remaining visible; raise the opacity only for drafts you want to be unmistakable." },
      ],
    },
  },
  {
    slug: "pdf-file-size-reducer",
    name: "PDF File Size Reducer",
    category: "pdf",
    tagline: "Rebuild pages as compressed images to cut file size dramatically.",
    intent: "reduce pdf file size a lot",
    keywords: ["reduce pdf size", "pdf file size reducer", "shrink pdf", "compress scanned pdf"],
    status: "live",
    actions: ["download"],
    effort: "guided",
    popularity: 83,
    addedAt: "2025-11-02",
    seoTitle: "PDF File Size Reducer — Rasterise to Shrink Scans",
    seoDescription:
      "Cut a PDF's size by rebuilding each page as a JPEG at a chosen resolution, with optional grayscale. Best for scans; text stops being selectable.",
    content: {
      intro: [
        "When a scanned PDF is 40 MB because every page is a 600 dpi image, the only lever that really works is re-rendering those pages smaller. This tool does exactly that, at a resolution you pick.",
        "The trade is explicit: the output looks like the original but its text is no longer selectable or searchable. Use it for scans and archival copies, not for documents people need to search.",
      ],
      howTo: [
        "Add the PDF.",
        "Pick a render scale — 1.2 is a good balance for text.",
        "Set JPEG quality, and enable grayscale for pure text.",
        "Download the reduced file and compare with the original.",
      ],
      method: {
        title: "Rasterising pages",
        paragraphs: [
          "Each page is rendered by pdf.js at the chosen scale, optionally converted to grayscale, encoded as JPEG, and placed on a new PDF page of the same physical size. The result is a stack of images wrapped in a PDF.",
          "Size falls because JPEG is far more efficient at photographic content than the original's image streams, and because resolution is capped.",
        ],
        formula: "render(scale) → JPEG(quality) → new page",
      },
      examples: [
        { title: "A 42 MB scan", steps: ["Scale 1.2, quality 0.7, grayscale on."], result: "often under 5 MB" },
        { title: "A text report", steps: ["Scale 1.6, quality 0.85."], result: "modest saving; text becomes non-selectable" },
      ],
      limitations: [
        "Text, links and form fields are lost.",
        "Repeated rasterisation degrades quality — always keep the original.",
        "Long documents take a while; the page may feel busy while rendering.",
      ],
      faqs: [
        { q: "Will the text still be searchable?", a: "No. Rasterising turns text into pixels. If search matters, use the PDF Compressor instead." },
        { q: "What resolution should I use?", a: "1.2× for on-screen reading, 2× if it must stay legible when printed." },
        { q: "Why is grayscale so much smaller?", a: "Colour channels triple the data; a grayscale JPEG stores one channel instead of three." },
      ],
    },
  },
  {
    slug: "word-counter-for-pdf",
    name: "Word Counter for PDF",
    category: "pdf",
    tagline: "Count words, sentences and pages in a PDF, with a per-page breakdown.",
    intent: "count words in a pdf",
    keywords: ["pdf word counter", "word count pdf", "count words in pdf", "pdf character count"],
    status: "live",
    actions: ["copy"],
    effort: "quick",
    popularity: 81,
    addedAt: "2025-11-02",
    seoTitle: "PDF Word Counter — Words, Characters and Pages",
    seoDescription:
      "Count the words in a PDF's text layer, with characters, sentences, pages, words per page and an estimated reading time. No upload required.",
    content: {
      intro: [
        "Submission limits, translation quotes and editing rates are all priced by the word, and a PDF gives you no word count at all. This tool extracts the text layer and counts it.",
        "It reports words per page as well, which is a quick way to spot pages that are mostly images or that the extractor could not read.",
      ],
      howTo: [
        "Add the PDF.",
        "Read the totals: words, characters, pages.",
        "Check the per-page table for anomalies.",
        "Copy the count into a submission form.",
      ],
      method: {
        title: "What gets counted",
        paragraphs: [
          "Text is extracted page by page and joined, then split on whitespace. Hyphenated line breaks stay as single words with the hyphen, which slightly undercounts compared with a word processor that removes the break.",
          "Headers, footers and page numbers are included, because they are genuinely part of the text layer.",
        ],
        formula: "words = text.split(/\s+/).length",
      },
      examples: [
        { title: "A 20-page article", steps: ["Add the PDF."], result: "about 6,000 words, 300 per page" },
        { title: "A scanned manuscript", steps: ["Add the PDF and read the warning."], result: "0 words — no text layer" },
      ],
      limitations: [
        "A scanned PDF has no text layer and counts as zero.",
        "Footnotes, captions and references are included in the total.",
        "Different word processors count hyphenated compounds differently.",
      ],
      faqs: [
        { q: "Why is the count zero?", a: "The document is a scan. OCR is required before any tool can count its words." },
        { q: "Are references included?", a: "Yes — subtract them manually if your limit excludes them." },
        { q: "Is the file uploaded?", a: "No. Extraction happens in the browser with pdf.js." },
      ],
    },
  },
  {
    slug: "docx-to-pdf-converter",
    name: "DOCX to PDF Converter",
    category: "pdf",
    tagline: "Convert a Word document's text into a clean PDF, in the browser.",
    intent: "convert docx to pdf",
    keywords: ["docx to pdf", "word to pdf", "convert docx", "docx converter"],
    status: "live",
    actions: ["download"],
    effort: "quick",
    popularity: 87,
    addedAt: "2025-11-02",
    seoTitle: "DOCX to PDF Converter — Word Text to PDF",
    seoDescription:
      "Convert a .docx file to PDF without uploading it. Paragraph text and breaks are preserved; complex layout, tables and images are not.",
    content: {
      intro: [
        "A .docx is a ZIP archive full of XML, and the words live in one file inside it. This converter unpacks that file in the browser, extracts the paragraphs and typesets them as a PDF.",
        "It is honest about scope: this is a text conversion, not a Word layout engine. Documents whose design matters should be exported from Word, LibreOffice or Google Docs.",
      ],
      howTo: [
        "Choose a .docx file.",
        "Wait while the paragraphs are extracted and typeset.",
        "Download the PDF and check the page breaks.",
        "Keep the original document for future edits.",
      ],
      method: {
        title: "Reading the archive",
        paragraphs: [
          "The central directory of the ZIP is scanned for word/document.xml, decompressed with the browser's DecompressionStream, and stripped of markup. Each w:p element becomes a paragraph; runs of w:t are joined in order.",
          "The resulting text is then typeset with Helvetica, exactly as the Text to PDF tool does.",
        ],
        formula: "ZIP → word/document.xml → paragraphs → PDF",
      },
      examples: [
        { title: "A plain report", steps: ["Convert and review."], result: "a clean text PDF" },
        { title: "A designed brochure", steps: ["Convert and compare."], result: "text only — use Word to export" },
      ],
      limitations: [
        "No images, tables, columns, headers or footnotes.",
        "Bold and italic are not carried across.",
        "Very old .doc files are not supported; save as .docx first.",
      ],
      faqs: [
        { q: "Why does my formatting disappear?", a: "Only paragraph text is extracted. Layout would require a full Word renderer, which is a word processor's job." },
        { q: "Are my documents uploaded?", a: "No. The archive is read and decompressed in the page." },
        { q: "Does it work offline?", a: "Yes, once the page has loaded, provided the browser supports DecompressionStream." },
      ],
    },
  },
  {
    slug: "document-word-counter",
    name: "Document Word Counter",
    category: "pdf",
    tagline: "Count words across several PDFs, DOCX and text files at once.",
    intent: "count words across multiple documents",
    keywords: ["document word counter", "word count multiple files", "count words docx pdf", "manuscript word count"],
    status: "live",
    actions: ["copy"],
    effort: "quick",
    popularity: 74,
    addedAt: "2025-11-02",
    seoTitle: "Document Word Counter — PDF, DOCX and Text Files",
    seoDescription:
      "Add several PDF, DOCX, TXT or Markdown files to count words per document and in total, alongside pasted text. Everything is read on your device.",
    content: {
      intro: [
        "A book manuscript, a thesis or a translation job is rarely one file. Counting them one at a time and adding up invites errors — this tool totals them and keeps a per-file breakdown.",
        "It also accepts pasted text, so a chapter you are drafting can be counted alongside the finished files.",
      ],
      howTo: [
        "Add the files — PDF, DOCX, TXT, MD or CSV.",
        "Paste any additional text.",
        "Read the combined total and the per-document table.",
        "Copy the total into your submission.",
      ],
      method: {
        title: "One counter for every format",
        paragraphs: [
          "PDFs are read through pdf.js, DOCX through the ZIP/XML parser, and everything else as plain text. Each source is counted with the same whitespace rule so the totals are comparable.",
          "The per-document table keeps the audit trail: if the total looks wrong, you can see which file is responsible.",
        ],
        formula: "total = Σ words per source",
      },
      examples: [
        { title: "A three-part manuscript", steps: ["Add three DOCX files."], result: "combined count plus each part" },
        { title: "A mixed submission", steps: ["Add a PDF and paste an excerpt."], result: "one total across both" },
      ],
      limitations: [
        "Scanned PDFs contribute nothing without OCR.",
        "DOCX tables are counted only where they contain paragraph text.",
        "Counting rules differ from Word's, so expect small differences.",
      ],
      faqs: [
        { q: "Why does Word give a different number?", a: "Word counts some symbols and hyphenated compounds differently. Neither is 'wrong'; a publisher's rule is what matters." },
        { q: "Can I count characters too?", a: "Yes, the result shows both words and characters per source." },
        { q: "Is anything uploaded?", a: "No. Every file is parsed locally." },
      ],
    },
  },
  {
    slug: "pdf-password-protection-tool",
    name: "PDF Password Protection Tool",
    category: "pdf",
    tagline: "Planned: encrypt a PDF with a password, once the crypto path is verified.",
    intent: "password protect a pdf",
    keywords: ["password protect pdf", "encrypt pdf", "pdf password", "lock pdf"],
    status: "planned",
    actions: ["download"],
    effort: "guided",
    popularity: 72,
    addedAt: "2025-11-02",
    seoTitle: "PDF Password Protection — Planned Tool",
    seoDescription:
      "Password protecting a PDF needs standards-compliant AES encryption. This tool is documented but not yet published, because a half-working lock is worse than none.",
    content: {
      intro: [
        "A password on a PDF is a promise that the file cannot be opened without it. Keeping that promise means implementing the PDF standard security handler exactly — AES-256 with a correct key derivation — and testing it against real readers.",
        "pdf-lib, the library behind the rest of this category, does not implement encryption. Rather than ship a lock that silently produces a readable file, this tool stays marked as planned until an audited encryption path is in place.",
      ],
      howTo: [
        "This tool is not published yet, so there is nothing to use. The steps below describe the intended behaviour.",
        "Add a PDF and choose the owner and user passwords.",
        "Choose which permissions to grant (print, copy, modify).",
        "Download the encrypted file and verify it opens in a standard reader.",
      ],
      method: {
        title: "Why it is not shipped yet",
        paragraphs: [
          "Encryption is the one place where an approximate implementation is actively dangerous: a bug can either leave the document readable or corrupt it beyond recovery.",
          "The planned implementation uses AES-256 per the PDF 2.0 standard, derives keys with the documented algorithm, and is validated against Adobe Reader, macOS Preview and pdf.js before publication.",
        ],
        formula: "AES-256 + standard security handler (planned)",
      },
      examples: [
        { title: "Intended use", steps: ["Encrypt a contract with an owner password."], result: "recipients need the user password to open it" },
        { title: "Why not a demo lock?", steps: ["A demo that does not actually encrypt would mislead."], result: "marked planned instead" },
      ],
      limitations: [
        "Not available yet — no file can be encrypted here today.",
        "Any browser-based protection is only as strong as the password you choose.",
        "Existing encrypted files cannot be opened by the other tools in this category.",
      ],
      faqs: [
        { q: "When will this ship?", a: "Once an audited encryption implementation has been tested against real PDF readers; the roadmap tracks it." },
        { q: "What can I use meanwhile?", a: "QPDF or your operating system's own PDF export can encrypt a document locally." },
        { q: "Why not just hide the content?", a: "Visual obfuscation is not encryption and would misrepresent the protection offered." },
      ],
    },
  },
];
