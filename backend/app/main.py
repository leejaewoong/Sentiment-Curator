"""
Sentiment-Curator Backend
FastAPI application entry point
"""
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

from app.config import settings
from app.core.database import engine
from app.core.logger import logger
from app.api import auth, config, crawler, history

# Initialize Sentry (optional)
try:
    import sentry_sdk

    if settings.SENTRY_DSN:
        sentry_sdk.init(
            dsn=settings.SENTRY_DSN,
            environment=settings.ENVIRONMENT,
            traces_sample_rate=0.1,
        )
except ImportError:
    # Sentry SDK not installed - skip monitoring
    pass

# Create FastAPI app
app = FastAPI(
    title="Sentiment-Curator API",
    description="AI-powered PUBG community curator",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    """Startup event handler"""
    logger.info(f"Starting Sentiment-Curator API in {settings.ENVIRONMENT} mode")
    logger.info(f"CORS origins: {settings.CORS_ORIGINS}")


@app.on_event("shutdown")
async def shutdown():
    """Shutdown event handler"""
    logger.info("Shutting down Sentiment-Curator API")
    await engine.dispose()


# Exception handlers
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle validation errors"""
    logger.error(f"Validation error: {exc}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": exc.errors(), "body": exc.body},
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Handle general exceptions"""
    logger.exception(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Internal server error"},
    )


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "name": "Sentiment-Curator API",
        "version": "0.1.0",
        "docs": "/docs",
    }


# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(config.router, prefix="/api/config", tags=["config"])
app.include_router(crawler.router, prefix="/api/crawler", tags=["crawler"])
app.include_router(history.router, prefix="/api/history", tags=["history"])
