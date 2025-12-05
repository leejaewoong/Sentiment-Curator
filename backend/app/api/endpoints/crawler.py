from fastapi import APIRouter, BackgroundTasks, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.crawler import crawler
from app.services.ai_agent import ai_agent
from app.services.slack_bot import slack_bot
from app.models.post import Post
from pydantic import BaseModel

router = APIRouter()

class CrawlRequest(BaseModel):
    urls: list[str]
    prompt: str

async def run_crawler_job(urls: list[str], prompt: str, db: Session):
    print("Starting crawler job...")
    all_posts = []
    
    # 1. Crawl
    for url in urls:
        data = await crawler.crawl_url(url)
        if data:
            # Save raw post to DB
            post = Post(
                url=data["url"],
                title=data["title"],
                content=data["content"],
                images=data["images"],
                source_domain=url
            )
            db.add(post)
            db.commit()
            db.refresh(post)
            all_posts.append({"index": post.id, "title": post.title, "content": post.content})
    
    # 2. Filter with AI
    if all_posts:
        print("Filtering with AI...")
        selected_items = await ai_agent.filter_and_summarize(all_posts, prompt)
        
        for item in selected_items:
            # Update DB
            # Note: item['index'] here refers to the index in the list sent to AI, 
            # but we need to map it back to DB ID. 
            # For simplicity in this MVP, let's assume 1:1 mapping or just use list index.
            # Actually, ai_agent returns index from the list we sent.
            idx = item.get("index")
            if idx is not None and 0 <= idx < len(all_posts):
                db_id = all_posts[idx]["index"]
                post = db.query(Post).filter(Post.id == db_id).first()
                if post:
                    post.is_filtered = True
                    post.summary = item.get("summary")
                    post.relevance_score = item.get("relevance_score", 0)
                    db.commit()
                    
                    # 3. Notify Slack
                    print(f"Sending notification for {post.title}")
                    await slack_bot.send_message(
                        text=f"*New Trend Found!* :rocket:\n\n*Title:* <{post.url}|{post.title}>\n*Summary:* {post.summary}\n*Score:* {post.relevance_score}"
                    )

@router.post("/run")
async def trigger_crawl(request: CrawlRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    background_tasks.add_task(run_crawler_job, request.urls, request.prompt, db)
    return {"message": "Crawler job started in background"}
