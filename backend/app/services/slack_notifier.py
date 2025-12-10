"""
Slack Notification Service
"""
from slack_sdk.web.async_client import AsyncWebClient
from typing import List, Dict, Optional
from app.core.config import settings
from datetime import datetime


class SlackNotifierService:
    """Slack notification service"""

    def __init__(self):
        self.client = AsyncWebClient(token=settings.SLACK_BOT_TOKEN) if settings.SLACK_BOT_TOKEN else None

    async def send_post_notification(
        self,
        post: Dict,
        channel: str
    ) -> Optional[str]:
        """
        Send a single post notification to Slack

        Args:
            post: Post data to send
            channel: Slack channel ID

        Returns:
            Message timestamp (ts) if successful
        """
        if not self.client:
            print("Slack client not configured")
            return None

        try:
            # Create message blocks
            blocks = [
                {
                    "type": "header",
                    "text": {
                        "type": "plain_text",
                        "text": post.get("title", "제목 없음")
                    }
                },
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": post.get("summary", post.get("content", "")[:200])
                    }
                },
                {
                    "type": "section",
                    "fields": [
                        {
                            "type": "mrkdwn",
                            "text": f"*점수:* {post.get('ai_score', 'N/A')}/10"
                        },
                        {
                            "type": "mrkdwn",
                            "text": f"*출처:* {post.get('source', 'Unknown')}"
                        }
                    ]
                },
                {
                    "type": "actions",
                    "elements": [
                        {
                            "type": "button",
                            "text": {
                                "type": "plain_text",
                                "text": "원문 보기"
                            },
                            "url": post.get("url", "#"),
                            "style": "primary"
                        }
                    ]
                }
            ]

            # Send message
            response = await self.client.chat_postMessage(
                channel=channel,
                blocks=blocks,
                text=f"새로운 큐레이션: {post.get('title', '')}"
            )

            return response.get("ts")

        except Exception as e:
            print(f"Error sending Slack notification: {e}")
            return None

    async def send_batch_notification(
        self,
        posts: List[Dict],
        channel: str
    ) -> List[str]:
        """
        Send multiple posts to Slack

        Args:
            posts: List of posts to send
            channel: Slack channel ID

        Returns:
            List of message timestamps
        """
        message_timestamps = []

        for post in posts:
            ts = await self.send_post_notification(post, channel)
            if ts:
                message_timestamps.append(ts)

        return message_timestamps
