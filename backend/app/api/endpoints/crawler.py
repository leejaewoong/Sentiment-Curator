"""
Crawler API Endpoints
"""
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.config import Config
from app.models.post import Post
from app.services.crawler import CrawlerService
from app.services.ai_filter import AIFilterService
from app.services.slack_notifier import SlackNotifierService
from typing import Dict
from datetime import datetime

router = APIRouter()

# Global status tracking
crawler_status = {"running": False, "last_run": None}


async def run_crawler_job(db: Session):
    """Background task to run crawler"""
    global crawler_status

    try:
        crawler_status["running"] = True

        # Get configuration
        target_urls_config = db.query(Config).filter(Config.key == "target_urls").first()
        filter_prompt_config = db.query(Config).filter(Config.key == "filter_prompt").first()
        slack_channel_config = db.query(Config).filter(Config.key == "slack_channel").first()

        if not target_urls_config or not target_urls_config.value:
            print("No target URLs configured")
            return

        target_urls = target_urls_config.value
        filter_prompt = filter_prompt_config.value if filter_prompt_config else ""
        slack_channel = slack_channel_config.value if slack_channel_config else None

        # Step 1: Crawl URLs
        crawler = CrawlerService()
        raw_posts = await crawler.crawl_multiple_urls(target_urls)
        print(f"Crawled {len(raw_posts)} posts")

        # Step 2: AI Filtering
        ai_filter = AIFilterService()
        filtered_posts = await ai_filter.filter_posts(raw_posts, filter_prompt)
        print(f"Filtered to {len(filtered_posts)} posts")

        # Step 3: Save to database
        for post_data in filtered_posts:
            # Check if post already exists
            existing = db.query(Post).filter(Post.url == post_data["url"]).first()
            if existing:
                continue

            post = Post(
                title=post_data.get("title", ""),
                content=post_data.get("content", ""),
                url=post_data["url"],
                image_url=post_data.get("image_url"),
                source=post_data.get("source"),
                is_filtered=post_data.get("is_filtered", True),
                ai_score=post_data.get("ai_score"),
                summary=post_data.get("summary"),
                crawled_at=post_data.get("crawled_at", datetime.utcnow()),
            )
            db.add(post)

        db.commit()
        print("Posts saved to database")

        # Step 4: Send Slack notifications
        if slack_channel and filtered_posts:
            slack = SlackNotifierService()
            timestamps = await slack.send_batch_notification(filtered_posts, slack_channel)

            # Update posts with Slack timestamp
            for i, ts in enumerate(timestamps):
                if i < len(filtered_posts):
                    post = db.query(Post).filter(Post.url == filtered_posts[i]["url"]).first()
                    if post:
                        post.is_notified = True
                        post.slack_ts = ts
                        post.notified_at = datetime.utcnow()

            db.commit()
            print(f"Sent {len(timestamps)} Slack notifications")

    except Exception as e:
        print(f"Error in crawler job: {e}")
    finally:
        crawler_status["running"] = False
        crawler_status["last_run"] = datetime.utcnow().isoformat()


@router.post("/run")
async def run_crawler(
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
) -> Dict[str, str]:
    """Trigger manual crawling execution"""
    if crawler_status["running"]:
        raise HTTPException(status_code=409, detail="Crawler is already running")

    background_tasks.add_task(run_crawler_job, db)

    return {
        "status": "accepted",
        "message": "Crawler job started in background"
    }


@router.get("/status")
async def get_status() -> Dict:
    """Get current crawler execution status"""
    return {
        "status": "running" if crawler_status["running"] else "idle",
        "last_run": crawler_status["last_run"]
    }
