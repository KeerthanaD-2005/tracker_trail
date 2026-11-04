package com.tracker.menstrualhealth.ui.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.tracker.menstrualhealth.data.repository.HealthRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

data class LogState(
    val flowIntensity: Int = 3,
    val mood: Int = 4,
    val fatigue: Int = 2,
    val hasCramps: Boolean = false,
    val hasHeadache: Boolean = false,
    val hasBloating: Boolean = false,
    val isSubmitting: Boolean = false,
    val successMessage: String? = null,
    val errorMessage: String? = null
)

class LogViewModel(application: Application) : AndroidViewModel(application) {
    private val repository = HealthRepository(application)

    private val _state = MutableStateFlow(LogState())
    val state: StateFlow<LogState> = _state.asStateFlow()

    fun setFlow(intensity: Int) {
        _state.value = _state.value.copy(flowIntensity = intensity)
    }

    fun setMood(score: Int) {
        _state.value = _state.value.copy(mood = score)
    }

    fun setFatigue(score: Int) {
        _state.value = _state.value.copy(fatigue = score)
    }

    fun toggleCramps() {
        _state.value = _state.value.copy(hasCramps = !_state.value.hasCramps)
    }

    fun toggleHeadache() {
        _state.value = _state.value.copy(hasHeadache = !_state.value.hasHeadache)
    }

    fun toggleBloating() {
        _state.value = _state.value.copy(hasBloating = !_state.value.hasBloating)
    }

    fun submitLog() {
        viewModelScope.launch {
            _state.value = _state.value.copy(isSubmitting = true, successMessage = null, errorMessage = null)
            val todayStr = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(Date())

            val symptomsMap = mapOf(
                "cramps" to _state.value.hasCramps,
                "headache" to _state.value.hasHeadache,
                "bloating" to _state.value.hasBloating
            )

            val result = repository.logSymptoms(
                logDate = todayStr,
                mood = _state.value.mood,
                fatigue = _state.value.fatigue,
                symptoms = symptomsMap
            )

            result.onSuccess {
                _state.value = _state.value.copy(
                    isSubmitting = false,
                    successMessage = "Today's daily health check-in logged successfully! 🌸",
                    errorMessage = null
                )
            }.onFailure { err ->
                _state.value = _state.value.copy(
                    isSubmitting = false,
                    errorMessage = err.message ?: "Failed to log symptoms"
                )
            }
        }
    }

    fun clearFeedback() {
        _state.value = _state.value.copy(successMessage = null, errorMessage = null)
    }
}
