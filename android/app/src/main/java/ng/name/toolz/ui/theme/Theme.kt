package ng.name.toolz.ui.theme

import android.app.Activity
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Shapes
import androidx.compose.material3.Typography
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalView
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.view.WindowCompat

/**
 * Studio tokens — the same cream / ink / vermilion language as the website.
 * Deliberately squared off: 10dp corners, hairline rules, no floating cards.
 */
object Studio {
    val Cream = Color(0xFFF8F7F3)
    val Paper = Color(0xFFFFFEFA)
    val Ink = Color(0xFF15161A)
    val InkSoft = Color(0xFF4A4B52)
    val InkMute = Color(0xFF7A7B84)
    val Line = Color(0xFFE2DFD6)
    val LineStrong = Color(0xFFC9C5B8)
    val Vermilion = Color(0xFFD64E18)
    val VermilionDark = Color(0xFFB8400F)
    val Ochre = Color(0xFFB98900)
    val Moss = Color(0xFF3F6B4A)
    val Night = Color(0xFF0C0D10)
    val NightRaised = Color(0xFF15171C)
    val NightLine = Color(0xFF2A2D35)
    val NightInk = Color(0xFFF3F1EA)
    val NightMute = Color(0xFF9EA0A9)
}

private val LightScheme = lightColorScheme(
    primary = Studio.Vermilion,
    onPrimary = Color.White,
    primaryContainer = Color(0xFFFBE4D9),
    onPrimaryContainer = Studio.VermilionDark,
    secondary = Studio.Ink,
    onSecondary = Color.White,
    background = Studio.Cream,
    onBackground = Studio.Ink,
    surface = Studio.Paper,
    onSurface = Studio.Ink,
    surfaceVariant = Color(0xFFF1EFE7),
    onSurfaceVariant = Studio.InkSoft,
    outline = Studio.LineStrong,
    outlineVariant = Studio.Line,
    error = Color(0xFFB3261E),
)

private val DarkScheme = darkColorScheme(
    primary = Color(0xFFFF7A45),
    onPrimary = Color(0xFF2A0D00),
    primaryContainer = Color(0xFF4A1B06),
    onPrimaryContainer = Color(0xFFFFD9C7),
    secondary = Studio.NightInk,
    onSecondary = Studio.Night,
    background = Studio.Night,
    onBackground = Studio.NightInk,
    surface = Studio.NightRaised,
    onSurface = Studio.NightInk,
    surfaceVariant = Color(0xFF1E2128),
    onSurfaceVariant = Studio.NightMute,
    outline = Studio.NightLine,
    outlineVariant = Color(0xFF23262D),
    error = Color(0xFFFFB4AB),
)

private val Display = FontFamily.Serif

private val ToolzTypography = Typography(
    displayLarge = TextStyle(fontFamily = Display, fontWeight = FontWeight.Normal, fontSize = 44.sp, lineHeight = 46.sp, letterSpacing = (-1.2).sp),
    displaySmall = TextStyle(fontFamily = Display, fontWeight = FontWeight.Normal, fontSize = 32.sp, lineHeight = 36.sp, letterSpacing = (-0.6).sp),
    headlineMedium = TextStyle(fontFamily = Display, fontWeight = FontWeight.Normal, fontSize = 26.sp, lineHeight = 30.sp, letterSpacing = (-0.3).sp),
    titleLarge = TextStyle(fontFamily = Display, fontWeight = FontWeight.Medium, fontSize = 20.sp, lineHeight = 26.sp),
    titleMedium = TextStyle(fontWeight = FontWeight.SemiBold, fontSize = 15.sp, lineHeight = 20.sp),
    bodyLarge = TextStyle(fontSize = 16.sp, lineHeight = 24.sp),
    bodyMedium = TextStyle(fontSize = 14.sp, lineHeight = 21.sp),
    bodySmall = TextStyle(fontSize = 12.5.sp, lineHeight = 18.sp),
    labelLarge = TextStyle(fontWeight = FontWeight.SemiBold, fontSize = 13.sp, letterSpacing = 0.2.sp),
    labelSmall = TextStyle(fontWeight = FontWeight.Medium, fontSize = 11.sp, letterSpacing = 1.4.sp),
)

private val ToolzShapes = Shapes(
    extraSmall = androidx.compose.foundation.shape.RoundedCornerShape(6.dp),
    small = androidx.compose.foundation.shape.RoundedCornerShape(8.dp),
    medium = androidx.compose.foundation.shape.RoundedCornerShape(10.dp),
    large = androidx.compose.foundation.shape.RoundedCornerShape(14.dp),
    extraLarge = androidx.compose.foundation.shape.RoundedCornerShape(18.dp),
)

/** True when the studio palette is on its dark side. */
val LocalDarkSurface = staticCompositionLocalOf { false }

@Composable
fun ToolzTheme(
    dark: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit,
) {
    val scheme = if (dark) DarkScheme else LightScheme
    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as? Activity)?.window ?: return@SideEffect
            WindowCompat.getInsetsController(window, view).apply {
                isAppearanceLightStatusBars = !dark
                isAppearanceLightNavigationBars = !dark
            }
        }
    }
    androidx.compose.runtime.CompositionLocalProvider(LocalDarkSurface provides dark) {
        MaterialTheme(
            colorScheme = scheme,
            typography = ToolzTypography,
            shapes = ToolzShapes,
            content = content,
        )
    }
}
