import socket
import sys
import time
import webbrowser
from pathlib import Path
import uvicorn


def find_available_port(preferred_ports=(8000, 8001, 8080, 5000)):
    for port in preferred_ports:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            try:
                s.bind(("0.0.0.0", port))
                return port
            except OSError:
                continue
    # Fallback to ephemeral port
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(("", 0))
        return s.getsockname()[1]


def get_local_ip():
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as s:
            s.connect(("8.8.8.8", 80))
            return s.getsockname()[0]
    except Exception:
        return "127.0.0.1"


def main():
    port = find_available_port()
    local_ip = get_local_ip()

    print("=" * 60)
    print("  Menstrual & Athletic Health Tracker - Local Server")
    print("=" * 60)
    print()
    print(f"  > Web App URL:      http://localhost:{port}")
    print(f"  > Alternative URL:  http://127.0.0.1:{port}")
    print(f"  > Mobile on Wi-Fi:  http://{local_ip}:{port}")
    print()
    print("  Demo Account Credentials:")
    print("    Email:    demo@university.edu")
    print("    Password: demopass123")
    print()
    print("=" * 60)
    print("  Keep this window open while using the application.")
    print("=" * 60)
    print()

    # Open browser automatically in a background thread
    import threading

    def open_browser():
        time.sleep(1.5)
        try:
            webbrowser.open(f"http://localhost:{port}")
        except Exception:
            pass

    threading.Thread(target=open_browser, daemon=True).start()

    # Run Uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, log_level="info")


if __name__ == "__main__":
    main()
