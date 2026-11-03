package ng.name.toolz.media

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Matrix
import android.graphics.Paint
import androidx.exifinterface.media.ExifInterface
import com.google.zxing.BarcodeFormat
import com.google.zxing.BinaryBitmap
import com.google.zxing.DecodeHintType
import com.google.zxing.MultiFormatReader
import com.google.zxing.RGBLuminanceSource
import com.google.zxing.common.HybridBinarizer
import java.io.ByteArrayInputStream
import java.io.ByteArrayOutputStream

/** Bitmap work for the image tools. Every operation stays in memory. */
internal object ImageEngine {

    fun decode(bytes: ByteArray, maxEdge: Int = 4096): Bitmap {
        val bounds = BitmapFactory.Options().apply { inJustDecodeBounds = true }
        BitmapFactory.decodeByteArray(bytes, 0, bytes.size, bounds)
        if (bounds.outWidth <= 0 || bounds.outHeight <= 0) throw MediaError("That file is not an image this phone can read.")
        var sample = 1
        while (maxOf(bounds.outWidth, bounds.outHeight) / (sample * 2) >= maxEdge) sample *= 2
        val options = BitmapFactory.Options().apply {
            inSampleSize = sample
            inPreferredConfig = Bitmap.Config.ARGB_8888
        }
        val decoded = BitmapFactory.decodeByteArray(bytes, 0, bytes.size, options)
            ?: throw MediaError("The image could not be decoded.")
        return applyExifRotation(decoded, bytes)
    }

    private fun applyExifRotation(bitmap: Bitmap, bytes: ByteArray): Bitmap {
        val orientation = runCatching {
            ExifInterface(ByteArrayInputStream(bytes)).getAttributeInt(
                ExifInterface.TAG_ORIENTATION,
                ExifInterface.ORIENTATION_NORMAL,
            )
        }.getOrDefault(ExifInterface.ORIENTATION_NORMAL)
        val matrix = Matrix()
        when (orientation) {
            ExifInterface.ORIENTATION_ROTATE_90 -> matrix.postRotate(90f)
            ExifInterface.ORIENTATION_ROTATE_180 -> matrix.postRotate(180f)
            ExifInterface.ORIENTATION_ROTATE_270 -> matrix.postRotate(270f)
            ExifInterface.ORIENTATION_FLIP_HORIZONTAL -> matrix.postScale(-1f, 1f)
            ExifInterface.ORIENTATION_FLIP_VERTICAL -> matrix.postScale(1f, -1f)
            else -> return bitmap
        }
        return runCatching { Bitmap.createBitmap(bitmap, 0, 0, bitmap.width, bitmap.height, matrix, true) }
            .getOrDefault(bitmap)
    }

    fun encode(bitmap: Bitmap, format: String, quality: Int = 90): Pair<ByteArray, String> {
        val out = ByteArrayOutputStream()
        when (format.uppercase()) {
            "JPEG", "JPG" -> {
                val flat = flatten(bitmap, Color.WHITE)
                flat.compress(Bitmap.CompressFormat.JPEG, quality.coerceIn(1, 100), out)
                return out.toByteArray() to "image/jpeg"
            }
            "WEBP" -> {
                @Suppress("DEPRECATION")
                bitmap.compress(Bitmap.CompressFormat.WEBP, quality.coerceIn(1, 100), out)
                return out.toByteArray() to "image/webp"
            }
            else -> {
                bitmap.compress(Bitmap.CompressFormat.PNG, 100, out)
                return out.toByteArray() to "image/png"
            }
        }
    }

