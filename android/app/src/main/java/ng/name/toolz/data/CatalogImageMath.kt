package ng.name.toolz.data

import kotlin.math.roundToInt

/**
 * The image tools that need no pixels: aspect ratios, print sizes, resolution
 * checks and social-media dimensions. Everything here is arithmetic, so it runs
 * and is tested without touching a bitmap.
 */

private fun gcdInt(a: Int, b: Int): Int {
    var x = kotlin.math.abs(a)
    var y = kotlin.math.abs(b)
    while (y != 0) {
        val t = y
        y = x % y
        x = t
    }
    return if (x == 0) 1 else x
}

private val SOCIAL_PRESETS = listOf(
    "Instagram square" to (1080 to 1080),
    "Instagram portrait" to (1080 to 1350),
    "Instagram story" to (1080 to 1920),
    "X post" to (1600 to 900),
    "LinkedIn post" to (1200 to 627),
    "Facebook post" to (1200 to 630),
    "YouTube thumbnail" to (1280 to 720),
    "Pinterest pin" to (1000 to 1500),
)

internal val imageTools1 = listOf(
    Tool(
        slug = "image-dimension", title = "Image Dimensions", category = "images",
        tagline = "Resize keeping the ratio exact, and name the ratio.",
        keywords = listOf("image size", "aspect ratio", "resize"),
        fields = listOf(
            field("width", "Original width (px)", FieldKind.NUMBER, default = "4032"),
            field("height", "Original height (px)", FieldKind.NUMBER, default = "3024"),
            field("target", "Target width (px, 0 to skip)", FieldKind.NUMBER, default = "1600"),
        ),
        compute = { input ->
            val width = (input.num("width") ?: 0.0).toInt()
            val height = (input.num("height") ?: 0.0).toInt()
            if (width <= 0 || height <= 0) return@Tool err("Width and height must be greater than zero.")
            val divisor = gcdInt(width, height)
            val ratio = "${width / divisor}:${height / divisor}"
            val target = (input.num("target") ?: 0.0).toInt()
            if (target <= 0) {
                return@Tool ToolResult(
                    "Aspect ratio",
                    ratio,
                    listOf("Decimal" to fmt(width.toDouble() / height, 4), "Megapixels" to fmt(width.toDouble() * height / 1_000_000, 2)),
                )
            }
            val scaledHeight = (target.toDouble() * height / width).roundToInt().coerceAtLeast(1)
            ToolResult(
                "$target × $scaledHeight",
                "Same ${ratio} shape, ${fmt(100.0 * target / width, 1)}% of the width",
                listOf(
                    "Original" to "$width × $height",
                    "Aspect ratio" to ratio,
                    "Scaled megapixels" to fmt(target.toDouble() * scaledHeight / 1_000_000, 2),
                    "Rounding drift" to fmt(scaledHeight - target.toDouble() * height / width, 2) + " px",
                ),
                note = "Scale down in one step, not several: repeated resizes soften detail each time.",
            )
        },
    ),
    Tool(
        slug = "image-dpi", title = "Image DPI and Print Size", category = "images",
        tagline = "How big a file prints at a given DPI.",
        keywords = listOf("dpi", "print size", "ppi"),
        fields = listOf(
            field("width", "Width (px)", FieldKind.NUMBER, default = "3000"),
            field("height", "Height (px)", FieldKind.NUMBER, default = "2000"),
            field("dpi", "Print resolution (DPI)", FieldKind.NUMBER, default = "300"),
        ),
        compute = { input ->
            val width = input.num("width") ?: return@Tool err("Enter the pixel width.")
            val height = input.num("height") ?: return@Tool err("Enter the pixel height.")
            val dpi = input.num("dpi") ?: return@Tool err("Enter the DPI.")
            if (width <= 0 || height <= 0 || dpi <= 0) return@Tool err("All three values must be greater than zero.")
            val inchesWide = width / dpi
            val inchesHigh = height / dpi
            val a4Fits = inchesWide <= 8.27 && inchesHigh <= 11.69
            ToolResult(
                "${fmt(inchesWide, 2)} × ${fmt(inchesHigh, 2)} in",
                "${fmt(inchesWide * 2.54, 1)} × ${fmt(inchesHigh * 2.54, 1)} cm at ${fmt(dpi, 0)} DPI",
                listOf(
                    "A4 portrait" to (if (a4Fits) "fits at full resolution" else "needs scaling down"),
                    "At 150 DPI" to "${fmt(width / 150.0, 1)} × ${fmt(height / 150.0, 1)} in",
                    "At 72 DPI" to "${fmt(width / 72.0, 1)} × ${fmt(height / 72.0, 1)} in",
                    "Megapixels" to fmt(width * height / 1_000_000, 2),
                ),
                note = "300 DPI is the usual print standard; screens ignore DPI and use the pixel count.",
            )
        },
    ),
    Tool(
        slug = "image-resolution", title = "Resolution Checker", category = "images",
        tagline = "Megapixels, ratio and the print sizes that hold up.",
        keywords = listOf("resolution", "megapixels", "quality"),
        fields = listOf(
            field("width", "Width (px)", FieldKind.NUMBER, default = "1920"),
            field("height", "Height (px)", FieldKind.NUMBER, default = "1080"),
        ),
        compute = { input ->
            val width = (input.num("width") ?: 0.0).toInt()
            val height = (input.num("height") ?: 0.0).toInt()
            if (width <= 0 || height <= 0) return@Tool err("Width and height must be greater than zero.")
            val megapixels = width.toDouble() * height / 1_000_000
            val divisor = gcdInt(width, height)
            val label = when {
                megapixels < 0.5 -> "small: fine for icons and thumbnails"
                megapixels < 2 -> "web-sized"
                megapixels < 8 -> "good for social and small prints"
                megapixels < 20 -> "print-ready up to A3"
                else -> "high resolution: check file size before uploading"
            }
            ToolResult(
                "${fmt(megapixels, 2)} MP",
                label,
                listOf(
                    "Aspect ratio" to "${width / divisor}:${height / divisor}",
                    "4 × 6 in print" to (if (width / 300.0 >= 4 && height / 300.0 >= 6) "sharp at 300 DPI" else "soft at 300 DPI"),
                    "A4 at 300 DPI" to (if (width >= 2480 && height >= 3508) "enough pixels" else "not enough pixels"),
                    "A4 at 150 DPI" to (if (width >= 1240 && height >= 1754) "enough pixels" else "not enough pixels"),
                ),
                note = "Print quality depends on viewing distance as well as DPI; a billboard needs far fewer pixels per inch than a passport photo.",
            )
        },
    ),
    Tool(
        slug = "social-image-size", title = "Social Image Size Check", category = "images",
        tagline = "Will this crop cleanly on each network?",
        keywords = listOf("social media", "image size", "crop"),
        fields = listOf(
            field("width", "Your width (px)", FieldKind.NUMBER, default = "1200"),
            field("height", "Your height (px)", FieldKind.NUMBER, default = "628"),
        ),
        compute = { input ->
            val width = (input.num("width") ?: 0.0).toInt()
            val height = (input.num("height") ?: 0.0).toInt()
            if (width <= 0 || height <= 0) return@Tool err("Width and height must be greater than zero.")
            val yourRatio = width.toDouble() / height
            val report = SOCIAL_PRESETS.map { (name, size) ->
                val (presetWidth, presetHeight) = size
                val presetRatio = presetWidth.toDouble() / presetHeight
                val verdict = when {
                    width == presetWidth && height == presetHeight -> "exact"
                    kotlin.math.abs(yourRatio - presetRatio) < 0.01 -> "right shape, rescale to ${presetWidth}×$presetHeight"
                    yourRatio > presetRatio -> "too wide: will crop top and bottom"
                    else -> "too tall: will crop the sides"
                }
                "$name ($presetWidth×$presetHeight) · $verdict"
            }.joinToString("\n")
            val exact = SOCIAL_PRESETS.count { (_, size) -> size.first == width && size.second == height }
            ToolResult(
                if (exact > 0) "Matches $exact preset${if (exact == 1) "" else "s"}" else "No exact match",
                report,
                listOf("Your ratio" to fmt(yourRatio, 3), "Presets checked" to SOCIAL_PRESETS.size.toString()),
                note = "Every network crops differently in practice. Keep the subject inside a central square and it survives most of them.",
            )
        },
    ),
)
