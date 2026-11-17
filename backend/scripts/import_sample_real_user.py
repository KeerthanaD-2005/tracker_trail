"""
Import a real user from FedCycleData into the local SELENE SQLite database.
This allows live UI demonstration of real human cycles on the frontend dashboard!
"""

from __future__ import annotations

import csv
import sys
from datetime import date, timedelta
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from app.database import SessionLocal  # noqa: E402
from app.models import CycleEntry, User, UserAppState  # noqa: E402

DATA_PATH = ROOT.parent / "training_data" / "real" / "real_human_cycles_fedcycle.csv"


def import_real_user(client_id: str = "nfp8122") -> None:
    if not DATA_PATH.exists():
        print(f"Dataset not found at {DATA_PATH}")
        return

    with open(DATA_PATH, "r", encoding="utf-8-sig", errors="ignore") as f:
        reader = csv.DictReader(f)
        user_cycles = [r for r in reader if r.get("ClientID") == client_id]

    if not user_cycles:
        print(f"No cycles found for ClientID: {client_id}")
        return

    print(f"Found {len(user_cycles)} real cycles for {client_id}")

    db = SessionLocal()
    try:
        email = f"{client_id}@realdata.selene"
        user = db.query(User).filter(User.email == email).first()

        c0 = user_cycles[0]
        age = int(float(c0["Age"])) if c0.get("Age") and c0["Age"].replace(".", "", 1).isdigit() else 27
        weight_lbs = float(c0["Weight"]) if c0.get("Weight") and c0["Weight"].replace(".", "", 1).isdigit() else 130.0
        height_in = float(c0["Height"]) if c0.get("Height") and c0["Height"].replace(".", "", 1).isdigit() else 65.0

        weight_kg = round(weight_lbs * 0.453592 if weight_lbs > 90 else weight_lbs, 1)
        height_cm = round(height_in * 2.54 if height_in < 100 else height_in, 1)

        if not user:
            user = User(
                email=email,
                display_name=f"Real Athlete ({client_id})",
                age=age,
                height_cm=height_cm,
                weight_kg=weight_kg,
                training_level="Collegiate Athlete",
                cycle_goal="Athletic Cycle Tracking",
            )
            db.add(user)
            db.flush()

            app_state = UserAppState(user_id=user.id, last_announced_phase="follicular")
            db.add(app_state)
            db.flush()

        # Delete old cycles for idempotency
        db.query(CycleEntry).filter(CycleEntry.user_id == user.id).delete()

        # Compute realistic relative dates anchored to today
        anchor_date = date.today() - timedelta(days=90)
        curr_date = anchor_date

        for c in user_cycles:
            try:
                c_len = int(float(c["LengthofCycle"]))
                m_len = int(float(c["LengthofMenses"]))
            except (ValueError, KeyError):
                continue

            entry = CycleEntry(
                user_id=user.id,
                period_start=curr_date,
                period_end=curr_date + timedelta(days=m_len),
                flow_intensity=3,
                notes=f"Real cycle {c.get('CycleNumber')} from FedCycle data (Ovulation day {c.get('EstimatedDayofOvulation')}, Luteal {c.get('LengthofLutealPhase')}d)",
            )
            db.add(entry)
            curr_date += timedelta(days=c_len)

        db.commit()
        print(f"Successfully imported real athlete account: {email}")
        print(f"  - Height: {height_cm} cm, Weight: {weight_kg} kg, Age: {age}")
        print(f"  - Cycles logged: {len(user_cycles)}")
    finally:
        db.close()


if __name__ == "__main__":
    import_real_user("nfp8122")
