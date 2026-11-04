package com.tracker.menstrualhealth.data.model

import com.google.gson.annotations.SerializedName

data class DashboardResponse(
    @SerializedName("user") val user: UserDto,
    @SerializedName("last_cycle") val lastCycle: CycleDto?,
    @SerializedName("recent_symptoms") val recentSymptoms: List<Map<String, Any>>?,
    @SerializedName("latest_wearable") val latestWearable: WearableDataDto?,
    @SerializedName("latest_phase") val latestPhase: PhasePredictionDto?,
    @SerializedName("unread_notification_count") val unreadNotificationCount: Int? = 0
)

data class CycleDto(
    @SerializedName("id") val id: String,
    @SerializedName("period_start") val periodStart: String,
    @SerializedName("period_end") val periodEnd: String?,
    @SerializedName("flow_intensity") val flowIntensity: Int?,
    @SerializedName("notes") val notes: String?
)

data class WearableDataDto(
    @SerializedName("recorded_at") val recordedAt: String?,
    @SerializedName("hrv_ms") val hrvMs: Float?,
    @SerializedName("skin_temp_c") val skinTempC: Float?,
    @SerializedName("spo2_pct") val spo2Pct: Float?,
    @SerializedName("resting_hr") val restingHr: Float?,
    @SerializedName("steps") val steps: Int?,
    @SerializedName("workout_type") val workoutType: String?
)

data class PhasePredictionDto(
    @SerializedName("phase") val phase: String,
    @SerializedName("day_in_cycle") val dayInCycle: Int?,
    @SerializedName("cycle_length_assumed") val cycleLengthAssumed: Int?,
    @SerializedName("irregularity_hint") val irregularityHint: Float?,
    @SerializedName("model_note") val modelNote: String?
)
