@echo off
title Wearable Hardware-to-Website Live Bridge
echo ========================================================
echo   Starting Wearable Hardware-to-Website Live Bridge
echo ========================================================
echo.
echo 1. Ensure your server is running (run_app.bat).
echo 2. Open http://localhost:8000 and go to the Biometrics tab.
echo.
echo Connecting to ESP32 Wearable Monitor...
echo.

cd /d "%~dp0"
"backend\.venv\Scripts\python.exe" scripts\wearable_serial_bridge.py %*

echo.
pause
