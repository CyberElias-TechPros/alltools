package ng.name.toolz.ui.screens

import android.app.Activity
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalUriHandler
import androidx.compose.ui.unit.dp
import ng.name.toolz.BuildConfig
import ng.name.toolz.ads.AdManager
import ng.name.toolz.data.AppState
import ng.name.toolz.data.allTools
import ng.name.toolz.ui.components.BackRow
import ng.name.toolz.ui.components.Eyebrow
import ng.name.toolz.ui.components.Hairline
import ng.name.toolz.ui.components.StudioButton
import ng.name.toolz.ui.components.StudioChip

@Composable
fun SettingsScreen(onBack: () -> Unit, onReplayOnboarding: () -> Unit) {
    val prefs = AppState.prefs
    val theme by prefs.theme.collectAsState()
    val favorites by prefs.favorites.collectAsState()
    val adFreeUntil by prefs.adFreeUntil.collectAsState()
    val context = LocalContext.current
    val activity = context as? Activity
    val uriHandler = LocalUriHandler.current

    LazyColumn(
        Modifier.fillMaxSize().padding(horizontal = 20.dp),
        contentPadding = androidx.compose.foundation.layout.PaddingValues(bottom = 28.dp),
    ) {
        item {
            Spacer(Modifier.height(8.dp))
            BackRow("Home", onBack)
            Text("Settings", style = MaterialTheme.typography.displaySmall)
            Spacer(Modifier.height(20.dp))
            Hairline()
            Spacer(Modifier.height(18.dp))
        }

        item {
            Eyebrow("Appearance")
            Spacer(Modifier.height(8.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(0.dp)) {
                listOf("system", "light", "dark").forEach { option ->
                    StudioChip(option.replaceFirstChar { it.uppercase() }, selected = theme == option) {
                        prefs.setTheme(option)
                    }
                }
            }
            Spacer(Modifier.height(20.dp))
            Hairline()
            Spacer(Modifier.height(18.dp))
        }

        item {
            Eyebrow("Your data")
            Spacer(Modifier.height(8.dp))
            Text(
                "${favorites.size} saved tools. Favourites, recents and theme live in this app's private storage and are never uploaded.",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
            Spacer(Modifier.height(12.dp))
            StudioButton("Clear recent tools", filled = false) { prefs.clearRecents() }
            Spacer(Modifier.height(18.dp))
            Hairline()
            Spacer(Modifier.height(18.dp))
        }

        item {
            Eyebrow("Advertising")
            Spacer(Modifier.height(8.dp))
            Text(
                if (AdManager.canRequestAds) {
                    "Ads keep Toolz free. They are served by Google AdMob and never sit inside a result."
                } else {
                    "Ad consent has not been granted yet, so no ad requests are made."
                },
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
            Spacer(Modifier.height(12.dp))
            if (activity != null && AdManager.privacyOptionsRequired(activity)) {
                StudioButton("Change ad consent", filled = false) {
                    AdManager.showPrivacyOptions(activity)
                }
                Spacer(Modifier.height(10.dp))
            }
            Row(Modifier.fillMaxWidth()) {
                Column(Modifier.weight(1f)) {
                    StudioButton("Watch an ad, hide banners for 1 hour", filled = false) {
                        if (activity != null) {
                            AdManager.showRewarded(activity) { prefs.grantAdFree(60) }
                        }
                    }
                }
            }
            if (adFreeUntil > System.currentTimeMillis()) {
                Spacer(Modifier.height(8.dp))
                Text(
                    "Banners are hidden for a while. Thanks for supporting Toolz.",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
            Spacer(Modifier.height(18.dp))
            Hairline()
            Spacer(Modifier.height(18.dp))
        }

        item {
            Eyebrow("Getting started")
            Spacer(Modifier.height(8.dp))
            Text(
                "The tour explains search, saved tools and how results are calculated.",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
            Spacer(Modifier.height(10.dp))
            StudioButton("Replay the tour", filled = false) { onReplayOnboarding() }
            Spacer(Modifier.height(18.dp))
            Hairline()
            Spacer(Modifier.height(18.dp))
        }

        item {
            Eyebrow("About")
            Spacer(Modifier.height(8.dp))
            Text("Toolz ${BuildConfig.VERSION_NAME}", style = MaterialTheme.typography.titleMedium)
            Spacer(Modifier.height(6.dp))
            Text(
                "${allTools.size} tools, every one computed on this device. No account, no uploads, no tracking of what you calculate.",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
            Spacer(Modifier.height(10.dp))
            StudioButton("Open toolz.name.ng in a browser", filled = false) {
                uriHandler.openUri("https://toolz.name.ng")
            }
            Spacer(Modifier.height(8.dp))
            StudioButton("Read the privacy policy", filled = false) {
                uriHandler.openUri("https://toolz.name.ng/privacy-policy/")
            }
            Spacer(Modifier.height(10.dp))
            Text(
                "The website carries the full catalogue of 254 tools. This app ships ${allTools.size} of them natively; the rest are file-based tools that need a picker and an export step.",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
            Spacer(Modifier.height(6.dp))
            Text(
                "Publisher: Toolz",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
            Spacer(Modifier.height(18.dp))
        }
    }
}
