# 🔄 Налаштування стабільного сервера (автоматичний перезапуск)

Інструкція для налаштування сервера, який автоматично перезапускається при падінні та запускається при старті Windows.

---

## 🎯 Метод 1: Використання PM2 (Рекомендовано)

### Переваги:
- ✅ Автоматичний перезапуск при падінні
- ✅ Автозапуск при старті Windows
- ✅ Моніторинг та логи
- ✅ Легко керувати

### Крок 1: Встановлення

**Запустіть PowerShell як адміністратор:**
```powershell
cd C:\Users\Seros\Desktop\DP\1
powershell -ExecutionPolicy Bypass -File install-service.ps1
```

Скрипт автоматично:
- Встановить PM2 (процес-менеджер)
- Створить конфігурацію
- Налаштує автозапуск
- Запустить сервіси

### Крок 2: Перевірка

```powershell
pm2 status
```

Повинні бути запущені:
- `vita-edu-backend`
- `vita-edu-frontend`

### Крок 3: Корисні команди

```powershell
# Статус
pm2 status

# Логи
pm2 logs

# Перезапуск
pm2 restart all

# Зупинка
pm2 stop all

# Перезапуск конкретного сервісу
pm2 restart vita-edu-backend
pm2 restart vita-edu-frontend

# Видалити з автозапуску (якщо потрібно)
pm2 delete all
pm2 unstartup
```

---

## 🖥️ Метод 2: Налаштування Windows, щоб не засинав

### Варіант A: Відключення сну (тільки для сервера)

**Через PowerShell (як адміністратор):**
```powershell
# Вимкнути сон
powercfg /change standby-timeout-ac 0
powercfg /change standby-timeout-dc 0
powercfg /change monitor-timeout-ac 0
powercfg /change monitor-timeout-dc 0

# Вимкнути гібернацію
powercfg /hibernate off
```

**Через налаштування Windows:**
1. Налаштування → Система → Живлення та сон
2. Встановіть "Ніколи" для всіх параметрів
3. Додаткові параметри живлення → Налаштувати схему
4. Встановіть "Ніколи" для всіх таймерів

### Варіант B: Налаштування Wake-on-LAN (якщо потрібен віддалений запуск)

Увімкніть Wake-on-LAN в налаштуваннях мережевої карти.

---

## 🔧 Метод 3: Task Scheduler (Альтернатива PM2)

### Створення задачі для автозапуску

**Через PowerShell:**
```powershell
# Створення задачі для Backend
$action = New-ScheduledTaskAction -Execute "npm" -Argument "run dev" -WorkingDirectory "C:\Users\Seros\Desktop\DP\1\backend"
$trigger = New-ScheduledTaskTrigger -AtStartup
$principal = New-ScheduledTaskPrincipal -UserId "$env:USERNAME" -LogonType Interactive -RunLevel Highest
Register-ScheduledTask -TaskName "VITA-Edu Backend" -Action $action -Trigger $trigger -Principal $principal -Description "VITA-Edu Backend Server"

# Створення задачі для Frontend
$action2 = New-ScheduledTaskAction -Execute "npm" -Argument "run dev" -WorkingDirectory "C:\Users\Seros\Desktop\DP\1\frontend"
Register-ScheduledTask -TaskName "VITA-Edu Frontend" -Action $action2 -Trigger $trigger -Principal $principal -Description "VITA-Edu Frontend Server"
```

**Або через GUI:**
1. Win + R → `taskschd.msc`
2. Створити задачу
3. Налаштування:
   - Запуск: "При запуску комп'ютера"
   - Дія: Запустити програму
   - Програма: `npm`
   - Аргументи: `run dev`
   - Папка: `C:\Users\Seros\Desktop\DP\1\backend`

---

## 📋 Метод 4: Використання NSSM (Windows Service)

### Встановлення NSSM

1. Завантажте: https://nssm.cc/download
2. Розпакуйте в `C:\nssm`

### Створення сервісу

