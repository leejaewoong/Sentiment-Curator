# 시스템 아키텍처 설계서

## 1. 전체 시스템 아키텍처

### 1.1 High-Level Architecture

```mermaid
graph TB
    User[사용자] -->|Slack OAuth| Frontend[Next.js Frontend<br/>Vercel]
    Frontend -->|HTTPS API| Backend[FastAPI Backend<br/>GCP Cloud Run]

    subgraph "GCP Cloud Run"
        Backend -->|CRUD| DB[(Supabase<br/>PostgreSQL)]
        Backend -->|Cache| Redis[(Upstash<br/>Redis)]

        Scheduler[Celery Beat] -->|Trigger| Crawler[Reddit Crawler]
        Crawler -->|PRAW| RedditAPI[Reddit API]
        Crawler -->|Save| DB

        Scheduler -->|Trigger| AIAgent[AI Filter Agent]
        AIAgent -->|Query| DB
        AIAgent -->|Prompt| LLM[OpenAI GPT-4o]
        AIAgent -->|Similarity| Embeddings[OpenAI<br/>Embeddings]

        AIAgent -->|Selected Posts| Notifier[Slack Notifier]
    end

    Notifier -->|Post Message| Slack[Slack Workspace]
    Slack -->|Notification| User

    style Frontend fill:#61dafb
    style Backend fill:#009688
    style DB fill:#3ecf8e
    style Redis fill:#dc382d
    style LLM fill:#10a37f
```

### 1.2 Component Interaction

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as FastAPI
    participant C as Celery
    participant R as Reddit
    participant AI as OpenAI
    participant S as Slack
    participant DB as Supabase

    U->>F: 설정 입력 (프롬프트, 채널)
    F->>A: POST /api/config
    A->>DB: Save user settings

    Note over C: Scheduled Task (Cron)
    C->>A: Trigger crawl job
    A->>R: Fetch posts (PRAW)
    R-->>A: Posts + Comments
    A->>DB: Save raw posts

    A->>AI: Filter posts (prompt)
    AI-->>A: Relevance scores
    A->>AI: Generate embeddings
    AI-->>A: Vectors
    A->>DB: Save filtered posts

    A->>S: Send messages (개별)
    S-->>U: Slack notification

    U->>F: View dashboard
    F->>A: GET /api/history
    A->>DB: Query filtered_posts
    DB-->>F: Display results
