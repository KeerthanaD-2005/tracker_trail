@echo off
title Train & Calibrate ML Models on Hardware Database Records
echo ========================================================
echo   Training & Calibrating ML Models on Live Hardware Data
echo ========================================================
echo.
echo Reads stored sensor telemetry from the database (wearable_signals)
echo and personalizes the XGBoost, LSTM, and AI prediction models.
echo.

cd /d "%~dp0"
"backend\.venv\Scripts\python.exe" scripts\train_from_database.py

echo.
pause
