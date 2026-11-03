package ng.name.toolz

import android.graphics.Bitmap
import android.graphics.Color
import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.platform.app.InstrumentationRegistry
import com.google.zxing.BarcodeFormat
import com.google.zxing.qrcode.QRCodeWriter
import ng.name.toolz.data.toolBySlug
import ng.name.toolz.media.MediaEngine
import ng.name.toolz.media.MediaOutput
import ng.name.toolz.media.PdfRasteriser
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Test
import org.junit.runner.RunWith
import java.io.ByteArrayInputStream
import java.io.ByteArrayOutputStream
import java.util.zip.ZipInputStream
import java.util.zip.ZipOutputStream

/**
 * The 36 file-based tools cannot be exercised on the JVM, so they are proven
 * here, on a real device or emulator, against the same entry point the UI calls.
 */
@RunWith(AndroidJUnit4::class)
class MediaDeviceTest {

    private val context get() = InstrumentationRegistry.getInstrumentation().targetContext

    private fun run(slug: String, options: Map<String, String> = emptyMap(), inputs: List<Pair<String, ByteArray>> = emptyList()): MediaOutput =
        MediaEngine.run(context, toolBySlug(slug)!!, options, inputs)

    private fun photo(width: Int, height: Int, png: Boolean = true): ByteArray {
        val bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
        for (y in 0 until height) {
            for (x in 0 until width) {
                bitmap.setPixel(x, y, Color.rgb(x * 255 / width, y * 255 / height, 96))
            }
        }
        val out = ByteArrayOutputStream()
        bitmap.compress(if (png) Bitmap.CompressFormat.PNG else Bitmap.CompressFormat.JPEG, 95, out)
        bitmap.recycle()
        return out.toByteArray()
    }

    private fun textPdf(text: String, size: String = "12"): ByteArray {
        val result = run("text-to-pdf", mapOf("text" to text, "title" to "Device test", "size" to size))
        assertTrue("text-to-pdf failed: ${result.error}", result.error == null)
        return result.bytes!!
    }

    @Test
    fun textToPdfWritesARealDocument() {
        val pdf = textPdf("Hello device\n\nSecond paragraph")
        assertEquals("%PDF-1.4", String(pdf, 0, 8, Charsets.ISO_8859_1))
        assertEquals(1, PdfRasteriser.pageCount(context, pdf))
    }

    @Test
    fun longTextPaginates() {
        val pdf = textPdf((1..400).joinToString("\n") { "Line $it of the device test document" })
        assertTrue("expected several pages", PdfRasteriser.pageCount(context, pdf) > 1)
    }

    @Test
    fun pdfTextComesBackOut() {
        val pdf = textPdf("Alpha beta gamma")
        val text = run("pdf-to-text", inputs = listOf("a.pdf" to pdf))
        assertTrue("pdf-to-text failed: ${text.error}", text.error == null)
        assertTrue(text.summary.contains("Alpha beta gamma"))
    }

    @Test
    fun resizeAndCropAreExact() {
        val png = photo(400, 300)
        assertEquals("200 × 150", run("image-resizer", mapOf("max" to "200"), listOf("p.png" to png)).label)
        assertEquals("300 × 300", run("image-cropper", mapOf("shape" to "Centre square"), listOf("p.png" to png)).label)
    }

    @Test
    fun jpegConversionShrinksTheFile() {
        val png = photo(600, 400)
        val result = run("png-to-jpg", mapOf("quality" to "60"), listOf("p.png" to png))
        assertTrue("png-to-jpg failed: ${result.error}", result.error == null)
        assertEquals("image/jpeg", result.mime)
        assertTrue("a JPEG of a PNG should be smaller", result.bytes!!.size < png.size)
    }

    @Test
    fun qrCodesRoundTripThroughTheReader() {
        val payload = "https://toolz.name.ng/tools"
        val matrix = QRCodeWriter().encode(payload, BarcodeFormat.QR_CODE, 480, 480)
        val bitmap = Bitmap.createBitmap(matrix.width, matrix.height, Bitmap.Config.ARGB_8888)
        for (y in 0 until matrix.height) {
            for (x in 0 until matrix.width) {
                bitmap.setPixel(x, y, if (matrix.get(x, y)) Color.BLACK else Color.WHITE)
            }
        }
        val out = ByteArrayOutputStream()
        bitmap.compress(Bitmap.CompressFormat.PNG, 100, out)
        bitmap.recycle()
        val read = run("qr-code-reader", inputs = listOf("qr.png" to out.toByteArray()))
        assertTrue("qr-code-reader failed: ${read.error}", read.error == null)
        assertEquals(payload, read.summary)
    }

