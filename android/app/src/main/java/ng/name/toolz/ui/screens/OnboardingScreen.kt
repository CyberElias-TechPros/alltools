package ng.name.toolz.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.pager.HorizontalPager
import androidx.compose.foundation.pager.rememberPagerState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import kotlinx.coroutines.launch
import ng.name.toolz.data.allTools
import ng.name.toolz.ui.components.Eyebrow
import ng.name.toolz.ui.components.Hairline
import ng.name.toolz.ui.components.StudioButton
import ng.name.toolz.ui.components.ToolzMark
import ng.name.toolz.ui.theme.Studio

private data class Page(val kicker: String, val title: String, val body: String)

private val pages = listOf(
    Page(
        kicker = "Welcome",
        title = "Tools that stay\non your phone.",
        body = "${allTools.size} calculators, converters and text tools. Every answer is worked out on this device — nothing you type is sent anywhere.",
    ),
    Page(
        kicker = "Built for speed",
        title = "Type once.\nRead the answer.",
        body = "Results update as you type, with the workings underneath so you can check the maths. No loading spinner, no sign-up, no cookie wall.",
    ),
    Page(
        kicker = "Yours",
        title = "Save what you\nuse every week.",
        body = "Star a tool and it appears at the top of Home. Recents are kept on the device so you can pick up where you stopped.",
    ),
    Page(
        kicker = "Honest by design",
        title = "Free, because\nads pay for it.",
        body = "Banners sit at the foot of a tool, never inside a result. You can change your ad consent at any time in Settings.",
    ),
)

@Composable
fun OnboardingScreen(onFinish: () -> Unit) {
    val state = rememberPagerState(pageCount = { pages.size })
    val scope = rememberCoroutineScope()

    Column(Modifier.fillMaxSize().padding(horizontal = 24.dp)) {
        Row(
            Modifier.fillMaxWidth().padding(top = 18.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            ToolzMark(size = 30)
            Spacer(Modifier.width(10.dp))
            Text("Toolz", style = MaterialTheme.typography.titleLarge)
            Spacer(Modifier.weight(1f))
            Text(
                "Skip",
                style = MaterialTheme.typography.labelLarge,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.clickable(onClick = onFinish).padding(8.dp),
            )
        }

        HorizontalPager(
            state = state,
            modifier = Modifier.weight(1f).fillMaxWidth(),
            verticalAlignment = Alignment.Top,
        ) { index ->
            val page = pages[index]
            Column(Modifier.fillMaxSize().padding(top = 40.dp)) {
                Eyebrow(page.kicker)
                Spacer(Modifier.height(14.dp))
                Text(page.title, style = MaterialTheme.typography.displayLarge)
                Spacer(Modifier.height(18.dp))
                Hairline()
                Spacer(Modifier.height(18.dp))
                Text(
                    page.body,
                    style = MaterialTheme.typography.bodyLarge,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
                Spacer(Modifier.height(28.dp))
                if (index == 0) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        ToolzMark(size = 84)
                        Spacer(Modifier.width(18.dp))
                        Text(
                            "Calibrated\nfor daily use",
                            style = MaterialTheme.typography.titleMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                        )
                    }
                }
            }
        }

        Row(
            Modifier.fillMaxWidth().padding(vertical = 16.dp),
            horizontalArrangement = Arrangement.spacedBy(6.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            repeat(pages.size) { index ->
                Box(
                    Modifier
                        .size(if (index == state.currentPage) 22.dp else 7.dp, 7.dp)
                        .background(
                            if (index == state.currentPage) Studio.Vermilion else MaterialTheme.colorScheme.outlineVariant,
                            CircleShape,
                        ),
                )
            }
        }

        StudioButton(
            if (state.currentPage == pages.lastIndex) "Start using Toolz" else "Next",
        ) {
            if (state.currentPage == pages.lastIndex) {
                onFinish()
            } else {
                scope.launch { state.animateScrollToPage(state.currentPage + 1) }
            }
        }
        Text(
            "No account needed. ${allTools.size} tools, all offline.",
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            textAlign = TextAlign.Center,
            modifier = Modifier.fillMaxWidth().padding(vertical = 14.dp),
        )
    }
}
