package ng.name.toolz.media

import android.content.Context
import ng.name.toolz.data.Tool

/** Sends a media tool to the engine that can actually run it. */
object MediaEngine {

    private val PDF_SLUGS = setOf(
        "text-to-pdf", "docx-to-pdf", "jpg-to-pdf", "png-to-pdf", "pdf-page-counter",
        "pdf-metadata", "pdf-to-text", "word-counter-pdf", "document-word-counter",
        "pdf-to-jpg", "pdf-to-png", "pdf-page-extractor", "pdf-merger", "pdf-splitter",
        "pdf-rotator", "pdf-reorder", "pdf-watermark", "pdf-compressor", "pdf-size-reducer",
    )

    /** 40 MB is more than any phone needs for these tools and keeps memory honest. */
    const val MAX_INPUT_BYTES: Int = 40 * 1024 * 1024

    fun run(
        context: Context,
        tool: Tool,
        options: Map<String, String>,
        inputs: List<Pair<String, ByteArray>>,
    ): MediaOutput = try {
        if (tool.slug in PDF_SLUGS) {
            PdfEngine.run(context, tool.slug, options, inputs)
        } else {
            val input = inputs.firstOrNull()
            ImageEngine.run(
                slug = tool.slug,
                options = options,
                input = input?.second ?: ByteArray(0),
                name = input?.first ?: "image",
            )
        }
    } catch (error: MediaError) {
        MediaOutput("Could not do that", "—", error = error.message ?: "That file could not be used.")
    } catch (error: OutOfMemoryError) {
        MediaOutput("Too large", "—", error = "That file is too big to process on this phone. Try a smaller image.")
    } catch (error: Throwable) {
        MediaOutput("Could not do that", "—", error = error.message ?: error.javaClass.simpleName)
    }
}
