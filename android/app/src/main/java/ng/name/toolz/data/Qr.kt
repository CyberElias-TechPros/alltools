package ng.name.toolz.data

import com.google.zxing.BarcodeFormat
import com.google.zxing.EncodeHintType
import com.google.zxing.qrcode.QRCodeWriter

/**
 * Renders a QR code as block characters so it can be shown, copied and even
 * scanned straight off the screen — no image file, no permissions, no upload.
 */
internal fun qrBlocks(text: String, modules: Int = 29): String? = runCatching {
    val hints = mapOf(
        EncodeHintType.MARGIN to 2,
        EncodeHintType.CHARACTER_SET to "UTF-8",
    )
    val matrix = QRCodeWriter().encode(text, BarcodeFormat.QR_CODE, modules, modules, hints)
    buildString {
        for (y in 0 until matrix.height) {
            for (x in 0 until matrix.width) {
                append(if (matrix.get(x, y)) "██" else "  ")
            }
            append('\n')
        }
    }
}.getOrNull()