    fun flatten(bitmap: Bitmap, colour: Int): Bitmap {
        val output = Bitmap.createBitmap(bitmap.width, bitmap.height, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(output)
        canvas.drawColor(colour)
        canvas.drawBitmap(bitmap, 0f, 0f, Paint(Paint.ANTI_ALIAS_FLAG))
        return output
    }

    private fun scale(bitmap: Bitmap, width: Int, height: Int, smooth: Boolean): Bitmap =
        Bitmap.createScaledBitmap(bitmap, width.coerceAtLeast(1), height.coerceAtLeast(1), smooth)

    private fun boxBlur(source: Bitmap, radius: Int): Bitmap {
        val width = source.width
        val height = source.height
        val pixels = IntArray(width * height)
        source.getPixels(pixels, 0, width, 0, 0, width, height)
        val temporary = IntArray(width * height)
        blurPass(pixels, temporary, width, height, radius, horizontal = true)
        blurPass(temporary, pixels, width, height, radius, horizontal = false)
        val output = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
        output.setPixels(pixels, 0, width, 0, 0, width, height)
        return output
    }

    private fun blurPass(input: IntArray, output: IntArray, width: Int, height: Int, radius: Int, horizontal: Boolean) {
        val outer = if (horizontal) height else width
        val inner = if (horizontal) width else height
        val window = radius * 2 + 1
        for (line in 0 until outer) {
            var red = 0
            var green = 0
            var blue = 0
            var alpha = 0
            fun index(at: Int) = if (horizontal) line * width + at else at * width + line
            for (offset in -radius..radius) {
                val clamped = offset.coerceIn(0, inner - 1)
                val colour = input[index(clamped)]
                red += Color.red(colour)
                green += Color.green(colour)
                blue += Color.blue(colour)
                alpha += Color.alpha(colour)
            }
            for (position in 0 until inner) {
                output[index(position)] = Color.argb(alpha / window, red / window, green / window, blue / window)
                val add = (position + radius + 1).coerceAtMost(inner - 1)
                val remove = (position - radius).coerceAtLeast(0)
                val added = input[index(add)]
                val removed = input[index(remove)]
                red += Color.red(added) - Color.red(removed)
                green += Color.green(added) - Color.green(removed)
                blue += Color.blue(added) - Color.blue(removed)
                alpha += Color.alpha(added) - Color.alpha(removed)
            }
        }
    }

    private fun sniffMime(bytes: ByteArray): String = when {
        bytes.size >= 3 && bytes[0] == 0xFF.toByte() && bytes[1] == 0xD8.toByte() -> "image/jpeg"
        bytes.size >= 8 && bytes[0] == 0x89.toByte() && bytes[1] == 0x50.toByte() -> "image/png"
        bytes.size >= 12 && bytes[0] == 'R'.code.toByte() && bytes[8] == 'W'.code.toByte() -> "image/webp"
        bytes.size >= 3 && bytes[0] == 'G'.code.toByte() -> "image/gif"
        else -> "image/*"
    }

    fun run(slug: String, options: Map<String, String>, input: ByteArray, name: String): MediaOutput {
        val base = sanitiseName(name, "image")
        return when (slug) {
            "base64-to-image" -> {
                val decoded = decodeBase64Image(options["base64"].orEmpty())
                    ?: throw MediaError("That does not decode as base64. Paste the payload or the whole data URI.")
                val bitmap = decode(decoded, 2400)
                MediaOutput(
                    "Decoded",
                    "${bitmap.width} × ${bitmap.height} px",
                    listOf("Size" to humanBytes(decoded.size.toLong()), "Format" to sniffMime(decoded)),
                    preview = bitmap,
                    bytes = decoded,
                    mime = sniffMime(decoded),
                    fileName = "$base.png",
                )
            }
            "image-to-base64" -> {
                val encoded = encodeBase64(input)
                val prefix = if (options["wrap"] == "true") "data:${sniffMime(input)};base64," else ""
                MediaOutput(
                    "Base64",
                    encoded,
                    listOf("Characters" to encoded.length.toString(), "Size" to humanBytes(input.size.toLong())),
                    preview = decode(input, 600),
                    bytes = (prefix + encoded).toByteArray(),
                    mime = "text/plain",
                    fileName = "$base.txt",
                )
            }
            "exif-data" -> {
                val exif = ExifInterface(ByteArrayInputStream(input))
                val fields = listOf(
                    "Make" to exif.getAttribute(ExifInterface.TAG_MAKE),
                    "Model" to exif.getAttribute(ExifInterface.TAG_MODEL),
                    "Lens" to exif.getAttribute(ExifInterface.TAG_LENS_MODEL),
                    "Date taken" to exif.getAttribute(ExifInterface.TAG_DATETIME_ORIGINAL),
                    "Exposure" to exif.getAttribute(ExifInterface.TAG_EXPOSURE_TIME),
                    "Aperture" to exif.getAttribute(ExifInterface.TAG_F_NUMBER),
                    "ISO" to exif.getAttribute(ExifInterface.TAG_PHOTOGRAPHIC_SENSITIVITY),
                    "Focal length" to exif.getAttribute(ExifInterface.TAG_FOCAL_LENGTH),
                    "Flash" to exif.getAttribute(ExifInterface.TAG_FLASH),
                    "Orientation" to exif.getAttribute(ExifInterface.TAG_ORIENTATION),
                    "GPS" to listOfNotNull(
                        exif.getLatLong()?.let { "%.5f, %.5f".format(it[0], it[1]) },
                    ).firstOrNull(),
                ).filter { !it.second.isNullOrBlank() }
                if (fields.isEmpty()) throw MediaError("This file carries no EXIF block.")
                MediaOutput(
                    "${fields.size} tags",
                    fields.joinToString("\n") { "${it.first}: ${it.second}" },
                    preview = decode(input, 600),
                    bytes = fields.joinToString("\n") { "${it.first}: ${it.second}" }.toByteArray(),
                    mime = "text/plain",
                    fileName = "$base-exif.txt",
                )
            }
            "image-metadata" -> {
                val bitmap = decode(input, 2400)
                MediaOutput(
                    "${bitmap.width} × ${bitmap.height}",
                    "%.2f MP · %s · %s".format(
                        bitmap.width * bitmap.height / 1_000_000.0,
                        sniffMime(input),
                        humanBytes(input.size.toLong()),
                    ),
                    listOf(
                        "Width" to "${bitmap.width} px",
                        "Height" to "${bitmap.height} px",
                        "Aspect" to "%.4f".format(bitmap.width.toDouble() / bitmap.height),
                        "File size" to humanBytes(input.size.toLong()),
                        "Format" to sniffMime(input),
                    ),
                    preview = bitmap,
                )
            }
            "favicon-generator" -> {
                val size = options["size"]?.toIntOrNull() ?: 192
                val cropped = centreSquare(decode(input, 2048))
                val scaled = scale(cropped, size, size, true)
                val (bytes, mime) = encode(scaled, "PNG")
                MediaOutput(
                    "$size × $size PNG",
                    humanBytes(bytes.size.toLong()),
                    listOf("Sizes to export" to "32, 48, 180, 192, 512", "Source crop" to "${cropped.width} px square"),
                    preview = scaled,
                    bytes = bytes,
                    mime = mime,
                    fileName = "$base-$size.png",
                )
            }
            "image-background" -> {
                val colour = parseColour(options["colour"].orEmpty()) ?: throw MediaError("Use a colour like #FFFFFF.")
                val flat = flatten(decode(input, 3000), colour)
                val (bytes, mime) = encode(flat, "JPEG", 92)
                MediaOutput("Flattened", humanBytes(bytes.size.toLong()), listOf("Background" to hexOf(colour)), preview = flat, bytes = bytes, mime = mime, fileName = "$base-flat.jpg")
            }
            "image-blur" -> {
                val radius = (options["radius"]?.toIntOrNull() ?: 6).coerceIn(1, 60)
                val source = decode(input, 1200)
                val blurred = boxBlur(source, radius)
                val (bytes, mime) = encode(blurred, "PNG")
                MediaOutput("Blurred", "radius $radius px on a ${source.width} × ${source.height} copy", listOf("Size" to humanBytes(bytes.size.toLong())), preview = blurred, bytes = bytes, mime = mime, fileName = "$base-blur.png")
            }
            "image-colour-picker" -> {
                val bitmap = decode(input, 1200)
                val x = ((options["x"]?.toDoubleOrNull() ?: 50.0) / 100 * (bitmap.width - 1)).toInt().coerceIn(0, bitmap.width - 1)
                val y = ((options["y"]?.toDoubleOrNull() ?: 50.0) / 100 * (bitmap.height - 1)).toInt().coerceIn(0, bitmap.height - 1)
                val sample = bitmap.getPixel(x, y)
                val tiny = scale(bitmap, 1, 1, true)
                val average = tiny.getPixel(0, 0)
                MediaOutput(
                    hexOf(sample),
                    "Average ${hexOf(average)}",
                    listOf("At" to "$x, $y", "R G B" to "${Color.red(sample)} ${Color.green(sample)} ${Color.blue(sample)}", "Average RGB" to "${Color.red(average)} ${Color.green(average)} ${Color.blue(average)}"),
                    preview = bitmap,
                )
            }
            "image-compressor", "png-to-jpg" -> {
                val quality = clampQuality(options["quality"], 82)
                val bitmap = decode(input, 4096)
                val (bytes, mime) = encode(bitmap, "JPEG", quality)
                val saved = input.size - bytes.size
                MediaOutput(
                    humanBytes(bytes.size.toLong()),
                    if (saved > 0) "${humanBytes(saved.toLong())} smaller (${"%.0f".format(saved * 100.0 / input.size)}%)" else "already smaller than the re-encode",
                    listOf("Quality" to quality.toString(), "Before" to humanBytes(input.size.toLong()), "After" to humanBytes(bytes.size.toLong())),
                    preview = bitmap,
                    bytes = bytes,
                    mime = mime,
                    fileName = "$base-q$quality.jpg",
                )
            }
            "image-cropper" -> {
                val bitmap = decode(input, 4096)
                val rect = cropRect(bitmap.width, bitmap.height, options["shape"] ?: "Centre square")
                val cropped = Bitmap.createBitmap(bitmap, rect[0], rect[1], rect[2], rect[3])
                val (bytes, mime) = encode(cropped, "PNG")
                MediaOutput(
                    "${cropped.width} × ${cropped.height}",
                    "Cropped from ${bitmap.width} × ${bitmap.height}",
                    listOf("Shape" to (options["shape"] ?: "Centre square"), "Size" to humanBytes(bytes.size.toLong())),
                    preview = cropped,
                    bytes = bytes,
                    mime = mime,
                    fileName = "$base-crop.png",
                )
            }
            "image-format" , "jpg-to-png", "webp-converter" -> {
                val format = when (slug) {
                    "jpg-to-png" -> "PNG"
                    "webp-converter" -> "WEBP"
                    else -> options["format"] ?: "PNG"
                }
                val quality = clampQuality(options["quality"], 85)
                val bitmap = decode(input, 4096)
                val (bytes, mime) = encode(bitmap, format, quality)
                MediaOutput(
                    format.uppercase(),
                    "${humanBytes(input.size.toLong())} → ${humanBytes(bytes.size.toLong())}",
                    listOf("Quality" to (if (format.equals("PNG", true)) "lossless" else quality.toString()), "Dimensions" to "${bitmap.width} × ${bitmap.height}"),
                    preview = bitmap,
                    bytes = bytes,
                    mime = mime,
                    fileName = "$base.${format.lowercase().let { if (it == "jpeg") "jpg" else it }}",
                )
            }
            "image-pixelator" -> {
                val blocks = (options["blocks"]?.toIntOrNull() ?: 24).coerceIn(4, 200)
                val source = decode(input, 1600)
                val small = scale(source, blocks, maxOf(1, blocks * source.height / source.width), true)
                val pixelated = scale(small, source.width, source.height, false)
                val (bytes, mime) = encode(pixelated, "PNG")
                MediaOutput("Pixelated", "$blocks blocks across", listOf("Size" to humanBytes(bytes.size.toLong())), preview = pixelated, bytes = bytes, mime = mime, fileName = "$base-pixel.png")
            }
            "image-resizer" -> {
                val maxEdge = (options["max"]?.toIntOrNull() ?: 1600).coerceIn(16, 8192)
                val source = decode(input, 8192)
                val (width, height) = targetLongEdge(source.width, source.height, maxEdge)
                val resized = scale(source, width, height, true)
                val (bytes, mime) = encode(resized, "PNG")
                MediaOutput(
                    "$width × $height",
                    "${humanBytes(input.size.toLong())} → ${humanBytes(bytes.size.toLong())}",
                    listOf("Longest edge" to maxEdge.toString(), "Original" to "${source.width} × ${source.height}"),
                    preview = resized,
                    bytes = bytes,
                    mime = mime,
                    fileName = "$base-$width.png",
                )
            }
            "qr-code-reader" -> {
                val bitmap = decode(input, 2048)
                val width = bitmap.width
                val height = bitmap.height
                val pixels = IntArray(width * height)
                bitmap.getPixels(pixels, 0, width, 0, 0, width, height)
                val source = RGBLuminanceSource(width, height, pixels)
                val binary = BinaryBitmap(HybridBinarizer(source))
                val reader = MultiFormatReader().apply {
                    setHints(mapOf(DecodeHintType.POSSIBLE_FORMATS to listOf(BarcodeFormat.QR_CODE)))
                }
                val result = runCatching { reader.decode(binary) }.getOrElse {
                    throw MediaError("No QR code found in that picture. Crop closer and try again.")
                }
                MediaOutput(
                    "Read",
                    result.text,
                    listOf("Format" to result.barcodeFormat.name, "Characters" to result.text.length.toString()),
                    preview = bitmap,
                    bytes = result.text.toByteArray(),
                    mime = "text/plain",
                    fileName = "$base-qr.txt",
                )
            }
            else -> throw MediaError("That image tool is not wired up yet.")
        }
    }

    private fun centreSquare(bitmap: Bitmap): Bitmap {
        val side = minOf(bitmap.width, bitmap.height)
        val left = (bitmap.width - side) / 2
        val top = (bitmap.height - side) / 2
        return Bitmap.createBitmap(bitmap, left, top, side, side)
    }

}
