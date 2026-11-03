package ng.name.toolz.data

import java.time.ZoneId
import java.time.ZonedDateTime
import java.time.format.DateTimeFormatter
import java.util.Locale
import kotlin.math.ceil
import kotlin.math.pow

/**
 * The tools that exist in the app and are awkward in a mobile browser tab:
 * diffs, time zones, JWT inspection, area, passphrases and depreciation.
 */

internal val extraTools = listOf(
    Tool(
        slug = "text-diff", title = "Text Diff", category = "text",
        tagline = "What changed between two versions, line by line.",
        keywords = listOf("diff", "compare text", "changes"),
        fields = listOf(
            field("before", "Before", FieldKind.MULTILINE, placeholder = "First version…"),
            field("after", "After", FieldKind.MULTILINE, placeholder = "Second version…"),
        ),
        compute = { input ->
            val before = input["before"].orEmpty().lines().map { it.trim() }.filter { it.isNotEmpty() }
            val after = input["after"].orEmpty().lines().map { it.trim() }.filter { it.isNotEmpty() }
            if (before.isEmpty() && after.isEmpty()) return@Tool err("Paste both versions.")
            val removed = before.filter { it !in after }
            val added = after.filter { it !in before }
            val report = buildString {
                added.forEach { appendLine("+ $it") }
                removed.forEach { appendLine("- $it") }
            }.trim()
            ToolResult(
                if (added.isEmpty() && removed.isEmpty()) "Identical" else "Changes",
                "+${added.size} / −${removed.size} lines",
                listOf("Lines before" to "${before.size}", "Lines after" to "${after.size}"),
                note = report.ifBlank { null },
            )
        },
    ),
    Tool(
        slug = "area", title = "Area & Perimeter", category = "calculators",
        tagline = "Rectangle, triangle or circle, in one place.",
        keywords = listOf("area", "perimeter", "square metres"),
        fields = listOf(
            field("shape", "Shape", FieldKind.SELECT, default = "Rectangle", options = listOf("Rectangle", "Triangle", "Circle")),
            field("a", "Length / base / radius", FieldKind.DECIMAL, default = "4"),
            field("b", "Width / height", FieldKind.DECIMAL, default = "3"),
            field("c", "Third side (triangle)", FieldKind.DECIMAL, default = "5"),
            field("unit", "Unit", FieldKind.SELECT, default = "m", options = listOf("m", "cm", "ft", "in")),
        ),
        compute = { input ->
            val a = input.num("a") ?: return@Tool err("Enter a length.")
            val b = input.num("b") ?: 0.0
            val c = input.num("c") ?: 0.0
            val unit = input["unit"] ?: "m"
            if (a <= 0) return@Tool err("Lengths must be positive.")
            when (input["shape"]) {
                "Circle" -> ToolResult(
                    "Area", "${fmt(Math.PI * a * a, 3)} $unit²",
                    listOf("Circumference" to "${fmt(2 * Math.PI * a, 3)} $unit", "Radius" to "$a $unit"),
                )
                "Triangle" -> {
                    if (b <= 0) return@Tool err("Enter a height.")
                    val perimeter = if (c > 0) a + b + c else a + b
                    ToolResult(
                        "Area", "${fmt(a * b / 2, 3)} $unit²",
                        listOf("Perimeter" to "${fmt(perimeter, 3)} $unit (with the sides you gave)"),
                    )
                }
                else -> {
                    if (b <= 0) return@Tool err("Enter a width.")
                    ToolResult(
                        "Area", "${fmt(a * b, 3)} $unit²",
                        listOf("Perimeter" to "${fmt(2 * (a + b), 3)} $unit", "Diagonal" to "${fmt(Math.sqrt(a * a + b * b), 3)} $unit"),
                    )
                }
            }
        },
    ),
    Tool(
        slug = "jwt-inspect", title = "JWT Inspector", category = "developer",
        tagline = "Read a token's header and claims. Never verifies the signature.",
        keywords = listOf("jwt", "token", "claims"),
        fields = listOf(field("token", "Token", FieldKind.MULTILINE, placeholder = "eyJhbGciOi…")),
        compute = { input ->
            val token = input.text("token")
            val parts = token.split('.')
            if (parts.size < 2) return@Tool err("A JWT has three dot-separated parts.")
            fun decode(part: String): Any? {
                val padded = part.replace('-', '+').replace('_', '/').let {
                    it + "=".repeat((4 - it.length % 4) % 4)
                }
                val bytes = runCatching { java.util.Base64.getDecoder().decode(padded) }.getOrNull()
                    ?: throw IllegalArgumentException("Not Base64")
                return Json.parse(String(bytes, Charsets.UTF_8))
            }
            val header = runCatching { decode(parts[0]) }.getOrElse { return@Tool err("The header is not valid Base64 JSON.") }
            val claims = runCatching { decode(parts[1]) }.getOrElse { return@Tool err("The payload is not valid Base64 JSON.") }
            val expiry = (claims as? Map<*, *>)?.get("exp")?.let { it as? Double }
            val details = mutableListOf("Header" to Json.write(header, false), "Claims" to Json.write(claims, false))
            if (expiry != null) {
                val instant = java.time.Instant.ofEpochSecond(expiry.toLong())
                val expired = instant.isBefore(java.time.Instant.now())
                details += "Expires" to DateTimeFormatter.ISO_INSTANT.format(instant) + if (expired) " (expired)" else " (valid)"
            }
            ToolResult(
                "Token", if (parts.size == 3) "3 parts" else "${parts.size} parts",
                details,
                note = "Decoded only. Toolz cannot verify the signature, so never trust a token because it decodes cleanly.",
            )
        },
    ),
    Tool(
        slug = "passphrase", title = "Passphrase", category = "security",
        tagline = "Pronounceable blocks that are easy to recall and hard to guess.",
        keywords = listOf("passphrase", "memorable password", "diceware"),
        fields = listOf(
            field("blocks", "Blocks", FieldKind.SELECT, default = "3", options = listOf("2", "3", "4")),
            field("separator", "Separator", FieldKind.SELECT, default = "-", options = listOf("-", ".", "_", " ")),
            field("number", "Add a number", FieldKind.TOGGLE, default = "true"),
        ),
        compute = { input ->
            val blocks = input["blocks"]?.toIntOrNull()?.coerceIn(2, 4) ?: 3
            val separator = input["separator"] ?: "-"
            val random = java.security.SecureRandom()
            fun syllable() = ONSETS[random.nextInt(ONSETS.size)] +
                VOWELS[random.nextInt(VOWELS.size)] +
                CODAS[random.nextInt(CODAS.size)]
            val words = (1..blocks).map { (1..3).map { syllable() }.joinToString("") }
            val suffix = if (input.flag("number")) (random.nextInt(90) + 10).toString() else ""
            val phrase = words.joinToString(separator) + suffix
            val perSyllable = kotlin.math.ln((ONSETS.size * VOWELS.size * CODAS.size).toDouble()) / kotlin.math.ln(2.0)
            val bits = blocks * 3 * perSyllable + if (suffix.isEmpty()) 0.0 else kotlin.math.ln(90.0) / kotlin.math.ln(2.0)
            ToolResult(
                "Passphrase", phrase,
                listOf(
                    "Blocks" to "$blocks × 3 syllables",
                    "Entropy" to "${fmt(bits, 0)} bits",
                    "Space" to "${fmt(ONSETS.size * VOWELS.size * CODAS.size.toDouble(), 0)} syllables",
                ),
                note = "Built with SecureRandom in this app. Around 80 bits or more is a good target for anything that matters.",
            )
        },
    ),
    Tool(
        slug = "world-clock", title = "World Clock", category = "everyday",
        tagline = "One time, seen from six cities at once.",
        keywords = listOf("time zone", "world clock", "meeting"),
        fields = listOf(field("time", "Your local time (HH:mm)", FieldKind.TEXT, default = "09:00")),
        compute = { input ->
            val raw = input.text("time")
            val match = Regex("([01]?\\d|2[0-3]):([0-5]\\d)").find(raw)
                ?: return@Tool err("Use a 24-hour time such as 09:30.")
            val hour = match.groupValues[1].toInt()
            val minute = match.groupValues[2].toInt()
            val now = ZonedDateTime.now()
            val base = now.withHour(hour).withMinute(minute).withSecond(0).withNano(0)
            val formatter = DateTimeFormatter.ofPattern("HH:mm")
            val zones = listOf(
                "Lagos" to "Africa/Lagos",
                "London" to "Europe/London",
                "Berlin" to "Europe/Berlin",
                "Dubai" to "Asia/Dubai",
                "New York" to "America/New_York",
                "Los Angeles" to "America/Los_Angeles",
            )
            ToolResult(
                "Lagos", base.withZoneSameInstant(ZoneId.of("Africa/Lagos")).format(formatter),
                zones.map { (label, id) ->
                    label to base.withZoneSameInstant(ZoneId.of(id)).format(formatter)
                },
                note = "Converted from your device clock (${ZoneId.systemDefault().id}). Daylight saving is applied for each zone.",
            )
        },
    ),
    Tool(
        slug = "depreciation", title = "Depreciation", category = "business",
        tagline = "Straight-line or declining balance, year by year.",
        keywords = listOf("depreciation", "asset value", "write down"),
        fields = listOf(
            field("cost", "Asset cost", FieldKind.DECIMAL, default = "1200000"),
            field("salvage", "Residual value", FieldKind.DECIMAL, default = "150000"),
            field("years", "Useful life (years)", FieldKind.NUMBER, default = "5"),
            field("mode", "Method", FieldKind.SELECT, default = "Straight line", options = listOf("Straight line", "Declining balance")),
            field("rate", "Declining rate (%)", FieldKind.DECIMAL, default = "30"),
        ),
        compute = { input ->
            val cost = input.num("cost") ?: return@Tool err("Enter the asset cost.")
            val salvage = input.num("salvage") ?: 0.0
            val years = (input.num("years") ?: 0.0).toInt()
            if (years <= 0) return@Tool err("Enter a useful life in years.")
            if (salvage > cost) return@Tool err("Residual value cannot exceed the cost.")
            val lines = mutableListOf<Pair<String, String>>()
            var book = cost
            if (input["mode"] == "Declining balance") {
                val rate = (input.num("rate") ?: 30.0) / 100
                if (rate <= 0 || rate >= 1) return@Tool err("The declining rate must be between 1 and 99.")
                for (year in 1..years) {
                    val charge = book * rate
                    book = (book - charge).coerceAtLeast(salvage)
                    lines += "Year $year charge" to fmt(charge)
                }
            } else {
                val charge = (cost - salvage) / years
                for (year in 1..years) {
                    book -= charge
                    lines += "Year $year charge" to fmt(charge)
                }
            }
            lines += "Book value at end" to fmt(book)
            ToolResult(
                "Year 1 charge", lines.first().second,
                lines,
                note = "Declining balance never drops below the residual value you entered.",
            )
        },
    ),
    Tool(
        slug = "word-frequency", title = "Word Frequency", category = "text",
        tagline = "The words a piece of writing leans on.",
        keywords = listOf("word count", "frequency", "repetition"),
        fields = listOf(
            field("text", "Your text", FieldKind.MULTILINE),
            field("limit", "Show top", FieldKind.NUMBER, default = "10"),
            field("ignoreCommon", "Skip common words", FieldKind.TOGGLE, default = "true"),
        ),
        compute = { input ->
            val stop = if (input.flag("ignoreCommon")) {
                setOf("the", "and", "for", "are", "but", "not", "you", "all", "any", "can", "her", "was", "one", "our", "out", "his", "has", "had", "with", "this", "that", "from", "they", "will", "would", "there", "their", "what", "when", "your", "have", "been", "into", "than", "them", "then", "some", "more", "also")
            } else {
                emptySet()
            }
            val words = wordsOf(input["text"].orEmpty())
                .map { it.lowercase(Locale.UK).trim('.', ',', '!', '?', ';', ':', '"', '\'', '(', ')') }
                .filter { it.length > 1 && it !in stop }
            if (words.isEmpty()) return@Tool err("Paste some text first.")
            val limit = (input.num("limit") ?: 10.0).toInt().coerceIn(1, 30)
            val top = words.groupingBy { it }.eachCount().entries
                .sortedWith(compareByDescending<Map.Entry<String, Int>> { it.value }.thenBy { it.key })
                .take(limit)
            ToolResult(
                "Distinct words", fmt(words.toSet().size.toLong()),
                listOf("Total words" to fmt(words.size.toLong())) + top.map { it.key to "${it.value}×" },
            )
        },
    ),
    Tool(
        slug = "salary-deductions", title = "Take-home Pay", category = "finance",
        tagline = "Gross, deductions and net — with your own rates.",
        keywords = listOf("net pay", "deductions", "tax", "pension"),
        fields = listOf(
            field("gross", "Gross monthly pay", FieldKind.DECIMAL, default = "450000"),
            field("pension", "Pension (%)", FieldKind.DECIMAL, default = "8"),
            field("tax", "Tax (%)", FieldKind.DECIMAL, default = "10"),
            field("other", "Other deductions", FieldKind.DECIMAL, default = "0"),
        ),
        compute = { input ->
            val gross = input.num("gross") ?: return@Tool err("Enter gross pay.")
            if (gross <= 0) return@Tool err("Gross pay must be positive.")
            val pension = gross * (input.num("pension") ?: 0.0) / 100
            val tax = gross * (input.num("tax") ?: 0.0) / 100
            val other = input.num("other") ?: 0.0
            val net = gross - pension - tax - other
            ToolResult(
                "Net pay", fmt(net),
                listOf(
                    "Pension" to fmt(pension),
                    "Tax" to fmt(tax),
                    "Other" to fmt(other),
                    "Total deducted" to fmt(gross - net),
                ),
                note = "Flat rates that you choose. Real payroll rules vary by country and employer; this is arithmetic, not tax advice.",
            )
        },
    ),
)

private val ONSETS = listOf(
    "b", "br", "c", "ch", "d", "dr", "f", "fl", "g", "gr", "h", "j", "k", "l",
    "m", "n", "p", "pl", "r", "s", "sh", "st", "t", "tr", "v", "w", "z",
)

private val VOWELS = listOf("a", "e", "i", "o", "u")

private val CODAS = listOf(
    "b", "ck", "d", "f", "g", "k", "l", "m", "n", "ng", "p", "r", "s", "sh", "t", "x", "z",
)
