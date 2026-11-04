package com.tracker.menstrualhealth.ui.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.tracker.menstrualhealth.data.model.CycleForecastResponse
import com.tracker.menstrualhealth.data.model.DashboardResponse
import com.tracker.menstrualhealth.data.repository.HealthRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class DashboardState(
    val isLoading: Boolean = false,
    val dashboard: DashboardResponse? = null,
    val forecast: CycleForecastResponse? = null,
    val errorMessage: String? = null
)

class DashboardViewModel(application: Application) : AndroidViewModel(application) {
    private val repository = HealthRepository(application)

    private val _state = MutableStateFlow(DashboardState())
    val state: StateFlow<DashboardState> = _state.asStateFlow()

    init {
        loadData()
    }

    fun loadData() {
        viewModelScope.launch {
            _state.value = _state.value.copy(isLoading = true, errorMessage = null)

            val dashRes = repository.getDashboard()
            val forecastRes = repository.getForecast()

            dashRes.onSuccess { dash ->
                _state.value = _state.value.copy(
                    isLoading = false,
                    dashboard = dash,
                    forecast = forecastRes.getOrNull(),
                    errorMessage = null
                )
            }.onFailure { err ->
                _state.value = _state.value.copy(
                    isLoading = false,
                    errorMessage = err.message ?: "Could not connect to server"
                )
            }
        }
    }
}
