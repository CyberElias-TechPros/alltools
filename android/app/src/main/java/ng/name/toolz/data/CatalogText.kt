package ng.name.toolz.data

import java.util.Locale
import kotlin.math.abs
import kotlin.math.ceil
import kotlin.math.max
import kotlin.math.pow
import kotlin.math.sqrt

/**
 * Text, calculator and money tools.
 *
 * Every tool in the app is data plus one pure function, so the whole catalogue
 * can be tested on the JVM and the UI can stay a single generic screen.
 */

internal fun wordsOf(text: String): List<String> =
    text.trim().split(Regex("\\s+")).filter { it.isNotBlank() }

internal fun sentenceCount(text: String): Int =
    text.split(Regex("[.!?…]+")).count { it.isNotBlank() }

internal fun titleCase(word: String): String =
    word.lowercase(Locale.UK).replaceFirstChar { if (it.isLowerCase()) it.titlecase(Locale.UK) else it.toString() }

internal fun parseNumbers(raw: String): List<Double> =
    raw.split(Regex("[\\s,;]+")).mapNotNull { it.replace(Regex("[^0-9.\\-]"), "").toDoubleOrNull() }

internal const val LOREM =
    "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua"

internal val textTools = listOf(
    Tool(
        slug = "word-counter", title = "Word Counter", category = "text",
        tagline = "Words, characters, sentences and reading time as you type.",
        keywords = listOf("word count", "character count", "reading time"),
        fields = listOf(field("text", "Your text", FieldKind.MULTILINE, placeholder = "Paste or write anything…")),
        compute = { input ->
            val raw = input["text"].orEmpty()
            val w = wordsOf(raw).size
            ToolResult(
                label = "Words", value = fmt(w.toLong()),
                details = listOf(
                    "Characters" to fmt(raw.length.toLong()),
                    "No spaces" to fmt(raw.count { !it.isWhitespace() }.toLong()),
                    "Sentences" to fmt(sentenceCount(raw).toLong()),
                    "Paragraphs" to fmt(raw.split(Regex("\\n\\s*\\n")).count { it.isNotBlank() }.toLong()),
                    "Reading time" to "${fmt(max(1.0, ceil(w / 225.0)), 0)} min",
                    "Speaking time" to "${fmt(max(1.0, ceil(w / 130.0)), 0)} min",
                ),
            )
        },
    ),
    Tool(
        slug = "case-converter", title = "Case Converter", category = "text",
        tagline = "UPPER, lower, Title, sentence, camel, snake and kebab.",
        keywords = listOf("uppercase", "lowercase", "title case"),
        fields = listOf(
            field("text", "Your text", FieldKind.MULTILINE),
            field(
                "mode", "Convert to", FieldKind.SELECT, default = "Title Case",
                options = listOf("Title Case", "UPPERCASE", "lowercase", "Sentence case", "camelCase", "snake_case", "kebab-case", "InVeRsE"),
            ),
        ),
        compute = { input ->
            val raw = input["text"].orEmpty()
            val mode = input["mode"] ?: "Title Case"
            val pieces = wordsOf(raw)
            val out = when (mode) {
                "UPPERCASE" -> raw.uppercase(Locale.UK)
                "lowercase" -> raw.lowercase(Locale.UK)
                "Title Case" -> raw.split("\n").joinToString("\n") { line -> wordsOf(line).joinToString(" ") { titleCase(it) } }
                "Sentence case" -> raw.lowercase(Locale.UK)
                    .replace(Regex("(^|[.!?]\\s+)([a-z])")) { m -> m.groupValues[1] + m.groupValues[2].uppercase(Locale.UK) }
                "camelCase" -> pieces.mapIndexed { i, w -> if (i == 0) w.lowercase(Locale.UK) else titleCase(w) }.joinToString("")
                "snake_case" -> pieces.joinToString("_") { it.lowercase(Locale.UK) }
                "kebab-case" -> pieces.joinToString("-") { it.lowercase(Locale.UK) }
                "InVeRsE" -> raw.map { if (it.isUpperCase()) it.lowercaseChar() else it.uppercaseChar() }.joinToString("")
                else -> raw
            }
            ToolResult(
                label = mode, value = out.ifBlank { "—" },
                note = "Copy keeps the full text, however long it is.",
            )
        },
    ),
    Tool(
        slug = "duplicate-lines", title = "Duplicate Lines", category = "text",
        tagline = "Keep the first of each line, drop the rest.",
        keywords = listOf("dedupe", "remove duplicates"),
        fields = listOf(
            field("text", "Your lines", FieldKind.MULTILINE),
            field("ignoreCase", "Ignore capitalisation", FieldKind.TOGGLE, default = "true"),
        ),
        compute = { input ->
            val lines = input["text"].orEmpty().lines()
            val seen = HashSet<String>()
            val kept = lines.filter { line ->
                seen.add(
                    if (input.flag("ignoreCase")) line.trim().lowercase(Locale.UK) else line.trim(),
                )
            }
            ToolResult(
                label = "Unique lines", value = fmt(kept.count { it.isNotBlank() }.toLong()),
                details = listOf("Removed" to fmt((lines.size - kept.size).toLong())),
                note = kept.filter { it.isNotBlank() }.joinToString("\n").ifBlank { null },
            )
        },
    ),
    Tool(
        slug = "sort-lines", title = "Sort Lines", category = "text",
        tagline = "Alphabetical, reverse or by length — instantly.",
        keywords = listOf("sort text", "alphabetise"),
        fields = listOf(
            field("text", "Your lines", FieldKind.MULTILINE),
            field("mode", "Order", FieldKind.SELECT, default = "A → Z", options = listOf("A → Z", "Z → A", "Shortest first", "Longest first")),
        ),
        compute = { input ->
            val lines = input["text"].orEmpty().lines().filter { it.isNotBlank() }
            val sorted = when (input["mode"]) {
                "Z → A" -> lines.sortedDescending()
                "Shortest first" -> lines.sortedBy { it.length }
                "Longest first" -> lines.sortedByDescending { it.length }
                else -> lines.sorted()
            }
            ToolResult(label = "Lines", value = fmt(sorted.size.toLong()), note = sorted.joinToString("\n").ifBlank { null })
        },
    ),
    Tool(
        slug = "line-breaks", title = "Line Breaks", category = "text",
        tagline = "Join wrapped text back into clean paragraphs.",
        keywords = listOf("remove line breaks", "join lines"),
        fields = listOf(
            field("text", "Your text", FieldKind.MULTILINE),
            field("mode", "Replace breaks with", FieldKind.SELECT, default = "Space", options = listOf("Space", "Nothing", "Single newline")),
        ),
        compute = { input ->
            val raw = input["text"].orEmpty()
            val joiner = when (input["mode"]) {
                "Nothing" -> ""
                "Single newline" -> "\n"
                else -> " "
            }
            val out = raw.split(Regex("\\n+")).joinToString(joiner) { it.trim() }
            ToolResult(label = "Result", value = "${fmt(out.length.toLong())} characters", note = out.ifBlank { null })
        },
    ),
    Tool(
        slug = "slug", title = "Slug Generator", category = "text",
        tagline = "Turn a title into a clean, readable URL slug.",
        keywords = listOf("url slug", "permalink"),
        fields = listOf(field("text", "Title", FieldKind.TEXT, placeholder = "How to choose a strong password")),
        compute = { input ->
            val slug = input["text"].orEmpty()
                .lowercase(Locale.UK)
                .replace(Regex("[^a-z0-9\\s-]"), "")
                .trim()
                .replace(Regex("[\\s-]+"), "-")
            ToolResult(label = "Slug", value = slug.ifBlank { "—" }, details = listOf("Length" to "${slug.length}"))
        },
    ),
    Tool(
        slug = "lorem-ipsum", title = "Lorem Ipsum", category = "text",
        tagline = "Placeholder copy in paragraphs, sentences or words.",
        keywords = listOf("placeholder text", "dummy text"),
        fields = listOf(
            field("count", "How many", FieldKind.NUMBER, default = "3"),
            field("unit", "Unit", FieldKind.SELECT, default = "Paragraphs", options = listOf("Paragraphs", "Sentences", "Words")),
        ),
        compute = { input ->
            val n = (input.num("count") ?: 3.0).toInt().coerceIn(1, 30)
            val pool = LOREM.split(" ")
            fun word(i: Int) = pool[(i % pool.size + pool.size) % pool.size]
            val out = when (input["unit"]) {
                "Words" -> (1..n).map { word(it) }.joinToString(" ")
                "Sentences" -> (1..n).joinToString(" ") { s ->
                    (1..8).map { word(s * 7 + it) }.joinToString(" ").replaceFirstChar { it.uppercase() } + "."
                }
                else -> (1..n).joinToString("\n\n") { p ->
                    (1..4).joinToString(" ") { s ->
                        (1..9).map { word(p * 3 + s * 9 + it) }.joinToString(" ").replaceFirstChar { it.uppercase() } + "."
                    }
                }
            }
            ToolResult(label = "Generated", value = out)
        },
    ),
    Tool(
        slug = "reverse", title = "Text Reverser", category = "text",
        tagline = "Reverse characters, words or lines.",
        keywords = listOf("reverse text", "backwards"),
        fields = listOf(
            field("text", "Your text", FieldKind.MULTILINE, placeholder = "Hello world"),
            field("mode", "Reverse", FieldKind.SELECT, default = "Characters", options = listOf("Characters", "Words", "Lines")),
        ),
        compute = { input ->
            val raw = input["text"].orEmpty()
            val out = when (input["mode"]) {
                "Words" -> wordsOf(raw).reversed().joinToString(" ")
                "Lines" -> raw.lines().reversed().joinToString("\n")
                else -> raw.reversed()
            }
            ToolResult(label = "Reversed", value = out.ifBlank { "—" })
        },
    ),
    Tool(
        slug = "find-replace", title = "Find & Replace", category = "text",
        tagline = "Every match, with a count before you copy.",
        keywords = listOf("replace text", "search and replace"),
        fields = listOf(
            field("text", "Your text", FieldKind.MULTILINE),
            field("find", "Find", FieldKind.TEXT),
            field("replace", "Replace with", FieldKind.TEXT),
            field("ignoreCase", "Ignore capitalisation", FieldKind.TOGGLE, default = "true"),
        ),
        compute = { input ->
            val raw = input["text"].orEmpty()
            val find = input.text("find")
            if (find.isEmpty()) return@Tool err("Type something to find.")
            val regex = Regex(Regex.escape(find), if (input.flag("ignoreCase")) RegexOption.IGNORE_CASE else RegexOption.DEFAULT)
            val matches = regex.findAll(raw).count()
            ToolResult(
                label = "Result",
                value = regex.replace(raw, input["replace"].orEmpty()).ifBlank { "—" },
                details = listOf("Matches replaced" to fmt(matches.toLong())),
            )
        },
    ),
    Tool(
        slug = "reading-time", title = "Reading Time", category = "text",
        tagline = "Reading and speaking time for any passage.",
        keywords = listOf("reading time", "speaking time"),
        fields = listOf(field("text", "Your text", FieldKind.MULTILINE)),
        compute = { input ->
            val w = wordsOf(input["text"].orEmpty()).size
            ToolResult(
                label = "Words", value = fmt(w.toLong()),
                details = listOf(
                    "Reading time" to "${fmt(max(1.0, ceil(w / 225.0)), 0)} min",
                    "Speaking time" to "${fmt(max(1.0, ceil(w / 130.0)), 0)} min",
                ),
                note = "225 wpm is the common reading average; 130 wpm is a measured speaking pace.",
            )
        },
    ),
)

