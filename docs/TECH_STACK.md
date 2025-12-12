# 기술 스택 상세 설계서

## 선정 방향성

- **비용 최소화:** 무료 티어 최대 활용
- **GCP 활용:** 백엔드 서버는 GCP Cloud Run 사용
- **확장성:** 트래픽 증가 시 스케일업 용이한 구조
- **개발 효율:** 검증된 기술 스택 사용

## 1. 전체 기술 스택 개요

```
Frontend:  Next.js 14+ (App Router) + TypeScript + Tailwind CSS
Backend:   FastAPI + Python 3.10+
Database:  Supabase (PostgreSQL)
Cache:     Upstash Redis (Celery용)
Deploy:    Vercel (Frontend) + GCP Cloud Run (Backend)
AI:        OpenAI API (GPT-4o + Embeddings)
```

**월 예상 비용: $0** (무료 티어 범위 내)

---

## 2. Frontend

### 2.1 Core Framework

**Next.js 14+ (App Router)**
- **선정 이유:**
  - 서버 컴포넌트로 초기 로딩 속도 개선
  - 파일 기반 라우팅으로 개발 생산성 향상
  - Vercel 배포 시 최적화 자동 적용
  - SEO 최적화 (추후 랜딩 페이지 활용 가능)

- **주요 기능 활용:**
  - App Router (app/ 디렉토리)
  - Server Components (데이터 페칭)
  - Route Handlers (API 프록시)
  - Middleware (인증 체크)

### 2.2 Language

**TypeScript 5.0+**
- 타입 안전성으로 런타임 에러 감소
- IDE 자동완성으로 개발 속도 향상
- Backend API 인터페이스와 타입 공유

### 2.3 Styling

**Tailwind CSS 3.4+**
- Utility-first로 빠른 스타일링
- 반응형 디자인 간편
- 프로덕션 빌드 시 사용하지 않는 CSS 자동 제거

**Shadcn/UI**
- Headless UI 기반 커스터마이징 가능한 컴포넌트
- Radix UI + Tailwind CSS 조합
- 복사-붙여넣기 방식으로 번들 사이즈 최소화

### 2.4 State Management

**React Query (TanStack Query)**
- 서버 상태 관리 (API 데이터)
- 자동 캐싱 및 재검증
- Optimistic Update 지원

**Zustand** (선택적)
- 클라이언트 상태 관리 (UI 상태)
- Redux보다 가벼움
- TypeScript 지원 우수

### 2.5 Authentication

**NextAuth.js (Auth.js v5)**
- Slack OAuth Provider 내장
- Session 관리 자동화
- JWT 또는 Database Session 선택 가능

**구현 방식:**
```typescript
// Slack OAuth 설정
providers: [
  SlackProvider({
    clientId: process.env.SLACK_CLIENT_ID,
    clientSecret: process.env.SLACK_CLIENT_SECRET,
  })
]
```

### 2.6 Form Handling

**React Hook Form + Zod**
- 성능 최적화된 폼 관리
- Zod로 스키마 기반 검증
- TypeScript 타입 자동 추론

### 2.7 Deployment

**Vercel**
- **무료 티어:**
  - 월 100GB 대역폭
  - Unlimited deployments
  - 자동 HTTPS
- **장점:**
  - Git Push 시 자동 배포
  - Preview 배포 (PR별)
  - Edge Network로 전 세계 빠른 응답

---

## 3. Backend

### 3.1 Core Framework

**FastAPI 0.104+**
- **선정 이유:**
  - 비동기 처리 (async/await) → 크롤링에 최적
  - 자동 API 문서 (Swagger/OpenAPI)
  - Pydantic으로 타입 검증 자동화
  - 빠른 성능 (Starlette 기반)

- **주요 기능:**
  - Background Tasks (Celery 없이 간단한 작업 처리)
  - Dependency Injection
  - WebSocket 지원 (실시간 로그 스트리밍 가능)

### 3.2 Language

**Python 3.10+**
- Match-Case 문법 활용
- Type Hints 개선
- 풍부한 크롤링/AI 라이브러리

### 3.3 Async Task Queue

**Celery + Celery Beat**
- **역할:**
  - 주기적 크롤링 스케줄링 (Beat)
  - 무거운 AI 처리 비동기 실행
  - 48시간 데이터 정리 작업

- **Broker/Backend:**
  - Upstash Redis (무료 티어: 10,000 commands/day)

**대안 (추후 고려):**
- Cloud Tasks (GCP 네이티브)
- APScheduler (간단한 스케줄링)

### 3.4 Reddit API Client

**PRAW (Python Reddit API Wrapper)**
```python
import praw

reddit = praw.Reddit(
    client_id="YOUR_CLIENT_ID",
    client_secret="YOUR_CLIENT_SECRET",
    user_agent="SentimentCurator/1.0"
)

subreddit = reddit.subreddit("PUBATTLEGROUNDS")
for post in subreddit.new(limit=100):
    # 크롤링 로직
```

