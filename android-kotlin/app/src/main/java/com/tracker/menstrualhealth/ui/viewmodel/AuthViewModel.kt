package com.tracker.menstrualhealth.ui.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.tracker.menstrualhealth.data.model.UserDto
import com.tracker.menstrualhealth.data.repository.HealthRepository
import com.tracker.menstrualhealth.util.SessionManager
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class AuthState(
    val isLoading: Boolean = false,
    val isLoggedIn: Boolean = false,
    val user: UserDto? = null,
    val errorMessage: String? = null
)

class AuthViewModel(application: Application) : AndroidViewModel(application) {
    private val repository = HealthRepository(application)
    private val sessionManager = SessionManager(application)

    private val _state = MutableStateFlow(
        AuthState(isLoggedIn = sessionManager.isLoggedIn())
    )
    val state: StateFlow<AuthState> = _state.asStateFlow()

    fun login(email: String, pass: String) {
        viewModelScope.launch {
            _state.value = _state.value.copy(isLoading = true, errorMessage = null)
            val result = repository.login(email.trim(), pass)
            result.onSuccess { tokenRes ->
                _state.value = _state.value.copy(
                    isLoading = false,
                    isLoggedIn = true,
                    user = tokenRes.user,
                    errorMessage = null
                )
            }.onFailure { err ->
                _state.value = _state.value.copy(
                    isLoading = false,
                    errorMessage = err.message ?: "Authentication failed"
                )
            }
        }
    }

    fun register(email: String, pass: String, name: String?) {
        viewModelScope.launch {
            _state.value = _state.value.copy(isLoading = true, errorMessage = null)
            val result = repository.register(email.trim(), pass, name?.trim())
            result.onSuccess { tokenRes ->
                _state.value = _state.value.copy(
                    isLoading = false,
                    isLoggedIn = true,
                    user = tokenRes.user,
                    errorMessage = null
                )
            }.onFailure { err ->
                _state.value = _state.value.copy(
                    isLoading = false,
                    errorMessage = err.message ?: "Registration failed"
                )
            }
        }
    }

    fun loginDemo() {
        login("demo@university.edu", "demopass123")
    }

    fun logout() {
        sessionManager.clear()
        _state.value = AuthState(isLoggedIn = false, user = null)
    }

    fun clearError() {
        _state.value = _state.value.copy(errorMessage = null)
    }
}
