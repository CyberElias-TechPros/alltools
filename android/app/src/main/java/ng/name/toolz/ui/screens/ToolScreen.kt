package ng.name.toolz.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateMapOf
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalClipboardManager
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import ng.name.toolz.ads.BannerAdSlot
import ng.name.toolz.data.AppState
import ng.name.toolz.data.FieldKind
import ng.name.toolz.data.FieldSpec
import ng.name.toolz.data.Tool
import ng.name.toolz.data.categoryById
import ng.name.toolz.ui.components.BackRow
import ng.name.toolz.ui.components.Eyebrow
import ng.name.toolz.ui.components.FavoriteToggle
import ng.name.toolz.ui.components.Hairline
import ng.name.toolz.ui.components.ResultPanel
import ng.name.toolz.ui.components.StudioButton
import ng.name.toolz.ui.components.StudioChip
import ng.name.toolz.ui.components.StudioTextField
import ng.name.toolz.ui.components.TimerPanel
import ng.name.toolz.ui.theme.Studio

@Composable
fun ToolScreen(tool: Tool, onBack: () -> Unit, onOpenCategory: (String) -> Unit) {
    val prefs = AppState.prefs
    val favorites by prefs.favorites.collectAsState()
    val clipboard = LocalClipboardManager.current
    val context = LocalContext.current
    val values = remember(tool.slug) {
        mutableStateMapOf<String, String>().apply {
            tool.fields.forEach { put(it.id, it.defaultValue) }
        }
    }
    val result = remember(values.toMap()) { tool.compute(values.toMap()) }

    LazyColumn(
        Modifier.fillMaxSize().padding(horizontal = 20.dp),
        contentPadding = androidx.compose.foundation.layout.PaddingValues(bottom = 28.dp),
    ) {
        item {
            Spacer(Modifier.height(8.dp))
            BackRow(categoryById(tool.category)?.title ?: "Tools", onBack)
            Row(verticalAlignment = Alignment.Top) {
                Column(Modifier.weight(1f)) {
                    Text(tool.title, style = MaterialTheme.typography.displaySmall)
                    Spacer(Modifier.height(6.dp))
                    Text(
                        tool.tagline,
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                }
                Spacer(Modifier.width(12.dp))
                FavoriteToggle(favorites.contains(tool.slug)) {
                    prefs.toggleFavorite(tool.slug)
                }
            }
            Spacer(Modifier.height(22.dp))
        }

        if (tool.fields.isNotEmpty()) {
            item {
                Column {
                    tool.fields.forEach { spec ->
                        FieldBlock(
                            spec = spec,
                            value = values[spec.id].orEmpty(),
                            onChange = { values[spec.id] = it },
                        )
                        Spacer(Modifier.height(14.dp))
                    }
                }
            }
        }

        if (tool.slug == "countdown-timer" || tool.slug == "pomodoro-timer" || tool.slug == "stopwatch") {
            item {
                Spacer(Modifier.height(6.dp))
                TimerPanel(
                    slug = tool.slug,
                    workMinutes = (values["work"] ?: values["minutes"])?.toIntOrNull() ?: 25,
                    restMinutes = values["rest"]?.toIntOrNull() ?: 5,
                    rounds = values["rounds"]?.toIntOrNull() ?: 4,
                )
                Spacer(Modifier.height(16.dp))
            }
        }

        item {
            Spacer(Modifier.height(6.dp))
            ResultPanel(result)
            if (result.error == null) {
                Spacer(Modifier.height(10.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    Column(Modifier.weight(1f)) {
                        StudioButton("Copy result", filled = true) {
                            clipboard.setText(AnnotatedString(result.value))
                        }
                    }
                    Column(Modifier.weight(1f)) {
                        StudioButton("Copy workings", filled = false) {
                            val text = buildString {
                                appendLine("${tool.title} — Toolz")
                                appendLine("${result.label}: ${result.value}")
                                result.details.forEach { (k, v) -> appendLine("$k: $v") }
                            }
                            clipboard.setText(AnnotatedString(text.trim()))
                        }
                    }
                }
            }
            Spacer(Modifier.height(18.dp))
            Text(
                "Runs entirely on this device. Nothing you type is uploaded.",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
            Spacer(Modifier.height(16.dp))
        }

        item {
            BannerAdSlot()
            Spacer(Modifier.height(18.dp))
        }

        item {
            Hairline()
            SectionHeading("How this works")
            Spacer(Modifier.height(6.dp))
            Text(
                "Toolz takes the values you type, runs one pure calculation and shows the answer with its workings. " +
                    "Because the maths happens here rather than on a server, results appear as you type and work with no signal.",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
            Spacer(Modifier.height(14.dp))
            Row {
                Text(
                    "Open the ${categoryById(tool.category)?.title ?: "Tools"} collection",
                    style = MaterialTheme.typography.labelLarge,
                    color = Studio.Vermilion,
                    modifier = Modifier.clickable { onOpenCategory(tool.category) },
                )
            }
        }
    }
    // Keep the recents list honest: a tool is "used" once it is opened.
    androidx.compose.runtime.LaunchedEffect(tool.slug) {
        prefs.markVisited(tool.slug)
        ng.name.toolz.ads.AdManager.countToolOpen(context)
    }
}

@Composable
private fun SectionHeading(text: String) {
    Text(text, style = MaterialTheme.typography.titleMedium, modifier = Modifier.padding(bottom = 2.dp))
}

@Composable
private fun FieldBlock(spec: FieldSpec, value: String, onChange: (String) -> Unit) {
    Column(Modifier.fillMaxWidth()) {
        if (spec.kind != FieldKind.TOGGLE) {
            Eyebrow(spec.label)
            Spacer(Modifier.height(6.dp))
        }
        when (spec.kind) {
            FieldKind.TOGGLE -> ToggleRow(value == "true", spec.label) { onChange(if (it) "true" else "false") }
            FieldKind.SELECT -> FlowChips(spec.options, value) { onChange(it) }
            FieldKind.NUMBER -> StudioTextField(
                value = value,
                onValueChange = onChange,
                placeholder = spec.placeholder,
                keyboard = KeyboardType.Number,
            )
            FieldKind.DECIMAL -> StudioTextField(
                value = value,
                onValueChange = onChange,
                placeholder = spec.placeholder,
                keyboard = KeyboardType.Decimal,
            )
            FieldKind.MULTILINE -> StudioTextField(
                value = value,
                onValueChange = onChange,
                placeholder = spec.placeholder,
                singleLine = false,
                minHeight = 96.dp,
            )
            else -> StudioTextField(
                value = value,
                onValueChange = onChange,
                placeholder = spec.placeholder,
            )
        }
        if (spec.suffix.isNotEmpty()) {
            Text(spec.suffix, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
        }
    }
}

@Composable
private fun ToggleRow(checked: Boolean, label: String, onChange: (Boolean) -> Unit) {
    Row(
        Modifier
            .fillMaxWidth()
            .clickable { onChange(!checked) }
            .padding(vertical = 6.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Text(label, style = MaterialTheme.typography.bodyLarge, modifier = Modifier.weight(1f))
        Row(
            Modifier
                .width(46.dp)
                .height(26.dp)
                .background(
                    if (checked) Studio.Vermilion else MaterialTheme.colorScheme.surfaceVariant,
                    MaterialTheme.shapes.extraLarge,
                )
                .border(1.dp, MaterialTheme.colorScheme.outlineVariant, MaterialTheme.shapes.extraLarge)
                .padding(3.dp),
            horizontalArrangement = if (checked) Arrangement.End else Arrangement.Start,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Spacer(
                Modifier
                    .height(20.dp)
                    .width(20.dp)
                    .background(
                        if (checked) androidx.compose.ui.graphics.Color.White else MaterialTheme.colorScheme.outline,
                        MaterialTheme.shapes.extraLarge,
                    ),
            )
        }
    }
}

@OptIn(androidx.compose.foundation.layout.ExperimentalLayoutApi::class)
@Composable
private fun FlowChips(options: List<String>, selected: String, onSelect: (String) -> Unit) {
    androidx.compose.foundation.layout.FlowRow(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(0.dp),
    ) {
        options.forEach { option ->
            StudioChip(option, selected = option == selected) { onSelect(option) }
        }
    }
}
