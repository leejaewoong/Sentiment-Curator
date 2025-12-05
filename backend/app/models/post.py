from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, JSON
from sqlalchemy.sql import func
from app.core.database import Base

class Post(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, index=True)
    
    # Metadata
    url = Column(String, index=True)
    source_domain = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Content
    title = Column(String)
    content = Column(Text) # Full text or summary
    images = Column(JSON) # List of image URLs
    
    # Analysis
    is_filtered = Column(Boolean, default=False) # True if selected by AI
    relevance_score = Column(Integer, default=0)
    summary = Column(Text)
    
    # Feedback / Slack
    slack_ts = Column(String, nullable=True) # Slack Message Timestamp (for threading)
    slack_channel = Column(String, nullable=True)
    feedback_score = Column(Integer, default=0) # Sum of reactions
    reaction_data = Column(JSON, default={}) # Detailed reaction logs
    thread_count = Column(Integer, default=0)
    
    def __repr__(self):
        return f"<Post {self.title}>"
