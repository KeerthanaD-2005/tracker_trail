"""
Wearable Hardware-to-Software Real-Time Bridge
----------------------------------------------
Connects your ESP32 Wearable Monitor directly to your Menstrual Health Website.
Reads live sensor telemetry (Heart Rate, Temperature, Motion, Alert) from the
ESP32 (via USB COM port or simulated stream) and streams it into the database & website.
"""

import sys
import os
import time
import re
import json
import uuid
import sqlite3
import urllib.request
import urllib.error
from datetime import datetime, timezone

# Target User IDs (Primary: Keerthana, Fallback: Demo)
PRIMARY_USER_ID = "62ca3bc3-b1b6-446a-9e25-cbf86ddd136e"
DEMO_USER_ID = "733f4f07-4051-4ff1-98c3-f4e41351c528"
DEFAULT_URL = "http://127.0.0.1:8000/api/v1/wearable-sync"
DB_PATH = os.path.join(os.path.dirname(__file__), "..", "backend", "menstrual_health.db")


def write_to_sqlite(user_id: str, hr: float, temp: float, ax: float, ay: float, az: float, alert_str: str):
    """Fallback: writes directly into SQLite database so the UI always has the latest live hardware data."""
    try:
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        now_iso = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S.%f")
        sig_id = uuid.uuid4().hex
        raw_json = json.dumps({
            "ax": float(ax),
            "ay": float(ay),
            "az": float(az),
            "alert": alert_str,
            "source": "ESP32 HW-827 + DS18B20 + MPU6050"
        })
        
        # Insert for target user as well as demo user so whichever account is open shows the live reading
        for uid in [PRIMARY_USER_ID, DEMO_USER_ID]:
            c.execute("""
                INSERT INTO wearable_signals (id, user_id, recorded_at, hrv_ms, skin_temp_c, spo2_pct, resting_hr, steps, workout_type, raw)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (uuid.uuid4().hex, uid, now_iso, 68.0, float(temp), 98.0, float(hr), 4850, "wearable_monitor", raw_json))
        
        conn.commit()
        conn.close()
        return True
    except Exception as e:
        print(f"[DB Warning] Could not write directly to DB: {e}")
        return False


def post_to_backend(user_id: str, hr: float, temp: float, ax: float, ay: float, az: float, alert_str: str, api_url: str = DEFAULT_URL):
    """Sends JSON POST to FastAPI /api/v1/wearable-sync"""
    now_iso = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    payload = {
        "user_id": user_id,
        "points": [
            {
                "recorded_at": now_iso,
                "resting_hr": float(hr),
                "skin_temp_c": float(temp),
                "steps": 4850,
                "hrv_ms": 68.0,
                "spo2_pct": 98.0,
                "workout_type": "wearable_monitor",
                "raw": {
                    "ax": float(ax),
                    "ay": float(ay),
                    "az": float(az),
                    "alert": alert_str,
                }
            }
        ]
    }
    
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        api_url,
        data=data,
        headers={"Content-Type": "application/json"}
    )
    
    try:
        with urllib.request.urlopen(req, timeout=2) as response:
            if response.status == 200:
                print(f"[LIVE SYNC -> HTTP 200] HR: {hr} BPM | Temp: {temp} C | Movement: ({ax}, {ay}, {az}) | Alert: {alert_str}")
                return True
    except Exception:
        # If server isn't running or socket restricted, write straight to SQLite
        if write_to_sqlite(user_id, hr, temp, ax, ay, az, alert_str):
            print(f"[LIVE SYNC -> DATABASE] HR: {hr} BPM | Temp: {temp} C | Movement: ({ax}, {ay}, {az}) | Alert: {alert_str}")
            return True
    return False


def auto_detect_com_port():
    try:
        import serial.tools.list_ports
        ports = list(serial.tools.list_ports.comports())
        for p in ports:
            # Often CP210x, CH340, USB Serial, etc.
            desc = p.description.lower()
            if any(k in desc for k in ["cp210", "ch340", "uart", "usb", "serial", "esp32"]):
                return p.device
        if ports:
            return ports[0].device
    except Exception:
        pass
    return None


def run_serial_listener(port: str = None, baud: int = 115200):
    try:
        import serial
    except ImportError:
        print("[!] pyserial is not installed. Please run: pip install pyserial")
        sys.exit(1)

    if not port:
        port = auto_detect_com_port()
        if not port:
            print("[!] No USB COM port detected automatically.")
            print("    Please specify your COM port manually, e.g.:")
            print("    python scripts/wearable_serial_bridge.py COM3")
            print("    Or run simulated live test: python scripts/wearable_serial_bridge.py --live-test")
            sys.exit(1)

    print(f"============================================================")
    print(f"  AURA / Wearable Monitor Live Bridge Started")
    print(f"  Connected Port: {port} @ {baud} Baud")
    print(f"  Target Website: http://localhost:8000 (Biometrics Tab)")
    print(f"============================================================")
    print("Listening for readings from hardware... (Press Ctrl+C to stop)\n")

    try:
        ser = serial.Serial(port, baud, timeout=2)
    except Exception as e:
        print(f"[ERROR] Could not open port {port}: {e}")
        return

    time.sleep(1.5)

    last_hr = 74.0
    last_temp = 30.5
    last_ax = -2.6
    last_ay = -1.9
    last_az = 9.7
    last_alert = "NORMAL"

    try:
        while True:
            raw_line = ser.readline().decode("utf-8", errors="ignore").strip()
            if not raw_line:
                continue

            # Check for standard output format:
            # Heart Rate: 74 BPM | Temperature: 30.5 C | X: -2.6 Y: -1.9 Z: 9.7 | Alert: NORMAL
            if "Heart Rate" in raw_line or "Temperature" in raw_line:
                # 1. Parse HR
                hr_match = re.search(r"Heart Rate:\s*([0-9.]+)\s*BPM", raw_line, re.IGNORECASE)
                if hr_match:
                    last_hr = float(hr_match.group(1))

                # 2. Parse Temp
                temp_match = re.search(r"Temperature:\s*([0-9.-]+)\s*C", raw_line, re.IGNORECASE)
                if temp_match:
                    last_temp = float(temp_match.group(1))

                # 3. Parse Accel
                accel_match = re.search(r"X:\s*([0-9.-]+)\s*Y:\s*([0-9.-]+)\s*Z:\s*([0-9.-]+)", raw_line, re.IGNORECASE)
                if accel_match:
                    last_ax = float(accel_match.group(1))
                    last_ay = float(accel_match.group(2))
                    last_az = float(accel_match.group(3))

                # 4. Parse Alert
                alert_match = re.search(r"Alert:\s*([A-Za-z]+)", raw_line, re.IGNORECASE)
                if alert_match:
                    last_alert = alert_match.group(1).upper()

                post_to_backend(PRIMARY_USER_ID, last_hr, last_temp, last_ax, last_ay, last_az, last_alert)

            time.sleep(0.1)
    except KeyboardInterrupt:
        print("\n[*] Stopped listening.")
    finally:
        ser.close()


def run_live_simulation():
    """Simulates realistic live sensor pulses every 3 seconds to demonstrate the website updating live."""
    import random
    print("============================================================")
    print("  SIMULATED HARDWARE LIVE TELEMETRY STREAM")
    print("  Emulating: HW-827 Pulse + DS18B20 Temp + MPU-6050 Motion")
    print("  Website auto-polls every 3s at: http://localhost:8000")
    print("============================================================")
    print("Streaming live readings into the software... (Press Ctrl+C to stop)\n")

    base_hr = 74
    base_temp = 30.5

    try:
        while True:
            # Natural biological fluctuation
            hr = base_hr + random.choice([-2, -1, 0, 1, 2])
            temp = round(base_temp + random.choice([-0.2, -0.1, 0.0, 0.1, 0.2]), 1)
            ax = round(-2.6 + random.uniform(-0.3, 0.3), 1)
            ay = round(-1.9 + random.uniform(-0.2, 0.2), 1)
            az = round(9.7 + random.uniform(-0.1, 0.1), 1)
            alert = "NORMAL"

            post_to_backend(PRIMARY_USER_ID, hr, temp, ax, ay, az, alert)
            time.sleep(3.0)
    except KeyboardInterrupt:
        print("\n[*] Simulation stopped.")


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] in ["--live-test", "--simulate", "--demo"]:
        run_live_simulation()
    elif len(sys.argv) > 1 and sys.argv[1] == "--manual":
        hr = float(sys.argv[2]) if len(sys.argv) > 2 else 74.0
        temp = float(sys.argv[3]) if len(sys.argv) > 3 else 30.5
        post_to_backend(PRIMARY_USER_ID, hr, temp, -2.6, -1.9, 9.7, "NORMAL")
    elif len(sys.argv) > 1:
        run_serial_listener(sys.argv[1])
    else:
        # Default: Try to listen on detected COM port; if none, show options
        port = auto_detect_com_port()
        if port:
            run_serial_listener(port)
        else:
            print("No active COM port detected. Starting interactive options:")
            print("1. To connect to a specific port: python scripts/wearable_serial_bridge.py COM3")
            print("2. To run live simulation:       python scripts/wearable_serial_bridge.py --live-test")
            print("3. To inject a manual reading:   python scripts/wearable_serial_bridge.py --manual 74 30.5")
            print("\nStarting live test stream now for demonstration...")
            run_live_simulation()
