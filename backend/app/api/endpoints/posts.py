from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.post import Post

router = APIRouter()

@router.get("/")
def get_posts(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    posts = db.query(Post).order_by(Post.created_at.desc()).offset(skip).limit(limit).all()
    return posts

@router.get("/filtered")
def get_filtered_posts(db: Session = Depends(get_db)):
    posts = db.query(Post).filter(Post.is_filtered == True).order_by(Post.created_at.desc()).all()
    return posts
