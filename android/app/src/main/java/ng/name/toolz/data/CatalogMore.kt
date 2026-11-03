package ng.name.toolz.data

import java.math.BigInteger
import java.util.Base64
import java.util.Locale
import kotlin.math.abs
import kotlin.math.ceil
import kotlin.math.max
import kotlin.math.pow

/** Developer, everyday, security, education, SEO and business tools. */

private fun hex(bytes: ByteArray): String = bytes.joinToString("") { "%02x".format(it) }

/** Unit -> (family, size in the family's base unit). */
internal val UNIT_FACTORS: Map<String, Pair<String, Double>> = mapOf(
    "metre" to ("Length" to 1.0),
    "kilometre" to ("Length" to 1000.0),
    "centimetre" to ("Length" to 0.01),
    "mile" to ("Length" to 1609.344),
    "yard" to ("Length" to 0.9144),
    "foot" to ("Length" to 0.3048),
    "inch" to ("Length" to 0.0254),
    "kilogram" to ("Mass" to 1.0),
    "gram" to ("Mass" to 0.001),
    "tonne" to ("Mass" to 1000.0),
    "pound" to ("Mass" to 0.45359237),
    "ounce" to ("Mass" to 0.028349523125),
    "litre" to ("Volume" to 1.0),
    "millilitre" to ("Volume" to 0.001),
    "gallon" to ("Volume" to 3.785411784),
    "pint" to ("Volume" to 0.473176473),
    "cup" to ("Volume" to 0.2365882365),
    "celsius" to ("Temperature" to 1.0),
    "fahrenheit" to ("Temperature" to 1.0),
    "kelvin" to ("Temperature" to 1.0),
)

internal val UNIT_NAMES: List<String> = UNIT_FACTORS.keys.toList()

