package ng.name.toolz.data

import java.util.Locale

/**
 * The catalogue. Counts everywhere in the app read from [allTools], so the
 * home screen can never claim a number the app does not actually ship.
 */

val categories: List<ToolCategory> = listOf(
    ToolCategory("text", "Text", "Count it, clean it, reshape it."),
    ToolCategory("calculators", "Calculators", "Everyday sums, done properly."),
    ToolCategory("finance", "Money", "Loans, savings and margins."),
    ToolCategory("developer", "Developer", "Encode, hash and format."),
    ToolCategory("everyday", "Everyday", "Measure, convert, plan."),
    ToolCategory("security", "Security", "Randomness you can trust."),
    ToolCategory("education", "Study", "Grades and revision."),
    ToolCategory("seo", "SEO", "Snippets, slugs and tagging."),
    ToolCategory("business", "Business", "Invoices, pricing, payback."),
)

val allTools: List<Tool> =
    textTools + calculatorTools + calculatorTools2 + financeTools + developerTools +
        developerTools2 + everydayTools + securityTools + educationTools + seoTools +
        seoTools2 + businessTools + businessTools2 + extraTools + batchTools

private val bySlug: Map<String, Tool> = allTools.associateBy { it.slug }

fun toolBySlug(slug: String): Tool? = bySlug[slug]

fun toolsIn(categoryId: String): List<Tool> = allTools.filter { it.category == categoryId }

fun toolCount(categoryId: String): Int = allTools.count { it.category == categoryId }

fun categoryById(id: String): ToolCategory? = categories.firstOrNull { it.id == id }

/** Ranked search: title hits first, then keywords, then taglines. */
fun searchTools(query: String): List<Tool> {
    val q = query.trim().lowercase(Locale.UK)
    if (q.isEmpty()) return emptyList()
    val terms = q.split(Regex("\\s+")).filter { it.isNotBlank() }
    return allTools
        .mapNotNull { tool ->
            val title = tool.title.lowercase(Locale.UK)
            val tagline = tool.tagline.lowercase(Locale.UK)
            val keywords = tool.keywords.joinToString(" ").lowercase(Locale.UK)
            val haystack = "$title $tagline $keywords ${tool.slug}"
            if (terms.any { it !in haystack }) return@mapNotNull null
            val score = when {
                title == q -> 0
                title.startsWith(q) -> 1
                title.contains(q) -> 2
                keywords.contains(q) -> 3
                else -> 4
            }
            score to tool
        }
        .sortedWith(compareBy({ it.first }, { it.second.title }))
        .map { it.second }
}

/** Small, honest tips rotated on the home screen. */
val tips: List<String> = listOf(
    "Everything in Toolz is computed on your phone. Nothing you type is uploaded.",
    "Long-press a result to copy it. Use the copy button when a value is long.",
    "Star the tools you use weekly — they move to the top of Home.",
    "Search accepts keywords: try “loan”, “hash” or “slug”.",
    "Every tool shows its workings underneath the answer.",
)
