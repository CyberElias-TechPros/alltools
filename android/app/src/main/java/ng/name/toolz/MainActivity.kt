package ng.name.toolz

import android.app.Activity
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.safeDrawingPadding
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import ng.name.toolz.ads.AdManager
import ng.name.toolz.data.AppState
import ng.name.toolz.data.toolBySlug
import ng.name.toolz.ui.screens.AllToolsScreen
import ng.name.toolz.ui.screens.CategoryScreen
import ng.name.toolz.ui.screens.HomeScreen
import ng.name.toolz.ui.screens.OnboardingScreen
import ng.name.toolz.ui.screens.SearchScreen
import ng.name.toolz.ui.screens.SettingsScreen
import ng.name.toolz.ui.screens.ToolScreen
import ng.name.toolz.ui.theme.ToolzTheme

class MainActivity : ComponentActivity() {

    private var startedOnce = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        AppState.attach(this)
        AdManager.start(this) { }
        setContent {
            ToolzRoot()
        }
    }

    override fun onStart() {
        super.onStart()
        if (BuildConfig.DEBUG) return
        if (!startedOnce) {
            startedOnce = true
            AdManager.loadAppOpen(this)
        } else if (!AppState.prefs.adsSuppressed()) {
            AdManager.showAppOpen(this)
        }
    }
}

@Composable
private fun ToolzRoot() {
    val prefs = AppState.prefs
    val theme by prefs.theme.collectAsState()
    val dark = when (theme) {
        "light" -> false
        "dark" -> true
        else -> isSystemInDarkTheme()
    }
    ToolzTheme(dark = dark) {
        ToolzNav()
    }
}

@Composable
private fun ToolzNav() {
    val nav = rememberNavController()
    val prefs = AppState.prefs
    val activity = LocalContext.current as? Activity
    val start = if (prefs.onboarded.value) "home" else "onboarding"

    Box(Modifier.fillMaxSize().safeDrawingPadding()) {
    NavHost(navController = nav, startDestination = start) {
        composable("onboarding") {
            OnboardingScreen(onFinish = {
                prefs.setOnboarded()
                nav.navigate("home") {
                    popUpTo("onboarding") { inclusive = true }
                }
            })
        }
        composable("home") {
            HomeScreen(
                onOpenTool = { slug -> nav.navigate("tool/$slug") },
                onOpenCategory = { id -> nav.navigate("category/$id") },
                onOpenSearch = { nav.navigate("search") },
                onOpenAll = { nav.navigate("all") },
                onOpenSettings = { nav.navigate("settings") },
            )
        }
        composable("search") {
            SearchScreen(
                onBack = { nav.popBackStack() },
                onOpenTool = { slug -> nav.navigate("tool/$slug") },
            )
        }
        composable("all") {
            AllToolsScreen(
                onBack = { nav.popBackStack() },
                onOpenTool = { slug -> nav.navigate("tool/$slug") },
            )
        }
        composable("settings") {
            SettingsScreen(
                onBack = { nav.popBackStack() },
                onReplayOnboarding = { nav.navigate("onboarding") },
            )
        }
        composable(
            route = "category/{id}",
            arguments = listOf(navArgument("id") { type = NavType.StringType }),
        ) { entry ->
            CategoryScreen(
                categoryId = entry.arguments?.getString("id").orEmpty(),
                onBack = { nav.popBackStack() },
                onOpenTool = { slug -> nav.navigate("tool/$slug") },
            )
        }
        composable(
            route = "tool/{slug}",
            arguments = listOf(navArgument("slug") { type = NavType.StringType }),
        ) { entry ->
            val slug = entry.arguments?.getString("slug").orEmpty()
            val tool = toolBySlug(slug)
            if (tool == null) {
                AllToolsScreen(
                    onBack = { nav.popBackStack() },
                    onOpenTool = { next -> nav.navigate("tool/$next") },
                )
            } else {
                ToolScreen(
                    tool = tool,
                    onBack = {
                        if (activity != null && !prefs.adsSuppressed()) {
                            AdManager.maybeShowInterstitial(activity) { nav.popBackStack() }
                        } else {
                            nav.popBackStack()
                        }
                    },
                    onOpenCategory = { id -> nav.navigate("category/$id") },
                )
            }
        }
    }
    }
}
