# The tool layer is plain Kotlin with no reflection; keep only what the ad SDK needs.
-keep class com.google.android.gms.ads.** { *; }
-dontwarn com.google.android.gms.ads.**
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile
