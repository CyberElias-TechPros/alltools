package ng.name.toolz.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import ng.name.toolz.ads.NativeAdSlot
import ng.name.toolz.data.AppState
import ng.name.toolz.data.Tool
import ng.name.toolz.data.allTools
import ng.name.toolz.data.categories
import ng.name.toolz.data.categoryById
import ng.name.toolz.data.tips
import ng.name.toolz.data.toolBySlug
import ng.name.toolz.data.toolCount
import ng.name.toolz.ui.components.Eyebrow
import ng.name.toolz.ui.components.Hairline
import ng.name.toolz.ui.components.SearchField
import ng.name.toolz.ui.components.SectionTitle
import ng.name.toolz.ui.components.ToolRow
import ng.name.toolz.ui.theme.Studio

@Composable
fun HomeScreen(
    onOpenTool: (String) -> Unit,
    onOpenCategory: (String) -> Unit,
    onOpenSearch: () -> Unit,
    onOpenAll: () -> Unit,
    onOpenSettings: () -> Unit,
) {
    val prefs = AppState.prefs
    val favorites by prefs.favorites.collectAsState()
    val recents by prefs.recents.collectAsState()
    val recentTools = recents.mapNotNull { toolBySlug(it) }.take(4)
    val savedTools = favorites.mapNotNull { toolBySlug(it) }

    LazyColumn(
        Modifier.fillMaxSize().padding(horizontal = 20.dp),
        contentPadding = androidx.compose.foundation.layout.PaddingValues(bottom = 32.dp),
    ) {
        item {
            Spacer(Modifier.height(16.dp))
            Row(verticalAlignment = Alignment.CenterVertically) {
                Column(Modifier.weight(1f)) {
                    Eyebrow("Offline · Private · Free")
                    Spacer(Modifier.height(6.dp))
                    Text("Toolz", style = MaterialTheme.typography.displayLarge)
                }
                Icon(
                    Icons.Filled.Settings,
                    contentDescription = "Settings",
                    tint = MaterialTheme.colorScheme.onSurfaceVariant,
                    modifier = Modifier.size(22.dp).clickable(onClick = onOpenSettings),
                )
            }
            Spacer(Modifier.height(10.dp))
            Text(
                "${allTools.size} everyday tools that run on your phone, not on a server.",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
            Spacer(Modifier.height(20.dp))
            Box(Modifier.clickable(onClick = onOpenSearch)) {
                SearchField(
                    query = "",
                    onQueryChange = { },
                    placeholder = "Search ${allTools.size} tools",
                )
            }
            Spacer(Modifier.height(10.dp))
        }

        if (recentTools.isNotEmpty()) {
            item {
                SectionTitle("Continue")
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    recentTools.forEach { tool ->
                        RecentChip(tool) { onOpenTool(tool.slug) }
                    }
                }
                Spacer(Modifier.height(6.dp))
            }
        }

        if (savedTools.isNotEmpty()) {
            item {
                SectionTitle("Saved", action = "All") { onOpenAll() }
                savedTools.take(4).forEach { tool ->
                    ToolRow(tool, onClick = { onOpenTool(tool.slug) })
                }
            }
        }

        item {
            SectionTitle("Collections", action = "Everything") { onOpenAll() }
        }

        categories.chunked(2).forEach { pair ->
            item {
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    pair.forEachIndexed { index, category ->
                        val globalIndex = categories.indexOf(category)
                        Column(Modifier.weight(1f)) {
                            CategoryCard(
                                number = (globalIndex + 1).toString().padStart(2, '0'),
                                title = category.title,
                                count = toolCount(category.id),
                                blurb = category.blurb,
                                onClick = { onOpenCategory(category.id) },
                            )
                        }
                    }
                    if (pair.size == 1) Spacer(Modifier.weight(1f))
                }
                Spacer(Modifier.height(10.dp))
            }
        }

        item {
            SectionTitle("Popular")
            allTools.sortedByDescending { it.keywords.size }.take(4).forEach { tool ->
                ToolRow(tool, onClick = { onOpenTool(tool.slug) })
            }
            Spacer(Modifier.height(18.dp))
        }

        item {
            NativeAdSlot()
            Spacer(Modifier.height(20.dp))
        }

        item {
            Box(
                Modifier
                    .fillMaxWidth()
                    .background(MaterialTheme.colorScheme.surfaceVariant, MaterialTheme.shapes.medium)
                    .padding(16.dp),
            ) {
                Column {
                    Eyebrow("Good to know")
                    Spacer(Modifier.height(6.dp))
                    Text(
                        tips.first(),
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                }
            }
            Spacer(Modifier.height(16.dp))
            Hairline()
            Spacer(Modifier.height(14.dp))
            Text(
                "Toolz · toolz.name.ng",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
            Spacer(Modifier.height(4.dp))
            Text(
                "Results are computed on your device. Ads are the only network traffic.",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
        }
    }
}

@Composable
private fun RecentChip(tool: Tool, onClick: () -> Unit) {
    Text(
        text = tool.title,
        style = MaterialTheme.typography.labelLarge,
        color = MaterialTheme.colorScheme.onSurface,
        modifier = Modifier
            .background(MaterialTheme.colorScheme.surface, MaterialTheme.shapes.small)
            .border(1.dp, MaterialTheme.colorScheme.outlineVariant, MaterialTheme.shapes.small)
            .clickable(onClick = onClick)
            .padding(horizontal = 12.dp, vertical = 9.dp),
    )
}

@Composable
private fun CategoryCard(
    number: String,
    title: String,
    count: Int,
    blurb: String,
    onClick: () -> Unit,
) {
    Column(
        Modifier
            .fillMaxWidth()
            .background(MaterialTheme.colorScheme.surface, MaterialTheme.shapes.medium)
            .border(1.dp, MaterialTheme.colorScheme.outlineVariant, MaterialTheme.shapes.medium)
            .clickable(onClick = onClick)
            .padding(14.dp),
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Text(
                number,
                style = MaterialTheme.typography.labelSmall,
                color = studioAccent(number),
            )
            Spacer(Modifier.weight(1f))
            Text(
                "$count",
                style = MaterialTheme.typography.labelSmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
        }
        Spacer(Modifier.height(18.dp))
        Text(title, style = MaterialTheme.typography.titleLarge)
        Spacer(Modifier.height(4.dp))
        Text(
            blurb,
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            maxLines = 2,
        )
    }
}

private fun studioAccent(number: String) = when (number.toIntOrNull() ?: 0) {
    1 -> Studio.Vermilion
    2 -> Studio.Ochre
    3 -> Studio.Moss
    else -> Studio.Vermilion
}
