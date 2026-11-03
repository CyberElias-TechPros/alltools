# Built artefacts

The binaries are produced by the `Android` workflow, not by hand. Each run
uploads them as workflow artefacts; this folder is where the workflow would
mirror them if repository Actions permissions were set to **read and write**.

## Where to download the current build

1. Open **Actions → Android → the newest run** on the `arena/1baa2016-alltools`
   branch: <https://github.com/CyberElias-TechPros/alltools/actions/workflows/android.yml>
2. Download `toolz-aab` (the `.aab` for Google Play and the Samsung Galaxy Store)
   or `toolz-apk` (release APK plus the debug APK used for device testing).

## Signing

The workflow builds the release **unsigned** unless the owner has added these
repository secrets, which is the safe default for a public repository:

| Secret | Contents |
| --- | --- |
| `TOOLZ_KEYSTORE_BASE64` | `base64 -w0 keystore.jks` |
| `TOOLZ_KEYSTORE_PASSWORD` | store password |
| `TOOLZ_KEY_ALIAS` | key alias, for example `toolz` |
| `TOOLZ_KEY_PASSWORD` | key password |

Without them, sign the downloaded bundle locally in one command:

```bash
cd android
TOOLZ_KEYSTORE_PATH=/path/to/toolz-upload.jks \
TOOLZ_KEYSTORE_PASSWORD=… TOOLZ_KEY_ALIAS=toolz TOOLZ_KEY_PASSWORD=… \
  ./scripts/sign-release.sh
```

The script also creates a 4096-bit RSA keystore for you if none exists, and
prints the passwords once — write them down offline, because the Galaxy Store
requires the same key for every future update.

Never commit a keystore to this repository. The `.gitignore` in `android/`
already blocks `*.jks` and `keystore.properties`.
