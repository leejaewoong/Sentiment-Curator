from fastapi import APIRouter, Request
from app.core.config import settings
import hmac
import hashlib
import time

router = APIRouter()

@router.post("/events")
async def slack_events(request: Request):
    # Verify Request
    body = await request.body()
    timestamp = request.headers.get("X-Slack-Request-Timestamp")
    signature = request.headers.get("X-Slack-Signature")
    
    # URL Verification (Challenge)
    json_body = await request.json()
    if json_body.get("type") == "url_verification":
        return {"challenge": json_body.get("challenge")}
        
    # Handle Events (Async)
    event = json_body.get("event", {})
    if event.get("type") == "reaction_added":
        print(f"Reaction added: {event.get('reaction')} to {event.get('item')}")
        # TODO: Update DB with reaction
        
    return {"status": "ok"}
