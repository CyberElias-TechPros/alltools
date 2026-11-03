#!/usr/bin/env bash
#
# Sign the release bundle and the release APK with the owner's upload key.
#
#   ./scripts/sign-release.sh
#
# Environment (or android/keystore.properties):
#   TOOLZ_KEYSTORE_PATH      path to the .jks
#   TOOLZ_KEYSTORE_PASSWORD  store password
#   TOOLZ_KEY_ALIAS          key alias
#   TOOLZ_KEY_PASSWORD       key password
#
# If no keystore exists yet, one is created at android/keystore.jks. Keep that
# file and its passwords offline and backed up: Play App Signing can replace an
# upload key, the Galaxy Store cannot.
set -euo pipefail

cd "$(dirname "$0")/.."

AAB="app/build/outputs/bundle/release/app-release.aab"
APK="app/build/outputs/apk/release/app-release-unsigned.apk"
[ -f "$APK" ] || APK="app/build/outputs/apk/release/app-release.apk"

KEYSTORE="${TOOLZ_KEYSTORE_PATH:-keystore.jks}"
STORE_PASS="${TOOLZ_KEYSTORE_PASSWORD:-}"
KEY_ALIAS="${TOOLZ_KEY_ALIAS:-toolz}"
KEY_PASS="${TOOLZ_KEY_PASSWORD:-}"

if [ -f keystore.properties ] && [ -z "$STORE_PASS" ]; then
  # shellcheck disable=SC1091
  STORE_PASS=$(sed -n 's/^storePassword=//p' keystore.properties)
  KEY_ALIAS=$(sed -n 's/^keyAlias=//p' keystore.properties)
  KEY_PASS=$(sed -n 's/^keyPassword=//p' keystore.properties)
  KEYSTORE=$(sed -n 's/^storeFile=//p' keystore.properties)
fi

if [ ! -f "$AAB" ]; then
  echo "No bundle at $AAB — run: ./gradlew :app:bundleRelease" >&2
  exit 1
fi

if [ ! -f "$KEYSTORE" ]; then
  echo "No keystore at $KEYSTORE. Creating one now — save it somewhere safe."
  STORE_PASS="${STORE_PASS:-$(head -c 24 /dev/urandom | base64 | tr -d '/+=' )}"
  KEY_PASS="${KEY_PASS:-$STORE_PASS}"
  keytool -genkeypair -v \
    -keystore "$KEYSTORE" \
    -alias "$KEY_ALIAS" \
    -keyalg RSA -keysize 4096 -validity 10000 \
    -storepass "$STORE_PASS" -keypass "$KEY_PASS" \
    -dname "CN=Toolz, O=Toolz, L=Lagos, C=NG"
  cat <<EOF

Keystore created: $KEYSTORE
  alias:            $KEY_ALIAS
  store password:   $STORE_PASS
  key password:     $KEY_PASS

Write those down offline. Add them to android/keystore.properties (git-ignored)
so future releases use the same key.
EOF
fi

mkdir -p dist
cp "$AAB" "dist/$(basename "$AAB")"
[ -f "$APK" ] && cp "$APK" "dist/$(basename "$APK")"

echo "Signing the bundle (Play upload format)…"
jarsigner -keystore "$KEYSTORE" -storepass "$STORE_PASS" \
  -sigalg SHA256withRSA -digestalg SHA-256 \
  "dist/$(basename "$AAB")" "$KEY_ALIAS"

if [ -f "dist/$(basename "$APK")" ]; then
  APKSIGNER=$(find "${ANDROID_SDK_ROOT:-$HOME/Library/Android/sdk}" -name apksigner 2>/dev/null | sort | tail -1 || true)
  echo "Signing the APK (Galaxy Store upload format)…"
  if [ -n "$APKSIGNER" ]; then
    "$APKSIGNER" sign --ks "$KEYSTORE" --ks-key-alias "$KEY_ALIAS" \
      --ks-pass "pass:$STORE_PASS" --key-pass "pass:$KEY_PASS" \
      --out "dist/$(basename "$APK")" "dist/$(basename "$APK")"
    "$APKSIGNER" verify --print-certs "dist/$(basename "$APK")"
  else
    echo "apksigner not found — set ANDROID_SDK_ROOT, or sign inside Android Studio." >&2
  fi
fi

echo
echo "Done. Upload these:"
ls -l dist/*.aab dist/*.apk 2>/dev/null
sha256sum dist/*.aab dist/*.apk 2>/dev/null
