# The tool layer is plain Kotlin with no reflection; keep only what the ad SDK needs.
-keep class com.google.android.gms.ads.** { *; }
-dontwarn com.google.android.gms.ads.**
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile

# PdfBox ships optional JPEG 2000 (JPX) support through a decoder we do not
# bundle. The class is only touched when a PDF actually contains a JPX image,
# so R8 only needs the warning silenced.
-dontwarn com.gemalto.jp2.**
-dontwarn org.bouncycastle.**
-dontwarn javax.imageio.**

# PdfBox reads its own resource bundle and instantiates a few classes by name.
-keep class com.tom_roush.pdfbox.pdmodel.** { *; }
-keep class com.tom_roush.fontbox.** { *; }
-keep class com.tom_roush.harmony.** { *; }
-dontwarn com.tom_roush.**
