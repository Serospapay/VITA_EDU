@echo off
title VITA-Edu Production Server
echo ========================================
echo    VITA-Edu Production Server Startup
echo ========================================
echo.

REM Check if .env file exists
if not exist "backend\.env.production" (
    echo WARNING: backend\.env.production not found!
    echo Creating from template...
    copy /Y "backend\.env.production" "backend\.env" >nul 2>&1
    if errorlevel 1 (
        echo ERROR: Could not create .env file
        pause
        exit /b 1
    )
    echo Created backend\.env from .env.production
    echo Please edit backend\.env with your actual configuration!
    pause
)

REM Start Backend
echo Starting Backend Server...
cd /d "%~dp0backend"
start "VITA-Edu Backend" cmd /k "npm run build && npm start"
timeout /t 3 >nul

echo.
echo ========================================
echo Backend server started on http://188.191.236.83:5000
echo ========================================
echo.
echo Frontend should be built and served separately:
echo   cd frontend
echo   npm run build
echo   npm run preview
echo.
pause