internal val developerTools = listOf(
    Tool(
        slug = "base64", title = "Base64", category = "developer",
        tagline = "Encode text to Base64 or decode it back.",
        keywords = listOf("base64", "encode", "decode"),
        fields = listOf(
            field("mode", "Direction", FieldKind.SELECT, default = "Encode", options = listOf("Encode", "Decode")),
            field("text", "Text", FieldKind.MULTILINE),
        ),
        compute = { input ->
            val raw = input["text"].orEmpty()
            if (raw.isBlank()) return@Tool err("Type something first.")
            if (input["mode"] == "Decode") {
                val bytes = runCatching { Base64.getMimeDecoder().decode(raw) }.getOrNull()
                    ?: return@Tool err("That is not valid Base64.")
                ToolResult("Decoded", String(bytes, Charsets.UTF_8), listOf("Bytes" to fmt(bytes.size.toLong())))
            } else {
                val bytes = raw.toByteArray(Charsets.UTF_8)
                ToolResult("Encoded", Base64.getEncoder().encodeToString(bytes), listOf("Bytes in" to fmt(bytes.size.toLong())))
            }
        },
    ),
    Tool(
        slug = "url-encode", title = "URL Encoder", category = "developer",
        tagline = "Percent-encode a URL or decode one safely.",
        keywords = listOf("urlencode", "percent encoding"),
        fields = listOf(
            field("mode", "Direction", FieldKind.SELECT, default = "Encode", options = listOf("Encode", "Decode")),
            field("text", "Text", FieldKind.MULTILINE),
        ),
        compute = { input ->
            val raw = input["text"].orEmpty()
            if (raw.isBlank()) return@Tool err("Type something first.")
            if (input["mode"] == "Decode") {
                val out = runCatching { java.net.URLDecoder.decode(raw, "UTF-8") }.getOrNull()
                    ?: return@Tool err("That is not a valid encoded string.")
                ToolResult("Decoded", out)
            } else {
                ToolResult("Encoded", java.net.URLEncoder.encode(raw, "UTF-8").replace("+", "%20"))
            }
        },
    ),
    Tool(
        slug = "json-format", title = "JSON Formatter", category = "developer",
        tagline = "Pretty-print or minify JSON, with a validity check.",
        keywords = listOf("json", "beautify", "minify", "validate"),
        fields = listOf(
            field("text", "JSON", FieldKind.MULTILINE, placeholder = "{\"a\":1}"),
            field("mode", "Output", FieldKind.SELECT, default = "Pretty", options = listOf("Pretty", "Minified")),
        ),
        compute = { input ->
            val raw = input["text"].trim()
            if (raw.isEmpty()) return@Tool err("Paste some JSON first.")
            val parsed = runCatching { Json.parse(raw) }.getOrNull()
                ?: return@Tool err("That is not valid JSON. Check for a missing comma, quote or bracket.")
            val pretty = input["mode"] != "Minified"
            ToolResult("Valid JSON", Json.write(parsed, pretty), listOf("Size" to "${raw.length} chars"))
        },
    ),
    Tool(
        slug = "uuid", title = "UUID Generator", category = "developer",
        tagline = "Random v4 identifiers, one or many.",
        keywords = listOf("uuid", "guid"),
        fields = listOf(field("count", "How many", FieldKind.NUMBER, default = "5")),
        compute = { input ->
            val n = (input.num("count") ?: 1.0).toInt().coerceIn(1, 100)
            ToolResult("UUIDs", (1..n).joinToString("\n") { java.util.UUID.randomUUID().toString() })
        },
    ),
    Tool(
        slug = "hash", title = "Hash Generator", category = "developer",
        tagline = "MD5, SHA-1, SHA-256 and SHA-512 of any text.",
        keywords = listOf("sha256", "md5", "checksum"),
        fields = listOf(field("text", "Text", FieldKind.MULTILINE)),
        compute = { input ->
            val raw = input["text"]
            if (raw.isEmpty()) return@Tool err("Type something first.")
            val bytes = raw.toByteArray(Charsets.UTF_8)
            fun digest(alg: String) = hex(java.security.MessageDigest.getInstance(alg).digest(bytes))
            ToolResult(
                "SHA-256", digest("SHA-256"),
                listOf("MD5" to digest("MD5"), "SHA-1" to digest("SHA-1"), "SHA-512" to digest("SHA-512")),
            )
        },
    ),
    Tool(
        slug = "timestamp", title = "Unix Timestamp", category = "developer",
        tagline = "Epoch seconds and milliseconds, both directions.",
        keywords = listOf("unix time", "epoch"),
        fields = listOf(
            field("mode", "Direction", FieldKind.SELECT, default = "Now", options = listOf("Now", "Timestamp → Date", "Date → Timestamp")),
            field("value", "Timestamp or YYYY-MM-DD", FieldKind.TEXT),
        ),
        compute = { input ->
            val zone = java.time.ZoneId.systemDefault()
            when (input["mode"]) {
                "Timestamp → Date" -> {
                    val seconds = input.text("value").toLongOrNull() ?: return@Tool err("Enter a whole number of seconds.")
                    val instant = java.time.Instant.ofEpochSecond(seconds)
                    ToolResult(
                        "Date", java.time.format.DateTimeFormatter.ofPattern("d MMM yyyy, HH:mm").withZone(zone).format(instant),
                        listOf("UTC" to java.time.format.DateTimeFormatter.ISO_INSTANT.format(instant)),
                    )
                }
                "Date → Timestamp" -> {
                    val date = runCatching { java.time.LocalDate.parse(input.text("value")) }.getOrNull()
                        ?: return@Tool err("Use YYYY-MM-DD.")
                    val seconds = date.atStartOfDay(zone).toEpochSecond()
                    ToolResult("Seconds", seconds.toString(), listOf("Milliseconds" to (seconds * 1000).toString()))
                }
                else -> {
                    val now = java.time.Instant.now()
                    ToolResult(
                        "Seconds", now.epochSecond.toString(),
                        listOf("Milliseconds" to now.toEpochMilli().toString(), "ISO" to java.time.format.DateTimeFormatter.ISO_INSTANT.format(now)),
                    )
                }
            }
        },
    ),
    Tool(
        slug = "lorem-hex", title = "Random Hex", category = "developer",
        tagline = "Cryptographically random hex for keys, salts and IDs.",
        keywords = listOf("random hex", "token", "salt"),
        fields = listOf(
            field("bytes", "Bytes", FieldKind.NUMBER, default = "16"),
            field("count", "How many", FieldKind.NUMBER, default = "1"),
        ),
        compute = { input ->
            val n = (input.num("bytes") ?: 16.0).toInt().coerceIn(1, 128)
            val count = (input.num("count") ?: 1.0).toInt().coerceIn(1, 50)
            val random = java.security.SecureRandom()
            ToolResult(
                "Hex", (1..count).joinToString("\n") {
                    val b = ByteArray(n); random.nextBytes(b); hex(b)
                },
                note = "Uses SecureRandom, not a predictable pseudo-random generator.",
            )
        },
    ),
    Tool(
        slug = "number-base", title = "Number Base", category = "developer",
        tagline = "Binary, octal, decimal and hex at once.",
        keywords = listOf("binary", "hex", "base converter"),
        fields = listOf(
            field("value", "Value", FieldKind.TEXT, default = "255"),
            field("base", "Read as base", FieldKind.SELECT, default = "10", options = listOf("2", "8", "10", "16")),
        ),
        compute = { input ->
            val base = input["base"]?.toIntOrNull() ?: 10
            val parsed = runCatching { BigInteger(input.text("value"), base) }.getOrNull()
                ?: return@Tool err("That is not a valid base-$base number.")
            ToolResult(
                "Decimal", parsed.toString(),
                listOf("Binary" to parsed.toString(2), "Octal" to parsed.toString(8), "Hex" to parsed.toString(16).uppercase(Locale.UK)),
            )
        },
    ),
    Tool(
        slug = "color-converter", title = "Colour Converter", category = "developer",
        tagline = "HEX, RGB and HSL for any colour.",
        keywords = listOf("hex to rgb", "colour", "hsl"),
        fields = listOf(field("hex", "Hex colour", FieldKind.TEXT, default = "#d64e18")),
        compute = { input ->
            val cleaned = input.text("hex").removePrefix("#")
            if (!cleaned.matches(Regex("[0-9a-fA-F]{6}"))) return@Tool err("Use a six-digit hex colour such as #d64e18.")
            val r = cleaned.substring(0, 2).toInt(16)
            val g = cleaned.substring(2, 4).toInt(16)
            val b = cleaned.substring(4, 6).toInt(16)
            val maxC = maxOf(r, g, b) / 255.0
            val minC = minOf(r, g, b) / 255.0
            val l = (maxC + minC) / 2
            val s = if (maxC == minC) 0.0 else (maxC - minC) / (1 - abs(2 * l - 1))
            val h = when {
                maxC == minC -> 0.0
                maxC == r / 255.0 -> (60 * ((g - b) / 255.0 / (maxC - minC)) + 360) % 360
                maxC == g / 255.0 -> 60 * ((b - r) / 255.0 / (maxC - minC) + 2)
                else -> 60 * ((r - g) / 255.0 / (maxC - minC) + 4)
            }
            val luminance = (0.2126 * (r / 255.0) + 0.7152 * (g / 255.0) + 0.0722 * (b / 255.0))
            ToolResult(
                "RGB", "rgb($r, $g, $b)",
                listOf("HSL" to "hsl(${fmt(h, 0)}, ${pct(s * 100, 0)}, ${pct(l * 100, 0)})", "Relative luminance" to fmt(luminance, 3)),
            )
        },
    ),
)

