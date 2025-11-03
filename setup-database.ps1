# PowerShell script to setup PostgreSQL database
# This script helps create the database if it doesn't exist

Write-Host "=== VITA-Edu Database Setup ===" -ForegroundColor Cyan
Write-Host ""

# Check if psql is available
$psqlPath = Get-Command psql -ErrorAction SilentlyContinue

if (-not $psqlPath) {
    Write-Host "❌ PostgreSQL client (psql) not found in PATH" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Options:" -ForegroundColor Yellow
    Write-Host "   1. Add PostgreSQL bin folder to PATH"
    Write-Host "      Usually: C:\Program Files\PostgreSQL\15\bin"
    Write-Host ""
    Write-Host "   2. Use pgAdmin to create database manually:"
    Write-Host "      - Open pgAdmin"
    Write-Host "      - Connect to PostgreSQL server"
    Write-Host "      - Right-click 'Databases' -> Create -> Database"
    Write-Host "      - Name: vita_edu"
    Write-Host ""
    Write-Host "   3. Or update DATABASE_URL in .env file with correct credentials"
    Write-Host ""
    exit 1
}

Write-Host "📋 Current DATABASE_URL from .env:" -ForegroundColor Yellow
$envContent = Get-Content ".env" -ErrorAction SilentlyContinue
if ($envContent) {
    $dbUrl = $envContent | Select-String "DATABASE_URL" | ForEach-Object { $_.Line }
    if ($dbUrl) {
        Write-Host $dbUrl
        $match = [regex]::Match($dbUrl, 'postgresql://([^:]+):([^@]+)@([^:]+):(\d+)/([^?]+)')
        if ($match.Success) {
            $dbUser = $match.Groups[1].Value
            $dbPass = $match.Groups[2].Value
            $dbHost = $match.Groups[3].Value
            $dbPort = $match.Groups[4].Value
            $dbName = $match.Groups[5].Value
            
            Write-Host ""
            Write-Host "Parsed connection details:" -ForegroundColor Cyan
            Write-Host "  User: $dbUser"
            Write-Host "  Host: $dbHost"
            Write-Host "  Port: $dbPort"
            Write-Host "  Database: $dbName"
            Write-Host ""
            
            # Try to connect and create database
            Write-Host "Testing connection..." -ForegroundColor Yellow
            $env:PGPASSWORD = $dbPass
            $testConn = & psql -U $dbUser -h $dbHost -p $dbPort -d postgres -c "SELECT 1" 2>&1
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ Connection to PostgreSQL successful!" -ForegroundColor Green
                Write-Host ""
                Write-Host "Checking if database '$dbName' exists..." -ForegroundColor Yellow
                
                $dbExists = & psql -U $dbUser -h $dbHost -p $dbPort -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='$dbName'" 2>&1
                
                if ($dbExists -match "1") {
                    Write-Host "✅ Database '$dbName' already exists!" -ForegroundColor Green
                } else {
                    Write-Host "❌ Database '$dbName' does not exist" -ForegroundColor Red
                    Write-Host ""
                    Write-Host "Creating database '$dbName'..." -ForegroundColor Yellow
                    $createDb = & psql -U $dbUser -h $dbHost -p $dbPort -d postgres -c "CREATE DATABASE $dbName;" 2>&1
                    
                    if ($LASTEXITCODE -eq 0) {
                        Write-Host "✅ Database '$dbName' created successfully!" -ForegroundColor Green
                    } else {
                        Write-Host "❌ Failed to create database:" -ForegroundColor Red
                        Write-Host $createDb
                    }
                }
            } else {
                Write-Host "❌ Cannot connect to PostgreSQL" -ForegroundColor Red
                Write-Host ""
                Write-Host "Possible issues:" -ForegroundColor Yellow
                Write-Host "  1. PostgreSQL service is not running"
                Write-Host "  2. Wrong password for user '$dbUser'"
                Write-Host "  3. User '$dbUser' does not exist"
                Write-Host "  4. PostgreSQL is not listening on ${dbHost}:${dbPort}"
                Write-Host ""
                Write-Host "💡 Solutions:" -ForegroundColor Cyan
                Write-Host "  - Check if PostgreSQL service is running"
                Write-Host "  - Verify username and password in .env file"
                Write-Host "  - Try connecting with pgAdmin first"
                Write-Host ""
                Write-Host "Error output:" -ForegroundColor Red
                Write-Host $testConn
            }
        } else {
            Write-Host "❌ Could not parse DATABASE_URL format" -ForegroundColor Red
            Write-Host "Expected format: postgresql://user:password@host:port/database"
        }
    } else {
        Write-Host "❌ DATABASE_URL not found in .env file" -ForegroundColor Red
    }
} else {
    Write-Host "❌ .env file not found in current directory" -ForegroundColor Red
    Write-Host "   Please run this script from the project root directory" -ForegroundColor Yellow
}

Write-Host ""


