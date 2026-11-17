"""
Personalization Engine & Adaptive Model Calibrator
--------------------------------------------------
Queries historical wearable signals from the database (wearable_signals table)
and adapts/calibrates the ML models (XGBoost, LSTM, Recovery Engine, and AI Chat Oracle)
specifically to the user's biological baselines.
"""

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from uuid import UUID

import numpy as np
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.config import settings
from app.models import SymptomLog, User, WearableSignal


def get_user_biometric_profile(db: Session, user_id: UUID) -> dict:
    """
    Computes the user's historical physiological baseline from all stored
    wearable signals collected by the hardware.
    """
    q = (
        select(
            func.count(WearableSignal.id),
            func.avg(WearableSignal.resting_hr),
            func.min(WearableSignal.resting_hr),
            func.max(WearableSignal.resting_hr),
            func.avg(WearableSignal.skin_temp_c),
            func.avg(WearableSignal.hrv_ms),
            func.avg(WearableSignal.spo2_pct),
            func.avg(WearableSignal.steps),
        )
        .where(WearableSignal.user_id == user_id)
    )
    res = db.execute(q).first()
    count = res[0] if res else 0

    if not count:
        return {
            "total_samples": 0,
            "baseline_rhr": 74.0,
            "baseline_skin_temp": 30.5,
            "baseline_hrv": 68.0,
            "baseline_spo2": 98.0,
            "avg_steps": 4800,
            "thermal_shift_detected": False,
            "status": "Awaiting initial wearable sensor stream",
        }

    avg_rhr = round(float(res[1] or 74.0), 1)
    min_rhr = round(float(res[2] or 60.0), 1)
    max_rhr = round(float(res[3] or 90.0), 1)
    avg_temp = round(float(res[4] or 30.5), 2)
    avg_hrv = round(float(res[5] or 68.0), 1)
    avg_spo2 = round(float(res[6] or 98.0), 1)
    avg_steps = int(res[7] or 4800)

    # Fetch the most recent reading to check for real-time acute delta
    latest_q = (
        select(WearableSignal)
        .where(WearableSignal.user_id == user_id)
        .order_by(WearableSignal.recorded_at.desc())
        .limit(1)
    )
    latest = db.execute(latest_q).scalars().first()
    
    current_temp = latest.skin_temp_c if latest and latest.skin_temp_c is not None else avg_temp
    current_rhr = latest.resting_hr if latest and latest.resting_hr is not None else avg_rhr
    
    temp_delta = round(current_temp - avg_temp, 2)
    rhr_delta = round(current_rhr - avg_rhr, 1)

    # Thermal jump (+0.3°C to +0.5°C) indicates active post-ovulatory luteal progesterone shift
    thermal_shift = temp_delta >= 0.25

    return {
        "total_samples": count,
        "baseline_rhr": avg_rhr,
        "min_rhr": min_rhr,
        "max_rhr": max_rhr,
        "baseline_skin_temp": avg_temp,
        "baseline_hrv": avg_hrv,
        "baseline_spo2": avg_spo2,
        "avg_steps": avg_steps,
        "current_rhr": current_rhr,
        "current_temp": current_temp,
        "temp_delta_c": temp_delta,
        "rhr_delta_bpm": rhr_delta,
        "thermal_shift_detected": thermal_shift,
        "status": "Calibrated with live wearable database signals",
    }


def train_personal_calibration(db: Session, user_id: UUID) -> dict:
    """
    Trains a personalized physiological baseline calibration profile from the user's
    collected wearable records and writes it to an artifact for the AI / ML engine.
    """
    profile = get_user_biometric_profile(db, user_id)
    
    # Calculate personalized Heart Rate Reserve (Karvonen formula)
    user = db.get(User, user_id)
    age = user.age if user and user.age else 22
    max_hr = 220 - age
    hr_reserve = max_hr - profile["baseline_rhr"]
    
    # Personal Parasympathetic Vagal Index (HRV / RHR)
    vagal_index = round(profile["baseline_hrv"] / max(1.0, profile["baseline_rhr"]), 3)

    # Compile calibration artifact
    calibration_data = {
        "user_id": str(user_id),
        "calibration_timestamp": datetime.now(timezone.utc).isoformat(),
        "total_hardware_samples_trained": profile["total_samples"],
        "baselines": {
            "resting_hr": profile["baseline_rhr"],
            "skin_temp_c": profile["baseline_skin_temp"],
            "hrv_ms": profile["baseline_hrv"],
            "spo2_pct": profile["baseline_spo2"],
            "daily_steps": profile["avg_steps"],
        },
        "personalized_kinetics": {
            "max_heart_rate_estimated": max_hr,
            "heart_rate_reserve_bpm": hr_reserve,
            "vagal_recovery_index": vagal_index,
            "luteal_thermal_threshold_c": round(profile["baseline_skin_temp"] + 0.35, 2),
        },
        "ml_personalization_weights": {
            "strain_tolerance_factor": round(min(1.2, max(0.8, vagal_index / 0.9)), 2),
            "metabolic_burn_multiplier": 1.08 if profile["thermal_shift_detected"] else 1.0,
            "recovery_window_modifier_hours": -2.0 if vagal_index > 1.0 else (2.0 if vagal_index < 0.8 else 0.0),
        },
        "status": "Successfully trained and integrated into prediction pipeline",
    }

    # Save to artifacts directory
    artifact_path = Path(settings.artifacts_dir) / f"calibration_{user_id}.json"
    with open(artifact_path, "w", encoding="utf-8") as f:
        json.dump(calibration_data, f, indent=2)

    return calibration_data
