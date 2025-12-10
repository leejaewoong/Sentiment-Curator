from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.config import Config

router = APIRouter()

class ConfigUpdate(BaseModel):
    urls: list[str]
    schedule: str
    prompt: str

CONFIG_KEY = "crawler_settings"

@router.get("/")
def get_config(db: Session = Depends(get_db)):
    config_entry = db.query(Config).filter(Config.key == CONFIG_KEY).first()
    if config_entry:
        return config_entry.value
    # Return default if not found
    return {
        "urls": ["https://news.ycombinator.com"],
        "schedule": "0 9 * * *",
        "prompt": "Find interesting AI news"
    }

@router.post("/")
def update_config(config_data: ConfigUpdate, db: Session = Depends(get_db)):
    config_entry = db.query(Config).filter(Config.key == CONFIG_KEY).first()
    if not config_entry:
        config_entry = Config(key=CONFIG_KEY, value=config_data.model_dump())
        db.add(config_entry)
    else:
        config_entry.value = config_data.model_dump()
    
    db.commit()
    db.refresh(config_entry)
    return config_entry.value
