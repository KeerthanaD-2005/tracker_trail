@echo off
title SELENE Model Training Pipeline
cd /d "%~dp0"
echo ======================================================================
echo    SELENE : XGBoost Athletic Strain Regressor Training Pipeline
echo ======================================================================
echo.
backend\.venv\Scripts\python.exe scripts\train_models.py
pause
