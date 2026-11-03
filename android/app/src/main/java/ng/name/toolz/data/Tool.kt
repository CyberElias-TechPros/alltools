package ng.name.toolz.data

import java.util.Locale
import kotlin.math.abs
import kotlin.math.round

/** How a field is rendered on a tool screen. */
enum class FieldKind { TEXT, NUMBER, DECIMAL, MULTILINE, SELECT, TOGGLE }

data class FieldSpec(
    val id: String,
    val label: String,
    val kind: FieldKind = FieldKind.DECIMAL,
    val placeholder: String = "",
    val defaultValue: String = "",
    val options: List<String> = emptyList(),
    val suffix: String = "",
)

/** The single answer a tool produces, plus the workings underneath it. */
data class ToolResult(
    val label: String,
    val value: String,
    val details: List<Pair<String, String>> = emptyList(),
    val note: String? = null,
    val error: String? = null,
)

data class Tool(
    val slug: String,
    val title: String,
    val tagline: String,
    val category: String,
    val keywords: List<String> = emptyList(),
    val fields: List<FieldSpec>,
    val compute: (Map<String, String>) -> ToolResult,
    /** Non-null when the tool needs a file: the UI then opens the media screen. */
    val media: MediaKind? = null,
)

data class ToolCategory(
    val id: String,
    val title: String,
    val blurb: String,
)

/* ---------- shared helpers used by every tool ---------- */

fun field(
    id: String,
    label: String,
    kind: FieldKind = FieldKind.DECIMAL,
    placeholder: String = "",
    default: String = "",
    options: List<String> = emptyList(),
    suffix: String = "",
): FieldSpec = FieldSpec(id, label, kind, placeholder, default, options, suffix)

internal val rng = java.util.Random()

fun Map<String, String>.num(key: String): Double? = this[key]?.trim()?.replace(",", "")?.toDoubleOrNull()
fun Map<String, String>.num(key: String, fallback: Double): Double = num(key) ?: fallback
fun Map<String, String>.text(key: String): String = this[key]?.trim().orEmpty()
fun Map<String, String>.flag(key: String): Boolean = this[key] == "true"

/** 1234.5 -> "1,234.5" ; trailing zeros trimmed. */
fun fmt(value: Double, digits: Int = 2): String {
    if (!value.isFinite()) return "—"
    var s = String.format(Locale.US, "%,.${digits}f", value)
    if (s.contains('.')) s = s.trimEnd('0').trimEnd('.')
    return s
}

fun fmt(value: Long): String = String.format(Locale.US, "%,d", value)

fun pct(value: Double, digits: Int = 2): String = "${fmt(value, digits)}%"

fun money(value: Double, symbol: String = "$"): String = "$symbol${fmt(abs(value), 2)}".let {
    if (value < 0) "-$it" else it
}

fun round2(value: Double): Double = round(value * 100) / 100

fun err(message: String) = ToolResult(label = "Check your input", value = "—", error = message)

fun requireNumber(value: Double?, message: String): Double =
    value ?: throw IllegalArgumentException(message)

/** How a tool gets its input when it is not typed numbers and text. */
enum class MediaKind { NONE, IMAGE, PDF, PDF_MULTI, DOCX }
