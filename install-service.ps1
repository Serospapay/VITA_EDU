# PowerShell скрипт для встановлення Windows Service
# Запускає проект як Windows Service для автоматичного перезапуску

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  VITA-Edu Service Installer" -ForegroundColor Cyan
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

# Встановлення PM2 (процес-менеджер для Node.js)
Write-Host "[1/4] Встановлення PM2..." -ForegroundColor Yellow
npm install -g pm2
npm install -g pm2-windows-startup

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Не вдалося встановити PM2" -ForegroundColor Red
    pause
    exit 1
}
Write-Host "OK PM2 встановлено" -ForegroundColor Green
Write-Host ""

# Створення конфігурації PM2
Write-Host "[2/4] Створення конфігурації PM2..." -ForegroundColor Yellow

# Створюємо папки для логів
$backendLogsPath = Join-Path $PWD "backend\logs"
$frontendLogsPath = Join-Path $PWD "frontend\logs"
New-Item -ItemType Directory -Force -Path $backendLogsPath | Out-Null
New-Item -ItemType Directory -Force -Path $frontendLogsPath | Out-Null

# Створюємо JSON конфігурацію через PowerShell об'єкт
$pm2Config = @{
    apps = @(
        @{
            name = "vita-edu-backend"
            script = "npm"
            args = "run dev"
            cwd = Join-Path $PWD "backend"
            instances = 1
            autorestart = $true
            watch = $false
            max_memory_restart = "1G"
            env = @{
                NODE_ENV = "development"
            }
            error_file = Join-Path $PWD "backend\logs\pm2-error.log"
            out_file = Join-Path $PWD "backend\logs\pm2-out.log"
            log_date_format = "YYYY-MM-DD HH:mm:ss Z"
        },
        @{
            name = "vita-edu-frontend"
            script = "npm"
            args = "run dev"
            cwd = Join-Path $PWD "frontend"
            instances = 1
            autorestart = $true
            watch = $false
            max_memory_restart = "500M"
            env = @{
                NODE_ENV = "development"
            }
            error_file = Join-Path $PWD "frontend\logs\pm2-error.log"
            out_file = Join-Path $PWD "frontend\logs\pm2-out.log"
            log_date_format = "YYYY-MM-DD HH:mm:ss Z"
        }
    )
}

# Конвертуємо в JSON і зберігаємо
$pm2ConfigJson = $pm2Config | ConvertTo-Json -Depth 10
$pm2ConfigJson | Out-File -FilePath "ecosystem.config.json" -Encoding UTF8
Write-Host "OK Конфігурація створена" -ForegroundColor Green
Write-Host ""

# Налаштування автозапуску PM2
Write-Host "[3/4] Налаштування автозапуску..." -ForegroundColor Yellow
pm2 startup
Write-Host "OK Автозапуск налаштовано" -ForegroundColor Green
Write-Host ""

# Запуск сервісів
Write-Host "[4/4] Запуск сервісів..." -ForegroundColor Yellow
pm2 start ecosystem.config.json
pm2 save
Write-Host "OK Сервіси запущено" -ForegroundColor Green
Write-Host ""

Write-Host "========================================" -ForegroundColor Green
Write-Host "  Готово! Сервіси встановлено" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Корисні команди:" -ForegroundColor Cyan
Write-Host "  pm2 status          - Статус сервісів" -ForegroundColor White
Write-Host "  pm2 logs            - Переглянути логи" -ForegroundColor White
Write-Host "  pm2 restart all     - Перезапустити всі" -ForegroundColor White
Write-Host "  pm2 stop all        - Зупинити всі" -ForegroundColor White
Write-Host "  pm2 delete all      - Видалити з автозапуску" -ForegroundColor White
Write-Host ""
Write-Host "Сервіси автоматично запускатимуться при старті Windows" -ForegroundColor Green
Write-Host "і автоматично перезапускатимуться при падінні" -ForegroundColor Green
Write-Host ""
pause