internal val calculatorTools = listOf(
    Tool(
        slug = "percentage", title = "Percentage", category = "calculators",
        tagline = "A share of a number, a ratio, or a change.",
        keywords = listOf("percent", "percentage change"),
        fields = listOf(
            field("mode", "Question", FieldKind.SELECT, default = "X% of Y", options = listOf("X% of Y", "X is what % of Y", "% change X → Y")),
            field("x", "X", FieldKind.DECIMAL, default = "25"),
            field("y", "Y", FieldKind.DECIMAL, default = "200"),
        ),
        compute = { input ->
            val x = input.num("x") ?: return@Tool err("Enter X.")
            val y = input.num("y") ?: return@Tool err("Enter Y.")
            when (input["mode"]) {
                "X is what % of Y" ->
                    if (y == 0.0) err("Y cannot be zero.")
                    else ToolResult("%", pct(x / y * 100), listOf("Formula" to "${fmt(x)} ÷ ${fmt(y)} × 100"))
                "% change X → Y" ->
                    if (x == 0.0) err("X cannot be zero.")
                    else {
                        val change = (y - x) / abs(x) * 100
                        ToolResult(
                            label = if (change >= 0) "Increase" else "Decrease",
                            value = pct(abs(change)),
                            details = listOf("From" to fmt(x), "To" to fmt(y)),
                        )
                    }
                else -> ToolResult(
                    label = "${fmt(x)}% of ${fmt(y)}", value = fmt(x / 100 * y),
                    details = listOf("Formula" to "${fmt(x)} ÷ 100 × ${fmt(y)}"),
                )
            }
        },
    ),
    Tool(
        slug = "vat", title = "VAT Calculator", category = "calculators",
        tagline = "Add VAT to a net price, or take it out of a gross one.",
        keywords = listOf("vat", "sales tax", "gross net"),
        fields = listOf(
            field("rate", "VAT rate (%)", FieldKind.DECIMAL, default = "20"),
            field("amount", "Amount", FieldKind.DECIMAL, default = "100"),
            field("mode", "Direction", FieldKind.SELECT, default = "Add VAT", options = listOf("Add VAT", "Remove VAT")),
        ),
        compute = { input ->
            val rate = input.num("rate") ?: return@Tool err("Enter a rate.")
            val amount = input.num("amount") ?: return@Tool err("Enter an amount.")
            if (rate < 0) return@Tool err("A rate cannot be negative.")
            val r = rate / 100
            if (input["mode"] == "Remove VAT") {
                val net = amount / (1 + r)
                ToolResult("Net (excl. VAT)", fmt(net), listOf("VAT" to fmt(amount - net), "Gross" to fmt(amount)))
            } else {
                val vat = amount * r
                ToolResult("Gross (incl. VAT)", fmt(amount + vat), listOf("Net" to fmt(amount), "VAT" to fmt(vat)))
            }
        },
    ),
    Tool(
        slug = "bmi", title = "BMI", category = "calculators",
        tagline = "Body mass index with the WHO band it falls in.",
        keywords = listOf("body mass index", "healthy weight"),
        fields = listOf(
            field("weight", "Weight (kg)", FieldKind.DECIMAL, default = "70"),
            field("height", "Height (cm)", FieldKind.DECIMAL, default = "175"),
        ),
        compute = { input ->
            val kg = input.num("weight") ?: return@Tool err("Enter a weight.")
            val cm = input.num("height") ?: return@Tool err("Enter a height.")
            if (kg <= 0 || cm <= 0) return@Tool err("Use positive numbers.")
            val m = cm / 100
            val bmi = kg / (m * m)
            val band = when {
                bmi < 18.5 -> "Underweight"
                bmi < 25 -> "Healthy range"
                bmi < 30 -> "Overweight"
                else -> "Obese"
            }
            ToolResult(
                "BMI", fmt(bmi, 1),
                listOf("Band" to band, "Healthy weight" to "${fmt(18.5 * m * m, 1)}–${fmt(24.9 * m * m, 1)} kg"),
                note = "A screening number, not a diagnosis — it cannot tell muscle from fat.",
            )
        },
    ),
    Tool(
        slug = "age", title = "Age Calculator", category = "calculators",
        tagline = "Exact age in years, months and days.",
        keywords = listOf("age", "date of birth", "birthday"),
        fields = listOf(field("dob", "Date of birth (YYYY-MM-DD)", FieldKind.TEXT, default = "1995-06-15", placeholder = "1995-06-15")),
        compute = { input ->
            val dob = runCatching { java.time.LocalDate.parse(input.text("dob")) }.getOrNull()
                ?: return@Tool err("Use YYYY-MM-DD, for example 1995-06-15.")
            val today = java.time.LocalDate.now()
            if (dob.isAfter(today)) return@Tool err("That date is in the future.")
            val p = java.time.Period.between(dob, today)
            val days = java.time.temporal.ChronoUnit.DAYS.between(dob, today)
            ToolResult(
                "Age", "${p.years} years",
                listOf(
                    "Also" to "${p.years}y ${p.months}m ${p.days}d",
                    "Total days" to fmt(days),
                ),
            )
        },
    ),
    Tool(
        slug = "date-difference", title = "Date Difference", category = "calculators",
        tagline = "Days between two dates, weekends excluded if you want.",
        keywords = listOf("days between dates", "date span"),
        fields = listOf(
            field("start", "Start (YYYY-MM-DD)", FieldKind.TEXT, default = "2026-01-01"),
            field("end", "End (YYYY-MM-DD)", FieldKind.TEXT, default = "2026-12-31"),
            field("weekdays", "Count weekdays only", FieldKind.TOGGLE, default = "false"),
        ),
        compute = { input ->
            val a = runCatching { java.time.LocalDate.parse(input.text("start")) }.getOrNull()
                ?: return@Tool err("Start date must be YYYY-MM-DD.")
            val b = runCatching { java.time.LocalDate.parse(input.text("end")) }.getOrNull()
                ?: return@Tool err("End date must be YYYY-MM-DD.")
            val from = if (a.isAfter(b)) b else a
            val to = if (a.isAfter(b)) a else b
            val total = java.time.temporal.ChronoUnit.DAYS.between(from, to)
            val counted = if (input.flag("weekdays")) {
                var count = 0L
                var cursor = from
                while (cursor.isBefore(to)) {
                    if (cursor.dayOfWeek.value <= 5) count++
                    cursor = cursor.plusDays(1)
                }
                count
            } else total
            ToolResult(
                "Days", fmt(counted),
                listOf("Calendar days" to fmt(total), "Weeks" to fmt(total / 7.0, 1)),
            )
        },
    ),
    Tool(
        slug = "loan-emi", title = "Loan Payment", category = "calculators",
        tagline = "Monthly repayment and total interest on a loan.",
        keywords = listOf("loan", "emi", "mortgage", "repayment"),
        fields = listOf(
            field("principal", "Amount borrowed", FieldKind.DECIMAL, default = "250000"),
            field("rate", "Annual interest (%)", FieldKind.DECIMAL, default = "18"),
            field("months", "Term (months)", FieldKind.NUMBER, default = "60"),
        ),
        compute = { input ->
            val p = input.num("principal") ?: return@Tool err("Enter the amount.")
            val annual = input.num("rate") ?: 0.0
            val n = (input.num("months") ?: 0.0).toInt()
            if (p <= 0 || n <= 0) return@Tool err("Amount and term must be positive.")
            val r = annual / 100 / 12
            val emi = if (r == 0.0) p / n else p * r * (1 + r).pow(n) / ((1 + r).pow(n) - 1)
            val total = emi * n
            ToolResult(
                "Monthly payment", fmt(emi),
                listOf("Total repaid" to fmt(total), "Interest" to fmt(total - p), "Term" to "$n months"),
            )
        },
    ),
    Tool(
        slug = "compound-interest", title = "Compound Interest", category = "calculators",
        tagline = "What a lump sum grows to over time.",
        keywords = listOf("compound interest", "savings growth"),
        fields = listOf(
            field("principal", "Starting amount", FieldKind.DECIMAL, default = "100000"),
            field("rate", "Annual rate (%)", FieldKind.DECIMAL, default = "12"),
            field("years", "Years", FieldKind.DECIMAL, default = "5"),
            field("perYear", "Compounds per year", FieldKind.SELECT, default = "12", options = listOf("1", "2", "4", "12", "365")),
        ),
        compute = { input ->
            val p = input.num("principal") ?: return@Tool err("Enter a starting amount.")
            val rate = (input.num("rate") ?: 0.0) / 100
            val years = input.num("years") ?: 0.0
            val n = input["perYear"]?.toDoubleOrNull() ?: 12.0
            val total = p * (1 + rate / n).pow(n * years)
            ToolResult(
                "Future value", fmt(total),
                listOf("Interest earned" to fmt(total - p), "Growth" to pct((total - p) / p * 100, 1)),
            )
        },
    ),
    Tool(
        slug = "discount", title = "Discount", category = "calculators",
        tagline = "Sale price after one or two reductions.",
        keywords = listOf("discount", "sale price", "percent off"),
        fields = listOf(
            field("price", "Original price", FieldKind.DECIMAL, default = "250"),
            field("off", "Discount (%)", FieldKind.DECIMAL, default = "20"),
            field("extra", "Extra discount (%)", FieldKind.DECIMAL, default = "0"),
        ),
        compute = { input ->
            val price = input.num("price") ?: return@Tool err("Enter a price.")
            val off = input.num("off") ?: 0.0
            val extra = input.num("extra") ?: 0.0
            if (price <= 0) return@Tool err("Price must be positive.")
            val final = price * (1 - off / 100) * (1 - extra / 100)
            ToolResult(
                "You pay", fmt(final),
                listOf("You save" to fmt(price - final), "Effective discount" to pct((price - final) / price * 100, 1)),
            )
        },
    ),
    Tool(
        slug = "tip-split", title = "Tip Split", category = "calculators",
        tagline = "Tip, total and what each person owes.",
        keywords = listOf("tip", "bill split", "gratuity"),
        fields = listOf(
            field("bill", "Bill", FieldKind.DECIMAL, default = "48"),
            field("tip", "Tip (%)", FieldKind.DECIMAL, default = "15"),
            field("people", "People", FieldKind.NUMBER, default = "4"),
        ),
        compute = { input ->
            val bill = input.num("bill") ?: return@Tool err("Enter the bill.")
            val tip = input.num("tip") ?: 0.0
            val people = (input.num("people") ?: 1.0).toInt().coerceAtLeast(1)
            val tipAmount = bill * tip / 100
            val total = bill + tipAmount
            ToolResult("Each pays", fmt(total / people), listOf("Total" to fmt(total), "Tip" to fmt(tipAmount)))
        },
    ),
    Tool(
        slug = "average", title = "Average & Median", category = "calculators",
        tagline = "Mean, median, mode and range from a list.",
        keywords = listOf("average", "mean", "median", "mode"),
        fields = listOf(field("numbers", "Numbers", FieldKind.MULTILINE, default = "72, 85, 91, 68, 85")),
        compute = { input ->
            val values = parseNumbers(input["numbers"].orEmpty())
            if (values.size < 2) return@Tool err("Enter at least two numbers.")
            val sorted = values.sorted()
            val median = if (sorted.size % 2 == 1) sorted[sorted.size / 2]
            else (sorted[sorted.size / 2 - 1] + sorted[sorted.size / 2]) / 2
            val mode = values.groupingBy { it }.eachCount().maxByOrNull { it.value }
            ToolResult(
                "Mean", fmt(values.average()),
                listOf(
                    "Median" to fmt(median),
                    "Mode" to (mode?.let { fmt(it.key) } ?: "none"),
                    "Range" to fmt(sorted.last() - sorted.first()),
                    "Count" to fmt(values.size.toLong()),
                ),
            )
        },
    ),
    Tool(
        slug = "standard-deviation", title = "Standard Deviation", category = "calculators",
        tagline = "Population and sample spread, side by side.",
        keywords = listOf("standard deviation", "variance"),
        fields = listOf(field("numbers", "Numbers", FieldKind.MULTILINE, default = "72, 85, 91, 68, 85")),
        compute = { input ->
            val v = parseNumbers(input["numbers"].orEmpty())
            if (v.size < 2) return@Tool err("Enter at least two numbers.")
            val mean = v.average()
            val ss = v.sumOf { (it - mean).pow(2) }
            ToolResult(
                "Sample σ", fmt(sqrt(ss / (v.size - 1))),
                listOf("Population σ" to fmt(sqrt(ss / v.size)), "Mean" to fmt(mean), "n" to fmt(v.size.toLong())),
                note = "Use the sample figure when your numbers estimate a larger group.",
            )
        },
    ),
    Tool(
        slug = "roman-numerals", title = "Roman Numerals", category = "calculators",
        tagline = "Numbers to numerals and back.",
        keywords = listOf("roman numerals", "mcmxciv"),
        fields = listOf(
            field("mode", "Direction", FieldKind.SELECT, default = "Number → Roman", options = listOf("Number → Roman", "Roman → Number")),
            field("value", "Value", FieldKind.TEXT, default = "1994"),
        ),
        compute = { input ->
            val raw = input.text("value")
            if (input["mode"] == "Roman → Number") {
                val map = mapOf('I' to 1, 'V' to 5, 'X' to 10, 'L' to 50, 'C' to 100, 'D' to 500, 'M' to 1000)
                val s = raw.uppercase(Locale.UK).filter { it in map }
                if (s.isEmpty()) return@Tool err("Use I, V, X, L, C, D and M.")
                var total = 0
                s.forEachIndexed { i, c ->
                    val v = map.getValue(c)
                    val next = if (i + 1 < s.length) map.getValue(s[i + 1]) else 0
                    total += if (v < next) -v else v
                }
                ToolResult("Number", total.toString())
            } else {
                val n = raw.toIntOrNull() ?: return@Tool err("Enter a whole number from 1 to 3999.")
                if (n < 1 || n > 3999) return@Tool err("Roman numerals run from 1 to 3999.")
                val pairs = listOf(
                    1000 to "M", 900 to "CM", 500 to "D", 400 to "CD", 100 to "C", 90 to "XC",
                    50 to "L", 40 to "XL", 10 to "X", 9 to "IX", 5 to "V", 4 to "IV", 1 to "I",
                )
                var left = n
                val out = StringBuilder()
                for ((value, symbol) in pairs) {
                    while (left >= value) {
                        out.append(symbol)
                        left -= value
                    }
                }
                ToolResult("Roman", out.toString())
            }
        },
    ),
    Tool(
        slug = "random-number", title = "Random Number", category = "calculators",
        tagline = "Fair draws between two numbers, repeats optional.",
        keywords = listOf("random number", "raffle", "draw"),
        fields = listOf(
            field("min", "Minimum", FieldKind.NUMBER, default = "1"),
            field("max", "Maximum", FieldKind.NUMBER, default = "100"),
            field("count", "How many", FieldKind.NUMBER, default = "5"),
            field("unique", "No repeats", FieldKind.TOGGLE, default = "true"),
        ),
        compute = { input ->
            val low = (input.num("min") ?: 1.0).toInt()
            val high = (input.num("max") ?: 100.0).toInt()
            val count = (input.num("count") ?: 5.0).toInt().coerceIn(1, 100)
            if (high <= low) return@Tool err("Maximum must be larger than minimum.")
            val range = high - low + 1
            if (input.flag("unique") && count > range) {
                return@Tool err("A unique draw needs a range at least as large as the count.")
            }
            val picks = if (input.flag("unique")) {
                (low..high).shuffled().take(count)
            } else {
                (1..count).map { low + rng.nextInt(range) }
            }
            ToolResult("Numbers", picks.joinToString(", "), listOf("Range" to "$low–$high"))
        },
    ),
)

