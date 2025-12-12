"""
Application configuration using Pydantic Settings
"""
from typing import List
from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    """Application settings"""

    # Environment
    ENVIRONMENT: str = Field(default="development", env="ENVIRONMENT")

    # Database (optional for development)
    DATABASE_URL: str = Field(
        default="sqlite+aiosqlite:///./data.db", env="DATABASE_URL"
    )

    # Redis (optional for development)
    REDIS_URL: str = Field(default="redis://localhost:6379/0", env="REDIS_URL")

    # OpenAI (optional - will warn if not set)
    OPENAI_API_KEY: str = Field(default="", env="OPENAI_API_KEY")
    OPENAI_MODEL: str = Field(default="gpt-4-turbo-2024-04-09", env="OPENAI_MODEL")
    OPENAI_EMBEDDING_MODEL: str = Field(
        default="text-embedding-3-small", env="OPENAI_EMBEDDING_MODEL"
    )

    # Slack (optional - will warn if not set)
    SLACK_BOT_TOKEN: str = Field(default="", env="SLACK_BOT_TOKEN")
    SLACK_CLIENT_ID: str = Field(default="", env="SLACK_CLIENT_ID")
    SLACK_CLIENT_SECRET: str = Field(default="", env="SLACK_CLIENT_SECRET")

    # Reddit (optional - will warn if not set)
    REDDIT_CLIENT_ID: str = Field(default="", env="REDDIT_CLIENT_ID")
    REDDIT_CLIENT_SECRET: str = Field(default="", env="REDDIT_CLIENT_SECRET")
    REDDIT_USER_AGENT: str = Field(
        default="SentimentCurator/1.0", env="REDDIT_USER_AGENT"
    )

    # Security (generate defaults for development)
    ENCRYPTION_KEY: str = Field(
        default="development-key-change-in-production", env="ENCRYPTION_KEY"
    )
    SECRET_KEY: str = Field(
        default="development-secret-change-in-production", env="SECRET_KEY"
    )
    ALGORITHM: str = Field(default="HS256", env="ALGORITHM")

    # CORS
    CORS_ORIGINS: List[str] = Field(
        default=["http://localhost:3000"], env="CORS_ORIGINS"
    )

    # Sentry
    SENTRY_DSN: str | None = Field(default=None, env="SENTRY_DSN")

    # Celery
    CELERY_BROKER_URL: str | None = Field(default=None, env="CELERY_BROKER_URL")
    CELERY_RESULT_BACKEND: str | None = Field(
        default=None, env="CELERY_RESULT_BACKEND"
    )

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True


# Create settings instance
settings = Settings()

# Warnings for missing API keys (development only)
if settings.ENVIRONMENT == "development":
    import warnings

    if not settings.OPENAI_API_KEY:
        warnings.warn(
            "OPENAI_API_KEY not set. AI features will not work.",
            UserWarning,
        )
    if not settings.SLACK_BOT_TOKEN:
        warnings.warn(
            "SLACK_BOT_TOKEN not set. Slack features will not work.",
            UserWarning,
        )
    if not settings.REDDIT_CLIENT_ID:
        warnings.warn(
            "REDDIT_CLIENT_ID not set. Reddit crawling will not work.",
            UserWarning,
        )