internal val everydayTools = listOf(
    Tool(
        slug = "unit-converter", title = "Unit Converter", category = "everyday",
        tagline = "Length, mass, volume and temperature.",
        keywords = listOf("convert units", "metric", "imperial"),
        fields = listOf(
            field("family", "Category", FieldKind.SELECT, default = "Length", options = listOf("Length", "Mass", "Volume", "Temperature")),
            field("from", "From", FieldKind.SELECT, default = "metre", options = UNIT_NAMES),
            field("to", "To", FieldKind.SELECT, default = "foot", options = UNIT_NAMES),
            field("value", "Value", FieldKind.DECIMAL, default = "1"),
        ),
        compute = { input ->
            val value = input.num("value") ?: return@Tool err("Enter a value.")
            val family = input["family"] ?: "Length"
            val from = input["from"] ?: "metre"
            val to = input["to"] ?: "foot"
            val temperatures = setOf("celsius", "fahrenheit", "kelvin")
            if (family == "Temperature") {
                if (from !in temperatures || to !in temperatures) {
                    err("Temperature uses celsius, fahrenheit or kelvin.")
                } else {
                    fun toCelsius(v: Double, u: String) = when (u) {
                        "fahrenheit" -> (v - 32) / 1.8
                        "kelvin" -> v - 273.15
                        else -> v
                    }
                    fun fromCelsius(v: Double, u: String) = when (u) {
                        "fahrenheit" -> v * 1.8 + 32
                        "kelvin" -> v + 273.15
                        else -> v
                    }
                    ToolResult(
                        "Result", fmt(fromCelsius(toCelsius(value, from), to), 4),
                        listOf("From" to "$value $from", "To" to to),
                    )
                }
            } else {
                val table = UNIT_FACTORS[from]
                val target = UNIT_FACTORS[to]
                if (table == null || target == null || table.first != family || target.first != family) {
                    err("$from and $to are not both $family units.")
                } else {
                    ToolResult(
                        "Result", fmt(value * table.second / target.second, 6),
                        listOf("From" to "$value $from", "To" to to),
                    )
                }
            }
        },
    ),
    Tool(
        slug = "data-size", title = "Data Size", category = "everyday",
        tagline = "Bytes, KB, MB, GB and TB — decimal or binary.",
        keywords = listOf("bytes", "megabytes", "storage"),
        fields = listOf(
            field("value", "Value", FieldKind.DECIMAL, default = "1"),
            field("unit", "Unit", FieldKind.SELECT, default = "GB", options = listOf("B", "KB", "MB", "GB", "TB")),
            field("binary", "Use 1024 (KiB)", FieldKind.TOGGLE, default = "false"),
        ),
        compute = { input ->
            val value = input.num("value") ?: return@Tool err("Enter a value.")
            val step = if (input.flag("binary")) 1024.0 else 1000.0
            val order = listOf("B", "KB", "MB", "GB", "TB")
            val index = order.indexOf(input["unit"] ?: "GB").coerceAtLeast(0)
            val bytes = value * step.pow(index)
            ToolResult(
                "Bytes", fmt(bytes, 0),
                order.map { it to fmt(bytes / step.pow(order.indexOf(it)), 4) },
            )
        },
    ),
    Tool(
        slug = "fuel-cost", title = "Fuel Cost", category = "everyday",
        tagline = "What a trip costs at a given consumption.",
        keywords = listOf("fuel", "petrol", "trip cost"),
        fields = listOf(
            field("distance", "Distance (km)", FieldKind.DECIMAL, default = "450"),
            field("consumption", "Litres per 100 km", FieldKind.DECIMAL, default = "8.5"),
            field("price", "Price per litre", FieldKind.DECIMAL, default = "1150"),
        ),
        compute = { input ->
            val distance = input.num("distance") ?: return@Tool err("Enter a distance.")
            val consumption = input.num("consumption") ?: return@Tool err("Enter consumption.")
            val price = input.num("price") ?: return@Tool err("Enter a price.")
            val litres = distance / 100 * consumption
            ToolResult("Trip cost", fmt(litres * price), listOf("Litres used" to fmt(litres, 2), "Cost per km" to fmt(litres * price / distance)))
        },
    ),
    Tool(
        slug = "paint", title = "Paint Calculator", category = "everyday",
        tagline = "Litres of paint for a room, minus the doors.",
        keywords = listOf("paint", "wall area"),
        fields = listOf(
            field("length", "Room length (m)", FieldKind.DECIMAL, default = "5"),
            field("width", "Room width (m)", FieldKind.DECIMAL, default = "4"),
            field("height", "Wall height (m)", FieldKind.DECIMAL, default = "2.7"),
            field("coats", "Coats", FieldKind.NUMBER, default = "2"),
            field("coverage", "Coverage per litre (m²)", FieldKind.DECIMAL, default = "12"),
        ),
        compute = { input ->
            val l = input.num("length") ?: return@Tool err("Enter the length.")
            val w = input.num("width") ?: return@Tool err("Enter the width.")
            val h = input.num("height") ?: return@Tool err("Enter the height.")
            val coats = (input.num("coats") ?: 2.0).toInt().coerceAtLeast(1)
            val coverage = input.num("coverage") ?: return@Tool err("Enter the coverage.")
            if (coverage <= 0) return@Tool err("Coverage must be positive.")
            val walls = 2 * (l + w) * h
            val litres = walls * coats / coverage
            ToolResult(
                "Paint needed", "${fmt(ceil(litres), 0)} L",
                listOf("Wall area" to "${fmt(walls, 1)} m²", "Coats" to "$coats"),
                note = "Doors and windows are included; buy a little extra for touch-ups.",
            )
        },
    ),
    Tool(
        slug = "tile-flooring", title = "Tiles & Flooring", category = "everyday",
        tagline = "Boxes to order, with a waste allowance.",
        keywords = listOf("tiles", "flooring", "boxes"),
        fields = listOf(
            field("length", "Room length (m)", FieldKind.DECIMAL, default = "4.2"),
            field("width", "Room width (m)", FieldKind.DECIMAL, default = "3.6"),
            field("tileLength", "Tile length (cm)", FieldKind.DECIMAL, default = "60"),
            field("tileWidth", "Tile width (cm)", FieldKind.DECIMAL, default = "60"),
            field("waste", "Waste allowance (%)", FieldKind.DECIMAL, default = "10"),
        ),
        compute = { input ->
            val l = input.num("length") ?: return@Tool err("Enter the room length.")
            val w = input.num("width") ?: return@Tool err("Enter the room width.")
            val tl = input.num("tileLength") ?: return@Tool err("Enter the tile length.")
            val tw = input.num("tileWidth") ?: return@Tool err("Enter the tile width.")
            val waste = input.num("waste") ?: 0.0
            if (tl <= 0 || tw <= 0) return@Tool err("Tile sides must be positive.")
            val floor = l * w
            val tileArea = tl * tw / 10000
            val need = ceil(floor / tileArea * (1 + waste / 100))
            ToolResult(
                "Tiles needed", fmt(need, 0),
                listOf("Floor area" to "${fmt(floor, 2)} m²", "Per tile" to "${fmt(tileArea, 3)} m²", "With waste" to pct(100 + waste, 0)),
            )
        },
    ),
    Tool(
        slug = "shopping-list", title = "Shopping Total", category = "everyday",
        tagline = "Add up a basket with quantities.",
        keywords = listOf("shopping", "basket", "budget"),
        fields = listOf(
            field("items", "One per line: quantity, price", FieldKind.MULTILINE, default = "2, 1500\n1, 2750\n3, 400"),
            field("budget", "Budget (optional)", FieldKind.DECIMAL),
        ),
        compute = { input ->
            val rows = input["items"].orEmpty().lines().mapNotNull { line ->
                val parts = line.split(Regex("[,;\\s]+")).filter { it.isNotBlank() }
                if (parts.size < 2) null
                else {
                    val qty = parts[0].toDoubleOrNull() ?: return@mapNotNull null
                    val price = parts[1].toDoubleOrNull() ?: return@mapNotNull null
                    qty to price
                }
            }
            if (rows.isEmpty()) return@Tool err("Add a line like 2, 1500.")
            val total = rows.sumOf { it.first * it.second }
            val budget = input.num("budget")
            val details = mutableListOf("Items" to fmt(rows.size.toLong()))
            if (budget != null && budget > 0) {
                details += "Budget left" to fmt(budget - total)
                details += "Status" to if (total <= budget) "Within budget" else "Over budget"
            }
            ToolResult("Total", fmt(total), details)
        },
    ),
)