```

---

## 2. 디렉토리 구조

### 2.1 Monorepo Structure

```
sentiment-curator/
├── frontend/                 # Next.js Application
│   ├── src/
│   │   ├── app/              # App Router
│   │   │   ├── (auth)/       # Auth routes
│   │   │   │   ├── login/
│   │   │   │   └── callback/
│   │   │   ├── dashboard/    # Dashboard page
│   │   │   ├── settings/     # Configuration page
│   │   │   └── api/          # API Route Handlers
│   │   │       └── auth/
│   │   ├── components/       # React Components
│   │   │   ├── ui/           # Shadcn components
│   │   │   ├── dashboard/
│   │   │   └── settings/
│   │   ├── lib/              # Utilities
│   │   │   ├── api-client.ts # Backend API client
│   │   │   ├── auth.ts       # NextAuth config
│   │   │   └── utils.ts
│   │   └── types/            # TypeScript types
│   ├── public/
│   ├── .env.local
│   ├── next.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── backend/                  # FastAPI Application
│   ├── app/
│   │   ├── main.py           # Entry point
│   │   ├── config.py         # Settings (pydantic)
│   │   ├── api/              # API Endpoints
│   │   │   ├── __init__.py
│   │   │   ├── auth.py       # OAuth verification
│   │   │   ├── config.py     # User settings CRUD
│   │   │   ├── crawler.py    # Manual trigger
│   │   │   └── history.py    # Dashboard data
│   │   ├── core/             # Core modules
│   │   │   ├── database.py   # SQLAlchemy setup
│   │   │   ├── security.py   # Token encryption
│   │   │   └── celery_app.py # Celery config
│   │   ├── models/           # SQLAlchemy Models
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   ├── post.py
│   │   │   ├── comment.py
│   │   │   └── filtered_post.py
│   │   ├── schemas/          # Pydantic Schemas
│   │   │   ├── user.py
│   │   │   ├── post.py
│   │   │   └── config.py
│   │   ├── services/         # Business Logic
│   │   │   ├── reddit_crawler.py   # PRAW integration
│   │   │   ├── ai_filter.py        # OpenAI integration
│   │   │   ├── slack_notifier.py   # Slack SDK
│   │   │   └── embedding_search.py # Vector similarity
│   │   └── tasks/            # Celery Tasks
│   │       ├── crawl.py      # Scheduled crawl
│   │       ├── filter.py     # AI filtering
│   │       └── cleanup.py    # 48h cleanup
│   ├── tests/
│   ├── alembic/              # DB Migrations
│   ├── .env
│   ├── Dockerfile
│   ├── requirements.txt
│   └── pyproject.toml
│
├── docs/                     # Documentation
│   ├── REQUIREMENTS.md
│   ├── TECH_STACK.md
│   ├── ARCHITECTURE.md       # This file
│   └── API.md                # API Spec
│
├── .github/
│   └── workflows/
│       └── deploy.yml        # CI/CD
│
├── .gitignore
├── README.md
└── docker-compose.yml        # Local development
```

---

## 3. 데이터 플로우

### 3.1 크롤링 파이프라인

```mermaid
flowchart LR
    A[Celery Beat<br/>Cron Trigger] --> B[Crawl Task]
    B --> C{Get User<br/>Configs}
    C --> D[PRAW Client]
    D --> E[Fetch Posts<br/>r/PUBATTLEGROUNDS]
    E --> F{For each post}
    F --> G[Fetch Comments]
    G --> H[Save to DB]
    H --> I{More posts?}
    I -->|Yes| F
    I -->|No| J[Update Job Status]
    J --> K[Trigger AI Filter]
```

**세부 단계:**
1. **Cron 스케줄 트리거** (예: 매 6시간)
2. **User Config 조회** (Supabase)
   - 대상 서브레딧
   - 수집 기간 (48시간)
3. **Reddit API 호출** (PRAW)
   ```python
   subreddit = reddit.subreddit("PUBATTLEGROUNDS")
   for post in subreddit.new(limit=100):
       # 48시간 이내 필터링
       if post.created_utc > cutoff_time:
           save_post(post)
           # 댓글도 수집
           post.comments.replace_more(limit=0)
           for comment in post.comments.list():
               save_comment(comment)
   ```
4. **DB 저장** (posts, comments 테이블)
5. **중복 체크** (reddit_id UNIQUE)

### 3.2 AI 필터링 파이프라인

```mermaid
flowchart TD
    A[Filter Task] --> B[Get Unfiltered<br/>Posts]
    B --> C[Get User Prompt]
    C --> D{For each post}
    D --> E[Combine Post +<br/>Comments]
    E --> F[Call GPT-4o<br/>Relevance Check]
    F --> G{Relevance > 0.7?}
    G -->|Yes| H[Generate Summary]
    G -->|No| D
    H --> I[Generate Embedding]
    I --> J[Find Similar Posts<br/>Cosine Similarity]
    J --> K[Save Filtered Post]
    K --> D
    D --> L{All processed?}
    L -->|Yes| M[Sort by Score]
    M --> N[Select Top N]
    N --> O[Trigger Notifier]
```

**AI 호출 최적화:**
- **Batch Processing:** 여러 포스트를 한 번에 전송
- **Prompt Caching:** 동일 프롬프트 재사용 시 캐싱
- **Model Selection:**
  - 필터링: `gpt-4o-mini` (빠르고 저렴)
  - 요약: `gpt-4o` (고품질)

**프롬프트 예시:**
```python
system_prompt = """
You are an AI that filters PUBG community posts based on user interests.

User Interest: {user_prompt}

Given a post (title + content + top comments), determine:
1. Relevance Score (0.0-1.0)
2. Brief summary (2-3 sentences in Korean)

Respond in JSON:
{
  "relevance": 0.85,
  "summary": "새로운 패치로 인한 FPS 저하 문제가 보고되고 있습니다..."
}
"""

