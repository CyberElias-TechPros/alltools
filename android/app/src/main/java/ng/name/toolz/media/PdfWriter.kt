package ng.name.toolz.media

import java.io.ByteArrayOutputStream
import java.util.Locale

/**
 * A small, dependency-free PDF writer.
 *
 * It makes single-column documents: Helvetica text on A4, wrapped to the
 * margins, plus full-page JPEGs embedded without re-encoding. Nothing here
 * touches Android, so the JVM suite can inspect the actual bytes the app writes.
 */

internal class JpegPage(val bytes: ByteArray, val width: Int, val height: Int)

internal object PdfWriter {

    private const val PAGE_WIDTH = 595.276
    private const val PAGE_HEIGHT = 841.89
    private const val MARGIN = 56.0

    /** Helvetica advance widths per mille, for characters 32..126. */
    private val WIDTHS = intArrayOf(
        278, 278, 355, 556, 556, 889, 667, 191, 333, 333, 389, 584, 278, 333, 278, 278,
        556, 556, 556, 556, 556, 556, 556, 556, 556, 556,
        278, 278, 584, 584, 584, 556, 1015,
        667, 667, 722, 722, 667, 611, 778, 722, 278, 500, 667, 556, 833, 722, 778,
        667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611,
        278, 278, 278, 469, 556, 333,
        556, 556, 500, 556, 556, 278, 556, 556, 222, 222, 500, 222, 833, 556, 556,
        556, 556, 333, 500, 278, 556, 500, 722, 500, 500, 500,
        334, 260, 334, 584,
    )

    internal fun textWidth(text: String, fontSize: Float): Double {
        var total = 0
        for (character in text) {
            val code = character.code
            total += if (code in 32..126) WIDTHS[code - 32] else 556
        }
        return total * fontSize / 1000.0
    }

    internal fun wrap(text: String, fontSize: Float): List<String> {
        val available = PAGE_WIDTH - MARGIN * 2
        val lines = mutableListOf<String>()
        text.replace("\r\n", "\n").split("\n").forEach { paragraph ->
            if (paragraph.isBlank()) {
                lines += ""
                return@forEach
            }
            var current = StringBuilder()
            paragraph.split(Regex("\\s+")).filter { it.isNotEmpty() }.forEach { word ->
                val candidate = if (current.isEmpty()) word else "$current $word"
                if (textWidth(candidate, fontSize) > available && current.isNotEmpty()) {
                    lines += current.toString()
                    current = StringBuilder(word)
                } else {
                    current = StringBuilder(candidate)
                }
            }
            if (current.isNotEmpty()) lines += current.toString()
        }
        return lines
    }

    internal fun textPdf(text: String, fontSize: Float, title: String): ByteArray {
        val size = fontSize.coerceIn(6f, 36f)
        val leading = size * 1.45
        val lines = wrap(text, size)
        val usableHeight = PAGE_HEIGHT - MARGIN * 2
        val linesPerPage = (usableHeight / leading).toInt().coerceAtLeast(1)
        val pages = if (lines.isEmpty()) listOf(listOf("")) else lines.chunked(linesPerPage)

        val objects = mutableListOf<ByteArray>()
        objects += ascii("<< /Type /Catalog /Pages 2 0 R >>")
        val pagesObject = StringBuilder()
        val fontObject = 3
        val firstContent = 4
        val kids = pages.indices.map { firstContent + it * 2 + 1 }
        pagesObject.append("<< /Type /Pages /Kids [")
        pagesObject.append(kids.joinToString(" ") { "$it 0 R" })
        pagesObject.append("] /Count ${pages.size} >>")
        objects += ascii(pagesObject.toString())
        objects += ascii("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>")

        pages.forEachIndexed { index, pageLines ->
            val contentId = firstContent + index * 2
            val body = StringBuilder("BT\n/F1 ").append(trim(size)).append(" Tf\n")
            pageLines.forEachIndexed { lineIndex, line ->
                val y = PAGE_HEIGHT - MARGIN - size - lineIndex * leading
                body.append("1 0 0 1 ").append(trim(MARGIN)).append(' ').append(trim(y)).append(" Tm (")
                    .append(escape(line)).append(") Tj\n")
            }
            body.append("ET")
            val stream = body.toString().toByteArray(Charsets.ISO_8859_1)
            objects += ascii("<< /Length ${stream.size} >>\nstream\n").plus(stream).plus(ascii("\nendstream"))
            objects += ascii(
                "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${trim(PAGE_WIDTH)} ${trim(PAGE_HEIGHT)}] " +
                    "/Resources << /Font << /F1 $fontObject 0 R >> >> /Contents $contentId 0 R >>",
            )
        }
        return assemble(objects, title)
    }

