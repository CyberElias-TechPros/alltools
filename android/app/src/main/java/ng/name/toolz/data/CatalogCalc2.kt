package ng.name.toolz.data

/**
 * The calculator gaps: a real expression evaluator, fractions, matrices,
 * probability, ratios and exact square roots.
 */

private fun gcdOf(a: Long, b: Long): Long {
    var x = kotlin.math.abs(a)
    var y = kotlin.math.abs(b)
    while (y != 0L) {
        val t = y
        y = x % y
        x = t
    }
    return if (x == 0L) 1L else x
}

internal val calculatorTools2 = listOf(
    Tool(
        slug = "basic-calculator", title = "Calculator", category = "calculators",
        tagline = "An expression calculator with brackets and precedence.",
        keywords = listOf("calculator", "arithmetic", "expression"),
        fields = listOf(
            field("expression", "Expression", FieldKind.TEXT, default = "12*(8+4)/3"),
        ),
        compute = { input ->
            val source = input.text("expression")
            if (source.isEmpty()) return@Tool err("Type an expression like 12*(8+4)/3.")
            val value = runCatching { evaluateExpression(source) }.getOrElse { e ->
                return@Tool err(e.message ?: "That expression could not be read.")
            }
            ToolResult(
                "Answer",
                fmt(value, 6),
                listOf("Rounded" to fmt(value, 2), "Expression" to source),
                note = "Use + − × ÷ as + - * /, brackets, and ^ for powers (2^10).",
            )
        },
    ),
    Tool(
        slug = "scientific-calculator", title = "Scientific Calculator", category = "calculators",
        tagline = "Trig, logs, powers and factorials in one line.",
        keywords = listOf("scientific", "trigonometry", "logarithm"),
        fields = listOf(
            field("expression", "Expression", FieldKind.TEXT, default = "sin(30)+sqrt(144)"),
            field("angle", "Angles", FieldKind.SELECT, default = "Degrees", options = listOf("Degrees", "Radians")),
        ),
        compute = { input ->
            val source = input.text("expression")
            if (source.isEmpty()) return@Tool err("Type an expression, for example sin(30)+sqrt(144).")
            val degrees = input["angle"] != "Radians"
            val value = runCatching { evaluateExpression(source, degrees) }.getOrElse { e ->
                return@Tool err(e.message ?: "That expression could not be read.")
            }
            ToolResult(
                "Answer",
                fmt(value, 6),
                listOf(
                    "Angle mode" to (if (degrees) "Degrees" else "Radians"),
                    "Exact-ish" to fmt(value, 10),
                ),
                note = "Functions: sin cos tan asin acos atan sqrt cbrt ln log abs exp round floor ceil fact. Constants: pi, e, tau.",
            )
        },
    ),
    Tool(
        slug = "square-root", title = "Square Root", category = "calculators",
        tagline = "Exact simplified radical plus the decimal.",
        keywords = listOf("square root", "radical", "surds"),
        fields = listOf(field("number", "Number", FieldKind.DECIMAL, default = "72")),
        compute = { input ->
            val value = input.num("number") ?: return@Tool err("Enter a number.")
            if (value < 0) return@Tool err("Real square roots need a number of 0 or more.")
            val decimal = Math.sqrt(value)
            val whole = value == Math.floor(value) && value <= 1_000_000.0
            var simplified = "≈ ${fmt(decimal, 6)}"
            if (whole) {
                var outside = 1L
                var inside = value.toLong()
                var factor = 2L
                while (factor * factor <= inside) {
                    while (inside % (factor * factor) == 0L) {
                        inside /= factor * factor
                        outside *= factor
                    }
                    factor++
                }
                simplified = when {
                    inside == 1L -> "$outside"
                    outside == 1L -> "√$inside"
                    else -> "$outside√$inside"
                }
            }
            ToolResult(
                "√${fmt(value, 6)}",
                fmt(decimal, 6),
                listOf(
                    "Simplified" to simplified,
                    "Squared back" to fmt(decimal * decimal, 6),
                ),
                note = "The surd form is exact; the decimal is rounded to six places.",
            )
        },
    ),
    Tool(
        slug = "fraction", title = "Fraction Calculator", category = "calculators",
        tagline = "Add, subtract, multiply and divide fractions, simplified.",
        keywords = listOf("fraction", "numerator", "denominator"),
        fields = listOf(
            field("a", "Top of the first fraction", FieldKind.NUMBER, default = "3"),
            field("b", "Bottom of the first fraction", FieldKind.NUMBER, default = "4"),
            field("op", "Operation", FieldKind.SELECT, default = "+", options = listOf("+", "−", "×", "÷")),
            field("c", "Top of the second fraction", FieldKind.NUMBER, default = "5"),
            field("d", "Bottom of the second fraction", FieldKind.NUMBER, default = "6"),
        ),
        compute = { input ->
            val a = (input.num("a") ?: return@Tool err("Enter the first numerator.")).toLong()
            val b = (input.num("b") ?: return@Tool err("Enter the first denominator.")).toLong()
            val c = (input.num("c") ?: return@Tool err("Enter the second numerator.")).toLong()
            val d = (input.num("d") ?: return@Tool err("Enter the second denominator.")).toLong()
            if (b == 0L || d == 0L) return@Tool err("A denominator cannot be zero.")
            val top: Long
            val bottom: Long
            when (input["op"]) {
                "−" -> { top = a * d - c * b; bottom = b * d }
                "×" -> { top = a * c; bottom = b * d }
                "÷" -> {
                    if (c == 0L) return@Tool err("Cannot divide by zero.")
                    top = a * d; bottom = b * c
                }
                else -> { top = a * d + c * b; bottom = b * d }
            }
            val divisor = gcdOf(top, bottom)
            var simpleTop = top / divisor
            var simpleBottom = bottom / divisor
            if (simpleBottom < 0) { simpleTop = -simpleTop; simpleBottom = -simpleBottom }
            val decimal = simpleTop.toDouble() / simpleBottom
            val mixed = if (kotlin.math.abs(simpleTop) > simpleBottom) {
                val whole = simpleTop / simpleBottom
                val rest = kotlin.math.abs(simpleTop % simpleBottom)
                if (rest == 0L) "$whole" else "$whole ${rest}/${simpleBottom}"
            } else {
                null
            }
            ToolResult(
                "Fraction",
                if (simpleBottom == 1L) "$simpleTop" else "$simpleTop/$simpleBottom",
                listOf(
                    "Decimal" to fmt(decimal, 6),
                    "Mixed" to (mixed ?: "proper fraction"),
                    "Working" to "$a/$b ${input["op"] ?: "+"} $c/$d",
                ),
            )
        },
    ),
    Tool(
        slug = "matrix", title = "Matrix Calculator", category = "calculators",
        tagline = "Determinant, inverse and transpose of a small matrix.",
        keywords = listOf("matrix", "determinant", "inverse"),
        fields = listOf(
            field("matrix", "Matrix (rows on separate lines)", FieldKind.MULTILINE, default = "2 1\n1 3"),
            field("op", "Operation", FieldKind.SELECT, default = "Determinant", options = listOf("Determinant", "Inverse", "Transpose")),
        ),
        compute = { input ->
            val rows = input["matrix"].orEmpty().lines()
                .map { it.trim() }
                .filter { it.isNotEmpty() }
                .map { line -> line.split(Regex("[\\s,]+")).filter { it.isNotEmpty() }.mapNotNull { it.toDoubleOrNull() } }
            if (rows.isEmpty()) return@Tool err("Enter a matrix, one row per line.")
            val columns = rows.first().size
            if (columns == 0 || rows.any { it.size != columns }) return@Tool err("Every row needs the same number of values.")
            val square = rows.size == columns
            fun render(matrix: List<List<Double>>) = matrix.joinToString("\n") { row -> row.joinToString("  ") { fmt(it, 4) } }
            when (input["op"]) {
                "Transpose" -> {
                    val flipped = (0 until columns).map { column -> rows.map { row -> row[column] } }
                    return@Tool ToolResult("Transpose", render(flipped), listOf("Size" to "${rows.size}×$columns"))
                }
                "Inverse" -> {
                    if (!square) return@Tool err("Only a square matrix has an inverse.")
                    if (rows.size == 2) {
                        val determinant = rows[0][0] * rows[1][1] - rows[0][1] * rows[1][0]
                        if (determinant == 0.0) return@Tool err("The determinant is zero, so there is no inverse.")
                        val inverse = listOf(
                            listOf(rows[1][1] / determinant, -rows[0][1] / determinant),
                            listOf(-rows[1][0] / determinant, rows[0][0] / determinant),
                        )
                        return@Tool ToolResult("Inverse", render(inverse), listOf("Determinant" to fmt(determinant, 6)))
                    }
                    return@Tool err("This tool inverts 2×2 matrices; larger ones need a fuller solver.")
                }
                else -> {
                    if (!square) return@Tool err("Only a square matrix has a determinant.")
                    val determinant: Double? = when (rows.size) {
                        1 -> rows[0][0]
                        2 -> rows[0][0] * rows[1][1] - rows[0][1] * rows[1][0]
                        3 -> rows[0][0] * (rows[1][1] * rows[2][2] - rows[1][2] * rows[2][1]) -
                            rows[0][1] * (rows[1][0] * rows[2][2] - rows[1][2] * rows[2][0]) +
                            rows[0][2] * (rows[1][0] * rows[2][1] - rows[1][1] * rows[2][0])
                        else -> null
                    }
                    if (determinant == null) return@Tool err("Determinants here cover matrices up to 3×3.")
                    return@Tool ToolResult("Determinant", fmt(determinant, 6), listOf("Size" to "${rows.size}×$columns"))
                }
            }
        },
    ),
    Tool(
        slug = "probability", title = "Probability", category = "calculators",
        tagline = "Two independent events, plus combinations and permutations.",
        keywords = listOf("probability", "odds", "combinations"),
        fields = listOf(
            field("pa", "P(A) as a percentage", FieldKind.DECIMAL, default = "30"),
            field("pb", "P(B) as a percentage", FieldKind.DECIMAL, default = "40"),
            field("n", "Combinations: n", FieldKind.NUMBER, default = "5"),
            field("k", "Combinations: k", FieldKind.NUMBER, default = "2"),
        ),
        compute = { input ->
            val pa = (input.num("pa") ?: return@Tool err("Enter P(A).")) / 100.0
            val pb = (input.num("pb") ?: return@Tool err("Enter P(B).")) / 100.0
            if (pa !in 0.0..1.0 || pb !in 0.0..1.0) return@Tool err("Probabilities run from 0 to 100%.")
            val n = (input.num("n") ?: 0.0).toInt()
            val k = (input.num("k") ?: 0.0).toInt()
            fun factorial(x: Int): Double { var r = 1.0; for (i in 2..x) r *= i; return r }
            val combinations = if (n >= 0 && k in 0..n && n <= 170) factorial(n) / (factorial(k) * factorial(n - k)) else null
            val permutations = if (n >= 0 && k in 0..n && n <= 170) factorial(n) / factorial(n - k) else null
            ToolResult(
                "At least one",
                pct((1 - (1 - pa) * (1 - pb)) * 100, 2),
                listOf(
                    "Both" to pct(pa * pb * 100, 2),
                    "Exactly one" to pct((pa * (1 - pb) + pb * (1 - pa)) * 100, 2),
                    "Neither" to pct((1 - pa) * (1 - pb) * 100, 2),
                    "C($n,$k)" to (combinations?.let { fmt(it, 0) } ?: "k must be between 0 and n"),
                    "P($n,$k)" to (permutations?.let { fmt(it, 0) } ?: "k must be between 0 and n"),
                ),
                note = "A and B are treated as independent: one happening does not change the other.",
            )
        },
    ),
    Tool(
        slug = "ratio", title = "Ratio Calculator", category = "calculators",
        tagline = "Simplify a ratio or scale it to a total.",
        keywords = listOf("ratio", "proportion", "scale"),
        fields = listOf(
            field("ratio", "Ratio", FieldKind.TEXT, default = "16:9"),
            field("mode", "Mode", FieldKind.SELECT, default = "Simplify", options = listOf("Simplify", "Scale to total")),
            field("total", "Total (for scaling)", FieldKind.DECIMAL, default = "100"),
        ),
        compute = { input ->
            val parts = input.text("ratio").split(':', '/').mapNotNull { it.trim().toDoubleOrNull() }
            if (parts.size != 2) return@Tool err("Write a ratio like 16:9.")
            val (left, right) = parts
            if (left < 0 || right < 0) return@Tool err("Ratios use non-negative numbers.")
            val scaledLeft = Math.round(left * 1000).toLong()
            val scaledRight = Math.round(right * 1000).toLong()
            val divisor = gcdOf(scaledLeft, scaledRight)
            val simpleLeft = scaledLeft / divisor
            val simpleRight = scaledRight / divisor
            if (input["mode"] == "Scale to total") {
                val total = input.num("total") ?: return@Tool err("Enter the total to scale to.")
                if (left + right == 0.0) return@Tool err("A ratio of 0:0 has no parts.")
                val first = total * left / (left + right)
                ToolResult(
                    "$simpleLeft:$simpleRight",
                    "${fmt(first, 2)} and ${fmt(total - first, 2)}",
                    listOf("Total" to fmt(total), "Parts" to fmt(left + right)),
                )
            } else {
                val decimal = if (right == 0.0) null else left / right
                ToolResult(
                    "Simplified",
                    "$simpleLeft:$simpleRight",
                    listOf(
                        "As a fraction" to (if (right == 0.0) "undefined" else "${fmt(left)}/${fmt(right)}"),
                        "Left ÷ right" to (decimal?.let { fmt(it, 4) } ?: "undefined"),
                        "One part" to (if (left + right == 0.0) "—" else fmt(100.0 * left / (left + right), 2) + "% on the left"),
                    ),
                )
            }
        },
    ),
)
