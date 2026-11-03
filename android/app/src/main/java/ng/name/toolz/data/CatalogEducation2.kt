package ng.name.toolz.data

import java.util.Locale
import kotlin.math.abs
import kotlin.math.floor
import kotlin.math.log10
import kotlin.math.pow

/** Study gaps: attendance, number words both ways, notation, tables, cards and citations. */

private val SMALL_WORDS = listOf(
    "zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten",
    "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen",
)
private val TENS_WORDS = listOf("", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety")
private val SCALES = listOf("", "thousand", "million", "billion", "trillion")

internal fun wordsBelowThousand(number: Long): String {
    var value = number
    val parts = mutableListOf<String>()
    if (value >= 100) {
        parts += SMALL_WORDS[(value / 100).toInt()] + " hundred"
        value %= 100
    }
    if (value >= 20) {
        val tens = TENS_WORDS[(value / 10).toInt()]
        val rest = value % 10
        parts += if (rest == 0L) tens else "$tens-${SMALL_WORDS[rest.toInt()]}"
    } else if (value > 0) {
        parts += SMALL_WORDS[value.toInt()]
    }
    return parts.joinToString(" ")
}

internal fun numberOfWords(number: Long): String {
    if (number == 0L) return "zero"
    if (number < 0) return "minus " + numberOfWords(-number)
    var value = number
    val parts = mutableListOf<String>()
    var scale = 0
    while (value > 0 && scale < SCALES.size) {
        val chunk = value % 1000
        if (chunk != 0L) {
            val chunkWords = wordsBelowThousand(chunk)
            parts.add(0, if (scale == 0) chunkWords else "$chunkWords ${SCALES[scale]}")
        }
        value /= 1000
        scale++
    }
    if (value > 0) return "that number is too large for words"
    return parts.joinToString(" ")
}

internal fun wordsToNumber(text: String): Long? {
    val cleaned = text.lowercase(Locale.UK).replace("-", " ").replace(",", " ")
    val tokens = cleaned.split(Regex("\\s+")).filter { it.isNotEmpty() && it != "and" }
    if (tokens.isEmpty()) return null
    val small = SMALL_WORDS.withIndex().associate { (index, word) -> word to index.toLong() }
    val scales = mapOf("thousand" to 1_000L, "million" to 1_000_000L, "billion" to 1_000_000_000L, "trillion" to 1_000_000_000_000L)
    var negative = false
    var total = 0L
    var current = 0L
    for (token in tokens) {
        when {
            token == "minus" || token == "negative" -> negative = true
            token == "a" || token == "an" -> current += 1
            small.containsKey(token) -> current += small.getValue(token)
            token == "hundred" -> current = (if (current == 0L) 1 else current) * 100
            scales.containsKey(token) -> {
                total += (if (current == 0L) 1 else current) * scales.getValue(token)
                current = 0
            }
            else -> return null
        }
    }
    val value = total + current
    return if (negative) -value else value
}

private fun scientificForm(value: Double): Pair<Double, Int> {
    if (value == 0.0) return 0.0 to 0
    val exponent = floor(log10(abs(value))).toInt()
    val mantissa = value / 10.0.pow(exponent)
    return mantissa to exponent
}

internal val educationTools2 = listOf(
    Tool(
        slug = "attendance", title = "Attendance", category = "education",
        tagline = "Your percentage, and what it takes to hit the target.",
        keywords = listOf("attendance", "classes", "percentage"),
        fields = listOf(
            field("held", "Sessions held", FieldKind.NUMBER, default = "40"),
            field("attended", "Sessions attended", FieldKind.NUMBER, default = "31"),
            field("target", "Required attendance (%)", FieldKind.DECIMAL, default = "75"),
        ),
        compute = { input ->
            val held = (input.num("held") ?: 0.0).toInt()
            val attended = (input.num("attended") ?: 0.0).toInt()
            val target = input.num("target") ?: 75.0
            if (held <= 0) return@Tool err("Sessions held must be greater than zero.")
            if (attended < 0 || attended > held) return@Tool err("You cannot attend more sessions than were held.")
            if (target !in 0.0..100.0) return@Tool err("The target runs from 0 to 100%.")
            val percentage = attended * 100.0 / held
            val needed = ((target / 100.0 * held) - attended).let { if (it <= 0) 0 else kotlin.math.ceil(it).toInt() }
            val canMiss = ((attended * 100.0 / target) - held).let { if (it <= 0) 0 else floor(it).toInt() }
            ToolResult(
                pct(percentage, 2),
                if (percentage >= target) "Above the $target% requirement." else "Below the ${fmt(target, 0)}% requirement by ${pct(target - percentage, 2)}.",
                listOf(
                    "Attended" to "$attended of $held",
                    "Missed" to (held - attended).toString(),
                    if (percentage >= target) ("Can still miss" to canMiss.toString()) else ("Sessions needed" to needed.toString()),
                ),
                note = "The count of sessions you can still miss assumes the requirement is a straight percentage; some schools count medical absences separately.",
            )
        },
    ),
    Tool(
        slug = "number-to-words", title = "Number to Words", category = "education",
        tagline = "2005 becomes two thousand five.",
        keywords = listOf("numbers", "words", "cheque"),
        fields = listOf(field("number", "Number", FieldKind.TEXT, default = "2005")),
        compute = { input ->
            val raw = input.text("number").replace(",", "").replace(" ", "")
            val value = raw.toLongOrNull() ?: return@Tool err("Enter a whole number.")
            if (abs(value) > 999_999_999_999_999L) return@Tool err("Up to 999 trillion is supported.")
            val words = numberOfWords(value)
            ToolResult(
                "In words",
                words.replaceFirstChar { it.uppercase(Locale.UK) },
                listOf("Digits" to raw.length.toString()),
                note = "British style without “and”. Add it by hand if your document expects “two thousand and five”.",
            )
        },
    ),
    Tool(
        slug = "words-to-number", title = "Words to Number", category = "education",
        tagline = "Spelled-out numbers back into digits.",
        keywords = listOf("words", "numbers", "parse"),
        fields = listOf(field("words", "Number in words", FieldKind.TEXT, default = "two thousand and five")),
        compute = { input ->
            val text = input.text("words")
            if (text.isEmpty()) return@Tool err("Type a number in words.")
            val value = wordsToNumber(text) ?: return@Tool err("I could not read that as a number.")
            ToolResult(
                "In digits",
                fmt(value),
                listOf("Read as" to numberOfWords(value)),
                note = "Handles hundreds, thousands, millions, billions and trillions, with or without “and”.",
            )
        },
    ),
    Tool(
        slug = "scientific-notation", title = "Scientific Notation", category = "education",
        tagline = "Ordinary numbers into a × 10^b, and back.",
        keywords = listOf("scientific notation", "standard form", "exponent"),
        fields = listOf(field("number", "Number (or 1.5e3)", FieldKind.TEXT, default = "0.00042")),
        compute = { input ->
            val raw = input.text("number").replace(",", "")
            val value = raw.toDoubleOrNull() ?: return@Tool err("Enter a number, or something like 1.5e3.")
            val (mantissa, exponent) = scientificForm(value)
            val engineering = scientificForm(value).let { (_, exp) ->
                val step = Math.floorDiv(exp, 3) * 3
                val mantissaE = value / 10.0.pow(step)
                mantissaE to step
            }
            ToolResult(
                "Scientific",
                "${fmt(mantissa, 4)} × 10^$exponent",
                listOf(
                    "Exponent" to exponent.toString(),
                    "Engineering" to "${fmt(engineering.first, 4)} × 10^${engineering.second}",
                    "Plain" to fmt(value, 10),
                    "Coefficient in range 1–10" to (abs(mantissa) >= 1 && abs(mantissa) < 10).toString(),
                ),
                note = "Scientific notation keeps one digit before the point; engineering notation steps in threes, which is why both are shown.",
            )
        },
    ),
    Tool(
        slug = "multiplication-table", title = "Multiplication Table", category = "education",
        tagline = "A clean times table for any number.",
        keywords = listOf("multiplication", "times table", "maths"),
        fields = listOf(
            field("number", "Number", FieldKind.NUMBER, default = "7"),
            field("upto", "Up to", FieldKind.NUMBER, default = "12"),
        ),
        compute = { input ->
            val number = input.num("number") ?: return@Tool err("Enter a number.")
            val upto = (input.num("upto") ?: 0.0).toInt()
            if (upto <= 0) return@Tool err("Count up to at least 1.")
            if (upto > 1000) return@Tool err("1,000 rows is the ceiling.")
            val table = (1..upto).joinToString("\n") { step -> "${fmt(number, 4)} × $step = ${fmt(number * step, 4)}" }
            ToolResult(
                "Table of ${fmt(number, 4)}",
                table,
                listOf("Rows" to upto.toString(), "Last" to fmt(number * upto, 4)),
                note = "Learn it in chunks of five, then test the fives backwards.",
            )
        },
    ),
    Tool(
        slug = "flashcard-generator", title = "Flashcard Generator", category = "education",
        tagline = "A term list into Anki-ready cards.",
        keywords = listOf("flashcards", "anki", "study"),
        fields = listOf(
            field("cards", "One card per line: term | definition", FieldKind.MULTILINE, default = "Osmosis | Water moving across a membrane\nMitosis | One cell splitting into two identical cells"),
            field("format", "Format", FieldKind.SELECT, default = "Tab", options = listOf("Tab", "Comma", "Markdown")),
        ),
        compute = { input ->
            val rows = input["cards"].orEmpty().lines().mapNotNull { line ->
                val parts = line.split('|', ':', '\t').map { it.trim() }.filter { it.isNotEmpty() }
                if (parts.size < 2) null else parts[0] to parts.drop(1).joinToString(" — ")
            }
            if (rows.isEmpty()) return@Tool err("Add lines like Term | Definition.")
            val body = when (input["format"]) {
                "Comma" -> rows.joinToString("\n") { (term, definition) ->
                    "\"" + term.replace("\"", "\"\"") + "\",\"" + definition.replace("\"", "\"\"") + "\""
                }
                "Markdown" -> rows.joinToString("\n\n") { (term, definition) -> "**$term**\n$definition" }
                else -> rows.joinToString("\n") { (term, definition) -> "$term\t$definition" }
            }
            ToolResult(
                "${rows.size} cards",
                body,
                listOf("Format" to (input["format"] ?: "Tab")),
                note = "Tab-separated text imports straight into Anki; keep one idea per card so reviews stay fast.",
            )
        },
    ),
    Tool(
        slug = "random-quiz", title = "Quiz Generator", category = "education",
        tagline = "A shuffled quiz from question and answer lines.",
        keywords = listOf("quiz", "test", "revision"),
        fields = listOf(
            field("facts", "One per line: question | answer", FieldKind.MULTILINE, default = "Capital of Nigeria | Abuja\nCapital of Kenya | Nairobi\nCapital of Ghana | Accra"),
            field("count", "Questions", FieldKind.NUMBER, default = "3"),
            field("seed", "Seed", FieldKind.NUMBER, default = "11"),
        ),
        compute = { input ->
            val rows = input["facts"].orEmpty().lines().mapNotNull { line ->
                val parts = line.split('|').map { it.trim() }.filter { it.isNotEmpty() }
                if (parts.size < 2) null else parts[0] to parts[1]
            }
            if (rows.isEmpty()) return@Tool err("Add lines like Question | Answer.")
            val count = (input.num("count") ?: 0.0).toInt()
            if (count <= 0) return@Tool err("Ask for at least one question.")
            val shuffled = rows.shuffled(kotlin.random.Random((input.num("seed") ?: 0.0).toLong()))
            val picked = shuffled.take(count.coerceAtMost(rows.size))
            val quiz = picked.mapIndexed { index, row -> "${index + 1}. ${row.first}" }.joinToString("\n")
            val answers = picked.mapIndexed { index, row -> "${index + 1}. ${row.second}" }.joinToString("\n")
            ToolResult(
                "${picked.size} questions",
                quiz,
                listOf("Answers" to answers.replace("\n", "  "), "From pool" to rows.size.toString()),
                note = "Same seed, same quiz. Change the seed for a fresh shuffle from the same facts.",
            )
        },
    ),
    Tool(
        slug = "bibliography", title = "Bibliography Entry", category = "education",
        tagline = "One reference in APA, MLA or Harvard.",
        keywords = listOf("bibliography", "reference", "apa"),
        fields = listOf(
            field("author", "Author", FieldKind.TEXT, default = "Obi, A."),
            field("title", "Title", FieldKind.TEXT, default = "Practical VAT for small businesses"),
            field("publisher", "Publisher", FieldKind.TEXT, default = "Marina Press"),
            field("year", "Year", FieldKind.NUMBER, default = "2024"),
            field("style", "Style", FieldKind.SELECT, default = "APA", options = listOf("APA", "MLA", "Harvard")),
        ),
        compute = { input ->
            val author = input.text("author").ifEmpty { "Author" }
            val title = input.text("title").ifEmpty { "Title" }
            val publisher = input.text("publisher").ifEmpty { "Publisher" }
            val year = (input.num("year") ?: 0.0).toInt().toString().ifEmpty { "n.d." }
            val entry = when (input["style"]) {
                "MLA" -> "$author. $title. $publisher, $year."
                "Harvard" -> "$author ($year) $title. $publisher."
                else -> "$author ($year). $title. $publisher."
            }
            ToolResult(
                input["style"] ?: "APA",
                entry,
                listOf("Author" to author, "Year" to year),
                note = "Check your school's handbook: editions differ on italics, place of publication and page numbers.",
            )
        },
    ),
    Tool(
        slug = "citation", title = "Website Citation", category = "education",
        tagline = "A web page cited properly, with the access date.",
        keywords = listOf("citation", "website", "reference"),
        fields = listOf(
            field("author", "Author or site", FieldKind.TEXT, default = "Toolz"),
            field("title", "Page title", FieldKind.TEXT, default = "Free VAT Calculator"),
            field("url", "URL", FieldKind.TEXT, default = "https://toolz.name.ng/tools/vat"),
            field("accessed", "Accessed (YYYY-MM-DD)", FieldKind.TEXT, default = "2026-11-03"),
            field("style", "Style", FieldKind.SELECT, default = "APA", options = listOf("APA", "MLA", "Harvard")),
        ),
        compute = { input ->
            val author = input.text("author").ifEmpty { "Author" }
            val title = input.text("title").ifEmpty { "Untitled page" }
            val url = input.text("url")
            val accessed = input.text("accessed")
            if (url.isEmpty()) return@Tool err("A URL is required for a web citation.")
            val entry = when (input["style"]) {
                "MLA" -> "$author. “$title.” Web. ${if (accessed.isEmpty()) "" else "$accessed, "}$url."
                "Harvard" -> "$author (${accessed.take(4)}) $title. Available at: $url (Accessed: $accessed)."
                else -> "$author. ($accessed). $title. Retrieved from $url"
            }
            ToolResult(
                input["style"] ?: "APA",
                entry,
                listOf("URL" to url, "Accessed" to accessed),
                note = "Cite the page you actually read, not the home page, and keep the access date accurate.",
            )
        },
    ),
)
