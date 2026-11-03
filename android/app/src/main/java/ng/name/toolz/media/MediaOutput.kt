package ng.name.toolz.media

import android.graphics.Bitmap

/** What a media tool hands back: a headline, the workings, and maybe a file. */
data class MediaOutput(
    val label: String,
    val summary: String,
    val details: List<Pair<String, String>> = emptyList(),
    val preview: Bitmap? = null,
    val bytes: ByteArray? = null,
    val mime: String? = null,
    val fileName: String? = null,
    val error: String? = null,
) {
    val hasFile: Boolean get() = bytes != null && mime != null
}

/** A failure the user can act on, as opposed to a bug. */
class MediaError(message: String) : IllegalArgumentException(message)
