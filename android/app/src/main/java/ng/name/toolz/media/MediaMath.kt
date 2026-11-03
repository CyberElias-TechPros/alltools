package ng.name.toolz.media

import java.io.ByteArrayInputStream
import java.io.ByteArrayOutputStream
import java.util.Base64
import java.util.Locale
import java.util.zip.ZipEntry
import java.util.zip.ZipInputStream
import java.util.zip.ZipOutputStream

/**
 * Everything the media tools do that is not a bitmap: page ranges, sizes,
 * names, colour parsing, docx text, zips and base64. All of it is pure Java, so
 * the JVM suite can hold it to account.
 */

internal fun humanBytes(bytes: Long): String {
    if (bytes < 1024) return "$bytes B"
    val units = listOf("KB", "MB", "GB", "TB")
    var value = bytes / 1024.0
    var index = 0
    while (value >= 1024 && index < units.lastIndex) {
        value /= 1024
        index++
    }
    val digits = if (value >= 100) 0 else if (value >= 10) 1 else 2
    return String.format(Locale.US, "%.${digits}f %s", value, units[index])
}

/** "1-3,5" with a 10 page document gives [1..3, 5..5]. Unknown or reversed parts are dropped. */
internal fun parsePageRanges(raw: String, pageCount: Int): List<IntRange> {
    if (pageCount <= 0) return emptyList()
    val trimmed = raw.trim()
    if (trimmed.isEmpty()) return (1..pageCount).map { it..it }
    val ranges = mutableListOf<IntRange>()
    trimmed.split(',', ';').forEach { part ->
        val piece = part.trim()
        if (piece.isEmpty()) return@forEach
        val bounds = piece.split('-').map { it.trim() }
        when {
            bounds.size == 1 -> {
                val page = bounds[0].toIntOrNull() ?: return@forEach
                if (page in 1..pageCount) ranges += page..page
            }
            bounds.size == 2 -> {
                val start = bounds[0].toIntOrNull() ?: return@forEach
                val end = bounds[1].toIntOrNull() ?: return@forEach
                if (start <= end) {
                    val from = start.coerceIn(1, pageCount)
                    val to = end.coerceIn(1, pageCount)
                    if (from <= to) ranges += from..to
                }
            }
        }
    }
    return ranges
}

/** Explicit page order "3,1,2" — every page once, else null. */
internal fun parsePageOrder(raw: String, pageCount: Int): List<Int>? {
    val pages = raw.split(',', ';', ' ').mapNotNull { it.trim().toIntOrNull() }
    if (pages.size != pageCount) return null
    if (pages.toSet().size != pageCount) return null
    if (pages.any { it !in 1..pageCount }) return null
    return pages
}

internal fun clampQuality(raw: String?, fallback: Int = 85): Int =
    (raw?.trim()?.toDoubleOrNull()?.toInt() ?: fallback).coerceIn(1, 100)

internal fun targetLongEdge(width: Int, height: Int, maxEdge: Int): Pair<Int, Int> {
    if (width <= 0 || height <= 0) return 1 to 1
    val longest = maxOf(width, height)
    if (maxEdge <= 0 || longest <= maxEdge) return width to height
    val scale = maxEdge.toDouble() / longest
    val newWidth = (width * scale).toInt().coerceAtLeast(1)
    val newHeight = (height * scale).toInt().coerceAtLeast(1)
    return newWidth to newHeight
}

/** Aspect crops expressed in whole pixels, centred on the source. */
internal fun cropRect(width: Int, height: Int, shape: String): IntArray {
    val safeWidth = width.coerceAtLeast(1)
    val safeHeight = height.coerceAtLeast(1)
    val targetRatio = when (shape) {
        "16:9" -> 16.0 / 9.0
        "4:3" -> 4.0 / 3.0
        else -> 1.0
    }
    val sourceRatio = safeWidth.toDouble() / safeHeight
    return if (sourceRatio > targetRatio) {
        val cropWidth = (safeHeight * targetRatio).toInt().coerceIn(1, safeWidth)
        val left = (safeWidth - cropWidth) / 2
        intArrayOf(left, 0, cropWidth, safeHeight)
    } else {
        val cropHeight = (safeWidth / targetRatio).toInt().coerceIn(1, safeHeight)
        val top = (safeHeight - cropHeight) / 2
        intArrayOf(0, top, safeWidth, cropHeight)
    }
}

