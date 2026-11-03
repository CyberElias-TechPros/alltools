# Toolz for Android

A native Kotlin + Jetpack Compose app — **not** a WebView wrapper. The tools are
Kotlin functions compiled into the APK, so a calculation works in aeroplane mode,
responds in a frame or two, and never sends the values you type anywhere.

```
android/
├── app/src/main/java/ng/name/toolz/
│   ├── MainActivity.kt          navigation graph + activity
│   ├── ToolzApp.kt              Application (attaches local prefs)
│   ├── data/                    the catalogue: pure Kotlin, JVM-testable
│   │   ├── Tool.kt              Tool / FieldSpec / ToolResult + formatting helpers
│   │   ├── CatalogText.kt       text, calculator and money tools
│   │   ├── CatalogMore.kt       developer, everyday, security, study, SEO, business
│   │   ├── ToolCatalog.kt       categories, allTools, search, lookups
│   │   ├── Prefs.kt             favourites, recents, theme, ad-free window
│   │   └── Json.kt              strict JSON reader/writer for the formatter
│   ├── ads/                     AdMob: consent, banner, native, interstitial,
│   │                            app-open, rewarded, rewarded interstitial
│   └── ui/                      theme, components, screens (Home, Category, Tool,
│                                Search, Settings, Onboarding, All tools)
├── app/src/test/java/...        JVM tests over the whole catalogue
├── gradle/libs.versions.toml    version catalogue
└── store/                       listing copy and submission checklist
```

## Why this is a real native app

| Concern | How it is handled here |
| --- | --- |
| Speed | Catalogue is compile-time data; a result is one pure function call. No network round trip, no JS bridge, no splash spinner. |
| Offline | Tools never touch the network. The only traffic is the ad SDK, and only after consent. |
| Platform fit | Edge-to-edge Material 3 with the studio palette, system dark mode, predictive back, dynamic type, TalkBack labels on every control. |
| Depth | 186 tools across eleven collections, including ones that are awkward in a browser tab on a phone. |
| Privacy | No account, no analytics SDK, no uploads. Favourites and recents live in the app's private preferences. |

## Requirements

