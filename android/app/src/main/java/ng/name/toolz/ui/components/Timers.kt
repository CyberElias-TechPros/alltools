package ng.name.toolz.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import kotlinx.coroutines.delay
import ng.name.toolz.data.clockText

/**
 * The three timer tools are the only ones that need live state, so they get a
 * real clock instead of a static answer. Counting is driven by wall-clock
 * deltas, so a dropped frame never shortens the countdown.
 */
@Composable
fun TimerPanel(
    slug: String,
    workMinutes: Int,
    restMinutes: Int,
    rounds: Int,
) {
    val isStopwatch = slug == "stopwatch"
    val isPomodoro = slug == "pomodoro-timer"
    val sessionMillis = (workMinutes.coerceIn(1, 600)) * 60_000L

    var remaining by remember(slug, sessionMillis) { mutableStateOf(sessionMillis) }
    var elapsed by remember(slug) { mutableStateOf(0L) }
    var running by remember(slug) { mutableStateOf(false) }
    var round by remember(slug) { mutableStateOf(1) }
    var resting by remember(slug) { mutableStateOf(false) }
    var finished by remember(slug) { mutableStateOf(false) }

    LaunchedEffect(running, resting) {
        var last = System.currentTimeMillis()
        while (running) {
            delay(50)
            val now = System.currentTimeMillis()
            val delta = now - last
            last = now
            if (isStopwatch) {
                elapsed += delta
                continue
            }
            remaining = (remaining - delta).coerceAtLeast(0)
            if (remaining == 0L) {
                running = false
                if (isPomodoro && round < rounds) {
                    resting = !resting
                    round += 1
                    remaining = (if (resting) restMinutes else workMinutes).coerceIn(1, 600) * 60_000L
                    running = true
                } else {
                    finished = true
                }
            }
        }
    }

    val shown = if (isStopwatch) elapsed else remaining
    val status = when {
        finished -> "Finished"
        running && resting -> "Break · round $round of $rounds"
        running && isPomodoro -> "Focus · round $round of $rounds"
        running -> "Running"
        shown != sessionMillis && !isStopwatch && shown != 0L -> "Paused"
        else -> "Ready"
    }

    Column(
        Modifier
            .fillMaxWidth()
            .background(MaterialTheme.colorScheme.surface, RoundedCornerShape(4.dp))
            .padding(20.dp),
    ) {
        Text(
            status.uppercase(),
            style = MaterialTheme.typography.labelSmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
        Spacer(Modifier.height(10.dp))
        Text(
            clockText(shown),
            style = MaterialTheme.typography.displayMedium,
            fontFamily = FontFamily.Monospace,
            textAlign = TextAlign.Start,
            color = MaterialTheme.colorScheme.onSurface,
        )
        Spacer(Modifier.height(18.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(10.dp), verticalAlignment = Alignment.CenterVertically) {
            StudioButton(
                if (running) "Pause" else "Start",
                modifier = Modifier.weight(1f),
                filled = true,
                onClick = {
                    running = !running
                    if (!running) finished = false
                },
            )
            StudioButton(
                "Reset",
                modifier = Modifier.weight(1f),
                filled = false,
                onClick = {
                    running = false
                    finished = false
                    resting = false
                    round = 1
                    elapsed = 0
                    remaining = sessionMillis
                },
            )
        }
    }
}
