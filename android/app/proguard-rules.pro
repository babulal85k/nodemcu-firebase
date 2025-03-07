# Keep all public classes & methods but allow ProGuard to optimize private/internal ones
-keep public class your.package.name.** { public *; }

# Keep Android-generated classes to avoid crashes
-keep class your.package.name.BuildConfig { *; }
-keep class your.package.name.R$* { *; }

# Keep model classes (if using Gson, Retrofit, etc.)
-keep class your.package.name.models.** { *; }

# Allow ProGuard to optimize & shrink unused code
-dontshrink
-dontoptimize
-dontobfuscate
