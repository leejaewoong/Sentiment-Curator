"""
History/Dashboard API endpoints
"""
from fastapi import APIRouter

router = APIRouter()


@router.get("/")
async def get_history():
    """Get filtered post history"""
    return {"posts": []}


@router.get("/{post_id}")
async def get_post_detail(post_id: str):
    """Get post detail"""
    return {"id": post_id}
