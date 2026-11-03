package ng.name.toolz.media

import android.content.Context
import android.graphics.BitmapFactory
import com.tom_roush.pdfbox.android.PDFBoxResourceLoader
import com.tom_roush.pdfbox.pdmodel.PDDocument
import com.tom_roush.pdfbox.pdmodel.PDPage
import com.tom_roush.pdfbox.pdmodel.PDPageContentStream
import com.tom_roush.pdfbox.pdmodel.font.PDType1Font
import com.tom_roush.pdfbox.pdmodel.graphics.state.PDExtendedGraphicsState
import com.tom_roush.pdfbox.text.PDFTextStripper
import com.tom_roush.pdfbox.util.Matrix
import java.io.ByteArrayOutputStream

/**
 * The PDF side of the app. Creation is handled by the in-house [PdfWriter];
 * everything that has to read or rearrange an existing document goes through
 * PdfBox, which is the only maintained offline option on Android.
 */
internal object PdfEngine {

    private fun open(bytes: ByteArray): PDDocument = runCatching { PDDocument.load(bytes) }
        .getOrElse { error ->
            val message = error.message.orEmpty()
            if (message.contains("password", true) || message.contains("encrypt", true)) {
                throw MediaError("This PDF is password-protected. Remove the password first.")
            }
            throw MediaError("That file could not be opened as a PDF.")
        }

    private fun save(document: PDDocument): ByteArray {
        val out = ByteArrayOutputStream()
        document.save(out)
        document.close()
        return out.toByteArray()
    }

    private fun textOf(document: PDDocument): String =
        runCatching { PDFTextStripper().apply { sortByPosition = true }.getText(document) }
            .getOrDefault("")

