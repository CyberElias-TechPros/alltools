package ng.name.toolz.ui.screens

import android.app.Activity
import android.content.Intent
import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.mutableStateMapOf
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalClipboardManager
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.unit.dp
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import ng.name.toolz.data.FieldKind
import ng.name.toolz.data.MediaKind
import ng.name.toolz.data.Tool
import ng.name.toolz.data.categoryById
import ng.name.toolz.media.MediaEngine
import ng.name.toolz.media.MediaOutput
import ng.name.toolz.media.humanBytes
import ng.name.toolz.ui.components.BackRow
import ng.name.toolz.ui.components.Hairline
import ng.name.toolz.ui.components.ResultPanel
import ng.name.toolz.ui.components.StudioButton
import ng.name.toolz.ui.components.StudioTextField
import ng.name.toolz.ui.components.Eyebrow

/**
 * The file-based tools: pick something, run the pipeline on a background thread,
 * then save the result wherever the user wants it. No permissions are requested
 * because the system picker hands us a URI.
 */
@Composable
fun MediaToolScreen(tool: Tool, onBack: () -> Unit) {
    val context = LocalContext.current
    val clipboard = LocalClipboardManager.current
    val scope = rememberCoroutineScope()
    val values = remember(tool.slug) {
        mutableStateMapOf<String, String>().apply { tool.fields.forEach { put(it.id, it.defaultValue) } }
    }
    var inputs by remember(tool.slug) { mutableStateOf<List<Pair<String, ByteArray>>>(emptyList()) }
    var output by remember(tool.slug) { mutableStateOf<MediaOutput?>(null) }
    var busy by remember { mutableStateOf(false) }
    var note by remember { mutableStateOf<String?>(null) }

    fun read(uri: Uri): Pair<String, ByteArray>? {
        val name = runCatching {
            context.contentResolver.query(uri, null, null, null, null)?.use { cursor ->
                val index = cursor.getColumnIndex(android.provider.OpenableColumns.DISPLAY_NAME)
                if (index >= 0 && cursor.moveToFirst()) cursor.getString(index) else null
            }
        }.getOrNull() ?: uri.lastPathSegment ?: "file"
        val bytes = runCatching { context.contentResolver.openInputStream(uri)?.use { it.readBytes() } }.getOrNull()
        if (bytes == null) {
            note = "That file could not be opened."
            return null
        }
        if (bytes.size > MediaEngine.MAX_INPUT_BYTES) {
            note = "That file is ${humanBytes(bytes.size.toLong())}; the limit is ${humanBytes(MediaEngine.MAX_INPUT_BYTES.toLong())}."
            return null
        }
        return name to bytes
    }

    fun run(current: List<Pair<String, ByteArray>> = inputs) {
        val needsFile = tool.media != MediaKind.NONE
        if (needsFile && current.isEmpty()) {
            note = "Choose a file first."
            return
        }
        busy = true
        note = null
        scope.launch {
            val result = withContext(Dispatchers.IO) {
                MediaEngine.run(context, tool, values.toMap(), current)
            }
            output = result
            busy = false
            if (result.error != null) note = result.error
        }
    }

    val pickOne = rememberLauncherForActivityResult(ActivityResultContracts.OpenDocument()) { uri ->
        if (uri != null) {
            val loaded = read(uri)
            if (loaded != null) {
                inputs = listOf(loaded)
                run(listOf(loaded))
            }
        }
    }

    val pickMany = rememberLauncherForActivityResult(ActivityResultContracts.OpenMultipleDocuments()) { uris ->
        val loaded = uris.mapNotNull { read(it) }
        if (loaded.isNotEmpty()) {
            inputs = loaded
            run(loaded)
        }
    }

    val saveTo = rememberLauncherForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
        if (result.resultCode == Activity.RESULT_OK) {
            val uri = result.data?.data
            val pending = output
            if (uri != null && pending?.bytes != null) {
                val written = runCatching {
                    context.contentResolver.openOutputStream(uri)?.use { it.write(pending.bytes) }
                }
                note = if (written.isSuccess) "Saved." else "The file could not be written there."
            }
        }
    }

    fun askToSave(pending: MediaOutput) {
        val intent = Intent(Intent.ACTION_CREATE_DOCUMENT).apply {
            addCategory(Intent.CATEGORY_OPENABLE)
            type = pending.mime ?: "application/octet-stream"
            putExtra(Intent.EXTRA_TITLE, pending.fileName ?: "toolz-output")
        }
        runCatching { saveTo.launch(intent) }.onFailure { note = "This phone has no file picker for that type." }
    }

    val accept = when (tool.media) {
        MediaKind.IMAGE -> arrayOf("image/*")
        MediaKind.PDF, MediaKind.PDF_MULTI -> arrayOf("application/pdf")
        MediaKind.DOCX -> arrayOf(
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/octet-stream",
        )
        else -> arrayOf("*/*")
    }

    LazyColumn(
        Modifier.fillMaxSize().padding(horizontal = 20.dp),
        contentPadding = PaddingValues(bottom = 28.dp),
    ) {
        item {
            Spacer(Modifier.height(8.dp))
            BackRow(categoryById(tool.category)?.title ?: "Tools", onBack)
            Text(tool.title, style = MaterialTheme.typography.displaySmall)
            Spacer(Modifier.height(6.dp))
            Text(
                tool.tagline,
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
            Spacer(Modifier.height(18.dp))
        }

        if (tool.media == MediaKind.PDF_MULTI) {
            item {
                StudioButton("Choose PDFs", filled = true) { pickMany.launch(accept) }
                Spacer(Modifier.height(14.dp))
            }
        } else if (tool.media != MediaKind.NONE) {
            item {
                StudioButton(if (inputs.isEmpty()) "Choose a file" else "Choose another file", filled = true) {
                    pickOne.launch(accept)
                }
                Spacer(Modifier.height(14.dp))
            }
        }

        if (inputs.isNotEmpty()) {
            item {
                Eyebrow(inputs.joinToString(", ") { it.first })
                Spacer(Modifier.height(12.dp))
            }
        }

        if (tool.fields.isNotEmpty()) {
            item {
                Column {
                    tool.fields.forEach { spec ->
                        when (spec.kind) {
                            FieldKind.SELECT -> {
                                Text(spec.label, style = MaterialTheme.typography.labelMedium)
                                Spacer(Modifier.height(6.dp))
                                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                    spec.options.forEach { option ->
                                        SelectablePill(
                                            label = option,
                                            selected = values[spec.id] == option,
                                        ) { values[spec.id] = option }
                                    }
                                }
                                Spacer(Modifier.height(14.dp))
                            }
                            FieldKind.TOGGLE -> {
                                Row(verticalAlignment = androidx.compose.ui.Alignment.CenterVertically) {
                                    Text(spec.label, style = MaterialTheme.typography.labelMedium, modifier = Modifier.weight(1f))
                                    SelectablePill(
                                        label = if (values[spec.id] == "true") "On" else "Off",
                                        selected = values[spec.id] == "true",
                                    ) { values[spec.id] = if (values[spec.id] == "true") "false" else "true" }
                                }
                                Spacer(Modifier.height(14.dp))
                            }
                            else -> {
                                Text(spec.label, style = MaterialTheme.typography.labelMedium)
                                Spacer(Modifier.height(6.dp))
                                StudioTextField(
                                    value = values[spec.id].orEmpty(),
                                    onValueChange = { values[spec.id] = it },
                                    placeholder = if (spec.placeholder.isEmpty()) spec.label else spec.placeholder,
                                    singleLine = spec.kind != FieldKind.MULTILINE,
                                    keyboard = if (spec.kind == FieldKind.NUMBER || spec.kind == FieldKind.DECIMAL) {
                                        androidx.compose.ui.text.input.KeyboardType.Number
                                    } else {
                                        androidx.compose.ui.text.input.KeyboardType.Text
                                    },
                                    minHeight = if (spec.kind == FieldKind.MULTILINE) 140.dp else 0.dp,
                                )
                                Spacer(Modifier.height(14.dp))
                            }
                        }
                    }
                }
            }
        }

        item {
            Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                Column(Modifier.weight(1f)) {
                    StudioButton(if (busy) "Working…" else "Run", filled = true) {
                        if (!busy) run()
                    }
                }
                if (output?.hasFile == true) {
                    Column(Modifier.weight(1f)) {
                        StudioButton("Save file", filled = false) { output?.let { askToSave(it) } }
                    }
                }
            }
            Spacer(Modifier.height(16.dp))
        }

        note?.let { message ->
            item {
                Text(
                    message,
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.error,
                )
                Spacer(Modifier.height(12.dp))
            }
        }

        output?.let { result ->
            if (result.error == null) {
                item {
                    result.preview?.let { bitmap ->
                        Image(
                            bitmap = bitmap.asImageBitmap(),
                            contentDescription = null,
                            contentScale = ContentScale.Fit,
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(220.dp)
                                .background(MaterialTheme.colorScheme.surface, RoundedCornerShape(4.dp)),
                        )
                        Spacer(Modifier.height(14.dp))
                    }
                    ResultPanel(
                        ng.name.toolz.data.ToolResult(
                            label = result.label,
                            value = result.summary,
                            details = result.details,
                            note = if (result.hasFile) "Ready to save: ${result.fileName ?: "file"}" else null,
                        ),
                    )
                    Spacer(Modifier.height(12.dp))
                    Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                        Column(Modifier.weight(1f)) {
                            StudioButton("Copy result", filled = false) {
                                clipboard.setText(AnnotatedString("${result.label}\n${result.summary}"))
                            }
                        }
                        if (result.hasFile) {
                            Column(Modifier.weight(1f)) {
                                StudioButton("Save file", filled = true) { askToSave(result) }
                            }
                        }
                    }
                    Spacer(Modifier.height(18.dp))
                }
            }
        }

        item {
            Hairline()
            Spacer(Modifier.height(10.dp))
            Text(
                "Files are read through the system picker and processed in memory on this phone. Nothing is uploaded, and no storage permission is needed.",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
            Spacer(Modifier.height(16.dp))
        }
    }
}

@Composable
private fun SelectablePill(label: String, selected: Boolean, onClick: () -> Unit) {
    Box(
        Modifier
            .clip(RoundedCornerShape(999.dp))
            .background(if (selected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surface)
            .clickable { onClick() }
            .padding(horizontal = 14.dp, vertical = 8.dp),
    ) {
        Text(
            label,
            style = MaterialTheme.typography.labelMedium,
            color = if (selected) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurface,
        )
    }
}
