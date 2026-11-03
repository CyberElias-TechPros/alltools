package ng.name.toolz.data

import java.util.Locale

/**
 * Developer gaps: the formatters and minifiers that only existed on the web,
 * plus QR generation and a regex tester that runs on the JVM's own engine.
 */

private val VOID_TAGS = setOf("area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr")

private fun tagName(token: String): String =
    token.removePrefix("<").removePrefix("/").trimStart()
        .takeWhile { it.isLetterOrDigit() || it == ':' || it == '-' }
        .lowercase(Locale.UK)

private fun indentXml(markup: String, lowerCaseTags: Boolean): String {
    val tokens = Regex("(?s)<!--.*?-->|<[^>]*>|[^<]+").findAll(markup).map { it.value }.toList()
    val out = StringBuilder()
    var depth = 0
    tokens.forEach { raw ->
        val token = raw.trim()
        if (token.isEmpty()) return@forEach
        val isClose = token.startsWith("</")
        val isDeclaration = token.startsWith("<?") || token.startsWith("<!")
        val isVoid = lowerCaseTags && tagName(token) in VOID_TAGS
        val isSelfClosing = token.endsWith("/>")
        if (isClose) depth = (depth - 1).coerceAtLeast(0)
        out.append("  ".repeat(depth)).append(token).append('\n')
        val opens = token.startsWith("<") && !isClose && !isDeclaration && !isVoid && !isSelfClosing
        if (opens) depth++
    }
    return out.toString().trimEnd()
}

private fun minifyCss(source: String): String {
    var text = source.replace(Regex("(?s)/\\*.*?\\*/"), "")
    text = text.replace(Regex("\\s+"), " ")
    text = text.replace(Regex("\\s*([{};>])\\s*"), "$1")
    text = text.replace(Regex(";\\}"), "}")
    return text.trim()
}

private fun formatCss(source: String): String {
    val text = source.replace(Regex("(?s)/\\*.*?\\*/"), "")
    val out = StringBuilder()
    var depth = 0
    var quote: Char? = null
    var escaped = false
    for (c in text) {
        if (quote != null) {
            out.append(c)
            if (escaped) escaped = false
            else if (c == '\\') escaped = true
            else if (c == quote) quote = null
            continue
        }
        when (c) {
            '"', '\'' -> { quote = c; out.append(c) }
            '{' -> { depth++; out.append(" {\n").append("  ".repeat(depth)) }
            '}' -> {
                depth = (depth - 1).coerceAtLeast(0)
                out.append('\n').append("  ".repeat(depth)).append("}\n\n").append("  ".repeat(depth))
            }
            ';' -> out.append(";\n").append("  ".repeat(depth))
            '\n', '\r', '\t' -> Unit
            else -> out.append(c)
        }
    }
    return out.toString().lines().joinToString("\n") { it.trimEnd() }
        .replace(Regex("\n{3,}"), "\n\n")
        .trim()
}

private fun startsAComment(source: String, index: Int): Boolean {
    if (index == 0) return true
    val previous = source[index - 1]
    return previous.isWhitespace() || previous in ";(){}[]=,+-*/%&|!?:<>"
}

private fun stripJsComments(source: String): String {
    val out = StringBuilder()
    var quote: Char? = null
    var escaped = false
    var index = 0
    while (index < source.length) {
        val c = source[index]
        if (quote != null) {
            out.append(c)
            if (escaped) escaped = false
            else if (c == '\\') escaped = true
            else if (c == quote) quote = null
            index++
            continue
        }
        if (c == '"' || c == '\'' || c == '`') { quote = c; out.append(c); index++; continue }
        if (c == '/' && index + 1 < source.length && source[index + 1] == '/' && startsAComment(source, index)) {
            while (index < source.length && source[index] != '\n') index++
            continue
        }
        if (c == '/' && index + 1 < source.length && source[index + 1] == '*' && startsAComment(source, index)) {
            index += 2
            while (index + 1 < source.length && !(source[index] == '*' && source[index + 1] == '/')) index++
            index = (index + 2).coerceAtMost(source.length)
            continue
        }
        out.append(c)
        index++
    }
    return out.toString()
}

