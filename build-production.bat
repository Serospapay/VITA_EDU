@echo off
chcp 65001 >nul
title VITA-Edu Production Build
echo ========================================
echo   VITA-Edu Production Build
echo ========================================
echo.

REM Check if .env files exist
if not exist "backend\.env.production" (
    echo ERROR: backend\.env.production not found!
    echo Please create it first. See DEPLOYMENT.md for instructions.
    pause
    exit /b 1
)

if not exist "frontend\.env.production" (
    echo ERROR: frontend\.env.production not found!
    echo Please create it first. See DEPLOYMENT.md for instructions.
    pause
    exit /b 1
)

echo [1/4] Copying environment files...
copy /Y "backend\.env.production" "backend\.env" >nul
copy /Y "frontend\.env.production" "frontend\.env.production.local" >nul
echo ✓ Environment files copied
echo.

echo [2/4] Building Backend...
cd /d "%~dp0backend"
call npm run build
if errorlevel 1 (
    echo ERROR: Backend build failed!
    pause
    exit /b 1
)
echo ✓ Backend built successfully
echo.

cd /d "%~dp0"
echo [3/4] Building Frontend...
cd /d "%~dp0frontend"
call npm run build
if errorlevel 1 (
    echo ERROR: Frontend build failed!
    pause
    exit /b 1
)
echo ✓ Frontend built successfully
echo.

cd /d "%~dp0"
echo [4/4] Build Summary
echo ========================================
echo ✓ Backend compiled to: backend\dist\
echo ✓ Frontend compiled to: frontend\dist\
echo.
echo Next steps:
echo   1. Start backend: cd backend ^&^& npm start
echo   3. Serve frontend: cd frontend ^&^& npm run preview
echo   4. Access at: http://188.191.236.83:5000
echo ========================================
echo.
pause








