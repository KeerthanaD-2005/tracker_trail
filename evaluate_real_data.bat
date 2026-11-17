@echo off
title SELENE Real Data Benchmark Evaluation
cd /d "%~dp0"
echo ======================================================================
echo    SELENE : Real-World Menstrual Cycle Benchmark Evaluation
echo ======================================================================
echo.
backend\.venv\Scripts\python.exe scripts\evaluate_real_cycle_data.py
pause
