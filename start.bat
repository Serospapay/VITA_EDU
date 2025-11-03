@echo off
chcp 65001 >nul
REM VITA-Edu - Launch Script
REM Double-click to start

echo ========================================
echo   VITA-Edu Starting...
echo ========================================
echo.

REM Get local IP address for network access
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4 Address"') do (
    set IP=%%a
    goto :found_ip
)
:found_ip
REM Clean up spaces
set IP=%IP:~1%

REM Start Backend
echo [1/3] Starting Backend...
start "VITA-Edu Backend" cmd /k "title VITA-Edu Backend && cd /d %CD%\backend && npm run dev"

REM Wait
echo [2/3] Waiting 10 seconds...
timeout /t 10 /nobreak > nul

REM Start Frontend
echo [3/3] Starting Frontend...
start "VITA-Edu Frontend" cmd /k "title VITA-Edu Frontend && cd /d %CD%\frontend && npm run dev"

REM Wait
timeout /t 5 /nobreak > nul

REM Open browser
echo Opening browser...
timeout /t 3 /nobreak > nul
start http://localhost:3000

echo.
echo ========================================
echo   VITA-Edu Running!
echo ========================================
echo.
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:5000
echo.
if not "%IP%"=="" (
    echo.
    echo ========================================
    echo   Network Access Enabled!
    echo ========================================
    echo.
    echo Frontend (Network): http://%IP%:3000
    echo Backend (Network):  http://%IP%:5000
    echo API Docs:           http://%IP%:5000/api-docs
    echo.
    echo Other devices can access through these URLs
    echo.
)
echo Press any key to stop all services...
pause >nul

REM Kill processes when user exits
taskkill /F /FI "WINDOWTITLE eq VITA-Edu Backend" >nul 2>&1
taskkill /F /FI "WINDOWTITLE eq VITA-Edu Frontend" >nul 2>&1
echo.
echo All services stopped.
timeout /t 2 >nul





