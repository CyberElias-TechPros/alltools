package ng.name.toolz.data

/**
 * A small Markdown <-> HTML converter.
 *
 * Supports the syntax people actually use in notes and READMEs: headings,
 * paragraphs, bold, italic, strikethrough, inline code, fenced code, links,
 * images, blockquotes, lists and rules. No tables, no footnotes — the tools say
 * so rather than mangling them silently.
 */

private fun escapeHtml(text: String): String = text
    .replace("&", "&amp;")
    .replace("<", "&lt;")
    .replace(">", "&gt;")

internal fun markdownInline(text: String): String {
    var s = text
    s = Regex("`([^`]+)`").replace(s) { "<code>" + escapeHtml(it.groupValues[1]) + "</code>" }
    s = Regex("!\\[([^\\]]*)\\]\\(([^)\\s]+)\\)").replace(s) {
        "<img src=\"" + it.groupValues[2] + "\" alt=\"" + it.groupValues[1] + "\">"
    }
    s = Regex("\\[([^\\]]+)\\]\\(([^)\\s]+)\\)").replace(s) {
        "<a href=\"" + it.groupValues[2] + "\">" + it.groupValues[1] + "</a>"
    }
    s = Regex("\\*\\*([^*]+)\\*\\*").replace(s) { "<strong>" + it.groupValues[1] + "</strong>" }
    s = Regex("__([^_]+)__").replace(s) { "<strong>" + it.groupValues[1] + "</strong>" }
    s = Regex("~~([^~]+)~~").replace(s) { "<del>" + it.groupValues[1] + "</del>" }
    s = Regex("\\*([^*]+)\\*").replace(s) { "<em>" + it.groupValues[1] + "</em>" }
    return s
}

internal fun markdownToHtml(source: String): String {
    val lines = source.replace("\r\n", "\n").split("\n")
    val out = StringBuilder()
    var inCode = false
    var listType: String? = null
    var inParagraph = false

    fun closeParagraph() {
        if (inParagraph) {
            out.append("</p>\n")
            inParagraph = false
        }
    }
    fun closeList() {
        val open = listType
        if (open != null) {
            out.append("</").append(open).append(">").append('\n')
            listType = null
        }
    }

    for (line in lines) {
        val trimmed = line.trim()
        if (trimmed.startsWith("```")) {
            closeParagraph(); closeList()
            if (inCode) {
                out.append("</code></pre>\n")
                inCode = false
            } else {
                out.append("<pre><code>")
                inCode = true
            }
            continue
        }
        if (inCode) {
            out.append(escapeHtml(line)).append('\n')
            continue
        }
        when {
            trimmed.isEmpty() -> { closeParagraph(); closeList() }
            trimmed.startsWith("#") -> {
                closeParagraph(); closeList()
                val level = trimmed.takeWhile { it == '#' }.length.coerceIn(1, 6)
                out.append("<h$level>").append(markdownInline(trimmed.drop(level).trim())).append("</h$level>\n")
            }
            trimmed.matches(Regex("^(-{3,}|\\*{3,}|_{3,})$")) -> {
                closeParagraph(); closeList(); out.append("<hr>\n")
            }
            trimmed.startsWith(">") -> {
                closeParagraph(); closeList()
                out.append("<blockquote>").append(markdownInline(trimmed.drop(1).trim())).append("</blockquote>\n")
            }
            trimmed.startsWith("- ") || trimmed.startsWith("* ") || trimmed.startsWith("+ ") -> {
                closeParagraph()
                if (listType != "ul") { closeList(); out.append("<ul>\n"); listType = "ul" }
                out.append("<li>").append(markdownInline(trimmed.drop(2))).append("</li>\n")
            }
            Regex("^\\d+[.)] ").containsMatchIn(trimmed) -> {
                closeParagraph()
                if (listType != "ol") { closeList(); out.append("<ol>\n"); listType = "ol" }
                out.append("<li>").append(markdownInline(trimmed.substringAfter(' '))).append("</li>\n")
            }
            else -> {
                closeList()
                if (!inParagraph) { out.append("<p>"); inParagraph = true } else out.append(' ')
                out.append(markdownInline(trimmed))
            }
        }
    }
    if (inCode) out.append("</code></pre>\n")
    closeParagraph(); closeList()
    return out.toString().trimEnd()
}

private fun stripTags(source: String): String = source.replace(Regex("(?s)<[^>]+>"), "")

private fun decodeEntities(source: String): String = source
    .replace("&nbsp;", " ")
    .replace("&amp;", "&")
    .replace("&lt;", "<")
    .replace("&gt;", ">")
    .replace("&quot;", "\"")
    .replace("&#39;", "'")

internal fun htmlToMarkdown(source: String): String {
    var text = source
    text = Regex("(?is)<(script|style)[^>]*>.*?</\\1>").replace(text, "")
    text = Regex("(?is)<h([1-6])[^>]*>(.*?)</h\\1>").replace(text) {
        "\n\n" + "#".repeat(it.groupValues[1].toInt()) + " " + stripTags(it.groupValues[2]).trim() + "\n\n"
    }
    text = Regex("(?is)<li[^>]*>(.*?)</li>").replace(text) { "- " + stripTags(it.groupValues[1]).trim() + "\n" }
    text = Regex("(?is)<a\\b[^>]*href\\s*=\\s*\"([^\"]*)\"[^>]*>(.*?)</a>").replace(text) {
        "[" + stripTags(it.groupValues[2]).trim() + "](" + it.groupValues[1] + ")"
    }
    text = Regex("(?is)<img\\b[^>]*>").replace(text) { tag ->
        val src = Regex("(?i)src\\s*=\\s*\"([^\"]*)\"").find(tag.value)?.groupValues?.get(1).orEmpty()
        val alt = Regex("(?i)alt\\s*=\\s*\"([^\"]*)\"").find(tag.value)?.groupValues?.get(1).orEmpty()
        if (src.isEmpty()) "" else "![$alt]($src)"
    }
    text = Regex("(?is)<(strong|b)\\b[^>]*>(.*?)</\\1>").replace(text) { "**" + stripTags(it.groupValues[2]).trim() + "**" }
    text = Regex("(?is)<(em|i)\\b[^>]*>(.*?)</\\1>").replace(text) { "*" + stripTags(it.groupValues[2]).trim() + "*" }
    text = Regex("(?is)<code\\b[^>]*>(.*?)</code>").replace(text) { "`" + stripTags(it.groupValues[1]).trim() + "`" }
    text = Regex("(?is)<br\\s*/?>").replace(text, "  \n")
    text = Regex("(?is)<hr\\s*/?>").replace(text, "\n\n---\n\n")
    text = Regex("(?is)</(p|div|section|article)>").replace(text, "\n\n")
    text = stripTags(text)
    text = decodeEntities(text)
    text = text.lines().joinToString("\n") { it.trimEnd() }
    return text.replace(Regex("\n{3,}"), "\n\n").trim()
}
