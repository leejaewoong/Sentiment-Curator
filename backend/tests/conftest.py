import os
import pytest
from starlette.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# Set dummy env vars for testing
os.environ["OPENAI_API_KEY"] = "test_key"
os.environ["DATABASE_URL"] = "sqlite:///:memory:"

from app.main import app
from app.core.database import Base, get_db
from app.services.crawler import crawler
from app.services.ai_agent import ai_agent
from app.services.slack_bot import slack_bot

# Setup in-memory DB with StaticPool
engine = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="session", autouse=True)
def create_test_database():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def db_session():
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    yield session
    session.close()
    transaction.rollback()
    connection.close()

@pytest.fixture
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    yield TestClient(app)
    del app.dependency_overrides[get_db]

@pytest.fixture(autouse=True)
def mock_services(monkeypatch):
    # Mock Crawler
    async def mock_crawl(url):
        return {
            "url": url,
            "title": "Test Title",
            "content": "This is a test post content.",
            "images": ["http://img.com/1.jpg"],
            "source_domain": url
        }
    monkeypatch.setattr(crawler, "crawl_url", mock_crawl)

    # Mock AI Agent
    async def mock_filter(posts, prompt):
        return [
            {
                "index": 0,
                "summary": "Test Summary",
                "relevance_score": 95
            }
        ]
    monkeypatch.setattr(ai_agent, "filter_and_summarize", mock_filter)

    # Mock Slack Bot
    async def mock_send(text):
        print(f"Mock Slack Message: {text}")
    monkeypatch.setattr(slack_bot, "send_message", mock_send)
