package ng.name.toolz

import ng.name.toolz.data.FieldKind
import ng.name.toolz.data.allTools
import ng.name.toolz.data.categories
import ng.name.toolz.data.categoryById
import ng.name.toolz.data.searchTools
import ng.name.toolz.data.toolBySlug
import ng.name.toolz.data.toolsIn
import ng.name.toolz.data.MediaKind
import ng.name.toolz.media.JpegPage
import ng.name.toolz.media.PdfWriter
import ng.name.toolz.media.clampQuality
import ng.name.toolz.media.countWords
import ng.name.toolz.media.cropRect
import ng.name.toolz.media.decodeBase64Image
import ng.name.toolz.media.encodeBase64
import ng.name.toolz.media.extractDocxText
import ng.name.toolz.media.hexOf
import ng.name.toolz.media.humanBytes
import ng.name.toolz.media.parseColour
import ng.name.toolz.media.parsePageOrder
import ng.name.toolz.media.parsePageRanges
import ng.name.toolz.media.sanitiseName
import ng.name.toolz.media.targetLongEdge
import ng.name.toolz.media.zipOf
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * The catalogue is the product, so it is tested like one: every tool must
 * produce a result from its defaults, refuse rubbish input without crashing,
 * and stay inside a category that exists.
 */
class CatalogTest {

    @Test
    fun `every slug is unique`() {
        val slugs = allTools.map { it.slug }
        assertEquals(slugs.size, slugs.toSet().size)
    }

    @Test
    fun `every tool belongs to a real category`() {
        val ids = categories.map { it.id }.toSet()
        allTools.forEach { tool ->
            assertTrue("${tool.slug} has unknown category ${tool.category}", tool.category in ids)
        }
        categories.forEach { category ->
            assertTrue("${category.id} is empty", toolsIn(category.id).isNotEmpty())
        }
    }

    @Test
    fun `catalogue is substantial`() {
        assertTrue("only ${allTools.size} tools", allTools.size >= 50)
    }

    @Test
    fun `every tool answers with its defaults or asks for input`() {
        allTools.forEach { tool ->
            val input = tool.fields.associate { it.id to it.defaultValue }
            val result = runCatching { tool.compute(input) }
            assertTrue("${tool.slug} threw ${result.exceptionOrNull()}", result.isSuccess)
            val value = result.getOrThrow()
            assertTrue(
                "${tool.slug} returned neither an answer nor an error",
                value.error != null || value.value.isNotBlank(),
            )
        }
    }

    @Test
    fun `rubbish input never crashes a tool`() {
        allTools.forEach { tool ->
            val input = tool.fields.associate { spec ->
                spec.id to when (spec.kind) {
                    FieldKind.NUMBER, FieldKind.DECIMAL -> "not-a-number"
                    FieldKind.SELECT -> spec.options.firstOrNull()?.let { "??" } ?: "??"
                    else -> "\u0000\ttrailing "
                }
            }
            val result = runCatching { tool.compute(input) }
            assertTrue("${tool.slug} threw ${result.exceptionOrNull()}", result.isSuccess)
        }
    }

    @Test
    fun `search is ranked and forgiving`() {
        assertTrue(searchTools("percentage").first().slug == "percentage")
        assertTrue(searchTools("PERCENT").isNotEmpty())
        assertTrue(searchTools("").isEmpty())
        assertTrue(searchTools("zzzzzz").isEmpty())
        assertEquals("percentage", toolBySlug("percentage")?.slug)
        assertNotNull(categoryById("finance"))
    }

    @Test
    fun `field defaults are usable`() {
        allTools.forEach { tool ->
            tool.fields.forEach { spec ->
                if (spec.kind == FieldKind.SELECT && spec.options.isNotEmpty()) {
                    assertTrue(
                        "${tool.slug}/${spec.id} default is not one of its options",
                        spec.defaultValue.isEmpty() || spec.defaultValue in spec.options,
                    )
                }
            }
        }
    }

