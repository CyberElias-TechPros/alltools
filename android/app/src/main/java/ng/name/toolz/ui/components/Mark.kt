package ng.name.toolz.ui.components

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.size
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.unit.dp
import ng.name.toolz.ui.theme.Studio

/**
 * The Toolz mark: a calibration cross inside a circle. It reads as a measuring
 * instrument rather than a generic app glyph, and it survives being 16dp.
 */
@Composable
fun ToolzMark(
    modifier: Modifier = Modifier,
    size: Int = 56,
    ink: Color = Studio.Ink,
    accent: Color = Studio.Vermilion,
) {
    Canvas(modifier.size(size.dp)) {
        val radius = this.size.minDimension / 2f
        val centre = Offset(this.size.width / 2f, this.size.height / 2f)
        drawCircle(color = ink, radius = radius * 0.94f, style = Stroke(width = radius * 0.09f))
        drawLine(
            color = ink,
            start = Offset(centre.x, centre.y - radius * 0.62f),
            end = Offset(centre.x, centre.y + radius * 0.62f),
            strokeWidth = radius * 0.09f,
            cap = StrokeCap.Round,
        )
        drawLine(
            color = accent,
            start = Offset(centre.x - radius * 0.62f, centre.y),
            end = Offset(centre.x + radius * 0.62f, centre.y),
            strokeWidth = radius * 0.09f,
            cap = StrokeCap.Round,
        )
        drawCircle(color = accent, radius = radius * 0.16f, center = centre)
    }
}
