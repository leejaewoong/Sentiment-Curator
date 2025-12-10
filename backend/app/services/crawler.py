"""
Crawler Service using Playwright
"""
from playwright.async_api import async_playwright
from typing import List, Dict
from datetime import datetime


class CrawlerService:
    """Web crawler service using Playwright"""

    async def crawl_url(self, url: str) -> List[Dict]:
        """
        Crawl a single URL and extract content

        Args:
            url: Target URL to crawl

        Returns:
            List of extracted posts/articles
        """
        posts = []

        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            page = await browser.new_page()

            try:
                await page.goto(url, wait_until="domcontentloaded", timeout=30000)
                await page.wait_for_timeout(2000)  # Wait for dynamic content

                # Extract content (simplified version)
                # TODO: Implement more sophisticated extraction logic
                title = await page.title()
                content = await page.text_content("body")

                posts.append({
                    "title": title,
                    "content": content[:500] if content else "",  # First 500 chars
                    "url": url,
                    "image_url": None,
                    "source": url,
                    "crawled_at": datetime.utcnow(),
                })

            except Exception as e:
                print(f"Error crawling {url}: {e}")

            finally:
                await browser.close()

        return posts

    async def crawl_multiple_urls(self, urls: List[str]) -> List[Dict]:
        """
        Crawl multiple URLs

        Args:
            urls: List of target URLs

        Returns:
            Combined list of all extracted posts
        """
        all_posts = []

        for url in urls:
            posts = await self.crawl_url(url)
            all_posts.extend(posts)

        return all_posts
