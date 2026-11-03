package ng.name.toolz.data

import java.io.ByteArrayOutputStream
import java.util.Locale
import java.util.zip.GZIPOutputStream

/**
 * The eighteen SEO tools that were website-only. Everything is computed from
 * text the user pastes: nothing here crawls, fetches or phones home, which is
 * why the diagnostics say "this checks the markup you pasted" rather than
 * pretending to audit a live site.
 */

private val H_TAG = Regex("(?is)<h([1-6])[^>]*>(.*?)</h\\1>")
private val IMG_TAG = Regex("(?is)<img\\b[^>]*>")
private val HREF = Regex("(?i)href\\s*=\\s*[\"']([^\"']+)[\"']")
private val LOC_TAG = Regex("(?is)<loc>(.*?)</loc>")

private fun gzipped(text: String): Int {
    val out = ByteArrayOutputStream()
    GZIPOutputStream(out).use { it.write(text.toByteArray(Charsets.UTF_8)) }
    return out.size()
}

internal val seoTools2 = listOf(
    Tool(
        slug = "breadcrumb-schema", title = "Breadcrumb Schema", category = "seo",
        tagline = "JSON-LD BreadcrumbList from your trail.",
        keywords = listOf("breadcrumb", "schema", "json-ld"),
        fields = listOf(
            field(
                "items", "One per line: Name, URL", FieldKind.MULTILINE,
                default = "Home, https://toolz.name.ng/\nTools, https://toolz.name.ng/tools",
            ),
        ),
        compute = { input ->
            val rows = input["items"].orEmpty().lines().mapNotNull { line ->
                val parts = line.split(",").map { it.trim() }.filter { it.isNotEmpty() }
                if (parts.size < 2) null else parts.first() to parts.drop(1).joinToString(",")
            }
            if (rows.isEmpty()) return@Tool err("Add a line like Home, https://toolz.name.ng/")
            val items = rows.mapIndexed { index, row ->
                mapOf<String, Any?>(
                    "@type" to "ListItem",
                    "position" to index + 1,
                    "name" to row.first,
                    "item" to row.second,
                )
            }
            val document = mapOf<String, Any?>(
                "@context" to "https://schema.org",
                "@type" to "BreadcrumbList",
                "itemListElement" to items,
            )
            ToolResult(
                "JSON-LD", Json.write(document, true),
                listOf("Items" to rows.size.toString()),
                note = "Paste inside a <script type=\"application/ld+json\"> tag in the page head.",
            )
        },
    ),
    Tool(
        slug = "canonical-tag", title = "Canonical Tag", category = "seo",
        tagline = "The tag, plus what is wrong with the URL.",
        keywords = listOf("canonical", "duplicate content"),
        fields = listOf(
            field("url", "Canonical URL", FieldKind.TEXT, default = "https://toolz.name.ng/tools?utm_source=news"),
        ),
        compute = { input ->
            val raw = input.text("url")
            if (raw.isEmpty()) return@Tool err("Paste the URL you want to canonicalise.")
            val problems = mutableListOf<String>()
            if (!raw.startsWith("https://")) problems += "use https"
            if (raw.contains("?")) problems += "query string should usually be dropped"
            if (raw.contains("#")) problems += "remove the fragment"
            if (raw.contains("utm_")) problems += "tracking parameters do not belong in a canonical"
            val clean = raw.substringBefore('#').substringBefore('?').trimEnd('/')
            ToolResult(
                "Canonical tag",
                "<link rel=\"canonical\" href=\"$clean\" />",
                listOf(
                    "Cleaned URL" to clean,
                    "Findings" to (if (problems.isEmpty()) "looks clean" else problems.joinToString("; ")),
                ),
            )
        },
    ),
    Tool(
        slug = "faq-schema", title = "FAQ Schema", category = "seo",
        tagline = "FAQPage JSON-LD from question and answer pairs.",
        keywords = listOf("faq", "schema", "rich results"),
        fields = listOf(
            field(
                "pairs", "Blocks of Q then A", FieldKind.MULTILINE,
                default = "Q: Is Toolz free?\nA: Yes, every tool is free and there is no account.\n\nQ: Does it work offline?\nA: Yes, calculations run on your device.",
            ),
        ),
        compute = { input ->
            val blocks = input["pairs"].orEmpty().split(Regex("\\n\\s*\\n")).filter { it.isNotBlank() }
            val entries = blocks.mapNotNull { block ->
                val question = block.lines().firstOrNull { it.trim().startsWith("Q:", true) }?.substringAfter(":")?.trim()
                val answer = block.lines().firstOrNull { it.trim().startsWith("A:", true) }?.substringAfter(":")?.trim()
                if (question.isNullOrBlank() || answer.isNullOrBlank()) null
                else mapOf<String, Any?>(
                    "@type" to "Question",
                    "name" to question,
                    "acceptedAnswer" to mapOf("@type" to "Answer", "text" to answer),
                )
            }
            if (entries.isEmpty()) return@Tool err("Write blocks like “Q: … ” then “A: … ” separated by a blank line.")
            val document = mapOf<String, Any?>(
                "@context" to "https://schema.org",
                "@type" to "FAQPage",
                "mainEntity" to entries,
            )
            ToolResult("JSON-LD", Json.write(document, true), listOf("Questions" to entries.size.toString()))
        },
    ),
    Tool(
        slug = "heading-structure", title = "Heading Structure", category = "seo",
        tagline = "H1–H6 order, gaps and duplicates in pasted HTML.",
        keywords = listOf("h1", "headings", "outline"),
        fields = listOf(
            field(
                "html", "HTML", FieldKind.MULTILINE,
                default = "<h1>Toolz</h1><h2>Free tools</h2><h3>Text</h3><h2>Privacy</h2>",
            ),
        ),
        compute = { input ->
            val html = input["html"].orEmpty()
            if (html.isBlank()) return@Tool err("Paste some HTML first.")
            val headings = H_TAG.findAll(html).map { match ->
                match.groupValues[1].toInt() to match.groupValues[2].replace(Regex("<[^>]+>"), "").trim()
            }.toList()
            if (headings.isEmpty()) return@Tool err("No h1–h6 tags found.")
            val h1 = headings.count { it.first == 1 }
            val issues = mutableListOf<String>()
            if (h1 == 0) issues += "no h1"
            if (h1 > 1) issues += "$h1 h1 tags"
            headings.zipWithNext().forEach { (a, b) ->
                if (b.first - a.first > 1) issues += "jumped h${a.first} → h${b.first} at “${b.second.take(30)}”"
            }
            val outline = headings.joinToString("\n") { (level, text) -> "  ".repeat(level - 1) + "h$level · $text" }
            ToolResult(
                if (issues.isEmpty()) "Structure is sound" else "Needs work",
                outline,
                listOf("Headings" to headings.size.toString(), "Findings" to issues.joinToString("; ").ifBlank { "none" }),
            )
        },
    ),
    Tool(
        slug = "hreflang", title = "Hreflang Tags", category = "seo",
        tagline = "Alternate-language link tags for every market.",
        keywords = listOf("hreflang", "international", "language"),
        fields = listOf(
            field(
                "rows", "One per line: language, URL", FieldKind.MULTILINE,
                default = "en-NG, https://toolz.name.ng/\nen-GB, https://toolz.name.ng/en-gb/\nx-default, https://toolz.name.ng/",
            ),
        ),
        compute = { input ->
            val rows = input["rows"].orEmpty().lines().mapNotNull { line ->
                val parts = line.split(",").map { it.trim() }.filter { it.isNotEmpty() }
                if (parts.size < 2) null else parts[0] to parts[1]
            }
            if (rows.isEmpty()) return@Tool err("Add a line like en-GB, https://example.com/en-gb/")
            val tags = rows.joinToString("\n") { (code, url) -> "<link rel=\"alternate\" hreflang=\"$code\" href=\"$url\" />" }
            val hasDefault = rows.any { it.first == "x-default" }
            ToolResult(
                "Hreflang tags",
                tags,
                listOf("Locales" to rows.size.toString(), "x-default" to (if (hasDefault) "present" else "missing")),
                note = "Every locale page should repeat the whole set, including a link to itself.",
            )
        },
    ),
    Tool(
        slug = "image-alt-checker", title = "Image Alt Checker", category = "seo",
        tagline = "Which images in your markup have no alt text.",
        keywords = listOf("alt text", "accessibility", "images"),
        fields = listOf(
            field("html", "HTML", FieldKind.MULTILINE, default = "<img src=\"chart.png\"><img src=\"logo.png\" alt=\"Toolz logo\">"),
        ),
        compute = { input ->
            val html = input["html"].orEmpty()
            if (html.isBlank()) return@Tool err("Paste the HTML that contains your images.")
            val images = IMG_TAG.findAll(html).map { it.value }.toList()
            if (images.isEmpty()) return@Tool err("No <img> tags found.")
            val missing = images.filter { !Regex("(?i)\\balt\\s*=").containsMatchIn(it) }
            val empty = images.filter { Regex("(?i)\\balt\\s*=\\s*[\"']\\s*[\"']").containsMatchIn(it) }
            ToolResult(
                "${images.size - missing.size} of ${images.size} have alt",
                if (missing.isEmpty()) "All images carry an alt attribute." else missing.joinToString("\n") { it.take(120) },
                listOf(
                    "Missing alt" to missing.size.toString(),
                    "Empty alt (decorative)" to empty.size.toString(),
                ),
                note = "alt=\"\" is correct for decoration; a *missing* alt is the problem.",
            )
        },
    ),
    Tool(
        slug = "internal-link-checker", title = "Internal Links", category = "seo",
        tagline = "Every internal link in pasted HTML, de-duplicated.",
        keywords = listOf("internal links", "anchor text"),
        fields = listOf(
            field("html", "HTML", FieldKind.MULTILINE, default = "<a href=\"/tools\">Tools</a><a href=\"https://toolz.name.ng/about\">About</a><a href=\"https://example.com\">Out</a>"),
            field("domain", "Your domain", FieldKind.TEXT, default = "toolz.name.ng"),
        ),
        compute = { input ->
            val html = input["html"].orEmpty()
            val domain = input.text("domain").removePrefix("https://").removePrefix("http://").trimEnd('/')
            if (html.isBlank()) return@Tool err("Paste some HTML first.")
            val links = HREF.findAll(html).map { it.groupValues[1] }.toList()
            val internal = links.filter { it.startsWith("/") || (domain.isNotEmpty() && it.contains(domain)) }
            val external = links.size - internal.size
            ToolResult(
                "${internal.distinct().size} unique internal links",
                internal.distinct().joinToString("\n").ifBlank { "No internal links found." },
                listOf("Total anchors" to links.size.toString(), "External" to external.toString()),
                note = "Relative links (/) count as internal; absolute links count when they contain your domain.",
            )
        },
    ),
    Tool(
        slug = "json-ld-validator", title = "JSON-LD Validator", category = "seo",
        tagline = "Check structured data parses and has what Google needs.",
        keywords = listOf("json-ld", "schema", "structured data"),
        fields = listOf(
            field("json", "JSON-LD", FieldKind.MULTILINE, default = "{\"@context\":\"https://schema.org\",\"@type\":\"Article\",\"headline\":\"Hello\"}"),
        ),
        compute = { input ->
            val raw = input["json"].orEmpty()
            if (raw.isBlank()) return@Tool err("Paste the JSON-LD block.")
            val parsed = runCatching { Json.parse(raw) }.getOrNull()
                ?: return@Tool err("That is not valid JSON.")
            val map = parsed as? Map<*, *> ?: return@Tool err("Structured data must be a JSON object, not an array or a value.")
            val context = map["@context"]?.toString()
            val type = map["@type"]?.toString()
            val findings = buildList {
                if (context == null) add("missing @context")
                else if (!context.contains("schema.org")) add("@context should point at schema.org")
                if (type == null) add("missing @type")
            }
            ToolResult(
                if (findings.isEmpty()) "Valid JSON-LD" else "Needs attention",
                map.keys.joinToString(", "),
                listOf(
                    "@type" to (type ?: "missing"),
                    "@context" to (context ?: "missing"),
                    "Findings" to findings.joinToString("; ").ifBlank { "none" },
                ),
            )
        },
    ),
    Tool(
        slug = "keyword-clustering", title = "Keyword Clustering", category = "seo",
        tagline = "Group keywords that share a word into topic clusters.",
        keywords = listOf("keyword clustering", "topics"),
        fields = listOf(
            field(
                "keywords", "One keyword per line", FieldKind.MULTILINE,
                default = "vat calculator\nvat calculator uk\nvat return deadline\ninvoice template\ninvoice template pdf",
            ),
        ),
        compute = { input ->
            val keywords = input["keywords"].orEmpty().lines().map { it.trim().lowercase(Locale.UK) }.filter { it.isNotEmpty() }
            if (keywords.isEmpty()) return@Tool err("Add a few keywords first.")
            val stop = setOf("a", "an", "the", "for", "of", "to", "in", "on", "and", "with")
            val groups = LinkedHashMap<String, MutableList<String>>()
            keywords.forEach { keyword ->
                val pivot = wordsOf(keyword).firstOrNull { it !in stop } ?: keyword
                groups.getOrPut(pivot) { mutableListOf() }.add(keyword)
            }
            val text = groups.entries.joinToString("\n\n") { (pivot, members) ->
                "$pivot (${members.size})\n" + members.joinToString("\n") { "  · $it" }
            }
            ToolResult(
                "${groups.size} clusters", text,
                listOf("Keywords" to keywords.size.toString()),
                note = "Grouped on the first meaningful word. Hubs with three or more keywords deserve their own page.",
            )
        },
    ),
    Tool(
        slug = "page-size", title = "Page Size", category = "seo",
        tagline = "Raw and gzipped weight of pasted markup.",
        keywords = listOf("page weight", "gzip", "performance"),
        fields = listOf(field("html", "HTML", FieldKind.MULTILINE, default = "<!doctype html><html><head><title>Toolz</title></head><body><h1>Hi</h1></body></html>")),
        compute = { input ->
            val html = input["html"].orEmpty()
            if (html.isEmpty()) return@Tool err("Paste the page source first.")
            val raw = html.toByteArray(Charsets.UTF_8).size
            val gz = gzipped(html)
            ToolResult(
                "Raw weight",
                "${fmt(raw / 1024.0, 1)} KB raw · ${fmt(gz / 1024.0, 1)} KB gzipped",
                listOf("Gzipped" to "${fmt(gz / 1024.0, 1)} KB", "Ratio" to pct(gz * 100.0 / raw, 0), "Characters" to html.length.toString()),
                note = "Inline SVG, base64 images and long class lists are the usual culprits. Under 14 KB gzipped fits the first TCP round trip.",
            )
        },
    ),
    Tool(
        slug = "readability", title = "Readability", category = "seo",
        tagline = "Flesch reading ease and the grade it implies.",
        keywords = listOf("readability", "flesch", "plain english"),
        fields = listOf(
            field(
                "text", "Your text", FieldKind.MULTILINE,
                default = "Toolz keeps every calculation on your phone. Type a number and the answer appears before you lift your finger.",
            ),
        ),
        compute = { input ->
            val text = input["text"].orEmpty()
            val words = wordsOf(text)
            if (words.size < 5) return@Tool err("Paste at least a sentence or two.")
            fun syllables(word: String): Int {
                val w = word.lowercase(Locale.UK).replace(Regex("[^a-z]"), "")
                if (w.isEmpty()) return 0
                val groups = Regex("[aeiouy]+").findAll(w).count()
                return if (w.endsWith("e") && groups > 1) groups - 1 else maxOf(groups, 1)
            }
            val sentences = sentenceCount(text).coerceAtLeast(1)
            val syllableTotal = words.sumOf { syllables(it) }
            val score = 206.835 - 1.015 * (words.size.toDouble() / sentences) - 84.6 * (syllableTotal.toDouble() / words.size)
            val grade = when {
                score >= 90 -> "Very easy (5th grade)"
                score >= 80 -> "Easy (6th grade)"
                score >= 70 -> "Fairly easy (7th grade)"
                score >= 60 -> "Plain English (8th–9th grade)"
                score >= 50 -> "Fairly difficult (10th–12th)"
                score >= 30 -> "Difficult (college)"
                else -> "Very difficult"
            }
            ToolResult(
                fmt(score, 1), grade,
                listOf(
                    "Words" to words.size.toString(),
                    "Sentences" to sentences.toString(),
                    "Words per sentence" to fmt(words.size.toDouble() / sentences, 1),
                    "Syllables per word" to fmt(syllableTotal.toDouble() / words.size, 2),
                ),
                note = "Flesch reading ease. Aim for 60 or higher on a public page.",
            )
        },
    ),
    Tool(
        slug = "robots-tester", title = "Robots.txt Tester", category = "seo",
        tagline = "Would a crawler be allowed to fetch this URL?",
        keywords = listOf("robots.txt", "crawl", "disallow"),
        fields = listOf(
            field("robots", "robots.txt", FieldKind.MULTILINE, default = "User-agent: *\nDisallow: /admin\nAllow: /"),
            field("path", "URL path", FieldKind.TEXT, default = "/admin/settings"),
            field("agent", "User agent", FieldKind.TEXT, default = "Googlebot"),
        ),
        compute = { input ->
            val lines = input["robots"].orEmpty().lines().map { it.substringBefore('#').trim() }.filter { it.isNotEmpty() }
            if (lines.isEmpty()) return@Tool err("Paste a robots.txt first.")
            val path = input.text("path").ifEmpty { "/" }
            val agent = input.text("agent").ifEmpty { "*" }
            var applies = false
            var bestAllow = -1
            var bestDisallow = -1
            for (line in lines) {
                val key = line.substringBefore(':').trim().lowercase(Locale.UK)
                val value = line.substringAfter(':').trim()
                when (key) {
                    "user-agent" -> applies = value == "*" || agent.lowercase(Locale.UK).contains(value.lowercase(Locale.UK))
                    "allow" -> if (applies && value.isNotEmpty() && path.startsWith(value)) bestAllow = maxOf(bestAllow, value.length)
                    "disallow" -> if (applies && value.isNotEmpty() && path.startsWith(value)) bestDisallow = maxOf(bestDisallow, value.length)
                }
            }
            val verdict = when {
                bestDisallow < 0 -> "Allowed"
                bestAllow >= bestDisallow -> "Allowed (Allow is more specific)"
                else -> "Blocked by Disallow"
            }
            ToolResult(
                verdict, path,
                listOf(
                    "Matching user-agent" to (if (applies) "yes" else "no"),
                    "Longest Allow" to (if (bestAllow < 0) "none" else "$bestAllow chars"),
                    "Longest Disallow" to (if (bestDisallow < 0) "none" else "$bestDisallow chars"),
                ),
                note = "Google uses the longest matching rule, and Allow wins a tie. This checks the rules in the file you pasted.",
            )
        },
    ),
    Tool(
        slug = "schema-markup", title = "Schema Markup", category = "seo",
        tagline = "JSON-LD for an article, product, organisation or local business.",
        keywords = listOf("schema", "json-ld", "rich results"),
        fields = listOf(
            field("type", "Type", FieldKind.SELECT, default = "Article", options = listOf("Article", "Product", "Organization", "LocalBusiness")),
            field("name", "Name or headline", FieldKind.TEXT, default = "How to check a VAT number"),
            field("url", "URL", FieldKind.TEXT, default = "https://toolz.name.ng/guides/vat"),
            field("extra", "Description / price", FieldKind.TEXT, default = "A short, practical guide."),
        ),
        compute = { input ->
            val type = input["type"] ?: "Article"
            val name = input.text("name")
            val url = input.text("url")
            val extra = input.text("extra")
            if (name.isEmpty() || url.isEmpty()) return@Tool err("A name and a URL are required.")
            val document: Map<String, Any?> = when (type) {
                "Product" -> mapOf(
                    "@context" to "https://schema.org", "@type" to "Product",
                    "name" to name, "url" to url, "description" to extra,
                    "offers" to mapOf("@type" to "Offer", "price" to extra.filter { it.isDigit() || it == '.' }.ifEmpty { "0" }, "priceCurrency" to "NGN", "url" to url),
                )
                "Organization" -> mapOf("@context" to "https://schema.org", "@type" to "Organization", "name" to name, "url" to url, "description" to extra)
                "LocalBusiness" -> mapOf("@context" to "https://schema.org", "@type" to "LocalBusiness", "name" to name, "url" to url, "description" to extra, "address" to mapOf("@type" to "PostalAddress", "addressCountry" to "NG"))
                else -> mapOf("@context" to "https://schema.org", "@type" to "Article", "headline" to name, "url" to url, "description" to extra)
            }
            ToolResult("JSON-LD", Json.write(document, true), listOf("@type" to type), note = "Only claim what the page actually shows: Google checks.")
        },
    ),
    Tool(
        slug = "seo-checklist", title = "SEO Checklist", category = "seo",
        tagline = "Score a page against the checks that actually rank.",
        keywords = listOf("seo checklist", "audit"),
        fields = listOf(
            field("https", "HTTPS everywhere", FieldKind.TOGGLE, default = "true"),
            field("title", "Title is 30–60 characters", FieldKind.TOGGLE, default = "true"),
            field("description", "Description is 70–160 characters", FieldKind.TOGGLE, default = "true"),
            field("h1", "Exactly one h1", FieldKind.TOGGLE, default = "true"),
            field("sitemap", "Sitemap submitted", FieldKind.TOGGLE, default = "false"),
            field("speed", "Page under 14 KB gzipped", FieldKind.TOGGLE, default = "false"),
            field("schema", "Structured data present", FieldKind.TOGGLE, default = "false"),
            field("links", "Internal links from other pages", FieldKind.TOGGLE, default = "false"),
        ),
        compute = { input ->
            val checks = listOf(
                "https" to "HTTPS on every URL",
                "title" to "Title length in range",
                "description" to "Description length in range",
                "h1" to "One h1",
                "sitemap" to "Sitemap submitted",
                "speed" to "Page weight under control",
                "schema" to "Structured data",
                "links" to "Internal links pointing here",
            )
            val passed = checks.count { input.flag(it.first) }
            val open = checks.filter { !input.flag(it.first) }.map { it.second }
            ToolResult(
                "${passed} of ${checks.size}",
                if (open.isEmpty()) "Everything on the list is done." else open.joinToString("\n") { "· $it" },
                listOf("Score" to pct(passed * 100.0 / checks.size, 0)),
                note = "Technical hygiene, not a ranking guarantee. Content that answers a real question still matters most.",
            )
        },
    ),
    Tool(
        slug = "seo-text-analyzer", title = "SEO Text Analyzer", category = "seo",
        tagline = "Where your keyword appears, and how often.",
        keywords = listOf("keyword", "analysis", "content"),
        fields = listOf(
            field("text", "Your page text", FieldKind.MULTILINE, default = "A VAT calculator works out tax on a price. Use the VAT calculator when you need to add VAT."),
            field("keyword", "Target keyword", FieldKind.TEXT, default = "vat calculator"),
        ),
        compute = { input ->
            val text = input["text"].orEmpty()
            val keyword = input.text("keyword").lowercase(Locale.UK)
            if (text.isBlank() || keyword.isEmpty()) return@Tool err("Paste your text and the keyword.")
            val lower = text.lowercase(Locale.UK)
            val occurrences = Regex(Regex.escape(keyword)).findAll(lower).count()
            val words = wordsOf(text).size
            val firstSentence = text.split(Regex("[.!?]")).firstOrNull()?.lowercase(Locale.UK).orEmpty()
            val density = if (words == 0) 0.0 else occurrences * keyword.split(" ").size * 100.0 / words
            ToolResult(
                "Mentions",
                "$occurrences in $words words",
                listOf(
                    "Density" to pct(density, 2),
                    "Words" to words.toString(),
                    "In first sentence" to if (firstSentence.contains(keyword)) "yes" else "no",
                    "In last paragraph" to if (text.lines().lastOrNull()?.lowercase(Locale.UK)?.contains(keyword) == true) "yes" else "no",
                ),
                note = "Around 0.5–2% reads naturally. Above 3% you are writing for a robot.",
            )
        },
    ),
    Tool(
        slug = "sitemap-validator", title = "Sitemap Validator", category = "seo",
        tagline = "URLs, duplicates and problems in a sitemap.",
        keywords = listOf("sitemap", "xml", "indexing"),
        fields = listOf(
            field("xml", "Sitemap XML", FieldKind.MULTILINE, default = "<?xml version=\"1.0\"?><urlset><url><loc>https://toolz.name.ng/</loc></url><url><loc>https://toolz.name.ng/tools</loc></url></urlset>"),
        ),
        compute = { input ->
            val xml = input["xml"].orEmpty()
            if (xml.isBlank()) return@Tool err("Paste the sitemap XML.")
            val urls = LOC_TAG.findAll(xml).map { it.groupValues[1].trim() }.toList()
            if (urls.isEmpty()) return@Tool err("No <loc> entries found.")
            val duplicates = urls.groupingBy { it }.eachCount().filter { it.value > 1 }.keys
            val invalid = urls.filter { !it.startsWith("http") || it.contains(' ') }
            ToolResult(
                "${urls.size} URLs",
                "${urls.distinct().size} unique · ${duplicates.size} duplicated · ${invalid.size} invalid",
                listOf(
                    "Unique" to urls.distinct().size.toString(),
                    "Duplicates" to duplicates.size.toString(),
                    "Invalid" to invalid.size.toString(),
                ),
                note = if (duplicates.isEmpty() && invalid.isEmpty()) "Shape looks right. A sitemap may hold at most 50,000 URLs and 50 MB." else (duplicates + invalid).take(10).joinToString("\n"),
            )
        },
    ),
    Tool(
        slug = "content-outline", title = "Content Outline", category = "seo",
        tagline = "A page skeleton built around one intent.",
        keywords = listOf("outline", "content plan", "headings"),
        fields = listOf(
            field("topic", "Topic", FieldKind.TEXT, default = "how VAT works in Nigeria"),
            field("audience", "Audience", FieldKind.TEXT, default = "small business owners"),
        ),
        compute = { input ->
            val topic = input.text("topic")
            val audience = input.text("audience").ifEmpty { "readers" }
            if (topic.isEmpty()) return@Tool err("Enter the topic.")
            val outline = buildString {
                appendLine("H1 · ${topic.replaceFirstChar { it.uppercase() }}")
                appendLine("  Intro: the 40-word answer, written for $audience.")
                appendLine("H2 · What it is")
                appendLine("H2 · How it works (worked example)")
                appendLine("H3 · The numbers")
                appendLine("H3 · Common mistakes")
                appendLine("H2 · Frequently asked questions")
                append("H2 · What to do next")
            }
            ToolResult("Outline", outline, listOf("Sections" to "5 H2 / 2 H3"), note = "One intent per page. If a section could be its own search result, it probably should be its own page.")
        },
    ),
    Tool(
        slug = "launch-checklist", title = "Launch Checklist", category = "seo",
        tagline = "The unglamorous list before you point DNS at it.",
        keywords = listOf("launch", "checklist", "go live"),
        fields = listOf(
            field("domain", "Custom domain live", FieldKind.TOGGLE, default = "true"),
            field("https", "HTTPS with no mixed content", FieldKind.TOGGLE, default = "true"),
            field("legal", "Privacy, terms and cookie pages", FieldKind.TOGGLE, default = "true"),
            field("search", "Search Console and Bing verified", FieldKind.TOGGLE, default = "false"),
            field("sitemap", "Sitemap and robots.txt live", FieldKind.TOGGLE, default = "false"),
            field("analytics", "Analytics or none at all", FieldKind.TOGGLE, default = "false"),
            field("backup", "Content backed up in git", FieldKind.TOGGLE, default = "true"),
        ),
        compute = { input ->
            val items = listOf(
                "domain" to "Custom domain resolves",
                "https" to "HTTPS without mixed content",
                "legal" to "Legal pages published",
                "search" to "Search Console verified",
                "sitemap" to "Sitemap and robots.txt reachable",
                "analytics" to "Analytics decision made",
                "backup" to "Content in version control",
            )
            val done = items.count { input.flag(it.first) }
            val open = items.filter { !input.flag(it.first) }.map { "· ${it.second}" }
            ToolResult(
                "$done of ${items.size} ready",
                if (open.isEmpty()) "Nothing outstanding. Ship it." else open.joinToString("\n"),
                note = "This list is generic; add whatever your industry regulator requires before launch.",
            )
        },
    ),
)
