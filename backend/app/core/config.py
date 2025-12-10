"""
Application Configuration
"""
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""

    # Database
    DATABASE_URL: str = "sqlite:///./data/sentiment.db"

    # OpenAI
    OPENAI_API_KEY: Optional[str] = None

    # Slack
    SLACK_BOT_TOKEN: Optional[str] = None
    SLACK_SIGNING_SECRET: Optional[str] = None

    # Crawling
    CRAWL_TIMEOUT: int = 30000  # milliseconds
    CRAWL_MAX_PAGES: int = 10

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
