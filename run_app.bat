@echo off
title Menstrual and Athletic Health Tracker - Server
echo ========================================================
echo   Starting Menstrual and Athletic Health Tracker
echo ========================================================
echo.
echo Local Web Link:   http://localhost:8000  (or http://127.0.0.1:8000)
echo Mobile Phone Link: http://192.168.1.2:8000
echo.
echo Demo Account:
echo   Email:    demo@university.edu
echo   Password: demopass123
echo.
echo ========================================================
echo   IMPORTANT: KEEP THIS WINDOW OPEN!
echo   (You can minimize it, but do not close it while using the app)
echo ========================================================
echo.

cd /d "%~dp0backend"

:: Automatically open browser after 2 seconds
start "" cmd /c "timeout /t 2 /nobreak >nul && start http://localhost:8000"

:: Run Uvicorn in this window so it stays alive reliably
".venv\Scripts\python.exe" -m uvicorn app.main:app --host 0.0.0.0 --port 8000

echo.
echo Server stopped.
pause
