"""
Post Model
"""
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, JSON
from datetime import datetime
from app.core.database import Base


class Post(Base):
    """Post table for storing crawled and filtered content"""

    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=True)
    url = Column(String, unique=True, nullable=False)
    image_url = Column(String, nullable=True)
    source = Column(String, nullable=True)  # Source website

    # AI filtering
    is_filtered = Column(Boolean, default=False)  # Passed AI filter
    ai_score = Column(Integer, nullable=True)  # AI relevance score
    summary = Column(Text, nullable=True)  # AI-generated summary

    # Slack notification
    is_notified = Column(Boolean, default=False)
    slack_ts = Column(String, nullable=True)  # Slack message timestamp

    # Feedback
    feedback_data = Column(JSON, nullable=True)  # Emoji reactions, thread count

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    crawled_at = Column(DateTime, default=datetime.utcnow)
    notified_at = Column(DateTime, nullable=True)

    def __repr__(self):
        return f"<Post(id={self.id}, title={self.title[:30]})>"
