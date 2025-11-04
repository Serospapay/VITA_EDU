# 🖥️ Налаштування проекту на новому ПК

Покрокова інструкція для розгортання VITA-Edu на новому комп'ютері.

---

## 📋 Передумови

### 1. Встановіть необхідне програмне забезпечення:

**Обов'язкове:**
- **Node.js 18+** — https://nodejs.org/
- **PostgreSQL 14+** — https://www.postgresql.org/download/windows/
- **Git** — https://git-scm.com/download/win

**Опціональне (але рекомендовано):**
- **Memurai (Redis)** — https://www.memurai.com/ (для кешування)
- **VS Code** — https://code.visualstudio.com/

---

## 🚀 Крок 1: Клонування проекту

### 1.1. Відкрийте PowerShell або Command Prompt

### 1.2. Клонуйте репозиторій:
```powershell
cd C:\Users\ВашеІм'я\Desktop
git clone https://github.com/Serospapay/VITA_EDU.git
cd VITA_EDU
```

### 1.3. Перевірте, що все склоновано:
```powershell
dir
```
Повинні бути папки: `backend`, `frontend`, файли `setup.ps1`, `start.bat` тощо.

---

## 🗄️ Крок 2: Налаштування PostgreSQL

### 2.1. Перевірте, що PostgreSQL встановлено:
```powershell
psql --version
```

### 2.2. Створіть базу даних:
```powershell
# Запустіть PostgreSQL
psql -U postgres

# У консолі PostgreSQL виконайте:
CREATE DATABASE lms_db;
\q
```

**Або використайте автоматичний скрипт:**
```powershell
cd backend
node scripts/create-database.js
```

---

## ⚙️ Крок 3: Налаштування змінних оточення

### 3.1. Створіть `.env` файл в корені проекту:

**В корені проекту** (`C:\Users\ВашеІм'я\Desktop\VITA_EDU\.env`):
```env
NODE_ENV=development
PORT=5000
HOST=localhost
SERVER_URL=http://localhost:5000
CORS_ORIGIN=http://localhost:3000

DATABASE_URL=postgresql://postgres:ВАШ_ПАРОЛЬ@localhost:5432/lms_db?schema=public

JWT_SECRET=your_super_secret_access_token_key_min_32_characters_long
JWT_REFRESH_SECRET=your_super_secret_refresh_token_key_min_32_characters_long
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

REDIS_URL=redis://localhost:6379
```

**Замініть:**
- `ВАШ_ПАРОЛЬ` — пароль PostgreSQL користувача `postgres`

### 3.2. Створіть `backend/.env` файл:

**В папці backend** (`backend\.env`):
```env
NODE_ENV=development
PORT=5000
HOST=localhost
SERVER_URL=http://localhost:5000
CORS_ORIGIN=http://localhost:3000

DATABASE_URL=postgresql://postgres:ВАШ_ПАРОЛЬ@localhost:5432/lms_db?schema=public

JWT_SECRET=your_super_secret_access_token_key_min_32_characters_long
JWT_REFRESH_SECRET=your_super_secret_refresh_token_key_min_32_characters_long
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

REDIS_URL=redis://localhost:6379
```

### 3.3. Створіть `frontend/.env` файл:

**В папці frontend** (`frontend\.env`):
```env
VITE_API_URL=http://localhost:5000/api
VITE_WS_URL=ws://localhost:5000
```

---

## 📦 Крок 4: Встановлення залежностей

### 4.1. Встановіть Backend залежності:
```powershell
cd backend
npm install
```

### 4.2. Згенеруйте Prisma Client:
```powershell
npx prisma generate
```

### 4.3. Виконайте міграції бази даних:
```powershell
npx prisma migrate deploy
```

### 4.4. Заповніть базу тестовими даними (опціонально):
```powershell
npx ts-node prisma/seed-full.ts
```

### 4.5. Встановіть Frontend залежності:
```powershell
cd ..\frontend
npm install
```

---

## 🎯 Крок 5: Запуск проекту

### Варіант 1: Автоматичний запуск (рекомендовано)

**Просто двічі клацніть:**
```
start.bat
```

Це автоматично запустить backend і frontend.

### Варіант 2: Ручний запуск

**Термінал 1 (Backend):**
```powershell
cd backend
npm run dev
```

**Термінал 2 (Frontend):**
```powershell
cd frontend
npm run dev
```

---

## ✅ Перевірка працездатності

### Backend:
- **Swagger Docs:** http://localhost:5000/api-docs
- **Health Check:** http://localhost:5000/api/health
- **API:** http://localhost:5000/api

### Frontend:
- **Головна сторінка:** http://localhost:3000

### Тестові облікові записи:
```
Admin:   admin@vitaedu.com / password123
Teacher: dmytro.koval@vitaedu.com / password123
Student: ivan.petrenko@student.vitaedu.com / password123
```

---

## 🔧 Альтернативний спосіб: Використання автоматичного скрипта

Якщо у вас є файл `setup.ps1`, ви можете використати його:

```powershell
powershell -ExecutionPolicy Bypass -File setup.ps1
```

Скрипт автоматично:
- Перевірить встановлення Node.js, PostgreSQL, Redis
- Запитає пароль PostgreSQL
- Створить базу даних
- Встановить залежності
- Створить .env файли
- Запустить міграції та seed

---

## ⚠️ Можливі проблеми та рішення

### Проблема: PostgreSQL не знайдено
**Рішення:**
- Додайте PostgreSQL до PATH: `C:\Program Files\PostgreSQL\14\bin`
- Або встановіть PostgreSQL заново

### Проблема: Порт 5000 або 3000 зайнятий
**Рішення:**
```powershell
# Знайти процес на порту 5000
netstat -ano | findstr :5000

# Зупинити процес (замініть PID на номер з попередньої команди)
taskkill /PID <номер> /F
```

### Проблема: Помилка з Prisma
**Рішення:**
```powershell
cd backend
npx prisma generate
npx prisma migrate deploy
```

### Проблема: Redis не працює
**Рішення:**
- Backend працює без Redis (просто без кешування)
- Або встановіть Memurai: https://www.memurai.com/

---

## 📝 Швидка перевірка чеклист

- [ ] Node.js встановлено (`node --version`)
- [ ] PostgreSQL встановлено (`psql --version`)
- [ ] Git встановлено (`git --version`)
- [ ] Проект склоновано з GitHub
- [ ] Створено `.env` файли (корінь, backend, frontend)
- [ ] Встановлено `DATABASE_URL` з правильним паролем
- [ ] Створено базу даних `lms_db`
- [ ] Встановлено залежності (`npm install` в backend і frontend)
- [ ] Згенеровано Prisma Client (`npx prisma generate`)
- [ ] Виконано міграції (`npx prisma migrate deploy`)
- [ ] Backend запускається (`npm run dev` в backend)
- [ ] Frontend запускається (`npm run dev` в frontend)

---

## 🎉 Готово!

Після виконання всіх кроків ваш проект має працювати на новому ПК.

**Для швидкого запуску в майбутньому:**
Просто двічі клацніть на `start.bat` — все запуститься автоматично!

---

## 📞 Додаткова інформація

- **Детальна документація:** `README.md`
- **Інструкції з деплою:** `DEPLOYMENT.md`
- **GitHub репозиторій:** https://github.com/Serospapay/VITA_EDU

