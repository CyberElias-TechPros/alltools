package ng.name.toolz.data

/** Clock formatting shared by the timer tools and their on-screen panel. */

internal fun clockText(millis: Long): String {
    val safe = if (millis < 0) 0 else millis
    val totalSeconds = safe / 1000
    val hours = totalSeconds / 3600
    val minutes = (totalSeconds % 3600) / 60
    val seconds = totalSeconds % 60
    val hundredths = (safe % 1000) / 10
    return when {
        hours > 0 -> String.format(java.util.Locale.US, "%d:%02d:%02d", hours, minutes, seconds)
        else -> String.format(java.util.Locale.US, "%02d:%02d.%02d", minutes, seconds, hundredths)
    }
}

internal val timerTools = listOf(
    Tool(
        slug = "countdown-timer", title = "Countdown Timer", category = "everyday",
        tagline = "A countdown you can start, pause and reset on screen.",
        keywords = listOf("timer", "countdown", "alarm"),
        fields = listOf(
            field("minutes", "Minutes", FieldKind.NUMBER, default = "5"),
            field("label", "Label", FieldKind.TEXT, default = "Tea"),
        ),
        compute = { input ->
            val minutes = input.num("minutes") ?: return@Tool err("How many minutes?")
            if (minutes <= 0) return@Tool err("Minutes must be greater than zero.")
            if (minutes > 600) return@Tool err("Ten hours is the ceiling here.")
            val millis = (minutes * 60_000).toLong()
            ToolResult(
                input.text("label").ifEmpty { "Countdown" },
                clockText(millis),
                listOf("Minutes" to fmt(minutes, 2), "Milliseconds" to millis.toString()),
                note = "Press start below. The timer keeps running while the screen is on; it is a kitchen timer, not an alarm clock.",
            )
        },
    ),
    Tool(
        slug = "pomodoro-timer", title = "Pomodoro Timer", category = "everyday",
        tagline = "25 minutes on, 5 off, counted for you.",
        keywords = listOf("pomodoro", "focus", "timer"),
        fields = listOf(
            field("work", "Work minutes", FieldKind.NUMBER, default = "25"),
            field("rest", "Break minutes", FieldKind.NUMBER, default = "5"),
            field("rounds", "Rounds", FieldKind.NUMBER, default = "4"),
        ),
        compute = { input ->
            val work = (input.num("work") ?: 0.0).toInt()
            val rest = (input.num("rest") ?: 0.0).toInt()
            val rounds = (input.num("rounds") ?: 0.0).toInt()
            if (work <= 0 || rest <= 0 || rounds <= 0) return@Tool err("Work, break and rounds must all be greater than zero.")
            if (work > 120 || rest > 60 || rounds > 12) return@Tool err("Keep work under 120 minutes, breaks under 60 and rounds under 12.")
            val focus = work * rounds
            val total = focus + rest * (rounds - 1)
            ToolResult(
                "$focus minutes of focus",
                "Start with $work minutes, then $rest minutes off, repeated $rounds times",
                listOf(
                    "Total time" to "$total minutes",
                    "Clock" to "${total / 60}h ${total % 60}m",
                    "Breaks" to "${rest * (rounds - 1)} minutes",
                ),
                note = "A long break of 15–20 minutes after four rounds is the usual pattern; the timer below runs each round for you.",
            )
        },
    ),
    Tool(
        slug = "stopwatch", title = "Stopwatch", category = "everyday",
        tagline = "Counts up with hundredths, pause and reset.",
        keywords = listOf("stopwatch", "timer", "elapsed"),
        fields = listOf(field("label", "Label", FieldKind.TEXT, default = "Interval run")),
        compute = { input ->
            ToolResult(
                input.text("label").ifEmpty { "Stopwatch" },
                clockText(0),
                listOf("Resolution" to "10 ms", "Format" to "mm:ss.cc"),
                note = "Pause reads the exact elapsed time; reset puts it back to zero. No lap history is kept.",
            )
        },
    ),
)