internal val securityTools = listOf(
    Tool(
        slug = "password-generator", title = "Password Generator", category = "security",
        tagline = "Long random passwords, generated on your phone.",
        keywords = listOf("password", "random", "secure"),
        fields = listOf(
            field("length", "Length", FieldKind.NUMBER, default = "20"),
            field("symbols", "Include symbols", FieldKind.TOGGLE, default = "true"),
            field("digits", "Include digits", FieldKind.TOGGLE, default = "true"),
            field("count", "How many", FieldKind.NUMBER, default = "1"),
        ),
        compute = { input ->
            val length = (input.num("length") ?: 20.0).toInt().coerceIn(6, 128)
            val alphabet = buildString {
                append("abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ")
                if (input.flag("digits")) append("23456789")
                if (input.flag("symbols")) append("!@#\$%^&*()-_=+[]{};:,.?/")
            }
            val count = (input.num("count") ?: 1.0).toInt().coerceIn(1, 20)
            val random = java.security.SecureRandom()
            val out = (1..count).joinToString("\n") { String(CharArray(length) { alphabet[random.nextInt(alphabet.length)] }) }
            ToolResult(
                "Password", out,
                listOf("Length" to "$length", "Alphabet" to "${alphabet.length} characters"),
                note = "Generated with SecureRandom on this device and never sent anywhere.",
            )
        },
    ),
    Tool(
        slug = "password-strength", title = "Password Strength", category = "security",
        tagline = "Entropy in bits, and how long a cracker needs.",
        keywords = listOf("password strength", "entropy"),
        fields = listOf(field("password", "Password", FieldKind.TEXT)),
        compute = { input ->
            val p = input["password"].orEmpty()
            if (p.isEmpty()) return@Tool err("Type a password to measure it.")
            var pool = 0
            if (p.any { it in 'a'..'z' }) pool += 26
            if (p.any { it in 'A'..'Z' }) pool += 26
            if (p.any { it in '0'..'9' }) pool += 10
            if (p.any { !it.isLetterOrDigit() }) pool += 33
            val entropy = p.length * (kotlin.math.ln(pool.toDouble()) / kotlin.math.ln(2.0))
            val guessesPerSecond = 1e10
            val seconds = 2.0.pow(entropy - 1) / guessesPerSecond
            val readable = when {
                seconds < 1 -> "under a second"
                seconds < 60 -> "${fmt(seconds, 0)} seconds"
                seconds < 3600 -> "${fmt(seconds / 60, 0)} minutes"
                seconds < 86400 -> "${fmt(seconds / 3600, 0)} hours"
                seconds < 3.15e7 -> "${fmt(seconds / 86400, 0)} days"
                seconds < 3.15e10 -> "${fmt(seconds / 3.15e7, 0)} years"
                else -> "${fmt(seconds / 3.15e7, 0)} years"
            }
            val band = when {
                entropy < 40 -> "Weak"
                entropy < 60 -> "Fair"
                entropy < 80 -> "Strong"
                else -> "Very strong"
            }
            ToolResult(
                band, "${fmt(entropy, 1)} bits",
                listOf("Length" to "${p.length}", "Alphabet" to "$pool", "Offline crack time" to readable),
                note = "Assumes a fast offline attack at 10 billion guesses a second. Online attacks are far slower.",
            )
        },
    ),
    Tool(
        slug = "random-pin", title = "Random PIN", category = "security",
        tagline = "Numeric codes of any length.",
        keywords = listOf("pin", "otp", "numeric code"),
        fields = listOf(
            field("length", "Digits", FieldKind.NUMBER, default = "6"),
            field("count", "How many", FieldKind.NUMBER, default = "1"),
        ),
        compute = { input ->
            val length = (input.num("length") ?: 6.0).toInt().coerceIn(3, 12)
            val count = (input.num("count") ?: 1.0).toInt().coerceIn(1, 50)
            val random = java.security.SecureRandom()
            ToolResult("PIN", (1..count).joinToString("\n") { String(CharArray(length) { ('0' + random.nextInt(10)) }) })
        },
    ),
)

