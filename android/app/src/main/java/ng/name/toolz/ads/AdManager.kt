package ng.name.toolz.ads

import android.app.Activity
import android.content.Context
import androidx.compose.runtime.getValue
import androidx.compose.runtime.setValue
import com.google.android.gms.ads.AdError
import com.google.android.gms.ads.AdRequest
import com.google.android.gms.ads.FullScreenContentCallback
import com.google.android.gms.ads.LoadAdError
import com.google.android.gms.ads.MobileAds
import com.google.android.gms.ads.appopen.AppOpenAd
import com.google.android.gms.ads.interstitial.InterstitialAd
import com.google.android.gms.ads.interstitial.InterstitialAdLoadCallback
import com.google.android.gms.ads.rewarded.RewardedAd
import com.google.android.gms.ads.rewarded.RewardedAdLoadCallback
import com.google.android.gms.ads.rewardedinterstitial.RewardedInterstitialAd
import com.google.android.gms.ads.rewardedinterstitial.RewardedInterstitialAdLoadCallback
import com.google.android.ump.ConsentDebugSettings
import com.google.android.ump.ConsentInformation
import com.google.android.ump.ConsentRequestParameters
import com.google.android.ump.UserMessagingPlatform
import ng.name.toolz.BuildConfig
import java.util.concurrent.atomic.AtomicBoolean

/**
 * One place for every AdMob interaction.
 *
 * Debug builds use Google's published sample unit ids so a developer can never
 * click their own live ad and get the account suspended; release builds use the
 * Toolz units. Ads are only requested once consent allows it, and every
 * placement is capped so the app stays usable.
 */
object AdManager {

    /* Live units. */
    private const val LIVE_APP_OPEN = "ca-app-pub-5010473500037610/6094235596"
    private const val LIVE_BANNER = "ca-app-pub-5010473500037610/2294591387"
    private const val LIVE_INTERSTITIAL = "ca-app-pub-5010473500037610/3147848914"
    private const val LIVE_NATIVE = "ca-app-pub-5010473500037610/3416101366"
    private const val LIVE_REWARDED = "ca-app-pub-5010473500037610/2169809168"
    private const val LIVE_REWARDED_INTERSTITIAL = "ca-app-pub-5010473500037610/1834767245"

    /* Google sample units, used by debug builds only. */
    private const val TEST_APP_OPEN = "ca-app-pub-3940256099942544/9257395921"
    private const val TEST_BANNER = "ca-app-pub-3940256099942544/9214589741"
    private const val TEST_INTERSTITIAL = "ca-app-pub-3940256099942544/1033173712"
    private const val TEST_NATIVE = "ca-app-pub-3940256099942544/2247696110"
    private const val TEST_REWARDED = "ca-app-pub-3940256099942544/5224354917"
    private const val TEST_REWARDED_INTERSTITIAL = "ca-app-pub-3940256099942544/5354046379"

    private fun pick(live: String, test: String) = if (BuildConfig.DEBUG) test else live

    val appOpenUnit: String get() = pick(LIVE_APP_OPEN, TEST_APP_OPEN)
    val bannerUnit: String get() = pick(LIVE_BANNER, TEST_BANNER)
    val interstitialUnit: String get() = pick(LIVE_INTERSTITIAL, TEST_INTERSTITIAL)
    val nativeUnit: String get() = pick(LIVE_NATIVE, TEST_NATIVE)
    val rewardedUnit: String get() = pick(LIVE_REWARDED, TEST_REWARDED)
    val rewardedInterstitialUnit: String get() = pick(LIVE_REWARDED_INTERSTITIAL, TEST_REWARDED_INTERSTITIAL)

    @Volatile
    var initialised: Boolean = false
        private set

    /**
     * Backed by Compose state so ad slots appear as soon as consent resolves,
     * without a manual refresh.
     */
    var canRequestAds: Boolean by androidx.compose.runtime.mutableStateOf(false)
        private set

    private val starting = AtomicBoolean(false)

    /** Consent first, then the SDK. Never the other way round. */
    fun start(activity: Activity, onReady: () -> Unit) {
        val information = UserMessagingPlatform.getConsentInformation(activity)
        val builder = ConsentRequestParameters.Builder()
        if (BuildConfig.DEBUG) {
            builder.setConsentDebugSettings(
                ConsentDebugSettings.Builder(activity).build(),
            )
        }
        information.requestConsentInfoUpdate(
            activity,
            builder.build(),
            {
                UserMessagingPlatform.loadAndShowConsentFormIfRequired(activity) {
                    canRequestAds = information.canRequestAds()
                    finishInit(activity, onReady)
                }
            },
            {
                canRequestAds = information.canRequestAds()
                finishInit(activity, onReady)
            },
        )
    }

    private fun finishInit(context: Context, onReady: () -> Unit) {
        if (canRequestAds && starting.compareAndSet(false, true)) {
            MobileAds.initialize(context) { initialised = true }
        }
        onReady()
    }

