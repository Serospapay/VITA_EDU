# Vidnovlennia .env failiv do pochatkovoho stanu

Write-Host "Vidnovlennia .env failiv..." -ForegroundColor Cyan
Write-Host ""

# Backend .env
$backendEnvPath = "backend\.env"
if (Test-Path $backendEnvPath) {
    Write-Host "Onovlennia backend/.env..." -ForegroundColor Yellow
    $content = Get-Content $backendEnvPath -Raw
    
    # Zamina CORS_ORIGIN
    if ($content -match "CORS_ORIGIN=.*") {
        $content = $content -replace "CORS_ORIGIN=.*", "CORS_ORIGIN=http://localhost:3000"
    } else {
        $content += "`nCORS_ORIGIN=http://localhost:3000"
    }
    
    # Zamina FRONTEND_URL
    if ($content -match "FRONTEND_URL=.*") {
        $content = $content -replace "FRONTEND_URL=.*", "FRONTEND_URL=http://localhost:3000"
    } else {
        $content += "`nFRONTEND_URL=http://localhost:3000"
    }
    
    Set-Content -Path $backendEnvPath -Value $content -Encoding UTF8
    Write-Host "OK: backend/.env vidnovleno" -ForegroundColor Green
} else {
    Write-Host "WARNING: backend/.env ne znaideno" -ForegroundColor Yellow
}

# Frontend .env
$frontendEnvPath = "frontend\.env"
if (Test-Path $frontendEnvPath) {
    Write-Host "Onovlennia frontend/.env..." -ForegroundColor Yellow
    $content = Get-Content $frontendEnvPath -Raw
    
    # Zamina VITE_API_URL
    if ($content -match "VITE_API_URL=.*") {
        $content = $content -replace "VITE_API_URL=.*", "VITE_API_URL=http://localhost:5000/api"
    } else {
        $content += "`nVITE_API_URL=http://localhost:5000/api"
    }
    
    # Zamina VITE_WS_URL
    if ($content -match "VITE_WS_URL=.*") {
        $content = $content -replace "VITE_WS_URL=.*", "VITE_WS_URL=ws://localhost:5000"
    } else {
        $content += "`nVITE_WS_URL=ws://localhost:5000"
    }
    
    Set-Content -Path $frontendEnvPath -Value $content -Encoding UTF8
    Write-Host "OK: frontend/.env vidnovleno" -ForegroundColor Green
} else {
    Write-Host "WARNING: frontend/.env ne znaideno" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "HOTOVO!" -ForegroundColor Green
Write-Host ""
Write-Host "Vidnovleni znachennia:" -ForegroundColor Cyan
Write-Host "  backend/.env:" -ForegroundColor White
Write-Host "    CORS_ORIGIN=http://localhost:3000" -ForegroundColor Gray
Write-Host "    FRONTEND_URL=http://localhost:3000" -ForegroundColor Gray
Write-Host ""
Write-Host "  frontend/.env:" -ForegroundColor White
Write-Host "    VITE_API_URL=http://localhost:5000/api" -ForegroundColor Gray
Write-Host "    VITE_WS_URL=ws://localhost:5000" -ForegroundColor Gray
Write-Host ""

