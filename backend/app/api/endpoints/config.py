"""
Configuration API Endpoints
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, Any
from app.core.database import get_db
from app.models.config import Config

router = APIRouter()


@router.get("/")
async def get_config(db: Session = Depends(get_db)) -> Dict[str, Any]:
    """Get all configuration settings"""
    configs = db.query(Config).all()
    return {config.key: config.value for config in configs}


@router.post("/")
async def update_config(
    config_data: Dict[str, Any],
    db: Session = Depends(get_db)
) -> Dict[str, str]:
    """Update configuration settings"""
    for key, value in config_data.items():
        config = db.query(Config).filter(Config.key == key).first()
        if config:
            config.value = value
        else:
            config = Config(key=key, value=value)
            db.add(config)

    db.commit()
    return {"status": "success", "message": "Configuration updated"}
