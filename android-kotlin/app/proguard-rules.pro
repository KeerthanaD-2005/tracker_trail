# ProGuard rules for CycleTracker
-keepattributes *Annotation*,Signature,InnerClasses,EnclosingMethod
-keepclassmembers,allowobfuscation class * {
    @com.google.gson.annotations.SerializedName <fields>;
}
-keep class com.tracker.menstrualhealth.data.model.** { *; }
