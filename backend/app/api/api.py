from fastapi import APIRouter
from app.api.endpoints import crawler, config, posts, slack

api_router = APIRouter()

api_router.include_router(crawler.router, prefix="/crawler", tags=["crawler"])
api_router.include_router(config.router, prefix="/config", tags=["config"])
api_router.include_router(posts.router, prefix="/posts", tags=["posts"])
api_router.include_router(slack.router, prefix="/slack", tags=["slack"])
