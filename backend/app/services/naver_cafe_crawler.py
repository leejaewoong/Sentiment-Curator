import asyncio
import logging
from typing import List, Dict, Any
from playwright.async_api import async_playwright, Page

logger = logging.getLogger(__name__)

class NaverCafeCrawler:
    # URL structure might need adjustment depending on the actual Cafe ID and menu structure
    BASE_URL = "https://cafe.naver.com/f-e/cafes/28866679/menus"

    def __init__(self):
        pass
    
    async def _get_post_details(self, page: Page, url: str) -> Dict[str, Any]:
        """
        Visits the post URL and extracts the body content and comments.
        Assumes the page is rendered with a mobile layout given the User Agent.
        """
        data = {
            "content": "",
            "comments": [],
            "created_at_detail": None
        }
        
        try:
            # Go to the post details page
            await page.goto(url, wait_until="domcontentloaded")
            
            # Wait a short moment for dynamic content (comments often load async)
            try:
                await page.wait_for_selector(".post_content, .se-main-container", timeout=5000)
            except:
                logger.warning(f"Timeout waiting for content selector on {url}")

            # Extract Content and Comments using page.evaluate
            details = await page.evaluate("""() => {
                // 1. Extract Body Content
                // Naver Cafe uses different editors (SmartEditor 2.0, 3.0, etc.)
                const contentEl = document.querySelector('.se-main-container') || 
                                  document.querySelector('.post_content') || 
                                  document.querySelector('#postContent');
                
                const content = contentEl ? contentEl.innerText.trim() : "";
                
                // 2. Extract Comments
                // Mobile view usually has a list of comments
                const comments = [];
                const commentItems = document.querySelectorAll('.comment_list > li, .list_comment > li');
                
                commentItems.forEach(item => {
                    // Skip deleted comments
                    if (item.classList.contains('deleted')) return;

                    const authorEl = item.querySelector('.ellip') || item.querySelector('.nick');
                    const textEl = item.querySelector('.txt') || item.querySelector('.comment_text');
                    
                    if (authorEl && textEl) {
                        comments.push({
                            author: authorEl.innerText.trim(),
                            content: textEl.innerText.trim(),
                            # Check if it's a reply (nested comment)
                            is_reply: item.classList.contains('re') || item.querySelector('.reply_mark') !== null
                        });
                    }
                });
                
                // 3. Extract Detailed Date if possible (often more precise than list view)
                const dateEl = document.querySelector('.date') || document.querySelector('.time');
                const dateText = dateEl ? dateEl.innerText.trim() : null;

                return { content, comments, dateText };
            }""")
            
            data["content"] = details.get("content", "")
            data["comments"] = details.get("comments", [])
            data["created_at_detail"] = details.get("dateText")

        except Exception as e:
            logger.error(f"Error crawling details for {url}: {str(e)}")
            
        return data

    async def crawl_menu(self, menu_id: int) -> List[Dict[str, Any]]:
        """
        Crawl a specific menu in Naver Cafe, including post details.
        
        Args:
            menu_id: The ID of the menu to crawl.
            
        Returns:
            A list of dictionary objects containing:
            - source: "naver_cafe"
            - title
            - content (body)
            - comments (list)
            - link
            - author
            - created_at
            - collected_at
        """
        url = f"{self.BASE_URL}/{menu_id}?viewType=L"
        logger.info(f"Starting crawl for menu {menu_id} at {url}")
        
        results = []
        
        async with async_playwright() as p:
            # Launch browser
            browser = await p.chromium.launch(headless=True)
            # Use Mobile User Agent to get the simpler mobile view
            context = await browser.new_context(
                user_agent="Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1"
            )
            page = await context.new_page()
            
            try:
                # 1. Get the list of posts
                await page.goto(url, wait_until="networkidle")
                await page.wait_for_selector(".article-table", timeout=10000)
                
                # Extract basic info from the list
                list_items = await page.evaluate("""
                    () => {
                        const posts = [];
                        const rows = document.querySelectorAll('.article-table tbody tr');
                        
                        rows.forEach(row => {
                            const titleEl = row.querySelector('a.article');
                            const authorEl = row.querySelector('.nickname');
                            const dateEl = row.querySelector('.type_date');
                            
                            if (titleEl) {
                                let link = titleEl.href;
                                if (link && !link.startsWith('http')) {
                                    link = 'https://cafe.naver.com' + link;
                                }
                                
                                posts.push({
                                    title: titleEl.innerText.trim(),
                                    link: link,
                                    author: authorEl ? authorEl.innerText.trim() : null,
                                    date_str: dateEl ? dateEl.innerText.trim() : null,
                                });
                            }
                        });
                        return posts;
                    }
                """)
                
                logger.info(f"Found {len(list_items)} items in menu {menu_id}. Starting detail crawl...")

                # 2. Visit each post to get Body and Comments
                for item in list_items:
                    detail_data = await self._get_post_details(page, item['link'])
                    
                    # Merge data
                    full_post = {
                        "source": "naver_cafe",
                        "title": item['title'],
                        "link": item['link'],
                        "author": item['author'],
                        "content": detail_data['content'],
                        "comments": detail_data['comments'],
                        # Prefer detailed date, fallback to list date
                        "created_at": detail_data['created_at_detail'] or item['date_str'],
                    }
                    results.append(full_post)
                    
                    # Be polite / avoid rate limiting
                    await asyncio.sleep(1)

            except Exception as e:
                logger.error(f"Error crawling menu {menu_id}: {str(e)}")
            finally:
                await browser.close()
                
        return results

    async def crawl_all_menus(self) -> Dict[int, List[Dict[str, Any]]]:
        """
        Crawl all target menus.
        """
        target_menus = [1, 177, 107, 28] # Example menu IDs
        all_results = {}
        
        for menu_id in target_menus:
            results = await self.crawl_menu(menu_id)
            all_results[menu_id] = results
            await asyncio.sleep(2)
            
        return all_results