internal val educationTools = listOf(
    Tool(
        slug = "gpa-grade", title = "Grade Average", category = "education",
        tagline = "Weighted average from scores and credit units.",
        keywords = listOf("gpa", "grade", "cgpa", "weighted average"),
        fields = listOf(
            field("entries", "One per line: score, credits", FieldKind.MULTILINE, default = "78, 3\n64, 2\n88, 3"),
        ),
        compute = { input ->
            val rows = input["entries"].orEmpty().lines().mapNotNull { line ->
                val parts = line.split(Regex("[,;\\s]+")).filter { it.isNotBlank() }
                if (parts.size < 2) null
                else {
                    val score = parts[0].toDoubleOrNull() ?: return@mapNotNull null
                    val credits = parts[1].toDoubleOrNull() ?: return@mapNotNull null
                    score to credits
                }
            }
            if (rows.isEmpty()) return@Tool err("Add at least one line like 78, 3.")
            val credits = rows.sumOf { it.second }
            if (credits <= 0) return@Tool err("Credit units must be positive.")
            val weighted = rows.sumOf { it.first * it.second } / credits
            ToolResult(
                "Weighted average", fmt(weighted, 2),
                listOf("Total credits" to fmt(credits, 1), "Entries" to rows.size.toString()),
            )
        },
    ),
    Tool(
        slug = "final-grade", title = "Grade Needed", category = "education",
        tagline = "The mark you need on the final to hit your target.",
        keywords = listOf("final grade", "exam", "target grade"),
        fields = listOf(
            field("current", "Current score (%)", FieldKind.DECIMAL, default = "68"),
            field("weight", "Final exam weight (%)", FieldKind.DECIMAL, default = "40"),
            field("target", "Target overall (%)", FieldKind.DECIMAL, default = "75"),
        ),
        compute = { input ->
            val current = input.num("current") ?: return@Tool err("Enter your current score.")
            val weight = input.num("weight") ?: return@Tool err("Enter the exam weight.")
            val target = input.num("target") ?: return@Tool err("Enter your target.")
            if (weight <= 0 || weight > 100) return@Tool err("Weight must be between 1 and 100.")
            val needed = (target - current * (1 - weight / 100)) / (weight / 100)
            when {
                needed <= 0 -> ToolResult(
                    "Already secured", "0%",
                    listOf("Target" to pct(target, 0), "You keep your grade even with a zero" to "yes"),
                )
                needed > 100 -> ToolResult(
                    "Not reachable", "over 100%",
                    listOf("You need" to pct(needed, 1), "Weight" to pct(weight, 0)),
                    note = "Even full marks would not reach that target with this weighting.",
                )
                else -> ToolResult("Score needed", pct(needed, 1), listOf("Target" to pct(target, 0), "Exam weight" to pct(weight, 0)))
            }
        },
    ),
    Tool(
        slug = "study-plan", title = "Study Plan", category = "education",
        tagline = "Split topics across the days you actually have.",
        keywords = listOf("study plan", "revision", "schedule"),
        fields = listOf(
            field("topics", "Topics, one per line", FieldKind.MULTILINE, default = "Algebra\nGeometry\nStatistics\nProbability"),
            field("days", "Days left", FieldKind.NUMBER, default = "4"),
            field("minutes", "Minutes per day", FieldKind.NUMBER, default = "90"),
        ),
        compute = { input ->
            val topics = input["topics"].orEmpty().lines().map { it.trim() }.filter { it.isNotEmpty() }
            val days = (input.num("days") ?: 0.0).toInt()
            val minutes = (input.num("minutes") ?: 0.0).toInt()
            if (topics.isEmpty()) return@Tool err("Add at least one topic.")
            if (days <= 0) return@Tool err("You need at least one day.")
            val perDay = ceil(topics.size / days.toDouble()).toInt()
            val block = if (topics.isEmpty()) 0 else minutes / perDay
            val plan = (0 until days).mapNotNull { d ->
                val slice = topics.drop(d * perDay).take(perDay)
                if (slice.isEmpty()) null else "Day ${d + 1}: ${slice.joinToString(", ")} (${fmt(block, 0)} min each)"
            }.joinToString("\n")
            ToolResult(
                "Days", "$days",
                listOf("Topics" to "${topics.size}", "Per day" to "${perDay} topics"),
                note = plan,
            )
        },
    ),
)

