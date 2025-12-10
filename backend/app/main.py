"""
FastAPI Application Entry Point
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.endpoints import config, crawler, posts
from app.core.database import engine, Base

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Sentiment Curator API",
    description="AI-powered content curation and filtering service",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(config.router, prefix="/api/config", tags=["config"])
app.include_router(crawler.router, prefix="/api/crawler", tags=["crawler"])
app.include_router(posts.router, prefix="/api/posts", tags=["posts"])


@app.get("/")
async def root():
    """Health check endpoint"""
    return {"status": "healthy", "service": "Sentiment Curator API"}
