package com.tracker.menstrualhealth.data.model

import com.google.gson.annotations.SerializedName

data class CycleForecastResponse(
    @SerializedName("median_cycle_length") val medianCycleLength: Int,
    @SerializedName("irregularity_score") val irregularityScore: Float,
    @SerializedName("regularity_status") val regularityStatus: String,
    @SerializedName("total_cycles_logged") val totalCyclesLogged: Int,
    @SerializedName("forecasts") val forecasts: List<ForecastItemDto>
)

data class ForecastItemDto(
    @SerializedName("cycle_number") val cycleNumber: Int,
    @SerializedName("period_start") val periodStart: String,
    @SerializedName("period_end") val periodEnd: String,
    @SerializedName("ovulation_date") val ovulationDate: String,
    @SerializedName("fertile_window_start") val fertileWindowStart: String,
    @SerializedName("fertile_window_end") val fertileWindowEnd: String,
    @SerializedName("luteal_start") val lutealStart: String
)

data class SymptomLogCreateRequest(
    @SerializedName("user_id") val userId: String,
    @SerializedName("log_date") val logDate: String,
    @SerializedName("mood") val mood: Int,
    @SerializedName("fatigue") val fatigue: Int,
    @SerializedName("symptoms") val symptoms: Map<String, Any>
)

data class HealthStatusResponse(
    @SerializedName("status") val status: String
)
