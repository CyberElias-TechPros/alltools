# Store submission pack

Everything a store listing needs that can be produced without the owner's
accounts. **Nothing here has been submitted anywhere** — submission needs the
owner's Google Play and Samsung seller accounts, a signed artefact and a final
read of the listing copy.

## Files in this folder

| File | Size | Used for |
| --- | --- | --- |
| `icon-512.png` | 512 × 512 | Play Store icon, Galaxy Store icon |
| `feature-graphic-1024x500.png` | 1024 × 500 | Play Store feature graphic |
| `LISTING.md` | — | Title, short and full description, keywords, data-safety answers |

Screenshots must be captured from a real device or emulator — they are evidence
of how the app actually looks, so they cannot be mocked up. Capture at least
four of these five, in a 1080 × 2400 (or any 9:19.5) frame in **light mode**:

1. Onboarding, first page (“Tools that stay on your phone”).
2. Home with the search field and collection cards.
3. A tool screen with a filled result — the percentage or loan calculator.
4. Search with results for “password”.
5. Settings, showing theme choice and the ad-consent row.

## Before uploading

- [ ] `versionCode` bumped in `app/build.gradle.kts`.
- [ ] Signed `app-release.aab` (Play) and `app-release.apk` (Galaxy Store) built
      from the same commit — see `../README.md`.
- [ ] `./gradlew :app:testDebugUnitTest` and `:app:lintRelease` pass.
- [ ] Tested on a physical device in airplane mode (every tool must still work).
- [ ] Privacy policy live at <https://toolz.name.ng/privacy-policy/> and it
      mentions AdMob, the publisher id and consent.
- [ ] AdMob account approved, `app-ads.txt` published on `toolz.name.ng`, and the
      store listing set as the app's “App store” entry in AdMob.
- [ ] Consent form published in AdMob (UMP) with the same privacy URL.
- [ ] Content rating questionnaire completed (no user content, no purchases,
      contains ads).
- [ ] Data safety form answered as described in `LISTING.md`.
- [ ] Target API 35 declared correctly; Play may raise the requirement over time —
      bump `compileSdk`/`targetSdk` when it does.

## Google Play specifics

- Format: **Android App Bundle (.aab)**.
- Play App Signing: enrol and let Google hold the app signing key; keep the
  upload key offline.
- New personal developer accounts must run a closed test with at least 12
  testers for 14 days before production. Plan for that lead time.
- Families policy does not apply (the app is not directed at children), but do
  not mark it as such if you enable personalised ads.

## Samsung Galaxy Store specifics

- Accepts **APK or AAB**; this project produces both. Upload the signed APK.
- Seller account plus a paid or free app registration; the store also asks for a
  binary review, screenshots and a privacy URL.
- Galaxy Store does not use Play App Signing, so the APK must be signed with the
  same key you intend to keep for future updates.
- Keep the same `applicationId` (`ng.name.toolz`) across both stores. Two stores,
  one app identity.

## What is still blocked outside this repository

| Item | Why it cannot be produced here |
| --- | --- |
| Signed AAB/APK | No JDK or Android SDK in the build sandbox, and the upload keystore belongs to the owner |
| Screenshots | Need a running device/emulator with the app installed |
| Store submission | Requires the owner's Play/Samsung credentials and a final human review |
| Ad revenue | AdMob must approve the app; ads stay in test mode in debug builds until then |
