# VITA-Edu - Automatic Setup Script
# Usage: powershell -ExecutionPolicy Bypass -File setup.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  VITA-Edu Automatic Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

function Test-Command {
    param($command)
    try {
        if (Get-Command $command -ErrorAction Stop) { return $true }
    } catch { return $false }
}

# 1. Check Node.js
Write-Host "[1/7] Checking Node.js..." -ForegroundColor Yellow
if (Test-Command "node") {
    $nodeVersion = node --version
    Write-Host "OK Node.js installed: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "ERROR Node.js not found!" -ForegroundColor Red
    Write-Host "Download from https://nodejs.org/ and install" -ForegroundColor Yellow
    Write-Host "Then run this script again" -ForegroundColor Yellow
    exit 1
}

# 2. Check PostgreSQL
Write-Host ""
Write-Host "[2/7] Checking PostgreSQL..." -ForegroundColor Yellow
if (Test-Command "psql") {
    $pgVersion = psql --version
    Write-Host "OK PostgreSQL installed: $pgVersion" -ForegroundColor Green
} else {
    Write-Host "WARNING PostgreSQL not found in PATH" -ForegroundColor Yellow
    Write-Host "If PostgreSQL is installed, add to PATH:" -ForegroundColor Yellow
    Write-Host "C:\Program Files\PostgreSQL\14\bin" -ForegroundColor Cyan
    $continue = Read-Host "Continue without PostgreSQL in PATH? (y/n)"
    if ($continue -ne "y") { exit 1 }
}

# 3. Check Redis
Write-Host ""
Write-Host "[3/7] Checking Redis..." -ForegroundColor Yellow
if (Test-Command "redis-cli") {
    Write-Host "OK Redis installed" -ForegroundColor Green
} else {
    Write-Host "WARNING Redis not found" -ForegroundColor Yellow
    Write-Host "Install Memurai: https://www.memurai.com/" -ForegroundColor Yellow
    $continue = Read-Host "Continue without Redis? (y/n)"
    if ($continue -ne "y") { exit 1 }
}

# 4. Get PostgreSQL password
Write-Host ""
Write-Host "[4/7] Database setup..." -ForegroundColor Yellow
$dbPassword = Read-Host "Enter PostgreSQL password for user 'postgres'" -AsSecureString
$dbPasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($dbPassword))

# 5. Create database
Write-Host ""
Write-Host "[5/7] Creating database vitaedu_db..." -ForegroundColor Yellow
$env:PGPASSWORD = $dbPasswordPlain
try {
    $dbExists = psql -U postgres -lqt 2>$null | Select-String -Pattern "vitaedu_db" -Quiet
    if ($dbExists) {
        Write-Host "WARNING Database vitaedu_db already exists" -ForegroundColor Yellow
        $recreate = Read-Host "Recreate database? All data will be deleted! (y/n)"
        if ($recreate -eq "y") {
            psql -U postgres -c "DROP DATABASE IF EXISTS vitaedu_db;" 2>$null
            psql -U postgres -c "CREATE DATABASE vitaedu_db;" 2>$null
            Write-Host "OK Database recreated" -ForegroundColor Green
        }
    } else {
        psql -U postgres -c "CREATE DATABASE vitaedu_db;" 2>$null
        Write-Host "OK Database created" -ForegroundColor Green
    }
} catch {
    Write-Host "WARNING Could not create DB automatically. Create manually:" -ForegroundColor Yellow
    Write-Host "psql -U postgres" -ForegroundColor Cyan
    Write-Host "CREATE DATABASE vitaedu_db;" -ForegroundColor Cyan
}
Remove-Item Env:\PGPASSWORD

# 6. Backend Setup
Write-Host ""
Write-Host "[6/7] Backend setup..." -ForegroundColor Yellow
Set-Location -Path "backend"

Write-Host "Installing npm packages (2-5 minutes)..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR npm install failed" -ForegroundColor Red
    exit 1
}
Write-Host "OK Backend packages installed" -ForegroundColor Green

# Create .env
Write-Host "Creating .env file..." -ForegroundColor Yellow
$envContent = @"
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://postgres:$dbPasswordPlain@localhost:5432/vitaedu_db
REDIS_URL=redis://localhost:6379
JWT_SECRET=lms-jwt-secret-$(Get-Random)-change-in-production
JWT_EXPIRES_IN=1h
JWT_REFRESH_SECRET=lms-refresh-secret-$(Get-Random)-change-in-production
JWT_REFRESH_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM=noreply@lms.local
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin123
MINIO_BUCKET=lms-files
MINIO_USE_SSL=false
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=pdf,doc,docx,ppt,pptx,xls,xlsx,jpg,jpeg,png,gif,mp4,avi,mov
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL=debug
FRONTEND_URL=http://localhost:3000
SESSION_SECRET=lms-session-$(Get-Random)-change-in-production
"@

$envContent | Out-File -FilePath ".env" -Encoding UTF8
Write-Host "OK .env file created" -ForegroundColor Green

if (-not (Test-Path "logs")) {
    New-Item -ItemType Directory -Path "logs" | Out-Null
    Write-Host "OK logs folder created" -ForegroundColor Green
}

Write-Host "Generating Prisma Client..." -ForegroundColor Yellow
npx prisma generate
Write-Host "OK Prisma Client generated" -ForegroundColor Green

Write-Host "Running migrations..." -ForegroundColor Yellow
npx prisma migrate dev --name init
Write-Host "OK Migrations completed" -ForegroundColor Green

Write-Host "Seeding database..." -ForegroundColor Yellow
npx prisma db seed
Write-Host "OK Database seeded" -ForegroundColor Green

Set-Location -Path ".."

# 7. Frontend Setup
Write-Host ""
Write-Host "[7/7] Frontend setup..." -ForegroundColor Yellow
Set-Location -Path "frontend"

Write-Host "Installing npm packages (2-5 minutes)..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR npm install failed" -ForegroundColor Red
    exit 1
}
Write-Host "OK Frontend packages installed" -ForegroundColor Green

Write-Host "Creating .env file..." -ForegroundColor Yellow
$frontendEnv = @"
VITE_API_URL=http://localhost:5000/api
VITE_WS_URL=ws://localhost:5000
"@

$frontendEnv | Out-File -FilePath ".env" -Encoding UTF8
Write-Host "OK .env file created" -ForegroundColor Green

Set-Location -Path ".."

# Done
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  SUCCESS! Setup completed!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Test accounts:" -ForegroundColor Cyan
Write-Host "  Admin:   admin@vitaedu.com / password123" -ForegroundColor White
Write-Host "  Teacher: dmytro.koval@vitaedu.com / password123 (+5 more)" -ForegroundColor White
Write-Host "  Student: ivan.petrenko@student.vitaedu.com / password123 (+12 more)" -ForegroundColor White
Write-Host ""
Write-Host "Database: 12 courses, 7 categories, 31 enrollments" -ForegroundColor Green
Write-Host ""
Write-Host "To start the project:" -ForegroundColor Cyan
Write-Host "  Double-click: start.bat" -ForegroundColor Yellow
Write-Host ""
Write-Host "Or manually:" -ForegroundColor Cyan
Write-Host "  Window 1: cd backend; npm run dev" -ForegroundColor White
Write-Host "  Window 2: cd frontend; npm run dev" -ForegroundColor White
Write-Host "  Browser: http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

