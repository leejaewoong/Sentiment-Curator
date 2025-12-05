import asyncio
from playwright.async_api import async_playwright
from app.core.config import settings

class CrawlerService:
    async def crawl_url(self, url: str):
        async with async_playwright() as p:
            # Launch browser (headless=True for server)
            browser = await p.chromium.launch(headless=True)
            page = await browser.new_page()
            
            try:
                print(f"Visiting {url}...")
                await page.goto(url, wait_until="networkidle")
                
                # Basic extraction
                title = await page.title()
                content = await page.content() # Full HTML for now, or use inner_text
                
                # Extract text content (simplified)
                body_text = await page.evaluate("document.body.innerText")
                
                # Extract images
                images = await page.evaluate('''() => {
                    return Array.from(document.images).map(img => img.src)
                }''')
                
                return {
                    "url": url,
                    "title": title,
                    "content": body_text[:5000], # Limit content size
                    "images": images[:5] # Limit images
                }
                
            except Exception as e:
                print(f"Error crawling {url}: {e}")
                return None
            finally:
                await browser.close()

crawler = CrawlerService()
