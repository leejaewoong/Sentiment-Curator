from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "Sentiment Curator"
    
    # Database
    DATABASE_URL: str = "sqlite:///./data/data.db"
    
    # OpenAI
    OPENAI_API_KEY: str | None = None
    
    # Slack
    SLACK_BOT_TOKEN: str | None = None
    SLACK_SIGNING_SECRET: str | None = None
    SLACK_CHANNEL_ID: str | None = None
    
    # Security
    SECRET_KEY: str = "dev_secret"

    model_config = SettingsConfigDict(env_file=".env", env_ignore_empty=True, extra="ignore")

settings = Settings()