- **기능:**
  - 포스트/댓글 수집
  - Rate Limit 자동 관리
  - Stream API (실시간 모니터링)

### 3.5 Slack API Client

**slack-sdk**
```python
from slack_sdk import WebClient

client = WebClient(token=os.environ["SLACK_BOT_TOKEN"])
client.chat_postMessage(
    channel="#pubg-news",
    text="AI 선별 포스트",
    blocks=[...]  # Block Kit
)
```

- **기능:**
  - 메시지 전송
  - 채널 목록 조회
  - OAuth 토큰 관리

### 3.6 AI/LLM Integration

**OpenAI Python SDK**
```python
from openai import OpenAI

client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])

# 필터링
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[...]
)

# 임베딩
embedding = client.embeddings.create(
    model="text-embedding-3-small",
    input="포스트 내용"
)
```

- **비용 최적화:**
  - GPT-4o-mini 사용 (필터링 단계)
  - GPT-4o는 최종 요약에만 사용
  - Batch API 활용 (50% 할인)

### 3.7 Database ORM

**SQLAlchemy 2.0 (Async)**
```python
from sqlalchemy.ext.asyncio import create_async_engine

engine = create_async_engine(
    "postgresql+asyncpg://user:pass@supabase-url/db"
)
```

- **장점:**
  - 비동기 쿼리로 성능 향상
  - Alembic으로 마이그레이션 관리
  - Type Hints 지원

### 3.8 Deployment

**GCP Cloud Run**
- **무료 티어:**
  - 월 2백만 요청
  - 360,000 GB-seconds 메모리
  - 180,000 vCPU-seconds

- **설정:**
  ```yaml
  # cloudrun.yaml
  apiVersion: serving.knative.dev/v1
  kind: Service
  metadata:
    name: sentiment-curator-api
  spec:
    template:
      spec:
        containers:
        - image: gcr.io/PROJECT_ID/sentiment-curator:latest
          resources:
            limits:
              memory: 512Mi
              cpu: 1000m
  ```

- **장점:**
  - 자동 스케일링 (0 → N)
  - 컨테이너 기반 (Dockerfile)
  - HTTPS 자동 설정
  - 사용한 만큼만 과금

---

## 4. Database

### 4.1 Primary Database

**Supabase (PostgreSQL 15)**

- **무료 티어:**
  - 500MB 저장소
  - 월 200만 요청
  - 무제한 API 요청
  - 1GB 파일 저장소 (이미지 URL 저장용)

- **선정 이유:**
  - PostgreSQL의 강력한 쿼리 기능
  - JSON 타입으로 Reddit 데이터 저장 용이
  - Row Level Security (RLS)로 보안 강화
  - 실시간 기능 (추후 활용 가능)
  - Dashboard 제공 (모니터링)

- **연결 방식:**
  ```python
  # Backend
  DATABASE_URL = "postgresql+asyncpg://user:pass@db.supabase.co:5432/postgres"

  # Supabase REST API (선택적)
  from supabase import create_client
  supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
  ```

### 4.2 Database Schema (주요 테이블)

**posts**
```sql
CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reddit_id VARCHAR(20) UNIQUE NOT NULL,
    subreddit VARCHAR(50) NOT NULL,
    title TEXT NOT NULL,
    content TEXT,
    author VARCHAR(50),
    url TEXT,
    image_urls TEXT[],
    created_at TIMESTAMPTZ NOT NULL,
    upvotes INTEGER DEFAULT 0,
    num_comments INTEGER DEFAULT 0,
    raw_data JSONB,  -- Reddit 전체 데이터
    collected_at TIMESTAMPTZ DEFAULT NOW()
);
```

**comments**
```sql
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    reddit_id VARCHAR(20) UNIQUE NOT NULL,
    author VARCHAR(50),
    body TEXT NOT NULL,
    parent_id VARCHAR(20),
    created_at TIMESTAMPTZ NOT NULL,
    upvotes INTEGER DEFAULT 0
);
```

