package ng.name.toolz.data

import java.math.BigInteger
import java.text.Normalizer
import java.time.LocalTime
import java.util.Locale
import kotlin.math.abs
import kotlin.math.floor
import kotlin.math.sqrt

/**
 * Second pass at the catalogue: the smaller, high-frequency jobs people
 * actually reach for on a phone — pulling addresses out of a message, checking
 * a prime, adding minutes to a time.
 */

private val EMAIL = Regex("[A-Za-z0-9._%+\\-]+@[A-Za-z0-9.\\-]+\\.[A-Za-z]{2,}")
private val URL = Regex("https?://[^\\s<>\"']+")

private fun unescapeHtml(text: String): String = text
    .replace("&nbsp;", " ")
    .replace("&amp;", "&")
    .replace("&lt;", "<")
    .replace("&gt;", ">")
    .replace("&quot;", "\"")
    .replace("&#39;", "'")
    .replace("&#x27;", "'")

internal val batchTools = listOf(
    Tool(
        slug = "extract-emails", title = "Find Email Addresses", category = "text",
        tagline = "Pull every address out of a block of text, de-duplicated.",
        keywords = listOf("extract emails", "email finder"),
        fields = listOf(field("text", "Text", FieldKind.MULTILINE)),
        compute = { input ->
            val found = EMAIL.findAll(input["text"].orEmpty()).map { it.value.trimEnd('.', ',', ';', ')') }.distinct().toList()
            if (found.isEmpty()) return@Tool err("No email address in that text.")
            ToolResult("Addresses", fmt(found.size.toLong()), note = found.joinToString("\n"))
        },
    ),
    Tool(
        slug = "extract-urls", title = "Find Links", category = "text",
        tagline = "Every http link in a message, one per line.",
        keywords = listOf("extract urls", "links"),
        fields = listOf(field("text", "Text", FieldKind.MULTILINE)),
        compute = { input ->
            val found = URL.findAll(input["text"].orEmpty()).map { it.value.trimEnd('.', ',', ';', ')') }.distinct().toList()
            if (found.isEmpty()) return@Tool err("No link in that text.")
            ToolResult("Links", fmt(found.size.toLong()), note = found.joinToString("\n"))
        },
    ),
    Tool(
        slug = "strip-html", title = "Strip HTML", category = "text",
        tagline = "Tags out, readable text left behind.",
        keywords = listOf("remove html", "plain text"),
        fields = listOf(field("text", "HTML", FieldKind.MULTILINE)),
        compute = { input ->
            val raw = input["text"].orEmpty()
            if (raw.isBlank()) return@Tool err("Paste some HTML first.")
            val text = unescapeHtml(
                raw.replace(Regex("(?is)<(script|style)[^>]*>.*?</\\1>"), " ")
                    .replace(Regex("(?i)<br\\s*/?>"), "\n")
                    .replace(Regex("(?i)</p>"), "\n\n")
                    .replace(Regex("<[^>]+>"), ""),
            ).replace(Regex("[ \\t]+"), " ").replace(Regex("\n{3,}"), "\n\n").trim()
            ToolResult("Plain text", text.ifBlank { "—" }, listOf("Characters" to fmt(text.length.toLong())))
        },
    ),
    Tool(
        slug = "line-numbers", title = "Add Line Numbers", category = "text",
        tagline = "Number every line, ready to quote.",
        keywords = listOf("number lines", "list"),
        fields = listOf(field("text", "Lines", FieldKind.MULTILINE)),
        compute = { input ->
            val lines = input["text"].orEmpty().lines()
            if (lines.all { it.isBlank() }) return@Tool err("Add some lines first.")
            ToolResult(
                "Numbered", lines.mapIndexed { index, line -> "${index + 1}. $line" }.joinToString("\n"),
                listOf("Lines" to fmt(lines.size.toLong())),
            )
        },
    ),
    Tool(
        slug = "remove-accents", title = "Remove Accents", category = "text",
        tagline = "Ünïcödé in, plain ASCII out.",
        keywords = listOf("accents", "diacritics", "ascii"),
        fields = listOf(field("text", "Text", FieldKind.MULTILINE)),
        compute = { input ->
            val raw = input["text"].orEmpty()
            if (raw.isEmpty()) return@Tool err("Type something first.")
            val plain = Normalizer.normalize(raw, Normalizer.Form.NFD).replace(Regex("\\p{M}+"), "")
            ToolResult("Plain text", plain, listOf("Characters" to "${raw.length} → ${plain.length}"))
        },
    ),
    Tool(
        slug = "quadratic", title = "Quadratic Solver", category = "calculators",
        tagline = "Roots of ax² + bx + c, real or complex.",
        keywords = listOf("quadratic", "roots", "parabola"),
        fields = listOf(
            field("a", "a", FieldKind.DECIMAL, default = "1"),
            field("b", "b", FieldKind.DECIMAL, default = "-3"),
            field("c", "c", FieldKind.DECIMAL, default = "2"),
        ),
        compute = { input ->
            val a = input.num("a") ?: return@Tool err("Enter a.")
            val b = input.num("b") ?: return@Tool err("Enter b.")
            val c = input.num("c") ?: return@Tool err("Enter c.")
            if (a == 0.0) {
                if (b == 0.0) err("That is not a quadratic: a and b are both zero.")
                else ToolResult("Linear root", fmt(-c / b), listOf("a = 0" to "solved as bx + c = 0"))
            } else {
                val d = b * b - 4 * a * c
                when {
                    d > 0 -> {
                        val r = sqrt(d)
                        ToolResult(
                            "Two real roots", "${fmt((-b + r) / (2 * a), 4)} and ${fmt((-b - r) / (2 * a), 4)}",
                            listOf("Discriminant" to fmt(d, 4), "Vertex x" to fmt(-b / (2 * a), 4)),
                        )
                    }
                    d == 0.0 -> ToolResult(
                        "One repeated root", fmt(-b / (2 * a), 4),
                        listOf("Discriminant" to "0", "Vertex" to fmt(-b / (2 * a), 4)),
                    )
                    else -> {
                        val real = -b / (2 * a)
                        val imaginary = sqrt(-d) / (2 * a)
                        ToolResult(
                            "Two complex roots",
                            "${fmt(real, 4)} ± ${fmt(abs(imaginary), 4)}i",
                            listOf("Discriminant" to fmt(d, 4)),
                        )
                    }
                }
            }
        },
    ),
    Tool(
        slug = "gcd-lcm", title = "GCD & LCM", category = "calculators",
        tagline = "Greatest common divisor and lowest common multiple.",
        keywords = listOf("gcd", "lcm", "hcf"),
        fields = listOf(
            field("x", "First number", FieldKind.NUMBER, default = "84"),
            field("y", "Second number", FieldKind.NUMBER, default = "36"),
        ),
        compute = { input ->
            val x = (input.num("x") ?: return@Tool err("Enter the first number.")).toLong()
            val y = (input.num("y") ?: return@Tool err("Enter the second number.")).toLong()
            if (x == 0L || y == 0L) return@Tool err("Both numbers must be non-zero.")
            var a = abs(x)
            var b = abs(y)
            while (b != 0L) {
                val t = b
                b = a % b
                a = t
            }
            val g = a
            ToolResult(
                "GCD", fmt(g),
                listOf("LCM" to fmt(abs(x / g * y)), "Simplified ratio" to "${x / g} : ${y / g}"),
            )
        },
    ),
    Tool(
        slug = "prime-check", title = "Prime Check", category = "calculators",
        tagline = "Prime or not, and why.",
        keywords = listOf("prime", "factor", "divisible"),
        fields = listOf(field("number", "Number", FieldKind.NUMBER, default = "97")),
        compute = { input ->
            val n = (input.num("number") ?: return@Tool err("Enter a number.")).toLong()
            if (n < 2) return@Tool err("Primes start at 2.")
            if (n > 1_000_000_000_000L) return@Tool err("Keep it below a trillion.")
            var divisor = 2L
            var found = 0L
            while (divisor * divisor <= n) {
                if (n % divisor == 0L) {
                    found = divisor
                    break
                }
                divisor++
            }
            if (found == 0L) {
                ToolResult("Prime", fmt(n), listOf("Divisors" to "1 and itself"))
            } else {
                ToolResult("Not prime", fmt(n), listOf("Smallest divisor" to fmt(found), "Other factor" to fmt(n / found)))
            }
        },
    ),
    Tool(
        slug = "factorial", title = "Factorial", category = "calculators",
        tagline = "n! exactly, however large it gets.",
        keywords = listOf("factorial", "n!"),
        fields = listOf(field("n", "n", FieldKind.NUMBER, default = "20")),
        compute = { input ->
            val n = (input.num("n") ?: return@Tool err("Enter n.")).toInt()
            if (n < 0) return@Tool err("Factorials need 0 or more.")
            if (n > 500) return@Tool err("Keep n at 500 or below.")
            var result = BigInteger.ONE
            for (i in 2..n) result = result.multiply(BigInteger.valueOf(i.toLong()))
            ToolResult("$n!", result.toString(), listOf("Digits" to result.toString().length.toString()))
        },
    ),
    Tool(
        slug = "simple-interest", title = "Simple Interest", category = "finance",
        tagline = "Interest without compounding, and the total.",
        keywords = listOf("simple interest", "i = prt"),
        fields = listOf(
            field("principal", "Principal", FieldKind.DECIMAL, default = "200000"),
            field("rate", "Annual rate (%)", FieldKind.DECIMAL, default = "12"),
            field("years", "Years", FieldKind.DECIMAL, default = "3"),
        ),
        compute = { input ->
            val p = input.num("principal") ?: return@Tool err("Enter the principal.")
            val r = (input.num("rate") ?: 0.0) / 100
            val t = input.num("years") ?: 0.0
            val interest = p * r * t
            ToolResult(
                "Interest", fmt(interest),
                listOf("Total" to fmt(p + interest), "Per year" to fmt(p * r)),
            )
        },
    ),
    Tool(
        slug = "fuel-efficiency", title = "Fuel Efficiency", category = "everyday",
        tagline = "Litres per 100 km, and the equivalent in mpg.",
        keywords = listOf("mpg", "fuel economy", "consumption"),
        fields = listOf(
            field("distance", "Distance (km)", FieldKind.DECIMAL, default = "520"),
            field("fuel", "Fuel used (litres)", FieldKind.DECIMAL, default = "42"),
        ),
        compute = { input ->
            val km = input.num("distance") ?: return@Tool err("Enter a distance.")
            val litres = input.num("fuel") ?: return@Tool err("Enter the fuel used.")
            if (km <= 0 || litres <= 0) return@Tool err("Use positive numbers.")
            val per100 = litres / km * 100
            val usMpg = 235.215 / per100
            val ukMpg = 282.481 / per100
            ToolResult(
                "Consumption", "${fmt(per100, 2)} L/100 km",
                listOf("US mpg" to fmt(usMpg, 1), "UK mpg" to fmt(ukMpg, 1), "km per litre" to fmt(km / litres, 2)),
            )
        },
    ),
    Tool(
        slug = "sleep-cycles", title = "Sleep Cycles", category = "everyday",
        tagline = "Bedtimes that land between cycles, not in the middle.",
        keywords = listOf("sleep", "bedtime", "wake up"),
        fields = listOf(
            field("time", "Wake-up time (HH:mm)", FieldKind.TEXT, default = "06:30"),
            field("cycles", "Cycles", FieldKind.SELECT, default = "5", options = listOf("4", "5", "6")),
        ),
        compute = { input ->
            val match = Regex("([01]?\\d|2[0-3]):([0-5]\\d)").find(input.text("time"))
                ?: return@Tool err("Use a 24-hour time such as 06:30.")
            val wake = LocalTime.of(match.groupValues[1].toInt(), match.groupValues[2].toInt())
            val cycles = input["cycles"]?.toIntOrNull() ?: 5
            val bed = wake.minusMinutes(cycles * 90L + 15L)
            ToolResult(
                "Bedtime", bed.toString(),
                listOf(
                    "Wake" to wake.toString(),
                    "Cycles" to "$cycles × 90 min",
                    "Wind-down" to "15 min counted in",
                    "Falling asleep at" to bed.plusMinutes(15).toString(),
                ),
                note = "A 90-minute cycle is an average. Consistency matters more than the exact number.",
            )
        },
    ),
    Tool(
        slug = "recipe-scale", title = "Scale a Recipe", category = "everyday",
        tagline = "Resize every quantity by the servings you need.",
        keywords = listOf("recipe", "scale", "servings"),
        fields = listOf(
            field("from", "Original servings", FieldKind.NUMBER, default = "4"),
            field("to", "Servings needed", FieldKind.NUMBER, default = "6"),
            field("quantity", "One ingredient quantity", FieldKind.DECIMAL, default = "250"),
            field("unit", "Unit", FieldKind.TEXT, default = "g"),
        ),
        compute = { input ->
            val from = input.num("from") ?: return@Tool err("Enter the original servings.")
            val to = input.num("to") ?: return@Tool err("Enter the servings you need.")
            val quantity = input.num("quantity") ?: return@Tool err("Enter a quantity.")
            if (from <= 0 || to <= 0) return@Tool err("Servings must be positive.")
            val factor = to / from
            ToolResult(
                "Scaled quantity", "${fmt(quantity * factor, 2)} ${input.text("unit")}",
                listOf("Factor" to "${fmt(factor, 2)}×", "Original" to "${fmt(quantity)} ${input.text("unit")}"),
            )
        },
    ),
    Tool(
        slug = "time-add", title = "Add Time", category = "everyday",
        tagline = "A start time plus minutes, wrapped past midnight.",
        keywords = listOf("add minutes", "time calculator"),
        fields = listOf(
            field("start", "Start (HH:mm)", FieldKind.TEXT, default = "09:45"),
            field("minutes", "Add minutes", FieldKind.NUMBER, default = "150"),
        ),
        compute = { input ->
            val match = Regex("([01]?\\d|2[0-3]):([0-5]\\d)").find(input.text("start"))
                ?: return@Tool err("Use a 24-hour time such as 09:45.")
            val start = LocalTime.of(match.groupValues[1].toInt(), match.groupValues[2].toInt())
            val minutes = (input.num("minutes") ?: 0.0).toLong()
            val end = start.plusMinutes(minutes)
            val days = floor((start.toSecondOfDay() + minutes * 60) / 86400.0).toInt()
            ToolResult(
                "Finish", end.toString(),
                listOf("Added" to "$minutes min", "Days later" to if (days > 0) "$days" else "same day"),
            )
        },
    ),
    Tool(
        slug = "regex-escape", title = "Escape Regex", category = "developer",
        tagline = "Turn literal text into a safe pattern.",
        keywords = listOf("regex", "escape"),
        fields = listOf(field("text", "Literal text", FieldKind.MULTILINE, placeholder = "price: £4.99 (incl. VAT)")),
        compute = { input ->
            val raw = input["text"].orEmpty()
            if (raw.isEmpty()) return@Tool err("Type the text you want to match literally.")
            ToolResult("Pattern", Regex.escape(raw), listOf("Length" to "${raw.length}"))
        },
    ),
    Tool(
        slug = "csv-to-json", title = "CSV to JSON", category = "developer",
        tagline = "The first row becomes the keys.",
        keywords = listOf("csv", "json", "convert"),
        fields = listOf(
            field("csv", "CSV", FieldKind.MULTILINE, default = "name,role\nAda,engineer\nGrace,admiral"),
            field("delimiter", "Delimiter", FieldKind.SELECT, default = ",", options = listOf(",", ";", "\t", "|")),
        ),
        compute = { input ->
            val delimiter = input["delimiter"] ?: ","
            val rows = input["csv"].orEmpty().lines().filter { it.isNotBlank() }
            if (rows.size < 2) return@Tool err("A header row and at least one data row are needed.")
            val header = rows.first().split(delimiter).map { it.trim() }
            val objects = rows.drop(1).map { row ->
                val cells = row.split(delimiter).map { it.trim() }
                header.mapIndexed { index, key -> key to cells.getOrElse(index) { "" } }.toMap()
            }
            ToolResult(
                "Rows", fmt(objects.size.toLong()),
                listOf("Columns" to header.joinToString(", ")),
                note = Json.write(objects, true),
            )
        },
    ),
    Tool(
        slug = "url-parser", title = "URL Parser", category = "developer",
        tagline = "Scheme, host, path and query, separated.",
        keywords = listOf("parse url", "query string"),
        fields = listOf(field("url", "URL", FieldKind.TEXT, default = "https://toolz.name.ng/tools?q=vat&ref=app")),
        compute = { input ->
            val raw = input.text("url")
            val uri = runCatching { java.net.URI(raw) }.getOrNull()
                ?: return@Tool err("That is not a valid URL.")
            if (uri.host == null && uri.scheme == null) return@Tool err("Include the scheme, for example https://…")
            ToolResult(
                "Host", uri.host ?: "—",
                listOf(
                    "Scheme" to (uri.scheme ?: "—"),
                    "Path" to uri.path.orEmpty().ifEmpty { "/" },
                    "Query" to (uri.query ?: "—"),
                    "Fragment" to (uri.fragment ?: "—"),
                ),
            )
        },
    ),
    Tool(
        slug = "http-status", title = "HTTP Status", category = "developer",
        tagline = "What a status code means, in one line.",
        keywords = listOf("http status", "404", "500"),
        fields = listOf(field("code", "Status code", FieldKind.NUMBER, default = "404")),
        compute = { input ->
            val code = (input.num("code") ?: return@Tool err("Enter a status code.")).toInt()
            val meaning = HTTP_STATUS[code] ?: return@Tool err("No standard meaning for $code.")
            ToolResult(
                code.toString(), meaning,
                listOf("Class" to when (code / 100) {
                    1 -> "Informational"
                    2 -> "Success"
                    3 -> "Redirect"
                    4 -> "Client error"
                    5 -> "Server error"
                    else -> "Unknown"
                }),
            )
        },
    ),
    Tool(
        slug = "html-entities", title = "HTML Entities", category = "developer",
        tagline = "Escape text for HTML, or read it back.",
        keywords = listOf("html escape", "entities"),
        fields = listOf(
            field("mode", "Direction", FieldKind.SELECT, default = "Escape", options = listOf("Escape", "Unescape")),
            field("text", "Text", FieldKind.MULTILINE),
        ),
        compute = { input ->
            val raw = input["text"].orEmpty()
            if (raw.isEmpty()) return@Tool err("Type something first.")
            val out = if (input["mode"] == "Unescape") {
                unescapeHtml(raw)
            } else {
                raw.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("\"", "&quot;")
            }
            ToolResult(if (input["mode"] == "Unescape") "Unescaped" else "Escaped", out)
        },
    ),
    Tool(
        slug = "late-fee", title = "Late Payment Fee", category = "business",
        tagline = "Interest owed on an overdue invoice.",
        keywords = listOf("late fee", "overdue invoice"),
        fields = listOf(
            field("amount", "Invoice amount", FieldKind.DECIMAL, default = "450000"),
            field("days", "Days overdue", FieldKind.NUMBER, default = "30"),
            field("rate", "Annual rate (%)", FieldKind.DECIMAL, default = "18"),
        ),
        compute = { input ->
            val amount = input.num("amount") ?: return@Tool err("Enter the invoice amount.")
            val days = (input.num("days") ?: 0.0).toInt()
            val rate = (input.num("rate") ?: 0.0) / 100
            if (amount <= 0) return@Tool err("Amount must be positive.")
            if (days < 0) return@Tool err("Days overdue cannot be negative.")
            val fee = amount * rate * days / 365
            ToolResult(
                "Late fee", fmt(fee),
                listOf("Now owed" to fmt(amount + fee), "Daily" to fmt(amount * rate / 365)),
                note = "Simple interest on the outstanding amount. Check what your contract or local law allows before charging it.",
            )
        },
    ),
    Tool(
        slug = "exam-score", title = "Exam Score", category = "education",
        tagline = "Marks to a percentage, with what each mark is worth.",
        keywords = listOf("exam", "score", "percentage"),
        fields = listOf(
            field("score", "Marks scored", FieldKind.DECIMAL, default = "68"),
            field("total", "Total marks", FieldKind.DECIMAL, default = "85"),
        ),
        compute = { input ->
            val score = input.num("score") ?: return@Tool err("Enter the marks scored.")
            val total = input.num("total") ?: return@Tool err("Enter the total marks.")
            if (total <= 0) return@Tool err("Total marks must be positive.")
            if (score > total) return@Tool err("Marks scored cannot exceed the total.")
            val percent = score / total * 100
            ToolResult(
                "Percentage", pct(percent, 1),
                listOf(
                    "Marks lost" to fmt(total - score),
                    "Each mark worth" to pct(100 / total, 2),
                    "Grade band" to when {
                        percent >= 70 -> "Distinction"
                        percent >= 60 -> "Credit"
                        percent >= 50 -> "Pass"
                        percent >= 40 -> "Borderline pass"
                        else -> "Below pass"
                    },
                ),
                note = "Bands are a common five-band scale. Your school or board may differ.",
            )
        },
    ),
)

private val HTTP_STATUS = mapOf(
    200 to "OK — the request succeeded.",
    201 to "Created — a new resource now exists.",
    204 to "No content — success, nothing to return.",
    301 to "Moved permanently — update your links.",
    302 to "Found — a temporary redirect.",
    304 to "Not modified — use your cached copy.",
    400 to "Bad request — the server could not parse it.",
    401 to "Unauthorised — authentication is required.",
    403 to "Forbidden — authenticated but not allowed.",
    404 to "Not found — no resource at that address.",
    405 to "Method not allowed — wrong verb for this URL.",
    409 to "Conflict — the request clashes with current state.",
    410 to "Gone — it existed and was deliberately removed.",
    422 to "Unprocessable — well-formed but invalid data.",
    429 to "Too many requests — rate limited.",
    500 to "Server error — the server failed unexpectedly.",
    501 to "Not implemented — the method is unsupported.",
    502 to "Bad gateway — an upstream service failed.",
    503 to "Unavailable — overloaded or in maintenance.",
    504 to "Gateway timeout — an upstream service was too slow.",
)
