package ng.name.toolz.data

import java.util.Locale

/**
 * Internet-adjacent tools that work with no connection: URL hygiene, domain
 * scoring, subnet maths, meta and Open Graph output, sitemaps and user-agent
 * parsing. Nothing here resolves DNS or fetches a page, and the tools say so.
 */

private fun parseIpv4(text: String): Long? {
    val parts = text.trim().split('.')
    if (parts.size != 4) return null
    var value = 0L
    for (part in parts) {
        val number = part.toIntOrNull() ?: return null
        if (number !in 0..255) return null
        value = (value shl 8) or number.toLong()
    }
    return value
}

private fun formatIpv4(value: Long): String {
    val padded = value and 0xFFFFFFFFL
    return listOf((padded ushr 24) and 0xFF, (padded ushr 16) and 0xFF, (padded ushr 8) and 0xFF, padded and 0xFF)
        .joinToString(".")
}

private val COMMON_TLDS = setOf(
    "com", "org", "net", "ng", "co.uk", "io", "dev", "app", "name", "info", "biz", "africa", "edu", "gov", "xyz",
)

private fun domainScore(domain: String): Pair<Int, List<String>> {
    val labels = domain.split('.')
    val name = labels.first()
    val tld = labels.last()
    val notes = mutableListOf<String>()
    var score = 100
    if (name.length > 15) { score -= 15; notes += "short names are easier to say and type" }
    if (name.length < 4) { score -= 10; notes += "very short names are mostly taken or expensive" }
    if (name.contains('-')) { score -= 15; notes += "hyphens get lost when people read a name aloud" }
    if (name.any { it.isDigit() }) { score -= 15; notes += "digits invite typos (is it 1 or one?)" }
    if (name.contains("--")) { score -= 10 }
    if (tld.isNotEmpty() && tld !in COMMON_TLDS) { score -= 10; notes += ".$tld is less familiar to most users" }
    val vowels = name.count { it in "aeiou" }
    if (vowels == 0 && name.length > 3) { score -= 10; notes += "no vowels makes it hard to pronounce" }
    if (name.length in 5..9 && !name.contains('-') && name.none { it.isDigit() }) notes += "a good length"
    return score.coerceIn(0, 100) to notes
}

