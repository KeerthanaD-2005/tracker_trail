import sys
import os
from datetime import date, datetime, timedelta, timezone

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal, Base, engine
from app.models import User, CycleEntry, SymptomLog, WearableSignal, UserAppState
from app.auth import hash_password

def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == "demo@university.edu").first()
        if not user:
            user = User(
                email="demo@university.edu",
                hashed_password=hash_password("demopass123"),
                display_name="Demo Athlete",
                role="athlete",
                is_active=True,
                age=24,
                height_cm=168.0,
                weight_kg=62.0,
                training_level="Competitive Athlete",
                cycle_goal="Athletic Performance & Health",
                streak_days=12,
            )
            db.add(user)
            db.flush()
            print("Created demo user:", user.id)
        else:
            user.hashed_password = hash_password("demopass123")
            print("Updated demo user password to demopass123")

        # Check cycle entries
        existing_cycles = db.query(CycleEntry).filter(CycleEntry.user_id == user.id).count()
        if existing_cycles == 0:
            today = date.today()
            # 4 cycles: ~28 days apart
            cycles_data = [
                (today - timedelta(days=84), today - timedelta(days=80), 3, "Normal cycle start"),
                (today - timedelta(days=56), today - timedelta(days=52), 4, "Mild cramps day 1"),
                (today - timedelta(days=28), today - timedelta(days=24), 3, "Energy high in follicular phase"),
                (today - timedelta(days=5), None, 3, "Current cycle start"),
            ]
            for start_d, end_d, flow, notes in cycles_data:
                db.add(CycleEntry(
                    user_id=user.id,
                    period_start=start_d,
                    period_end=end_d,
                    flow_intensity=flow,
                    notes=notes,
                ))

            # Symptom logs
            for i in range(14):
                d = today - timedelta(days=i)
                db.add(SymptomLog(
                    user_id=user.id,
                    log_date=d,
                    mood=4 if i % 2 == 0 else 3,
                    fatigue=2 if i > 7 else 3,
                    symptoms={"headache": False, "cramps": i < 5, "bloating": i < 3},
                ))

            # Wearable signals
            for i in range(14):
                recorded = datetime.now(timezone.utc) - timedelta(days=i)
                db.add(WearableSignal(
                    user_id=user.id,
                    recorded_at=recorded,
                    hrv_ms=65.0 + (i % 5) * 2,
                    skin_temp_c=36.5 + (0.1 if i < 7 else 0.4),
                    spo2_pct=98.5,
                    resting_hr=58.0 + (i % 4),
                    steps=8500 + i * 200,
                    workout_type="running" if i % 2 == 0 else "strength",
                ))

            db.add(UserAppState(user_id=user.id, last_announced_phase="follicular"))
            print("Seeded 4 cycles, symptoms, and wearable signals!")

        db.commit()
        print("Demo user ready with credentials: demo@university.edu / demopass123")
    except Exception as e:
        db.rollback()
        print("Error:", e)
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed()
