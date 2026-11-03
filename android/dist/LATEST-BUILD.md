# Latest verified Android build

Snapshot written after the build that produced these numbers. GitHub Actions
cannot write to this repository (the runner token is read-only), so this file is
updated by hand when a build is verified — always check the run page for the
newest artefacts.

- **Workflow run:** <https://github.com/CyberElias-TechPros/alltools/actions/runs/41593111438>
- **Commit:** `2282063` on `arena/1baa2016-alltools`
- **Conclusion:** success

## Evidence from the run

| Check | Result |
| --- | --- |
| JVM tests | **7 run / 0 failed / 0 errors** (catalogue invariants) |
| Debug APK | 21,180,976 bytes · `ng.name.toolz.debug` · versionCode 1 · targetSdk 35 · 9 permissions |
| Debug APK signature | V2, `CN=Android Debug` — installable today for device testing |
| Release APK (unsigned) | 3,153,634 bytes — R8 shrinking is working |
| AAB | 6,361,948 bytes · 192 entries · 1 dex · `BundleConfig.pb`, `base/manifest/AndroidManifest.xml`, `base/resources.pb` |
| AdMob in manifest | `ca-app-pub-5010473500037610` present in the bundle's manifest |

## Checksums

```
a90eb8c26fa43ea1a6c278e3f72ea29548089411b863d5488f6e4151281da788  app-debug.apk
181b0d49a42e97a69f47f6f6c4b69bb5225d52ffb4426e38d1a74a573cc41f45  app-release-unsigned.apk
ba393ca8b481b344700a0f4ab1bd95389b5224536748d4c63e61d848c6f5f9c9  app-release.aab
```

## Getting the files

1. Open the run page above and download **`toolz-aab`** and/or **`toolz-apk`**.
2. Sign the bundle with your upload key:

   ```bash
   cd android
   ./scripts/sign-release.sh
   ```

   With `TOOLZ_KEYSTORE_PATH`, `TOOLZ_KEYSTORE_PASSWORD`, `TOOLZ_KEY_ALIAS` and
   `TOOLZ_KEY_PASSWORD` set, it produces `dist/app-release.aab` signed and ready
   for the Galaxy Store and Play Console.

3. Or add four repository secrets (`TOOLZ_KEYSTORE_BASE64`,
   `TOOLZ_KEYSTORE_PASSWORD`, `TOOLZ_KEY_ALIAS`, `TOOLZ_KEY_PASSWORD`) and every
   future run will sign the release itself.

If repository **Settings → Actions → General → Workflow permissions** is switched
to *Read and write*, the workflow will also commit the built binaries into this
folder automatically, and this snapshot file becomes unnecessary.
