package ng.name.toolz.data

/**
 * The 36 tools that take a file. Their `compute` never pretends to do the work —
 * it explains what the media screen will do — because the real pipeline needs a
 * picker, a bitmap or a PDF, and an export step.
 */

private fun mediaTool(
    slug: String,
    title: String,
    category: String,
    tagline: String,
    keywords: List<String>,
    kind: MediaKind,
    fields: List<FieldSpec>,
    explanation: String,
) = Tool(
    slug = slug,
    title = title,
    category = category,
    tagline = tagline,
    keywords = keywords,
    fields = fields,
    media = kind,
    compute = { input ->
        ToolResult(
            "On this device",
            if (kind == MediaKind.NONE) "Fill in the fields above, then run it." else "Choose a file above to start.",
            fields.map { it.id to (input[it.id] ?: it.defaultValue) },
            note = explanation,
        )
    },
)

internal val imageTools2 = listOf(
    mediaTool(
        "base64-to-image", "Base64 to Image", "images",
        "Paste a data URI and get the picture back.",
        listOf("base64", "data uri", "decode"), MediaKind.NONE,
        listOf(field("base64", "Base64 or data URI", FieldKind.MULTILINE, default = "")),
        "Decoded in memory. Nothing is decoded on a server, because there is no server.",
    ),
    mediaTool(
        "image-to-base64", "Image to Base64", "images",
        "An image as text, ready for CSS or JSON.",
        listOf("base64", "data uri", "embed"), MediaKind.IMAGE,
        listOf(field("wrap", "Include data URI prefix", FieldKind.TOGGLE, default = "true")),
        "Useful for small icons. Anything over about 10 KB is better served as a file.",
    ),
    mediaTool(
        "exif-data", "EXIF Data", "images",
        "Camera, lens, exposure and GPS, as stored.",
        listOf("exif", "metadata", "photo"), MediaKind.IMAGE,
        emptyList(),
        "Read from the file the camera wrote. GPS is shown if the photo carries it — that is a privacy decision you are making.",
    ),
    mediaTool(
        "image-metadata", "Image Metadata", "images",
        "Dimensions, format, size and aspect ratio.",
        listOf("metadata", "dimensions", "format"), MediaKind.IMAGE,
        emptyList(),
        "Read from the bytes themselves, not from the file name.",
    ),
    mediaTool(
        "favicon-generator", "Favicon Generator", "images",
        "One square PNG at the size the browsers ask for.",
        listOf("favicon", "icon", "png"), MediaKind.IMAGE,
        listOf(
            field("size", "Size", FieldKind.SELECT, default = "192", options = listOf("32", "48", "180", "192", "512")),
        ),
        "Crop-friendly: the image is scaled to a square from the centre, so use artwork that survives a centre crop.",
    ),
    mediaTool(
        "image-background", "Image Background", "images",
        "Flatten a transparent PNG onto a colour.",
        listOf("background", "transparent", "flatten"), MediaKind.IMAGE,
        listOf(field("colour", "Background colour (hex)", FieldKind.TEXT, default = "#FFFFFF")),
        "JPEG has no transparency, which is why flattened images look black in some viewers.",
    ),
    mediaTool(
        "image-blur", "Image Blur", "images",
        "A soft blur by radius, computed pixel by pixel.",
        listOf("blur", "soften", "privacy"), MediaKind.IMAGE,
        listOf(field("radius", "Radius (px)", FieldKind.NUMBER, default = "6")),
        "Blur also hides faces, but a heavy blur is safer than a light one if the photo matters.",
    ),
    mediaTool(
        "image-colour-picker", "Image Colour Picker", "images",
        "The colour at a point, plus the average.",
        listOf("colour picker", "hex", "sample"), MediaKind.IMAGE,
        listOf(
            field("x", "X position (%)", FieldKind.DECIMAL, default = "50"),
            field("y", "Y position (%)", FieldKind.DECIMAL, default = "50"),
        ),
        "Percentages keep it simple: 50/50 is the centre of the picture.",
    ),
    mediaTool(
        "image-compressor", "Image Compressor", "images",
        "Re-encode a JPEG at a quality you choose.",
        listOf("compress", "jpeg", "quality"), MediaKind.IMAGE,
        listOf(field("quality", "Quality (1–100)", FieldKind.NUMBER, default = "82")),
        "Quality 80–85 is usually indistinguishable on a phone and a fraction of the size.",
    ),
    mediaTool(
        "image-cropper", "Image Cropper", "images",
        "Centre square, 16:9 or a percentage crop.",
        listOf("crop", "square", "aspect"), MediaKind.IMAGE,
        listOf(
            field("shape", "Shape", FieldKind.SELECT, default = "Centre square", options = listOf("Centre square", "16:9", "4:3")),
        ),
        "The crop is centred; use the dimensions tool first if you need the exact pixel count.",
    ),
    mediaTool(
        "image-format", "Image Format Converter", "images",
        "PNG, JPEG or WebP from any image.",
        listOf("convert", "png", "jpeg", "webp"), MediaKind.IMAGE,
        listOf(
            field("format", "Output", FieldKind.SELECT, default = "PNG", options = listOf("PNG", "JPEG", "WebP")),
            field("quality", "Quality for lossy formats", FieldKind.NUMBER, default = "85"),
        ),
        "PNG keeps transparency; JPEG and WebP are smaller for photographs.",
    ),
    mediaTool(
        "image-pixelator", "Image Pixelator", "images",
        "Big blocks, like a censored photo.",
        listOf("pixelate", "mosaic", "censor"), MediaKind.IMAGE,
        listOf(field("blocks", "Blocks across", FieldKind.NUMBER, default = "24")),
        "Fewer blocks means stronger pixelation. Real censoring needs very few.",
    ),
    mediaTool(
        "image-resizer", "Image Resizer", "images",
        "Cap the long edge and keep the proportions.",
        listOf("resize", "scale", "downsize"), MediaKind.IMAGE,
        listOf(field("max", "Longest edge (px)", FieldKind.NUMBER, default = "1600")),
        "One step down is sharper than several small steps.",
    ),
    mediaTool(
        "jpg-to-png", "JPG to PNG", "images",
        "Lossless copy of a JPEG as PNG.",
        listOf("jpg", "png", "convert"), MediaKind.IMAGE,
        emptyList(),
        "PNG will be larger than the JPEG: converting does not recover detail that was already lost.",
    ),
    mediaTool(
        "png-to-jpg", "PNG to JPG", "images",
        "Flatten a PNG to JPEG with a chosen quality.",
        listOf("png", "jpg", "convert"), MediaKind.IMAGE,
        listOf(field("quality", "Quality (1–100)", FieldKind.NUMBER, default = "88")),
        "Transparency becomes white, because JPEG has no alpha channel.",
    ),
    mediaTool(
        "webp-converter", "WebP Converter", "images",
        "WebP output, the format the web actually wants.",
        listOf("webp", "convert", "web"), MediaKind.IMAGE,
        listOf(field("quality", "Quality (1–100)", FieldKind.NUMBER, default = "85")),
        "WebP is usually 25–35% smaller than JPEG at the same quality.",
    ),
)

