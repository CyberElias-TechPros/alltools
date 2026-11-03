package ng.name.toolz.ads

import android.content.Context
import android.graphics.Color as AndroidColor
import android.graphics.Typeface
import android.view.Gravity
import android.widget.Button
import android.widget.LinearLayout
import android.widget.TextView
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.viewinterop.AndroidView
import com.google.android.gms.ads.AdListener
import com.google.android.gms.ads.AdLoader
import com.google.android.gms.ads.AdRequest
import com.google.android.gms.ads.AdSize
import com.google.android.gms.ads.AdView
import com.google.android.gms.ads.LoadAdError
import com.google.android.gms.ads.nativead.MediaView
import com.google.android.gms.ads.nativead.NativeAd
import com.google.android.gms.ads.nativead.NativeAdView

/**
 * Banner at the foot of a tool, above the keyboard. It is the least intrusive
 * of the six formats and is capped to one instance per screen.
 */
@Composable
fun BannerAdSlot(modifier: Modifier = Modifier) {
    if (!AdManager.adsAllowed()) return
    AndroidView(
        modifier = modifier.fillMaxWidth(),
        factory = { context ->
            AdView(context).apply {
                setAdSize(AdSize.BANNER)
                adUnitId = AdManager.bannerUnit
                loadAd(AdRequest.Builder().build())
            }
        },
        onRelease = { view ->
            view.destroy()
        },
    )
}

/**
 * A native ad that matches the studio card: one headline, one line of body
 * copy, an image and a call to action. Rendered with the SDK's own NativeAdView
 * so impressions and clicks are counted correctly.
 */
@Composable
fun NativeAdSlot(modifier: Modifier = Modifier) {
    if (!AdManager.adsAllowed()) return
    val context = androidx.compose.ui.platform.LocalContext.current
    var loaded by remember { mutableStateOf<NativeAd?>(null) }

    LaunchedEffect(Unit) {
        if (loaded != null) return@LaunchedEffect
        AdLoader.Builder(context, AdManager.nativeUnit)
            .forNativeAd { ad -> loaded = ad }
            .withAdListener(object : AdListener() {
                override fun onAdFailedToLoad(error: LoadAdError) {
                    loaded = null
                }
            })
            .build()
            .loadAd(AdRequest.Builder().build())
    }

    val ad = loaded ?: return
    AndroidView(
        modifier = modifier.fillMaxWidth(),
        factory = { ctx -> buildNativeView(ctx, ad) },
        onRelease = { ad.destroy() },
    )
}

private fun buildNativeView(context: Context, ad: NativeAd): NativeAdView {
    val density = context.resources.displayMetrics.density
    fun px(value: Int) = (value * density).toInt()

    val view = NativeAdView(context)
    val column = LinearLayout(context).apply {
        orientation = LinearLayout.VERTICAL
        setBackgroundColor(AndroidColor.WHITE)
        setPadding(px(18), px(14), px(18), px(14))
    }

    val label = TextView(context).apply {
        text = "SPONSORED"
        textSize = 9f
        letterSpacing = 0.12f
        setTextColor(AndroidColor.parseColor("#8A8B93"))
        setTypeface(typeface, Typeface.BOLD)
    }

    val headline = TextView(context).apply {
        text = ad.headline ?: "Sponsored"
        textSize = 16f
        setTextColor(AndroidColor.parseColor("#15161A"))
        setTypeface(typeface, Typeface.BOLD)
        setPadding(0, px(6), 0, 0)
    }

    val body = TextView(context).apply {
        text = ad.body ?: ""
        textSize = 13f
        setTextColor(AndroidColor.parseColor("#4A4B52"))
        setPadding(0, px(4), 0, px(8))
    }

    val media = MediaView(context).apply {
        layoutParams = LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.MATCH_PARENT,
            px(150),
        )
        ad.mediaContent?.let { setMediaContent(it) }
    }

    val cta = Button(context).apply {
        text = ad.callToAction ?: "Learn more"
        textSize = 13f
        isAllCaps = false
        setBackgroundColor(AndroidColor.parseColor("#D64E18"))
        setTextColor(AndroidColor.WHITE)
        gravity = Gravity.CENTER
    }

    column.addView(label)
    column.addView(headline)
    column.addView(body)
    column.addView(media)
    column.addView(
        cta,
        LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.WRAP_CONTENT,
            LinearLayout.LayoutParams.WRAP_CONTENT,
        ).apply { topMargin = px(10) },
    )

    view.addView(column)
    view.setHeadlineView(headline)
    view.setBodyView(body)
    view.setMediaView(media)
    view.setCallToActionView(cta)
    view.setNativeAd(ad)
    return view
}
