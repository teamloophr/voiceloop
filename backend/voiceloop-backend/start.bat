@echo off
echo.
echo ========================================
echo    VoiceLoop Backend Startup Script
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Error: Python is not installed or not in PATH
    echo Please install Python 3.8+ and try again
    pause
    exit /b 1
)

echo ✅ Python found
python --version

echo.
echo 🚀 Starting VoiceLoop Backend...
echo.

REM Change to script directory
cd /d "%~dp0"

REM Start the Python server
python start.py

echo.
echo 👋 Server stopped
pause
