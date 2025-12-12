import asyncio
import logging
from typing import List, Dict, Any
from playwright.async_api import async_playwright, Page

logger = logging.getLogger(__name__)

class NaverCafeCrawler:
    BASE_URL = "https://cafe.naver.com/f-e/cafes/28866679/menus"

    def __init__(self):
        pass

    async def crawl_menu(self, menu_id: int) -> List[Dict[str, Any]]:
        """
        Crawl a specific menu in Naver Cafe.
        
        Args:
            menu_id: The ID of the menu to crawl.
            
        Returns:
            A list of dictionaries containing post information.
        """
        url = f"{self.BASE_URL}/{menu_id}?viewType=L"
        logger.info(f"Starting crawl for menu {menu_id} at {url}")
        
        results = []
        
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            context = await browser.new_context(
                user_agent="Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1"
            )
            page = await context.new_page()
            
            try:
                await page.goto(url, wait_until="networkidle")
                
                # Wait for the article table to appear.
                await page.wait_for_selector(".article-table", timeout=10000)
                
                # Extract items
                items = await page.evaluate("""
                    () => {
                        const posts = [];
                        // Select all rows in the table body
                        const rows = document.querySelectorAll('.article-table tbody tr');
                        
                        rows.forEach(row => {
                            // Extract title and link
                            const titleEl = row.querySelector('a.article');
                            // Extract author
                            const authorEl = row.querySelector('.nickname');
                            // Extract date
                            const dateEl = row.querySelector('.type_date');
                            
                            if (titleEl) {
                                let link = titleEl.href;
                                // Ensure absolute URL if it's relative (though href usually returns absolute)
                                if (link && !link.startsWith('http')) {
                                    link = 'https://cafe.naver.com' + link;
                                }
                                
                                posts.push({
                                    title: titleEl.innerText.trim(),
                                    link: link,
                                    author: authorEl ? authorEl.innerText.trim() : null,
                                    date: dateEl ? dateEl.innerText.trim() : null,
                                    crawled_at: new Date().toISOString()
                                });
                            }
                        });
                        return posts;
                    }
                """)
                
                logger.info(f"Found {len(items)} items for menu {menu_id}")
                results.extend(items)
                
            except Exception as e:
                logger.error(f"Error crawling menu {menu_id}: {str(e)}")
            finally:
                await browser.close()
                
        return results

    async def crawl_all_menus(self) -> Dict[int, List[Dict[str, Any]]]:
        """
        Crawl all target menus.
        """
        target_menus = [1, 177, 107, 28]
        all_results = {}
        
        for menu_id in target_menus:
            results = await self.crawl_menu(menu_id)
            all_results[menu_id] = results
            # Be polite
            await asyncio.sleep(2)
            
        return all_results