internal val financeTools = listOf(
    Tool(
        slug = "savings-goal", title = "Savings Goal", category = "finance",
        tagline = "How much to set aside each month to hit a target.",
        keywords = listOf("savings", "goal", "monthly saving"),
        fields = listOf(
            field("goal", "Goal amount", FieldKind.DECIMAL, default = "1000000"),
            field("have", "Already saved", FieldKind.DECIMAL, default = "150000"),
            field("rate", "Annual return (%)", FieldKind.DECIMAL, default = "8"),
            field("months", "Months", FieldKind.NUMBER, default = "24"),
        ),
        compute = { input ->
            val goal = input.num("goal") ?: return@Tool err("Enter the goal.")
            val have = input.num("have") ?: 0.0
            val annual = (input.num("rate") ?: 0.0) / 100
            val n = (input.num("months") ?: 0.0).toInt()
            if (n <= 0) return@Tool err("Enter a number of months.")
            val r = annual / 12
            val growth = have * (1 + r).pow(n)
            val remaining = goal - growth
            val monthly = when {
                remaining <= 0 -> 0.0
                r == 0.0 -> remaining / n
                else -> remaining * r / ((1 + r).pow(n) - 1)
            }
            ToolResult(
                "Save each month", fmt(max(monthly, 0.0)),
                listOf("Savings grow to" to fmt(growth), "Shortfall" to fmt(max(remaining, 0.0))),
            )
        },
    ),
    Tool(
        slug = "margin-markup", title = "Margin & Markup", category = "finance",
        tagline = "The same profit, told two different ways.",
        keywords = listOf("margin", "markup", "profit"),
        fields = listOf(
            field("cost", "Unit cost", FieldKind.DECIMAL, default = "60"),
            field("price", "Selling price", FieldKind.DECIMAL, default = "90"),
        ),
        compute = { input ->
            val cost = input.num("cost") ?: return@Tool err("Enter a cost.")
            val price = input.num("price") ?: return@Tool err("Enter a price.")
            if (price <= 0 || cost < 0) return@Tool err("Use positive numbers.")
            val profit = price - cost
            ToolResult(
                "Margin", pct(profit / price * 100, 1),
                listOf("Markup" to pct(if (cost == 0.0) 0.0 else profit / cost * 100, 1), "Profit per unit" to fmt(profit)),
            )
        },
    ),
    Tool(
        slug = "break-even", title = "Break-even", category = "finance",
        tagline = "Units you must sell before the business makes money.",
        keywords = listOf("break even", "fixed costs"),
        fields = listOf(
            field("fixed", "Fixed costs", FieldKind.DECIMAL, default = "120000"),
            field("price", "Price per unit", FieldKind.DECIMAL, default = "2500"),
            field("variable", "Variable cost per unit", FieldKind.DECIMAL, default = "1400"),
        ),
        compute = { input ->
            val fixed = input.num("fixed") ?: return@Tool err("Enter fixed costs.")
            val price = input.num("price") ?: return@Tool err("Enter a price.")
            val variable = input.num("variable") ?: 0.0
            val contribution = price - variable
            if (contribution <= 0) return@Tool err("Price must exceed the variable cost.")
            val units = ceil(fixed / contribution)
            ToolResult(
                "Break-even units", fmt(units, 0),
                listOf("Contribution per unit" to fmt(contribution), "Break-even revenue" to fmt(units * price)),
            )
        },
    ),
    Tool(
        slug = "roi", title = "Return on Investment", category = "finance",
        tagline = "Profit as a percentage of what you put in.",
        keywords = listOf("roi", "return", "investment"),
        fields = listOf(
            field("cost", "Amount invested", FieldKind.DECIMAL, default = "50000"),
            field("return", "Amount returned", FieldKind.DECIMAL, default = "68000"),
        ),
        compute = { input ->
            val cost = input.num("cost") ?: return@Tool err("Enter the amount invested.")
            val ret = input.num("return") ?: return@Tool err("Enter the amount returned.")
            if (cost <= 0) return@Tool err("Investment must be greater than zero.")
            val profit = ret - cost
            ToolResult("ROI", pct(profit / cost * 100, 1), listOf("Profit" to fmt(profit), "Multiple" to "${fmt(ret / cost, 2)}×"))
        },
    ),
    Tool(
        slug = "salary-hourly", title = "Salary ↔ Hourly", category = "finance",
        tagline = "What a salary works out to per hour, and the reverse.",
        keywords = listOf("hourly rate", "salary"),
        fields = listOf(
            field("salary", "Annual salary", FieldKind.DECIMAL, default = "4800000"),
            field("hours", "Hours per week", FieldKind.DECIMAL, default = "40"),
            field("weeks", "Paid weeks per year", FieldKind.DECIMAL, default = "52"),
        ),
        compute = { input ->
            val salary = input.num("salary") ?: return@Tool err("Enter a salary.")
            val hours = input.num("hours") ?: return@Tool err("Enter weekly hours.")
            val weeks = input.num("weeks") ?: 52.0
            if (hours <= 0 || weeks <= 0) return@Tool err("Hours and weeks must be positive.")
            val totalHours = hours * weeks
            ToolResult(
                "Per hour", fmt(salary / totalHours),
                listOf("Per month" to fmt(salary / 12), "Per week" to fmt(salary / weeks), "Hours per year" to fmt(totalHours, 0)),
            )
        },
    ),
)
