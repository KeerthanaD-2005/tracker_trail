package com.tracker.menstrualhealth.util

import android.content.Context
import android.content.SharedPreferences

class SessionManager(context: Context) {
    private val prefs: SharedPreferences =
        context.getSharedPreferences("cycle_tracker_prefs", Context.MODE_PRIVATE)

    companion object {
        private const val KEY_TOKEN = "access_token"
        private const val KEY_USER_ID = "user_id"
        private const val KEY_USER_EMAIL = "user_email"
        private const val KEY_DISPLAY_NAME = "display_name"
        private const val KEY_SERVER_URL = "server_url"
        
        // 10.0.2.2 is localhost loopback for standard Android Studio Emulator
        const val DEFAULT_EMULATOR_URL = "http://10.0.2.2:8000/api/v1/"
        const val DEFAULT_WIFI_URL = "http://192.168.1.2:8000/api/v1/"
    }

    fun saveAuth(token: String, userId: String, email: String, displayName: String?) {
        prefs.edit().apply {
            putString(KEY_TOKEN, token)
            putString(KEY_USER_ID, userId)
            putString(KEY_USER_EMAIL, email)
            putString(KEY_DISPLAY_NAME, displayName)
            apply()
        }
    }

    fun getToken(): String? = prefs.getString(KEY_TOKEN, null)

    fun getUserId(): String? = prefs.getString(KEY_USER_ID, null)

    fun getUserEmail(): String? = prefs.getString(KEY_USER_EMAIL, null)

    fun getDisplayName(): String? = prefs.getString(KEY_DISPLAY_NAME, null)

    fun isLoggedIn(): Boolean = !getToken().isNullOrEmpty() && !getUserId().isNullOrEmpty()

    fun getServerUrl(): String = prefs.getString(KEY_SERVER_URL, DEFAULT_WIFI_URL) ?: DEFAULT_WIFI_URL

    fun setServerUrl(url: String) {
        val cleanUrl = if (url.endsWith("/")) url else "$url/"
        val finalUrl = if (cleanUrl.contains("/api/v1/")) cleanUrl else "${cleanUrl}api/v1/"
        prefs.edit().putString(KEY_SERVER_URL, finalUrl).apply()
    }

    fun clear() {
        val savedServerUrl = getServerUrl()
        prefs.edit().clear().apply()
        // Retain server URL across logouts
        setServerUrl(savedServerUrl)
    }
}