internal val internetTools2 = listOf(
    Tool(
        slug = "canonical-url", title = "Canonical URL Checker", category = "internet",
        tagline = "Clean a URL down to the one form you should link.",
        keywords = listOf("canonical", "url", "duplicate"),
        fields = listOf(
            field("url", "URL", FieldKind.TEXT, default = "https://toolz.name.ng/Tools/?utm_source=news#top"),
        ),
        compute = { input ->
            val raw = input.text("url")
            if (raw.isEmpty()) return@Tool err("Paste a URL.")
            val findings = mutableListOf<String>()
            if (!raw.startsWith("https://")) findings += "not https"
            if (raw.contains(' ')) findings += "contains a space"
            if (raw.contains('#')) findings += "has a fragment"
            val parts = Regex("^(?:([a-zA-Z]+)://)?([^/?#]+)([^?#]*)(\\?[^#]*)?(#.*)?$").find(raw)
                ?: return@Tool err("That does not parse as a URL.")
            val scheme = parts.groupValues[1].ifEmpty { "https" }
            val host = parts.groupValues[2].lowercase(Locale.UK)
            val path = parts.groupValues[3]
            val query = parts.groupValues[4].removePrefix("?")
            val keptParams = query.split('&')
                .filter { it.isNotEmpty() && !it.lowercase(Locale.UK).startsWith("utm_") && it.lowercase(Locale.UK) !in setOf("fbclid", "gclid") }
            if (keptParams.size != query.split('&').count { it.isNotEmpty() }) findings += "tracking parameters removed"
            if (path.any { it.isUpperCase() }) findings += "uppercase path (hosts are case-insensitive, paths may not be)"
            if (path.endsWith("/") && path != "/") findings += "trailing slash"
            val cleanPath = path.trimEnd('/').ifEmpty { "/" }
            val normalized = buildString {
                append(scheme).append("://").append(host).append(cleanPath)
                if (keptParams.isNotEmpty()) append('?').append(keptParams.joinToString("&"))
            }
            ToolResult(
                "Canonical URL",
                normalized,
                listOf(
                    "Host" to host,
                    "Path" to cleanPath,
                    "Findings" to findings.joinToString("; ").ifBlank { "clean" },
                ),
                note = "Pick one form and use it in canonicals, sitemaps and internal links; duplicates split your ranking signals.",
            )
        },
    ),
    Tool(
        slug = "domain-analyzer", title = "Domain Analyzer", category = "internet",
        tagline = "How easy a domain is to say, spell and remember.",
        keywords = listOf("domain", "brand", "naming"),
        fields = listOf(field("domain", "Domain", FieldKind.TEXT, default = "toolz.name.ng")),
        compute = { input ->
            val raw = input.text("domain").lowercase(Locale.UK)
                .removePrefix("https://").removePrefix("http://").removePrefix("www.")
                .substringBefore('/').trimEnd('.')
            if (raw.isEmpty()) return@Tool err("Enter a domain like toolz.name.ng.")
            if (!raw.contains('.')) return@Tool err("That has no dot, so it is not a domain.")
            val labels = raw.split('.')
            val valid = labels.all { label -> label.isNotEmpty() && label.length <= 63 && label.first().isLetterOrDigit() && label.last().isLetterOrDigit() && label.all { it.isLetterOrDigit() || it == '-' } }
            val (score, notes) = domainScore(raw)
            ToolResult(
                "$score/100",
                if (valid) "Looks like a valid domain name." else "This is not a valid domain: check the dots, hyphens and characters.",
                listOf(
                    "Labels" to labels.size.toString(),
                    "Name length" to labels.first().length.toString(),
                    "TLD" to "." + labels.last(),
                    "Notes" to notes.joinToString("; ").ifBlank { "nothing to flag" },
                ),
                note = "Scored on the text only. Availability, trademark and DNS history are not checked here — look those up before you buy.",
            )
        },
    ),
    Tool(
        slug = "ipv4-subnet", title = "IPv4 Subnet Calculator", category = "internet",
        tagline = "Network, broadcast, mask and usable hosts from a CIDR.",
        keywords = listOf("subnet", "cidr", "netmask"),
        fields = listOf(field("cidr", "Address or CIDR", FieldKind.TEXT, default = "192.168.1.10/24")),
        compute = { input ->
            val raw = input.text("cidr")
            if (raw.isEmpty()) return@Tool err("Enter something like 192.168.1.10/24.")
            val address = raw.substringBefore('/')
            val prefixText = if (raw.contains('/')) raw.substringAfter('/') else "32"
            val ip = parseIpv4(address) ?: return@Tool err("That is not a valid IPv4 address.")
            val prefix = prefixText.toIntOrNull() ?: return@Tool err("The prefix must be a number from 0 to 32.")
            if (prefix !in 0..32) return@Tool err("The prefix must be from 0 to 32.")
            val mask = if (prefix == 0) 0L else (0xFFFFFFFFL shl (32 - prefix)) and 0xFFFFFFFFL
            val network = ip and mask
            val wildcard = mask xor 0xFFFFFFFFL
            val broadcast = network or wildcard
            val total = 1L shl (32 - prefix)
            val first = when {
                prefix >= 31 -> network
                else -> network + 1
            }
            val last = when {
                prefix == 32 -> network
                prefix == 31 -> broadcast
                else -> broadcast - 1
            }
            val usable = when {
                prefix == 32 -> 1L
                prefix == 31 -> 2L
                else -> total - 2
            }
            ToolResult(
                "${formatIpv4(network)}/$prefix",
                "Network ${formatIpv4(network)} · Broadcast ${formatIpv4(broadcast)}",
                listOf(
                    "Subnet mask" to formatIpv4(mask),
                    "Wildcard" to formatIpv4(wildcard),
                    "First host" to formatIpv4(first),
                    "Last host" to formatIpv4(last),
                    "Usable hosts" to fmt(usable),
                    "Total addresses" to fmt(total),
                ),
                note = "A /31 is treated as a two-address point-to-point link and a /32 as one host, per modern practice.",
            )
        },
    ),
    Tool(
        slug = "meta-tags", title = "Meta Tags", category = "internet",
        tagline = "The head tags a page needs, with length checks.",
        keywords = listOf("meta tags", "seo", "head"),
        fields = listOf(
            field("title", "Title", FieldKind.TEXT, default = "Free VAT Calculator - Toolz"),
            field("description", "Description", FieldKind.TEXT, default = "Work out VAT forwards and backwards, free, private and offline."),
            field("url", "Canonical URL", FieldKind.TEXT, default = "https://toolz.name.ng/tools/vat"),
            field("image", "Social image URL", FieldKind.TEXT, default = "https://toolz.name.ng/og/vat.png"),
        ),
        compute = { input ->
            val title = input.text("title")
            val description = input.text("description")
            val url = input.text("url")
            if (title.isEmpty() || url.isEmpty()) return@Tool err("A title and a canonical URL are required.")
            val warnings = mutableListOf<String>()
            if (title.length !in 30..60) warnings += "title is ${title.length} characters (30–60 is the usual window)"
            if (description.length !in 70..160) warnings += "description is ${description.length} characters (70–160)"
            val tags = buildString {
                appendLine("<title>$title</title>")
                appendLine("<meta name=\"description\" content=\"$description\">")
                appendLine("<link rel=\"canonical\" href=\"$url\">")
                appendLine("<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">")
                appendLine("<meta name=\"robots\" content=\"index, follow\">")
                appendLine("<meta property=\"og:title\" content=\"$title\">")
                appendLine("<meta property=\"og:description\" content=\"$description\">")
                appendLine("<meta property=\"og:url\" content=\"$url\">")
                appendLine("<meta property=\"og:type\" content=\"website\">")
                if (input.text("image").isNotEmpty()) {
                    appendLine("<meta property=\"og:image\" content=\"${input.text("image")}\">")
                    append("<meta name=\"twitter:card\" content=\"summary_large_image\">")
                }
            }.trimEnd()
            ToolResult(
                "Head tags",
                tags,
                listOf("Title" to "${title.length} chars", "Description" to "${description.length} chars", "Warnings" to warnings.joinToString("; ").ifBlank { "none" }),
                note = "One title, one description and one canonical per page. Duplicating them across pages wastes the space Google shows.",
            )
        },
    ),
    Tool(
        slug = "open-graph", title = "Open Graph Preview", category = "internet",
        tagline = "What the link looks like when it is shared.",
        keywords = listOf("open graph", "og", "social preview"),
        fields = listOf(
            field("title", "Title", FieldKind.TEXT, default = "Free VAT Calculator"),
            field("description", "Description", FieldKind.TEXT, default = "Add or remove VAT in one tap. No sign-up, works offline."),
            field("url", "URL", FieldKind.TEXT, default = "https://toolz.name.ng/tools/vat"),
            field("site", "Site name", FieldKind.TEXT, default = "Toolz"),
        ),
        compute = { input ->
            val title = input.text("title")
            val description = input.text("description")
            val url = input.text("url")
            if (title.isEmpty() || url.isEmpty()) return@Tool err("A title and a URL are required.")
            val tags = buildString {
                appendLine("<meta property=\"og:title\" content=\"$title\">")
                appendLine("<meta property=\"og:description\" content=\"$description\">")
                appendLine("<meta property=\"og:url\" content=\"$url\">")
                appendLine("<meta property=\"og:site_name\" content=\"${input.text("site")}\">")
                appendLine("<meta property=\"og:type\" content=\"website\">")
                append("<meta name=\"twitter:card\" content=\"summary_large_image\">")
            }
            val preview = buildString {
                appendLine("${input.text("site").uppercase(Locale.UK)} · ${url.substringAfter("//").substringBefore("/")}")
                appendLine(title)
                append(description)
            }
            ToolResult(
                "Card preview",
                preview,
                listOf(
                    "Title" to "${title.length} chars",
                    "Description" to "${description.length} chars",
                    "Tags" to tags.replace("\n", " "),
                ),
                note = "Most networks truncate the title near 60 characters and the description near 110; put the point first.",
            )
        },
    ),
    Tool(
        slug = "sitemap-generator", title = "Sitemap XML", category = "internet",
        tagline = "A urlset from a list of pages.",
        keywords = listOf("sitemap", "xml", "seo"),
        fields = listOf(
            field("urls", "One URL per line", FieldKind.MULTILINE, default = "https://toolz.name.ng/\nhttps://toolz.name.ng/tools\nhttps://toolz.name.ng/tools/vat"),
            field("lastmod", "Last modified (YYYY-MM-DD, blank to omit)", FieldKind.TEXT, default = "2026-01-01"),
            field("changefreq", "Change frequency", FieldKind.SELECT, default = "monthly", options = listOf("always", "hourly", "daily", "weekly", "monthly", "yearly", "never")),
            field("priority", "Priority", FieldKind.DECIMAL, default = "0.8"),
        ),
        compute = { input ->
            val urls = input["urls"].orEmpty().lines().map { it.trim() }.filter { it.isNotEmpty() }
            if (urls.isEmpty()) return@Tool err("Add at least one URL.")
            if (urls.size > 50_000) return@Tool err("A sitemap holds at most 50,000 URLs; split it.")
            val invalid = urls.filter { !it.startsWith("http://") && !it.startsWith("https://") }
            val valid = urls - invalid.toSet()
            if (valid.isEmpty()) return@Tool err("None of those look like absolute URLs.")
            val lastmod = input.text("lastmod")
            val priority = (input.num("priority") ?: 0.5).coerceIn(0.0, 1.0)
            val changefreq = input["changefreq"] ?: "monthly"
            val xml = buildString {
                appendLine("<?xml version=\"1.0\" encoding=\"UTF-8\"?>")
                appendLine("<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">")
                valid.forEach { url ->
                    appendLine("  <url>")
                    appendLine("    <loc>$url</loc>")
                    if (lastmod.isNotEmpty()) appendLine("    <lastmod>$lastmod</lastmod>")
                    appendLine("    <changefreq>$changefreq</changefreq>")
                    appendLine("    <priority>${fmt(priority, 1)}</priority>")
                    appendLine("  </url>")
                }
                append("</urlset>")
            }
            ToolResult(
                "${valid.size} URLs",
                xml,
                listOf(
                    "Skipped" to (if (invalid.isEmpty()) "none" else invalid.joinToString(", ")),
                    "Size" to "${xml.toByteArray(Charsets.UTF_8).size} B",
                ),
                note = "An XML sitemap is a hint, not a command: keep it free of redirects, 404s and noindex pages.",
            )
        },
    ),
    Tool(
        slug = "user-agent", title = "User-Agent Parser", category = "internet",
        tagline = "Browser, engine, OS and device from one string.",
        keywords = listOf("user agent", "browser", "device"),
        fields = listOf(
            field(
                "ua", "User agent", FieldKind.MULTILINE,
                default = "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36",
            ),
        ),
        compute = { input ->
            val ua = input.text("ua")
            if (ua.isEmpty()) return@Tool err("Paste a user-agent string.")
            val lower = ua.lowercase(Locale.UK)
            val browser = when {
                lower.contains("googlebot") -> "Googlebot"
                lower.contains("bingbot") -> "Bingbot"
                lower.contains("edg/") -> "Edge"
                lower.contains("opr/") || lower.contains("opera") -> "Opera"
                lower.contains("samsungbrowser") -> "Samsung Internet"
                lower.contains("firefox") || lower.contains("fxios") -> "Firefox"
                lower.contains("chrome") || lower.contains("crios") -> "Chrome"
                lower.contains("safari") -> "Safari"
                else -> "unknown"
            }
            val engine = when {
                lower.contains("gecko/") && lower.contains("firefox") -> "Gecko"
                lower.contains("applewebkit") -> "WebKit/Blink"
                lower.contains("trident") -> "Trident"
                else -> "unknown"
            }
            val os = when {
                lower.contains("android") -> "Android " + (Regex("Android ([0-9.]+)").find(ua)?.groupValues?.get(1) ?: "")
                lower.contains("iphone") || lower.contains("ipad") -> "iOS " + (Regex("OS ([0-9_]+)").find(ua)?.groupValues?.get(1)?.replace('_', '.') ?: "")
                lower.contains("windows nt") -> "Windows"
                lower.contains("mac os x") -> "macOS"
                lower.contains("linux") -> "Linux"
                else -> "unknown"
            }.trim()
            val device = when {
                lower.contains("ipad") || (lower.contains("android") && !lower.contains("mobile")) -> "Tablet"
                lower.contains("mobile") || lower.contains("iphone") -> "Phone"
                browser == "Googlebot" || browser == "Bingbot" -> "Crawler"
                else -> "Desktop"
            }
            val version = Regex("(?:Chrome|Firefox|Version|Edg|OPR|SamsungBrowser)/([0-9.]+)").find(ua)?.groupValues?.get(1)
            ToolResult(
                browser,
                "$os · $device · $engine",
                listOf(
                    "Browser" to browser,
                    "Version" to (version ?: "not stated"),
                    "Engine" to engine,
                    "OS" to os,
                    "Device" to device,
                ),
                note = "Heuristic, not a database: user agents can claim anything, so never use one for security decisions.",
            )
        },
    ),
)