    @Test
    fun `ported seo and business tools give the right answers`() {
        fun run(slug: String, overrides: Map<String, String> = emptyMap()) =
            toolBySlug(slug)!!.let { tool ->
                val input = tool.fields.associate { it.id to it.defaultValue } + overrides
                tool.compute(input)
            }

        val breadcrumb = run("breadcrumb-schema")
        assertTrue(breadcrumb.value.contains("\"@type\": \"BreadcrumbList\""))
        assertEquals("2", breadcrumb.details.first { it.first == "Items" }.second)

        assertEquals("Blocked by Disallow", run("robots-tester").label)
        assertEquals("/admin/settings", run("robots-tester").value)
        assertEquals(
            "Allowed",
            run("robots-tester", mapOf("path" to "/tools/vat")).label,
        )

        val outline = run("heading-structure")
        assertTrue(outline.value.contains("h1 · Toolz"))

        val alt = run("image-alt-checker")
        assertEquals("1", alt.details.first { it.first == "Missing alt" }.second)

        val readability = run("readability")
        assertTrue(readability.label.toDouble() in 0.0..121.0)
        assertFalse(readability.label.contains(","))
        assertTrue(readability.value.isNotBlank())

        val page = run("page-size")
        assertEquals("Raw weight", page.label)

        val sitemap = run("sitemap-validator")
        assertEquals("2", sitemap.details.first { it.first == "Unique" }.second)

        val checklist = run("seo-checklist")
        assertEquals("4 of 8", checklist.label)

        val density = run("seo-text-analyzer")
        assertEquals("2 in 19 words", density.value)

        val meeting = run("meeting-cost")
        assertEquals("40,500", meeting.value)

        val project = run("project-cost")
        assertEquals("1,543,300", project.value)

        val card = run("qr-business-card")
        assertTrue(card.value.contains("█"))
        assertTrue(card.note.orEmpty().startsWith("BEGIN:VCARD"))

        assertEquals("Modern", run("business-name").label)
        assertTrue(run("hashtag-generator").value.startsWith("#"))

        val caption = run("caption-formatter")
        assertTrue(caption.label.endsWith("characters"))

        val subject = run("email-subject-analyzer")
        assertTrue(subject.label.matches(Regex("\\d+/100")))
        assertTrue(subject.value.isNotBlank())

        assertTrue(run("business-letter").value.contains("Re: Late delivery"))
        assertTrue(run("proposal-template").value.contains("50% on approval"))
        assertTrue(run("email-signature").value.contains("mailto:hello@toolz.name.ng"))
        assertEquals("12", run("content-calendar").details.first { it.first == "Posts" }.second)
    }

    @Test
    fun `calculator and developer ports compute correctly`() {
        fun run(slug: String, overrides: Map<String, String> = emptyMap()) =
            toolBySlug(slug)!!.let { tool ->
                val input = tool.fields.associate { it.id to it.defaultValue } + overrides
                tool.compute(input)
            }

        assertEquals("48", run("basic-calculator").value)
        assertEquals("12.5", run("scientific-calculator").value)
        assertEquals("8.485281", run("square-root").value)
        assertEquals("6√2", run("square-root").details.first { it.first == "Simplified" }.second)
        assertEquals("19/12", run("fraction").value)
        assertEquals("5", run("matrix").value)
        assertEquals("58%", run("probability").value)
        assertEquals("10", run("probability").details.first { it.first == "C(5,2)" }.second)
        assertEquals("16:9", run("ratio").value)
        assertEquals("3:2", run("ratio", mapOf("ratio" to "150:100")).value)

        assertEquals("box-shadow", run("box-shadow").label)
        assertEquals(
            "0px 12px 24px -6px rgba(21,22,26,0.25)",
            run("box-shadow").value,
        )
        assertFalse(run("css-minifier").value.contains("  "))
        assertTrue(run("css-formatter").value.contains("{\n"))
        assertTrue(run("html-formatter").value.contains("\n  <h2>"))
        assertTrue(run("xml-formatter").value.contains("Widget"))
        assertTrue(run("javascript-formatter").value.contains("const total"))
        assertTrue(run("javascript-minifier").value.length < 120)
        assertFalse(run("javascript-minifier").value.contains("//"))

        assertTrue(run("json-to-csv").value.startsWith("name,role,city"))
        assertTrue(run("json-to-csv").value.contains("Ada,Founder,"))
        assertTrue(run("qr-code").value.contains("█"))
        assertEquals("2 matches", run("regex-tester").label)
        assertEquals("Well-formed", run("xml-validator").label)
        assertEquals(
            "Not well-formed",
            run("xml-validator", mapOf("xml" to "<a><b></a>")).label,
        )

        assertEquals(
            "12.5",
            run("basic-calculator", mapOf("expression" to "10/0.8")).value,
        )
        assertEquals(
            "Check your input",
            run("basic-calculator", mapOf("expression" to "1/0")).label,
        )
    }

