package ng.name.toolz

import ng.name.toolz.data.FieldKind
import ng.name.toolz.data.allTools
import ng.name.toolz.data.categories
import ng.name.toolz.data.categoryById
import ng.name.toolz.data.searchTools
import ng.name.toolz.data.toolBySlug
import ng.name.toolz.data.toolsIn
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
}
