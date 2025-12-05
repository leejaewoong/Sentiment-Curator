from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class ConfigUpdate(BaseModel):
    urls: list[str]
    schedule: str
    prompt: str

# Mock config storage (In-memory for MVP, should be DB)
current_config = {
    "urls": ["https://news.ycombinator.com"],
    "schedule": "0 9 * * *",
    "prompt": "Find interesting AI news"
}

@router.get("/")
def get_config():
    return current_config

@router.post("/")
def update_config(config: ConfigUpdate):
    current_config.update(config.model_dump())
    return current_config
