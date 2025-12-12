# 🎮 Sentiment-Curator

> PUBG 커뮤니티의 방대한 정보를 AI로 큐레이션하여 Slack으로 전달하는 지능형 서비스

[![Tech Stack](https://img.shields.io/badge/Stack-Next.js%20%7C%20FastAPI%20%7C%20Supabase-blue)](docs/TECH_STACK.md)
[![Deployment](https://img.shields.io/badge/Deploy-Vercel%20%7C%20GCP%20Cloud%20Run-green)](docs/ARCHITECTURE.md)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**Sentiment-Curator**는 Reddit의 PUBG 커뮤니티를 자동으로 모니터링하고, AI가 사용자의 관심사에 맞는 핵심 정보만 선별하여 Slack으로 전달하는 자동화 서비스입니다.

---

## ✨ 주요 기능

### 🤖 AI 기반 콘텐츠 큐레이션
- **프롬프트 기반 필터링**: 자연어로 관심사를 정의하면 AI가 관련 포스트만 선별
- **똑똑한 요약**: GPT-4o가 포스트와 댓글을 분석하여 핵심만 요약
- **관련 포스트 추천**: 임베딩 유사도 기반으로 연관 콘텐츠 자동 발굴

### 📡 자동 크롤링
- **Reddit 실시간 모니터링**: PRAW API를 활용한 안정적인 데이터 수집
- **포스트 + 댓글 전체 수집**: 본문뿐만 아니라 커뮤니티 반응도 분석
- **주기적 실행**: 사용자가 설정한 스케줄에 맞춰 자동 수집

### 💬 Slack 통합
- **개별 메시지 전송**: 각 포스트를 깔끔한 Block Kit 형식으로 전달
- **자동 번역**: 영어 포스트를 한국어로 자동 번역
- **원클릭 접근**: 원본 링크와 관련 포스트로 바로 이동

### ⚙️ 유연한 설정
- **웹 대시보드**: 직관적인 UI로 크롤링 설정, Slack 채널 선택
- **Slack OAuth**: 로그인 한 번으로 워크스페이스 자동 연동
- **맞춤형 큐레이션**: 선별 개수, 전달 주기, 대상 기간 모두 커스터마이징

---

## 🚀 빠른 시작

### 사전 요구사항

- **Node.js** 18+ (Frontend)
- **Python** 3.10+ (Backend)
- **Docker** (선택사항, 로컬 개발용)

### 1. 저장소 클론

```bash
git clone https://github.com/yourusername/sentiment-curator.git
cd sentiment-curator
```

### 2. 환경 변수 설정

#### Frontend (.env.local)
```bash
cd frontend
cp .env.example .env.local
```

```.env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-random-secret-here

# Slack OAuth (https://api.slack.com/apps에서 발급)
SLACK_CLIENT_ID=your-slack-client-id
SLACK_CLIENT_SECRET=your-slack-client-secret
```

#### Backend (.env)
```bash
cd backend
cp .env.example .env
```

```.env
# Database (Supabase)
DATABASE_URL=postgresql+asyncpg://user:pass@db.supabase.co:5432/postgres

# Redis (Upstash)
REDIS_URL=redis://default:pass@upstash-redis.com:6379

# OpenAI
OPENAI_API_KEY=sk-your-openai-api-key

# Slack
SLACK_BOT_TOKEN=xoxb-your-slack-bot-token

# Reddit (https://www.reddit.com/prefs/apps에서 발급)
REDDIT_CLIENT_ID=your-reddit-client-id
REDDIT_CLIENT_SECRET=your-reddit-client-secret
REDDIT_USER_AGENT=SentimentCurator/1.0

# Security
ENCRYPTION_KEY=your-fernet-encryption-key
```

### 3. 개발 서버 실행

#### ⚡ 원클릭 실행 (권장)

**Windows (PowerShell):**
```powershell
.\start-dev.ps1
```

**Linux/macOS:**
```bash
./start-dev.sh
```

이 스크립트는 자동으로:
- ✅ Python 가상환경 생성 (없을 경우)
- ✅ 의존성 설치 (Backend + Frontend)
- ✅ Backend와 Frontend 서버를 동시 실행
- ✅ Ctrl+C로 모든 서버 종료

**실행 후 접속:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

---

#### 🔧 개별 실행 (고급)

각 서버를 별도로 실행하고 싶다면:

**Backend:**
```bash
cd backend

# Python 가상환경 생성 및 활성화
python -m venv venv
.\venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/macOS

# 의존성 설치
pip install -r requirements.txt

# DB 마이그레이션
alembic upgrade head

# FastAPI 서버 실행
uvicorn app.main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

**Celery (선택사항 - 스케줄링 필요 시):**
```bash
# Worker (별도 터미널)
cd backend
.\venv\Scripts\activate
celery -A app.core.celery_app worker --loglevel=info

# Beat (별도 터미널)
cd backend
.\venv\Scripts\activate
celery -A app.core.celery_app beat --loglevel=info
```

---

#### 🐳 Docker Compose 사용 (대안)

Docker를 선호한다면 모든 서비스를 컨테이너로 실행할 수 있습니다:

```bash
# 모든 서비스 시작 (Backend + Celery + Redis)
docker-compose up -d

# 로그 확인
docker-compose logs -f

# 서비스 중지
docker-compose down
```

**포함된 서비스:**
- Backend API (포트 8000)
- Celery Worker
- Celery Beat
- Redis (로컬 개발용)

**주의:** Frontend는 별도로 실행해야 합니다 (`cd frontend && npm run dev`)

---

## 📚 문서

- **[요구사항 명세서](docs/REQUIREMENTS.md)**: 프로젝트 기능 및 비기능 요구사항
- **[기술 스택](docs/TECH_STACK.md)**: 사용 기술 상세 설명 및 선정 이유
- **[아키텍처](docs/ARCHITECTURE.md)**: 시스템 구조, 데이터 플로우, 배포 전략

---

## 🛠 기술 스택

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Shadcn/UI
- **State**: React Query + Zustand
- **Auth**: NextAuth.js (Slack OAuth)

### Backend
- **Framework**: FastAPI
- **Language**: Python 3.10+
- **Task Queue**: Celery + Celery Beat
- **ORM**: SQLAlchemy (Async)
- **API Clients**: PRAW (Reddit), slack-sdk, OpenAI SDK

### Infrastructure
- **Frontend Deploy**: Vercel
- **Backend Deploy**: GCP Cloud Run
- **Database**: Supabase (PostgreSQL)
- **Cache**: Upstash Redis
- **AI**: OpenAI GPT-4o + Embeddings

### DevOps
- **CI/CD**: GitHub Actions
- **Monitoring**: Sentry, Cloud Logging
- **Containerization**: Docker

---

## 📖 사용 방법

### 1. Slack 앱 생성

1. [Slack API](https://api.slack.com/apps)에서 새 앱 생성
2. **OAuth & Permissions**:
   - Scopes 추가: `chat:write`, `channels:read`, `users:read`
   - Redirect URL 설정: `http://localhost:3000/api/auth/callback/slack`
3. **Install to Workspace** 클릭하여 Bot Token 발급

### 2. Reddit API 키 발급

1. [Reddit Apps](https://www.reddit.com/prefs/apps) 접속
2. "Create App" 또는 "Create Another App" 클릭
3. 앱 타입: **script**
4. Client ID와 Secret 복사

### 3. OpenAI API 키 발급

1. [OpenAI Platform](https://platform.openai.com/api-keys)에서 API 키 생성
2. 결제 정보 등록 (무료 크레딧 소진 시)

### 4. 웹 대시보드에서 설정

1. `http://localhost:3000` 접속
2. "Login with Slack" 클릭
3. **Settings** 페이지에서 설정:
   - **관심사 프롬프트**: "신규 패치 관련 버그 리포트와 밸런스 논의"
   - **선별 개수**: 5개
   - **전달 시점**: 매일 오전 9시 (또는 즉시)
   - **Slack 채널**: #pubg-news
4. **저장** 클릭

### 5. 크롤링 실행

- **수동 실행**: Dashboard에서 "Run Now" 버튼 클릭
- **자동 실행**: 설정한 스케줄에 따라 Celery Beat가 자동 트리거

### 6. Slack에서 결과 확인

설정한 채널에서 AI가 선별한 포스트 확인:

```
🎮 PUBG 신규 포스트

요약:
새로운 패치로 인한 FPS 저하 문제가 보고되고 있습니다.
유저들은 특히 Erangel 맵에서 심각한 성능 저하를 경험하고 있으며...

📎 원본: View Post
🔗 관련 포스트:
  • FPS drop issue after patch
  • Performance optimization guide
```

---

## 🧪 테스트

### Backend
```bash
cd backend
pytest tests/ -v
```

### Frontend
```bash
cd frontend
npm run test
```

---

## 🚢 배포

### Frontend (Vercel)

```bash
cd frontend
vercel deploy --prod
```

또는 GitHub 연동 시 자동 배포.

### Backend (GCP Cloud Run)

```bash
cd backend

# Docker 이미지 빌드
docker build -t gcr.io/YOUR_PROJECT_ID/sentiment-curator:latest .

# GCR에 푸시
docker push gcr.io/YOUR_PROJECT_ID/sentiment-curator:latest

# Cloud Run 배포
gcloud run deploy sentiment-curator-api \
  --image gcr.io/YOUR_PROJECT_ID/sentiment-curator:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars DATABASE_URL=$DATABASE_URL,OPENAI_API_KEY=$OPENAI_API_KEY
```

자세한 배포 가이드는 [ARCHITECTURE.md](docs/ARCHITECTURE.md#7-배포-아키텍처)를 참고하세요.

---

## 📊 프로젝트 구조

```
sentiment-curator/
├── frontend/           # Next.js 웹 애플리케이션
│   ├── src/
│   │   ├── app/        # 페이지 (dashboard, settings)
│   │   ├── components/ # React 컴포넌트
│   │   └── lib/        # 유틸리티, API 클라이언트
│   ├── .env.example    # 환경 변수 템플릿
│   └── package.json
│
├── backend/            # FastAPI 백엔드
│   ├── app/
│   │   ├── api/        # API 엔드포인트
│   │   ├── core/       # 데이터베이스, 설정
│   │   ├── models/     # DB 모델
│   │   ├── services/   # 비즈니스 로직
│   │   └── tasks/      # Celery 태스크
│   ├── alembic/        # DB 마이그레이션
│   ├── tests/
│   ├── .env.example    # 환경 변수 템플릿
│   ├── Dockerfile
│   └── requirements.txt
│
├── docs/               # 문서
│   ├── REQUIREMENTS.md
│   ├── TECH_STACK.md
│   └── ARCHITECTURE.md
│
├── .github/
│   └── workflows/      # CI/CD 설정
│
├── start-dev.ps1       # Windows 개발 서버 실행 스크립트
├── start-dev.sh        # Linux/macOS 개발 서버 실행 스크립트
├── docker-compose.yml  # Docker 로컬 개발 환경
├── .gitignore
└── README.md           # 이 파일
```

---

## 🔧 트러블슈팅

### Reddit API Rate Limit 초과
```python
# backend/app/services/reddit_crawler.py에서
# sleep 시간을 늘려주세요
await asyncio.sleep(2)  # 1초 → 2초
```

### OpenAI API 비용 걱정
- `gpt-4o` → `gpt-4o-mini`로 변경 (90% 비용 절감)
- Batch API 사용 (50% 할인)

### Slack 메시지 전송 실패
- Bot Token Scope 확인: `chat:write` 필요
- 채널에 봇 초대: `/invite @sentiment-curator`

---

## 🤝 기여하기

프로젝트에 기여하고 싶으신가요?

1. Fork 후 브랜치 생성: `git checkout -b feature/amazing-feature`
2. 커밋: `git commit -m 'Add amazing feature'`
3. 푸시: `git push origin feature/amazing-feature`
4. Pull Request 생성

---

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE)를 참고하세요.

---

## 💡 향후 계획

- [ ] **피드백 루프**: Slack 이모지 반응 수집 → AI 학습
- [ ] **멀티 커뮤니티**: 디시인사이드, 인벤 등 한국 커뮤니티 추가
- [ ] **고급 분석**: 트렌드 키워드 추출, 감성 분석
- [ ] **모바일 앱**: React Native로 iOS/Android 지원
- [ ] **Discord 지원**: Slack 외 Discord Webhook 추가

---

## 📧 문의

프로젝트에 대한 질문이나 제안은 [Issues](https://github.com/yourusername/sentiment-curator/issues)를 통해 남겨주세요.

---

**Made with ❤️ by [Your Name](https://github.com/yourusername)**
