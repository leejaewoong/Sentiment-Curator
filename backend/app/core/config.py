import os
from dotenv import load_dotenv
from pydantic_settings import BaseSettings, SettingsConfigDict

# Revert to relative path for testing
load_dotenv("../.env")

class Settings(BaseSettings):
    PROJECT_NAME: str = "Sentiment Curator"
    
    # Database
    DATABASE_URL: str = "sqlite:///./data/sentiment.db"
    
    # OpenAI
    OPENAI_API_KEY: str | None = None
    OPENAI_MODEL: str = "gpt-4o-mini"
    
    # Slack
    SLACK_BOT_TOKEN: str | None = None
    SLACK_SIGNING_SECRET: str | None = None
    SLACK_CHANNEL_ID: str | None = None
    
    # Security
    SECRET_KEY: str = "dev_secret"

    model_config = SettingsConfigDict(env_file="../.env", env_ignore_empty=True, extra="ignore")

settings = Settings()
