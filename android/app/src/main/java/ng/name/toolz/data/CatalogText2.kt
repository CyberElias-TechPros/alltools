package ng.name.toolz.data

import java.util.Locale

/**
 * Text gaps: Markdown both ways, a deterministic placeholder generator and the
 * slug-to-title helper.
 */

private fun randomSentence(random: java.util.Random, bank: List<String>, length: Int): String {
    val picked = (0 until length).map { bank[random.nextInt(bank.size)] }
    return picked.joinToString(" ").replaceFirstChar { it.uppercase(Locale.UK) } + "."
}

internal val textTools2 = listOf(
    Tool(
        slug = "markdown-to-html", title = "Markdown to HTML", category = "text",
        tagline = "Notes and READMEs into clean HTML.",
        keywords = listOf("markdown", "html", "convert"),
        fields = listOf(
            field(
                "markdown", "Markdown", FieldKind.MULTILINE,
                default = "# Weekly note\n\nShip **three** things, not ~~ten~~.\n\n- Check the *build*\n- Read `logs.txt`\n\n[Docs](https://toolz.name.ng)",
            ),
        ),
        compute = { input ->
            val markdown = input["markdown"].orEmpty()
            if (markdown.isBlank()) return@Tool err("Paste some Markdown first.")
            val html = markdownToHtml(markdown)
            if (html.isBlank()) return@Tool err("Nothing in that text looked like Markdown.")
            ToolResult(
                "HTML",
                html,
                listOf("Characters" to html.length.toString()),
                note = "Headings, bold, italic, strikethrough, code, links, images, quotes, lists and rules are supported; tables and footnotes are not.",
            )
        },
    ),
    Tool(
        slug = "markdown-preview", title = "Markdown Preview", category = "text",
        tagline = "See the rendered shape and the element count.",
        keywords = listOf("markdown", "preview", "render"),
        fields = listOf(
            field("markdown", "Markdown", FieldKind.MULTILINE, default = "## Plan\n\n1. Draft\n2. Review\n3. Ship"),
        ),
        compute = { input ->
            val markdown = input["markdown"].orEmpty()
            if (markdown.isBlank()) return@Tool err("Paste some Markdown first.")
            val html = markdownToHtml(markdown)
            val headings = Regex("<h[1-6]>").findAll(html).count()
            val listItems = Regex("<li>").findAll(html).count()
            val links = Regex("<a ").findAll(html).count()
            ToolResult(
                "Rendered",
                html,
                listOf(
                    "Headings" to headings.toString(),
                    "List items" to listItems.toString(),
                    "Links" to links.toString(),
                    "Words" to wordsOf(markdown).size.toString(),
                ),
                note = "This is the HTML the Markdown turns into, not a styled page: styling belongs to your site.",
            )
        },
    ),
    Tool(
        slug = "html-to-markdown", title = "HTML to Markdown", category = "text",
        tagline = "Strip a page down to portable Markdown.",
        keywords = listOf("html", "markdown", "convert"),
        fields = listOf(
            field(
                "html", "HTML", FieldKind.MULTILINE,
                default = "<h2>Plan</h2><p>Ship <strong>three</strong> things.</p><ul><li>Draft</li><li>Review</li></ul><p><a href=\"https://toolz.name.ng\">Docs</a></p>",
            ),
        ),
        compute = { input ->
            val html = input["html"].orEmpty()
            if (html.isBlank()) return@Tool err("Paste some HTML first.")
            val markdown = htmlToMarkdown(html)
            if (markdown.isBlank()) return@Tool err("No readable text in that HTML.")
            ToolResult(
                "Markdown",
                markdown,
                listOf("Lines" to markdown.lines().size.toString()),
                note = "Script and style blocks are dropped; classes and inline styling disappear.",
            )
        },
    ),
    Tool(
        slug = "random-text", title = "Random Text", category = "text",
        tagline = "Placeholder words, sentences or paragraphs.",
        keywords = listOf("lorem ipsum", "placeholder", "dummy text"),
        fields = listOf(
            field("mode", "Mode", FieldKind.SELECT, default = "Paragraphs", options = listOf("Words", "Sentences", "Paragraphs")),
            field("count", "How many", FieldKind.NUMBER, default = "2"),
            field("seed", "Seed (same seed, same text)", FieldKind.NUMBER, default = "7"),
        ),
        compute = { input ->
            val count = (input.num("count") ?: 0.0).toInt()
            if (count <= 0) return@Tool err("Ask for at least one.")
            if (count > 500) return@Tool err("500 is the ceiling here.")
            val bank = LOREM.split(" ")
            val random = java.util.Random((input.num("seed") ?: 0.0).toLong())
            val output = when (input["mode"]) {
                "Words" -> (0 until count).map { bank[random.nextInt(bank.size)] }.joinToString(" ")
                "Sentences" -> (0 until count).joinToString(" ") { randomSentence(random, bank, 8 + random.nextInt(6)) }
                else -> (0 until count).joinToString("\n\n") {
                    (0 until 3 + random.nextInt(3)).joinToString(" ") { _ -> randomSentence(random, bank, 8 + random.nextInt(6)) }
                }
            }
            ToolResult(
                input["mode"] ?: "Paragraphs",
                output,
                listOf("Words" to wordsOf(output).size.toString(), "Seed" to fmt(input.num("seed") ?: 0.0, 0)),
                note = "Generated on your phone from the classic lorem word list; the seed makes it repeatable.",
            )
        },
    ),
    Tool(
        slug = "slug-to-text", title = "Slug to Text", category = "text",
        tagline = "my-page-name back into My Page Name.",
        keywords = listOf("slug", "title case", "url"),
        fields = listOf(
            field("slug", "Slug", FieldKind.TEXT, default = "how-to-check-a-vat-number"),
            field("style", "Style", FieldKind.SELECT, default = "Title case", options = listOf("Title case", "Sentence case", "lower case")),
        ),
        compute = { input ->
            val slug = input.text("slug")
            if (slug.isEmpty()) return@Tool err("Paste a slug first.")
            val words = slug.replace(Regex("[-_/+]+"), " ")
                .replace(Regex("(?i)%20"), " ")
                .split(Regex("\\s+"))
                .filter { it.isNotEmpty() }
                .map { word -> word.filter { it.isLetterOrDigit() } }
                .filter { it.isNotEmpty() }
            if (words.isEmpty()) return@Tool err("No words in that slug.")
            val text = when (input["style"]) {
                "Sentence case" -> words.joinToString(" ").lowercase(Locale.UK).replaceFirstChar { it.uppercase(Locale.UK) }
                "lower case" -> words.joinToString(" ").lowercase(Locale.UK)
                else -> words.joinToString(" ") { it.lowercase(Locale.UK).replaceFirstChar { c -> c.uppercase(Locale.UK) } }
            }
            ToolResult(
                input["style"] ?: "Title case",
                text,
                listOf("Words" to words.size.toString()),
                note = "Small words like “a” and “of” are capitalised too; adjust by hand if your style guide says otherwise.",
            )
        },
    ),
)