internal val seoTools = listOf(
    Tool(
        slug = "meta-length", title = "Meta Length", category = "seo",
        tagline = "See whether a title and description fit the SERP.",
        keywords = listOf("meta description", "title tag", "seo"),
        fields = listOf(
            field("title", "Title", FieldKind.TEXT, placeholder = "Free invoice generator"),
            field("description", "Description", FieldKind.MULTILINE),
        ),
        compute = { input ->
            val title = input.text("title")
            val description = input.text("description")
            fun verdict(length: Int, low: Int, high: Int, label: String) = when {
                length == 0 -> "$label: empty"
                length < low -> "$label: short"
                length <= high -> "$label: good"
                else -> "$label: too long"
            }
            ToolResult(
                "Title", "${title.length} chars",
                listOf(
                    verdict(title.length, 30, 60, "Title"),
                    "Description" to "${description.length} chars",
                    verdict(description.length, 70, 160, "Description"),
                ),
                note = "Google truncates by pixel width, so these are sensible ranges rather than hard limits.",
            )
        },
    ),
    Tool(
        slug = "serp-preview", title = "SERP Preview", category = "seo",
        tagline = "How your result is likely to look on a phone.",
        keywords = listOf("serp", "google preview"),
        fields = listOf(
            field("title", "Title", FieldKind.TEXT, default = "Free invoice generator"),
            field("url", "URL", FieldKind.TEXT, default = "https://toolz.name.ng/invoice"),
            field("description", "Description", FieldKind.MULTILINE, default = "Create a clean, print-ready invoice in seconds. No sign-up, nothing uploaded."),
        ),
        compute = { input ->
            val title = input.text("title")
            val description = input.text("description")
            ToolResult(
                "Phone preview", title.ifBlank { "Untitled page" },
                listOf("URL" to input.text("url"), "Snippet" to (if (description.length > 160) description.take(157) + "…" else description)),
                note = "Title shown up to roughly 60 characters; snippet roughly 160 on mobile.",
            )
        },
    ),
    Tool(
        slug = "keyword-density", title = "Keyword Density", category = "seo",
        tagline = "Top terms and their share of the text.",
        keywords = listOf("keyword density", "word frequency"),
        fields = listOf(
            field("text", "Your text", FieldKind.MULTILINE),
            field("term", "Keyword to check", FieldKind.TEXT),
        ),
        compute = { input ->
            val words = wordsOf(input["text"].orEmpty()).map { it.lowercase(Locale.UK).trim('.', ',', '!', '?', ';', ':', '"', '\'') }.filter { it.isNotBlank() }
            if (words.isEmpty()) return@Tool err("Paste some text first.")
            val counts = words.groupingBy { it }.eachCount().entries.sortedByDescending { it.value }.take(5)
            val details = counts.map { (word, n) to "${n}× · ${pct(n * 100.0 / words.size, 1)}" }
            val term = input.text("term").lowercase(Locale.UK)
            if (term.isNotBlank()) {
                val hits = words.count { it == term }
                return@Tool ToolResult(
                    "“$term”", pct(hits * 100.0 / words.size, 2),
                    details + ("Appearances" to "$hits of ${words.size}"),
                )
            }
            ToolResult("Words", fmt(words.size.toLong()), details)
        },
    ),
    Tool(
        slug = "robots-txt", title = "Robots.txt Builder", category = "seo",
        tagline = "A correct robots file, generated from answers.",
        keywords = listOf("robots.txt", "crawl"),
        fields = listOf(
            field("sitemap", "Sitemap URL", FieldKind.TEXT, default = "https://toolz.name.ng/sitemap.xml"),
            field("disallow", "Paths to block", FieldKind.MULTILINE, placeholder = "/admin\n/cart"),
            field("blockAll", "Block every crawler", FieldKind.TOGGLE, default = "false"),
        ),
        compute = { input ->
            val out = StringBuilder()
            out.append(if (input.flag("blockAll")) "User-agent: *\nDisallow: /\n" else "User-agent: *\nAllow: /\n")
            input["disallow"].orEmpty().lines().map { it.trim() }.filter { it.isNotEmpty() }.forEach {
                out.append("Disallow: ").append(if (it.startsWith("/")) it else "/$it").append('\n')
            }
            val sitemap = input.text("sitemap")
            if (sitemap.isNotEmpty()) out.append("\nSitemap: ").append(sitemap).append('\n')
            ToolResult("robots.txt", out.toString().trimEnd())
        },
    ),
    Tool(
        slug = "utm-builder", title = "UTM Builder", category = "seo",
        tagline = "Tagged campaign URLs that survive spreadsheets.",
        keywords = listOf("utm", "campaign", "link tagging"),
        fields = listOf(
            field("url", "Destination", FieldKind.TEXT, default = "https://toolz.name.ng/"),
            field("source", "Source", FieldKind.TEXT, default = "newsletter"),
            field("medium", "Medium", FieldKind.TEXT, default = "email"),
            field("campaign", "Campaign", FieldKind.TEXT, default = "launch"),
        ),
        compute = { input ->
            val base = input.text("url")
            if (base.isEmpty()) return@Tool err("Enter a destination URL.")
            val params = listOf("utm_source" to input.text("source"), "utm_medium" to input.text("medium"), "utm_campaign" to input.text("campaign"))
                .filter { it.second.isNotEmpty() }
                .joinToString("&") { "${it.first}=${java.net.URLEncoder.encode(it.second, "UTF-8")}" }
            val joiner = if (base.contains('?')) "&" else "?"
            ToolResult("Campaign URL", if (params.isEmpty()) base else "$base$joiner$params")
        },
    ),
)

