from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class Post(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, index=True)
    source = Column(String, index=True)  # e.g., 'naver_cafe', 'reddit'
    external_id = Column(String, unique=True, index=True) # ID from the source 
    title = Column(String)
    content = Column(Text) # Body
    url = Column(String)
    author = Column(String)
    created_at = Column(DateTime) # Post creation time
    collected_at = Column(DateTime, default=datetime.utcnow)
    
    # Store comments as JSON.
    # Structure: [{ "author": "", "content": "", "created_at": "", "replies": [] }]
    comments = Column(JSON, default=[]) 

    transmission_statuses = relationship("TransmissionStatus", back_populates="post", cascade="all, delete-orphan")

class TransmissionStatus(Base):
    __tablename__ = "transmission_statuses"

    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("posts.id"))
    setting_id = Column(String) # Identifier for the specific setting/config
    status = Column(String, default="pending") # e.g., 'pending', 'sent', 'failed', 'skipped'
    sent_at = Column(DateTime, nullable=True)
    
    post = relationship("Post", back_populates="transmission_statuses")
