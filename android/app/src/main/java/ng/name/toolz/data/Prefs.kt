package ng.name.toolz.data

import android.content.Context
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

/**
 * All local state. Nothing here leaves the device — there is no account,
 * no sync and no server, so favourites and history are the only persistence.
 */
class AppPrefs(context: Context) {

    private val store = context.getSharedPreferences("toolz.prefs", Context.MODE_PRIVATE)

    private val _favorites = MutableStateFlow(store.getStringSet(KEY_FAVORITES, emptySet())!!.toSet())
    val favorites: StateFlow<Set<String>> = _favorites.asStateFlow()

    private val _recents = MutableStateFlow(
        store.getString(KEY_RECENTS, "").orEmpty().split(",").filter { it.isNotBlank() },
    )
    val recents: StateFlow<List<String>> = _recents.asStateFlow()

    private val _onboarded = MutableStateFlow(store.getBoolean(KEY_ONBOARDED, false))
    val onboarded: StateFlow<Boolean> = _onboarded.asStateFlow()

    private val _theme = MutableStateFlow(store.getString(KEY_THEME, "system") ?: "system")
    val theme: StateFlow<String> = _theme.asStateFlow()

    private val _adFreeUntil = MutableStateFlow(store.getLong(KEY_AD_FREE_UNTIL, 0L))
    val adFreeUntil: StateFlow<Long> = _adFreeUntil.asStateFlow()

    fun isFavorite(slug: String): Boolean = _favorites.value.contains(slug)

    fun toggleFavorite(slug: String) {
        val next = _favorites.value.toMutableSet()
        if (!next.add(slug)) next.remove(slug)
        _favorites.value = next
        store.edit().putStringSet(KEY_FAVORITES, next).apply()
    }

    fun markVisited(slug: String) {
        val next = (listOf(slug) + _recents.value.filter { it != slug }).take(10)
        _recents.value = next
        store.edit().putString(KEY_RECENTS, next.joinToString(",")).apply()
    }

    fun clearRecents() {
        _recents.value = emptyList()
        store.edit().remove(KEY_RECENTS).apply()
    }

    fun setOnboarded() {
        _onboarded.value = true
        store.edit().putBoolean(KEY_ONBOARDED, true).apply()
    }

    fun setTheme(value: String) {
        _theme.value = value
        store.edit().putString(KEY_THEME, value).apply()
    }

    fun grantAdFree(minutes: Long) {
        val until = System.currentTimeMillis() + minutes * 60_000
        _adFreeUntil.value = until
        store.edit().putLong(KEY_AD_FREE_UNTIL, until).apply()
    }

    fun adsSuppressed(): Boolean = System.currentTimeMillis() < _adFreeUntil.value

    private companion object {
        const val KEY_FAVORITES = "favorites"
        const val KEY_RECENTS = "recents"
        const val KEY_ONBOARDED = "onboarded"
        const val KEY_THEME = "theme"
        const val KEY_AD_FREE_UNTIL = "adFreeUntil"
    }
}

/** Single holder so screens never need to thread preferences through arguments. */
object AppState {
    lateinit var prefs: AppPrefs
        private set

    fun attach(context: Context) {
        if (!::prefs.isInitialized) prefs = AppPrefs(context.applicationContext)
    }
}
