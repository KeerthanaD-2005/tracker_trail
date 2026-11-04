from collections import defaultdict

from datetime import date, datetime, timedelta, timezone

from uuid import UUID



from fastapi import APIRouter, Depends, HTTPException

from sqlalchemy import select

from sqlalchemy.orm import Session



from app.database import get_db

from app.models import CycleEntry, SymptomLog, User, WearableSignal

from app.schemas import AnalyticsCyclesOut, AnalyticsSymptomsOut, AnalyticsWearableOut



router = APIRouter(prefix="/analytics", tags=["analytics"])





@router.get("/{user_id}/cycles", response_model=AnalyticsCyclesOut)

def analytics_cycles(user_id: UUID, db: Session = Depends(get_db)) -> AnalyticsCyclesOut:

    if db.get(User, user_id) is None:

        raise HTTPException(status_code=404, detail="User not found")

    rows = (

        db.execute(

            select(CycleEntry.period_start)

            .where(CycleEntry.user_id == user_id)

            .order_by(CycleEntry.period_start.asc())

        )

        .scalars()

        .all()

    )

    lengths: list[int] = []

    for i in range(1, len(rows)):

        d = (rows[i] - rows[i - 1]).days

        if d > 0:

            lengths.append(d)

    return AnalyticsCyclesOut(period_starts=list(rows), inferred_cycle_lengths=lengths)





@router.get("/{user_id}/symptoms", response_model=AnalyticsSymptomsOut)

def analytics_symptoms(user_id: UUID, limit: int = 40, db: Session = Depends(get_db)) -> AnalyticsSymptomsOut:

    if db.get(User, user_id) is None:

        raise HTTPException(status_code=404, detail="User not found")

    lim = min(max(limit, 5), 120)

    rows = (

        db.execute(

            select(SymptomLog)

            .where(SymptomLog.user_id == user_id)

            .order_by(SymptomLog.log_date.desc())

            .limit(lim)

        )

        .scalars()

        .all()

    )

    points = [

        {

            "log_date": r.log_date.isoformat(),

            "mood": r.mood,

            "fatigue": r.fatigue,

        }

        for r in reversed(rows)

    ]

    return AnalyticsSymptomsOut(points=points)





@router.get("/{user_id}/wearables", response_model=AnalyticsWearableOut)

def analytics_wearables(user_id: UUID, days: int = 14, db: Session = Depends(get_db)) -> AnalyticsWearableOut:

    if db.get(User, user_id) is None:

        raise HTTPException(status_code=404, detail="User not found")

    d = min(max(days, 1), 60)

    since = datetime.now(timezone.utc) - timedelta(days=d)

    rows = (

        db.execute(

            select(WearableSignal)

            .where(WearableSignal.user_id == user_id, WearableSignal.recorded_at >= since)

            .order_by(WearableSignal.recorded_at.asc())

        )

        .scalars()

        .all()

    )

    buckets: dict[date, list[tuple[float | None, float | None]]] = defaultdict(list)

    for r in rows:

        day = r.recorded_at.astimezone(timezone.utc).date()

        buckets[day].append((r.hrv_ms, r.resting_hr))



    daily: list[dict] = []

    for day in sorted(buckets.keys()):

        vals = buckets[day]

        hrvs = [v[0] for v in vals if v[0] is not None]

        hrs = [v[1] for v in vals if v[1] is not None]

        daily.append(

            {

                "date": day.isoformat(),

                "samples": len(vals),

                "avg_hrv_ms": round(sum(hrvs) / len(hrvs), 2) if hrvs else None,

                "avg_resting_hr": round(sum(hrs) / len(hrs), 2) if hrs else None,

            }

        )

    return AnalyticsWearableOut(daily=daily)


@router.get("/{user_id}/export")
def export_user_data(user_id: UUID, db: Session = Depends(get_db)) -> dict:
    user = db.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    cycles = db.execute(
        select(CycleEntry)
        .where(CycleEntry.user_id == user_id)
        .order_by(CycleEntry.period_start.desc())
    ).scalars().all()

    symptoms = db.execute(
        select(SymptomLog)
        .where(SymptomLog.user_id == user_id)
        .order_by(SymptomLog.log_date.desc())
    ).scalars().all()

    wearables = db.execute(
        select(WearableSignal)
        .where(WearableSignal.user_id == user_id)
        .order_by(WearableSignal.recorded_at.desc())
    ).scalars().all()

    return {
        "user": {
            "id": str(user.id),
            "email": user.email,
            "display_name": user.display_name,
            "role": user.role,
            "training_level": user.training_level,
            "cycle_goal": user.cycle_goal,
            "age": user.age,
            "height_cm": user.height_cm,
            "weight_kg": user.weight_kg,
            "streak_days": user.streak_days,
        },
        "cycles": [
            {
                "id": str(c.id),
                "period_start": c.period_start.isoformat(),
                "period_end": c.period_end.isoformat() if c.period_end else None,
                "flow_intensity": c.flow_intensity,
                "notes": c.notes,
            }
            for c in cycles
        ],
        "symptoms": [
            {
                "id": str(s.id),
                "log_date": s.log_date.isoformat(),
                "mood": s.mood,
                "fatigue": s.fatigue,
                "symptoms": s.symptoms,
            }
            for s in symptoms
        ],
        "wearables": [
            {
                "id": str(w.id),
                "recorded_at": w.recorded_at.isoformat(),
                "hrv_ms": w.hrv_ms,
                "resting_hr": w.resting_hr,
                "skin_temp_c": w.skin_temp_c,
                "spo2_pct": w.spo2_pct,
                "steps": w.steps,
                "workout_type": w.workout_type,
            }
            for w in wearables
        ],
        "exported_at": datetime.now(timezone.utc).isoformat(),
    }


@router.get("/{user_id}/forecast")
def forecast_future_cycles(user_id: UUID, db: Session = Depends(get_db)) -> dict:
    user = db.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    from app.services.phase_service import median_cycle_length, _ordered_period_starts, _irregularity_score
    starts = _ordered_period_starts(db, user_id)
    cycle_len = median_cycle_length(db, user_id)
    irr = _irregularity_score(db, user_id)

    last_start = starts[-1] if starts else date.today()

    if irr < 0.15:
        regularity_status = "High Consistency (Regular Rhythms)"
    elif irr < 0.30:
        regularity_status = "Typical Physiological Variation"
    else:
        regularity_status = "Elevated Variation (Monitor closely)"

    future_cycles = []
    for i in range(1, 4):
        p_start = last_start + timedelta(days=cycle_len * i)
        ovulation_day = max(1, cycle_len - 14)
        ovulation_date = p_start + timedelta(days=ovulation_day)
        fertile_start = ovulation_date - timedelta(days=5)
        fertile_end = ovulation_date + timedelta(days=1)
        m_end = p_start + timedelta(days=min(5, max(3, round(5 * cycle_len / 28))))

        future_cycles.append({
            "cycle_number": i,
            "period_start": p_start.isoformat(),
            "period_end": m_end.isoformat(),
            "ovulation_date": ovulation_date.isoformat(),
            "fertile_window_start": fertile_start.isoformat(),
            "fertile_window_end": fertile_end.isoformat(),
            "luteal_start": (ovulation_date + timedelta(days=1)).isoformat(),
        })

    return {
        "median_cycle_length": cycle_len,
        "irregularity_score": irr,
        "regularity_status": regularity_status,
        "total_cycles_logged": len(starts),
        "forecasts": future_cycles,
    }

