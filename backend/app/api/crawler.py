"""
Crawler control API endpoints
"""
from fastapi import APIRouter

router = APIRouter()


@router.post("/run")
async def trigger_crawl():
    """Trigger manual crawl"""
    return {"message": "Crawl triggered"}


@router.post("/run/naver-cafe")
async def trigger_naver_cafe_crawl():
    """Trigger Naver Cafe crawl"""
    from app.services.naver_cafe_crawler import NaverCafeCrawler
    crawler = NaverCafeCrawler()
    results = await crawler.crawl_all_menus()
    return {"status": "success", "results": results}


@router.get("/status")
async def get_status():
    """Get crawler status"""
    return {"status": "idle"}