    @Test
    fun `text and internet ports compute correctly`() {
        fun run(slug: String, overrides: Map<String, String> = emptyMap()) =
            toolBySlug(slug)!!.let { tool ->
                val input = tool.fields.associate { it.id to it.defaultValue } + overrides
                tool.compute(input)
            }

        val html = run("markdown-to-html").value
        assertTrue(html.contains("<h1>Weekly note</h1>"))
        assertTrue(html.contains("<strong>three</strong>"))
        assertTrue(html.contains("<del>ten</del>"))
        assertTrue(html.contains("<li>Check the <em>build</em></li>"))
        assertTrue(html.contains("<code>logs.txt</code>"))
        assertTrue(html.contains("<a href=\"https://toolz.name.ng\">Docs</a>"))

        val markdown = run("html-to-markdown").value
        assertTrue(markdown.contains("## Plan"))
        assertTrue(markdown.contains("**three**"))
        assertTrue(markdown.contains("- Draft"))
        assertTrue(markdown.contains("[Docs](https://toolz.name.ng)"))

        val preview = run("markdown-preview")
        assertEquals("1", preview.details.first { it.first == "Headings" }.second)
        assertEquals("3", preview.details.first { it.first == "List items" }.second)

        assertEquals("How To Check A Vat Number", run("slug-to-text").value)
        assertEquals(
            "how to check a vat number",
            run("slug-to-text", mapOf("style" to "lower case")).value,
        )

        val random = run("random-text")
        assertTrue(random.value.isNotBlank())
        assertEquals(
            random.value,
            run("random-text").value,
        )

        val subnet = run("ipv4-subnet")
        assertEquals("192.168.1.0/24", subnet.label)
        assertEquals("255.255.255.0", subnet.details.first { it.first == "Subnet mask" }.second)
        assertEquals("254", subnet.details.first { it.first == "Usable hosts" }.second)
        assertEquals(
            "10.0.0.0/8",
            run("ipv4-subnet", mapOf("cidr" to "10.1.2.3/8")).label,
        )

        assertEquals(
            "https://toolz.name.ng/Tools",
            run("canonical-url").value,
        )
        assertEquals("100/100", run("domain-analyzer").label)
        assertEquals("3 URLs", run("sitemap-generator").label)
        assertTrue(run("sitemap-generator").value.contains("<loc>https://toolz.name.ng/</loc>"))
        assertTrue(run("meta-tags").value.contains("<link rel=\"canonical\""))
        assertTrue(run("open-graph").value.contains("Free VAT Calculator"))

        val ua = run("user-agent")
        assertEquals("Chrome", ua.label)
        assertTrue(ua.value.startsWith("Android 14"))
        assertEquals("Phone", ua.details.first { it.first == "Device" }.second)
    }

    @Test
    fun `money, study, health and security ports compute correctly`() {
        fun run(slug: String, overrides: Map<String, String> = emptyMap()) =
            toolBySlug(slug)!!.let { tool ->
                val input = tool.fields.associate { it.id to it.defaultValue } + overrides
                tool.compute(input)
            }

        assertEquals("3,456,000", run("business-revenue").value)
        assertEquals("155,000 NGN", run("currency-converter").value)
        assertTrue(run("debt-payoff").label.endsWith("months"))
        assertEquals("176,234.17", run("inflation").value)
        assertEquals("623,000", run("overtime").value)
        assertEquals("12.5%", run("ownership").label)
        assertEquals("6.57%", run("rental-yield").value)
        assertEquals("245.6667", run("stock-average").value)

        assertEquals("77.5%", run("attendance").label)
        assertEquals("Two thousand five", run("number-to-words").value)
        assertEquals("2,005", run("words-to-number").value)
        assertEquals("4.2 × 10^-4", run("scientific-notation").value)
        assertTrue(run("multiplication-table").value.contains("7 × 12 = 84"))
        assertEquals("2 cards", run("flashcard-generator").label)
        assertEquals("3 questions", run("random-quiz").label)
        assertTrue(run("bibliography").value.contains("(2024). Practical VAT"))
        assertTrue(run("citation").value.startsWith("Toolz. (2026-11-03)."))

        assertTrue(run("body-fat").label.endsWith("%"))
        assertEquals("2,693 kcal a day", run("calorie-estimate").label)
        assertEquals("15 Oct 2026", run("ovulation-date").value)
        assertEquals("5:15 per km", run("pace").label)
        assertEquals("12 km/h", run("running-speed").label)
        assertEquals("8 Jun 2027", run("pregnancy-due-date").value)
        assertEquals("3.45 L a day", run("water-intake").label)

        assertTrue(run("privacy-policy").value.contains("# Privacy policy for https://toolz.name.ng"))
        assertTrue(run("terms-conditions").value.contains("## 1. Using https://toolz.name.ng"))
        assertEquals("3 gaps", run("cookie-checklist").label)
        assertEquals("Suspicious", run("url-safety").label)

        val payload = run("text-encryption").value
        assertTrue(payload.isNotBlank())
        assertEquals(
            "Meet me at 6.",
            run("text-encryption", mapOf("mode" to "Decrypt", "text" to payload)).value,
        )
        assertEquals(
            "Could not decrypt: wrong passphrase, or the payload was altered.",
            run("text-encryption", mapOf("mode" to "Decrypt", "text" to payload, "passphrase" to "wrong password")).error,
        )
    }

