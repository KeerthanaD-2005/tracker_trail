@echo off
title Menstrual and Athletic Health Tracker - Server
echo ========================================================
echo   Starting Menstrual and Athletic Health Tracker
echo ========================================================
echo.

cd /d "%~dp0backend"

:: Run the smart auto-port runner with browser launcher
".venv\Scripts\python.exe" run.py

echo.
echo Server stopped.
pause
