#!/usr/bin/env pwsh
# Sentiment-Curator Development Environment Startup Script (Windows)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Sentiment-Curator Dev Environment" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env files exist
if (-not (Test-Path "backend\.env")) {
    Write-Host "[WARNING] backend\.env not found. Copy from backend\.env.example" -ForegroundColor Yellow
    Write-Host "  Run: cp backend\.env.example backend\.env" -ForegroundColor Yellow
    Write-Host ""
}

if (-not (Test-Path "frontend\.env.local")) {
    Write-Host "[WARNING] frontend\.env.local not found. Copy from frontend\.env.example" -ForegroundColor Yellow
    Write-Host "  Run: cp frontend\.env.example frontend\.env.local" -ForegroundColor Yellow
    Write-Host ""
}

# Check if Python venv exists
if (-not (Test-Path "backend\venv")) {
    Write-Host "[INFO] Python virtual environment not found. Creating..." -ForegroundColor Yellow
    python -m venv backend\venv
    Write-Host "[INFO] Installing Python dependencies..." -ForegroundColor Yellow
    & backend\venv\Scripts\pip install -r backend\requirements.txt
}

# Check if node_modules exists
if (-not (Test-Path "frontend\node_modules")) {
    Write-Host "[INFO] node_modules not found. Installing dependencies..." -ForegroundColor Yellow
    Set-Location frontend
    npm install
    Set-Location ..
}

Write-Host "[INFO] Starting Backend (FastAPI) on http://localhost:8000" -ForegroundColor Green
Write-Host "[INFO] Starting Frontend (Next.js) on http://localhost:3000" -ForegroundColor Green
Write-Host ""
Write-Host "Press Ctrl+C to stop all servers" -ForegroundColor Yellow
Write-Host ""

# Start backend in background
$backend = Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", "cd backend; .\venv\Scripts\activate; uvicorn app.main:app --reload --host 0.0.0.0 --port 8000" -PassThru

# Start frontend in background
$frontend = Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev" -PassThru

Write-Host "[SUCCESS] Servers started!" -ForegroundColor Green
Write-Host "  Backend:  http://localhost:8000" -ForegroundColor Cyan
Write-Host "  API Docs: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host "  Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Close the spawned terminal windows to stop the servers." -ForegroundColor Yellow

# Wait for user interrupt
try {
    Wait-Process -Id $backend.Id, $frontend.Id
}
catch {
    Write-Host "`n[INFO] Stopping servers..." -ForegroundColor Yellow
}
finally {
    # Cleanup
    if ($backend -and -not $backend.HasExited) {
        Stop-Process -Id $backend.Id -Force -ErrorAction SilentlyContinue
    }
    if ($frontend -and -not $frontend.HasExited) {
        Stop-Process -Id $frontend.Id -Force -ErrorAction SilentlyContinue
    }
    Write-Host "[INFO] All servers stopped." -ForegroundColor Green
}
