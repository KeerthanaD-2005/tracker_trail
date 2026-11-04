@echo off
echo Database location: %~dp0backend\menstrual_health.db
if exist "C:\Program Files\DB Browser for SQLite\DB Browser for SQLite.exe" (
    start "" "C:\Program Files\DB Browser for SQLite\DB Browser for SQLite.exe" "%~dp0backend\menstrual_health.db"
) else (
    echo [Info] DB Browser for SQLite executable not found at default path.
    echo Your database file is located at: %~dp0backend\menstrual_health.db
    pause
)