internal val pdfTools2 = listOf(
    mediaTool(
        "text-to-pdf", "Text to PDF", "pdf",
        "Type or paste text, get a real PDF.",
        listOf("text to pdf", "pdf", "document"), MediaKind.NONE,
        listOf(
            field("text", "Text", FieldKind.MULTILINE, default = "Toolz\n\nEvery tool runs on your device.\n"),
            field("title", "Document title", FieldKind.TEXT, default = "Toolz document"),
            field("size", "Font size", FieldKind.NUMBER, default = "12"),
        ),
        "Written with an in-house PDF writer: Helvetica, A4, wrapped to the margins.",
    ),
    mediaTool(
        "docx-to-pdf", "DOCX to PDF", "pdf",
        "Word text into a PDF — text only, no layout.",
        listOf("docx", "word", "pdf"), MediaKind.DOCX,
        emptyList(),
        "Reads the document text out of the .docx zip. Formatting, images and tables are not reproduced, and the tool says so.",
    ),
    mediaTool(
        "jpg-to-pdf", "JPG to PDF", "pdf",
        "A photo on an A4 page.",
        listOf("jpg", "pdf", "photo"), MediaKind.IMAGE,
        emptyList(),
        "The JPEG is embedded without re-encoding, so the photo keeps its original quality and the file stays small.",
    ),
    mediaTool(
        "png-to-pdf", "PNG to PDF", "pdf",
        "A PNG on an A4 page.",
        listOf("png", "pdf"), MediaKind.IMAGE,
        emptyList(),
        "PNG is flattened onto white before it goes into the page, because PDF pages here carry no alpha.",
    ),
    mediaTool(
        "pdf-page-counter", "PDF Page Counter", "pdf",
        "How many pages, what size, what version.",
        listOf("pdf", "pages", "count"), MediaKind.PDF,
        emptyList(),
        "Read from the document's own page tree.",
    ),
    mediaTool(
        "pdf-metadata", "PDF Metadata", "pdf",
        "Title, author, producer and encryption flag.",
        listOf("pdf", "metadata", "author"), MediaKind.PDF,
        emptyList(),
        "Metadata travels with the file. If the author field matters, read it before you share the PDF.",
    ),
    mediaTool(
        "pdf-to-text", "PDF to Text", "pdf",
        "The words, page by page.",
        listOf("pdf", "text", "extract"), MediaKind.PDF,
        emptyList(),
        "Text extraction follows the order the PDF stores text, which is not always reading order.",
    ),
    mediaTool(
        "word-counter-pdf", "Word Counter for PDF", "pdf",
        "Words, characters and reading time from a PDF.",
        listOf("pdf", "word count", "reading time"), MediaKind.PDF,
        emptyList(),
        "Counts extracted text: scanned PDFs contain images of words, not words, so they come out empty.",
    ),
    mediaTool(
        "document-word-counter", "DOCX Word Counter", "pdf",
        "Words and reading time from a Word file.",
        listOf("docx", "word count", "document"), MediaKind.DOCX,
        emptyList(),
        "Reads the document text directly; headers, footnotes and comments are not counted.",
    ),
    mediaTool(
        "pdf-to-jpg", "PDF to JPG", "pdf",
        "Every page as a JPEG, in a zip.",
        listOf("pdf", "jpg", "render"), MediaKind.PDF,
        listOf(field("dpi", "Render DPI", FieldKind.SELECT, default = "150", options = listOf("96", "150", "200", "300"))),
        "Rendered by the system PDF renderer at the DPI you pick. One page gives one image; several pages give a zip.",
    ),
    mediaTool(
        "pdf-to-png", "PDF to PNG", "pdf",
        "Every page as a PNG, in a zip.",
        listOf("pdf", "png", "render"), MediaKind.PDF,
        listOf(field("dpi", "Render DPI", FieldKind.SELECT, default = "150", options = listOf("96", "150", "200", "300"))),
        "PNG is lossless, so page images are larger than the JPEG version.",
    ),
    mediaTool(
        "pdf-page-extractor", "PDF Page Extractor", "pdf",
        "Keep only the pages you name.",
        listOf("pdf", "extract", "pages"), MediaKind.PDF,
        listOf(field("pages", "Pages (1-3,5)", FieldKind.TEXT, default = "1")),
        "Pages are copied, so the text stays selectable and nothing is re-rendered.",
    ),
    mediaTool(
        "pdf-merger", "PDF Merger", "pdf",
        "Several PDFs into one document.",
        listOf("pdf", "merge", "combine"), MediaKind.PDF_MULTI,
        emptyList(),
        "Pick two or more files; they are combined in the order you chose them.",
    ),
    mediaTool(
        "pdf-splitter", "PDF Splitter", "pdf",
        "Split into single pages or named ranges.",
        listOf("pdf", "split", "pages"), MediaKind.PDF,
        listOf(field("ranges", "Ranges (1-3,4-6) or blank for one per page", FieldKind.TEXT, default = "")),
        "Each range becomes its own PDF inside a zip.",
    ),
    mediaTool(
        "pdf-rotator", "PDF Rotator", "pdf",
        "Turn every page upright.",
        listOf("pdf", "rotate", "orientation"), MediaKind.PDF,
        listOf(field("angle", "Angle", FieldKind.SELECT, default = "90", options = listOf("90", "180", "270"))),
        "Rotation is set on the page, not baked into pixels, so the text stays sharp.",
    ),
    mediaTool(
        "pdf-reorder", "PDF Page Reorder", "pdf",
        "Put the pages in a different order.",
        listOf("pdf", "reorder", "pages"), MediaKind.PDF,
        listOf(field("order", "New order (3,1,2)", FieldKind.TEXT, default = "")),
        "List every page once. Leave it blank to reverse the document.",
    ),
    mediaTool(
        "pdf-watermark", "PDF Watermark", "pdf",
        "A diagonal stamp across every page.",
        listOf("pdf", "watermark", "stamp"), MediaKind.PDF,
        listOf(
            field("text", "Watermark text", FieldKind.TEXT, default = "DRAFT"),
            field("opacity", "Opacity (%)", FieldKind.NUMBER, default = "18"),
        ),
        "Drawn over the existing content, so it can be removed by anyone with a PDF editor — it marks a draft, it does not protect one.",
    ),
    mediaTool(
        "pdf-compressor", "PDF Compressor", "pdf",
        "Rewrite a PDF to shed weight.",
        listOf("pdf", "compress", "size"), MediaKind.PDF,
        listOf(
            field("mode", "Mode", FieldKind.SELECT, default = "Rewrite and tidy", options = listOf("Rewrite and tidy", "Rasterise pages")),
            field("dpi", "DPI when rasterising", FieldKind.SELECT, default = "120", options = listOf("96", "120", "150")),
        ),
        "Rewrite and tidy keeps the text and removes duplication. Rasterise turns pages into images: much smaller, no longer selectable.",
    ),
    mediaTool(
        "pdf-size-reducer", "PDF Size Reducer", "pdf",
        "Hit a size budget by rasterising.",
        listOf("pdf", "reduce", "size"), MediaKind.PDF,
        listOf(
            field("target", "Target size (MB)", FieldKind.DECIMAL, default = "2"),
            field("colour", "Output", FieldKind.SELECT, default = "JPEG", options = listOf("JPEG", "PNG")),
        ),
        "Rasterising is the honest way to hit a hard limit: the text becomes an image, so the result cannot be searched.",
    ),
)

internal val readerTools = listOf(
    mediaTool(
        "qr-code-reader", "QR Code Reader", "developer",
        "Read a QR code from a picture.",
        listOf("qr", "scan", "read"), MediaKind.IMAGE,
        emptyList(),
        "Decoded on the device with the same library that draws the codes. No camera permission is requested: pick a screenshot or photo.",
    ),
)

internal val mediaTools: List<Tool> = imageTools2 + pdfTools2 + readerTools
