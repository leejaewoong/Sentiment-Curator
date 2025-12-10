# 기술 스택 제안서 (Bundle B)

프로젝트 `Sentiment-Curator` 구현을 위한 3가지 기술 스택 조합을 제안합니다.
사용자분의 프로필(Python/TS 능숙, Next.js/FastAPI 기초 지식)과 프로젝트 요구사항(웹 앱, 크롤링, AI)을 고려하여 선정했습니다.

## 1. Option A: Modern Standard (Selected)
가장 현대적이고 확장성이 좋은 조합입니다. Next.js의 강력한 기능과 FastAPI의 고성능을 결합합니다.

*   **Frontend:** **Next.js (App Router)** + TypeScript
    *   장점: 파일 기반 라우팅, 서버 컴포넌트 활용 가능, Vercel 배포 용이.
    *   UI 라이브러리: **Tailwind CSS** + **Shadcn/UI** (세련된 디자인/IDE 스타일 구현 용이).
*   **Backend:** **FastAPI** + Python 3.10+
    *   장점: 비동기 처리(크롤링에 유리), 자동 API 문서(Swagger), Pydantic을 통한 데이터 검증.
*   **Database:** **SQLite** (SQLAlchemy)
    *   장점: 설정 불필요(파일 기반), 소규모 프로젝트에 적합, 백업 용이.
*   **AI/Crawling:** OpenAI API (or Anthropic), Playwright (or BeautifulSoup).

## 2. Option B: Lightweight SPA
복잡한 Next.js 기능 없이 가볍고 빠른 개발을 선호할 때 적합합니다.

*   **Frontend:** **React (Vite)** + TypeScript
    *   장점: 빌드 속도 빠름, 구조가 단순하여 배우기 쉬움, 전통적인 SPA 방식.
    *   UI 라이브러리: **Tailwind CSS** + **Mantine** or **Chakra UI**.
*   **Backend:** **FastAPI** + Python
*   **Database:** **SQLite** (SQLAlchemy)
*   **AI/Crawling:** 동일.

## 3. Option C: Robust Data (Docker)
데이터 양이 많아지거나 추후 배포 환경(AWS 등)을 고려하여 컨테이너 기반으로 시작하고 싶을 때 적합합니다.

*   **Frontend:** **Next.js** + TypeScript
*   **Backend:** **FastAPI** + Python
*   **Database:** **PostgreSQL** (Docker Compose)
    *   장점: 강력한 쿼리 기능, 동시성 처리 우수, JSON 타입 지원(크롤링 데이터 저장에 유리).
    *   단점: Docker 설치 및 설정 필요, 리소스 사용량 높음.
*   **AI/Crawling:** 동일.

---

### 💡 추천 의견
**Option A**를 추천합니다.
1.  **Next.js**는 요구하신 "고급스러운 웹 앱" 및 "대시보드"를 구축하기에 가장 적합한 프레임워크입니다.
2.  **SQLite**는 초기 설정 부담 없이 바로 개발을 시작할 수 있어 프로토타이핑에 유리합니다.
3.  **FastAPI**는 Python 크롤러와 AI 로직을 통합하기에 최적의 선택입니다.

어떤 옵션으로 진행하시겠습니까?
