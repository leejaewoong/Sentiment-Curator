from openai import AsyncOpenAI
from app.core.config import settings
import json

class AIAgent:
    def __init__(self):
        self._client = None
        
    @property
    def client(self):
        if not self._client:
            self._client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        return self._client
        
    async def filter_and_summarize(self, posts: list[dict], prompt: str):
        """
        Filters posts based on user prompt and returns selected ones with summary.
        """
        if not posts:
            return []
            
        # Prepare content for LLM
        posts_text = ""
        for i, post in enumerate(posts):
            posts_text += f"[{i}] Title: {post['title']}\nContent: {post['content'][:200]}...\n\n"
            
        system_prompt = f"""
        You are an expert content curator.
        Your goal is to select posts that match the user's interest: "{prompt}".
        
        Return a JSON object with a list of selected indices and a short summary for each.
        Format:
        {{
            "selected": [
                {{
                    "index": 0,
                    "summary": "One sentence summary...",
                    "relevance_score": 90
                }}
            ]
        }}
        If no posts match, return empty list.
        """
        
        try:
            response = await self.client.chat.completions.create(
                model=settings.OPENAI_MODEL,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": posts_text}
                ],
                response_format={"type": "json_object"}
            )
            
            result = json.loads(response.choices[0].message.content)
            return result.get("selected", [])
            
        except Exception as e:
            print(f"AI Error: {e}")
            return []

ai_agent = AIAgent()
