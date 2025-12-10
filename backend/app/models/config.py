from sqlalchemy import Column, Integer, String, JSON
from app.core.database import Base

class Config(Base):
    __tablename__ = "configs"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String, unique=True, index=True) # e.g., "crawler_settings"
    value = Column(JSON) # Stores the entire config object