internal val businessTools = listOf(
    Tool(
        slug = "invoice-total", title = "Invoice Total", category = "business",
        tagline = "Line items, tax and a clean total.",
        keywords = listOf("invoice", "tax", "total"),
        fields = listOf(
            field("items", "One per line: description, quantity, unit price", FieldKind.MULTILINE, default = "Design work, 12, 15000\nHosting, 1, 45000"),
            field("tax", "Tax (%)", FieldKind.DECIMAL, default = "7.5"),
        ),
        compute = { input ->
            val rows = input["items"].orEmpty().lines().mapNotNull { line ->
                val parts = line.split(",").map { it.trim() }
                if (parts.size < 3) null
                else {
                    val qty = parts[parts.size - 2].toDoubleOrNull() ?: return@mapNotNull null
                    val price = parts.last().toDoubleOrNull() ?: return@mapNotNull null
                    parts.dropLast(2).joinToString(", ") to qty * price
                }
            }
            if (rows.isEmpty()) return@Tool err("Add a line like Design work, 12, 15000.")
            val subtotal = rows.sumOf { it.second }
            val tax = subtotal * (input.num("tax") ?: 0.0) / 100
            ToolResult(
                "Total due", fmt(subtotal + tax),
                rows.map { it.first to fmt(it.second) } + listOf("Subtotal" to fmt(subtotal), "Tax" to fmt(tax)),
            )
        },
    ),
    Tool(
        slug = "payback-period", title = "Payback Period", category = "business",
        tagline = "Months until an investment pays for itself.",
        keywords = listOf("payback", "capex"),
        fields = listOf(
            field("cost", "Up-front cost", FieldKind.DECIMAL, default = "900000"),
            field("monthly", "Monthly profit", FieldKind.DECIMAL, default = "75000"),
        ),
        compute = { input ->
            val cost = input.num("cost") ?: return@Tool err("Enter the cost.")
            val monthly = input.num("monthly") ?: return@Tool err("Enter the monthly profit.")
            if (monthly <= 0) return@Tool err("Monthly profit must be positive.")
            val months = cost / monthly
            ToolResult(
                "Payback", "${fmt(ceil(months), 0)} months",
                listOf("Exactly" to "${fmt(months, 1)} months", "Yearly profit" to fmt(monthly * 12)),
            )
        },
    ),
    Tool(
        slug = "pricing-tiers", title = "Pricing Tiers", category = "business",
        tagline = "Three tiers that step evenly up from cost.",
        keywords = listOf("pricing", "tiers", "saas"),
        fields = listOf(
            field("cost", "Monthly cost to serve one customer", FieldKind.DECIMAL, default = "1200"),
            field("target", "Target margin (%)", FieldKind.DECIMAL, default = "70"),
        ),
        compute = { input ->
            val cost = input.num("cost") ?: return@Tool err("Enter a cost.")
            val margin = input.num("target") ?: 0.0
            if (margin >= 100 || margin < 0) return@Tool err("Margin must be between 0 and 99.")
            val base = cost / (1 - margin / 100)
            ToolResult(
                "Suggested entry price", fmt(base),
                listOf("Middle tier" to fmt(base * 2), "Top tier" to fmt(base * 4), "Margin at entry" to pct(margin, 0)),
                note = "Round to a friendly number before you publish.",
            )
        },
    ),
    Tool(
        slug = "commission", title = "Commission Split", category = "business",
        tagline = "Who gets what when a deal closes.",
        keywords = listOf("commission", "split", "sales"),
        fields = listOf(
            field("amount", "Deal value", FieldKind.DECIMAL, default = "1500000"),
            field("rate", "Commission (%)", FieldKind.DECIMAL, default = "10"),
            field("split", "Your share (%)", FieldKind.DECIMAL, default = "60"),
        ),
        compute = { input ->
            val amount = input.num("amount") ?: return@Tool err("Enter the deal value.")
            val rate = input.num("rate") ?: 0.0
            val split = input.num("split") ?: 100.0
            val commission = amount * rate / 100
            ToolResult(
                "Your cut", fmt(commission * split / 100),
                listOf("Total commission" to fmt(commission), "Other party" to fmt(commission * (1 - split / 100))),
            )
        },
    ),
)