    internal fun imagePdf(pages: List<JpegPage>): ByteArray {
        val usable = pages.ifEmpty { listOf(JpegPage(ByteArray(0), 1, 1)) }
        val objects = mutableListOf<ByteArray>()
        objects += ascii("<< /Type /Catalog /Pages 2 0 R >>")
        // Layout: 1 catalog, 2 pages, then per image: image xobject, content, page
        val kids = usable.indices.map { 5 + it * 3 }
        objects += ascii("<< /Type /Pages /Kids [${kids.joinToString(" ") { "$it 0 R" }}] /Count ${usable.size} >>")

        usable.forEach { page ->
            val xobjectId = objects.size + 1
            val contentId = xobjectId + 1
            val pageId = xobjectId + 2
            objects += ascii(
                "<< /Type /XObject /Subtype /Image /Width ${page.width} /Height ${page.height} " +
                    "/ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${page.bytes.size} >>\nstream\n",
            ).plus(page.bytes).plus(ascii("\nendstream"))
            val scale = minOf(
                (PAGE_WIDTH - MARGIN * 2) / page.width,
                (PAGE_HEIGHT - MARGIN * 2) / page.height,
            )
            val drawWidth = page.width * scale
            val drawHeight = page.height * scale
            val offsetX = (PAGE_WIDTH - drawWidth) / 2
            val offsetY = (PAGE_HEIGHT - drawHeight) / 2
            val content = "q\n${trim(drawWidth)} 0 0 ${trim(drawHeight)} ${trim(offsetX)} ${trim(offsetY)} cm\n/Im0 Do\nQ"
                .toByteArray(Charsets.ISO_8859_1)
            objects += ascii("<< /Length ${content.size} >>\nstream\n").plus(content).plus(ascii("\nendstream"))
            objects += ascii(
                "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${trim(PAGE_WIDTH)} ${trim(PAGE_HEIGHT)}] " +
                    "/Resources << /XObject << /Im0 $xobjectId 0 R >> >> /Contents $contentId 0 R >>",
            )
            check(pageId == objects.size) { "page numbering drifted" }
        }
        return assemble(objects, "Toolz image document")
    }

    private fun assemble(objects: List<ByteArray>, title: String): ByteArray {
        val all = objects + ascii("<< /Title (${escape(title)}) /Producer (Toolz) /Creator (Toolz) >>")
        val out = ByteArrayOutputStream()
        out.write("%PDF-1.4\n".toByteArray(Charsets.ISO_8859_1))
        val offsets = IntArray(all.size)
        all.forEachIndexed { index, body ->
            offsets[index] = out.size()
            out.write("${index + 1} 0 obj\n".toByteArray(Charsets.ISO_8859_1))
            out.write(body)
            out.write("\nendobj\n".toByteArray(Charsets.ISO_8859_1))
        }
        val xref = out.size()
        out.write("xref\n0 ${all.size + 1}\n".toByteArray(Charsets.ISO_8859_1))
        out.write("0000000000 65535 f \n".toByteArray(Charsets.ISO_8859_1))
        offsets.forEach { offset ->
            out.write(String.format(Locale.US, "%010d 00000 n \n", offset).toByteArray(Charsets.ISO_8859_1))
        }
        out.write(
            ("trailer\n<< /Size ${all.size + 1} /Root 1 0 R /Info ${all.size} 0 R >>\nstartxref\n$xref\n%%EOF\n")
                .toByteArray(Charsets.ISO_8859_1),
        )
        return out.toByteArray()
    }

    private fun ascii(text: String): ByteArray = text.toByteArray(Charsets.ISO_8859_1)

    private fun trim(value: Double): String = String.format(Locale.US, "%.2f", value).trimEnd('0').trimEnd('.')

    private fun escape(text: String): String {
        val out = StringBuilder()
        text.forEach { character ->
            when {
                character == '\\' -> out.append("\\\\")
                character == '(' -> out.append("\\(")
                character == ')' -> out.append("\\)")
                character.code in 32..126 -> out.append(character)
                character.code < 256 -> out.append("\\").append(Integer.toOctalString(character.code))
                else -> out.append('?')
            }
        }
        return out.toString()
    }
}
