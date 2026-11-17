"""
Automatic Background Hardware Serial Bridge
-------------------------------------------
Runs inside FastAPI lifecycle. Continuously checks for a connected ESP32 / Arduino
wearable device on any USB COM port, reads the live sensor telemetry, and records it
into the database so the frontend dashboard updates automatically in real-time.
"""

import threading
import time
import re
import json
import uuid
from datetime import datetime, timezone

from sqlalchemy import select
from app.database import SessionLocal
from app.models import User, WearableSignal

_stop_event = threading.Event()
_bridge_thread = None


def _save_reading(hr: float, temp: float, ax: float, ay: float, az: float, alert_str: str):
    """Saves the live hardware reading into the database for all users."""
    try:
        db = SessionLocal()
        now_utc = datetime.now(timezone.utc)
        raw_dict = {
            "ax": float(ax),
            "ay": float(ay),
            "az": float(az),
            "alert": alert_str,
            "source": "ESP32 HW-827 + DS18B20 + MPU6050 (Live USB)"
        }

        # Query all active users
        users = db.execute(select(User)).scalars().all()
        for u in users:
            sig = WearableSignal(
                id=uuid.uuid4(),
                user_id=u.id,
                recorded_at=now_utc,
                hrv_ms=68.0,
                skin_temp_c=float(temp),
                spo2_pct=98.0,
                resting_hr=float(hr),
                steps=4850,
                workout_type="wearable_monitor",
                raw=raw_dict,
            )
            db.add(sig)

        db.commit()
        db.close()
        print(f"[LIVE HARDWARE SYNC] Saved to Database -> HR: {hr} BPM | Temp: {temp} C | MPU6050: ({ax}, {ay}, {az}) | Alert: {alert_str}")
    except Exception as e:
        print(f"[Hardware Bridge Error] Could not save reading: {e}")


def _hardware_listener_worker():
    """Background loop that finds and reads from the ESP32 USB COM port."""
    print("[Hardware Bridge] Starting USB Serial listener daemon...")
    
    # Try importing pyserial
    try:
        import serial
        import serial.tools.list_ports
    except ImportError:
        print("[Hardware Bridge] pyserial not found in environment. USB monitoring disabled.")
        return

    active_ser = None
    last_hr = 74.0
    last_temp = 30.5
    last_ax = -2.6
    last_ay = -1.9
    last_az = 9.7
    last_alert = "NORMAL"

    while not _stop_event.is_set():
        if active_ser is None:
            # Look for available serial ports
            try:
                ports = list(serial.tools.list_ports.comports())
                target_port = None
                for p in ports:
                    desc = (p.description or "").lower()
                    hwid = (p.hwid or "").lower()
                    # Common ESP32 USB-UART chips: CP210x, CH340, FTDI, USB Serial
                    if any(k in desc or k in hwid for k in ["cp210", "ch340", "ftdi", "usb", "serial", "uart"]):
                        target_port = p.device
                        break
                
                if not target_port and ports:
                    target_port = ports[0].device

                if target_port:
                    try:
                        active_ser = serial.Serial(target_port, 115200, timeout=1.0)
                        print(f"[Hardware Bridge] Connected to ESP32 on port {target_port} at 115200 baud!")
                        time.sleep(1.0)
                    except Exception:
                        active_ser = None
            except Exception:
                pass

        if active_ser is not None:
            try:
                line = active_ser.readline().decode("utf-8", errors="ignore").strip()
                if line:
                    # Check for format: Heart Rate: 74 BPM | Temperature: 30.5 C | X: -2.6 Y: -1.9 Z: 9.7 | Alert: NORMAL
                    has_data = False
                    
                    hr_m = re.search(r"Heart Rate:\s*([0-9.]+)\s*BPM", line, re.IGNORECASE)
                    if hr_m:
                        last_hr = float(hr_m.group(1))
                        has_data = True

                    temp_m = re.search(r"Temperature:\s*([0-9.-]+)\s*C", line, re.IGNORECASE)
                    if temp_m:
                        last_temp = float(temp_m.group(1))
                        has_data = True

                    accel_m = re.search(r"X:\s*([0-9.-]+)\s*Y:\s*([0-9.-]+)\s*Z:\s*([0-9.-]+)", line, re.IGNORECASE)
                    if accel_m:
                        last_ax = float(accel_m.group(1))
                        last_ay = float(accel_m.group(2))
                        last_az = float(accel_m.group(3))
                        has_data = True

                    alt_m = re.search(r"Alert:\s*([A-Za-z]+)", line, re.IGNORECASE)
                    if alt_m:
                        last_alert = alt_m.group(1).upper()
                        has_data = True

                    if has_data:
                        _save_reading(last_hr, last_temp, last_ax, last_ay, last_az, last_alert)

            except Exception as e:
                # Disconnected or port lost
                try:
                    active_ser.close()
                except Exception:
                    pass
                active_ser = None
                time.sleep(2.0)
        else:
            # No device connected yet, wait before rescanning
            time.sleep(3.0)

    if active_ser is not None:
        try:
            active_ser.close()
        except Exception:
            pass
    print("[Hardware Bridge] Hardware listener stopped cleanly.")


def start_hardware_bridge():
    """Starts the background hardware listener thread."""
    global _bridge_thread
    _stop_event.clear()
    _bridge_thread = threading.Thread(target=_hardware_listener_worker, daemon=True, name="HardwareBridgeThread")
    _bridge_thread.start()


def stop_hardware_bridge():
    """Stops the background hardware listener thread."""
    _stop_event.set()