- JDK 17 (Android Studio's bundled JDK is fine)
- Android SDK Platform 35 + Build Tools 35
- Gradle 8.9 or newer (AGP 8.7.3)

Android Studio: **File → Open → `android/`** and let it sync. It downloads the
Gradle distribution named in `gradle/wrapper/gradle-wrapper.properties` and any
missing SDK packages.

## Building

### On GitHub (wired up, nothing to install)

`.github/workflows/android.yml` runs on every push that touches `android/` and on
demand:

1. JDK 17 + Gradle 8.9
2. `:app:testDebugUnitTest` — the whole catalogue, on the JVM
3. `:app:assembleDebug`, `:app:assembleRelease`, `:app:bundleRelease`
4. Uploads `toolz-aab` and `toolz-apk` as workflow artefacts
5. Prints the tests, package identity, dex count, AdMob app id and SHA-256 of
   each artefact as check-run annotations, so a build can be audited without
   downloading anything

Download from **Actions → Android → newest run**:
<https://github.com/CyberElias-TechPros/alltools/actions/workflows/android.yml>

The newest verified build, with its checksums and package identity, is recorded in
[`dist/LATEST-BUILD.md`](dist/LATEST-BUILD.md).

The release is **unsigned** unless the four signing secrets below are present —
a public repository must never contain a keystore. See
[`dist/README.md`](dist/README.md) and [`scripts/sign-release.sh`](scripts/sign-release.sh).

### Locally

The wrapper scripts (`gradlew`, `gradlew.bat`, `gradle-wrapper.jar`) are generated
by Gradle itself and are intentionally not committed here. Create them once:

```bash
cd android
gradle wrapper --gradle-version 8.9     # needs a system Gradle 8.9+ once
```

Then:

```bash
# Debug APK, installable today
./gradlew :app:assembleDebug
# → app/build/outputs/apk/debug/app-debug.apk

# Release bundle for Google Play and the Samsung Galaxy Store
./gradlew :app:bundleRelease
# → app/build/outputs/bundle/release/app-release.aab

# Release APK for the Galaxy Store (and sideloading)
./gradlew :app:assembleRelease
# → app/build/outputs/apk/release/app-release-unsigned.apk
```

Unit tests (the whole catalogue):

```bash
./gradlew :app:testDebugUnitTest
# report: app/build/reports/tests/testDebugUnitTest/index.html
```

Lint before you ship:

```bash
./gradlew :app:lintRelease
```

## Signing

Nothing secret is committed. Release builds read the keystore from either a
local `android/keystore.properties` (git-ignored) or environment variables:

```properties
# android/keystore.properties
storeFile=/absolute/path/to/toolz-upload.jks
storePassword=…
keyAlias=toolz
keyPassword=…
```

| Property | Environment variable |
| --- | --- |
| `storeFile` | `TOOLZ_KEYSTORE_PATH` |
| `storePassword` | `TOOLZ_KEYSTORE_PASSWORD` |
| `keyAlias` | `TOOLZ_KEY_ALIAS` |
| `keyPassword` | `TOOLZ_KEY_PASSWORD` |

Create the upload key once and keep two offline copies:

```bash
keytool -genkeypair -v -keystore toolz-upload.jks -alias toolz \
  -keyalg RSA -keysize 4096 -validity 10000
```

Without those values the release still assembles — it is simply unsigned, which
is what CI does. **Play App Signing and Galaxy Store both require a signed,
uploaded artefact, so the signing step must happen on a machine that has the
keystore.**

## Advertising

App id `ca-app-pub-5010473500037610~3607673055` is set in `AndroidManifest.xml`.

| Format | Unit id | Where it appears |
| --- | --- | --- |
| App open | `…/6094235596` | Return to foreground (never the first launch) |
| Banner | `…/2294591387` | Foot of a tool screen, below the result |
| Interstitial | `…/3147848914` | After the 3rd tool of a session, at most once every 2 minutes |
| Native advanced | `…/3416101366` | Home, styled as a studio card |
| Rewarded | `…/2169809168` | Settings: “hide banners for 1 hour” |
| Rewarded interstitial | `…/1834767245` | Optional, same reward flow |

Behaviour that matters:

- **Consent first.** `AdManager.start()` runs Google's UMP flow. If consent is
  not granted, no ad is requested at all. Settings re-opens the privacy form
  whenever UMP says it is required.
- **Debug builds use Google's sample unit ids**, so nobody can invalidate the
  account by clicking their own live ads while testing.
- **No ad inside a result, and no ad on first run before onboarding finishes.**
- Rewarded ads only ever unlock something the user asked for (an ad-free hour);
  they never gate a tool or a result.

Before publishing, complete the AdMob “app-ads.txt” and store-listing steps in
`store/README.md`.

## Privacy

The app collects nothing. Google Mobile Ads may collect device identifiers under
its own policy, gated by the consent form. The privacy policy URL used in the
store listing is <https://toolz.name.ng/privacy-policy/>.

## Release checklist

1. Bump `versionCode` / `versionName` in `app/build.gradle.kts`.
2. `./gradlew :app:testDebugUnitTest` and `./gradlew :app:lintRelease` — both clean.
3. Sign and build `bundleRelease` (Play) and `assembleRelease` (Galaxy Store).
4. Install the signed APK on a physical device and check: onboarding, search,
   three tools, favourite, dark mode, rotation, airplane mode, consent form.
5. Upload, then attach the store listing text from `store/LISTING.md`.

## Coverage and what comes next

The app currently ships **186 native tools** in eleven collections, up from 87. The
website carries **254**; the remaining 36 are the file-based tools (19 PDF, 16 image,
1 QR reader) that need a picker-and-export pipeline rather than a pure function.
Every ported tool is a Kotlin function with no WebView in sight, and
[`docs/ANDROID_COVERAGE.md`](../docs/ANDROID_COVERAGE.md) tracks the exact mapping.

Already native and not possible to fake in a browser tab: offline results with no
first-paint cost, a native share/clipboard path, saved tools that survive a cold start,
and ad consent handled by the platform form instead of a cookie banner.

Planned batches, in the order they add the most value:

1. **Money, part two** — currency conversion (needs a rate source, so it is deliberately
   not shipped until a free, licensed feed is chosen), amortisation schedules, unit
   pricing.
2. **Text, part two** — text-to-speech, OCR-free receipt splitting, Markdown preview.
3. **Developer, part two** — JWT verification (needs key handling), regex tester with
   timeout guards, diff viewer with word-level highlighting.
4. **Everyday, part two** — timers that run as notifications, barcode lookups.

The rule is unchanged from the website: nothing appears in `allTools` until it produces
a correct result in a JVM test, and the count on every screen is derived from that list.
