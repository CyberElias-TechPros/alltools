package ng.name.toolz.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.ui.Modifier
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.unit.dp
import ng.name.toolz.data.allTools
import ng.name.toolz.data.searchTools
import ng.name.toolz.ui.components.BackRow
import ng.name.toolz.ui.components.Eyebrow
import ng.name.toolz.ui.components.SearchField
import ng.name.toolz.ui.components.StudioChip
import ng.name.toolz.ui.components.ToolRow

private val suggestions = listOf("loan", "percentage", "password", "json", "hash", "slug", "vat", "bmi", "colour", "uuid")

@OptIn(androidx.compose.foundation.layout.ExperimentalLayoutApi::class)
@Composable
fun SearchScreen(onBack: () -> Unit, onOpenTool: (String) -> Unit) {
    var query by remember { mutableStateOf("") }
    val results = remember(query) { searchTools(query) }
    val focus = remember { FocusRequester() }

    LaunchedEffect(Unit) { runCatching { focus.requestFocus() } }

    LazyColumn(
        Modifier.fillMaxSize().padding(horizontal = 20.dp),
        contentPadding = androidx.compose.foundation.layout.PaddingValues(bottom = 28.dp),
    ) {
        item {
            Spacer(Modifier.height(8.dp))
            BackRow("Home", onBack)
            SearchField(
                query = query,
                onQueryChange = { query = it },
                placeholder = "Tool, keyword or task",
                modifier = Modifier.focusRequester(focus),
            )
            Spacer(Modifier.height(14.dp))
        }

        if (query.isBlank()) {
            item {
                Eyebrow("Try")
                Spacer(Modifier.height(8.dp))
                FlowRow(
                    Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(0.dp),
                ) {
                    suggestions.forEach { word ->
                        StudioChip(word, onClick = { query = word })
                    }
                }
                Spacer(Modifier.height(20.dp))
                Eyebrow("${allTools.size} tools, all offline")
                Spacer(Modifier.height(6.dp))
                Text(
                    "Search matches tool names, keywords and descriptions. Everything runs on this device.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
        } else if (results.isEmpty()) {
            item {
                Spacer(Modifier.height(24.dp))
                Text("No tool matches “$query”.", style = MaterialTheme.typography.titleLarge)
                Spacer(Modifier.height(6.dp))
                Text(
                    "Try a broader word such as “date”, “text” or “convert”.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
        } else {
            item {
                Eyebrow("${results.size} ${if (results.size == 1) "result" else "results"}")
                Spacer(Modifier.height(4.dp))
            }
            items(results.size) { index ->
                val tool = results[index]
                ToolRow(tool, onClick = { onOpenTool(tool.slug) })
            }
        }
    }
}
