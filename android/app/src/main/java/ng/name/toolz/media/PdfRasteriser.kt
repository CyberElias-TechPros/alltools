package ng.name.toolz.media

import android.content.Context
import android.graphics.Bitmap
import android.graphics.Color
import android.graphics.pdf.PdfRenderer
import android.os.ParcelFileDescriptor
import java.io.ByteArrayOutputStream
import java.io.File

/** Pages to pixels, using the PDF renderer that ships with Android. */
object PdfRasteriser {

    fun pageCount(context: Context, pdf: ByteArray): Int = withRenderer(context, pdf) { it.pageCount }

    fun render(
        context: Context,
        pdf: ByteArray,
        dpi: Int,
        jpeg: Boolean,
        quality: Int = 84,
        pageLimit: Int? = null,
    ): List<Pair<String, ByteArray>> = withRenderer(context, pdf) { renderer ->
        val scale = dpi.coerceIn(48, 300) / 72f
        val pages = (pageLimit ?: renderer.pageCount).coerceAtMost(renderer.pageCount)
        (0 until pages).map { index ->
            renderer.openPage(index).use { page ->
                val width = (page.width * scale).toInt().coerceAtLeast(8)
                val height = (page.height * scale).toInt().coerceAtLeast(8)
                val bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
                bitmap.eraseColor(Color.WHITE)
                page.render(bitmap, null, null, PdfRenderer.Page.RENDER_MODE_FOR_DISPLAY)
                val out = ByteArrayOutputStream()
                val extension: String
                if (jpeg) {
                    bitmap.compress(Bitmap.CompressFormat.JPEG, quality.coerceIn(30, 100), out)
                    extension = "jpg"
                } else {
                    bitmap.compress(Bitmap.CompressFormat.PNG, 100, out)
                    extension = "png"
                }
                bitmap.recycle()
                "page-%03d.%s".format(index + 1, extension) to out.toByteArray()
            }
        }
    }

    private fun <T> withRenderer(context: Context, pdf: ByteArray, block: (PdfRenderer) -> T): T {
        if (pdf.size < 5 || String(pdf, 0, 5, Charsets.ISO_8859_1) != "%PDF-") {
            throw MediaError("That file is not a PDF.")
        }
        val file = File.createTempFile("toolz-render", ".pdf", context.cacheDir)
        var descriptor: ParcelFileDescriptor? = null
        return try {
            file.writeBytes(pdf)
            descriptor = ParcelFileDescriptor.open(file, ParcelFileDescriptor.MODE_READ_ONLY)
            PdfRenderer(descriptor).use { renderer -> block(renderer) }
        } finally {
            runCatching { descriptor?.close() }
            runCatching { file.delete() }
        }
    }
}
