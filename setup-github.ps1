# GitHub Setup Script для VITA-Edu Project
# Автоматичне налаштування Git та завантаження на GitHub

Write-Host "=== GitHub Setup для VITA-Edu ===" -ForegroundColor Cyan
Write-Host ""

# Крок 1: Перевірка Git
Write-Host "[1/7] Перевірка встановлення Git..." -ForegroundColor Yellow
try {
    $gitVersion = git --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Git знайдено: $gitVersion" -ForegroundColor Green
    } else {
        throw "Git not found"
    }
} catch {
    Write-Host "✗ Git не знайдено в PATH!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Рішення:" -ForegroundColor Yellow
    Write-Host "1. Перезапустіть PowerShell (якщо Git щойно встановлено)" -ForegroundColor White
    Write-Host "2. Або додайте Git до PATH:" -ForegroundColor White
    $pathCommand = '$env:Path += ";C:\Program Files\Git\bin"'
    Write-Host "   $pathCommand" -ForegroundColor Gray
    Write-Host "3. Або використайте Git Bash" -ForegroundColor White
    Write-Host ""
    exit 1
}

Write-Host ""

# Крок 2: Перевірка конфігурації Git
Write-Host "[2/7] Перевірка конфігурації Git..." -ForegroundColor Yellow
$userName = git config --global user.name
$userEmail = git config --global user.email

if (-not $userName -or -not $userEmail) {
    Write-Host "⚠ Git не налаштовано. Введіть дані:" -ForegroundColor Yellow
    $userName = Read-Host "Ваше ім'я (наприклад: Іван Іванов)"
    $userEmail = Read-Host "Ваш email (наприклад: ivan@example.com)"
    
    git config --global user.name "$userName"
    git config --global user.email "$userEmail"
    Write-Host "✓ Git налаштовано!" -ForegroundColor Green
} else {
    Write-Host "✓ Git налаштовано: $userName <$userEmail>" -ForegroundColor Green
}

Write-Host ""

# Крок 3: Ініціалізація репозиторію
Write-Host "[3/7] Ініціалізація Git репозиторію..." -ForegroundColor Yellow
if (Test-Path ".git") {
    Write-Host "⚠ Репозиторій вже ініціалізовано" -ForegroundColor Yellow
    $reinit = Read-Host "Переініціалізувати? (y/N)"
    if ($reinit -eq "y" -or $reinit -eq "Y") {
        Remove-Item -Recurse -Force .git
        git init
        Write-Host "✓ Репозиторій переініціалізовано" -ForegroundColor Green
    }
} else {
    git init
    Write-Host "✓ Репозиторій ініціалізовано" -ForegroundColor Green
}

Write-Host ""

# Крок 4: Перевірка .gitignore
Write-Host "[4/7] Перевірка .gitignore..." -ForegroundColor Yellow
if (Test-Path ".gitignore") {
    Write-Host "✓ .gitignore знайдено" -ForegroundColor Green
} else {
    Write-Host "⚠ .gitignore не знайдено!" -ForegroundColor Yellow
}

Write-Host ""

# Крок 5: Додавання файлів
Write-Host "[5/7] Додавання файлів до індексу..." -ForegroundColor Yellow
git add .
$filesCount = (git status --short | Measure-Object -Line).Lines
Write-Host "✓ Додано файлів: $filesCount" -ForegroundColor Green

Write-Host ""

# Крок 6: Створення першого коміту
Write-Host "[6/7] Створення першого коміту..." -ForegroundColor Yellow
$commitMessage = "Initial commit: VITA-Edu - Online IT School Platform"

# Перевірка, чи є зміни для коміту
$status = git status --porcelain
if ($status) {
    git commit -m $commitMessage
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Коміт створено:" -ForegroundColor Green
        Write-Host "  '$commitMessage'" -ForegroundColor Gray
    } else {
        Write-Host "✗ Помилка створення коміту" -ForegroundColor Red
        exit 1
    }
} else {
    $warningMsg = "⚠ Немає змін для коміту (можливо, все вже закомічено)"
    Write-Host $warningMsg -ForegroundColor Yellow
}

Write-Host ""

# Крок 7: Налаштування GitHub
Write-Host "[7/7] Налаштування GitHub..." -ForegroundColor Yellow
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "Наступні кроки:" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Створіть новий репозиторій на GitHub:" -ForegroundColor White
Write-Host "   https://github.com/new" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Назва репозиторію (рекомендовано): vita-edu" -ForegroundColor White
Write-Host ""
$dontCreateMsg = "3. НЕ створюйте README, .gitignore, license (вони вже є)"
Write-Host $dontCreateMsg -ForegroundColor Yellow
Write-Host ""
Write-Host "4. Після створення репозиторію виконайте:" -ForegroundColor White
Write-Host ""
Write-Host "   git branch -M main" -ForegroundColor Gray
Write-Host "   git remote add origin https://github.com/USERNAME/REPO_NAME.git" -ForegroundColor Gray
Write-Host "   git push -u origin main" -ForegroundColor Gray
Write-Host ""
$replaceMsg = "   (замініть USERNAME та REPO_NAME на ваші)"
Write-Host $replaceMsg -ForegroundColor Yellow
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Опціонально: попередня конфігурація remote
$setupRemote = Read-Host "Хочете налаштувати remote зараз? (y/N)"
if ($setupRemote -eq "y" -or $setupRemote -eq "Y") {
    Write-Host ""
    $githubUsername = Read-Host "Ваш GitHub username"
    $repoName = Read-Host "Назва репозиторію (наприклад: vita-edu)"
    
    git branch -M main
    
    # Перевірка, чи remote вже існує
    $existingRemote = git remote get-url origin 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "⚠ Remote 'origin' вже існує: $existingRemote" -ForegroundColor Yellow
        $replace = Read-Host "Замінити? (y/N)"
        if ($replace -eq "y" -or $replace -eq "Y") {
            git remote set-url origin "https://github.com/$githubUsername/$repoName.git"
            Write-Host "✓ Remote оновлено" -ForegroundColor Green
        }
    } else {
        git remote add origin "https://github.com/$githubUsername/$repoName.git"
        $remoteUrl = "https://github.com/$githubUsername/$repoName.git"
        Write-Host "✓ Remote додано: origin -> $remoteUrl" -ForegroundColor Green
    }
    
    Write-Host ""
    Write-Host "Тепер виконайте:" -ForegroundColor Cyan
    Write-Host "  git push -u origin main" -ForegroundColor Gray
    Write-Host ""
}

Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "✓ Налаштування завершено!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""
