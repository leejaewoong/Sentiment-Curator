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

# Start Backend
Write-Host "Starting Backend..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; .\venv\Scripts\activate; uvicorn app.main:app --reload"

# Start Frontend
Write-Host "Starting Frontend..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"

Write-Host "Development servers started!"
