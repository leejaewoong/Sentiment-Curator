from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import engine, Base
from app.models import post
from app.api.api import api_router

# Create Tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Sentiment Curator API")

# CORS Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")

@app.get("/")
def read_root():
    return {"message": "Sentiment Curator API is running"}

@app.get("/health")
def health_check():
    return {"status": "ok"}
