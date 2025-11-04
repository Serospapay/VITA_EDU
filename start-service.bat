@echo off
chcp 65001 >nul
title VITA-Edu Service Manager
echo ========================================
echo   VITA-Edu Service Manager
echo ========================================
echo.

REM Перевірка чи PM2 встановлено
where pm2 >nul 2>&1
if errorlevel 1 (
    echo PM2 не встановлено!
    echo Запустіть install-service.ps1 для встановлення
    pause
    exit /b 1
)

echo Доступні команди:
echo.
echo [1] Статус сервісів
echo [2] Перезапустити всі сервіси
echo [3] Зупинити всі сервіси
echo [4] Переглянути логи
echo [5] Вийти
echo.

set /p choice="Виберіть команду (1-5): "

if "%choice%"=="1" (
    echo.
    pm2 status
    pause
    goto :end
)

if "%choice%"=="2" (
    echo.
    echo Перезапуск сервісів...
    pm2 restart all
    pause
    goto :end
)

if "%choice%"=="3" (
    echo.
    echo Зупинка сервісів...
    pm2 stop all
    pause
    goto :end
)

if "%choice%"=="4" (
    echo.
    pm2 logs
    goto :end
)

if "%choice%"=="5" (
    exit /b 0
)

:end
goto :eof

