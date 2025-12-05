from slack_sdk.web.async_client import AsyncWebClient
from app.core.config import settings

class SlackBot:
    def __init__(self):
        self.client = AsyncWebClient(token=settings.SLACK_BOT_TOKEN)
        self.channel_id = settings.SLACK_CHANNEL_ID
        
    async def send_message(self, text: str, blocks: list = None):
        try:
            await self.client.chat_postMessage(
                channel=self.channel_id,
                text=text,
                blocks=blocks
            )
        except Exception as e:
            print(f"Slack Error: {e}")

slack_bot = SlackBot()