    fun run(context: Context, slug: String, options: Map<String, String>, inputs: List<Pair<String, ByteArray>>): MediaOutput {
        PDFBoxResourceLoader.init(context.applicationContext)
        val primary = inputs.firstOrNull()
        return when (slug) {
            "text-to-pdf" -> {
                val text = options["text"].orEmpty()
                if (text.isBlank()) throw MediaError("Type some text first.")
                val size = options["size"]?.toFloatOrNull() ?: 12f
                val bytes = PdfWriter.textPdf(text, size, options["title"].orEmpty().ifBlank { "Toolz document" })
                val pages = countPagesIn(bytes)
                MediaOutput(
                    "PDF ready",
                    "$pages page${if (pages == 1) "" else "s"} · ${humanBytes(bytes.size.toLong())}",
                    listOf("Page size" to "A4", "Font" to "Helvetica ${size.toInt()} pt", "Words" to countWords(text).toString()),
                    bytes = bytes,
                    mime = "application/pdf",
                    fileName = sanitiseName(options["title"].orEmpty(), "toolz-document") + ".pdf",
                )
            }
            "docx-to-pdf" -> {
                val docx = primary?.second ?: throw MediaError("Choose a .docx file first.")
                val text = extractDocxText(docx)
                if (text.isNullOrBlank()) throw MediaError("No text found inside that .docx.")
                val bytes = PdfWriter.textPdf(text, 12f, "Document")
                MediaOutput(
                    "Text-only PDF",
                    "${humanBytes(bytes.size.toLong())} · formatting not preserved",
                    listOf("Words" to countWords(text).toString(), "Pages" to countPagesIn(bytes).toString()),
                    bytes = bytes,
                    mime = "application/pdf",
                    fileName = sanitiseName(primary.first, "document") + ".pdf",
                )
            }
            "jpg-to-pdf", "png-to-pdf" -> {
                val image = primary?.second ?: throw MediaError("Choose an image first.")
                val bounds = BitmapFactory.Options().apply { inJustDecodeBounds = true }
                BitmapFactory.decodeByteArray(image, 0, image.size, bounds)
                if (bounds.outWidth <= 0) throw MediaError("That image could not be read.")
                val isJpeg = image.size > 3 && image[0] == 0xFF.toByte() && image[1] == 0xD8.toByte()
                val payload: ByteArray
                if (isJpeg) {
                    payload = image
                } else {
                    val bitmap = ImageEngine.decode(image, 5000)
                    payload = ImageEngine.encode(bitmap, "JPEG", 92).first
                }
                val bytes = PdfWriter.imagePdf(listOf(JpegPage(payload, bounds.outWidth, bounds.outHeight)))
                MediaOutput(
                    "PDF ready",
                    "One page · ${humanBytes(bytes.size.toLong())}",
                    listOf("Image" to "${bounds.outWidth} × ${bounds.outHeight}", "Re-encoded" to (if (isJpeg) "no" else "yes, PNG to JPEG")),
                    bytes = bytes,
                    mime = "application/pdf",
                    fileName = sanitiseName(primary.first, "image") + ".pdf",
                )
            }
            "pdf-page-counter" -> {
                val bytes = primary?.second ?: throw MediaError("Choose a PDF first.")
                open(bytes).use { document ->
                    val page = document.getPage(0)
                    val box = page.mediaBox
                    MediaOutput(
                        "${document.numberOfPages} page${if (document.numberOfPages == 1) "" else "s"}",
                        humanBytes(bytes.size.toLong()),
                        listOf(
                            "First page" to "${box.width.toInt()} × ${box.height.toInt()} pt",
                            "Size in mm" to "${(box.width * 25.4 / 72).toInt()} × ${(box.height * 25.4 / 72).toInt()} mm",
                            "Version" to "PDF ${document.version}",
                            "Encrypted" to (if (document.isEncrypted) "yes" else "no"),
                        ),
                    )
                }
            }
            "pdf-metadata" -> {
                val bytes = primary?.second ?: throw MediaError("Choose a PDF first.")
                open(bytes).use { document ->
                    val info = document.documentInformation
                    val fields = listOf(
                        "Title" to info.title,
                        "Author" to info.author,
                        "Subject" to info.subject,
                        "Creator" to info.creator,
                        "Producer" to info.producer,
                        "Created" to info.creationDate?.toString(),
                        "Modified" to info.modificationDate?.toString(),
                    ).filter { !it.second.isNullOrBlank() }
                    if (fields.isEmpty()) throw MediaError("This PDF carries no document information.")
                    val report = fields.joinToString("\n") { "${it.first}: ${it.second}" }
                    MediaOutput(
                        "Metadata",
                        report,
                        listOf("Pages" to document.numberOfPages.toString(), "Fields" to fields.size.toString()),
                        bytes = report.toByteArray(),
                        mime = "text/plain",
                        fileName = sanitiseName(primary.first, "document") + "-metadata.txt",
                    )
                }
            }
            "pdf-to-text", "word-counter-pdf" -> {
                val bytes = primary?.second ?: throw MediaError("Choose a PDF first.")
                open(bytes).use { document ->
                    val text = textOf(document)
                    if (text.isBlank()) throw MediaError("No text layer found. Scanned PDFs hold pictures of words, not words.")
                    if (slug == "pdf-to-text") {
                        MediaOutput(
                            "Text",
                            text,
                            listOf("Characters" to text.length.toString(), "Pages" to document.numberOfPages.toString()),
                            bytes = text.toByteArray(),
                            mime = "text/plain",
                            fileName = sanitiseName(primary.first, "document") + ".txt",
                        )
                    } else {
                        val words = countWords(text)
                        MediaOutput(
                            "$words words",
                            "${text.length} characters · about ${(words / 200) + 1} min to read",
                            listOf("Pages" to document.numberOfPages.toString(), "Sentences" to text.split(Regex("[.!?]+")).count { it.isNotBlank() }.toString()),
                            bytes = text.toByteArray(),
                            mime = "text/plain",
                            fileName = sanitiseName(primary.first, "document") + ".txt",
                        )
                    }
                }
            }
            "document-word-counter" -> {
                val docx = primary?.second ?: throw MediaError("Choose a .docx file first.")
                val text = extractDocxText(docx) ?: throw MediaError("That file could not be read as a .docx.")
                if (text.isBlank()) throw MediaError("No text found inside that document.")
                val words = countWords(text)
                MediaOutput(
                    "$words words",
                    "${text.length} characters · about ${(words / 200) + 1} min to read",
                    listOf("Paragraphs" to text.split("\n").count { it.isNotBlank() }.toString(), "Size" to humanBytes(docx.size.toLong())),
                    bytes = text.toByteArray(),
                    mime = "text/plain",
                    fileName = sanitiseName(primary.first, "document") + ".txt",
                )
            }
            "pdf-page-extractor" -> {
                val bytes = primary?.second ?: throw MediaError("Choose a PDF first.")
                open(bytes).use { document ->
                    val ranges = parsePageRanges(options["pages"].orEmpty(), document.numberOfPages)
                    if (ranges.isEmpty()) throw MediaError("None of those page numbers exist in this document.")
                    val output = PDDocument()
                    ranges.forEach { range -> range.forEach { page -> output.importPage(document.getPage(page - 1)) } }
                    val result = save(output)
                    MediaOutput(
                        "Extracted",
                        "${ranges.sumOf { it.last - it.first + 1 }} page(s) from ${document.numberOfPages}",
                        listOf("Ranges" to ranges.joinToString(", ") { if (it.first == it.last) "${it.first}" else "${it.first}-${it.last}" }, "Size" to humanBytes(result.size.toLong())),
                        bytes = result,
                        mime = "application/pdf",
                        fileName = sanitiseName(primary.first, "document") + "-pages.pdf",
                    )
                }
            }
            "pdf-merger" -> {
                if (inputs.size < 2) throw MediaError("Pick at least two PDFs to merge.")
                val output = PDDocument()
                var pages = 0
                inputs.forEach { (_, content) ->
                    open(content).use { document ->
                        for (index in 0 until document.numberOfPages) {
                            output.importPage(document.getPage(index))
                            pages++
                        }
                    }
                }
                val result = save(output)
                MediaOutput(
                    "$pages pages",
                    "${inputs.size} files · ${humanBytes(result.size.toLong())}",
                    listOf("Order" to inputs.joinToString(" → ") { sanitiseName(it.first, "file") }),
                    bytes = result,
                    mime = "application/pdf",
                    fileName = "merged.pdf",
                )
            }
            "pdf-splitter" -> {
                val bytes = primary?.second ?: throw MediaError("Choose a PDF first.")
                open(bytes).use { document ->
                    val ranges = parsePageRanges(options["ranges"].orEmpty(), document.numberOfPages)
                    if (ranges.isEmpty()) throw MediaError("No valid ranges for this document.")
                    val entries = ranges.mapIndexed { index, range ->
                        val part = PDDocument()
                        range.forEach { page -> part.importPage(document.getPage(page - 1)) }
                        val name = if (range.first == range.last) "page-${range.first}.pdf" else "pages-${range.first}-${range.last}.pdf"
                        name to save(part)
                    }
                    if (entries.size == 1) {
                        val (name, content) = entries.first()
                        MediaOutput("One part", name, listOf("Size" to humanBytes(content.size.toLong())), bytes = content, mime = "application/pdf", fileName = name)
                    } else {
                        val zip = zipOf(entries)
                        MediaOutput(
                            "${entries.size} PDFs",
                            "Zipped · ${humanBytes(zip.size.toLong())}",
                            listOf("Parts" to entries.joinToString(", ") { it.first }),
                            bytes = zip,
                            mime = "application/zip",
                            fileName = sanitiseName(primary.first, "document") + "-split.zip",
                        )
                    }
                }
            }
            "pdf-rotator" -> {
                val bytes = primary?.second ?: throw MediaError("Choose a PDF first.")
                val angle = options["angle"]?.toIntOrNull() ?: 90
                if (angle % 90 != 0) throw MediaError("Use 90, 180 or 270 degrees.")
                open(bytes).use { document ->
                    for (index in 0 until document.numberOfPages) {
                        val page = document.getPage(index)
                        page.rotation = ((page.rotation + angle) % 360 + 360) % 360
                    }
                    val result = save(document)
                    MediaOutput("Rotated", "$angle degrees on every page", listOf("Size" to humanBytes(result.size.toLong())), bytes = result, mime = "application/pdf", fileName = sanitiseName(primary.first, "document") + "-rotated.pdf")
                }
            }
            "pdf-reorder" -> {
                val bytes = primary?.second ?: throw MediaError("Choose a PDF first.")
                open(bytes).use { document ->
                    val raw = options["order"].orEmpty().trim()
                    val order = if (raw.isEmpty()) {
                        (document.numberOfPages downTo 1).toList()
                    } else {
                        parsePageOrder(raw, document.numberOfPages)
                            ?: throw MediaError("List each page exactly once, from 1 to ${document.numberOfPages}.")
                    }
                    val output = PDDocument()
                    order.forEach { page -> output.importPage(document.getPage(page - 1)) }
                    val result = save(output)
                    MediaOutput(
                        "Reordered",
                        order.take(12).joinToString(", ") + if (order.size > 12) " …" else "",
                        listOf("Pages" to order.size.toString(), "Size" to humanBytes(result.size.toLong())),
                        bytes = result,
                        mime = "application/pdf",
                        fileName = sanitiseName(primary.first, "document") + "-reordered.pdf",
                    )
                }
            }
            "pdf-watermark" -> {
                val bytes = primary?.second ?: throw MediaError("Choose a PDF first.")
                val text = options["text"].orEmpty().ifBlank { "DRAFT" }
                val opacity = ((options["opacity"]?.toFloatOrNull() ?: 18f) / 100f).coerceIn(0.03f, 1f)
                open(bytes).use { document ->
                    val state = PDExtendedGraphicsState().apply {
                        nonStrokingAlphaConstant = opacity
                    }
                    for (index in 0 until document.numberOfPages) {
                        val page = document.getPage(index)
                        PDPageContentStream(document, page, PDPageContentStream.AppendMode.APPEND, true, true).use { stream ->
                            stream.setGraphicsStateParameters(state)
                            stream.setNonStrokingColor(0.35f, 0.35f, 0.35f)
                            val size = 48f
                            stream.beginText()
                            stream.setFont(PDType1Font.HELVETICA_BOLD, size)
                            val width = page.mediaBox.width
                            val height = page.mediaBox.height
                            stream.setTextMatrix(Matrix.getRotateInstance(Math.toRadians(45.0), width * 0.18f, height * 0.28f))
                            stream.showText(text.take(40))
                            stream.endText()
                        }
                    }
                    val result = save(document)
                    MediaOutput(
                        "Watermarked",
                        "\"$text\" at ${(opacity * 100).toInt()}% on every page",
                        listOf("Size" to humanBytes(result.size.toLong())),
                        bytes = result,
                        mime = "application/pdf",
                        fileName = sanitiseName(primary.first, "document") + "-watermark.pdf",
                    )
                }
            }
            "pdf-compressor", "pdf-size-reducer" -> {
                val bytes = primary?.second ?: throw MediaError("Choose a PDF first.")
                val rasterise = slug == "pdf-size-reducer" || options["mode"] == "Rasterise pages"
                if (!rasterise) {
                    open(bytes).use { document ->
                        val pages = document.numberOfPages
                        val result = save(document)
                        MediaOutput(
                            "Rewritten",
                            "${humanBytes(bytes.size.toLong())} → ${humanBytes(result.size.toLong())}",
                            listOf("Pages" to pages.toString(), "Text" to "still selectable"),
                            bytes = result,
                            mime = "application/pdf",
                            fileName = sanitiseName(primary.first, "document") + "-compressed.pdf",
                        )
                    }
                } else {
                    val target = (options["target"]?.toDoubleOrNull() ?: 2.0) * 1024 * 1024
                    val useJpeg = options["colour"] != "PNG"
                    var dpi = options["dpi"]?.toIntOrNull() ?: 120
                    var quality = 72
                    var best: ByteArray? = null
                    var attempt = 0
                    while (attempt < 6) {
                        val pages = PdfRasteriser.render(context, bytes, dpi, useJpeg, quality)
                        val jpegPages = pages.mapNotNull { (_, content) ->
                            val bounds = BitmapFactory.Options().apply { inJustDecodeBounds = true }
                            BitmapFactory.decodeByteArray(content, 0, content.size, bounds)
                            if (bounds.outWidth <= 0) null else JpegPage(content, bounds.outWidth, bounds.outHeight)
                        }
                        if (jpegPages.isNotEmpty()) {
                            best = PdfWriter.imagePdf(jpegPages)
                            if (best!!.size <= target) break
                        }
                        dpi = (dpi * 0.8).toInt().coerceAtLeast(72)
                        quality = (quality - 10).coerceAtLeast(40)
                        attempt++
                    }
                    val result = best ?: throw MediaError("The pages could not be rendered.")
                    MediaOutput(
                        humanBytes(result.size.toLong()),
                        "${humanBytes(bytes.size.toLong())} → ${humanBytes(result.size.toLong())}",
                        listOf("Text" to "no longer selectable (rasterised)", "Target" to humanBytes(target.toLong())),
                        bytes = result,
                        mime = "application/pdf",
                        fileName = sanitiseName(primary.first, "document") + "-small.pdf",
                    )
                }
            }
            "pdf-to-jpg", "pdf-to-png" -> {
                val bytes = primary?.second ?: throw MediaError("Choose a PDF first.")
                val dpi = options["dpi"]?.toIntOrNull() ?: 150
                val jpeg = slug == "pdf-to-jpg"
                val pages = PdfRasteriser.render(context, bytes, dpi, jpeg, 86)
                if (pages.isEmpty()) throw MediaError("This PDF has no pages to render.")
                if (pages.size == 1) {
                    val (name, content) = pages.first()
                    MediaOutput(
                        if (jpeg) "JPEG" else "PNG",
                        "$dpi DPI · ${humanBytes(content.size.toLong())}",
                        listOf("Pages" to "1"),
                        bytes = content,
                        mime = if (jpeg) "image/jpeg" else "image/png",
                        fileName = name,
                    )
                } else {
                    val zip = zipOf(pages)
                    MediaOutput(
                        "${pages.size} images",
                        "Zipped · ${humanBytes(zip.size.toLong())}",
                        listOf("DPI" to dpi.toString(), "Format" to (if (jpeg) "JPEG" else "PNG")),
                        bytes = zip,
                        mime = "application/zip",
                        fileName = sanitiseName(primary.first, "document") + "-pages.zip",
                    )
                }
            }
            else -> throw MediaError("That PDF tool is not wired up yet.")
        }
    }

    private fun countPagesIn(pdf: ByteArray): Int = runCatching {
        PDDocument.load(pdf).use { it.numberOfPages }
    }.getOrDefault(0)
}