    @Test
    fun `timers format their clocks and plan their rounds`() {
        fun run(slug: String, overrides: Map<String, String> = emptyMap()) =
            toolBySlug(slug)!!.let { tool ->
                val input = tool.fields.associate { it.id to it.defaultValue } + overrides
                tool.compute(input)
            }

        assertEquals("00:00.00", ng.name.toolz.data.clockText(0))
        assertEquals("01:05.00", ng.name.toolz.data.clockText(65_000))
        assertEquals("00:59.99", ng.name.toolz.data.clockText(59_990))
        assertEquals("1:00:00", ng.name.toolz.data.clockText(3_600_000))

        assertEquals("05:00.00", run("countdown-timer").value)
        assertEquals("Tea", run("countdown-timer").label)
        assertEquals("100 minutes of focus", run("pomodoro-timer").label)
        assertEquals("Total time", run("pomodoro-timer").details.first().first)
        assertEquals("00:00.00", run("stopwatch").value)
    }

    @Test
    fun `image maths answers without a bitmap`() {
        fun run(slug: String, overrides: Map<String, String> = emptyMap()) =
            toolBySlug(slug)!!.let { tool ->
                val input = tool.fields.associate { it.id to it.defaultValue } + overrides
                tool.compute(input)
            }

        val dimensions = run("image-dimension")
        assertEquals("1600 × 1200", dimensions.label)
        assertEquals("4:3", dimensions.details.first { it.first == "Aspect ratio" }.second)

        assertEquals("10 × 6.67 in", run("image-dpi").label)
        assertEquals("2.07 MP", run("image-resolution").label)
        assertEquals("16:9", run("image-resolution").details.first { it.first == "Aspect ratio" }.second)
        assertTrue(run("social-image-size").value.contains("LinkedIn post"))
        assertEquals(
            "Matches 1 preset",
            run("social-image-size", mapOf("width" to "1080", "height" to "1080")).label,
        )
    }

    @Test
    fun `media maths parses ranges, sizes, names and colours`() {
        assertEquals(listOf(1..3, 5..5), parsePageRanges("1-3,5", 10))
        assertEquals((1..3).map { it..it }, parsePageRanges("", 3))
        assertEquals(listOf(5..5), parsePageRanges("9-12", 5))
        assertTrue(parsePageRanges("abc", 4).isEmpty())
        assertEquals(listOf(3, 1, 2), parsePageOrder("3,1,2", 3))
        assertEquals(null, parsePageOrder("1,1,2", 3))
        assertEquals(null, parsePageOrder("1,2", 3))

        assertEquals(1600 to 1200, targetLongEdge(4000, 3000, 1600))
        assertEquals(4000 to 3000, targetLongEdge(4000, 3000, 8000))
        assertEquals(listOf(500, 0, 3000, 3000), cropRect(4000, 3000, "Centre square").toList())
        assertEquals(listOf(0, 0, 4000, 3000), cropRect(4000, 3000, "4:3").toList())

        assertEquals("1.50 KB", humanBytes(1536))
        assertEquals("512 B", humanBytes(512))
        assertEquals("My-Photo-1", sanitiseName("My Photo (1).jpg", "image"))
        assertEquals("image", sanitiseName("   ", "image"))
        assertEquals(0xFFFFFFFF.toInt(), parseColour("#fff"))
        assertEquals(0xFFD64E18.toInt(), parseColour("#d64e18"))
        assertEquals(0xFFFF0000.toInt(), parseColour("rgb(255,0,0)"))
        assertEquals(null, parseColour("purple-ish"))
        assertEquals("#D64E18", hexOf(0xFFD64E18.toInt()))
        assertEquals(100, clampQuality("999"))
        assertEquals(1, clampQuality("0"))
        assertEquals(3, countWords("one two three"))
    }

