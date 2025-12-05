# Sentiment Curator

**Sentiment Curator**는 온라인 상의 방대한 유저 동향(게시글, 댓글 등)을 수집하고, AI를 통해 사용자의 의도에 부합하는 정보만을 선별하여 Slack으로 전달함으로써 효율적인 정보 습득을 돕는 지능형 큐레이션 서비스입니다.

## 🚀 주요 기능

*   **데이터 수집 (Crawling)**: Playwright를 활용하여 지정된 웹사이트의 콘텐츠(텍스트, 이미지)를 수집합니다.
*   **AI 분석 및 필터링**: OpenAI API(LLM)를 활용하여 수집된 콘텐츠를 분석하고, 사용자의 관심사(프롬프트)에 맞는 정보만 선별합니다.
*   **Slack 알림**: 선별된 핵심 정보를 요약하여 Slack 채널로 실시간 전송합니다.
*   **피드백 루프**: Slack 이모지 반응(👍/👎)을 수집하여 AI의 필터링 정확도를 지속적으로 개선합니다.
*   **웹 대시보드 (IDE Style)**: VS Code 스타일의 직관적인 UI에서 수집 설정, 로그 모니터링, 트렌드 분석을 수행할 수 있습니다.

## 🛠 기술 스택

*   **Frontend**: Next.js (App Router), TypeScript, Tailwind CSS, Shadcn/UI
*   **Backend**: FastAPI, Python 3.10+
*   **Database**: SQLite (SQLAlchemy)
*   **AI/Crawling**: OpenAI API, Playwright
*   **Testing**: pytest, pytest-bdd (Gherkin)

## 🏁 시작하기 (Getting Started)

### 사전 요구사항
*   Python 3.10 이상
*   Node.js 18 이상
*   Chrome 브라우저 (Playwright용)

### 1. Backend 설정

```bash
cd backend

# 가상환경 생성 및 활성화
python -m venv venv
# Windows
.\venv\Scripts\activate
# Mac/Linux
source venv/bin/activate

# 의존성 설치
pip install -r requirements.txt
playwright install chromium

# 환경 변수 설정 (.env 파일 생성)
cp ../.env.example .env
# .env 파일 내 OPENAI_API_KEY, SLACK_BOT_TOKEN 등을 입력하세요.

# 서버 실행
uvicorn app.main:app --reload
```

### 2. Frontend 설정

```bash
cd frontend

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

브라우저에서 `http://localhost:3000`으로 접속하여 확인합니다.

## 🧪 테스트 (Testing)

이 프로젝트는 **BDD (Behavior Driven Development)** 방법론을 채택하여 테스트를 작성했습니다. `pytest-bdd`를 사용하여 Gherkin 문법으로 작성된 시나리오를 검증합니다.

### 테스트 실행 방법

```bash
cd backend
python -m pytest tests
```

### 테스트 구조

*   `backend/tests/features/`: Gherkin 문법으로 작성된 테스트 시나리오 (`.feature`)
    *   `crawler.feature`: 크롤링 기능 검증
    *   `analysis.feature`: AI 분석 및 필터링 로직 검증
    *   `notification.feature`: Slack 알림 및 피드백 루프 검증
*   `backend/tests/test_integration.py`: 시나리오와 실제 코드를 연결하는 Step Definitions
*   `backend/tests/conftest.py`: 테스트용 DB(In-Memory SQLite) 및 Mock 객체 설정