private fun formatJs(source: String): String {
    val text = stripJsComments(source)
    val out = StringBuilder()
    var depth = 0
    var quote: Char? = null
    var escaped = false
    var lastWasSpace = true
    for (c in text) {
        if (quote != null) {
            out.append(c)
            if (escaped) escaped = false
            else if (c == '\\') escaped = true
            else if (c == quote) quote = null
            continue
        }
        when (c) {
            '"', '\'', '`' -> { quote = c; out.append(c); lastWasSpace = false }
            '{', '[' -> {
                depth++
                out.append(c).append('\n').append("  ".repeat(depth))
                lastWasSpace = true
            }
            '}', ']' -> {
                depth = (depth - 1).coerceAtLeast(0)
                out.append('\n').append("  ".repeat(depth)).append(c)
                lastWasSpace = false
            }
            ';' -> {
                out.append(";\n").append("  ".repeat(depth))
                lastWasSpace = true
            }
            ' ', '\n', '\r', '\t' -> if (!lastWasSpace) { out.append(' '); lastWasSpace = true }
            else -> { out.append(c); lastWasSpace = false }
        }
    }
    return out.toString().lines().joinToString("\n") { it.trimEnd() }
        .replace(Regex("\n{3,}"), "\n\n")
        .trim()
}

/** Safe minify: comments and indentation out, line breaks kept so ASI still applies. */
private fun minifyJs(source: String): String =
    stripJsComments(source)
        .lines()
        .map { line ->
            val result = StringBuilder()
            var quote: Char? = null
            var escaped = false
            var lastWasSpace = false
            for (c in line) {
                if (quote != null) {
                    result.append(c)
                    if (escaped) escaped = false
                    else if (c == '\\') escaped = true
                    else if (c == quote) quote = null
                    continue
                }
                if (c == '"' || c == '\'' || c == '`') { quote = c; result.append(c); lastWasSpace = false; continue }
                if (c == ' ' || c == '\t') {
                    if (!lastWasSpace) { result.append(' '); lastWasSpace = true }
                    continue
                }
                result.append(c)
                lastWasSpace = false
            }
            result.toString().trim()
        }
        .filter { it.isNotEmpty() }
        .joinToString("\n")

