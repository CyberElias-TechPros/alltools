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
        assertTrue(readability.value.toDouble() in 0.0..121.0)
        assertFalse(readability.value.contains(","))

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
}
