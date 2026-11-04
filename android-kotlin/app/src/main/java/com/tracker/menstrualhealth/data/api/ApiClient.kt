package com.tracker.menstrualhealth.data.api

import android.content.Context
import com.tracker.menstrualhealth.util.SessionManager
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

object ApiClient {
    private var currentBaseUrl: String? = null
    private var cachedService: HealthApiService? = null

    fun getService(context: Context): HealthApiService {
        val sessionManager = SessionManager(context)
        val baseUrl = sessionManager.getServerUrl()

        if (cachedService != null && currentBaseUrl == baseUrl) {
            return cachedService!!
        }

        val logging = HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BODY
        }

        val okHttpClient = OkHttpClient.Builder()
            .addInterceptor(logging)
            .connectTimeout(15, TimeUnit.SECONDS)
            .readTimeout(15, TimeUnit.SECONDS)
            .writeTimeout(15, TimeUnit.SECONDS)
            .build()

        val retrofit = Retrofit.Builder()
            .baseUrl(baseUrl)
            .client(okHttpClient)
            .addConverterFactory(GsonConverterFactory.create())
            .build()

        currentBaseUrl = baseUrl
        cachedService = retrofit.create(HealthApiService::class.java)
        return cachedService!!
    }

    fun invalidate() {
        cachedService = null
        currentBaseUrl = null
    }
}
