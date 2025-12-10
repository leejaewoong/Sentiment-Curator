"""
AI Filtering Service using OpenAI API
"""
from openai import AsyncOpenAI
from typing import List, Dict, Optional
from app.core.config import settings


class AIFilterService:
    """AI-based content filtering service"""

    def __init__(self):
        self.client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY) if settings.OPENAI_API_KEY else None

    async def filter_posts(
        self,
        posts: List[Dict],
        filter_prompt: str,
        top_n: int = 5
    ) -> List[Dict]:
        """
        Filter posts using AI based on user's criteria

        Args:
            posts: List of crawled posts
            filter_prompt: User's filtering criteria
            top_n: Number of top posts to return

        Returns:
            Filtered and scored posts
        """
        if not self.client:
            # Return all posts if OpenAI API key is not configured
            return posts[:top_n]

        filtered_posts = []

        for post in posts:
            try:
                # Create prompt for AI
                prompt = f"""
다음 콘텐츠를 분석하고, 아래 기준에 부합하는지 평가해주세요:

[기준]
{filter_prompt}

[콘텐츠]
제목: {post.get('title', '')}
내용: {post.get('content', '')[:500]}

이 콘텐츠가 기준에 부합하는지 1-10점으로 평가하고, 간단한 요약을 제공해주세요.

응답 형식:
점수: [1-10]
요약: [한 줄 요약]
"""

                # Call OpenAI API
                response = await self.client.chat.completions.create(
                    model="gpt-3.5-turbo",
                    messages=[
                        {"role": "system", "content": "당신은 콘텐츠 큐레이션 전문가입니다."},
                        {"role": "user", "content": prompt}
                    ],
                    max_tokens=200,
                    temperature=0.3,
                )

                result = response.choices[0].message.content

                # Parse score and summary
                score = self._extract_score(result)
                summary = self._extract_summary(result)

                if score >= 5:  # Only include posts with score >= 5
                    post_copy = post.copy()
                    post_copy["ai_score"] = score
                    post_copy["summary"] = summary
                    post_copy["is_filtered"] = True
                    filtered_posts.append(post_copy)

            except Exception as e:
                print(f"Error filtering post: {e}")
                # Include post with default score if error occurs
                post_copy = post.copy()
                post_copy["ai_score"] = 5
                post_copy["summary"] = post.get("title", "")
                post_copy["is_filtered"] = False
                filtered_posts.append(post_copy)

        # Sort by score and return top N
        filtered_posts.sort(key=lambda x: x.get("ai_score", 0), reverse=True)
        return filtered_posts[:top_n]

    def _extract_score(self, text: str) -> int:
        """Extract score from AI response"""
        try:
            for line in text.split("\n"):
                if "점수" in line or "score" in line.lower():
                    # Extract number from line
                    import re
                    numbers = re.findall(r'\d+', line)
                    if numbers:
                        return min(int(numbers[0]), 10)
        except:
            pass
        return 5  # Default score

    def _extract_summary(self, text: str) -> str:
        """Extract summary from AI response"""
        try:
            for line in text.split("\n"):
                if "요약" in line or "summary" in line.lower():
                    # Extract text after colon
                    parts = line.split(":", 1)
                    if len(parts) > 1:
                        return parts[1].strip()
        except:
            pass
        return ""