user_message = f"""
Title: {post.title}
Content: {post.content}
Top Comments: {top_comments}
"""
```

### 3.3 Slack 알림 플로우

```mermaid
flowchart LR
    A[Notifier Task] --> B[Get Top N<br/>Filtered Posts]
    B --> C{For each post}
    C --> D[Translate to Korean<br/>if English]
    D --> E[Build Block Kit<br/>Message]
    E --> F[Post to Slack<br/>Channel]
    F --> G[Save slack_ts]
    G --> H{More posts?}
    H -->|Yes| C
    H -->|No| I[Mark as Sent]
```

**Slack Block Kit 예시:**
```json
{
  "blocks": [
    {
      "type": "header",
      "text": {
        "type": "plain_text",
        "text": "🎮 PUBG 신규 포스트"
      }
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*요약:*\n새로운 패치로 인한 FPS 저하 문제가 보고되고 있습니다. 유저들은 특히 Erangel 맵에서 심각한 성능 저하를 경험하고 있으며..."
      }
    },
    {
      "type": "section",
      "fields": [
        {
          "type": "mrkdwn",
          "text": "*📎 원본:*\n<https://reddit.com/r/PUBATTLEGROUNDS/...|View Post>"
        },
        {
          "type": "mrkdwn",
          "text": "*🔗 관련 포스트:*\n• <link1|Post 1>\n• <link2|Post 2>"
        }
      ]
    },
    {
      "type": "divider"
    }
  ]
}
```

---

## 4. 주요 컴포넌트 상세

### 4.1 Reddit Crawler Service

**역할:**
- Reddit API를 통한 포스트/댓글 수집
- Rate Limit 관리
- 에러 핸들링 및 재시도

**핵심 로직:**
```python
class RedditCrawler:
    def __init__(self):
        self.reddit = praw.Reddit(...)

    async def crawl_subreddit(
        self,
        subreddit_name: str,
        hours_ago: int = 48
    ) -> List[Post]:
        cutoff = datetime.now(timezone.utc) - timedelta(hours=hours_ago)
        subreddit = self.reddit.subreddit(subreddit_name)

        posts = []
        for submission in subreddit.new(limit=200):
            if submission.created_utc < cutoff.timestamp():
                break

            post_data = {
                "reddit_id": submission.id,
                "title": submission.title,
                "content": submission.selftext,
                "url": submission.url,
                "created_at": datetime.fromtimestamp(
                    submission.created_utc,
                    timezone.utc
                ),
                # ...
            }

            # 댓글 수집
            submission.comments.replace_more(limit=0)
            comments = [
                {
                    "reddit_id": comment.id,
                    "body": comment.body,
                    "author": comment.author.name if comment.author else "[deleted]",
                    # ...
                }
                for comment in submission.comments.list()
            ]

            posts.append({"post": post_data, "comments": comments})

        return posts
```

### 4.2 AI Filter Service

**역할:**
- LLM을 활용한 포스트 필터링
- 임베딩 기반 유사 포스트 검색
- 번역 및 요약 생성

**핵심 로직:**
```python
class AIFilterService:
    def __init__(self):
        self.openai = OpenAI()

    async def filter_post(
        self,
        post: Post,
        comments: List[Comment],
        user_prompt: str
    ) -> FilterResult:
        # 1. Relevance Check
        combined_text = f"{post.title}\n\n{post.content}\n\n"
        combined_text += "\n".join([c.body for c in comments[:10]])

        response = await self.openai.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": FILTER_SYSTEM_PROMPT},
                {"role": "user", "content": f"User Interest: {user_prompt}\n\nPost:\n{combined_text}"}
            ],
            response_format={"type": "json_object"}
        )

        result = json.loads(response.choices[0].message.content)

        if result["relevance"] < 0.7:
            return None

        # 2. Generate Summary
        summary = await self._generate_summary(post, comments)

        # 3. Find Related Posts
        embedding = await self._get_embedding(combined_text)
        related = await self._find_similar_posts(embedding, exclude=post.id)

        return FilterResult(
            relevance=result["relevance"],
            summary=summary,
            related_posts=related
        )

    async def _get_embedding(self, text: str) -> List[float]:
        response = await self.openai.embeddings.create(
            model="text-embedding-3-small",
            input=text
        )
        return response.data[0].embedding

    async def _find_similar_posts(
        self,
        query_embedding: List[float],
        exclude: str,
        limit: int = 3
    ) -> List[Post]:
        # PostgreSQL pgvector 사용
        similar = await db.execute(
            """
            SELECT id, title,
                   1 - (embedding <=> :query) AS similarity
            FROM posts
            WHERE id != :exclude
            ORDER BY embedding <=> :query
            LIMIT :limit
            """,
            {"query": query_embedding, "exclude": exclude, "limit": limit}
        )
        return similar.fetchall()
