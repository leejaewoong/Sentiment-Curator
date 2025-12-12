"""
Authentication API endpoints
"""
from fastapi import APIRouter

router = APIRouter()


@router.get("/verify")
async def verify_token():
    """Verify Slack OAuth token"""
    return {"message": "Token verification endpoint"}
