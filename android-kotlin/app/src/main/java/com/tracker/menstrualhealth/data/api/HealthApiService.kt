package com.tracker.menstrualhealth.data.api

import com.tracker.menstrualhealth.data.model.CycleDto
import com.tracker.menstrualhealth.data.model.CycleForecastResponse
import com.tracker.menstrualhealth.data.model.DashboardResponse
import com.tracker.menstrualhealth.data.model.HealthStatusResponse
import com.tracker.menstrualhealth.data.model.LoginRequest
import com.tracker.menstrualhealth.data.model.RegisterRequest
import com.tracker.menstrualhealth.data.model.SymptomLogCreateRequest
import com.tracker.menstrualhealth.data.model.TokenResponse
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.Header
import retrofit2.http.POST
import retrofit2.http.Path
import retrofit2.http.Query

interface HealthApiService {

    @GET("health")
    suspend fun checkHealth(): Response<HealthStatusResponse>

    @POST("auth/login")
    suspend fun login(
        @Body request: LoginRequest
    ): Response<TokenResponse>

    @POST("auth/register")
    suspend fun register(
        @Body request: RegisterRequest
    ): Response<TokenResponse>

    @GET("dashboard/{userId}")
    suspend fun getDashboard(
        @Path("userId") userId: String,
        @Header("Authorization") authHeader: String?
    ): Response<DashboardResponse>

    @GET("analytics/{userId}/forecast")
    suspend fun getForecast(
        @Path("userId") userId: String,
        @Header("Authorization") authHeader: String?
    ): Response<CycleForecastResponse>

    @GET("cycles/all")
    suspend fun getAllCycles(
        @Query("user_id") userId: String,
        @Header("Authorization") authHeader: String?
    ): Response<List<CycleDto>>

    @POST("symptoms")
    suspend fun logSymptoms(
        @Body request: SymptomLogCreateRequest,
        @Header("Authorization") authHeader: String?
    ): Response<Map<String, Any>>
}
