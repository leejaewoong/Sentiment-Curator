"""
Configuration Model
"""
from sqlalchemy import Column, Integer, String, Text, JSON
from app.core.database import Base


class Config(Base):
    """Configuration table for storing user settings"""

    __tablename__ = "configs"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String, unique=True, index=True, nullable=False)
    value = Column(JSON, nullable=True)
    description = Column(Text, nullable=True)

    def __repr__(self):
        return f"<Config(key={self.key})>"
