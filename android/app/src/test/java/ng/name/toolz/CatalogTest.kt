package ng.name.toolz

import ng.name.toolz.data.FieldKind
import ng.name.toolz.data.allTools
import ng.name.toolz.data.categories
import ng.name.toolz.data.categoryById
import ng.name.toolz.data.searchTools
import ng.name.toolz.data.toolBySlug
import ng.name.toolz.data.toolsIn
import org.junit.Assert.assertEquals
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
}