    @Test
    fun splittingAndMergingKeepThePages() {
        val twoPages = textPdf((1..120).joinToString("\n") { "Line $it" })
        assertEquals(2, PdfRasteriser.pageCount(context, twoPages))

        val split = run("pdf-splitter", mapOf("ranges" to ""), listOf("two.pdf" to twoPages))
        assertTrue("pdf-splitter failed: ${split.error}", split.error == null)
        assertEquals("application/zip", split.mime)
        val parts = unzip(split.bytes!!)
        assertEquals(2, parts.size)
        parts.values.forEach { assertEquals(1, PdfRasteriser.pageCount(context, it)) }

        val merged = run("pdf-merger", inputs = parts.entries.map { it.key to it.value })
        assertTrue("pdf-merger failed: ${merged.error}", merged.error == null)
        assertEquals(2, PdfRasteriser.pageCount(context, merged.bytes!!))
    }

    @Test
    fun extractReorderAndRotateKeepTheDocumentValid() {
        val twoPages = textPdf((1..120).joinToString("\n") { "Line $it" })

        val extracted = run("pdf-page-extractor", mapOf("pages" to "2"), listOf("two.pdf" to twoPages))
        assertTrue("extract failed: ${extracted.error}", extracted.error == null)
        assertEquals(1, PdfRasteriser.pageCount(context, extracted.bytes!!))

        val reordered = run("pdf-reorder", mapOf("order" to "2,1"), listOf("two.pdf" to twoPages))
        assertTrue("reorder failed: ${reordered.error}", reordered.error == null)
        assertEquals(2, PdfRasteriser.pageCount(context, reordered.bytes!!))

        val rotated = run("pdf-rotator", mapOf("angle" to "90"), listOf("two.pdf" to twoPages))
        assertTrue("rotate failed: ${rotated.error}", rotated.error == null)
        assertEquals(2, PdfRasteriser.pageCount(context, rotated.bytes!!))

        val stamped = run("pdf-watermark", mapOf("text" to "DRAFT", "opacity" to "18"), listOf("two.pdf" to twoPages))
        assertTrue("watermark failed: ${stamped.error}", stamped.error == null)
        assertEquals(2, PdfRasteriser.pageCount(context, stamped.bytes!!))
    }

    @Test
    fun renderingProducesImages() {
        val onePage = textPdf("Render me")
        val jpeg = run("pdf-to-jpg", mapOf("dpi" to "96"), listOf("a.pdf" to onePage))
        assertTrue("pdf-to-jpg failed: ${jpeg.error}", jpeg.error == null)
        assertEquals("image/jpeg", jpeg.mime)
        val bitmap = android.graphics.BitmapFactory.decodeByteArray(jpeg.bytes, 0, jpeg.bytes!!.size)
        assertNotNull("the rendered page should decode", bitmap)
        assertTrue(bitmap.width > 100)
    }

    @Test
    fun docxTextBecomesAPdf() {
        val docx = docxOf("Hello from Word")
        val converted = run("docx-to-pdf", inputs = listOf("letter.docx" to docx))
        assertTrue("docx-to-pdf failed: ${converted.error}", converted.error == null)
        assertEquals(1, PdfRasteriser.pageCount(context, converted.bytes!!))
        val counted = run("document-word-counter", inputs = listOf("letter.docx" to docx))
        assertEquals("3 words", counted.label)
    }

    @Test
    fun imageMetadataAndExifNeverPretendToKnowMore() {
        val png = photo(120, 80)
        val metadata = run("image-metadata", inputs = listOf("p.png" to png))
        assertEquals("120 × 80", metadata.label)
        val exif = run("exif-data", inputs = listOf("p.png" to png))
        assertTrue("PNG without EXIF should say so, not invent tags", exif.error != null)
    }

    @Test
    fun base64SurvivesBothWays() {
        val png = photo(64, 48)
        val encoded = run("image-to-base64", mapOf("wrap" to "false"), listOf("p.png" to png))
        assertTrue("image-to-base64 failed: ${encoded.error}", encoded.error == null)
        val decoded = run("base64-to-image", mapOf("base64" to encoded.summary))
        assertTrue("base64-to-image failed: ${decoded.error}", decoded.error == null)
        assertEquals("64 × 48 px", decoded.summary)
    }

    private fun unzip(zip: ByteArray): Map<String, ByteArray> {
        val entries = linkedMapOf<String, ByteArray>()
        ZipInputStream(ByteArrayInputStream(zip)).use { stream ->
            var entry = stream.nextEntry
            while (entry != null) {
                entries[entry.name] = stream.readBytes()
                entry = stream.nextEntry
            }
        }
        return entries
    }

    private fun docxOf(text: String): ByteArray {
        val out = ByteArrayOutputStream()
        ZipOutputStream(out).use { zip ->
            zip.putNextEntry(java.util.zip.ZipEntry("word/document.xml"))
            zip.write(
                ("<?xml version=\"1.0\"?><w:document><w:body><w:p><w:r><w:t>$text</w:t></w:r></w:p>" +
                    "</w:body></w:document>").toByteArray(),
            )
            zip.closeEntry()
        }
        return out.toByteArray()
    }
}
