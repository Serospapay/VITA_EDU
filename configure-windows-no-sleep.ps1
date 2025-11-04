# PowerShell скрипт для налаштування Windows (щоб не засинав)
# Запускайте як адміністратор

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Налаштування Windows (відключення сну)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Перевірка прав адміністратора
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "ERROR: Потрібні права адміністратора!" -ForegroundColor Red
    Write-Host "Запустіть PowerShell як адміністратор" -ForegroundColor Yellow
    Write-Host ""
    pause
    exit 1
}

Write-Host "[1/5] Вимкнення сну (AC Power)..." -ForegroundColor Yellow
powercfg /change standby-timeout-ac 0
powercfg /change monitor-timeout-ac 0
powercfg /change disk-timeout-ac 0
Write-Host "OK Сон вимкнено для AC Power" -ForegroundColor Green
Write-Host ""

Write-Host "[2/5] Вимкнення сну (Battery)..." -ForegroundColor Yellow
powercfg /change standby-timeout-dc 0
powercfg /change monitor-timeout-dc 0
powercfg /change disk-timeout-dc 0
Write-Host "OK Сон вимкнено для Battery" -ForegroundColor Green
Write-Host ""

Write-Host "[3/5] Вимкнення гібернації..." -ForegroundColor Yellow
powercfg /hibernate off
Write-Host "OK Гібернація вимкнена" -ForegroundColor Green
Write-Host ""

Write-Host "[4/5] Вимкнення автоматичного перезавантаження Windows Update..." -ForegroundColor Yellow
# Створюємо реєстр для вимкнення автоматичного перезавантаження
$regPath = "HKLM:\SOFTWARE\Policies\Microsoft\Windows\WindowsUpdate\AU"
if (-not (Test-Path $regPath)) {
    New-Item -Path $regPath -Force | Out-Null
}
Set-ItemProperty -Path $regPath -Name "NoAutoRebootWithLoggedOnUsers" -Value 1 -Type DWord -Force
Write-Host "OK Автоматичний перезапуск вимкнено" -ForegroundColor Green
Write-Host ""

Write-Host "[5/5] Перевірка поточних налаштувань..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Поточні налаштування:" -ForegroundColor Cyan
powercfg /query SCHEME_CURRENT SUB_SLEEP STANDBYIDLE
powercfg /query SCHEME_CURRENT SUB_VIDEO VIDEOIDLE
powercfg /query SCHEME_CURRENT SUB_DISK DISKIDLE
Write-Host ""

Write-Host "========================================" -ForegroundColor Green
Write-Host "  Готово! Windows налаштовано" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Комп'ютер більше не засинатиме автоматично" -ForegroundColor Green
Write-Host "Перезавантаження після оновлень вимкнено" -ForegroundColor Green
Write-Host ""
Write-Host "Примітка: Якщо потрібно повернути налаштування:" -ForegroundColor Yellow
Write-Host "  powercfg /change standby-timeout-ac 30" -ForegroundColor White
Write-Host "  powercfg /change monitor-timeout-ac 10" -ForegroundColor White
Write-Host "  powercfg /hibernate on" -ForegroundColor White
Write-Host ""
pause