    @Test
    fun `the pdf writer emits a document a reader can open`() {
        val pdf = PdfWriter.textPdf("Hello world\n\nSecond paragraph", 12f, "Test document")
        val text = String(pdf, Charsets.ISO_8859_1)
        assertTrue(text.startsWith("%PDF-1.4"))
        assertTrue(text.contains("/Type /Catalog"))
        assertTrue(text.contains("/Type /Page"))
        assertTrue(text.contains("/BaseFont /Helvetica"))
        assertTrue(text.contains("(Hello world) Tj"))
        assertTrue(text.contains("/Title (Test document)"))
        assertTrue(text.trimEnd().endsWith("%%EOF"))

        val startxref = text.substringAfterLast("startxref").trim().substringBefore("\n").toInt()
        assertTrue("startxref points at the xref table", text.substring(startxref).startsWith("xref"))

        val wrapped = PdfWriter.wrap("word ".repeat(400), 12f)
        assertTrue("long text wraps", wrapped.size > 5)
        wrapped.forEach { line -> assertTrue("line ${line.length} is too wide", PdfWriter.textWidth(line, 12f) < 500) }

        val jpeg = byteArrayOf(0xFF.toByte(), 0xD8.toByte(), 0x01, 0x02, 0xFF.toByte(), 0xD9.toByte())
        val imagePdf = String(PdfWriter.imagePdf(listOf(JpegPage(jpeg, 1000, 750))), Charsets.ISO_8859_1)
        assertTrue(imagePdf.contains("/Filter /DCTDecode"))
        assertTrue(imagePdf.contains("/Subtype /Image"))
        assertTrue(imagePdf.contains("/Width 1000"))
    }

    @Test
    fun `docx text and zips round-trip`() {
        val xml = "<w:document><w:body><w:p><w:r><w:t>Hello</w:t></w:r></w:p>" +
            "<w:p><w:r><w:t>World &amp; friends</w:t></w:r></w:p></w:body></w:document>"
        val docx = zipOf(listOf("word/document.xml" to xml.toByteArray()))
        assertEquals("Hello\nWorld & friends", extractDocxText(docx))

        val archive = zipOf(listOf("a.txt" to "alpha".toByteArray(), "b.txt" to "beta".toByteArray()))
        val names = mutableListOf<String>()
        java.util.zip.ZipInputStream(java.io.ByteArrayInputStream(archive)).use { zip ->
            var entry = zip.nextEntry
            while (entry != null) {
                names += entry.name
                entry = zip.nextEntry
            }
        }
        assertEquals(listOf("a.txt", "b.txt"), names)
        assertTrue(archive.size > 100)

        assertEquals("hello", String(decodeBase64Image("data:text/plain;base64,aGVsbG8=")!!, Charsets.UTF_8))
        assertEquals(null, decodeBase64Image("   "))
        assertEquals("aGVsbG8=", encodeBase64("hello".toByteArray()))
    }

    @Test
    fun `every media tool is routed and every file tool explains itself`() {
        val fileTools = allTools.filter { it.media != null }
        assertEquals(36, fileTools.size)
        fileTools.forEach { tool ->
            val result = tool.compute(tool.fields.associate { it.id to it.defaultValue })
            assertTrue("${tool.slug} has no explanation", result.note != null && result.note!!.length > 20)
            assertTrue("${tool.slug} claims an answer it cannot give", result.label == "On this device")
        }
        assertEquals(18, fileTools.count { it.media == MediaKind.IMAGE })
        assertEquals(13, fileTools.count { it.media == MediaKind.PDF })
        assertEquals(1, fileTools.count { it.media == MediaKind.PDF_MULTI })
        assertEquals(2, fileTools.count { it.media == MediaKind.DOCX })
        assertEquals(2, fileTools.count { it.media == MediaKind.NONE })
    }
}
