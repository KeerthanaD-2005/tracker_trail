package com.tracker.menstrualhealth.data.model

import com.google.gson.annotations.SerializedName

data class LoginRequest(
    @SerializedName("email") val email: String,
    @SerializedName("password") val password: String
)

data class RegisterRequest(
    @SerializedName("email") val email: String,
    @SerializedName("password") val password: String,
    @SerializedName("display_name") val displayName: String? = null,
    @SerializedName("role") val role: String = "athlete"
)

data class TokenResponse(
    @SerializedName("access_token") val accessToken: String,
    @SerializedName("token_type") val tokenType: String,
    @SerializedName("user") val user: UserDto
)

data class UserDto(
    @SerializedName("id") val id: String,
    @SerializedName("email") val email: String,
    @SerializedName("display_name") val displayName: String?,
    @SerializedName("role") val role: String?,
    @SerializedName("age") val age: Int?,
    @SerializedName("height_cm") val heightCm: Float?,
    @SerializedName("weight_kg") val weightKg: Float?,
    @SerializedName("training_level") val trainingLevel: String?,
    @SerializedName("cycle_goal") val cycleGoal: String?,
    @SerializedName("streak_days") val streakDays: Int?
)