```

### 4.3 Slack Notifier Service

**역할:**
- Slack API를 통한 메시지 전송
- Block Kit 포맷팅
- 에러 핸들링

**핵심 로직:**
```python
class SlackNotifier:
    def __init__(self):
        self.client = WebClient(token=settings.SLACK_BOT_TOKEN)

    async def send_post(
        self,
        channel: str,
        post: FilteredPost
    ) -> str:
        blocks = self._build_blocks(post)

        try:
            response = self.client.chat_postMessage(
                channel=channel,
                text=post.summary[:100],  # Fallback text
                blocks=blocks,
                unfurl_links=False
            )
            return response["ts"]  # Slack timestamp
        except SlackApiError as e:
            logger.error(f"Slack error: {e.response['error']}")
            raise

    def _build_blocks(self, post: FilteredPost) -> List[dict]:
        blocks = [
            {
                "type": "header",
                "text": {"type": "plain_text", "text": "🎮 PUBG 신규 포스트"}
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": f"*요약:*\n{post.summary}"
                }
            },
            {
                "type": "section",
                "fields": [
                    {
                        "type": "mrkdwn",
                        "text": f"*📎 원본:*\n<{post.url}|View Post>"
                    }
                ]
            }
        ]

        if post.related_posts:
            related_text = "\n".join([
                f"• <{p.url}|{p.title[:50]}>"
                for p in post.related_posts
            ])
            blocks[-1]["fields"].append({
                "type": "mrkdwn",
                "text": f"*🔗 관련 포스트:*\n{related_text}"
            })

        blocks.append({"type": "divider"})
        return blocks
```

### 4.4 Celery Tasks

**스케줄 설정:**
```python
# app/core/celery_app.py
from celery import Celery
from celery.schedules import crontab

celery = Celery("sentiment_curator")

celery.conf.beat_schedule = {
    "crawl-reddit-every-6h": {
        "task": "app.tasks.crawl.crawl_all_subreddits",
        "schedule": crontab(minute=0, hour="*/6"),  # 매 6시간
    },
    "cleanup-old-posts-daily": {
        "task": "app.tasks.cleanup.delete_old_posts",
        "schedule": crontab(hour=0, minute=0),  # 매일 자정
    },
}
```

**태스크 정의:**
```python
# app/tasks/crawl.py
@celery.task
async def crawl_all_subreddits():
    users = await get_active_users()

    for user in users:
        subreddits = user.settings.get("subreddits", ["PUBATTLEGROUNDS"])

        for subreddit in subreddits:
            await crawl_and_filter.delay(user.id, subreddit)

@celery.task
async def crawl_and_filter(user_id: str, subreddit: str):
    # 1. Crawl
    crawler = RedditCrawler()
    posts = await crawler.crawl_subreddit(subreddit, hours_ago=48)
    await save_posts_to_db(posts)

    # 2. Filter
    ai_filter = AIFilterService()
    user = await get_user(user_id)

    filtered = []
    for post in posts:
        result = await ai_filter.filter_post(
            post,
            post.comments,
            user.settings["prompt"]
        )
        if result:
            filtered.append(result)

    # 3. Select Top N
    top_posts = sorted(filtered, key=lambda x: x.relevance, reverse=True)
    top_posts = top_posts[:user.settings.get("num_posts", 5)]

    # 4. Notify
    if user.settings.get("delivery_mode") == "scheduled":
        notifier = SlackNotifier()
        for post in top_posts:
            await notifier.send_post(user.settings["slack_channel"], post)
