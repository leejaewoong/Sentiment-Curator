# 기본 아키텍처 설계서 (Bundle B)

## 1. 기술 스택 (Selected)
*   **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS, Shadcn/UI
*   **Backend:** FastAPI, Python 3.10+
*   **Database:**
    *   **Local:** SQLite (간편한 개발)
    *   **Production:** Supabase (PostgreSQL) - Cloud Run이 데이터 저장을 보장하지 않으므로 외부 DB 필수.
*   **AI/Crawling:** OpenAI API, Playwright
*   **Deployment:** Vercel (Frontend), Cloud Run (Backend)

## 2. 시스템 아키텍처 다이어그램

```mermaid
graph TD
    User[User] -->|Access Dashboard| Client[Next.js Frontend]
    Client -->|API Request| Server[FastAPI Backend]
    
    subgraph "Backend Server"
        Server -->|CRUD| DB[(SQLite Database)]
        Server -->|Trigger| Crawler[Playwright Crawler]
        Server -->|Filter Content| AI[AI Agent (LLM)]
    end
    
    Crawler -->|Scrape| Web[Target Websites]
    AI -->|Feedback Loop| DB
    Server -->|Notify| Slack[Slack Webhook]
```

## 3. Playwright 선정 이유
**Playwright**는 마이크로소프트에서 개발한 최신 브라우저 자동화 도구입니다.
*   **동적 페이지 수집:** JavaScript로 렌더링되는 최신 웹사이트(SPA)의 데이터를 완벽하게 수집할 수 있습니다.
*   **강력한 기능:** 브라우저 조작(클릭, 스크롤, 대기)이 매우 빠르고 안정적입니다.
*   **Headless 모드:** 화면 없이 백그라운드에서 실행되어 리소스를 절약합니다.
이 프로젝트에서는 단순 HTML 파싱만으로는 수집하기 어려운 **댓글, 무한 스크롤 콘텐츠** 등을 수집하기 위해 사용합니다.

## 4. 디렉토리 구조 (Monorepo-like)
```
sentiment-curator/
├── frontend/          # Next.js Application
│   ├── app/           # App Router Pages
│   ├── components/    # UI Components (Shadcn)
│   ├── lib/           # Utils
│   └── public/        # Static Assets
├── backend/           # FastAPI Application
│   ├── app/
│   │   ├── api/       # API Endpoints
│   │   ├── core/      # Config & Security
│   │   ├── models/    # DB Models
│   │   ├── services/  # Business Logic (Crawler, AI)
│   │   └── main.py    # Entry Point
│   ├── tests/         # Tests
│   ├── .env           # Secrets (GitIgnored)
│   └── requirements.txt
├── data/              # SQLite DB & Logs
└── README.md
```

## 5. 데이터 흐름 (Data Flow)
1.  **설정:** 사용자가 Frontend에서 타겟 URL 및 스케줄 설정 -> Backend DB 저장.
2.  **수집:** Scheduler가 Crawler 트리거 -> Playwright가 웹사이트 방문 및 데이터(이미지, 텍스트, 댓글) 수집.
3.  **저장:** 수집된 Raw Data를 DB에 임시 저장.
4.  **필터링:** AI Agent가 DB의 Raw Data를 읽고, 사용자 프롬프트 및 피드백(Few-Shot)을 반영하여 필터링.
5.  **알림:** 선별된 데이터를 Slack으로 전송.
6.  **피드백:** 사용자가 Slack/Dashboard에서 반응 -> DB에 피드백 저장 -> 다음 필터링에 반영.

## 6. 보안 및 설정 관리 (Configuration)
모든 민감한 정보와 환경 변수는 `.env` 파일로 관리하며, Git에는 포함되지 않도록 설정합니다.

### 6.1 필수 API 키 (Local & Prod)
*   `OPENAI_API_KEY`: AI 필터링 및 요약 (OpenAI).
*   `SLACK_BOT_TOKEN`: 슬랙 메시지 발송 (Slack API).
*   `SLACK_SIGNING_SECRET`: 슬랙 이벤트 검증 (Slack API).
*   `DATABASE_URL`: DB 접속 정보.
    *   Local: `sqlite:///./data.db`
    *   Prod: `postgresql://user:pass@supabase-url:5432/db` (Supabase 연결 문자열)

### 6.2 배포용 키 (Production Only)
*   **Frontend (Vercel):**
    *   `VERCEL_TOKEN`: Vercel CLI 배포 시 필요 (또는 GitHub 연동 시 자동 처리).
*   **Backend (AWS/Cloud Run):**
    *   `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY`: AWS 배포 시 필요.
    *   또는 `GOOGLE_APPLICATION_CREDENTIALS`: GCP 배포 시 필요.
*   **Frontend:** `NEXT_PUBLIC_` 접두사가 필요한 환경변수 별도 관리.
