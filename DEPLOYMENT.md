# 🚀 Деплой VITA-Edu на Railway

## Варіант 1: Повний стек на Railway (Рекомендовано)

### Крок 1: Створення облікового запису Railway
1. Перейдіть на https://railway.app/
2. Увійдіть через GitHub (ваш акаунт: Serospapay)
3. Безкоштовний trial: $5 credit/місяць

### Крок 2: Створення проекту на Railway
1. Натисніть **"New Project"**
2. Оберіть **"Deploy from GitHub repo"**
3. Виберіть репозиторій: **Serospapay/VITA_EDU**
4. Railway автоматично знайде `railway.json` і налаштує деплой

**⚠️ ВАЖЛИВО:** Після створення сервісу:
1. Перейдіть у налаштування сервісу (⚙️ Settings)
2. Знайдіть **"Root Directory"** 
3. Встановіть: **`backend`**
4. Збережіть зміни

Це вкаже Railway що проект знаходиться в папці `backend/`, а не в корені репозиторію.

### Крок 3: Додавання PostgreSQL бази даних
1. У проекті Railway натисніть **"New"** → **"Database"** → **"Add PostgreSQL"**
2. Railway автоматично створить базу даних
3. Скопіюйте `DATABASE_URL` з вкладки "Variables"

### Крок 4: Додавання Redis (опціонально, але рекомендовано)
1. У проекті Railway натисніть **"New"** → **"Database"** → **"Add Redis"**
2. Скопіюйте `REDIS_URL` з вкладки "Variables"

### Крок 5: Налаштування змінних оточення
У вашому Backend сервісі Railway, вкладка **"Variables"**, додайте:

```env
NODE_ENV=production
PORT=5000
HOST=0.0.0.0

# DATABASE_URL буде автоматично додано Railway при створенні PostgreSQL
# Якщо ні - скопіюйте з вкладки PostgreSQL

# REDIS_URL буде автоматично додано Railway при створенні Redis
# Якщо ні - скопіюйте з вкладки Redis

JWT_SECRET=your_super_secret_jwt_key_min_32_characters_long_change_this
JWT_REFRESH_SECRET=your_super_secret_refresh_token_key_min_32_characters_long_change_this
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

CORS_ORIGIN=https://your-frontend-domain.vercel.app,https://vita-edu-frontend.railway.app
# Оновіть після деплою frontend

FRONTEND_URL=https://your-frontend-domain.vercel.app
# Оновіть після деплою frontend

SERVER_URL=https://your-backend.railway.app
# Railway автоматично надасть URL, наприклад: https://vita-edu-production.up.railway.app

# Опціонально
REDIS_URL=redis://default:password@redis:6379
# Скопіюйте з Railway Redis сервісу
```

### Крок 6: Деплой Backend
Railway автоматично:
- Збудує проект (`npm run build`)
- Запустить сервер (`npm start`)
- Надасть публічний URL (наприклад: `https://vita-edu-backend.up.railway.app`)

### Крок 7: Виконання міграцій Prisma
Після першого деплою, потрібно запустити міграції:

1. У Railway Backend сервісі → **"Deployments"** → виберіть останній деплой
2. Натисніть **"View Logs"** → кнопка **"Run Command"**
3. Виконайте:
```bash
cd backend
npx prisma migrate deploy
npx prisma generate
npx ts-node prisma/seed-full.ts
```

Або додайте в `railway.json`:
```json
{
  "deploy": {
    "startCommand": "cd backend && npx prisma migrate deploy && npx prisma generate && npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### Крок 8: Деплой Frontend на Vercel (Швидкий варіант)

#### 8.1. Підготовка Frontend
1. Створіть `frontend/.env.production`:
```env
VITE_API_URL=https://your-backend.railway.app/api
VITE_WS_URL=wss://your-backend.railway.app
```

2. Зберіть frontend:
```bash
cd frontend
npm run build
```

#### 8.2. Деплой на Vercel
1. Перейдіть на https://vercel.com/
2. Увійдіть через GitHub
3. **"Add New Project"** → виберіть репозиторій VITA_EDU
4. Налаштування:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
5. Environment Variables:
   - `VITE_API_URL` = `https://your-backend.railway.app/api`
   - `VITE_WS_URL` = `wss://your-backend.railway.app`
6. Deploy!

---

## Варіант 2: Все на Railway (Простіше, але повільніше для frontend)

### Додавання Static Site для Frontend на Railway
1. У Railway проекті → **"New"** → **"Static Site"**
2. Root Directory: `frontend`
3. Build Command: `npm install && npm run build`
4. Output Directory: `dist`
5. Railway надасть URL для frontend

---

## Перевірка працездатності

### Backend API
- Swagger Docs: `https://your-backend.railway.app/api-docs`
- Health Check: `https://your-backend.railway.app/api/health`

### Frontend
- Головна: `https://your-frontend.vercel.app`

### Тестові облікові записи
```
Admin:   admin@vitaedu.com / password123
Teacher: dmytro.koval@vitaedu.com / password123
Student: ivan.petrenko@student.vitaedu.com / password123
```

---

## Оновлення деплою

Зміни автоматично деплояться при push в GitHub на гілку `main`.

Або вручну:
```bash
git push origin main
```

---

## Вартість

- **Railway**: Безкоштовний trial $5/міс (достатньо для демо)
- **Vercel**: Безкоштовно для статичних сайтів
- **Загалом**: **$0 для демонстрації** 🎉

---

## Troubleshooting

### ❌ Помилка: "npm: command not found" при збірці
**Проблема:** Railway намагається зібрати проект з кореня, а не з папки `backend/`

**Рішення:**
1. У Railway → ваш Backend сервіс → ⚙️ **Settings**
2. Знайдіть **"Root Directory"**
3. Встановіть значення: **`backend`**
4. Збережіть та перезапустіть деплой

Або використовуйте файл `nixpacks.toml` (вже додано в проект) - Railway автоматично його використає.

### Backend не запускається
1. Перевірте логи в Railway
2. Перевірте `DATABASE_URL` в Variables
3. Переконайтесь що **Root Directory** встановлено на `backend`
4. Переконайтесь що `railway.json` правильний

### Помилки з базою даних
1. Виконайте міграції: `npx prisma migrate deploy`
2. Перевірте підключення до PostgreSQL в Railway
3. Перевірте що `DATABASE_URL` правильний в Variables

### Frontend не підключається до Backend
1. Перевірте `VITE_API_URL` в Vercel Environment Variables
2. Перевірте `CORS_ORIGIN` в Railway Backend Variables
3. Для WebSocket використовуйте `wss://` (secure WebSocket)
4. Перевірте що Backend сервер працює: `https://your-backend.railway.app/api-docs`

---

## Оптимізація для production

1. **Додайте домен** (якщо потрібно):
   - Railway: Settings → Custom Domain
   - Vercel: Settings → Domains

2. **Налаштуйте SSL** (автоматично):
   - Railway: автоматичний HTTPS
   - Vercel: автоматичний HTTPS

3. **Моніторинг**:
   - Railway має вбудований моніторинг
   - Додайте Sentry для error tracking (опціонально)

---

**Готово! Ваш проект тепер доступний онлайн з повним функціоналом! 🚀**