```

---

## 5. 인증 및 보안

### 5.1 OAuth Flow (Slack)

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant NA as NextAuth
    participant S as Slack
    participant B as Backend

    U->>F: Click "Login with Slack"
    F->>NA: Initiate OAuth
    NA->>S: Redirect to Slack OAuth
    S->>U: Login & Authorize
    U->>S: Approve
    S->>NA: Callback with code
    NA->>S: Exchange code for token
    S-->>NA: Access Token
    NA->>B: Verify & Save Token
    B->>DB: Store encrypted token
    NA-->>F: Set session cookie
    F->>U: Redirect to Dashboard
```

**NextAuth 설정:**
```typescript
// src/lib/auth.ts
export const authOptions: NextAuthOptions = {
  providers: [
    SlackProvider({
      clientId: process.env.SLACK_CLIENT_ID!,
      clientSecret: process.env.SLACK_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
        token.teamId = account.team_id;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      return session;
    },
  },
};
```

### 5.2 API 인증

**Frontend → Backend:**
```typescript
// Frontend API Client
const apiClient = {
  async request(endpoint: string, options?: RequestInit) {
    const session = await getServerSession(authOptions);

    return fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
      ...options,
      headers: {
        "Authorization": `Bearer ${session?.accessToken}`,
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });
  },
};
```

**Backend 검증:**
```python
# app/api/dependencies.py
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer

security = HTTPBearer()

async def get_current_user(
    token: str = Depends(security)
) -> User:
    # Slack token 검증
    slack_client = WebClient(token=token.credentials)
    try:
        auth_test = slack_client.auth_test()
        user_id = auth_test["user_id"]
    except SlackApiError:
        raise HTTPException(status_code=401, detail="Invalid token")

    # DB에서 사용자 조회
    user = await db.get_user_by_slack_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user
```

### 5.3 민감 데이터 암호화

```python
# app/core/security.py
from cryptography.fernet import Fernet

class TokenEncryption:
    def __init__(self):
        self.cipher = Fernet(settings.ENCRYPTION_KEY.encode())

    def encrypt(self, token: str) -> str:
        return self.cipher.encrypt(token.encode()).decode()

    def decrypt(self, encrypted: str) -> str:
        return self.cipher.decrypt(encrypted.encode()).decode()

# 사용 예시
encryption = TokenEncryption()
user.access_token = encryption.encrypt(oauth_token)
```

---

## 6. 모니터링 및 로깅

### 6.1 Logging Strategy

**구조화된 로깅:**
```python
import structlog

logger = structlog.get_logger()

logger.info(
    "crawl_completed",
    subreddit="PUBATTLEGROUNDS",
    posts_collected=47,
    duration_seconds=23.5,
    user_id="user-123"
)
```

**로그 레벨:**
- `DEBUG`: 개발 환경 상세 로그
- `INFO`: 정상 동작 (크롤링 완료, 필터링 완료 등)
- `WARNING`: 재시도 가능한 에러 (Rate Limit 초과)
- `ERROR`: 즉시 대응 필요한 에러 (API 실패)

### 6.2 Metrics

**추적 항목:**
- 크롤링: 수집된 포스트 수, 소요 시간
- AI 필터링: 필터링율, API 비용
- Slack 전송: 성공/실패율
- DB: 쿼리 성능, 연결 수

**구현 (Prometheus):**
```python
from prometheus_client import Counter, Histogram

crawl_posts_total = Counter(
    "crawl_posts_total",
    "Total posts collected",
    ["subreddit"]
)

ai_filter_duration = Histogram(
    "ai_filter_duration_seconds",
    "AI filtering duration"
)

# 사용
crawl_posts_total.labels(subreddit="PUBATTLEGROUNDS").inc(47)
```