```powershell
# Backend сервіс
C:\nssm\win64\nssm.exe install "VITA-Edu-Backend" "C:\Program Files\nodejs\npm.cmd" "run dev"
C:\nssm\win64\nssm.exe set "VITA-Edu-Backend" AppDirectory "C:\Users\Seros\Desktop\DP\1\backend"
C:\nssm\win64\nssm.exe set "VITA-Edu-Backend" Description "VITA-Edu Backend Server"
C:\nssm\win64\nssm.exe set "VITA-Edu-Backend" Start SERVICE_AUTO_START

# Frontend сервіс
C:\nssm\win64\nssm.exe install "VITA-Edu-Frontend" "C:\Program Files\nodejs\npm.cmd" "run dev"
C:\nssm\win64\nssm.exe set "VITA-Edu-Frontend" AppDirectory "C:\Users\Seros\Desktop\DP\1\frontend"
C:\nssm\win64\nssm.exe set "VITA-Edu-Frontend" Description "VITA-Edu Frontend Server"
C:\nssm\win64\nssm.exe set "VITA-Edu-Frontend" Start SERVICE_AUTO_START

# Запуск сервісів
C:\nssm\win64\nssm.exe start "VITA-Edu-Backend"
C:\nssm\win64\nssm.exe start "VITA-Edu-Frontend"
```

---

## 🎯 Рекомендований підхід (PM2)

### Повна інструкція:

**1. Встановіть PM2:**
```powershell
# Запустіть PowerShell як адміністратор
cd C:\Users\Seros\Desktop\DP\1
powershell -ExecutionPolicy Bypass -File install-service.ps1
```

**2. Перевірте статус:**
```powershell
pm2 status
```

**3. Налаштуйте Windows (щоб не засинав):**
- Налаштування → Система → Живлення → "Ніколи" для сну

**4. Перевірте після перезавантаження:**
- Перезавантажте комп'ютер
- Після завантаження перевірте: `pm2 status`
- Сервіси мають запуститися автоматично

---

## 🔍 Моніторинг та діагностика

### Перевірка роботи сервісів:
```powershell
pm2 status
pm2 logs
```

### Перевірка доступності:
```powershell
# Перевірка Backend
Invoke-WebRequest -Uri "http://188.191.236.83:5000/api/health"

# Перевірка Frontend
Invoke-WebRequest -Uri "http://188.191.236.83:3000"
```

### Автоматична перевірка (скрипт):
```powershell
# Створіть файл check-server.ps1
while ($true) {
    try {
        $response = Invoke-WebRequest -Uri "http://188.191.236.83:5000/api/health" -TimeoutSec 5
        Write-Host "$(Get-Date): Server OK" -ForegroundColor Green
    } catch {
        Write-Host "$(Get-Date): Server DOWN - Restarting..." -ForegroundColor Red
        pm2 restart all
    }
    Start-Sleep -Seconds 60
}
```

---

## ⚠️ Важливі налаштування

### 1. Налаштування Windows Update

**Щоб Windows не перезавантажувався автоматично:**
1. Налаштування → Оновлення та безпека
2. Додаткові параметри
3. Вимкніть "Автоматичний перезапуск"

### 2. Налаштування роутера

**Щоб роутер не перезавантажувався:**
- Перевірте налаштування роутера
- Вимкніть автоматичні оновлення вночі
- Налаштуйте статичний IP для вашого ПК

### 3. Резервне копіювання

**Налаштуйте автоматичне резервне копіювання БД:**
```powershell
# Створіть backup-db.ps1
$backupFile = "backup_lms_db_$(Get-Date -Format 'yyyyMMdd_HHmmss').dump"
pg_dump -U postgres -h localhost -d lms_db -F c -f "C:\Backups\$backupFile"
```

---

## 📊 Порівняння методів

| Метод | Складність | Автоперезапуск | Автозапуск | Моніторинг |
|-------|-----------|----------------|------------|------------|
| **PM2** | ⭐ Легко | ✅ Так | ✅ Так | ✅ Так |
| **Task Scheduler** | ⭐⭐ Середньо | ❌ Ні | ✅ Так | ❌ Обмежено |
| **NSSM** | ⭐⭐⭐ Складно | ✅ Так | ✅ Так | ⭐ Обмежено |

---

## ✅ Швидкий старт (PM2)

```powershell
# 1. Встановлення (як адміністратор)
powershell -ExecutionPolicy Bypass -File install-service.ps1

# 2. Перевірка
pm2 status

# 3. Готово! Сервер працює і автоматично перезапускається
```

---

## 🆘 Troubleshooting

### Проблема: PM2 не запускається при старті
**Рішення:**
```powershell
pm2 unstartup
pm2 startup
pm2 save
```

### Проблема: Сервіси падають
**Рішення:**
```powershell
pm2 logs
# Перевірте логи на помилки
```

### Проблема: Комп'ютер засинає
**Рішення:**
- Перевірте налаштування живлення
- Вимкніть сон в Windows Settings
- Використайте команди `powercfg` (вище)

---

**Готово!** Ваш сервер тепер працюватиме стабільно і автоматично перезапускатиметься! 🚀

