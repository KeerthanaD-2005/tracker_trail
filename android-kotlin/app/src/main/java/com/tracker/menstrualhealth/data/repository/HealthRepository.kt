package com.tracker.menstrualhealth.data.repository

import android.content.Context
import com.tracker.menstrualhealth.data.api.ApiClient
import com.tracker.menstrualhealth.data.model.CycleDto
import com.tracker.menstrualhealth.data.model.CycleForecastResponse
import com.tracker.menstrualhealth.data.model.DashboardResponse
import com.tracker.menstrualhealth.data.model.LoginRequest
import com.tracker.menstrualhealth.data.model.RegisterRequest
import com.tracker.menstrualhealth.data.model.SymptomLogCreateRequest
import com.tracker.menstrualhealth.data.model.TokenResponse
import com.tracker.menstrualhealth.util.SessionManager

class HealthRepository(private val context: Context) {
    private val sessionManager = SessionManager(context)

    private fun getAuthHeader(): String? {
        val token = sessionManager.getToken()
        return if (!token.isNullOrEmpty()) "Bearer $token" else null
    }

    suspend fun login(email: String, pass: String): Result<TokenResponse> {
        return try {
            val api = ApiClient.getService(context)
            val res = api.login(LoginRequest(email, pass))
            if (res.isSuccessful && res.body() != null) {
                val body = res.body()!!
                sessionManager.saveAuth(
                    token = body.accessToken,
                    userId = body.user.id,
                    email = body.user.email,
                    displayName = body.user.displayName
                )
                Result.success(body)
            } else {
                val errorMsg = res.errorBody()?.string() ?: "Login failed (${res.code()})"
                Result.failure(Exception(errorMsg))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun register(email: String, pass: String, name: String?): Result<TokenResponse> {
        return try {
            val api = ApiClient.getService(context)
            val res = api.register(RegisterRequest(email = email, password = pass, displayName = name))
            if (res.isSuccessful && res.body() != null) {
                val body = res.body()!!
                sessionManager.saveAuth(
                    token = body.accessToken,
                    userId = body.user.id,
                    email = body.user.email,
                    displayName = body.user.displayName
                )
                Result.success(body)
            } else {
                val errorMsg = res.errorBody()?.string() ?: "Registration failed (${res.code()})"
                Result.failure(Exception(errorMsg))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getDashboard(): Result<DashboardResponse> {
        val userId = sessionManager.getUserId()
            ?: return Result.failure(Exception("User not authenticated"))
        return try {
            val api = ApiClient.getService(context)
            val res = api.getDashboard(userId, getAuthHeader())
            if (res.isSuccessful && res.body() != null) {
                Result.success(res.body()!!)
            } else {
                Result.failure(Exception("Dashboard load failed (${res.code()})"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getForecast(): Result<CycleForecastResponse> {
        val userId = sessionManager.getUserId()
            ?: return Result.failure(Exception("User not authenticated"))
        return try {
            val api = ApiClient.getService(context)
            val res = api.getForecast(userId, getAuthHeader())
            if (res.isSuccessful && res.body() != null) {
                Result.success(res.body()!!)
            } else {
                Result.failure(Exception("Forecast load failed (${res.code()})"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getAllCycles(): Result<List<CycleDto>> {
        val userId = sessionManager.getUserId()
            ?: return Result.failure(Exception("User not authenticated"))
        return try {
            val api = ApiClient.getService(context)
            val res = api.getAllCycles(userId, getAuthHeader())
            if (res.isSuccessful && res.body() != null) {
                Result.success(res.body()!!)
            } else {
                Result.failure(Exception("Cycles load failed (${res.code()})"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun logSymptoms(
        logDate: String,
        mood: Int,
        fatigue: Int,
        symptoms: Map<String, Any>
    ): Result<Unit> {
        val userId = sessionManager.getUserId()
            ?: return Result.failure(Exception("User not authenticated"))
        return try {
            val api = ApiClient.getService(context)
            val req = SymptomLogCreateRequest(
                userId = userId,
                logDate = logDate,
                mood = mood,
                fatigue = fatigue,
                symptoms = symptoms
            )
            val res = api.logSymptoms(req, getAuthHeader())
            if (res.isSuccessful) {
                Result.success(Unit)
            } else {
                Result.failure(Exception("Failed to log symptoms (${res.code()})"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