### 6.3 Error Tracking (Sentry)

```python
import sentry_sdk

sentry_sdk.init(
    dsn=settings.SENTRY_DSN,
    environment="production",
    traces_sample_rate=0.1,
)

# 자동으로 에러 캡처
# 수동 캡처
sentry_sdk.capture_exception(exception)
```

---

## 7. 배포 아키텍처

### 7.1 Production Deployment

```
┌─────────────────────────────────────────────────────┐
│                   Cloudflare CDN                    │
│                 (DNS + DDoS Protection)             │
└─────────────────┬───────────────────────────────────┘
                  │
        ┌─────────┴──────────┐
        │                    │
        ▼                    ▼
┌──────────────┐    ┌─────────────────┐
│   Vercel     │    │  GCP Cloud Run  │
│  (Frontend)  │◄───┤   (Backend)     │
└──────────────┘    └────────┬────────┘
                             │
                    ┌────────┼────────┐
                    │        │        │
                    ▼        ▼        ▼
            ┌────────┐  ┌──────┐  ┌────────┐
            │Supabase│  │Upstash│  │OpenAI │
            │  (DB)  │  │Redis │  │ API   │
            └────────┘  └──────┘  └────────┘
```

### 7.2 CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: vercel/action@v2
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}

  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Set up Cloud SDK
        uses: google-github-actions/setup-gcloud@v1
        with:
          service_account_key: ${{ secrets.GCP_SA_KEY }}

      - name: Build and Push
        run: |
          gcloud builds submit --tag gcr.io/$PROJECT_ID/api

      - name: Deploy to Cloud Run
        run: |
          gcloud run deploy sentiment-curator-api \
            --image gcr.io/$PROJECT_ID/api \
            --platform managed \
            --region us-central1 \
            --allow-unauthenticated
```

### 7.3 Environment Variables

**Frontend (.env.local):**
```bash
NEXT_PUBLIC_API_URL=https://api.sentiment-curator.com
NEXTAUTH_URL=https://sentiment-curator.com
NEXTAUTH_SECRET=<random-secret>
SLACK_CLIENT_ID=<slack-app-id>
SLACK_CLIENT_SECRET=<slack-secret>
```

**Backend (.env):**
```bash
DATABASE_URL=postgresql+asyncpg://user:pass@db.supabase.co/postgres
REDIS_URL=redis://default:pass@upstash-redis.com:6379
OPENAI_API_KEY=sk-...
SLACK_BOT_TOKEN=xoxb-...
REDDIT_CLIENT_ID=<reddit-id>
REDDIT_CLIENT_SECRET=<reddit-secret>
ENCRYPTION_KEY=<fernet-key>
SENTRY_DSN=https://...
```

---

## 8. 확장성 고려사항

### 8.1 수평 확장

**Cloud Run Auto-Scaling:**
```yaml
# cloudrun.yaml
spec:
  template:
    metadata:
      annotations:
        autoscaling.knative.dev/minScale: "1"
        autoscaling.knative.dev/maxScale: "10"
    spec:
      containerConcurrency: 80
```

### 8.2 데이터베이스 최적화

**인덱스:**
```sql
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_posts_subreddit ON posts(subreddit);
CREATE INDEX idx_filtered_posts_user ON filtered_posts(user_id);

-- Vector 검색 (pgvector)
CREATE INDEX ON posts USING ivfflat (embedding vector_cosine_ops);
```

### 8.3 캐싱 전략

```python
from functools import lru_cache

@lru_cache(maxsize=100)
def get_user_settings(user_id: str):
    return db.query(User).filter(User.id == user_id).first().settings
```

---

## 9. 향후 개선 방향

1. **실시간 크롤링:** Reddit Stream API 활용
2. **멀티 테넌트:** 여러 팀이 사용 가능하도록
3. **웹훅:** Slack 이벤트 구독으로 피드백 수집
4. **고급 분석:** 트렌드 분석, 감성 분석
5. **모바일 앱:** React Native로 모바일 지원
