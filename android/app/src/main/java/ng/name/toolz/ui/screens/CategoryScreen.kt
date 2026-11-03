package ng.name.toolz.ui.screens

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import ng.name.toolz.ads.BannerAdSlot
import ng.name.toolz.data.allTools
import ng.name.toolz.data.categories
import ng.name.toolz.data.categoryById
import ng.name.toolz.data.toolsIn
import ng.name.toolz.ui.components.BackRow
import ng.name.toolz.ui.components.Eyebrow
import ng.name.toolz.ui.components.Hairline
import ng.name.toolz.ui.components.ToolRow

@Composable
fun CategoryScreen(categoryId: String, onBack: () -> Unit, onOpenTool: (String) -> Unit) {
    val category = categoryById(categoryId) ?: categories.first()
    val tools = toolsIn(category.id).sortedBy { it.title }

    LazyColumn(
        Modifier.fillMaxSize().padding(horizontal = 20.dp),
        contentPadding = androidx.compose.foundation.layout.PaddingValues(bottom = 28.dp),
    ) {
        item {
            Spacer(Modifier.height(8.dp))
            BackRow("All collections", onBack)
            Eyebrow("${tools.size} tools")
            Spacer(Modifier.height(8.dp))
            Text(category.title, style = MaterialTheme.typography.displaySmall)
            Spacer(Modifier.height(8.dp))
            Text(
                category.blurb,
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
            Spacer(Modifier.height(18.dp))
            Hairline()
        }
        items(tools.size) { index ->
            val tool = tools[index]
            ToolRow(tool, onClick = { onOpenTool(tool.slug) })
        }
        item {
            Spacer(Modifier.height(20.dp))
            BannerAdSlot()
        }
    }
}

@Composable
fun AllToolsScreen(onBack: () -> Unit, onOpenTool: (String) -> Unit) {
    LazyColumn(
        Modifier.fillMaxSize().padding(horizontal = 20.dp),
        contentPadding = androidx.compose.foundation.layout.PaddingValues(bottom = 28.dp),
    ) {
        item {
            Spacer(Modifier.height(8.dp))
            BackRow("Home", onBack)
            Eyebrow("${allTools.size} tools")
            Spacer(Modifier.height(8.dp))
            Text("Everything in Toolz", style = MaterialTheme.typography.displaySmall)
            Spacer(Modifier.height(8.dp))
            Text(
                "Nine collections, one consistent screen. Pick a tool and start typing.",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
            Spacer(Modifier.height(12.dp))
            Hairline()
        }
        categories.forEach { category ->
            item {
                Column {
                    Spacer(Modifier.height(20.dp))
                    Eyebrow(category.title)
                    Spacer(Modifier.height(4.dp))
                }
            }
            val tools = toolsIn(category.id).sortedBy { it.title }
            items(tools.size) { index ->
                val tool = tools[index]
                ToolRow(tool, onClick = { onOpenTool(tool.slug) })
            }
        }
    }
}