**filtered_posts** (AI 선별된 포스트)
```sql
CREATE TABLE filtered_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    post_id UUID REFERENCES posts(id),
    relevance_score FLOAT,
    summary TEXT,  -- AI 생성 요약
    related_post_ids UUID[],
    sent_to_slack BOOLEAN DEFAULT FALSE,
    slack_ts VARCHAR(50),  -- Slack message timestamp
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**users**
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slack_user_id VARCHAR(50) UNIQUE,
    slack_team_id VARCHAR(50),
    access_token TEXT,  -- 암호화 필요
    settings JSONB,  -- 사용자 설정
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**crawl_jobs** (크롤링 실행 이력)
```sql
CREATE TABLE crawl_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status VARCHAR(20),  -- pending, running, success, failed
    subreddit VARCHAR(50),
    posts_collected INTEGER,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    error_message TEXT
);
```

### 4.3 Cache & Session

**Upstash Redis**
- **무료 티어:**
  - 10,000 commands/day
  - 256MB storage

- **용도:**
  - Celery Broker/Backend
  - API Rate Limiting
  - Session Storage (NextAuth)
  - 임시 캐시 (Reddit API 응답)

---

## 5. Infrastructure & DevOps

### 5.1 Version Control

**GitHub**
- Monorepo 구조 (frontend + backend)
- GitHub Actions (CI/CD)

### 5.2 CI/CD

**GitHub Actions**
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: vercel/action@v2
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}

  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - name: Build Docker Image
        run: docker build -t gcr.io/$PROJECT/api .
      - name: Push to GCR
        run: docker push gcr.io/$PROJECT/api
      - name: Deploy to Cloud Run
        run: gcloud run deploy sentiment-curator-api ...
```

### 5.3 Monitoring

**Sentry** (Error Tracking)
- Frontend/Backend 에러 자동 수집
- 무료 티어: 월 5,000 events

**Cloud Logging** (GCP)
- Cloud Run 로그 자동 수집
- 로그 기반 메트릭 생성

### 5.4 Secrets Management

**환경 변수 관리:**
- **Local:** `.env` 파일 (gitignore)
- **Vercel:** Environment Variables UI
- **Cloud Run:** Secret Manager 연동

```bash
# .env.example
OPENAI_API_KEY=sk-...
SLACK_CLIENT_ID=...
SLACK_CLIENT_SECRET=...
SLACK_BOT_TOKEN=xoxb-...
REDDIT_CLIENT_ID=...
REDDIT_CLIENT_SECRET=...
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
```

---

## 6. Development Tools

### 6.1 코드 품질

**Python:**
- `black` (포매터)
- `ruff` (린터, flake8/pylint 대체)
- `mypy` (타입 체커)

**TypeScript:**
- ESLint + Prettier
- TypeScript Compiler (tsc)

### 6.2 Testing

**Backend:**
- `pytest` (단위/통합 테스트)
- `pytest-asyncio` (비동기 테스트)
- `httpx` (FastAPI 테스트 클라이언트)

**Frontend:**
- Vitest (Jest 대체, 빠름)
- React Testing Library
- Playwright (E2E)

### 6.3 개발 환경

**Backend:**
```bash
# pyproject.toml (Poetry)
python = "^3.10"
fastapi = "^0.104.0"
uvicorn = "^0.24.0"
celery = "^5.3.0"
praw = "^7.7.0"
openai = "^1.3.0"
sqlalchemy = "^2.0.0"
```

**Frontend:**
```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-query": "^5.0.0",
    "next-auth": "^5.0.0-beta",
    "tailwindcss": "^3.4.0"
  }
}
```

---

## 7. 비용 예측

### 7.1 무료 티어 활용 시 (예상 월 비용: $0)

| 서비스 | 무료 티어 한도 | 예상 사용량 |
|--------|----------------|-------------|
| Vercel | 100GB 대역폭 | ~5GB |
| Cloud Run | 2M 요청 | ~50K 요청 |
| Supabase | 500MB / 2M 요청 | ~100MB / 500K 요청 |
| Upstash Redis | 10K commands/day | ~3K commands/day |
| OpenAI API | 종량제 | ~$5-10/월 (별도) |

### 7.2 유료 전환 시 (트래픽 증가)

- **Supabase Pro:** $25/월 (8GB 저장소)
- **Cloud Run:** 사용량 기반 (~$10-20/월)
- **OpenAI API:** ~$20-50/월

**총 예상: $55-95/월**

---

## 8. 기술 선정 근거 요약

| 요구사항 | 선정 기술 | 이유 |
|----------|----------|------|
| 빠른 크롤링 | FastAPI + async | 비동기 I/O로 동시 요청 처리 |
| 데이터 영속성 | Supabase PostgreSQL | Cloud Run stateless 환경 대응 |
| 스케줄링 | Celery Beat | Cron 표현식 지원, 안정적 |
| AI 통합 | OpenAI API | GPT-4o 성능 + 임베딩 제공 |
| 저비용 배포 | Vercel + Cloud Run | 무료 티어 충분, 자동 스케일링 |
| OAuth | NextAuth.js | Slack Provider 내장 |

---

## 9. 마이그레이션 경로 (향후)

### 9.1 성능 개선
- Redis → Memcached (더 빠른 캐시)
- GPT-4o → Fine-tuned 모델 (비용 절감)

### 9.2 완전 GCP 이전
- Supabase → Cloud SQL (PostgreSQL)
- Upstash Redis → Memorystore
- OpenAI → Vertex AI (PaLM)

### 9.3 Kubernetes 전환
- Cloud Run → GKE (복잡한 워크로드 시)
