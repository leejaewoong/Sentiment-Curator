"""
Posts API Endpoints
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.core.database import get_db
from app.models.post import Post

router = APIRouter()


@router.get("/")
async def get_posts(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
) -> List[Dict[str, Any]]:
    """Get list of filtered posts"""
    posts = db.query(Post).filter(Post.is_filtered == True).offset(skip).limit(limit).all()
    return [
        {
            "id": post.id,
            "title": post.title,
            "content": post.content,
            "url": post.url,
            "image_url": post.image_url,
            "summary": post.summary,
            "ai_score": post.ai_score,
            "created_at": post.created_at.isoformat() if post.created_at else None,
            "feedback_data": post.feedback_data
        }
        for post in posts
    ]


@router.get("/{post_id}")
async def get_post(post_id: int, db: Session = Depends(get_db)) -> Dict[str, Any]:
    """Get detailed post information"""
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    return {
        "id": post.id,
        "title": post.title,
        "content": post.content,
        "url": post.url,
        "image_url": post.image_url,
        "summary": post.summary,
        "ai_score": post.ai_score,
        "is_notified": post.is_notified,
        "created_at": post.created_at.isoformat() if post.created_at else None,
        "notified_at": post.notified_at.isoformat() if post.notified_at else None,
        "feedback_data": post.feedback_data
    }


@router.get("/stats")
async def get_stats(db: Session = Depends(get_db)) -> Dict[str, Any]:
    """Get dashboard statistics"""
    # TODO: Implement statistics calculation
    total_posts = db.query(Post).count()
    filtered_posts = db.query(Post).filter(Post.is_filtered == True).count()
    notified_posts = db.query(Post).filter(Post.is_notified == True).count()

    return {
        "total_posts": total_posts,
        "filtered_posts": filtered_posts,
        "notified_posts": notified_posts
    }