internal val developerTools2 = listOf(
    Tool(
        slug = "box-shadow", title = "Box Shadow", category = "developer",
        tagline = "A box-shadow you can paste, with the values named.",
        keywords = listOf("box shadow", "css", "shadow"),
        fields = listOf(
            field("x", "Offset X (px)", FieldKind.NUMBER, default = "0"),
            field("y", "Offset Y (px)", FieldKind.NUMBER, default = "12"),
            field("blur", "Blur (px)", FieldKind.NUMBER, default = "24"),
            field("spread", "Spread (px)", FieldKind.NUMBER, default = "-6"),
            field("color", "Colour", FieldKind.TEXT, default = "rgba(21,22,26,0.25)"),
            field("inset", "Inset", FieldKind.TOGGLE, default = "false"),
        ),
        compute = { input ->
            val x = input.num("x") ?: return@Tool err("Enter the X offset.")
            val y = input.num("y") ?: return@Tool err("Enter the Y offset.")
            val blur = input.num("blur") ?: 0.0
            val spread = input.num("spread") ?: 0.0
            if (blur < 0) return@Tool err("Blur cannot be negative.")
            val colour = input.text("color")
            if (colour.isEmpty()) return@Tool err("Enter a colour.")
            val shadow = buildString {
                if (input.flag("inset")) append("inset ")
                append("${fmt(x, 0)}px ${fmt(y, 0)}px ${fmt(blur, 0)}px ${fmt(spread, 0)}px $colour")
            }
            ToolResult(
                "box-shadow",
                shadow,
                listOf("CSS" to "box-shadow: $shadow;"),
                note = "Large blur with a negative spread is the trick behind soft, realistic card shadows.",
            )
        },
    ),
    Tool(
        slug = "css-gradient", title = "CSS Gradient", category = "developer",
        tagline = "A linear or radial gradient string from your stops.",
        keywords = listOf("gradient", "css", "background"),
        fields = listOf(
            field("type", "Type", FieldKind.SELECT, default = "linear", options = listOf("linear", "radial")),
            field("angle", "Angle (deg)", FieldKind.NUMBER, default = "135"),
            field("stops", "Stops, comma separated", FieldKind.TEXT, default = "#d64e18, #f2c14e"),
        ),
        compute = { input ->
            val stops = input.text("stops").split(',').map { it.trim() }.filter { it.isNotEmpty() }
            if (stops.size < 2) return@Tool err("Two colour stops are the minimum.")
            val angle = input.num("angle") ?: 135.0
            val body = if (input["type"] == "radial") {
                "radial-gradient(circle, ${stops.joinToString(", ")})"
            } else {
                "linear-gradient(${fmt(angle, 0)}deg, ${stops.joinToString(", ")})"
            }
            ToolResult(
                "background",
                body,
                listOf("CSS" to "background: $body;", "Stops" to stops.size.toString()),
                note = "Both stops should carry enough contrast for text; check with a contrast tool before shipping.",
            )
        },
    ),
    Tool(
        slug = "css-formatter", title = "CSS Formatter", category = "developer",
        tagline = "Readable CSS from one long line.",
        keywords = listOf("css", "format", "beautify"),
        fields = listOf(field("css", "CSS", FieldKind.MULTILINE, default = "body{margin:0;color:#15161a}a{color:#d64e18;text-decoration:none}")),
        compute = { input ->
            val css = input["css"].orEmpty()
            if (css.isBlank()) return@Tool err("Paste some CSS first.")
            val pretty = formatCss(css)
            if (pretty.isBlank()) return@Tool err("That does not look like CSS.")
            ToolResult("Formatted CSS", pretty, listOf("Lines" to pretty.lines().size.toString()))
        },
    ),
    Tool(
        slug = "css-minifier", title = "CSS Minifier", category = "developer",
        tagline = "Comments and dead spaces removed, meaning kept.",
        keywords = listOf("css", "minify", "compress"),
        fields = listOf(field("css", "CSS", FieldKind.MULTILINE, default = "/* reset */\nbody {\n  margin: 0;\n  padding: 0;\n}\n\na { color: #d64e18; }")),
        compute = { input ->
            val css = input["css"].orEmpty()
            if (css.isBlank()) return@Tool err("Paste some CSS first.")
            val minified = minifyCss(css)
            val before = css.toByteArray(Charsets.UTF_8).size
            val after = minified.toByteArray(Charsets.UTF_8).size
            ToolResult(
                "${fmt(100.0 - after * 100.0 / before, 1)}% smaller",
                minified,
                listOf("Before" to "$before B", "After" to "$after B"),
                note = "Comments are dropped, so keep a readable copy in version control.",
            )
        },
    ),
    Tool(
        slug = "html-formatter", title = "HTML Formatter", category = "developer",
        tagline = "Nested, indented HTML from minified markup.",
        keywords = listOf("html", "format", "indent"),
        fields = listOf(field("html", "HTML", FieldKind.MULTILINE, default = "<section><h2>Tools</h2><p>Free, fast, private.</p></section>")),
        compute = { input ->
            val html = input["html"].orEmpty()
            if (html.isBlank()) return@Tool err("Paste some HTML first.")
            val pretty = indentXml(html, true)
            ToolResult("Formatted HTML", pretty, listOf("Lines" to pretty.lines().size.toString()))
        },
    ),
    Tool(
        slug = "html-minifier", title = "HTML Minifier", category = "developer",
        tagline = "Whitespace and comments out, layout intact.",
        keywords = listOf("html", "minify", "compress"),
        fields = listOf(field("html", "HTML", FieldKind.MULTILINE, default = "<section>\n  <!-- tools -->\n  <h2>Tools</h2>\n  <p>Free, fast, private.</p>\n</section>")),
        compute = { input ->
            val html = input["html"].orEmpty()
            if (html.isBlank()) return@Tool err("Paste some HTML first.")
            var minified = html.replace(Regex("(?s)<!--(?!\\[if).*?-->"), "")
            minified = minified.replace(Regex(">\\s+<"), "><")
            minified = minified.replace(Regex("\\s{2,}"), " ")
            minified = minified.trim()
            val before = html.toByteArray(Charsets.UTF_8).size
            val after = minified.toByteArray(Charsets.UTF_8).size
            ToolResult(
                "${fmt(100.0 - after * 100.0 / before, 1)}% smaller",
                minified,
                listOf("Before" to "$before B", "After" to "$after B"),
                note = "Whitespace inside <pre>, <textarea> and inline elements can be significant; check those before shipping.",
            )
        },
    ),
    Tool(
        slug = "javascript-formatter", title = "JavaScript Formatter", category = "developer",
        tagline = "Braces on their own lines, comments stripped or kept readable.",
        keywords = listOf("javascript", "format", "beautify"),
        fields = listOf(field("js", "JavaScript", FieldKind.MULTILINE, default = "function add(a,b){const total=a+b;return total}")),
        compute = { input ->
            val js = input["js"].orEmpty()
            if (js.isBlank()) return@Tool err("Paste some JavaScript first.")
            val pretty = formatJs(js)
            ToolResult("Formatted JavaScript", pretty, listOf("Lines" to pretty.lines().size.toString()), note = "Formatting removes comments; keep the original if you need them.")
        },
    ),
    Tool(
        slug = "javascript-minifier", title = "JavaScript Minifier", category = "developer",
        tagline = "Conservative whitespace compression that never changes behaviour.",
        keywords = listOf("javascript", "minify", "compress"),
        fields = listOf(field("js", "JavaScript", FieldKind.MULTILINE, default = "// add\nfunction add(a, b) {\n  const total = a + b;\n  return total;\n}")),
        compute = { input ->
            val js = input["js"].orEmpty()
            if (js.isBlank()) return@Tool err("Paste some JavaScript first.")
            val minified = minifyJs(js)
            val before = js.toByteArray(Charsets.UTF_8).size
            val after = minified.toByteArray(Charsets.UTF_8).size
            ToolResult(
                "${fmt(100.0 - after * 100.0 / before, 1)}% smaller",
                minified,
                listOf("Before" to "$before B", "After" to "$after B"),
                note = "Deliberately conservative: comments and indentation go, line breaks stay so automatic semicolon insertion still works.",
            )
        },
    ),
    Tool(
        slug = "json-to-csv", title = "JSON to CSV", category = "developer",
        tagline = "An array of objects becomes a proper CSV.",
        keywords = listOf("json", "csv", "spreadsheet"),
        fields = listOf(
            field("json", "JSON array of objects", FieldKind.MULTILINE, default = "[{\"name\":\"Ada\",\"role\":\"Founder\"},{\"name\":\"Bola\",\"role\":\"Editor\",\"city\":\"Lagos\"}]"),
            field("delimiter", "Delimiter", FieldKind.SELECT, default = ",", options = listOf(",", ";", "tab")),
        ),
        compute = { input ->
            val raw = input["json"].orEmpty()
            if (raw.isBlank()) return@Tool err("Paste a JSON array first.")
            val parsed = runCatching { Json.parse(raw) }.getOrElse { return@Tool err("That is not valid JSON.") }
            val rows = parsed as? List<*> ?: return@Tool err("Expected an array of objects.")
            if (rows.isEmpty()) return@Tool err("The array is empty.")
            if (rows.any { it !is Map<*, *> }) return@Tool err("Every element of the array must be an object.")
            val separator = when (input["delimiter"]) {
                ";" -> ";"
                "tab" -> "\t"
                else -> ","
            }
            val headers = rows.flatMap { (it as Map<*, *>).keys.map { key -> key.toString() } }.distinct()
            fun escape(value: String): String =
                if (value.contains(separator) || value.contains('"') || value.contains('\n')) {
                    "\"" + value.replace("\"", "\"\"") + "\""
                } else {
                    value
                }
            val csv = buildString {
                appendLine(headers.joinToString(separator) { escape(it) })
                rows.forEach { row ->
                    val map = row as Map<*, *>
                    appendLine(headers.joinToString(separator) { key -> escape(map[key]?.toString().orEmpty()) })
                }
            }.trimEnd()
            ToolResult(
                "${rows.size} rows",
                csv,
                listOf("Columns" to headers.size.toString(), "Separator" to if (separator == "\t") "tab" else separator),
            )
        },
    ),
    Tool(
        slug = "qr-code", title = "QR Code", category = "developer",
        tagline = "A scannable QR drawn from blocks, generated on device.",
        keywords = listOf("qr", "barcode", "share"),
        fields = listOf(field("text", "Text or URL", FieldKind.MULTILINE, default = "https://toolz.name.ng")),
        compute = { input ->
            val text = input["text"].orEmpty().trim()
            if (text.isEmpty()) return@Tool err("Type what the QR code should say.")
            if (text.length > 1200) return@Tool err("Keep it under about 1,200 characters so the code stays scannable.")
            val blocks = qrBlocks(text, 33) ?: return@Tool err("That text is too long for one QR code.")
            ToolResult(
                "QR code",
                blocks,
                listOf("Payload" to "${text.length} characters"),
                note = "Raise the screen brightness before scanning; QR codes need contrast, not size.",
            )
        },
    ),
    Tool(
        slug = "regex-tester", title = "Regex Tester", category = "developer",
        tagline = "Test a pattern and see every match and group.",
        keywords = listOf("regex", "regular expression", "match"),
        fields = listOf(
            field("pattern", "Pattern", FieldKind.TEXT, default = "(\\w+)@(\\w+\\.\\w+)"),
            field("flags", "Flags", FieldKind.SELECT, default = "none", options = listOf("none", "i", "m", "s", "im")),
            field("text", "Test text", FieldKind.MULTILINE, default = "Write to ada@toolz.name.ng or bola@example.com"),
        ),
        compute = { input ->
            val pattern = input.text("pattern")
            if (pattern.isEmpty()) return@Tool err("Enter a pattern.")
            val flags = input["flags"] ?: "none"
            var options = emptySet<RegexOption>()
            if (flags.contains('i')) options = options + RegexOption.IGNORE_CASE
            if (flags.contains('m')) options = options + RegexOption.MULTILINE
            if (flags.contains('s')) options = options + RegexOption.DOT_MATCHES_ALL
            val regex = runCatching { if (options.isEmpty()) Regex(pattern) else Regex(pattern, options) }
                .getOrElse { e -> return@Tool err(e.message ?: "That pattern is not valid.") }
            val text = input["text"].orEmpty()
            val matches = regex.findAll(text).take(50).toList()
            if (matches.isEmpty()) return@Tool ToolResult("No matches", "Nothing in the text matched.", listOf("Pattern" to pattern))
            val report = matches.mapIndexed { index, match ->
                val groups = match.groupValues.drop(1)
                val groupText = if (groups.isEmpty()) "" else " → " + groups.joinToString(" | ")
                "${index + 1}. “${match.value}” at ${match.range.first}$groupText"
            }.joinToString("\n")
            ToolResult(
                "${matches.size} match${if (matches.size == 1) "" else "es"}",
                report,
                listOf("Pattern" to pattern, "Flags" to flags, "Group count" to (matches.first().groupValues.size - 1).toString()),
                note = "Kotlin runs the Java engine, so lookbehind and named groups work; JavaScript-only syntax may not.",
            )
        },
    ),
    Tool(
        slug = "xml-formatter", title = "XML Formatter", category = "developer",
        tagline = "Indented XML with the declaration left alone.",
        keywords = listOf("xml", "format", "indent"),
        fields = listOf(field("xml", "XML", FieldKind.MULTILINE, default = "<?xml version=\"1.0\"?><catalog><item id=\"1\"><name>Widget</name></item></catalog>")),
        compute = { input ->
            val xml = input["xml"].orEmpty()
            if (xml.isBlank()) return@Tool err("Paste some XML first.")
            val pretty = indentXml(xml, false)
            ToolResult("Formatted XML", pretty, listOf("Lines" to pretty.lines().size.toString()))
        },
    ),
    Tool(
        slug = "xml-validator", title = "XML Validator", category = "developer",
        tagline = "Well-formedness check with the line of the first problem.",
        keywords = listOf("xml", "validate", "well-formed"),
        fields = listOf(field("xml", "XML", FieldKind.MULTILINE, default = "<?xml version=\"1.0\"?><catalog><item id=\"1\"><name>Widget</name></item></catalog>")),
        compute = { input ->
            val xml = input["xml"].orEmpty()
            if (xml.isBlank()) return@Tool err("Paste some XML first.")
            val problem: String? = runCatching {
                val factory = javax.xml.parsers.DocumentBuilderFactory.newInstance()
                runCatching { factory.setFeature("http://apache.org/xml/features/nonvalidating/load-external-dtd", false) }
                runCatching { factory.setFeature("http://xml.org/sax/features/external-general-entities", false) }
                runCatching { factory.setFeature("http://xml.org/sax/features/external-parameter-entities", false) }
                factory.isXIncludeAware = false
                factory.isExpandEntityReferences = false
                val builder = factory.newDocumentBuilder()
                builder.setErrorHandler(null)
                builder.parse(xml.byteInputStream(Charsets.UTF_8))
                null
            }.getOrElse { e -> e.message ?: e.javaClass.simpleName }
            if (problem == null) {
                ToolResult(
                    "Well-formed",
                    "The parser accepted this document.",
                    listOf("Size" to "${xml.toByteArray(Charsets.UTF_8).size} B"),
                    note = "Well-formed is not the same as valid: schema and DTD rules are not checked here.",
                )
            } else {
                ToolResult(
                    "Not well-formed",
                    problem.lineSequence().first().take(300),
                    listOf("Parser" to "javax.xml"),
                    note = "Common causes: an unclosed tag, an unescaped & or <, or two root elements.",
                )
            }
        },
    ),
)