internal fun sanitiseName(raw: String, fallback: String): String {
    val base = raw.substringAfterLast('/').substringAfterLast('\\').substringBeforeLast('.')
    val cleaned = base.replace(Regex("[^A-Za-z0-9 _-]"), "").trim().replace(Regex("\\s+"), "-")
    return cleaned.ifEmpty { fallback }.take(60)
}

/** "#fff", "#ffffff", "ffffff" and "rgb(1,2,3)" all work; null when nothing does. */
internal fun parseColour(text: String): Int? {
    val trimmed = text.trim().lowercase(Locale.UK)
    if (trimmed.startsWith("rgb")) {
        val numbers = trimmed.filter { it.isDigit() || it == ',' }.split(',').mapNotNull { it.trim().toIntOrNull() }
        if (numbers.size < 3) return null
        val red = numbers[0].coerceIn(0, 255)
        val green = numbers[1].coerceIn(0, 255)
        val blue = numbers[2].coerceIn(0, 255)
        return (0xFF shl 24) or (red shl 16) or (green shl 8) or blue
    }
    val hex = trimmed.removePrefix("#")
    return when (hex.length) {
        3 -> {
            val r = hex[0].digitToIntOrNull(16) ?: return null
            val g = hex[1].digitToIntOrNull(16) ?: return null
            val b = hex[2].digitToIntOrNull(16) ?: return null
            (0xFF shl 24) or (r * 17 shl 16) or (g * 17 shl 8) or (b * 17)
        }
        6, 8 -> {
            val value = hex.take(6).toLongOrNull(16) ?: return null
            (0xFF shl 24) or value.toInt()
        }
        else -> null
    }
}

internal fun hexOf(colour: Int): String = String.format(
    Locale.US,
    "#%02X%02X%02X",
    (colour shr 16) and 0xFF,
    (colour shr 8) and 0xFF,
    colour and 0xFF,
)

/** Strips a data URI prefix if there is one, then decodes. */
internal fun decodeBase64Image(input: String): ByteArray? {
    val body = input.trim()
        .substringAfter("base64,", input.trim())
        .replace(Regex("\\s+"), "")
    if (body.isEmpty()) return null
    return runCatching { Base64.getDecoder().decode(body) }
        .getOrElse { runCatching { Base64.getMimeDecoder().decode(body) }.getOrNull() }
}

internal fun encodeBase64(bytes: ByteArray): String = Base64.getEncoder().encodeToString(bytes)

/** Word document text out of the .docx zip: paragraphs become lines. */
internal fun extractDocxText(bytes: ByteArray): String? {
    val entry = runCatching {
        ZipInputStream(ByteArrayInputStream(bytes)).use { zip ->
            var current = zip.nextEntry
            while (current != null) {
                if (current.name == "word/document.xml") {
                    return@use zip.readBytes()
                }
                current = zip.nextEntry
            }
            null
        }
    }.getOrNull() ?: return null
    val xml = String(entry, Charsets.UTF_8)
    return xml
        .replace(Regex("</w:p>"), "\n")
        .replace(Regex("<w:tab[^>]*/>"), "\t")
        .replace(Regex("<w:br[^>]*/>"), "\n")
        .replace(Regex("<[^>]+>"), "")
        .replace("&amp;", "&")
        .replace("&lt;", "<")
        .replace("&gt;", ">")
        .replace("&quot;", "\"")
        .replace("&apos;", "'")
        .lines()
        .joinToString("\n") { it.trim() }
        .replace(Regex("\n{3,}"), "\n\n")
        .trim()
}

internal fun countWords(text: String): Int =
    text.split(Regex("[^A-Za-z0-9'’-]+")).count { it.isNotBlank() }

internal fun zipOf(entries: List<Pair<String, ByteArray>>): ByteArray {
    val out = ByteArrayOutputStream()
    ZipOutputStream(out).use { zip ->
        entries.forEach { (name, data) ->
            zip.putNextEntry(ZipEntry(name))
            zip.write(data)
            zip.closeEntry()
        }
    }
    return out.toByteArray()
}
