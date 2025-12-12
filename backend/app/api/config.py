"""
User configuration API endpoints
"""
from fastapi import APIRouter

router = APIRouter()


@router.get("/")
async def get_config():
    """Get user configuration"""
    return {"message": "Get user config"}


@router.post("/")
async def update_config():
    """Update user configuration"""
    return {"message": "Update user config"}