    /** Ads are allowed only with consent and outside a rewarded ad-free window. */
    fun adsAllowed(): Boolean {
        if (!canRequestAds) return false
        return try {
            !ng.name.toolz.data.AppState.prefs.adsSuppressed()
        } catch (error: UninitializedPropertyAccessException) {
            true
        }
    }

    fun consentInformation(activity: Activity): ConsentInformation =
        UserMessagingPlatform.getConsentInformation(activity)

    fun privacyOptionsRequired(activity: Activity): Boolean =
        consentInformation(activity).privacyOptionsRequirementStatus ==
            ConsentInformation.PrivacyOptionsRequirementStatus.REQUIRED

    fun showPrivacyOptions(activity: Activity) {
        UserMessagingPlatform.showPrivacyOptionsForm(activity) { }
    }

    /* ---------- full-screen formats ---------- */

    private var interstitial: InterstitialAd? = null
    private var interstitialLoading = false
    private var toolOpens = 0
    private var lastInterstitialAt = 0L

    fun loadInterstitial(context: Context) {
        if (!canRequestAds || interstitial != null || interstitialLoading) return
        interstitialLoading = true
        InterstitialAd.load(
            context.applicationContext,
            interstitialUnit,
            AdRequest.Builder().build(),
            object : InterstitialAdLoadCallback() {
                override fun onAdLoaded(ad: InterstitialAd) {
                    interstitialLoading = false
                    interstitial = ad
                }

                override fun onAdFailedToLoad(error: LoadAdError) {
                    interstitialLoading = false
                    interstitial = null
                }
            },
        )
    }

    /**
     * Shown at a natural break — after the third tool of a session, then no
     * more than once every two minutes. Never on a tool's first open.
     */
    fun countToolOpen(context: Context) {
        toolOpens++
        if (toolOpens >= 3) loadInterstitial(context)
    }

    fun maybeShowInterstitial(activity: Activity, onDismissed: () -> Unit = {}) {
        val ad = interstitial ?: return onDismissed()
        val now = System.currentTimeMillis()
        if (now - lastInterstitialAt < 120_000) return onDismissed()
        lastInterstitialAt = now
        interstitial = null
        ad.fullScreenContentCallback = object : FullScreenContentCallback() {
            override fun onAdDismissedFullScreenContent() {
                loadInterstitial(activity)
                onDismissed()
            }

            override fun onAdFailedToShowFullScreenContent(error: AdError) {
                loadInterstitial(activity)
                onDismissed()
            }
        }
        ad.show(activity)
    }

    /* ---------- app open ---------- */

    private var appOpen: AppOpenAd? = null
    private var appOpenLoading = false

    fun loadAppOpen(context: Context) {
        if (!canRequestAds || appOpen != null || appOpenLoading) return
        appOpenLoading = true
        AppOpenAd.load(
            context.applicationContext,
            appOpenUnit,
            AdRequest.Builder().build(),
            object : AppOpenAd.AppOpenAdLoadCallback() {
                override fun onAdLoaded(ad: AppOpenAd) {
                    appOpenLoading = false
                    appOpen = ad
                }

                override fun onAdFailedToLoad(error: LoadAdError) {
                    appOpenLoading = false
                    appOpen = null
                }
            },
        )
    }

    /** Returns true when an ad took over the screen. */
    fun showAppOpen(activity: Activity): Boolean {
        if (!canRequestAds) return false
        val ad = appOpen ?: run { loadAppOpen(activity); return false }
        appOpen = null
        ad.fullScreenContentCallback = object : FullScreenContentCallback() {
            override fun onAdDismissedFullScreenContent() = loadAppOpen(activity)
            override fun onAdFailedToShowFullScreenContent(error: AdError) = loadAppOpen(activity)
        }
        ad.show(activity)
        return true
    }

    /* ---------- rewarded ---------- */

    fun showRewarded(activity: Activity, onReward: () -> Unit) {
        if (!canRequestAds) return
        RewardedAd.load(
            activity.applicationContext,
            rewardedUnit,
            AdRequest.Builder().build(),
            object : RewardedAdLoadCallback() {
                override fun onAdLoaded(ad: RewardedAd) {
                    ad.fullScreenContentCallback = object : FullScreenContentCallback() {
                        override fun onAdDismissedFullScreenContent() = Unit
                    }
                    ad.show(activity) { onReward() }
                }

                override fun onAdFailedToLoad(error: LoadAdError) = Unit
            },
        )
    }

    fun showRewardedInterstitial(activity: Activity, onReward: () -> Unit) {
        if (!canRequestAds) return
        RewardedInterstitialAd.load(
            activity.applicationContext,
            rewardedInterstitialUnit,
            AdRequest.Builder().build(),
            object : RewardedInterstitialAdLoadCallback() {
                override fun onAdLoaded(ad: RewardedInterstitialAd) {
                    ad.fullScreenContentCallback = object : FullScreenContentCallback() {
                        override fun onAdDismissedFullScreenContent() = Unit
                    }
                    ad.show(activity) { onReward() }
                }

                override fun onAdFailedToLoad(error: LoadAdError) = Unit
            },
        )
    }
}
