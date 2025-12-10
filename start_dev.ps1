# ==========================================
# Sentiment Curator 개발 시작 스크립트
# ==========================================
#
# [사용법]
# 1. 프로젝트 루트 디렉토리에서 터미널을 엽니다:
#    c:\Users\jaewoong\Desktop\project\Sentiment-Curator
#
# 2. 스크립트를 실행합니다:
#    .\start_dev.ps1
#
# [참고]
# 권한 오류가 발생하면 아래 명령어를 먼저 실행하세요:
# Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
# ==========================================

# Check if backend venv exists
if (-Not (Test-Path "backend\venv")) {
    Write-Host "`n[WARNING] Backend virtual environment not found!" -ForegroundColor Red
    Write-Host "Please run: cd backend; python -m venv venv; .\venv\Scripts\activate; pip install -r requirements.txt; playwright install chromium" -ForegroundColor Yellow
    exit 1
}

# Check if frontend node_modules exists
if (-Not (Test-Path "frontend\node_modules")) {
    Write-Host "`n[WARNING] Frontend dependencies not installed!" -ForegroundColor Red
    Write-Host "Please run: cd frontend; npm install" -ForegroundColor Yellow
    exit 1
}

# Start Backend
Write-Host "`nStarting Backend (FastAPI)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; .\venv\Scripts\activate; uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

# Wait a moment
Start-Sleep -Seconds 2

# Start Frontend
Write-Host "Starting Frontend (Next.js)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"

Write-Host "`nBoth servers are starting..." -ForegroundColor Green
Write-Host "Backend API: http://localhost:8000" -ForegroundColor Yellow
Write-Host "API Docs: http://localhost:8000/docs" -ForegroundColor Yellow
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Yellow
Write-Host "`nPress Ctrl+C in each terminal to stop servers" -ForegroundColor Gray
